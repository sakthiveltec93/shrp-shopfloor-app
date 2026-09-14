const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { istDateString } = require('../lib/shift');

const router = express.Router();
router.use(requireAuth);

function todayIST() {
  return istDateString(new Date());
}

// Format minutes to "H:MM" or "HH:MM"
function formatMinutes(min) {
  const m = Math.round(Number(min) || 0);
  const hrs = Math.floor(m / 60);
  const rem = m % 60;
  return `${hrs}:${String(rem).padStart(2, '0')}`;
}

// 1. Daily Production Summary (Matching Screenshot 2 - DAILY_SUMMARY)
router.get('/daily-summary', async (req, res) => {
  const date = req.query.date || todayIST();
  const shift = req.query.shift || 'ALL';

  const shiftCondition = shift !== 'ALL' ? 'AND pe.shift = $2' : '';
  const shiftParams = shift !== 'ALL' ? [date, shift] : [date];

  // 1. Production entries summary
  const prodRes = await pool.query(`
    SELECT pe.*, m.machine_code, p.part_code, p.shrp_part_code, p.part_name,
           p.cavity_count, p.standard_cycle_time_sec, p.unit_weight_g, p.part_weight_g,
           u.full_name AS operator_name
    FROM production_entries pe
    JOIN machines m ON m.id = pe.machine_id
    JOIN parts p ON p.id = pe.part_id
    JOIN users u ON u.id = pe.operator_user_id
    WHERE pe.entry_date = $1 ${shiftCondition}
    ORDER BY m.machine_code, pe.hour_slot
  `, shiftParams);

  const entries = prodRes.rows;

  // 2. Bags material weights for this date/shift
  const bagShiftCond = shift !== 'ALL' ? 'AND b.shift = $2' : '';
  const bagRes = await pool.query(`
    SELECT b.bag_type, b.machine_id, m.machine_code, COALESCE(SUM(b.base_weight_kg), 0) AS total_kg,
           COALESCE(SUM(b.qty), 0) AS total_qty
    FROM bags b
    LEFT JOIN machines m ON m.id = b.machine_id
    WHERE b.entry_date = $1 ${bagShiftCond} AND b.status != 'CANCELLED'
    GROUP BY b.bag_type, b.machine_id, m.machine_code
  `, shiftParams);

  const bagsData = bagRes.rows;

  // 3. Downtime logs for this date
  const dtRes = await pool.query(`
    SELECT dl.*, ci.item_name AS reason_name, ci.related_to, pe.machine_id
    FROM downtime_log dl
    JOIN production_entries pe ON pe.id = dl.production_entry_id
    LEFT JOIN check_items ci ON ci.id = dl.downtime_reason_id
    WHERE pe.entry_date = $1 ${shiftCondition}
  `, shiftParams);
  const downtimeLogs = dtRes.rows;

  // 4. Reject logs for this date (Pareto)
  const rejRes = await pool.query(`
    SELECT rl.*, ci.item_name AS reason_name, ci.code AS reason_code, pe.machine_id
    FROM reject_log rl
    JOIN production_entries pe ON pe.id = rl.production_entry_id
    LEFT JOIN check_items ci ON ci.id = rl.reject_reason_id
    WHERE pe.entry_date = $1 ${shiftCondition}
  `, shiftParams);
  const rejectLogs = rejRes.rows;

  // 5. Compute Top 10 KPIs
  let totalProductionQty = 0;
  let totalOkQty = 0;
  let totalRejectQty = 0;
  let totalShots = 0;
  let weightedStandardSec = 0;
  let totalRunTimeMinutes = 0;

  for (const e of entries) {
    const gross = (e.end_count - e.start_count);
    const good = Number(e.good_qty);
    const rej = Number(e.reject_qty);
    const cav = Math.max(1, Number(e.cavity_count) || 1);
    const shots = Math.round(gross / cav);

    totalProductionQty += gross;
    totalOkQty += good;
    totalRejectQty += rej;
    totalShots += shots;

    // Run time in minutes
    if (e.start_time && e.end_time) {
      const durMin = Math.max(0, (new Date(e.end_time) - new Date(e.start_time)) / 60000);
      totalRunTimeMinutes += durMin;
      weightedStandardSec += (good * Number(e.standard_cycle_time_sec || 0));
    }
  }

  // Material weights by bag_type
  let partWeightKg = 0;
  let runnerWeightKg = 0;
  let rejectWeightKg = 0;
  let lumpsWeightKg = 0;

  for (const b of bagsData) {
    const kg = Number(b.total_kg);
    if (b.bag_type === 'PART') partWeightKg += kg;
    else if (b.bag_type === 'RUNNER') runnerWeightKg += kg;
    else if (b.bag_type === 'REJECTION') rejectWeightKg += kg;
    else if (b.bag_type === 'LUMP') lumpsWeightKg += kg;
  }

  const totalIdleMinutes = downtimeLogs.reduce((sum, d) => sum + Number(d.minutes || 0), 0);

  const overallEfficiencyPct = totalRunTimeMinutes > 0 && weightedStandardSec > 0
    ? Number(((weightedStandardSec / (totalRunTimeMinutes * 60)) * 100).toFixed(1))
    : (entries.length ? Number((entries.reduce((sum, e) => sum + (Number(e.efficiency_pct) || 0), 0) / entries.length).toFixed(1)) : 0);

  // 6. Group by Machine for Machine Performance Table
  const machineMap = {};
  // Pre-seed all machines
  const allMachines = await pool.query('SELECT * FROM machines WHERE active = TRUE ORDER BY machine_code');
  for (const m of allMachines.rows) {
    machineMap[m.id] = {
      machine_id: m.id,
      machine_code: m.machine_code,
      parts: new Set(),
      operators: new Set(),
      shots: 0,
      production_qty: 0,
      ok_qty: 0,
      reject_qty: 0,
      idle_minutes: 0,
      run_time_minutes: 0,
      weighted_std_sec: 0,
      part_weight_kg: 0,
      runner_weight_kg: 0,
      reject_weight_kg: 0,
      lumps_weight_kg: 0,
      entries_count: 0,
      efficiency_sum: 0,
    };
  }

  for (const e of entries) {
    if (!machineMap[e.machine_id]) continue;
    const item = machineMap[e.machine_id];
    item.parts.add(e.shrp_part_code || e.part_code);
    item.operators.add(e.operator_name);
    const gross = (e.end_count - e.start_count);
    const cav = Math.max(1, Number(e.cavity_count) || 1);
    item.shots += Math.round(gross / cav);
    item.production_qty += gross;
    item.ok_qty += Number(e.good_qty);
    item.reject_qty += Number(e.reject_qty);
    item.entries_count += 1;
    item.efficiency_sum += (Number(e.efficiency_pct) || 0);

    if (e.start_time && e.end_time) {
      const durMin = Math.max(0, (new Date(e.end_time) - new Date(e.start_time)) / 60000);
      item.run_time_minutes += durMin;
      item.weighted_std_sec += (Number(e.good_qty) * Number(e.standard_cycle_time_sec || 0));
    }
  }

  // Add downtime to machines
  for (const dt of downtimeLogs) {
    if (machineMap[dt.machine_id]) {
      machineMap[dt.machine_id].idle_minutes += Number(dt.minutes || 0);
    }
  }

  // Add bag weights to machines
  for (const b of bagsData) {
    if (b.machine_id && machineMap[b.machine_id]) {
      const kg = Number(b.total_kg);
      if (b.bag_type === 'PART') machineMap[b.machine_id].part_weight_kg += kg;
      else if (b.bag_type === 'RUNNER') machineMap[b.machine_id].runner_weight_kg += kg;
      else if (b.bag_type === 'REJECTION') machineMap[b.machine_id].reject_weight_kg += kg;
      else if (b.bag_type === 'LUMP') machineMap[b.machine_id].lumps_weight_kg += kg;
    }
  }

  const machinePerformance = Object.values(machineMap).map((m) => {
    const plannedMinutes = 12 * 60; // 12hr shift basis
    const eff = m.run_time_minutes > 0 && m.weighted_std_sec > 0
      ? Number(((m.weighted_std_sec / (m.run_time_minutes * 60)) * 100).toFixed(1))
      : (m.entries_count ? Number((m.efficiency_sum / m.entries_count).toFixed(1)) : 0);

    const oeeAvail = m.run_time_minutes > 0
      ? Number((Math.min(100, (m.run_time_minutes / plannedMinutes) * 100)).toFixed(1))
      : 0;

    let status = 'Idle - No Plan';
    if (m.production_qty > 0) status = 'Running';
    else if (m.idle_minutes > 0) status = 'Idle - Breakdown';

    return {
      machine_id: m.machine_id,
      machine_code: m.machine_code,
      parts: Array.from(m.parts).join(', ') || '—',
      operators: Array.from(m.operators).join(', ') || '—',
      shots: m.shots,
      production_qty: m.production_qty,
      ok_qty: m.ok_qty,
      efficiency_pct: eff,
      idle_minutes: m.idle_minutes,
      idle_time_str: formatMinutes(m.idle_minutes),
      reject_qty: m.reject_qty,
      part_weight_kg: Number(m.part_weight_kg.toFixed(2)),
      runner_weight_kg: Number(m.runner_weight_kg.toFixed(2)),
      reject_weight_kg: Number(m.reject_weight_kg.toFixed(2)),
      lumps_weight_kg: Number(m.lumps_weight_kg.toFixed(2)),
      run_time_minutes: Math.round(m.run_time_minutes),
      run_time_str: formatMinutes(m.run_time_minutes),
      status,
      oee_availability_pct: oeeAvail,
    };
  });

  // 7. Group by Operator for Operator Performance Leaderboard
  const opMap = {};
  for (const e of entries) {
    const uid = e.operator_user_id;
    if (!opMap[uid]) {
      opMap[uid] = {
        operator_id: uid,
        operator_name: e.operator_name,
        run_time_minutes: 0,
        production_qty: 0,
        ok_qty: 0,
        reject_qty: 0,
        efficiency_sum: 0,
        entries_count: 0,
      };
    }
    const o = opMap[uid];
    const gross = (e.end_count - e.start_count);
    o.production_qty += gross;
    o.ok_qty += Number(e.good_qty);
    o.reject_qty += Number(e.reject_qty);
    o.entries_count += 1;
    o.efficiency_sum += (Number(e.efficiency_pct) || 0);

    if (e.start_time && e.end_time) {
      o.run_time_minutes += Math.max(0, (new Date(e.end_time) - new Date(e.start_time)) / 60000);
    }
  }

  // Calculate balanced scores (equal 25% weight: run time, production qty, efficiency, quality)
  const maxRunTime = Math.max(1, ...Object.values(opMap).map((o) => o.run_time_minutes));
  const maxProdQty = Math.max(1, ...Object.values(opMap).map((o) => o.production_qty));

  const operatorPerformance = Object.values(opMap).map((o) => {
    const eff = o.entries_count ? Number((o.efficiency_sum / o.entries_count).toFixed(1)) : 0;
    const rejRate = o.production_qty > 0 ? Number(((o.reject_qty / o.production_qty) * 100).toFixed(1)) : 0;

    // 4 components of 25% each:
    const runTimeScore = Math.min(25, (o.run_time_minutes / maxRunTime) * 25);
    const prodQtyScore = Math.min(25, (o.production_qty / maxProdQty) * 25);
    const effScore = Math.min(25, (eff / 100) * 25);
    const qualScore = Math.max(0, 25 - (rejRate * 2.5)); // 0% reject = 25pts, 10% reject = 0pts

    const balancedScore = Number((runTimeScore + prodQtyScore + effScore + qualScore).toFixed(1));

    return {
      operator_id: o.operator_id,
      operator_name: o.operator_name,
      run_time_minutes: Math.round(o.run_time_minutes),
      run_time_str: formatMinutes(o.run_time_minutes),
      production_qty: o.production_qty,
      ok_qty: o.ok_qty,
      reject_qty: o.reject_qty,
      reject_rate_pct: rejRate,
      efficiency_pct: eff,
      balanced_score: balancedScore,
    };
  }).sort((a, b) => b.balanced_score - a.balanced_score);

  // Assign ranks
  operatorPerformance.forEach((op, idx) => {
    op.rank = idx + 1;
  });

  const bestOperator = operatorPerformance[0] || null;

  // 8. Rejection Pareto
  const rejMap = {};
  for (const r of rejectLogs) {
    const key = r.reason_name || 'Others';
    if (!rejMap[key]) rejMap[key] = { reason: key, code: r.reason_code || 'R', qty: 0 };
    rejMap[key].qty += Number(r.qty || 0);
  }
  const rejectionPareto = Object.values(rejMap).sort((a, b) => b.qty - a.qty);

  res.json({
    date,
    shift,
    kpis: {
      total_shots: totalShots,
      production_qty: totalProductionQty,
      ok_qty: totalOkQty,
      efficiency_pct: overallEfficiencyPct,
      idle_minutes: totalIdleMinutes,
      idle_time_str: formatMinutes(totalIdleMinutes),
      total_run_time_minutes: Math.round(totalRunTimeMinutes),
      total_run_time_str: formatMinutes(totalRunTimeMinutes),
      part_weight_kg: Number(partWeightKg.toFixed(2)),
      runner_weight_kg: Number(runnerWeightKg.toFixed(2)),
      reject_weight_kg: Number(rejectWeightKg.toFixed(2)),
      lumps_weight_kg: Number(lumpsWeightKg.toFixed(2)),
      total_material_kg: Number((partWeightKg + runnerWeightKg + rejectWeightKg + lumpsWeightKg).toFixed(2)),
      total_rejection_qty: totalRejectQty,
    },
    machine_performance: machinePerformance,
    operator_performance: operatorPerformance,
    best_operator: bestOperator,
    rejection_pareto: rejectionPareto,
  });
});

