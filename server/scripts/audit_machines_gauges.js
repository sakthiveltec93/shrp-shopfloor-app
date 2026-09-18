const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function auditMachinesAndGauges() {
  console.log('======================================================================');
  console.log(' AUDIT: MACHINES & GAUGES MASTER RECONCILIATION');
  console.log('======================================================================\n');

  const client = await pool.connect();
  try {
    // 1. Current DB Machines
    const dbMachines = (await client.query(`
      SELECT m.id, m.machine_code, m.description, m.active,
        (SELECT count(*) FROM production_entries WHERE machine_id = m.id) as pe_count,
        (SELECT count(*) FROM bags WHERE machine_id = m.id) as bag_count,
        (SELECT count(*) FROM part_machines WHERE machine_id = m.id) as pm_count,
        (SELECT count(*) FROM machine_assignments WHERE machine_id = m.id) as ma_count
      FROM machines m
      ORDER BY m.id;
    `)).rows;

    console.log(`1. Current Database Machines (${dbMachines.length} rows):`);
    console.table(dbMachines);

    // 2. Current DB Gauges
    const dbGauges = (await client.query(`
      SELECT g.*
      FROM gauges g
      ORDER BY g.id;
    `)).rows;

    console.log(`\n2. Current Database Gauges (${dbGauges.length} rows):`);
    console.table(dbGauges);

    // 3. Excel Sources Audit
    const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
    const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');

    if (fs.existsSync(erpFile)) {
      const wbErp = XLSX.readFile(erpFile);
      console.log('\n3. Erp Master Requirements.xlsx Sheet Names:', wbErp.SheetNames);
      
      for (const sName of wbErp.SheetNames) {
        if (sName.toLowerCase().includes('mach') || sName.toLowerCase().includes('gauge') || sName.toLowerCase().includes('inst')) {
          const rows = XLSX.utils.sheet_to_json(wbErp.Sheets[sName]);
          console.log(`\n   --- ERP Sheet [${sName}]: ${rows.length} rows ---`);
          console.log('   Sample row:', rows[0]);
        }
      }
    }

    if (fs.existsSync(formFile)) {
      const wbForm = XLSX.readFile(formFile);
      console.log('\n4. FORM ENTRY 26-271.xlsm Sheet Names:', wbForm.SheetNames);
      for (const sName of wbForm.SheetNames) {
        if (sName.toLowerCase().includes('mach') || sName.toLowerCase().includes('gauge') || sName.toLowerCase().includes('inst')) {
          const rows = XLSX.utils.sheet_to_json(wbForm.Sheets[sName]);
          console.log(`\n   --- FORM ENTRY Sheet [${sName}]: ${rows.length} rows ---`);
          console.log('   Sample row:', rows[0]);
        }
      }
    }

  } finally {
    client.release();
    await pool.end();
  }
}

auditMachinesAndGauges();
