const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const xlsx = require('xlsx');
const pool = require('../db/pool');

function parseExcelDate(serial, timeFraction = 0) {
  if (!serial) return null;
  if (typeof serial === 'string') {
    const parts = serial.split('-');
    if (parts.length === 3) {
      let day = parseInt(parts[0], 10);
      let month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      const d = new Date(Date.UTC(year, month, day));
      if (timeFraction) {
        const totalMs = Math.round(timeFraction * 86400 * 1000);
        d.setTime(d.getTime() + totalMs);
      }
      return d;
    }
  }
  // Excel base date 1899-12-30
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const totalDays = Number(serial) + (Number(timeFraction) || 0);
  const ms = Math.round(totalDays * 86400 * 1000);
  return new Date(excelEpoch.getTime() + ms);
}

async function seed() {
  console.log('🚀 Running 006_mould_campaign_history migration...');
  const sql = fs.readFileSync(path.join(__dirname, '../db/migrations/006_mould_campaign_history.sql'), 'utf8');
  await pool.query(sql);

  console.log('📖 Reading FORM ENTRY 26-271.xlsm sheet MOULD_HISTORY...');
  const wbPath = path.join(__dirname, '../../FORM ENTRY 26-271.xlsm');
  const wb = xlsx.readFile(wbPath);
  const d = xlsx.utils.sheet_to_json(wb.Sheets['MOULD_HISTORY'], { header: 1, raw: true });
  const rows = d.slice(1);

  const machines = (await pool.query('SELECT id, machine_code FROM machines')).rows;
  const parts = (await pool.query('SELECT id, part_code, part_name, shrp_part_code, customer_part_no, cavity_count, standard_cycle_time_sec FROM parts')).rows;

  // Clear existing historical rows to allow idempotent re-runs
  await pool.query('DELETE FROM mould_campaign_history WHERE is_historical = true');

  let insertedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[0]) continue;

    const mCode = String(r[0] || '').trim();
    const pCode = String(r[1] || '').trim();
    const pName = String(r[2] || '').trim();

    const mMatch = machines.find(m => m.machine_code.replace(/[-\s]+/g, '').toUpperCase() === mCode.replace(/[-\s]+/g, '').toUpperCase());
    const pMatch = parts.find(p =>
      p.part_code?.replace(/[-\s]+/g, '').toUpperCase() === pCode.replace(/[-\s]+/g, '').toUpperCase() ||
      p.shrp_part_code?.replace(/[-\s]+/g, '').toUpperCase() === pCode.replace(/[-\s]+/g, '').toUpperCase() ||
      p.part_name?.replace(/[-\s]+/g, '').toUpperCase() === pName.replace(/[-\s]+/g, '').toUpperCase() ||
      p.customer_part_no?.replace(/[-\s]+/g, '').toUpperCase() === pCode.replace(/[-\s]+/g, '').toUpperCase()
    );

    if (!mMatch || !pMatch) {
      console.warn(`⚠️ Could not match row ${i + 1}: Machine="${mCode}", Part="${pCode}"`);
      continue;
    }

    const loadedAt = parseExcelDate(r[3], r[4]);
    const unloadedAt = parseExcelDate(r[5], r[6]);

    let totalShots = Number(r[7]) || 0;
    let totalProdQty = Number(r[8]) || 0;
    let totalRejectQty = Number(r[9]) || 0;
    let totalNetQty = Number(r[10]) || (totalProdQty - totalRejectQty);
    let grossRunHours = Number(r[11]) || 0;
    let totalIdleMin = Number(r[12]) || 0;
    let netRunHours = Number(r[13]) || 0;
    let overallEff = Number(r[14]) || 0;
    const reason = (r[15] ? String(r[15]).trim() : 'Plan Completed') || 'Plan Completed';

    // If grossRunHours is corrupted by Excel date bug (> 1000 hours), recalculate from production entries
    if (grossRunHours > 1000 || grossRunHours <= 0) {
      const q = await pool.query(
        `SELECT COUNT(*) as cnt,
                SUM(EXTRACT(EPOCH FROM (COALESCE(period_end_at, end_time) - COALESCE(period_start_at, start_time))) / 3600.0) as duration_hrs
         FROM production_entries
         WHERE machine_id = $1 AND part_id = $2`,
        [mMatch.id, pMatch.id]
      );
      const calcHours = Number(q.rows[0]?.duration_hrs) || Number(q.rows[0]?.cnt) || 0;
      grossRunHours = Number(calcHours.toFixed(2));
      netRunHours = Number(Math.max(0, grossRunHours - (totalIdleMin / 60)).toFixed(2));
      
      // Calculate efficiency if std cycle time is available
      if (pMatch.standard_cycle_time_sec > 0 && netRunHours > 0) {
        const targetShots = (netRunHours * 3600) / pMatch.standard_cycle_time_sec;
        overallEff = targetShots > 0 ? Number(((totalShots / targetShots) * 100).toFixed(1)) : 0;
      }
    }

    // Insert historical campaign record
    await pool.query(
      `INSERT INTO mould_campaign_history (
         machine_id, part_id, loaded_at, unloaded_at,
         total_shots, total_prod_qty, total_reject_qty, total_net_qty,
         gross_run_hours, total_idle_min, net_run_hours, overall_efficiency_pct,
         reason, is_historical
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)`,
      [
        mMatch.id,
        pMatch.id,
        loadedAt,
        unloadedAt,
        totalShots,
        totalProdQty,
        totalRejectQty,
        totalNetQty,
        grossRunHours,
        totalIdleMin,
        netRunHours,
        overallEff,
        reason
      ]
    );

    insertedCount++;
  }

  console.log(`✅ Successfully seeded ${insertedCount} historical mould campaign runs into mould_campaign_history!`);
  await pool.end();
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