// 2. Process Daily Summary (Trimming, Inspection, Packing - Matching Screenshot 1)
router.get('/process-summary', async (req, res) => {
  const date = req.query.date || todayIST();

  // 1. Trimming Summary by Operator
  const trimRes = await pool.query(`
    SELECT u.full_name AS operator_name,
           COUNT(te.id) AS trim_count,
           COALESCE(SUM(b.qty), 0) AS trim_pieces,
           COALESCE(SUM(b.base_weight_kg - te.remaining_wt_kg), 0) AS trim_weight_kg
    FROM trim_entries te
    JOIN bags b ON b.id = te.bag_id
    JOIN users u ON u.id = te.operator_user_id
    WHERE b.entry_date = $1
    GROUP BY u.full_name
    ORDER BY trim_pieces DESC
  `, [date]);

  // 2. Inspection Summary by Operator
  const inspRes = await pool.query(`
    SELECT u.full_name AS operator_name,
           COALESCE(SUM(ie.good_qty), 0) AS accepted_pieces,
           COALESCE(SUM(ie.reject_qty), 0) AS reject_pieces,
           COALESCE(SUM(CASE WHEN b.qty > 0 THEN (ie.good_qty::numeric / b.qty) * b.base_weight_kg ELSE 0 END), 0) AS accepted_kg,
           COALESCE(SUM(CASE WHEN b.qty > 0 THEN (ie.reject_qty::numeric / b.qty) * b.base_weight_kg ELSE 0 END), 0) AS reject_kg
    FROM inspection_entries ie
    JOIN bags b ON b.id = ie.bag_id
    JOIN users u ON u.id = ie.inspector_user_id
    WHERE b.entry_date = $1
    GROUP BY u.full_name
    ORDER BY accepted_pieces DESC
  `, [date]);

  // 3. Packing Summary by Operator
  const packRes = await pool.query(`
    SELECT u.full_name AS operator_name,
           COUNT(pe.id) AS packets_packed,
           COALESCE(SUM(b.qty), 0) AS packed_qty,
           COALESCE(SUM(b.base_weight_kg), 0) AS packed_weight_kg
    FROM packing_entries pe
    JOIN bags b ON b.id = pe.bag_id
    JOIN users u ON u.id = pe.packer_user_id
    WHERE b.entry_date = $1
    GROUP BY u.full_name
    ORDER BY packed_qty DESC
  `, [date]);

  const trimmingRows = trimRes.rows.map((r) => ({
    operator: r.operator_name,
    trim_pieces: Number(r.trim_pieces),
    trim_weight_kg: Number(Number(r.trim_weight_kg).toFixed(3)),
    trim_reject_qty: 0,
    rework_times: 0,
    rework_qty_kg: 0,
  }));

  const inspectionRows = inspRes.rows.map((r) => ({
    operator: r.operator_name,
    accepted_pieces: Number(r.accepted_pieces),
    accepted_kg: Number(Number(r.accepted_kg).toFixed(3)),
    reject_pieces: Number(r.reject_pieces),
    reject_kg: Number(Number(r.reject_kg).toFixed(3)),
    rework_times: 0,
    rework_qty_kg: 0,
  }));

  const packingRows = packRes.rows.map((r) => ({
    operator: r.operator_name,
    packets_packed: Number(r.packets_packed),
    packed_qty: Number(r.packed_qty),
    packed_weight_kg: Number(Number(r.packed_weight_kg).toFixed(3)),
  }));

  const totalTrimmed = trimmingRows.reduce((sum, r) => sum + r.trim_pieces, 0);
  const totalInspected = inspectionRows.reduce((sum, r) => sum + r.accepted_pieces + r.reject_pieces, 0);
  const totalPacketsPacked = packingRows.reduce((sum, r) => sum + r.packets_packed, 0);
  const totalPackedQty = packingRows.reduce((sum, r) => sum + r.packed_qty, 0);

  const activeOperatorsSet = new Set([
    ...trimmingRows.map((r) => r.operator),
    ...inspectionRows.map((r) => r.operator),
    ...packingRows.map((r) => r.operator),
  ]);

  res.json({
    date,
    kpis: {
      trimmed_pieces: totalTrimmed,
      inspected_pieces: totalInspected,
      packets_packed: totalPacketsPacked,
      packed_qty: totalPackedQty,
      active_operators_count: activeOperatorsSet.size,
    },
    trimming: trimmingRows,
    inspection: inspectionRows,
    packing: packingRows,
  });
});

