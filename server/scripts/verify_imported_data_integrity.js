const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function verify() {
  console.log('======================================================================');
  console.log(' DATABASE INTEGRITY & ORPHAN FK AUDIT REPORT');
  console.log('======================================================================\n');

  const client = await pool.connect();
  try {
    // 1. Table Counts
    const counts = await client.query(`
      SELECT 
        (SELECT count(*) FROM parts WHERE active) AS active_parts,
        (SELECT count(*) FROM parts WHERE NOT active) AS inactive_parts,
        (SELECT count(*) FROM machines) AS machines,
        (SELECT count(*) FROM users) AS users,
        (SELECT count(*) FROM production_entries) AS production_entries,
        (SELECT count(*) FROM bags) AS bags,
        (SELECT count(*) FROM trim_entries) AS trim_entries,
        (SELECT count(*) FROM inspection_entries) AS inspection_entries,
        (SELECT count(*) FROM packing_entries) AS packing_entries,
        (SELECT count(*) FROM reject_log) AS reject_log
    `);
    console.log('1. Live Database Table Counts:');
    console.table(counts.rows);

    // 2. Foreign Key Integrity Checks (Orphan Checks)
    console.log('\n2. Foreign Key Orphan Checks:');

    const fkChecks = [
      {
        name: 'production_entries -> parts',
        query: 'SELECT count(*) as orphans FROM production_entries pe LEFT JOIN parts p ON pe.part_id = p.id WHERE p.id IS NULL'
      },
      {
        name: 'production_entries -> machines',
        query: 'SELECT count(*) as orphans FROM production_entries pe LEFT JOIN machines m ON pe.machine_id = m.id WHERE m.id IS NULL'
      },
      {
        name: 'bags -> parts',
        query: 'SELECT count(*) as orphans FROM bags b LEFT JOIN parts p ON b.part_id = p.id WHERE p.id IS NULL'
      },
      {
        name: 'bags -> machines',
        query: 'SELECT count(*) as orphans FROM bags b LEFT JOIN machines m ON b.machine_id = m.id WHERE m.id IS NULL'
      },
      {
        name: 'trim_entries -> bags',
        query: 'SELECT count(*) as orphans FROM trim_entries te LEFT JOIN bags b ON te.bag_id = b.id WHERE b.id IS NULL'
      },
      {
        name: 'inspection_entries -> bags',
        query: 'SELECT count(*) as orphans FROM inspection_entries ie LEFT JOIN bags b ON ie.bag_id = b.id WHERE b.id IS NULL'
      },
      {
        name: 'packing_entries -> bags',
        query: 'SELECT count(*) as orphans FROM packing_entries pe LEFT JOIN bags b ON pe.bag_id = b.id WHERE b.id IS NULL'
      },
      {
        name: 'reject_log -> production_entries',
        query: 'SELECT count(*) as orphans FROM reject_log rl LEFT JOIN production_entries pe ON rl.production_entry_id = pe.id WHERE pe.id IS NULL'
      },
      {
        name: 'reject_log -> check_items (reject_reason)',
        query: 'SELECT count(*) as orphans FROM reject_log rl LEFT JOIN check_items ci ON rl.reject_reason_id = ci.id WHERE ci.id IS NULL'
      }
    ];

    const fkResults = [];
    for (const check of fkChecks) {
      const res = await client.query(check.query);
      const orphans = parseInt(res.rows[0].orphans, 10);
      fkResults.push({
        'Foreign Key Relationship': check.name,
        'Orphans Found': orphans,
        'Integrity Status': orphans === 0 ? 'PASS (0 orphans)' : 'FAIL'
      });
    }
    console.table(fkResults);

    // 3. Date Ranges for Transactional Records
    console.log('\n3. Transactional Date Ranges:');
    const dateRanges = await client.query(`
      SELECT 
        'production_entries' as table_name,
        min(entry_date)::text as min_date,
        max(entry_date)::text as max_date,
        count(DISTINCT entry_date) as unique_dates,
        count(*) as total_rows
      FROM production_entries
      UNION ALL
      SELECT 
        'bags' as table_name,
        min(entry_date)::text as min_date,
        max(entry_date)::text as max_date,
        count(DISTINCT entry_date) as unique_dates,
        count(*) as total_rows
      FROM bags
      UNION ALL
      SELECT 
        'trim_entries' as table_name,
        min(created_at::date)::text as min_date,
        max(created_at::date)::text as max_date,
        count(DISTINCT created_at::date) as unique_dates,
        count(*) as total_rows
      FROM trim_entries
      UNION ALL
      SELECT 
        'inspection_entries' as table_name,
        min(created_at::date)::text as min_date,
        max(created_at::date)::text as max_date,
        count(DISTINCT created_at::date) as unique_dates,
        count(*) as total_rows
      FROM inspection_entries
      UNION ALL
      SELECT 
        'packing_entries' as table_name,
        min(created_at::date)::text as min_date,
        max(created_at::date)::text as max_date,
        count(DISTINCT created_at::date) as unique_dates,
        count(*) as total_rows
      FROM packing_entries
      UNION ALL
      SELECT 
        'reject_log' as table_name,
        min(created_at::date)::text as min_date,
        max(created_at::date)::text as max_date,
        count(DISTINCT created_at::date) as unique_dates,
        count(*) as total_rows
      FROM reject_log
    `);
    console.table(dateRanges.rows);

    // 4. Parts master check
    console.log('\n4. Parts Master Integrity Check:');
    const partsCheck = await client.query(`
      SELECT 
        count(*) as total_parts,
        count(*) FILTER (WHERE active) as active_parts,
        count(*) FILTER (WHERE shrp_part_code LIKE 'TEMP_%') as temp_codes,
        count(*) FILTER (WHERE shrp_part_code LIKE 'SHRP-P%') as artificial_codes
      FROM parts
    `);
    console.table(partsCheck.rows);

    console.log('\n======================================================================');
    console.log(' INTEGRITY AUDIT COMPLETE');
    console.log('======================================================================');

  } catch (err) {
    console.error('Audit failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

verify().catch(console.error);
