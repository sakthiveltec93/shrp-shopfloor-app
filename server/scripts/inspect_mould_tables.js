require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../db/pool');

async function inspectMouldTables() {
  const maCols = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'machine_assignments'
    ORDER BY ordinal_position;
  `);
  console.log('machine_assignments columns:');
  console.table(maCols.rows);

  const fpaCols = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'fpa_submissions'
    ORDER BY ordinal_position;
  `);
  console.log('fpa_submissions columns:');
  console.table(fpaCols.rows);

  const mhCols = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('mould_history', 'mould_change_history')
    ORDER BY table_name, ordinal_position;
  `);
  console.log('mould_history columns:');
  console.table(mhCols.rows);

  // Check current assignments
  const maRows = await pool.query(`
    SELECT ma.id, ma.machine_id, m.machine_code, ma.part_id, p.part_name, p.part_code, ma.status,
           ma.mould_load_started_at, ma.first_ok_part_at, ma.approved_at, ma.notes, ma.created_at
    FROM machine_assignments ma
    JOIN machines m ON m.id = ma.machine_id
    JOIN parts p ON p.id = ma.part_id
    ORDER BY ma.id DESC LIMIT 5;
  `);
  console.log('Recent machine assignments:');
  console.table(maRows.rows);

  pool.end();
}

inspectMouldTables();
