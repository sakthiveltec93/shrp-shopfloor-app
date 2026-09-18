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
    WHERE ma.status = 'approved'
    ORDER BY ma.machine_id, ma.approved_at DESC
  `);
  res.json(rows);
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
    WHERE 1=1
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
    WHERE ma.status = 'pending'
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

  if (!autoApprove) {
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

  const { rows } = await pool.query(
    `UPDATE machine_assignments
     SET first_ok_part_at = COALESCE($1, now())
     WHERE id = $2 AND status = 'approved'
     RETURNING *`,
    [taken_at || null, id]
  );
  res.json(rows[0]);
});

module.exports = router;
