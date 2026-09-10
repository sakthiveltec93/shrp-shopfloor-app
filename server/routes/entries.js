const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { currentShift, hourSlot, istDateString } = require('../lib/shift');

const router = express.Router();
router.use(requireAuth);

router.get('/context', (req, res) => {
  const now = new Date();
  res.json({
    shift: currentShift(now),
    hour_slot: hourSlot(now),
    entry_date: istDateString(now),
    server_time: now.toISOString(),
  });
});

// Most recent entry today for a machine - the client uses its end_time as
// the next entry's start_time. Null means this will be the first entry of
// the day, so the operator has to supply a start time themselves.
router.get('/last', async (req, res) => {
  const { machine_id } = req.query;
  if (!machine_id) return res.status(400).json({ error: 'machine_id is required' });
  const entryDate = istDateString(new Date());
  const { rows } = await pool.query(
    `SELECT * FROM production_entries
     WHERE machine_id = $1 AND entry_date = $2
     ORDER BY created_at DESC LIMIT 1`,
    [machine_id, entryDate]
  );
  res.json(rows[0] || null);
});

// Log an hourly production entry. part_id is NOT accepted from the client -
// it is always read from the machine's current approved assignment.
// end_time is always "now" server-side; start_time comes from the client
// (either the previous entry's end_time, or an operator-entered time for
// the day's first entry). Efficiency is computed from elapsed time vs.
// the part's standard cycle time and cavity count.
router.post('/', async (req, res) => {
  const {
    machine_id, entry_date, hour_slot: hourSlotIn, shift, start_time,
    start_count, end_count, reject_qty, downtime_minutes, downtime_reason_id, remarks,
  } = req.body;

  if (!machine_id || !entry_date || !hourSlotIn || !shift || !start_time || start_count == null || end_count == null) {
    return res.status(400).json({ error: 'machine_id, entry_date, hour_slot, shift, start_time, start_count and end_count are required' });
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

  const partRes = await pool.query(
    `SELECT cavity_count, standard_cycle_time_sec FROM parts WHERE id = $1`,
    [part_id]
  );
  const part = partRes.rows[0];

  const totalQty = end_count - start_count;
  const rejectQty = reject_qty || 0;
  const goodQty = Math.max(0, totalQty - rejectQty);

  const endTime = new Date();
  const startTime = new Date(start_time);
  const elapsedSeconds = Math.max(1, (endTime.getTime() - startTime.getTime()) / 1000);

  let efficiencyPct = null;
  if (part && part.cavity_count > 0 && part.standard_cycle_time_sec > 0) {
    const idealSeconds = (goodQty / part.cavity_count) * Number(part.standard_cycle_time_sec);
    efficiencyPct = Math.round((idealSeconds / elapsedSeconds) * 1000) / 10; // one decimal
  }

  const { rows } = await pool.query(
    `INSERT INTO production_entries
      (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot,
       start_count, end_count, good_qty, reject_qty, downtime_minutes, downtime_reason_id, remarks,
       start_time, end_time, efficiency_pct)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
    [machine_id, part_id, req.user.id, shift, entry_date, hourSlotIn,
      start_count, end_count, goodQty, rejectQty, downtime_minutes || 0, downtime_reason_id || null, remarks || null,
      startTime.toISOString(), endTime.toISOString(), efficiencyPct]
  );
  res.status(201).json(rows[0]);
});

// Entries for a given date (defaults to today in IST), for dashboard/summary views
router.get('/', async (req, res) => {
  const { date } = req.query;
  const entryDate = date || istDateString(new Date());
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
