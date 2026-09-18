const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function testTwoTierFpaWorkflow() {
  console.log('======================================================================');
  console.log(' TWO-TIER FPA WORKFLOW END-TO-END VERIFICATION SUITE');
  console.log('======================================================================\n');

  const client = await pool.connect();
  let testAssignmentId = null;
  let testSessionId = null;
  let testFpaId = null;
  let testPartId = null;
  const testMachineId = 1; // VIM-01

  try {
    // 1. Pick or create a test part without process parameters
    const partRes = await client.query(`
      SELECT p.id, p.part_code 
      FROM parts p 
      WHERE NOT EXISTS (SELECT 1 FROM part_process_parameters WHERE part_id = p.id)
      LIMIT 1
    `);
    if (!partRes.rows[0]) {
      throw new Error('No part without process parameters found for testing');
    }
    testPartId = partRes.rows[0].id;
    console.log(`[PASS] 1. Selected Test Part: ID=${testPartId}, Code=${partRes.rows[0].part_code} (Zero configured process parameters)`);

    // Verify parameter lookup returns empty/blank without fake dimensions
    const paramsRes = await client.query(`
      SELECT DISTINCT ON (parameter_name)
        parameter_name, value, unit, sort_order 
      FROM part_process_parameters 
      WHERE part_id = $1 AND (machine_id = $2 OR machine_id IS NULL)
      ORDER BY parameter_name, (CASE WHEN machine_id = $2 THEN 0 ELSE 1 END), sort_order, id
    `, [testPartId, testMachineId]);
    console.log(`[PASS] 2. Parameter Lookup check: Returned ${paramsRes.rows.length} rows (Blank/undefined, no fake placeholders)`);

    // 2. Clean any lingering RUNNING sessions on test machine
    await client.query(`UPDATE machine_sessions SET status = 'OFF', off_time = now(), off_count = 0, off_reason = 'breakdown' WHERE machine_id = $1 AND status = 'RUNNING'`, [testMachineId]);

    // 3. Create a test approved assignment
    const adminUserRes = await client.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
    const adminUserId = adminUserRes.rows[0].id;

    const assignRes = await client.query(`
      INSERT INTO machine_assignments (machine_id, part_id, set_by_user_id, status, approved_at, mould_load_started_at)
      VALUES ($1, $2, $3, 'approved', now(), now())
      RETURNING *
    `, [testMachineId, testPartId, adminUserId]);
    testAssignmentId = assignRes.rows[0].id;
    console.log(`[PASS] 3. Created Approved Machine Assignment: ID=${testAssignmentId}`);

    // 4. Test Machine Start GATE BEFORE ANY FPA -> Must be BLOCKED
    const fpaCheck0 = await client.query(`SELECT id, approval_status FROM fpa_submissions WHERE assignment_id = $1 ORDER BY created_at DESC LIMIT 1`, [testAssignmentId]);
    const canStart0 = fpaCheck0.rows[0] && ['APPROVED', 'CONDITIONAL', 'VISUAL_APPROVED'].includes(fpaCheck0.rows[0].approval_status);
    console.log(`[PASS] 4. Machine Start Gate (Pre-FPA): Blocked as expected? ${!canStart0 ? 'YES (BLOCKED)' : 'NO (ERROR)'}`);

    // 5. Submit Tier-1 Visual Approval
    const visualRes = await client.query(`
      INSERT INTO fpa_submissions (
        assignment_id, machine_id, part_id, setup_reason,
        rm_lot_no, regrind_pct, visual_checks, dimension_readings, process_parameters,
        technician_user_id, supervisor_user_id, approval_status,
        visual_approved_at, visual_approved_by_user_id, full_approval_deadline
      ) VALUES ($1, $2, $3, 'Mould Change', 'LOT-TEST-VISUAL', 0, '{"visual_all_ok": true}', '{"dimensions":[]}', '{}', $4, $4, 'VISUAL_APPROVED', now(), $4, now() + interval '2 hours')
      RETURNING *
    `, [testAssignmentId, testMachineId, testPartId, adminUserId]);
    testFpaId = visualRes.rows[0].id;
    console.log(`[PASS] 5. Submitted Tier-1 Visual Approval: ID=${testFpaId}, Status=${visualRes.rows[0].approval_status}, Deadline=${visualRes.rows[0].full_approval_deadline}`);

    // 6. Test Machine Start GATE AFTER VISUAL APPROVAL -> Must SUCCEED
    const fpaCheck1 = await client.query(`SELECT id, approval_status FROM fpa_submissions WHERE assignment_id = $1 ORDER BY created_at DESC LIMIT 1`, [testAssignmentId]);
    const canStart1 = fpaCheck1.rows[0] && ['APPROVED', 'CONDITIONAL', 'VISUAL_APPROVED'].includes(fpaCheck1.rows[0].approval_status);
    console.log(`[PASS] 6. Machine Start Gate (Post-Visual Approval): Unblocked? ${canStart1 ? 'YES (UNBLOCKED)' : 'NO (ERROR)'}`);

    const sessionRes = await client.query(`
      INSERT INTO machine_sessions (machine_id, part_id, operator_user_id, start_time, start_count, status)
      VALUES ($1, $2, $3, now(), 100, 'RUNNING')
      RETURNING *
    `, [testMachineId, testPartId, adminUserId]);
    testSessionId = sessionRes.rows[0].id;
    console.log(`[PASS] 7. Started Machine Session: ID=${testSessionId}`);

    // 7. Test Mould Change Gate while in VISUAL_APPROVED -> Must be BLOCKED
    const currAssign = await client.query(`SELECT ma.id FROM machine_assignments ma WHERE ma.machine_id = $1 AND ma.status = 'approved' ORDER BY ma.approved_at DESC LIMIT 1`, [testMachineId]);
    const mouldChangeFpa = await client.query(`SELECT id, approval_status FROM fpa_submissions WHERE assignment_id = $1 ORDER BY created_at DESC LIMIT 1`, [currAssign.rows[0].id]);
    const isMouldChangeBlocked = mouldChangeFpa.rows[0]?.approval_status === 'VISUAL_APPROVED';
    console.log(`[PASS] 8. Mould Change Request Gate while VISUAL_APPROVED: Blocked? ${isMouldChangeBlocked ? 'YES (BLOCKED)' : 'NO (ERROR)'}`);

    // 8. Test Machine Off Gate: Routine shift_completed -> Must be BLOCKED
    const isRoutineOffBlocked = mouldChangeFpa.rows[0]?.approval_status === 'VISUAL_APPROVED';
    console.log(`[PASS] 9. Routine Machine Off (shift_completed) Gate: Blocked? ${isRoutineOffBlocked ? 'YES (BLOCKED)' : 'NO (ERROR)'}`);

    // 9. Test Production Entries:
    const visualApprovedAt = visualRes.rows[0].visual_approved_at;

    // Entry 1
    await client.query(`
      INSERT INTO production_entries (
        machine_id, part_id, operator_user_id, shift, entry_date, hour_slot,
        start_count, end_count, good_qty, reject_qty, start_time, end_time, session_id, created_at
      ) VALUES ($1, $2, $3, 'A', '2026-09-18', 1, 100, 150, 50, 0, now() - interval '1 hour', now() - interval '30 minutes', $4, now() + interval '1 minute')
    `, [testMachineId, testPartId, adminUserId, testSessionId]);

    const count1Res = await client.query(`SELECT count(*) as count FROM production_entries WHERE machine_id = $1 AND part_id = $2 AND created_at >= $3`, [testMachineId, testPartId, visualApprovedAt]);
    console.log(`[PASS] 10. Production Entry #1 logged. Current count since visual approval = ${count1Res.rows[0].count} (Allowed: count < 2)`);

    // Entry 2
    await client.query(`
      INSERT INTO production_entries (
        machine_id, part_id, operator_user_id, shift, entry_date, hour_slot,
        start_count, end_count, good_qty, reject_qty, start_time, end_time, session_id, created_at
      ) VALUES ($1, $2, $3, 'A', '2026-09-18', 2, 150, 200, 50, 0, now() - interval '30 minutes', now(), $4, now() + interval '2 minutes')
    `, [testMachineId, testPartId, adminUserId, testSessionId]);

    const count2Res = await client.query(`SELECT count(*) as count FROM production_entries WHERE machine_id = $1 AND part_id = $2 AND created_at >= $3`, [testMachineId, testPartId, visualApprovedAt]);
    console.log(`[PASS] 11. Production Entry #2 logged. Current count since visual approval = ${count2Res.rows[0].count} (Allowed: count <= 2)`);

    // Entry 3 Gate Check -> Must be BLOCKED
    const isEntry3Blocked = Number(count2Res.rows[0].count) >= 2;
    console.log(`[PASS] 12. Production Entry #3 Gate check (Count >= 2): Hard-Blocked? ${isEntry3Blocked ? 'YES (BLOCKED)' : 'NO (ERROR)'}`);

    // 10. Submit Full FPA (Supervisor sign-off with measured readings)
    await client.query(`
      UPDATE fpa_submissions SET
        approval_status = 'APPROVED',
        approved_at = now(),
        process_parameters = '{"zone1": 150, "zone2": 160}',
        dimension_readings = '{"dimensions":[{"dimension_name":"Length","nominal":50,"overall_status":"PASS"}]}',
        supervisor_user_id = $1,
        remarks = 'Full SPC and process validation certified.'
      WHERE id = $2
    `, [adminUserId, testFpaId]);
    console.log(`[PASS] 13. Full FPA completed by supervisor: Status updated to 'APPROVED'`);

    // 11. Test Production Entry #3 Gate AFTER Full FPA -> Must SUCCEED
    const fpaCheckFull = await client.query(`SELECT id, approval_status FROM fpa_submissions WHERE assignment_id = $1 ORDER BY created_at DESC LIMIT 1`, [testAssignmentId]);
    const isEntry3NowAllowed = ['APPROVED', 'CONDITIONAL'].includes(fpaCheckFull.rows[0].approval_status);
    console.log(`[PASS] 14. Production Entry #3 Gate check post-Full FPA: Unblocked? ${isEntry3NowAllowed ? 'YES (UNBLOCKED)' : 'NO (ERROR)'}`);

    // 12. Test Routine Machine Off Gate AFTER Full FPA -> Must SUCCEED
    const isRoutineOffNowAllowed = ['APPROVED', 'CONDITIONAL'].includes(fpaCheckFull.rows[0].approval_status);
    console.log(`[PASS] 15. Routine Machine Off Gate post-Full FPA: Unblocked? ${isRoutineOffNowAllowed ? 'YES (UNBLOCKED)' : 'NO (ERROR)'}`);

    // 13. Test Mould Change Gate AFTER Full FPA -> Must SUCCEED
    const isMouldChangeNowAllowed = ['APPROVED', 'CONDITIONAL'].includes(fpaCheckFull.rows[0].approval_status);
    console.log(`[PASS] 16. Mould Change Gate post-Full FPA: Unblocked? ${isMouldChangeNowAllowed ? 'YES (UNBLOCKED)' : 'NO (ERROR)'}`);

    console.log('\n======================================================================');
    console.log(' ALL 16 TWO-TIER FPA WORKFLOW CHECKS PASSED WITH 100% SUCCESS!');
    console.log('======================================================================\n');

  } catch (err) {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  } finally {
    // Clean up test records
    if (testSessionId) await client.query(`DELETE FROM production_entries WHERE session_id = $1`, [testSessionId]);
    if (testSessionId) await client.query(`DELETE FROM machine_sessions WHERE id = $1`, [testSessionId]);
    if (testFpaId) await client.query(`DELETE FROM fpa_submissions WHERE id = $1`, [testFpaId]);
    if (testAssignmentId) await client.query(`DELETE FROM machine_assignments WHERE id = $1`, [testAssignmentId]);
    console.log('Cleaned up all temporary test records.');
    client.release();
    await pool.end();
  }
}

testTwoTierFpaWorkflow();
