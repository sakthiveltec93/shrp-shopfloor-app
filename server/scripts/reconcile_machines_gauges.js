const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

const APPLY = process.argv.includes('--apply');

async function reconcile() {
  console.log('======================================================================');
  console.log(' MACHINES & GAUGES MASTER RECONCILIATION');
  console.log(APPLY ? ' MODE: APPLY (WRITING TO DATABASE)' : ' MODE: DRY-RUN (AUDIT & SIMULATION ONLY)');
  console.log('======================================================================\n');

  const client = await pool.connect();
  try {
    if (APPLY) {
      await client.query('BEGIN');
      console.log('--- 0. Creating Pre-Reconciliation Backups ---');
      await client.query('CREATE TABLE IF NOT EXISTS machines_backup_pre_reconcile_v2 AS SELECT * FROM machines;');
      await client.query('CREATE TABLE IF NOT EXISTS gauges_backup_pre_reconcile_v2 AS SELECT * FROM gauges;');
      console.log('Backups created: machines_backup_pre_reconcile_v2, gauges_backup_pre_reconcile_v2\n');
    }

    // -------------------------------------------------------------
    // 1. MACHINES RECONCILIATION
    // -------------------------------------------------------------
    console.log('--- 1. Reconciling Machines Table ---');

    // 10 Spaced Survivor Machines -> Merge duplicate IDs & update in-place
    const machineMergeMap = [
      { dupId: 3564, survivorId: 1, code: 'VIM-01', desc: 'Vertical Injection Mould-01', make: 'TEXAIR', cap: 40, type: 'TOGGLE TYPE - Vertical Plunger', dim: '200 X 200', screw: 25, shot: 65, hp: 4, yr: 1999, rate: 150, counter: false, active: true },
      { dupId: 3565, survivorId: 2, code: 'VIM-02', desc: 'Vertical Injection Mould-02', make: 'HYDROFEX', cap: 40, type: 'TOGGLE TYPE - Vertical Plunger', dim: '200 X 200', screw: 25, shot: 65, hp: 4, yr: 2002, rate: 150, counter: true, active: true },
      { dupId: 3566, survivorId: 3, code: 'VIM-03', desc: 'Vertical Injection Mould-03', make: 'POLYTEX', cap: 20, type: 'CYLINDER TYPE - Vertical Plunger', dim: '150 X 150', screw: 20, shot: 45, hp: 4, yr: 2004, rate: 125, counter: false, active: true },
      { dupId: 3568, survivorId: 4, code: 'RUB-01', desc: 'Rubber hand press', make: 'PREMIER', cap: 100, type: 'HAND FLY PRESS', dim: '300X300', screw: null, shot: null, hp: 3, yr: 2005, rate: null, counter: false, active: true },
      { dupId: 3559, survivorId: 5, code: 'HSIM-01', desc: 'Horizontal Injection Mould Machine', make: 'PAYAL', cap: 50, type: 'SCREW TYPE', dim: '270X320', screw: 35, shot: 140, hp: 10, yr: 2012, rate: 157, counter: true, active: true },
      { dupId: 3560, survivorId: 6, code: 'HSIM-02', desc: 'Horizontal Injection Mould Machine', make: 'SUPERMASTER', cap: 50, type: 'SCREW TYPE', dim: '310X370', screw: 35, shot: 140, hp: 10, yr: 2014, rate: 157, counter: true, active: true },
      { dupId: 3561, survivorId: 7, code: 'HSIM-03', desc: 'Horizontal Injection Mould Machine', make: 'L&T', cap: 100, type: 'SCREW TYPE', dim: '420X470', screw: 35, shot: 160, hp: 27.5, yr: 2022, rate: 188, counter: true, active: true },
      { dupId: 3562, survivorId: 8, code: 'HSIM-04', desc: 'Horizontal Injection Mould Machine', make: 'Haitian 120', cap: 120, type: 'SCREW TYPE', dim: '410x410', screw: 36, shot: 157, hp: 27, yr: 2024, rate: 200, counter: true, active: true },
      { dupId: 3563, survivorId: 9, code: 'HSIM-05', desc: 'Horizontal Injection Mould Machine', make: 'Haitian 90', cap: 90, type: 'SCREW TYPE', dim: '360X360', screw: 32, shot: 109, hp: 22, yr: 2022, rate: 188, counter: true, active: true },
      { dupId: 3567, survivorId: 10, code: 'VSIM-01', desc: 'Vertical Screw Injection Mould', make: 'Tex Shine', cap: 40, type: 'Vertical SCREW TYPE', dim: '270 X220', screw: 35, shot: 140, hp: 8, yr: 2021, rate: 150, counter: true, active: true }
    ];

    // Re-link FKs from duplicates to survivors
    for (const m of machineMergeMap) {
      console.log(`Re-linking duplicate machine [ID: ${m.dupId}] -> Survivor [ID: ${m.survivorId}: ${m.code}]`);
      if (APPLY) {
        await client.query('UPDATE production_entries SET machine_id = $1 WHERE machine_id = $2', [m.survivorId, m.dupId]);
        await client.query('UPDATE bags SET machine_id = $1 WHERE machine_id = $2', [m.survivorId, m.dupId]);
        await client.query('UPDATE machine_assignments SET machine_id = $1 WHERE machine_id = $2', [m.survivorId, m.dupId]);
        await client.query('UPDATE machine_breakdown_logs SET machine_id = $1 WHERE machine_id = $2', [m.survivorId, m.dupId]);
        await client.query('UPDATE daily_check_submissions SET machine_id = $1 WHERE machine_id = $2', [m.survivorId, m.dupId]);
        await client.query('UPDATE machine_sessions SET machine_id = $1 WHERE machine_id = $2', [m.survivorId, m.dupId]);

        // part_machines re-linking
        const dupPms = (await client.query('SELECT part_id, cycle_time_sec, workcenter_order FROM part_machines WHERE machine_id = $1', [m.dupId])).rows;
        for (const pm of dupPms) {
          await client.query(`
            INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (part_id, machine_id) DO UPDATE SET
              cycle_time_sec = CASE WHEN part_machines.cycle_time_sec = 0 THEN EXCLUDED.cycle_time_sec ELSE part_machines.cycle_time_sec END
          `, [pm.part_id, m.survivorId, pm.cycle_time_sec, pm.workcenter_order]);
        }
        await client.query('DELETE FROM part_machines WHERE machine_id = $1', [m.dupId]);

        // Delete duplicate machine
        await client.query('DELETE FROM machines WHERE id = $1', [m.dupId]);

        // Update survivor machine in place
        await client.query(`
          UPDATE machines SET
            machine_code = $1,
            description = $2,
            make = $3,
            tonnage = $4,
            machine_type = $5,
            dimension = $6,
            screw_dia = $7,
            max_shot_weight_g = $8,
            hp = $9,
            year_of_commission = $10,
            hourly_rate_inr = $11,
            has_counter = $12,
            active = $13,
            category = 'PRODUCTION'
          WHERE id = $14
        `, [
          m.code, m.desc, m.make, m.cap, m.type, m.dim, m.screw, m.shot,
          m.hp, m.yr, m.rate, m.counter, m.active, m.survivorId
        ]);
      }
    }

    // Additional Production Machines: RUB-02 and RUB-03 (category = 'PRODUCTION')
    const rubProdMachines = [
      { id: 3569, code: 'RUB-02', desc: 'Hydraulic Rubber Press', make: '', cap: 120, type: 'Hydraulic Press', dim: '450 X 450', hp: 9.4, yr: 2012, rate: 157, counter: false, active: true },
      { id: 3570, code: 'RUB-03', desc: 'Hydraulic Rubber Press', make: '', cap: 300, type: 'Hydraulic Press', dim: '1000 X 300', hp: 9.4, yr: 2014, rate: null, counter: false, active: true }
    ];

    console.log('\nUpdating RUB-02 and RUB-03 with category = PRODUCTION...');
    for (const r of rubProdMachines) {
      if (APPLY) {
        await client.query(`
          UPDATE machines SET
            machine_code = $1,
            description = $2,
            make = $3,
            tonnage = $4,
            machine_type = $5,
            dimension = $6,
            hp = $7,
            year_of_commission = $8,
            hourly_rate_inr = $9,
            has_counter = $10,
            active = $11,
            category = 'PRODUCTION'
          WHERE id = $12
        `, [
          r.code, r.desc, r.make, r.cap, r.type, r.dim,
          r.hp, r.yr, r.rate, r.counter, r.active, r.id
        ]);
      }
    }

    // Auxiliary machines (9 equipment items: category = 'AUXILIARY')
    const auxDetails = [
      { id: 3571, code: 'HD-01', desc: 'DRILLING MACHINE', make: 'BOSCH', cap: null, type: '2500W', dim: '-', hp: null, yr: 2014, rate: null, counter: false, active: true },
      { id: 3573, code: 'HG-01', desc: 'Grinding', make: 'BOSCH', cap: null, type: '1500W', dim: '-', hp: null, yr: 2012, rate: null, counter: false, active: true },
      { id: 3574, code: 'AC-01', desc: 'Air Compressor', make: 'Varsha', cap: null, type: '2HP', dim: '-', hp: 2, yr: 2005, rate: null, counter: false, active: true },
      { id: 3575, code: 'CT-01', desc: 'COOLING TOWER', make: '', cap: 40, type: '40TR', dim: '-', hp: null, yr: 2012, rate: null, counter: false, active: true },
      { id: 3576, code: 'DG-01', desc: 'DIESEL GENERATOR', make: 'KIRLOSKAR', cap: 32, type: '32KVA', dim: '-', hp: null, yr: 2012, rate: null, counter: false, active: true },
      { id: 3577, code: 'CR-01', desc: 'CRANE', make: 'HSN-CHAIN BLOCK', cap: 1, type: '1TON', dim: '-', hp: null, yr: null, rate: null, counter: false, active: true },
      { id: 3578, code: 'CR-02', desc: 'CRANE', make: 'HSN-CHAIN BLOCK', cap: 2, type: '2TON', dim: '-', hp: null, yr: null, rate: null, counter: false, active: true },
      { id: 3579, code: 'CR-03', desc: 'CRANE', make: 'HSN-CHAIN BLOCK', cap: 2, type: '2TON', dim: '-', hp: null, yr: null, rate: null, counter: false, active: true },
      { id: 3580, code: 'CR-04', desc: 'CRANE', make: 'HSN-CHAIN BLOCK', cap: 3, type: '3TON', dim: '-', hp: null, yr: null, rate: null, counter: false, active: true }
    ];

    console.log('\nUpdating 9 Auxiliary Machines with category = AUXILIARY...');
    for (const aux of auxDetails) {
      if (APPLY) {
        await client.query(`
          UPDATE machines SET
            machine_code = $1,
            description = $2,
            make = $3,
            tonnage = $4,
            machine_type = $5,
            dimension = $6,
            hp = $7,
            year_of_commission = $8,
            hourly_rate_inr = $9,
            has_counter = $10,
            active = $11,
            category = 'AUXILIARY'
          WHERE id = $12
        `, [
          aux.code, aux.desc, aux.make, aux.cap, aux.type, aux.dim,
          aux.hp, aux.yr, aux.rate, aux.counter, aux.active, aux.id
        ]);
      }
    }

    // -------------------------------------------------------------
    // 2. GAUGES RECONCILIATION
    // -------------------------------------------------------------
    console.log('\n--- 2. Reconciling Gauges Table (Outright Replacement with 25 Authoritative ERP Instruments) ---');

    const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
    const wb = XLSX.readFile(erpFile);
    const instSheet = wb.Sheets['List of Instruments'];
    const instRaw = XLSX.utils.sheet_to_json(instSheet, { header: 1, defval: '' });

    const newGauges = [];
    for (let i = 2; i <= 26; i++) {
      const r = instRaw[i];
      if (!r || !r[1]) continue;
      const code = String(r[1]).trim();
      let name = String(r[2]).trim();

      // Fix DWB-02 description from ERP typo to 'Weighing Balance'
      if (code === 'DWB-02') {
        name = 'Weighing Balance';
      }

      // Clean location strings if needed
      let loc = String(r[10] || '-').trim();
      if (loc === 'HSIM01') loc = 'HSIM-01';
      else if (loc === 'HSIM02') loc = 'HSIM-02';
      else if (loc === 'HSIM03') loc = 'HSIM-03';
      else if (loc === 'HSIM04') loc = 'HSIM-04';
      else if (loc === 'HSIM05') loc = 'HSIM-05';
      else if (loc === 'VIM 01') loc = 'VIM-01';
      else if (loc === 'VIM 02') loc = 'VIM-02';
      else if (loc === 'VSIM 01') loc = 'VSIM-01';
      else if (loc === 'RUB 02') loc = 'RUB-02';
      else if (loc === '2 nd floor') loc = '2nd floor';

      newGauges.push({
        gauge_code: code,
        gauge_name: name,
        range_spec: String(r[3]).trim(),
        serial_no: String(r[4] || '-').trim() || '-',
        accuracy: String(r[5] || '-').trim(),
        acceptance_criteria: String(r[6] || 'Refer History Card').trim() || 'Refer History Card',
        make: String(r[7] || '-').trim() || '-',
        calibration_agency: String(r[9] || '-').trim(),
        location: loc,
        calibration_frequency: 'Once in Year',
        last_calibrated_text: '26.11.2025',
        last_calibrated_at: '2025-11-26',
        next_calibration_due: '25.11.2026',
        calibration_interval_days: 365,
        status: 'active'
      });
    }

    console.log(`Parsed ${newGauges.length} instruments directly from 'List of Instruments':`);
    console.table(newGauges.map(g => ({
      Code: g.gauge_code,
      Description: g.gauge_name,
      Range: g.range_spec,
      Serial: g.serial_no,
      LC: g.accuracy,
      Make: g.make,
      CalAgency: g.calibration_agency,
      Location: g.location
    })));

    if (APPLY) {
      await client.query('DELETE FROM gauges');
      for (const g of newGauges) {
        await client.query(`
          INSERT INTO gauges (
            gauge_code, gauge_name, range_spec, serial_no, accuracy,
            acceptance_criteria, make, calibration_agency, location,
            calibration_frequency, last_calibrated_at, last_calibrated_text, next_calibration_due,
            calibration_interval_days, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [
          g.gauge_code, g.gauge_name, g.range_spec, g.serial_no, g.accuracy,
          g.acceptance_criteria, g.make, g.calibration_agency, g.location,
          g.calibration_frequency, g.last_calibrated_at, g.last_calibrated_text, g.next_calibration_due,
          g.calibration_interval_days, g.status
        ]);
      }
    }

    if (APPLY) {
      await client.query('COMMIT');
      console.log('\nTransaction COMMITTED successfully.');
    } else {
      console.log('\nDRY-RUN completed. Zero writes executed.');
    }

    // Final Counts
    const postMach = await client.query('SELECT count(*) as total, count(*) FILTER (WHERE category = \'PRODUCTION\') as prod, count(*) FILTER (WHERE category = \'AUXILIARY\') as aux FROM machines');
    const postGauges = await client.query('SELECT count(*) as total FROM gauges');

    console.log('\nFinal State:');
    console.log(`  Machines Total: ${postMach.rows[0].total} (Production: ${postMach.rows[0].prod}, Auxiliary: ${postMach.rows[0].aux})`);
    console.log(`  Gauges Total: ${postGauges.rows[0].total}`);

  } catch (err) {
    if (APPLY) await client.query('ROLLBACK');
    console.error('Error during reconciliation:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

reconcile();
