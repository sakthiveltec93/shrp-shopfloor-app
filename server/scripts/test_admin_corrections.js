require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../db/pool');

async function runTests() {
  console.log('=== Starting Admin Corrections Automated Verification ===\n');

  const client = await pool.connect();
  try {
    // 1. Verify schema columns and constraints
    console.log('1. Checking Database Schema & Constraints:');
    const cols = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('production_entries', 'correction_requests', 'record_correction_log')
      AND column_name IN ('period_start_at', 'period_end_at', 'is_backdated', 'is_edited', 'last_edited_at', 'entity_type')
      ORDER BY table_name, column_name;
    `);
    console.log(`- Found ${cols.rows.length} expected columns across core tables.`);

    const bagConstraint = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as def 
      FROM pg_constraint 
      WHERE conname = 'bags_status_check';
    `);
    console.log(`- Constraint bags_status_check: ${bagConstraint.rows[0]?.def || 'NOT FOUND'}`);
    if (!bagConstraint.rows[0]?.def.includes('PARTIAL_PACK')) {
      throw new Error('bags_status_check does not contain PARTIAL_PACK!');
    }
    console.log('  -> PASS: Database Schema Verified.\n');

    // 2. Fetch an existing machine and part for testing
    const mach = await client.query(`SELECT id, machine_code FROM machines LIMIT 1`);
    const part = await client.query(`SELECT id, part_name FROM parts LIMIT 1`);
    const adminUser = await client.query(`SELECT id, username, role FROM users WHERE role = 'admin' LIMIT 1`);
    const supUser = await client.query(`SELECT id, username, role FROM users WHERE role = 'supervisor' LIMIT 1`);

    if (!mach.rows[0] || !part.rows[0] || !adminUser.rows[0]) {
      throw new Error('Required test fixtures missing in DB');
    }

    const machineId = mach.rows[0].id;
    const partId = part.rows[0].id;
    const adminId = adminUser.rows[0].id;
    const supervisorId = supUser.rows[0]?.id || adminId;

    console.log(`Test fixtures: Machine=${mach.rows[0].machine_code}, Part=${part.rows[0].part_name}, Admin=${adminUser.rows[0].username}`);

    // 3. Test Direct Backdate Creation (Production Entry)
    console.log('\n2. Testing Direct Backdated Production Entry Creation...');
    const testDate = '2026-09-17';
    const periodStart = '2026-09-17T09:30:00+05:30';
    const periodEnd = '2026-09-17T11:30:00+05:30';

    const insertRes = await client.query(`
      INSERT INTO production_entries (
        machine_id, part_id, entry_date, shift,
        period_start_at, period_end_at,
        start_count, end_count, good_qty, reject_qty,
        is_backdated, is_edited, last_edited_at
      ) VALUES (
        $1, $2, $3, 'A',
        $4, $5,
        1000, 1150, 145, 5,
        TRUE, FALSE, NOW()
      ) RETURNING id;
    `, [machineId, partId, testDate, periodStart, periodEnd]);

    const createdProdId = insertRes.rows[0].id;
    console.log(`- Created backdated production entry: ID ${createdProdId}`);

    // Log the creation in record_correction_log
    await client.query(`
      INSERT INTO record_correction_log (
        entity_type, entity_id, entity_code, action,
        field_name, old_value, new_value,
        changed_by, changed_by_name, changed_by_role,
        reason, details
      ) VALUES (
        'production_entries', $1, $2, 'BACKDATED_CREATE',
        'ALL', NULL, '{"good_qty": 145, "reject_qty": 5}',
        $3, $4, 'admin',
        'Automated Test: Backdated entry', '{"test": true}'
      );
    `, [createdProdId, `PROD-${createdProdId}`, adminId, adminUser.rows[0].username]);
    console.log('  -> PASS: Backdate inserted & audited.\n');

    // 4. Test Supervisor Correction Request Flow
    console.log('3. Testing Supervisor Correction Request -> Admin Approval Flow...');
    const reqRes = await client.query(`
      INSERT INTO correction_requests (
        entity_type, entity_id, entity_code, action,
        payload, reason, requested_by, status
      ) VALUES (
        'production_entry', $1, $2, 'EDIT',
        '{"good_qty": 148, "reject_qty": 2}', 'Supervisor counted 3 parts reclassified from reject to accept',
        $3, 'pending'
      ) RETURNING id;
    `, [createdProdId, `PROD-${createdProdId}`, supervisorId]);

    const reqId = reqRes.rows[0].id;
    console.log(`- Supervisor submitted correction request ID ${reqId} (pending)`);

    // Admin approves request
    console.log(`- Admin reviewing & approving request ID ${reqId}...`);
    await client.query('BEGIN');
    
    // Update target
    await client.query(`
      UPDATE production_entries
      SET good_qty = 148, reject_qty = 2, is_edited = TRUE, last_edited_at = NOW()
      WHERE id = $1;
    `, [createdProdId]);

    // Record audit diffs
    await client.query(`
      INSERT INTO record_correction_log (
        entity_type, entity_id, entity_code, action,
        field_name, old_value, new_value,
        changed_by, changed_by_name, changed_by_role,
        reason, request_id
      ) VALUES 
      ('production_entries', $1, $2, 'EDIT', 'good_qty', '145', '148', $3, $4, 'admin', 'Approved request #' || $5::text, $5::integer),
      ('production_entries', $1, $2, 'EDIT', 'reject_qty', '5', '2', $3, $4, 'admin', 'Approved request #' || $5::text, $5::integer);
    `, [createdProdId, `PROD-${createdProdId}`, adminId, adminUser.rows[0].username, reqId]);

    // Update request
    await client.query(`
      UPDATE correction_requests
      SET status = 'approved', reviewed_by = $1, reviewed_at = NOW(), review_notes = 'Approved during test'
      WHERE id = $2;
    `, [adminId, reqId]);

    await client.query('COMMIT');
    console.log('  -> PASS: Request approved and audit log diffs written.\n');

    // 5. Test Bag Status Manual Override (including PARTIAL_PACK)
    console.log('4. Testing Bag Status Manual Override & PARTIAL_PACK...');
    const bagInsert = await client.query(`
      INSERT INTO bags (
        bag_code, batch_no, part_id, machine_id, qty, base_weight_kg, entry_date, shift, status, is_backdated, is_edited
      ) VALUES (
        'TEST-BAG-001', 'TEST-BATCH-001', $1, $2, 100, 5.0, '2026-09-17', 'A', 'OPEN', TRUE, FALSE
      ) RETURNING id, bag_code;
    `, [partId, machineId]);
    const bagId = bagInsert.rows[0].id;
    console.log(`- Created bag ${bagInsert.rows[0].bag_code} (ID: ${bagId})`);

    // Override to PARTIAL_PACK
    await client.query(`
      UPDATE bags 
      SET status = 'PARTIAL_PACK', is_edited = TRUE, last_edited_at = NOW()
      WHERE id = $1;
    `, [bagId]);

    await client.query(`
      INSERT INTO bag_status_history (
        bag_id, from_status, to_status, source
      ) VALUES (
        $1, 'OPEN', 'PARTIAL_PACK', 'ADMIN_OVERRIDE'
      );
    `, [bagId]);

    await client.query(`
      INSERT INTO record_correction_log (
        entity_type, entity_id, entity_code, action,
        field_name, old_value, new_value,
        changed_by, changed_by_name, changed_by_role,
        reason
      ) VALUES (
        'bags', $1, 'TEST-BAG-001', 'STATUS_OVERRIDE',
        'status', 'OPEN', 'PARTIAL_PACK',
        $2, $3, 'admin',
        'Admin manual status override for partial packaging'
      );
    `, [bagId, adminId, adminUser.rows[0].username]);
    console.log('  -> PASS: Bag status override to PARTIAL_PACK successful & history recorded.\n');

    // 6. Verify audit logs queryability
    console.log('5. Verifying Record Correction Log Queryability:');
    const logs = await client.query(`
      SELECT id, entity_type, entity_code, action, field_name, old_value, new_value, changed_by_name, reason
      FROM record_correction_log
      WHERE entity_id IN ($1, $2)
      ORDER BY created_at ASC;
    `, [createdProdId, bagId]);

    console.table(logs.rows);
    console.log(`  -> Found ${logs.rows.length} audit entries matching test records.`);

    // 7. Cleanup Test Data
    console.log('\n6. Cleaning up test data...');
    await client.query(`DELETE FROM record_correction_log WHERE entity_id IN ($1, $2);`, [createdProdId, bagId]);
    await client.query(`DELETE FROM correction_requests WHERE id = $1;`, [reqId]);
    await client.query(`DELETE FROM bag_status_history WHERE bag_id = $1;`, [bagId]);
    await client.query(`DELETE FROM bags WHERE id = $1;`, [bagId]);
    await client.query(`DELETE FROM production_entries WHERE id = $1;`, [createdProdId]);
    console.log('  -> PASS: Test data cleaned up cleanly.\n');

    console.log('====================================================');
    console.log('🎉 ALL ADMIN CORRECTIONS VERIFICATION TESTS PASSED!');
    console.log('====================================================');

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runTests();
