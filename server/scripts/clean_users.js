const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

const APPLY = process.argv.includes('--apply');

// 26 Canonical Users
const canonicalRoster = [
  { username: 'admin', full_name: 'Administrator', role: 'admin' },
  { username: 'ambika', full_name: 'AMBIKA', role: 'operator' },
  { username: 'priya', full_name: 'BANU PRIYA', role: 'operator' },
  { username: 'bharath', full_name: 'BHARATH', role: 'operator' },
  { username: 'bibrath', full_name: 'BIBRATH', role: 'operator' },
  { username: 'bijoy', full_name: 'BIJOY', role: 'operator' },
  { username: 'dhatchayani', full_name: 'DHATCHAYANI', role: 'operator' },
  { username: 'jaganath', full_name: 'JAGANATH BISWAL', role: 'operator' },
  { username: 'janani', full_name: 'JANANI', role: 'supervisor' },
  { username: 'jiban', full_name: 'JIBAN', role: 'operator' },
  { username: 'jitan', full_name: 'JITAN BISWAL', role: 'operator' },
  { username: 'mathi', full_name: 'MATHI', role: 'operator' },
  { username: 'mohan', full_name: 'MOHANRAJ', role: 'operator' },
  { username: 'muthu', full_name: 'MUTHUPANDI', role: 'supervisor' },
  { username: 'pandiyan', full_name: 'PANDIYAN', role: 'supervisor' },
  { username: 'parameshwar', full_name: 'PARAMESHWAR', role: 'operator' },
  { username: 'reethu', full_name: 'REETHU', role: 'operator' },
  { username: 'sakthivel', full_name: 'SAKTHIVEL', role: 'admin' },
  { username: 'shanthi', full_name: 'SHANTHI', role: 'operator' },
  { username: 'soni', full_name: 'SONI DEVI', role: 'operator' },
  { username: 'subhankar', full_name: 'SUBHANKAR BISWAL', role: 'operator' },
  { username: 'subrath', full_name: 'SUBRATH', role: 'operator' },
  { username: 'sujatha', full_name: 'SUJATHA', role: 'operator' },
  { username: 'thilaka', full_name: 'THILAKA', role: 'operator' },
  { username: 'vidhya', full_name: 'VIDHYA', role: 'admin' },
  { username: 'vijaya', full_name: 'VIJAYA', role: 'operator' }
];

