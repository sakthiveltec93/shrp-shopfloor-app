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

// Log an hourly entry against a RUNNING session. start_time is always the
// session's own clock (previous entry's end_time, or the session's own
// start_time for the first entry) - the client never supplies it, so there
// is no chaining logic to get wrong client-side.
// If the resulting good_qty is below the theoretical target for the
// elapsed time, remarks are mandatory - enforced here, not just in the UI.
router.post('/', async (req, res) => {
  const {
    session_id, end_count, reject_qty, downtime_minutes, downtime_reason_id, remarks,
  } = req.body;

  if (!session_id || end_count == null) {
    return res.status(400).json({ error: 'session_id and end_count are required' });
  }

  const sessionRes = await pool.query(`SELECT * FROM machine_sessions WHERE id = $1 AND status = 'RUNNING'`, [session_id]);
  const session = sessionRes.rows[0];
  if (!session) return res.status(404).json({ error: 'Running session not found' });

  const lastEntryRes = await pool.query(
    `SELECT * FROM production_entries WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [session_id]
  );
  const prevEntry = lastEntryRes.rows[0];
  const startTime = prevEntry ? new Date(prevEntry.end_time) : new Date(session.start_time);
  const startCount = prevEntry ? prevEntry.end_count : session.start_count;

  if (end_count < startCount) {
    return res.status(400).json({ error: 'end_count cannot be less than the previous count' });
  }

  const partRes = await pool.query(`SELECT cavity_count, standard_cycle_time_sec FROM parts WHERE id = $1`, [session.part_id]);
  const part = partRes.rows[0];

  const totalQty = end_count - startCount;
  const rejectQty = reject_qty || 0;
  const goodQty = Math.max(0, totalQty - rejectQty);

  const endTime = new Date();
  const elapsedSeconds = Math.max(1, (endTime.getTime() - startTime.getTime()) / 1000);

  let efficiencyPct = null;
  let targetQty = null;
  if (part && part.cavity_count > 0 && part.standard_cycle_time_sec > 0) {
    targetQty = (elapsedSeconds / Number(part.standard_cycle_time_sec)) * part.cavity_count;
    const idealSeconds = (goodQty / part.cavity_count) * Number(part.standard_cycle_time_sec);
    efficiencyPct = Math.round((idealSeconds / elapsedSeconds) * 1000) / 10;
  }
  const belowTarget = targetQty != null && goodQty < targetQty;

  if (belowTarget && !remarks) {
    return res.status(409).json({
      error: `Output (${goodQty}) is below the target (${Math.round(targetQty)}) for this period. Remarks are required.`,
      code: 'below_target',
      target_qty: Math.round(targetQty),
      good_qty: goodQty,
    });
  }

  const now = new Date();
  const { rows } = await pool.query(
    `INSERT INTO production_entries
      (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot,
       start_count, end_count, good_qty, reject_qty, downtime_minutes, downtime_reason_id, remarks,
       start_time, end_time, efficiency_pct, session_id, target_qty, below_target)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`,
    [session.machine_id, session.part_id, req.user.id, currentShift(now), istDateString(now), hourSlot(now),
      startCount, end_count, goodQty, rejectQty, downtime_minutes || 0, downtime_reason_id || null, remarks || null,
      startTime.toISOString(), endTime.toISOString(), efficiencyPct, session_id,
      targetQty != null ? Math.round(targetQty * 100) / 100 : null, belowTarget]
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