// 3. Historical Trend Summary (Matching Screenshot 3 - ALL_DATE_PRODUCTION_SUMMARY)
router.get('/trend-summary', async (req, res) => {
  const startDate = req.query.start_date || '2026-08-01';
  const endDate = req.query.end_date || todayIST();

  const { rows } = await pool.query(`
    SELECT
      pe.entry_date,
      COUNT(DISTINCT pe.machine_id) AS running_machines,
      ROUND(COUNT(DISTINCT pe.machine_id)::numeric / 10.0 * 100, 1) AS machine_utilisation_pct,
      COALESCE(SUM(pe.end_count - pe.start_count), 0) AS parts_produced,
      COALESCE(SUM(pe.good_qty), 0) AS ok_parts,
      COALESCE(SUM(pe.reject_qty), 0) AS total_rejection,
      ROUND(COALESCE(AVG(pe.efficiency_pct), 0), 1) AS overall_efficiency_pct
    FROM production_entries pe
    WHERE pe.entry_date BETWEEN $1 AND $2
    GROUP BY pe.entry_date
    ORDER BY pe.entry_date DESC
  `, [startDate, endDate]);

  // Fetch bag weights by date
  const bagWeights = await pool.query(`
    SELECT b.entry_date,
      COALESCE(SUM(CASE WHEN b.bag_type = 'PART' THEN b.base_weight_kg ELSE 0 END), 0) AS part_material_kg,
      COALESCE(SUM(CASE WHEN b.bag_type = 'RUNNER' THEN b.base_weight_kg ELSE 0 END), 0) AS runner_material_kg,
      COALESCE(SUM(CASE WHEN b.bag_type = 'REJECTION' THEN b.base_weight_kg ELSE 0 END), 0) AS reject_material_kg,
      COALESCE(SUM(CASE WHEN b.bag_type = 'LUMP' THEN b.base_weight_kg ELSE 0 END), 0) AS lumps_material_kg
    FROM bags b
    WHERE b.entry_date BETWEEN $1 AND $2 AND b.status != 'CANCELLED'
    GROUP BY b.entry_date
  `, [startDate, endDate]);

  const bagMap = {};
  for (const bw of bagWeights.rows) {
    bagMap[bw.entry_date] = bw;
  }

  const trends = rows.map((r) => {
    const bw = bagMap[r.entry_date] || {};
    const prod = Number(r.parts_produced);
    const rej = Number(r.total_rejection);
    const rejPct = prod > 0 ? Number(((rej / prod) * 100).toFixed(1)) : 0;
    const pMat = Number(Number(bw.part_material_kg || 0).toFixed(2));
    const rMat = Number(Number(bw.runner_material_kg || 0).toFixed(2));
    const rejMat = Number(Number(bw.reject_material_kg || 0).toFixed(2));
    const lMat = Number(Number(bw.lumps_material_kg || 0).toFixed(2));
    const totMat = Number((pMat + rMat + rejMat + lMat).toFixed(2));

    return {
      date: r.entry_date,
      running_machines: Number(r.running_machines),
      machine_utilisation_pct: Number(r.machine_utilisation_pct),
      parts_produced: prod,
      ok_parts: Number(r.ok_parts),
      total_rejection: rej,
      rejection_pct: rejPct,
      overall_efficiency_pct: Number(r.overall_efficiency_pct),
      mould_changes: 1, // sample indicator
      part_material_kg: pMat,
      runner_material_kg: rMat,
      reject_material_kg: rejMat,
      lumps_material_kg: lMat,
      total_material_kg: totMat,
    };
  });

  res.json(trends);
});

