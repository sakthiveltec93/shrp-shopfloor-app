const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function verify() {
  console.log('=== POST-RECONCILIATION VERIFICATION ===\n');

  // 1. Machines check
  const machSummary = await pool.query(`
    SELECT category, count(*) as count 
    FROM machines 
    GROUP BY category 
    ORDER BY category
  `);
  console.log('Machines by Category:');
  console.table(machSummary.rows);

  const machList = await pool.query(`
    SELECT id, machine_code, description, category, tonnage, hp, active 
    FROM machines 
    ORDER BY category DESC, id ASC
  `);
  console.log('\nAll Machines (21 total):');
  console.table(machList.rows);

  // 2. Gauges check
  const gaugesList = await pool.query(`
    SELECT id, gauge_code, gauge_name, range_spec, accuracy, serial_no, make, calibration_agency, location, next_calibration_due, status
    FROM gauges
    ORDER BY id ASC
  `);
  console.log('\nAll Gauges (25 total):');
  console.table(gaugesList.rows);

  // 3. FK Integrity checks
  const peOrphans = await pool.query('SELECT count(*) FROM production_entries WHERE machine_id NOT IN (SELECT id FROM machines)');
  const bagOrphans = await pool.query('SELECT count(*) FROM bags WHERE machine_id NOT IN (SELECT id FROM machines)');
  const maOrphans = await pool.query('SELECT count(*) FROM machine_assignments WHERE machine_id NOT IN (SELECT id FROM machines)');
  const pmOrphans = await pool.query('SELECT count(*) FROM part_machines WHERE machine_id NOT IN (SELECT id FROM machines)');
  const dcsOrphans = await pool.query('SELECT count(*) FROM daily_check_submissions WHERE machine_id NOT IN (SELECT id FROM machines)');
  const msOrphans = await pool.query('SELECT count(*) FROM machine_sessions WHERE machine_id NOT IN (SELECT id FROM machines)');

  console.log('\nForeign Key Orphan Audit:');
  console.log('  production_entries machine orphans:', peOrphans.rows[0].count);
  console.log('  bags machine orphans:', bagOrphans.rows[0].count);
  console.log('  machine_assignments machine orphans:', maOrphans.rows[0].count);
  console.log('  part_machines machine orphans:', pmOrphans.rows[0].count);
  console.log('  daily_check_submissions machine orphans:', dcsOrphans.rows[0].count);
  console.log('  machine_sessions machine orphans:', msOrphans.rows[0].count);

  // 4. Parts & Users invariants
  const partsCount = await pool.query('SELECT count(*) FROM parts WHERE active = true');
  const usersCount = await pool.query('SELECT count(*) FROM users WHERE active = true');
  console.log('\nMaster Data Invariants:');
  console.log('  Active parts count:', partsCount.rows[0].count, '(Expected: 76)');
  console.log('  Active users count:', usersCount.rows[0].count, '(Expected: 26)');

  await pool.end();
}

verify().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
