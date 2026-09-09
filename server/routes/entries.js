const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { currentShift, hourSlot } = require('../lib/shift');

const router = express.Router();
router.use(requireAuth);

// Server-computed shift context, so the client never has to guess/trust local clock rules
router.get('/context', (req, res) => {
  const now = new Date();
  res.json({ shift: currentShift(now), hour_slot: hourSlot(now), server_time: now.toISOString() });
});

// Log an hourly production entry. part_id is NOT accepted from the client -
// it is always read from the machine's current approved assignment.
router.post('/', async (req, res) => {
  const {
    machine_id, entry_date, hour_slot: hourSlotIn, shift,
    start_count, end_count, reject_qty, downtime_minutes, downtime_reason_id, remarks,
  } = req.body;

  if (!machine_id || !entry_date || !hourSlotIn || !shift || start_count == null || end_count == null) {
    return res.status(400).json({ error: 'machine_id, entry_date, hour_slot, shift, start_count and end_count are required' });
  }
  if (end_count < start_count) {
    return res.status(400).json({ error: 'end_count cannot be less than start_count' });
  }

  const assignment = await pool.query(
    `SELECT part_id FROM machine_assignments
     WHERE machine_id = $1 AND status = 'approved'
     ORDER BY approved_at DESC LIMIT 1`,
    [machine_id]
  );
  if (!assignment.rows[0]) {
    return res.status(409).json({ error: 'No approved mould/part assignment for this machine yet - submit a Mould Setup request first' });
  }
  const part_id = assignment.rows[0].part_id;
  const totalQty = end_count - start_count;
  const rejectQty = reject_qty || 0;
  const goodQty = Math.max(0, totalQty - rejectQty);

  const { rows } = await pool.query(
    `INSERT INTO production_entries
      (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot,
       start_count, end_count, good_qty, reject_qty, downtime_minutes, downtime_reason_id, remarks)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [machine_id, part_id, req.user.id, shift, entry_date, hourSlotIn,
      start_count, end_count, goodQty, rejectQty, downtime_minutes || 0, downtime_reason_id || null, remarks || null]
  );
  res.status(201).json(rows[0]);
});

// Entries for a given date (defaults to today), for dashboard/summary views
router.get('/', async (req, res) => {
  const { date } = req.query;
  const entryDate = date || new Date().toISOString().slice(0, 10);
  const { rows } = await pool.query(`
    SELECT pe.*, m.machine_code, p.part_code, p.part_name, u.full_name AS operator_name
    FROM production_entries pe
    JOIN machines m ON m.id = pe.machine_id
    JOIN parts p ON p.id = pe.part_id
    JOIN users u ON u.id = pe.operator_user_id
    WHERE pe.entry_date = $1
    ORDER BY pe.machine_id, pe.hour_slot
  `, [entryDate]);
  res.json(rows);
});

module.exports = router;
