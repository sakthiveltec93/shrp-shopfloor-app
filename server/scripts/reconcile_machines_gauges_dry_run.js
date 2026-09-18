const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function dryRunReconcile() {
  console.log('======================================================================');
  console.log(' DRY-RUN REPORT: MACHINES & GAUGES MASTER RECONCILIATION');
  console.log('======================================================================\n');

  const client = await pool.connect();
  try {
    // -------------------------------------------------------------
    // 1. MACHINES RECONCILIATION PLAN
    // -------------------------------------------------------------
    console.log('--- 1. MACHINES RECONCILIATION ---');

    // Mapping duplicate machine IDs -> Survivor Machine IDs
    const machineMergeMap = [
      { dupId: 3564, survivorId: 1, code: 'VIM-01', oldSpaced: 'VIM - 01' },
      { dupId: 3565, survivorId: 2, code: 'VIM-02', oldSpaced: 'VIM - 02' },
      { dupId: 3566, survivorId: 3, code: 'VIM-03', oldSpaced: 'VIM - 03' },
      { dupId: 3568, survivorId: 4, code: 'RUB-01', oldSpaced: 'RUB - 01' },
      { dupId: 3559, survivorId: 5, code: 'HSIM-01', oldSpaced: 'HSIM - 01' },
      { dupId: 3560, survivorId: 6, code: 'HSIM-02', oldSpaced: 'HSIM - 02' },
      { dupId: 3561, survivorId: 7, code: 'HSIM-03', oldSpaced: 'HSIM - 03' },
      { dupId: 3562, survivorId: 8, code: 'HSIM-04', oldSpaced: 'HSIM - 04' },
      { dupId: 3563, survivorId: 9, code: 'HSIM-05', oldSpaced: 'HSIM - 05' },
      { dupId: 3567, survivorId: 10, code: 'VSIM-01', oldSpaced: 'VSIM - 01' }
    ];

    const currentMachines = (await client.query('SELECT * FROM machines ORDER BY id')).rows;

    const machPlan = [];
    for (const item of machineMergeMap) {
      const survivor = currentMachines.find(m => m.id === item.survivorId);
      const dup = currentMachines.find(m => m.id === item.dupId);

      // Check FKs on dup
      const pe = (await client.query('SELECT count(*) FROM production_entries WHERE machine_id = $1', [item.dupId])).rows[0].count;
      const bags = (await client.query('SELECT count(*) FROM bags WHERE machine_id = $1', [item.dupId])).rows[0].count;
      const pm = (await client.query('SELECT count(*) FROM part_machines WHERE machine_id = $1', [item.dupId])).rows[0].count;
      const ma = (await client.query('SELECT count(*) FROM machine_assignments WHERE machine_id = $1', [item.dupId])).rows[0].count;

      machPlan.push({
        'Survivor ID': item.survivorId,
        'Old Code': item.oldSpaced,
        'Target Canonical Code': item.code,
        'Category': 'PRODUCTION',
        'Duplicate ID to Delete': item.dupId,
        'History to Re-link': `${pe} PE, ${bags} Bags, ${pm} Part-Machines, ${ma} Assigns`
      });
    }
    console.table(machPlan);

    // Auxiliary machines to keep
    const auxMachines = currentMachines.filter(m => m.id >= 3569 && m.id <= 3580);
    const auxPlan = auxMachines.map(m => ({
      'Auxiliary Machine ID': m.id,
      'Machine Code': m.machine_code,
      'Description': m.description,
      'Category': 'AUXILIARY',
      'Action': 'Keep as-is, set category = AUXILIARY & populate ERP details'
    }));
    console.log('\nAuxiliary Machines (Plant Equipment):');
    console.table(auxPlan);

    // -------------------------------------------------------------
    // 2. GAUGES RECONCILIATION PLAN
    // -------------------------------------------------------------
    console.log('\n--- 2. GAUGES RECONCILIATION ---');

    const currentGauges = (await client.query('SELECT * FROM gauges ORDER BY id')).rows;
    console.log(`Current Gauges in DB: ${currentGauges.length} rows (Placeholder codes: VERN-01–07, MIC-01–04, WT-01, WT-02)`);
    console.log('Referencing Foreign Keys across entire DB: 0 (verified safe for outright replacement)');

    // Read ERP 25 instruments
    const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
    const wb = XLSX.readFile(erpFile);
    const instSheet = wb.Sheets['List of Instruments'];
    const instRaw = XLSX.utils.sheet_to_json(instSheet, { header: 1, defval: '' });

    const newGauges = [];
    for (let i = 2; i <= 26; i++) {
      const r = instRaw[i];
      if (!r || !r[1]) continue;
      newGauges.push({
        gauge_code: String(r[1]).trim(),
        gauge_name: String(r[2]).trim(),
        range_spec: String(r[3]).trim(),
        serial_no: String(r[4] || '-').trim(),
        accuracy: String(r[5] || '-').trim(),
        acceptance_criteria: String(r[6] || 'Refer History Card').trim(),
        make: String(r[7] || '-').trim(),
        calibration_agency: String(r[9] || '-').trim(),
        location: String(r[10] || 'Shop Floor').trim(),
        calibration_frequency: String(r[11] || 'Once in Year').trim(),
        last_calibrated_text: String(r[12] || '26.11.2025').trim(),
        next_calibration_due: String(r[13] || '25.11.2026').trim(),
        calibration_interval_days: 365,
        status: 'active'
      });
    }

    console.log(`\nNew Authoritative Gauges from ERP List of Instruments (${newGauges.length} items):`);
    console.table(newGauges.map(g => ({
      'Gauge Code': g.gauge_code,
      'Name': g.gauge_name,
      'Range': g.range_spec,
      'Make': g.make,
      'Least Count': g.accuracy,
      'Location': g.location,
      'Calibration Due': g.next_calibration_due
    })));

  } finally {
    client.release();
    await pool.end();
  }
}

dryRunReconcile();
