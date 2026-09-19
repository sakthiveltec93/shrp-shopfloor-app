const pool = require('../pool');

/**
 * Supervisor Dashboard Database Queries
 */
async function getSupervisorDataFromDb(dateStr, shiftStr) {
  const targetDate = dateStr || new Date().toISOString().slice(0, 10);
  const targetShift = shiftStr || 'A';

  // 1. Production entries for the specified date and shift
  const entriesRes = await pool.query(
    `SELECT 
       pe.id, pe.machine_id, m.machine_code,
       pe.part_id, p.part_code, p.shrp_part_code, p.part_name, p.customer_part_no,
       p.cavity_count, p.standard_cycle_time_sec, p.unit_weight_g, p.part_weight_g,
       pe.operator_user_id, u.full_name AS operator_name,
       pe.shift, pe.entry_date, pe.hour_slot,
       pe.start_count, pe.end_count,
       (pe.end_count - pe.start_count) AS shots,
       pe.good_qty, pe.reject_qty,
       pe.downtime_minutes, pe.downtime_reason_id, pe.remarks,
       pe.efficiency_pct, pe.target_qty,
       ci.item_name AS downtime_reason_name
     FROM production_entries pe
     JOIN machines m ON m.id = pe.machine_id
     JOIN parts p ON p.id = pe.part_id
     LEFT JOIN users u ON u.id = pe.operator_user_id
     LEFT JOIN check_items ci ON ci.id = pe.downtime_reason_id
     WHERE pe.entry_date = $1 AND pe.shift = $2
     ORDER BY pe.hour_slot ASC, pe.id ASC`,
    [targetDate, targetShift]
  );

  // 2. Active machines and their current assignments
  const machinesRes = await pool.query(
    `SELECT 
       m.id AS machine_id, m.machine_code, m.tonnage, m.active AS machine_active,
       ma.id AS assignment_id, ma.part_id, p.part_code, p.shrp_part_code, p.part_name,
       p.customer_part_no, p.cavity_count, p.standard_cycle_time_sec,
       ma.mould_id, mo.mould_code, mo.mould_name,
       ma.status AS assignment_status, ma.approved_at, ma.mould_load_started_at, ma.first_ok_part_at,
       ma.reason, ma.reason_id,
       fpa.id AS fpa_submission_id, fpa.approval_status AS fpa_approval_status,
       ms.id AS active_session_id, ms.operator_user_id, u_op.full_name AS current_operator_name
     FROM machines m
     LEFT JOIN LATERAL (
       SELECT * FROM machine_assignments
       WHERE machine_id = m.id AND status = 'approved'
       ORDER BY approved_at DESC LIMIT 1
     ) ma ON true
     LEFT JOIN parts p ON p.id = ma.part_id
     LEFT JOIN moulds mo ON mo.id = ma.mould_id
     LEFT JOIN LATERAL (
       SELECT id, approval_status FROM fpa_submissions
       WHERE assignment_id = ma.id
       ORDER BY created_at DESC LIMIT 1
     ) fpa ON true
     LEFT JOIN LATERAL (
       SELECT id, operator_user_id FROM machine_sessions
       WHERE machine_id = m.id AND status = 'RUNNING'
       ORDER BY start_time DESC LIMIT 1
     ) ms ON true
     LEFT JOIN users u_op ON u_op.id = ms.operator_user_id
     ORDER BY m.machine_code ASC`
  );

  // 3. Pending FPA approvals / Action Items
  const pendingFpaRes = await pool.query(
    `SELECT 
       f.id AS fpa_id, f.assignment_id, f.machine_id, m.machine_code,
       f.part_id, p.part_code, p.shrp_part_code, p.part_name,
       f.approval_status, f.created_at, f.visual_approved_at,
       EXTRACT(EPOCH FROM (now() - f.created_at)) / 60.0 AS pending_minutes,
       COALESCE(u_tech.full_name, u_qi.full_name) AS submitted_by_name
     FROM fpa_submissions f
     JOIN machines m ON m.id = f.machine_id
     JOIN parts p ON p.id = f.part_id
     LEFT JOIN users u_tech ON u_tech.id = f.technician_user_id
     LEFT JOIN users u_qi ON u_qi.id = f.quality_inspector_user_id
     WHERE f.approval_status IN ('PENDING', 'VISUAL_APPROVED')
     ORDER BY f.created_at ASC`
  );

  // 4. Raw Material Stock Alerts (Materials near or below minimum stock threshold)
  const materialAlertsRes = await pool.query(
    `SELECT 
       rm.id, rm.material_code, rm.material_name, rm.category,
       COALESCE(SUM(sr.current_stock_kg), 0) AS total_stock_kg,
       COALESCE(rm.min_stock_kg, 300) AS min_stock_kg,
       CASE 
         WHEN COALESCE(SUM(sr.current_stock_kg), 0) <= COALESCE(rm.min_stock_kg, 300) * 0.5 THEN 'CRITICAL'
         WHEN COALESCE(SUM(sr.current_stock_kg), 0) <= COALESCE(rm.min_stock_kg, 300) THEN 'WARNING'
         ELSE 'OK'
       END AS stock_status
     FROM raw_materials rm
     LEFT JOIN rm_stock_register sr ON sr.material_id = rm.id
     WHERE rm.active = true
     GROUP BY rm.id, rm.material_code, rm.material_name, rm.category, rm.min_stock_kg
     ORDER BY total_stock_kg ASC`
  );

  // 5. Dispatch Queue / Bag Inventory Staging Counts
  const dispatchQueueRes = await pool.query(
    `SELECT 
       status,
       COUNT(id) AS bag_count,
       COALESCE(SUM(qty), 0) AS total_qty
     FROM bags
     GROUP BY status`
  );

  // 6. Recent Mould Change Audit Records
  const mouldChangesRes = await pool.query(
    `SELECT 
       ma.id AS assignment_id, ma.machine_id, m.machine_code,
       ma.part_id, p.part_code, p.shrp_part_code, p.part_name,
       ma.previous_part_id, prev_p.part_code AS previous_part_code, prev_p.shrp_part_code AS previous_shrp_part_code,
       ma.reason, COALESCE(ci.item_name, ma.reason) AS reason_name,
       ma.set_at, ma.mould_load_started_at, ma.approved_at,
       u_set.full_name AS changed_by_name
     FROM machine_assignments ma
     JOIN machines m ON m.id = ma.machine_id
     JOIN parts p ON p.id = ma.part_id
     LEFT JOIN parts prev_p ON prev_p.id = ma.previous_part_id
     LEFT JOIN check_items ci ON ci.id = ma.reason_id
     LEFT JOIN users u_set ON u_set.id = ma.set_by_user_id
     ORDER BY COALESCE(ma.mould_load_started_at, ma.set_at) DESC
     LIMIT 8`
  );

  return {
    entries: entriesRes.rows,
    machines: machinesRes.rows,
    pendingFpa: pendingFpaRes.rows,
    materialAlerts: materialAlertsRes.rows,
    dispatchQueue: dispatchQueueRes.rows,
    mouldChanges: mouldChangesRes.rows,
  };
}