async function runCleanup() {
  console.log('======================================================================');
  console.log(' CANONICAL USERS RECONCILIATION & SAFE CLEANUP (26 CANONICAL ROSTER)');
  console.log(APPLY ? ' MODE: APPLY (WRITING TO DATABASE)' : ' MODE: DRY-RUN (AUDIT & PLAN ONLY)');
  console.log('======================================================================\n');

  const client = await pool.connect();
  try {
    if (APPLY) await client.query('BEGIN');

    const allUsers = (await client.query(`
      SELECT u.id, u.username, u.full_name, u.role, u.active, u.pin_hash, u.deleted_at,
        to_char(u.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
        (SELECT count(*) FROM production_entries WHERE operator_user_id = u.id) AS pe_count,
        (SELECT count(*) FROM bags WHERE operator_user_id = u.id) AS bag_count,
        (SELECT count(*) FROM trim_entries WHERE operator_user_id = u.id) AS trim_count,
        (SELECT count(*) FROM inspection_entries WHERE operator_user_id = u.id) AS insp_count,
        (SELECT count(*) FROM packing_entries WHERE operator_user_id = u.id) AS pack_count,
        (SELECT count(*) FROM login_history WHERE user_id = u.id) AS login_count
      FROM users u
      ORDER BY lower(u.username), u.id
    `)).rows;

    const fkTableColumns = [
      { table: 'production_entries', col: 'operator_user_id' },
      { table: 'bags', col: 'operator_user_id' },
      { table: 'trim_entries', col: 'operator_user_id' },
      { table: 'inspection_entries', col: 'operator_user_id' },
      { table: 'packing_entries', col: 'operator_user_id' },
      { table: 'login_history', col: 'user_id' },
      { table: 'attendance', col: 'user_id' },
      { table: 'user_activity_log', col: 'user_id' },
      { table: 'machine_assignments', col: 'set_by_user_id' },
      { table: 'machine_assignments', col: 'approved_by_user_id' },
      { table: 'fpa_submissions', col: 'technician_user_id' },
      { table: 'fpa_submissions', col: 'quality_inspector_user_id' },
      { table: 'fpa_submissions', col: 'supervisor_user_id' },
      { table: 'notifications', col: 'user_id' },
      { table: 'daily_check_submissions', col: 'operator_user_id' },
      { table: 'machine_sessions', col: 'operator_user_id' },
      { table: 'part_files', col: 'uploaded_by_user_id' },
      { table: 'mould_files', col: 'uploaded_by_user_id' },
      { table: 'packing_balance_pool', col: 'operator_user_id' },
      { table: 'mould_maintenance_logs', col: 'logged_by' },
      { table: 'machine_breakdown_logs', col: 'logged_by' },
      { table: 'traceability_audit_log', col: 'user_id' },
      { table: 'traceability_audit_log', col: 'approved_by' },
      { table: 'approved_devices', col: 'approved_by_user_id' },
      { table: 'blocked_devices', col: 'blocked_by_user_id' }
    ];

    // Canonical survivors map (26 survivors)
    const survivorMapping = [
      { canonName: 'admin', role: 'admin', survivorId: 1, relinkIds: [] },
      { canonName: 'ambika', role: 'operator', survivorId: 1882, relinkIds: [893] },
      { canonName: 'priya', role: 'operator', survivorId: 894, relinkIds: [2221] },
      { canonName: 'bharath', role: 'operator', survivorId: 895, relinkIds: [2222] },
      { canonName: 'bibrath', role: 'operator', survivorId: 896, relinkIds: [2223] },
      { canonName: 'bijoy', role: 'operator', survivorId: 897, relinkIds: [2224] },
      { canonName: 'dhatchayani', role: 'operator', survivorId: 898, relinkIds: [2225] },
      { canonName: 'jaganath', role: 'operator', survivorId: 899, relinkIds: [2226] },
      { canonName: 'janani', role: 'supervisor', survivorId: 917, relinkIds: [2244] },
      { canonName: 'jiban', role: 'operator', survivorId: 900, relinkIds: [2227] },
      { canonName: 'jitan', role: 'operator', survivorId: 901, relinkIds: [2228, 4578] }, // 4578 is jithen (PIN 0000)
      { canonName: 'mathi', role: 'operator', survivorId: 902, relinkIds: [2229] },
      { canonName: 'mohan', role: 'operator', survivorId: 903, relinkIds: [2230] },
      { canonName: 'muthu', role: 'supervisor', survivorId: 904, relinkIds: [2231] },
      { canonName: 'pandiyan', role: 'supervisor', survivorId: 905, relinkIds: [2232] },
      { canonName: 'parameshwar', role: 'operator', survivorId: 906, relinkIds: [2233] },
      { canonName: 'reethu', role: 'operator', survivorId: 907, relinkIds: [2234] },
      { canonName: 'sakthivel', role: 'admin', survivorId: 908, relinkIds: [69] },
      { canonName: 'shanthi', role: 'operator', survivorId: 909, relinkIds: [2236] },
      { canonName: 'soni', role: 'operator', survivorId: 910, relinkIds: [2237] },
      { canonName: 'subhankar', role: 'operator', survivorId: 911, relinkIds: [2238] },
      { canonName: 'subrath', role: 'operator', survivorId: 912, relinkIds: [2239] },
      { canonName: 'sujatha', role: 'operator', survivorId: 913, relinkIds: [2240] },
      { canonName: 'thilaka', role: 'operator', survivorId: 914, relinkIds: [2241] },
      { canonName: 'vidhya', role: 'admin', survivorId: 915, relinkIds: [13] },
      { canonName: 'vijaya', role: 'operator', survivorId: 916, relinkIds: [1983] }
    ];

    console.log('--- 1. Relinking Foreign Keys & Deleting Duplicate Rows ---');
    for (const item of survivorMapping) {
      for (const dupId of item.relinkIds) {
        const dupUser = allUsers.find(u => u.id === dupId);
        if (!dupUser) continue;
        console.log(`Relinking User [${dupId}: ${dupUser.username} (${dupUser.full_name})] -> Canonical Survivor [${item.survivorId}: ${item.canonName}]`);
        
        for (const fk of fkTableColumns) {
          if (APPLY) {
            await client.query(`
              UPDATE "${fk.table}"
              SET "${fk.col}" = $1
              WHERE "${fk.col}" = $2
            `, [item.survivorId, dupId]);
          }
        }

        // Handle user_page_access duplicates before delete
        if (APPLY) {
          await client.query('DELETE FROM user_page_access WHERE user_id = $1', [dupId]);
          // Delete duplicate user
          await client.query('DELETE FROM users WHERE id = $1', [dupId]);
        }
      }
    }

    console.log('\n--- 2. Normalizing Canonical Survivor Usernames to Lowercase & Roles ---');
    for (const item of survivorMapping) {
      console.log(`Updating Canonical Survivor [${item.survivorId}] -> username: '${item.canonName}', role: '${item.role}', active: true`);
      if (APPLY) {
        await client.query(`
          UPDATE users
          SET username = $1, role = $2, active = TRUE, deleted_at = NULL
          WHERE id = $3
        `, [item.canonName, item.role, item.survivorId]);
      }
    }

    if (APPLY) {
      await client.query('COMMIT');
      console.log('\nTransaction COMMITTED successfully.');
    } else {
      console.log('\nDRY-RUN completed. Zero changes committed.');
    }

    // Verify final counts
    const finalUsersRes = await client.query(`
      SELECT count(*) as total, count(*) FILTER (WHERE active) as active
      FROM users
    `);
    console.log(`\nFinal Users in DB: Total = ${finalUsersRes.rows[0].total}, Active = ${finalUsersRes.rows[0].active}`);

  } catch (err) {
    if (APPLY) await client.query('ROLLBACK');
    console.error('Error during users cleanup:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runCleanup();