// 4. Raw Stage Records for Instant Excel/CSV Downloads
router.get('/stage-raw', async (req, res) => {
  const { stage, date } = req.query;
  const entryDate = date || todayIST();

  if (stage === 'production') {
    const { rows } = await pool.query(`
      SELECT pe.entry_date, pe.shift, pe.hour_slot, m.machine_code, p.shrp_part_code, p.customer_part_no, p.part_name,
             u.full_name AS operator_name, pe.start_count, pe.end_count,
             (pe.end_count - pe.start_count) AS gross_qty, pe.good_qty, pe.reject_qty,
             pe.efficiency_pct, pe.remarks, pe.created_at
      FROM production_entries pe
      JOIN machines m ON m.id = pe.machine_id
      JOIN parts p ON p.id = pe.part_id
      JOIN users u ON u.id = pe.operator_user_id
      WHERE pe.entry_date = $1
      ORDER BY m.machine_code, pe.hour_slot
    `, [entryDate]);
    return res.json(rows);
  }

  if (stage === 'bag') {
    const { rows } = await pool.query(`
      SELECT b.bag_code, b.batch_no, b.entry_date, b.shift, m.machine_code, p.shrp_part_code, p.customer_part_no,
             b.bag_type, b.qty, b.base_weight_kg, b.status, u.full_name AS created_by_name, b.created_at
      FROM bags b
      LEFT JOIN machines m ON m.id = b.machine_id
      LEFT JOIN parts p ON p.id = b.part_id
      LEFT JOIN users u ON u.id = b.created_by
      WHERE b.entry_date = $1
      ORDER BY b.created_at ASC
    `, [entryDate]);
    return res.json(rows);
  }

  if (stage === 'trimming') {
    const { rows } = await pool.query(`
      SELECT te.id, b.bag_code, b.batch_no, b.entry_date, p.shrp_part_code, p.customer_part_no,
             b.base_weight_kg AS initial_weight_kg, te.remaining_wt_kg,
             (b.base_weight_kg - te.remaining_wt_kg) AS trimmed_weight_kg,
             u.full_name AS operator_name, te.created_at
      FROM trim_entries te
      JOIN bags b ON b.id = te.bag_id
      LEFT JOIN parts p ON p.id = b.part_id
      JOIN users u ON u.id = te.operator_user_id
      WHERE b.entry_date = $1
      ORDER BY te.created_at ASC
    `, [entryDate]);
    return res.json(rows);
  }

  if (stage === 'inspection') {
    const { rows } = await pool.query(`
      SELECT ie.id, b.bag_code, b.batch_no, b.entry_date, p.shrp_part_code, p.customer_part_no,
             b.qty AS bag_qty, ie.good_qty, ie.reject_qty,
             u.full_name AS inspector_name, ie.created_at
      FROM inspection_entries ie
      JOIN bags b ON b.id = ie.bag_id
      LEFT JOIN parts p ON p.id = b.part_id
      JOIN users u ON u.id = ie.inspector_user_id
      WHERE b.entry_date = $1
      ORDER BY ie.created_at ASC
    `, [entryDate]);
    return res.json(rows);
  }

  if (stage === 'packing') {
    const { rows } = await pool.query(`
      SELECT pe.id, b.bag_code, b.batch_no, b.entry_date, p.shrp_part_code, p.customer_part_no,
             b.qty AS packed_qty, b.base_weight_kg AS packed_weight_kg,
             u.full_name AS packer_name, pe.created_at
      FROM packing_entries pe
      JOIN bags b ON b.id = pe.bag_id
      LEFT JOIN parts p ON p.id = b.part_id
      JOIN users u ON u.id = pe.packer_user_id
      WHERE b.entry_date = $1
      ORDER BY pe.created_at ASC
    `, [entryDate]);
    return res.json(rows);
  }

  if (stage === 'dispatch') {
    const { rows } = await pool.query(`
      SELECT de.id, b.bag_code, b.batch_no, b.entry_date, p.shrp_part_code, p.customer_part_no,
             b.qty AS dispatch_qty, b.base_weight_kg AS dispatch_weight_kg,
             de.dc_reference, de.vehicle_number, de.customer_name,
             u.full_name AS dispatcher_name, de.created_at
      FROM dispatch_entries de
      JOIN bags b ON b.id = de.bag_id
      LEFT JOIN parts p ON p.id = b.part_id
      JOIN users u ON u.id = de.dispatched_by
      WHERE b.entry_date = $1
      ORDER BY de.created_at ASC
    `, [entryDate]);
    return res.json(rows);
  }

  res.status(400).json({ error: 'Invalid stage parameter' });
});

module.exports = router;