/**
 * Management Dashboard Database Queries
 */
async function getManagementDataFromDb(startDateStr, endDateStr) {
  // 1. Production entries in the specified date range
  const entriesRes = await pool.query(
    `SELECT 
       pe.id, pe.machine_id, m.machine_code,
       pe.part_id, p.part_code, p.shrp_part_code, p.part_name, p.customer_part_no,
       p.cavity_count, p.standard_cycle_time_sec, p.unit_weight_g, p.part_weight_g,
       pe.operator_user_id, u.full_name AS operator_name,
       pe.shift, pe.entry_date, pe.hour_slot,
       pe.start_count, pe.end_count,
       (pe.end_count - pe.start_count) AS shots,
       pe.good_qty, pe.reject_qty,
       pe.downtime_minutes, pe.downtime_reason_id,
       pe.efficiency_pct, pe.target_qty,
       COALESCE(pe.period_start_at, pe.start_time, pe.created_at) AS start_ts,
       COALESCE(pe.period_end_at, pe.end_time, pe.created_at) AS end_ts,
       EXTRACT(EPOCH FROM (COALESCE(pe.period_end_at, pe.end_time, pe.created_at) - COALESCE(pe.period_start_at, pe.start_time, pe.created_at))) / 3600.0 AS duration_hrs
     FROM production_entries pe
     JOIN machines m ON m.id = pe.machine_id
     JOIN parts p ON p.id = pe.part_id
     LEFT JOIN users u ON u.id = pe.operator_user_id
     WHERE pe.entry_date >= $1 AND pe.entry_date <= $2
     ORDER BY pe.entry_date ASC, pe.id ASC`,
    [startDateStr, endDateStr]
  );

  // 2. Customer-wise Plan vs Actual from Master Production Schedules
  const mpsRes = await pool.query(
    `SELECT 
       mps.id, mps.customer_id, c.name AS customer_name,
       mps.part_id, p.part_code, p.shrp_part_code, p.part_name,
       mps.schedule_month, mps.gross_demand, mps.receipts_target
     FROM master_production_schedules mps
     JOIN customers c ON c.id = mps.customer_id
     JOIN parts p ON p.id = mps.part_id
     ORDER BY c.name ASC`
  );

  // 3. Mould Life & Preventive Maintenance Status
  const mouldsRes = await pool.query(
    `SELECT 
       m.id, m.mould_code, m.mould_name, m.ownership, m.customer_name,
       m.total_cavities, m.active_cavities,
       COALESCE(m.cumulative_shots, 0) AS cumulative_shots,
       COALESCE(m.shots_since_pm, 0) AS shots_since_pm,
       COALESCE(m.pm_interval_shots, 100000) AS pm_interval_shots,
       COALESCE(m.total_rated_life_shots, 500000) AS total_rated_life_shots,
       m.status
     FROM moulds m
     ORDER BY (COALESCE(m.shots_since_pm, 0)::float / NULLIF(COALESCE(m.pm_interval_shots, 100000), 0)) DESC
     LIMIT 15`
  );

  // 4. Trimming & Finishing Operator Performance
  const trimRes = await pool.query(
    `SELECT 
       te.operator_user_id, u.full_name AS operator_name,
       COUNT(te.id) AS logs_count,
       COALESCE(SUM(te.good_qty), 0) AS total_trimmed_qty,
       COALESCE(SUM(te.reject_qty), 0) AS total_reject_qty
     FROM trim_entries te
     LEFT JOIN users u ON u.id = te.operator_user_id
     WHERE te.entry_date >= $1 AND te.entry_date <= $2
     GROUP BY te.operator_user_id, u.full_name
     ORDER BY total_trimmed_qty DESC
     LIMIT 5`,
    [startDateStr, endDateStr]
  ).catch(() => ({ rows: [] }));

  return {
    entries: entriesRes.rows,
    mps: mpsRes.rows,
    moulds: mouldsRes.rows,
    trimming: trimRes.rows,
  };
}

module.exports = {
  getSupervisorDataFromDb,
  getManagementDataFromDb,
};
