const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const OFF_REASONS = ['mould_change', 'shift_completed', 'breakdown', 'operator_change', 'other'];

// The currently running session for a machine, if any. Includes last_count -
// the most recent hourly entry's end_count for this session, or the
// session's own start_count if no hourly entry has been logged yet.
router.get('/active', async (req, res) => {
  const { machine_id } = req.query;
  if (!machine_id) return res.status(400).json({ error: 'machine_id is required' });
  const { rows } = await pool.query(`
    SELECT ms.*, m.machine_code, p.part_code, p.part_name, u.full_name AS operator_name
    FROM machine_sessions ms
    JOIN machines m ON m.id = ms.machine_id
    JOIN parts p ON p.id = ms.part_id
    JOIN users u ON u.id = ms.operator_user_id
    WHERE ms.machine_id = $1 AND ms.status = 'RUNNING'
  `, [machine_id]);
  const session = rows[0];
  if (!session) return res.json(null);

  const lastEntry = await pool.query(
    `SELECT end_count, end_time FROM production_entries WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [session.id]
  );
  session.last_count = lastEntry.rows[0] ? lastEntry.rows[0].end_count : session.start_count;
  session.last_entry_time = lastEntry.rows[0] ? lastEntry.rows[0].end_time : session.start_time;
  res.json(session);
});

// The requesting operator's own RUNNING session, if any, regardless of
// which machine. Lets the client auto-reselect their machine on load
// instead of making them pick it from the dropdown every time.
router.get('/mine', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT ms.*, m.machine_code, p.part_code, p.part_name, u.full_name AS operator_name
    FROM machine_sessions ms
    JOIN machines m ON m.id = ms.machine_id
    JOIN parts p ON p.id = ms.part_id
    JOIN users u ON u.id = ms.operator_user_id
    WHERE ms.operator_user_id = $1 AND ms.status = 'RUNNING'
    ORDER BY ms.start_time DESC LIMIT 1`, [req.user.id]);
  const session = rows[0];
  if (!session) return res.json(null);

  const lastEntry = await pool.query(
    `SELECT end_count, end_time FROM production_entries WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [session.id]
  );
  session.last_count = lastEntry.rows[0] ? lastEntry.rows[0].end_count : session.start_count;
  session.last_entry_time = lastEntry.rows[0] ? lastEntry.rows[0].end_time : session.start_time;
  res.json(session);
});

// Suggested start count = the off_count from this machine's most recent
// closed session (carry the counter forward). Null if never run before.
router.get('/suggested-start-count', async (req, res) => {
  const { machine_id } = req.query;
  if (!machine_id) return res.status(400).json({ error: 'machine_id is required' });
  const { rows } = await pool.query(
    `SELECT off_count FROM machine_sessions
     WHERE machine_id = $1 AND status = 'OFF' AND off_count IS NOT NULL
     ORDER BY off_time DESC LIMIT 1`,
    [machine_id]
  );
  res.json({ suggested_start_count: rows[0] ? rows[0].off_count : null });
});

// Start Machine - creates a new running session. Fails cleanly if another
// operator already has this machine running (the DB's partial unique
// index is what actually guarantees this, not just this check).
router.post('/start', async (req, res) => {
  const { machine_id, start_count } = req.body;
  if (!machine_id || start_count == null) {
    return res.status(400).json({ error: 'machine_id and start_count are required' });
  }

  const assignment = await pool.query(
    `SELECT part_id FROM machine_assignments WHERE machine_id = $1 AND status = 'approved' ORDER BY approved_at DESC LIMIT 1`,
    [machine_id]
  );
  if (!assignment.rows[0]) {
    return res.status(409).json({ error: 'No approved mould/part assignment for this machine yet - submit a Mould Setup request first' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO machine_sessions (machine_id, part_id, operator_user_id, start_time, start_count)
       VALUES ($1,$2,$3,now(),$4) RETURNING *`,
      [machine_id, assignment.rows[0].part_id, req.user.id, start_count]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') { // unique_violation on the partial index
      const active = await pool.query(
        `SELECT ms.*, u.full_name AS operator_name FROM machine_sessions ms
         JOIN users u ON u.id = ms.operator_user_id
         WHERE ms.machine_id = $1 AND ms.status = 'RUNNING'`,
        [machine_id]
      );
      const who = active.rows[0]?.operator_name || 'another operator';
      return res.status(409).json({ error: `This machine is already running under ${who}. They need to submit Change Operator or Off Machine first.` });
    }
    throw err;
  }
});

// Off Machine - closes the session. Only the operator who started it (or
// a supervisor/admin) may close it - prevents one operator from
// accidentally ending another's shift. reason drives what happens next
// (the client navigates to Mould Setup itself when reason is mould_change).
router.post('/:id/off', async (req, res) => {
  const { id } = req.params;
  const { off_count, off_reason, off_remarks } = req.body;
  if (off_count == null || !OFF_REASONS.includes(off_reason)) {
    return res.status(400).json({ error: `off_count is required and off_reason must be one of: ${OFF_REASONS.join(', ')}` });
  }

  const existing = await pool.query("SELECT * FROM machine_sessions WHERE id = $1 AND status = 'RUNNING'", [id]);
  const current = existing.rows[0];
  if (!current) return res.status(404).json({ error: 'Running session not found' });
  if (current.operator_user_id !== req.user.id && req.user.role === 'operator') {
    return res.status(403).json({ error: 'Only the operator who started this machine can switch it off. Ask a supervisor for help.' });
  }

  const { rows } = await pool.query(
    `UPDATE machine_sessions
     SET status = 'OFF', off_time = now(), off_count = $1, off_reason = $2, off_remarks = $3
     WHERE id = $4 AND status = 'RUNNING' RETURNING *`,
    [off_count, off_reason, off_remarks || null, id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Running session not found' });
  res.json(rows[0]);
});

module.exports = router;
