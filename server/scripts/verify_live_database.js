const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function check() {
  const parts = await pool.query('SELECT count(*) as total, count(*) FILTER (WHERE active) as active FROM parts');
  console.log('Parts count:', parts.rows[0]);
  const prods = await pool.query('SELECT count(*) as total FROM production_entries');
  console.log('Production entries:', prods.rows[0].total);
  const bags = await pool.query('SELECT count(*) as total FROM bags');
  console.log('Bags:', bags.rows[0].total);
  const ma = await pool.query('SELECT count(*) as total FROM machine_assignments');
  console.log('Machine assignments:', ma.rows[0].total);
  const ms = await pool.query('SELECT count(*) as total FROM machine_sessions');
  console.log('Machine sessions:', ms.rows[0].total);
  const fpa = await pool.query('SELECT count(*) as total FROM fpa_submissions');
  console.log('FPA submissions:', fpa.rows[0].total);

  // Check orphaned
  const orphaned = await pool.query(`
    SELECT
      (SELECT count(*) FROM production_entries WHERE part_id NOT IN (SELECT id FROM parts)) as pe_orphaned,
      (SELECT count(*) FROM bags WHERE part_id NOT IN (SELECT id FROM parts)) as bag_orphaned,
      (SELECT count(*) FROM machine_assignments WHERE part_id NOT IN (SELECT id FROM parts)) as ma_orphaned,
      (SELECT count(*) FROM machine_sessions WHERE part_id NOT IN (SELECT id FROM parts)) as ms_orphaned,
      (SELECT count(*) FROM fpa_submissions WHERE part_id NOT IN (SELECT id FROM parts)) as fpa_orphaned
  `);
  console.log('Orphaned check:', orphaned.rows[0]);

  // Check sample parts for F710, AN6B, AA02, etc.
  const sample = await pool.query(`
    SELECT id, part_code, shrp_part_code, customer_part_no, cavity_count, part_weight_g, unit_weight_g, standard_pack_qty, batch_part_code
    FROM parts
    WHERE shrp_part_code IN ('F710', 'AN6B', 'AA02 Y', 'F364 16C', 'F364 GS', 'QQVBA W', 'QQVBA Y')
    ORDER BY id
  `);
  console.log('Sample verified parts:');
  console.table(sample.rows);

  // Check if any SHRP-P codes remain
  const shrpP = await pool.query("SELECT count(*) FROM parts WHERE part_code LIKE 'SHRP-P%'");
  console.log('SHRP-Pxxx part codes count:', shrpP.rows[0].count);

  await pool.end();
}
check().catch(console.error);
