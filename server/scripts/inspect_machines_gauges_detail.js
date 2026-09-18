const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function inspect() {
  const client = await pool.connect();
  try {
    console.log('======================================================================');
    console.log(' DETAILED AUDIT: MACHINES & GAUGES');
    console.log('======================================================================\n');

    // 1. All FK references to machines(id)
    const machFkTables = await client.query(`
      SELECT
        tc.table_name, 
        kcu.column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name = 'machines'
        AND tc.table_schema = 'public';
    `);
    console.log('1. Foreign Key References to machines(id):');
    console.table(machFkTables.rows);

    // Check row counts for machines 1-10 vs 3559-3568 vs 3569-3580
    const machHistory = await client.query(`
      SELECT m.id, m.machine_code, m.description,
        (SELECT count(*) FROM production_entries WHERE machine_id = m.id) as pe,
        (SELECT count(*) FROM bags WHERE machine_id = m.id) as bags,
        (SELECT count(*) FROM part_machines WHERE machine_id = m.id) as pm,
        (SELECT count(*) FROM machine_assignments WHERE machine_id = m.id) as ma,
        (SELECT count(*) FROM machine_breakdown_logs WHERE machine_id = m.id) as breakdown,
        (SELECT count(*) FROM daily_check_submissions WHERE machine_id = m.id) as daily_checks
      FROM machines m
      ORDER BY m.id;
    `);
    console.log('\n2. Machine Table Usage by Machine ID:');
    console.table(machHistory.rows);

    // 2. All FK references to gauges(id)
    const gaugeFkTables = await client.query(`
      SELECT
        tc.table_name, 
        kcu.column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name = 'gauges'
        AND tc.table_schema = 'public';
    `);
    console.log('\n3. Foreign Key References to gauges(id):');
    console.table(gaugeFkTables.rows);

    // Check if any gauges have references
    for (const row of gaugeFkTables.rows) {
      const refCount = await client.query(`SELECT count(*) as count FROM "${row.table_name}" WHERE "${row.column_name}" IS NOT NULL`);
      console.log(`   Table [${row.table_name}.${row.column_name}]: ${refCount.rows[0].count} referencing rows`);
    }

    // 3. Read Erp Master Requirements.xlsx
    const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
    const wb = XLSX.readFile(erpFile);

    console.log('\n4. ERP Sheet: Machine Details:');
    const machSheet = wb.Sheets['Machine Details'];
    const machRows = XLSX.utils.sheet_to_json(machSheet, { header: 1, defval: '' });
    for (let i = 0; i < Math.min(25, machRows.length); i++) {
      console.log(`Row ${i}:`, machRows[i]);
    }

    console.log('\n5. ERP Sheet: List of Instruments:');
    const instSheet = wb.Sheets['List of Instruments'];
    const instRows = XLSX.utils.sheet_to_json(instSheet, { header: 1, defval: '' });
    for (let i = 0; i < Math.min(35, instRows.length); i++) {
      console.log(`Row ${i}:`, instRows[i]);
    }

  } finally {
    client.release();
    await pool.end();
  }
}

inspect();
