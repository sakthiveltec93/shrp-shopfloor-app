const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { notifyUser, notifyRoles } = require('../lib/notify');

const router = express.Router();
router.use(requireAuth);

// Current approved part assignment for every machine - this is what
// Production Entry reads. It never writes here.
router.get('/current', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT DISTINCT ON (ma.machine_id)
      ma.id AS assignment_id, ma.machine_id, m.machine_code, ma.part_id,
      p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no,
      p.cavity_count, p.standard_cycle_time_sec, p.unit_weight_g, p.part_weight_g,
      ma.mould_id, mo.mould_code, mo.mould_name,
      ma.reason, ma.reason_id, ci.item_name AS reason_name,
      ma.last_shot_count, ma.previous_part_id,
      ma.status, ma.approved_at, ma.mould_load_started_at, ma.first_ok_part_at,
      fpa.id AS fpa_submission_id, fpa.approval_status AS fpa_approval_status,
      (SELECT pf.id FROM part_files pf WHERE pf.part_id = p.id AND pf.file_type = 'photo' ORDER BY pf.uploaded_at DESC LIMIT 1) AS photo_file_id
    FROM machine_assignments ma
    JOIN machines m ON m.id = ma.machine_id
    JOIN parts p ON p.id = ma.part_id
    LEFT JOIN moulds mo ON mo.id = ma.mould_id
    LEFT JOIN check_items ci ON ci.id = ma.reason_id
    LEFT JOIN LATERAL (
      SELECT id, approval_status
      FROM fpa_submissions
      WHERE assignment_id = ma.id
      ORDER BY created_at DESC LIMIT 1
    ) fpa ON true
    WHERE ma.status = 'approved' AND m.category = 'PRODUCTION'
    ORDER BY ma.machine_id, ma.approved_at DESC
  `);
  res.json(rows);
});

async function closePreviousCampaignRun(machineId, newLoadedAt, changeReason) {
  try {
    const prev = await pool.query(
      `SELECT ma.*, p.cavity_count, p.standard_cycle_time_sec 
       FROM machine_assignments ma
       JOIN parts p ON p.id = ma.part_id
       WHERE ma.machine_id = $1 AND ma.status = 'approved'
       ORDER BY ma.approved_at DESC LIMIT 1`,
      [machineId]
    );
    const prevAssignment = prev.rows[0];
    if (!prevAssignment) return;

    const startAt = prevAssignment.mould_load_started_at || prevAssignment.approved_at || prevAssignment.set_at;
    const endAt = newLoadedAt || new Date();

    const agg = await pool.query(
      `SELECT 
         COUNT(*) as entry_count,
         COALESCE(SUM(end_count - start_count), 0) as total_shots,
         COALESCE(SUM(good_qty), 0) as total_good,
         COALESCE(SUM(reject_qty), 0) as total_rej,
         COALESCE(SUM(downtime_minutes), 0) as total_idle,
         COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(period_end_at, end_time, created_at) - COALESCE(period_start_at, start_time, created_at))) / 3600.0), 0) as duration_hrs
       FROM production_entries
       WHERE machine_id = $1 AND part_id = $2
         AND COALESCE(period_start_at, start_time, created_at) >= $3
         AND COALESCE(period_end_at, end_time, created_at) <= $4`,
      [machineId, prevAssignment.part_id, startAt, endAt]
    );

    const r = agg.rows[0] || {};
    const totalShots = Number(r.total_shots) || 0;
    const totalRejectQty = Number(r.total_rej) || 0;
    const totalNetQty = Number(r.total_good) || 0;
    const totalProdQty = totalNetQty + totalRejectQty;
    let grossRunHours = Number(Number(r.duration_hrs || r.entry_count || 0).toFixed(2));
    const totalIdleMin = Number(r.total_idle) || 0;
    const netRunHours = Number(Math.max(0, grossRunHours - (totalIdleMin / 60)).toFixed(2));

    let overallEff = 0;
    if (prevAssignment.standard_cycle_time_sec > 0 && netRunHours > 0) {
      const targetShots = (netRunHours * 3600) / prevAssignment.standard_cycle_time_sec;
      if (targetShots > 0) {
        overallEff = Number(((totalShots / targetShots) * 100).toFixed(1));
      }
    }

    const existing = await pool.query(
      `SELECT id FROM mould_campaign_history WHERE assignment_id = $1`,
      [prevAssignment.id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE mould_campaign_history
         SET unloaded_at = $1, total_shots = $2, total_prod_qty = $3, total_reject_qty = $4,
             total_net_qty = $5, gross_run_hours = $6, total_idle_min = $7, net_run_hours = $8,
             overall_efficiency_pct = $9, reason = COALESCE($10, reason), updated_at = now()
         WHERE id = $11`,
        [
          endAt, totalShots, totalProdQty, totalRejectQty, totalNetQty,
          grossRunHours, totalIdleMin, netRunHours, overallEff, changeReason,
          existing.rows[0].id
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO mould_campaign_history (
           machine_id, part_id, mould_id, assignment_id, loaded_at, unloaded_at,
           total_shots, total_prod_qty, total_reject_qty, total_net_qty,
           gross_run_hours, total_idle_min, net_run_hours, overall_efficiency_pct,
           reason, is_historical
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, false)`,
        [
          machineId, prevAssignment.part_id, prevAssignment.mould_id || null, prevAssignment.id,
          startAt, endAt, totalShots, totalProdQty, totalRejectQty, totalNetQty,
          grossRunHours, totalIdleMin, netRunHours, overallEff,
          changeReason || prevAssignment.reason || 'Plan Completed'
    }

    // Auto-close any active machine session on this machine from the old mould run
    await pool.query(
      `UPDATE machine_sessions
       SET status = 'OFF',
           off_time = $1,
           off_count = COALESCE($2, (SELECT end_count FROM production_entries WHERE session_id = machine_sessions.id ORDER BY end_count DESC LIMIT 1), start_count),
           off_reason = 'mould_change',
           off_remarks = 'Closed due to mould change'
       WHERE machine_id = $3 AND status = 'RUNNING'`,
      [endAt, prevAssignment.last_shot_count || (totalShots > 0 ? totalShots : null), machineId]
    );
  } catch (err) {
    console.error('Error closing previous campaign run:', err);
  }
}

// Combined campaign performance history: historical records + closed runs + live active runs
router.get('/campaign-performance', async (req, res) => {
  const { machine_id, limit = 100 } = req.query;

  // 1. Fetch closed / historical campaign records
  let histQuery = `
    SELECT 
      mch.id,
      mch.machine_id,
      m.machine_code,
      mch.part_id,
      p.part_code,
      p.part_name,
      p.shrp_part_code,
      p.customer_part_no,
      p.cavity_count,
      p.standard_cycle_time_sec,
      mch.mould_id,
      mo.mould_code,
      mo.mould_name,
      mch.assignment_id,
      mch.loaded_at,
      mch.unloaded_at,
      mch.total_shots,
      mch.total_prod_qty,
      mch.total_reject_qty,
      mch.total_net_qty,
      mch.gross_run_hours,
      mch.total_idle_min,
      mch.net_run_hours,
      mch.overall_efficiency_pct,
      mch.reason,
      mch.is_historical,
      false AS is_active
    FROM mould_campaign_history mch
    JOIN machines m ON m.id = mch.machine_id
    JOIN parts p ON p.id = mch.part_id
    LEFT JOIN moulds mo ON mo.id = mch.mould_id
    WHERE 1=1
  `;
  const histParams = [];
  if (machine_id && machine_id !== 'ALL') {
    histParams.push(machine_id);
    histQuery += ` AND mch.machine_id = $${histParams.length}`;
  }
  histQuery += ` ORDER BY mch.loaded_at DESC LIMIT $${histParams.length + 1}`;
  histParams.push(Number(limit) || 100);

  const { rows: historyRows } = await pool.query(histQuery, histParams);

  // 2. Fetch currently active assignments to calculate live metrics
  let activeQuery = `
    SELECT DISTINCT ON (ma.machine_id)
      ma.id AS assignment_id,
      ma.machine_id,
      m.machine_code,
      ma.part_id,
      p.part_code,
      p.part_name,
      p.shrp_part_code,
      p.customer_part_no,
      p.cavity_count,
      p.standard_cycle_time_sec,
      ma.mould_id,
      mo.mould_code,
      mo.mould_name,
      COALESCE(ma.mould_load_started_at, ma.approved_at, ma.set_at) AS loaded_at,
      ma.reason
    FROM machine_assignments ma
    JOIN machines m ON m.id = ma.machine_id
    JOIN parts p ON p.id = ma.part_id
    LEFT JOIN moulds mo ON mo.id = ma.mould_id
    WHERE ma.status = 'approved'
  `;
  const activeParams = [];
  if (machine_id && machine_id !== 'ALL') {
    activeParams.push(machine_id);
    activeQuery += ` AND ma.machine_id = $${activeParams.length}`;
  }
  activeQuery += ` ORDER BY ma.machine_id, ma.approved_at DESC`;

  const { rows: activeAssignments } = await pool.query(activeQuery, activeParams);

  // Compute real-time stats for each active assignment
  const activeRows = await Promise.all(activeAssignments.map(async (act) => {
    const agg = await pool.query(
      `SELECT 
         COUNT(*) as entry_count,
         COALESCE(SUM(end_count - start_count), 0) as total_shots,
         COALESCE(SUM(good_qty), 0) as total_good,
         COALESCE(SUM(reject_qty), 0) as total_rej,
         COALESCE(SUM(downtime_minutes), 0) as total_idle,
         COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(period_end_at, end_time, created_at) - COALESCE(period_start_at, start_time, created_at))) / 3600.0), 0) as duration_hrs
       FROM production_entries
       WHERE machine_id = $1 AND part_id = $2
         AND COALESCE(period_start_at, start_time, created_at) >= $3`,
      [act.machine_id, act.part_id, act.loaded_at]
    );
    const r = agg.rows[0] || {};
    const totalShots = Number(r.total_shots) || 0;
    const totalRejectQty = Number(r.total_rej) || 0;
    const totalNetQty = Number(r.total_good) || 0;
    const totalProdQty = totalNetQty + totalRejectQty;
    const grossRunHours = Number(Number(r.duration_hrs || r.entry_count || 0).toFixed(2));
    const totalIdleMin = Number(r.total_idle) || 0;
    const netRunHours = Number(Math.max(0, grossRunHours - (totalIdleMin / 60)).toFixed(2));

    let overallEff = 0;
    if (act.standard_cycle_time_sec > 0 && netRunHours > 0) {
      const targetShots = (netRunHours * 3600) / act.standard_cycle_time_sec;
      if (targetShots > 0) {
        overallEff = Number(((totalShots / targetShots) * 100).toFixed(1));
      }
    }

    return {
      id: `active-${act.assignment_id}`,
      machine_id: act.machine_id,
      machine_code: act.machine_code,
      part_id: act.part_id,
      part_code: act.part_code,
      part_name: act.part_name,
      shrp_part_code: act.shrp_part_code,
      customer_part_no: act.customer_part_no,
      cavity_count: act.cavity_count,
      standard_cycle_time_sec: act.standard_cycle_time_sec,
      mould_id: act.mould_id,
      mould_code: act.mould_code,
      mould_name: act.mould_name,
      assignment_id: act.assignment_id,
      loaded_at: act.loaded_at,
      unloaded_at: null,
      total_shots: totalShots,
      total_prod_qty: totalProdQty,
      total_reject_qty: totalRejectQty,
      total_net_qty: totalNetQty,
      gross_run_hours: grossRunHours,
      total_idle_min: totalIdleMin,
      net_run_hours: netRunHours,
      overall_efficiency_pct: overallEff,
      reason: act.reason || 'Active Mould Run',
      is_historical: false,
      is_active: true,
    };
  }));

  // Combine active and history
  const combined = [...activeRows, ...historyRows];
  res.json(combined);
});

// Complete historical audit trail of mould changes and assignments
router.get('/history', async (req, res) => {
  const { machine_id, limit = 100 } = req.query;
  let query = `
    SELECT 
      ma.id AS assignment_id,
      ma.machine_id,
      m.machine_code,
      ma.part_id,
      p.part_code,
      p.part_name,
      p.shrp_part_code,
      p.customer_part_no,
      ma.previous_part_id,
      prev_p.part_code AS previous_part_code,
      prev_p.shrp_part_code AS previous_shrp_part_code,
      prev_p.part_name AS previous_part_name,
      ma.mould_id,
      mo.mould_code,
      mo.mould_name,
      ma.reason,
      ma.reason_id,
      COALESCE(ci.item_name, ma.reason) AS reason_name,
      ma.last_shot_count,
      ma.notes,
      ma.status,
      ma.set_at,
      ma.mould_load_started_at,
      ma.approved_at,
      ma.first_ok_part_at,
      u_set.full_name AS set_by_name,
      u_app.full_name AS approved_by_name,
      fpa.id AS fpa_submission_id,
      fpa.approval_status AS fpa_approval_status,
      fpa.visual_approved_at,
      fpa.approved_at AS fpa_approved_at,
      u_vis.full_name AS visual_approved_by_name,
      u_qa.full_name AS fpa_approved_by_name
    FROM machine_assignments ma
    JOIN machines m ON m.id = ma.machine_id
    JOIN parts p ON p.id = ma.part_id
    LEFT JOIN parts prev_p ON prev_p.id = ma.previous_part_id
    LEFT JOIN moulds mo ON mo.id = ma.mould_id
    LEFT JOIN check_items ci ON ci.id = ma.reason_id
    LEFT JOIN users u_set ON u_set.id = ma.set_by_user_id
    LEFT JOIN users u_app ON u_app.id = ma.approved_by_user_id
    LEFT JOIN LATERAL (
      SELECT 
        f.id, f.approval_status, f.visual_approved_at, f.approved_at,
        f.visual_approved_by_user_id, f.quality_inspector_user_id, f.supervisor_user_id
      FROM fpa_submissions f
      WHERE f.assignment_id = ma.id
      ORDER BY f.created_at DESC
      LIMIT 1
    ) fpa ON true
    LEFT JOIN users u_vis ON u_vis.id = fpa.visual_approved_by_user_id
    LEFT JOIN users u_qa ON u_qa.id = COALESCE(fpa.quality_inspector_user_id, fpa.supervisor_user_id)
    WHERE m.category = 'PRODUCTION'
  `;
  const params = [];
  if (machine_id) {
    params.push(machine_id);
    query += ` AND ma.machine_id = $${params.length}`;
  }
  query += ` ORDER BY COALESCE(ma.mould_load_started_at, ma.approved_at, ma.set_at) DESC LIMIT $${params.length + 1}`;
  params.push(Number(limit) || 100);

  const { rows } = await pool.query(query, params);
  res.json(rows);
});

// Pending assignments awaiting supervisor/admin approval
router.get('/pending', requireRole('supervisor', 'admin'), async (req, res) => {
  const { rows } = await pool.query(`
    SELECT ma.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no, u.full_name AS set_by_name,
           COALESCE(ci.item_name, ma.reason) AS reason_name
    FROM machine_assignments ma
    JOIN machines m ON m.id = ma.machine_id
    JOIN parts p ON p.id = ma.part_id
    JOIN users u ON u.id = ma.set_by_user_id
    LEFT JOIN check_items ci ON ci.id = ma.reason_id
    WHERE ma.status = 'pending' AND m.category = 'PRODUCTION'
    ORDER BY ma.set_at DESC
  `);
  res.json(rows);
});

// Set up a new mould/part on a machine -> goes to pending or direct approved.
// Records when mould loading actually started, reason, previous part & shot count.
router.post('/', requireRole('operator', 'supervisor', 'admin'), async (req, res) => {
  const {
    machine_id, part_id, notes, mould_load_started_at,
    reason, reason_id, previous_part_id, last_shot_count,
    approved_at, direct_approve
  } = req.body;
  if (!machine_id || !part_id) {
    return res.status(400).json({ error: 'machine_id and part_id are required' });
  }

  // Ensure target machine is a PRODUCTION machine
  const machCheck = await pool.query('SELECT id, machine_code, category FROM machines WHERE id = $1', [machine_id]);
  if (!machCheck.rows[0]) return res.status(404).json({ error: 'Machine not found' });
  if (machCheck.rows[0].category !== 'PRODUCTION') {
    return res.status(400).json({ error: 'Mould setup can only be performed on PRODUCTION machines' });
  }

  // Hard Gate: Block requesting a new assignment if current active assignment on machine has incomplete Full FPA
  const currentAssignment = await pool.query(
    `SELECT ma.id FROM machine_assignments ma
     WHERE ma.machine_id = $1 AND ma.status = 'approved'
     ORDER BY ma.approved_at DESC LIMIT 1`,
    [machine_id]
  );
  if (currentAssignment.rows[0]) {
    const fpaCheck = await pool.query(
      `SELECT id, approval_status FROM fpa_submissions
       WHERE assignment_id = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [currentAssignment.rows[0].id]
    );
    if (fpaCheck.rows[0]?.approval_status === 'VISUAL_APPROVED') {
      return res.status(403).json({
        error: 'Full FPA approval required for the current setup before changing mould/part on this machine.',
        code: 'full_fpa_required_for_mould_change',
        fpa_id: fpaCheck.rows[0].id
      });
    }
  }

  // Auto-resolve previous part & last shot count if not supplied
  let prevPartId = previous_part_id || null;
  let finalLastShotCount = last_shot_count || null;
  if (!prevPartId) {
    const lastActive = await pool.query(
      `SELECT part_id FROM machine_assignments WHERE machine_id = $1 AND status = 'approved' ORDER BY approved_at DESC LIMIT 1`,
      [machine_id]
    );
    prevPartId = lastActive.rows[0]?.part_id || null;
  }
  if (!finalLastShotCount && prevPartId) {
    const lastEntry = await pool.query(
      `SELECT end_count FROM production_entries WHERE machine_id = $1 AND part_id = $2 ORDER BY COALESCE(period_end_at, end_time, created_at) DESC LIMIT 1`,
      [machine_id, prevPartId]
    );
    finalLastShotCount = lastEntry.rows[0]?.end_count || null;
  }

  const isSupervisorOrAdmin = ['supervisor', 'admin'].includes(req.user.role);
  const autoApprove = isSupervisorOrAdmin && (direct_approve === true || approved_at != null);

  const { rows } = await pool.query(
    `INSERT INTO machine_assignments (
       machine_id, part_id, set_by_user_id, notes, mould_load_started_at,
       reason, reason_id, last_shot_count, previous_part_id,
       status, approved_by_user_id, approved_at
     )
     VALUES ($1, $2, $3, $4, COALESCE($5, now()), $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      machine_id,
      part_id,
      req.user.id,
      notes || null,
      mould_load_started_at || null,
      reason || null,
      reason_id || null,
      finalLastShotCount != null ? Number(finalLastShotCount) : null,
      prevPartId,
      autoApprove ? 'approved' : 'pending',
      autoApprove ? req.user.id : null,
      autoApprove ? (approved_at ? new Date(approved_at) : new Date()) : null
    ]
  );
  const assignment = rows[0];

  const [machine, part] = await Promise.all([
    pool.query('SELECT machine_code FROM machines WHERE id = $1', [machine_id]),
    pool.query('SELECT part_code FROM parts WHERE id = $1', [part_id]),
  ]);

  if (autoApprove) {
    await closePreviousCampaignRun(
      machine_id,
      mould_load_started_at || (approved_at ? new Date(approved_at) : new Date()),
      reason || 'Mould Change'
    );
  } else {
    await notifyRoles(
      ['supervisor', 'admin'],
      'mould_setup_pending',
      `New mould setup: ${machine.rows[0]?.machine_code} -> ${part.rows[0]?.part_code} (by ${req.user.full_name}). Reason: ${reason || 'Mould Change'}. Needs approval.`,
      '/approvals'
    );
  }

  res.status(201).json(assignment);
});

// Approve or reject a pending assignment - supervisor/admin only.
// Accepts optional backdated approved_at timestamp.
router.post('/:id/decision', requireRole('supervisor', 'admin'), async (req, res) => {
  const { id } = req.params;
  const { decision, approved_at } = req.body; // 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: "decision must be 'approved' or 'rejected'" });
  }
  const appDate = decision === 'approved' ? (approved_at ? new Date(approved_at) : new Date()) : null;
  const { rows } = await pool.query(
    `UPDATE machine_assignments
     SET status = $1, approved_by_user_id = $2, approved_at = $3
     WHERE id = $4 AND status = 'pending' RETURNING *`,
    [decision, req.user.id, appDate, id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Pending assignment not found' });
  const assignment = rows[0];

  const info = await pool.query(
    `SELECT m.machine_code, p.part_code FROM machine_assignments ma
     JOIN machines m ON m.id = ma.machine_id
     JOIN parts p ON p.id = ma.part_id
     WHERE ma.id = $1`,
    [id]
  );
  const { machine_code, part_code } = info.rows[0] || {};
  if (decision === 'approved') {
    await closePreviousCampaignRun(
      assignment.machine_id,
      assignment.mould_load_started_at || appDate || new Date(),
      assignment.reason || 'Mould Change'
    );
    await notifyUser(
      assignment.set_by_user_id,
      'mould_setup_approved',
      `Your mould setup for ${machine_code} (${part_code}) was approved. Mark 1st OK part when ready.`,
      '/mould-setup'
    );
  } else {
    await notifyUser(
      assignment.set_by_user_id,
      'mould_setup_rejected',
      `Your mould setup for ${machine_code} (${part_code}) was rejected.`,
      '/mould-setup'
    );
  }

  res.json(assignment);
});

// Mark the moment the first OK (good) part was taken off this assignment -
// this becomes the machine's start time for efficiency calculations.
// Accepts an explicit taken_at so it can be backdated when the operator
// forgets to mark it in real time. Once set, only a supervisor/admin can
// correct it (operators get one shot; mistakes go through a supervisor).
router.post('/:id/first-ok-part', async (req, res) => {
  const { id } = req.params;
  const { taken_at } = req.body;

  const existing = await pool.query(
    `SELECT * FROM machine_assignments WHERE id = $1 AND status = 'approved'`,
    [id]
  );
  const assignment = existing.rows[0];
  if (!assignment) return res.status(404).json({ error: 'Approved assignment not found' });

  // If first_ok_part_at is not set yet, ensure FPA submission has been approved (Visual or Full)
  if (!assignment.first_ok_part_at) {
    const fpaCheck = await pool.query(
      `SELECT id, approval_status FROM fpa_submissions WHERE assignment_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [id]
    );
    if (!fpaCheck.rows[0] || !['APPROVED', 'CONDITIONAL', 'VISUAL_APPROVED'].includes(fpaCheck.rows[0].approval_status)) {
      return res.status(403).json({
        error: 'IATF 16949 Clause 8.5.1.1: First-Piece Approval (Visual or Full) must be APPROVED before marking 1st OK Part.',
        code: 'fpa_required',
      });
    }
  } else if (!['supervisor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: '1st OK part time is already set. Ask a supervisor to correct it.' });
  }

  const okTime = taken_at ? new Date(taken_at) : new Date();

  const { rows } = await pool.query(
    `UPDATE machine_assignments
     SET first_ok_part_at = $1
     WHERE id = $2 AND status = 'approved'
     RETURNING *`,
    [okTime, id]
  );
  const updatedAssign = rows[0];

  // Sync running session on this machine for this part
  const sessCheck = await pool.query(
    `SELECT id, (SELECT count(*)::int FROM production_entries WHERE session_id = machine_sessions.id) AS entry_count
     FROM machine_sessions
     WHERE machine_id = $1 AND part_id = $2 AND status = 'RUNNING'`,
    [updatedAssign.machine_id, updatedAssign.part_id]
  );
  if (sessCheck.rows.length > 0) {
    if (sessCheck.rows[0].entry_count === 0) {
      await pool.query(
        `UPDATE machine_sessions SET start_time = $1, start_count = 0 WHERE id = $2`,
        [okTime, sessCheck.rows[0].id]
      );
    }
  }

  res.json(updatedAssign);
});

module.exports = router;
