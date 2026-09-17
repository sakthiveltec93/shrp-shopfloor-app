const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Most recent 50 notifications for the logged-in user, plus an unread count
// for a badge. Read status is per-user, so nobody sees anyone else's.
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [req.user.id]
  );
  const unread_count = rows.filter((r) => !r.read_at).length;
  res.json({ notifications: rows, unread_count });
});

// Comprehensive Shopfloor Alerts endpoint (FPA, Mould PM, Regrind Deviations, Deletions, Setup Approvals)
router.get('/alerts', async (req, res) => {
  try {
    const role = req.user.role;

    // 1. Pending FPAs (First Piece Approvals)
    let pendingFpa = [];
    try {
      const fpaRes = await pool.query(`
        SELECT 
          f.id AS fpa_id,
          f.assignment_id,
          f.approval_status,
          f.submitted_at,
          f.regrind_pct,
          f.regrind_exceeded_allowed,
          f.mould_pm_overdue,
          f.deviation_no,
          m.machine_code,
          p.part_code,
          p.shrp_part_code,
          p.customer_part_no,
          p.part_name,
          mo.mould_code,
          mo.mould_name,
          u.full_name AS submitted_by_name
        FROM fpa_submissions f
        JOIN machine_assignments ma ON f.assignment_id = ma.id
        JOIN machines m ON ma.machine_id = m.id
        JOIN parts p ON ma.part_id = p.id
        LEFT JOIN moulds mo ON ma.mould_id = mo.id
        LEFT JOIN users u ON f.technician_user_id = u.id
        WHERE f.approval_status = 'PENDING'
        ORDER BY f.submitted_at DESC
      `);
      pendingFpa = fpaRes.rows;
    } catch (e) {
      console.warn('Could not query fpa_submissions for alerts:', e.message);
    }

    // 2. Moulds Overdue for PM
    let overdueMoulds = [];
    try {
      const mouldsRes = await pool.query(`
        SELECT 
          id, mould_code, mould_name, cumulative_shots, shots_since_pm, pm_interval_shots,
          (shots_since_pm - pm_interval_shots) AS shots_overdue,
          status, storage_location
        FROM moulds
        WHERE (status IS NULL OR status != 'scrapped')
          AND shots_since_pm >= pm_interval_shots
          AND pm_interval_shots > 0
        ORDER BY (shots_since_pm - pm_interval_shots) DESC
      `);
      overdueMoulds = mouldsRes.rows;
    } catch (e) {
      console.warn('Could not query moulds for alerts:', e.message);
    }

    // 3. Regrind / Recipe Deviations awaiting sign-off
    let regrindDeviations = [];
    try {
      const regrindRes = await pool.query(`
        SELECT 
          f.id AS fpa_id,
          f.assignment_id,
          f.approval_status,
          f.regrind_pct,
          f.deviation_no,
          f.remarks,
          f.submitted_at,
          m.machine_code,
          p.part_code,
          p.customer_part_no,
          p.part_name
        FROM fpa_submissions f
        JOIN machine_assignments ma ON f.assignment_id = ma.id
        JOIN machines m ON ma.machine_id = m.id
        JOIN parts p ON ma.part_id = p.id
        WHERE f.regrind_exceeded_allowed = TRUE AND (f.deviation_no IS NULL OR f.deviation_no = '' OR f.approval_status = 'PENDING')
        ORDER BY f.submitted_at DESC
        LIMIT 20
      `);
      regrindDeviations = regrindRes.rows;
    } catch (e) {
      console.warn('Could not query regrind deviations for alerts:', e.message);
    }

    // 4. Pending Mould Setup Authorizations
    let pendingSetups = [];
    try {
      const setupsRes = await pool.query(`
        SELECT 
          ma.id AS assignment_id,
          ma.set_at,
          m.machine_code,
          p.part_code,
          p.customer_part_no,
          p.part_name,
          mo.mould_code,
          mo.mould_name,
          u.full_name AS set_by_name
        FROM machine_assignments ma
        JOIN machines m ON ma.machine_id = m.id
        JOIN parts p ON ma.part_id = p.id
        LEFT JOIN moulds mo ON ma.mould_id = mo.id
        LEFT JOIN users u ON ma.set_by_user_id = u.id
        WHERE ma.status = 'pending'
        ORDER BY ma.set_at DESC
      `);
      pendingSetups = setupsRes.rows;
    } catch (e) {
      console.warn('Could not query machine_assignments for alerts:', e.message);
    }

    // 5. Pending Deletions
    let pendingDeletions = [];
    try {
      const delsRes = await pool.query(`
        SELECT 
          d.id, d.record_type, d.reason, d.created_at, d.details,
          u.full_name AS requested_by_name
        FROM deletion_requests d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.status = 'pending'
        ORDER BY d.created_at DESC
      `);
      pendingDeletions = delsRes.rows;
    } catch (e) {
      console.warn('Could not query deletion_requests for alerts:', e.message);
    }

    // Total actionable alerts count based on user visibility
    const totalCount = pendingFpa.length + overdueMoulds.length + pendingSetups.length + regrindDeviations.length + (['admin', 'supervisor'].includes(role) ? pendingDeletions.length : 0);

    res.json({
      totalCount,
      pendingFpa,
      overdueMoulds,
      regrindDeviations,
      pendingSetups,
      pendingDeletions,
    });
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: 'Failed to fetch alerts: ' + err.message });
  }
});

router.post('/:id/read', async (req, res) => {
  const { id } = req.params;
  await pool.query(
    'UPDATE notifications SET read_at = now() WHERE id = $1 AND user_id = $2 AND read_at IS NULL',
    [id, req.user.id]
  );
  res.json({ ok: true });
});

router.post('/read-all', async (req, res) => {
  await pool.query(
    'UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL',
    [req.user.id]
  );
  res.json({ ok: true });
});

module.exports = router;
