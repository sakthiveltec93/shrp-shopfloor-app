require('dotenv').config({ path: '../.env' });
const pool = require('../db/pool');

async function consolidateDuplicates() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('=== Customer Duplicate Consolidation Started ===\n');

    // Step 1: Migrate active parts from duplicates to masters
    console.log('Step 1: Migrating active parts...');
    await client.query('UPDATE parts SET customer_id = 3 WHERE customer_id = 1 AND active = TRUE');  // CUST-001 → SHRP/CUS-001
    await client.query('UPDATE parts SET customer_id = 8 WHERE customer_id = 2 AND active = TRUE');  // CUST-002 → SHRP/CUS-006
    await client.query('UPDATE parts SET customer_id = 9 WHERE customer_id = 5 AND active = TRUE');  // CUST-005 → SHRP/CUS-003
    await client.query('UPDATE parts SET customer_id = 10 WHERE customer_id = 10 AND active = TRUE'); // CUST-010 → SHRP/CUS-004
    console.log('✅ Parts migrated\n');

    // Step 2: Migrate dispatch_entries references
    console.log('Step 2: Migrating dispatch entries...');
    await client.query('UPDATE dispatch_entries SET customer_id = 3 WHERE customer_id IN (1, 4)');   // Both Hanon → SHRP/CUS-001
    await client.query('UPDATE dispatch_entries SET customer_id = 8 WHERE customer_id = 2');        // CUST-002 → SHRP/CUS-006
    await client.query('UPDATE dispatch_entries SET customer_id = 9 WHERE customer_id = 5');        // CUST-005 → SHRP/CUS-003
    await client.query('UPDATE dispatch_entries SET customer_id = 10 WHERE customer_id = 10');      // CUST-010 → SHRP/CUS-004
    console.log('✅ Dispatch entries migrated\n');

    // Step 3: Soft-delete duplicates
    console.log('Step 3: Soft-deleting duplicate customers...');
    await client.query('UPDATE customers SET active = FALSE, deleted_at = NOW() WHERE id IN (1, 2, 4, 5, 10)');
    console.log('✅ Duplicates marked inactive\n');

    // Step 4: Renumber SHRP/CUS- to SHRP/C- sequentially
    console.log('Step 4: Renumbering to sequential SHRP/C- format...');
    await client.query("UPDATE customers SET customer_code = 'SHRP/C-01' WHERE id = 3");   // SHRP/CUS-001
    await client.query("UPDATE customers SET customer_code = 'SHRP/C-02' WHERE id = 9");   // SHRP/CUS-003
    await client.query("UPDATE customers SET customer_code = 'SHRP/C-03' WHERE id = 10");  // SHRP/CUS-004
    await client.query("UPDATE customers SET customer_code = 'SHRP/C-04' WHERE id = 8");   // SHRP/CUS-006
    await client.query("UPDATE customers SET customer_code = 'SHRP/C-05' WHERE id = 11");  // SHRP/CUS-007
    await client.query("UPDATE customers SET customer_code = 'SHRP/C-06' WHERE id = 12");  // SHRP/CUS-008
    await client.query("UPDATE customers SET customer_code = 'SHRP/C-07' WHERE id = 13");  // SHRP/CUS-009
    await client.query("UPDATE customers SET customer_code = 'SHRP/C-08' WHERE id = 14");  // SHRP/CUS-010
    console.log('✅ Customer codes renumbered\n');

    // Step 5: Log audit trail
    console.log('Step 5: Logging deletion audit trail...');
    const deletions = [
      [1, 'CUST-001', 'Duplicate consolidation - merged into SHRP/C-01 (Hanon Automotive)'],
      [2, 'CUST-002', 'Duplicate consolidation - merged into SHRP/C-04 (Avadh Rail Infra)'],
      [4, 'SHRP/CUS-002', 'Duplicate consolidation - merged into SHRP/C-01 (Hanon Automotive)'],
      [5, 'CUST-005', 'Duplicate consolidation - merged into SHRP/C-02 (Hanon Climate)'],
      [10, 'CUST-010', 'Duplicate consolidation - merged into SHRP/C-03 (Wonjin)']
    ];

    for (const [id, code, reason] of deletions) {
      await client.query(
        `INSERT INTO deletion_audit_log (entity_type, entity_id, entity_code, reason, deleted_by_name, created_at)
         VALUES ('customer', $1, $2, $3, 'SYSTEM', NOW())`,
        [id, code, reason]
      );
    }
    console.log('✅ Audit trail logged\n');

    await client.query('COMMIT');

    // Verification
    console.log('=== Verification ===\n');
    const duplicateCheck = await pool.query(`
      SELECT
        LOWER(TRIM(customer_name)) as name,
        COUNT(*) as count
      FROM customers
      WHERE active = TRUE
      GROUP BY LOWER(TRIM(customer_name))
      HAVING COUNT(*) > 1
    `);

    if (duplicateCheck.rows.length === 0) {
      console.log('✅ NO DUPLICATES REMAINING\n');
    } else {
      console.log('⚠️ Duplicates still exist:', duplicateCheck.rows);
    }

    const activeCustomers = await pool.query(`
      SELECT customer_code, customer_name FROM customers WHERE active = TRUE ORDER BY customer_code
    `);

    console.log('Active Customers After Consolidation:');
    activeCustomers.rows.forEach(c => console.log(`  ${c.customer_code} | ${c.customer_name}`));

    console.log('\n=== CONSOLIDATION COMPLETE ===');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ ERROR:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

consolidateDuplicates().catch(console.error);
