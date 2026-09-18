require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../db/pool');

async function inspectAll() {
  console.log('--- Inspecting App vs Historical Entries ---');

  const peWithSession = await pool.query(`
    SELECT pe.id, pe.entry_date, pe.shift, pe.session_id, pe.start_time, pe.end_time, pe.good_qty, pe.reject_qty, pe.created_at
    FROM production_entries pe
    WHERE pe.session_id IS NOT NULL;
  `);
  console.log('Production entries with session_id:');
  console.table(peWithSession.rows);

  const trimEntries = await pool.query(`
    SELECT t.id, t.bag_id, t.pass_number, t.trimmed_wt_kg, t.runner_wt_kg, t.reject_wt_kg, t.created_at
    FROM trim_entries t
    ORDER BY t.id DESC LIMIT 10;
  `);
  console.log(`Trim entries (total ${trimEntries.rows.length}):`);
  console.table(trimEntries.rows);

  const inspEntries = await pool.query(`
    SELECT i.id, i.bag_id, i.inspected_wt_kg, i.reject_wt_kg, i.sent_to_rework_qty, i.created_at
    FROM inspection_entries i
    ORDER BY i.id DESC LIMIT 10;
  `);
  console.log(`Inspection entries (total ${inspEntries.rows.length}):`);
  console.table(inspEntries.rows);

  const packEntries = await pool.query(`
    SELECT p.id, p.bag_id, p.packed_qty, p.packed_wt_kg, p.packets_count, p.created_at
    FROM packing_entries p
    ORDER BY p.id DESC LIMIT 10;
  `);
  console.log(`Packing entries (total ${packEntries.rows.length}):`);
  console.table(packEntries.rows);

  const sessions = await pool.query(`
    SELECT id, machine_id, operator_user_id, status, start_time, off_time, created_at
    FROM machine_sessions
    ORDER BY id ASC;
  `);
  console.log(`Machine sessions: ${sessions.rows.length}`);
  console.table(sessions.rows);

  pool.end();
}

inspectAll();
