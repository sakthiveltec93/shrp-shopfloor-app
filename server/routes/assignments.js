const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Current approved part assignment for every machine - this is what
// Production Entry reads. It never writes here.
router.get('/current', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT DISTINCT ON (ma.machine_id)
      ma.machine_id, m.machine_code, ma.part_id, p.part_code, p.part_name,
      p.cavity_count, p.standard_cycle_time_sec, ma.status, ma.approved_at
    FROM machine_assignments ma
    JOIN machines m ON m.id = ma.machine_id
    JOIN parts p ON p.id = ma.part_id
    WHERE ma.status = 'approved'
    ORDER BY ma.machine_id, ma.approved_at DESC
  `);
  res.json(rows);
});

// Pending assignments awaiting supervisor/admin approval
router.get('/pending', requireRole('supervisor', 'admin'), async (req, res) => {
  const { rows } = await pool.query(`
    SELECT ma.*, m.machine_code, p.part_code, p.part_name, u.full_name AS set_by_name
    FROM machine_assignments ma
    JOIN machines m ON m.id = ma.machine_id
    JOIN parts p ON p.id = ma.part_id
    JOIN users u ON u.id = ma.set_by_user_id
    WHERE ma.status = 'pending'
    ORDER BY ma.set_at DESC
  `);
  res.json(rows);
});

// Set up a new mould/part on a machine -> goes to pending
router.post('/', requireRole('operator', 'supervisor', 'admin'), async (req, res) => {
  const { machine_id, part_id, notes } = req.body;
  if (!machine_id || !part_id) {
    return res.status(400).json({ error: 'machine_id and part_id are required' });
  }
  const { rows } = await pool.query(
    `INSERT INTO machine_assignments (machine_id, part_id, set_by_user_id, notes)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [machine_id, part_id, req.user.id, notes || null]
  );
  res.status(201).json(rows[0]);
});

// Approve or reject a pending assignment - supervisor/admin only
router.post('/:id/decision', requireRole('supervisor', 'admin'), async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body; // 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: "decision must be 'approved' or 'rejected'" });
  }
  const { rows } = await pool.query(
    `UPDATE machine_assignments
     SET status = $1, approved_by_user_id = $2, approved_at = now()
     WHERE id = $3 AND status = 'pending' RETURNING *`,
    [decision, req.user.id, id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Pending assignment not found' });
  res.json(rows[0]);
});

module.exports = router;
