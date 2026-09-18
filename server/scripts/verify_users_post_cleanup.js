const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function verifyUsers() {
  console.log('======================================================================');
  console.log(' POST-CLEANUP USERS & INTEGRITY AUDIT');
  console.log('======================================================================\n');

  const client = await pool.connect();
  try {
    // 1. Full 26 Users Table with Re-linked History
    const usersRes = await client.query(`
      SELECT id, username, full_name, role, active,
        to_char(created_at, 'YYYY-MM-DD HH24:MI') as created_at,
        (SELECT count(*) FROM production_entries WHERE operator_user_id = users.id) AS pe_count,
        (SELECT count(*) FROM bags WHERE operator_user_id = users.id) AS bag_count,
        (SELECT count(*) FROM trim_entries WHERE operator_user_id = users.id) AS trim_count,
        (SELECT count(*) FROM inspection_entries WHERE operator_user_id = users.id) AS insp_count,
        (SELECT count(*) FROM packing_entries WHERE operator_user_id = users.id) AS pack_count,
        (SELECT count(*) FROM login_history WHERE user_id = users.id) AS login_count,
        (SELECT count(*) FROM user_page_access WHERE user_id = users.id) AS page_access_count
      FROM users
      ORDER BY username, id;
    `);

    console.log(`1. Total Surviving Users in Database: ${usersRes.rows.length}`);
    console.table(usersRes.rows);

    // 2. Foreign Key Integrity / Orphan Checks across ALL user FK tables
    console.log('\n2. Foreign Key Orphan Checks on users(id):');
    const fkChecks = [
      { name: 'production_entries.operator_user_id -> users', q: 'SELECT count(*) as count FROM production_entries pe LEFT JOIN users u ON pe.operator_user_id = u.id WHERE u.id IS NULL' },
      { name: 'bags.operator_user_id -> users', q: 'SELECT count(*) as count FROM bags b LEFT JOIN users u ON b.operator_user_id = u.id WHERE b.operator_user_id IS NOT NULL AND u.id IS NULL' },
      { name: 'trim_entries.operator_user_id -> users', q: 'SELECT count(*) as count FROM trim_entries te LEFT JOIN users u ON te.operator_user_id = u.id WHERE u.id IS NULL' },
      { name: 'inspection_entries.operator_user_id -> users', q: 'SELECT count(*) as count FROM inspection_entries ie LEFT JOIN users u ON ie.operator_user_id = u.id WHERE u.id IS NULL' },
      { name: 'packing_entries.operator_user_id -> users', q: 'SELECT count(*) as count FROM packing_entries pe LEFT JOIN users u ON pe.operator_user_id = u.id WHERE u.id IS NULL' },
      { name: 'login_history.user_id -> users', q: 'SELECT count(*) as count FROM login_history lh LEFT JOIN users u ON lh.user_id = u.id WHERE u.id IS NULL' },
      { name: 'user_page_access.user_id -> users', q: 'SELECT count(*) as count FROM user_page_access upa LEFT JOIN users u ON upa.user_id = u.id WHERE u.id IS NULL' },
      { name: 'attendance.user_id -> users', q: 'SELECT count(*) as count FROM attendance a LEFT JOIN users u ON a.user_id = u.id WHERE u.id IS NULL' },
      { name: 'machine_assignments.set_by_user_id -> users', q: 'SELECT count(*) as count FROM machine_assignments ma LEFT JOIN users u ON ma.set_by_user_id = u.id WHERE u.id IS NULL' }
    ];

    const fkResults = [];
    for (const chk of fkChecks) {
      const res = await client.query(chk.q);
      const orphans = parseInt(res.rows[0].count, 10);
      fkResults.push({
        'Table & Foreign Key': chk.name,
        'Orphans Found': orphans,
        'Integrity Status': orphans === 0 ? 'PASS (0 orphans)' : 'FAIL'
      });
    }
    console.table(fkResults);

    // 3. Confirm PIN-0000 / jithen no longer exists
    const jithenCheck = await client.query("SELECT * FROM users WHERE username = 'jithen' OR id = 4578");
    console.log('\n3. PIN-0000 / jithen Account Check:');
    console.log(`jithen rows found: ${jithenCheck.rows.length} (${jithenCheck.rows.length === 0 ? 'CONFIRMED REMOVED' : 'STILL PRESENT'})`);

    // 4. Parts master check
    const partsCheck = await client.query('SELECT count(*) as total, count(*) FILTER (WHERE active) as active FROM parts');
    console.log('\n4. Parts Master Check:');
    console.log(`Active Parts: ${partsCheck.rows[0].active} (Total: ${partsCheck.rows[0].total})`);

  } finally {
    client.release();
    await pool.end();
  }
}

verifyUsers();
