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
    SELECT ms.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no, u.full_name AS operator_name
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
    SELECT ms.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no, u.full_name AS operator_name
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

// Start Machine - creates a new running session.
router.post('/start', async (req, res) => {
  try {
    const { machine_id, start_count, operator_user_id } = req.body;
    if (!machine_id || start_count == null) {
      return res.status(400).json({ error: 'machine_id and start_count are required' });
    }

    // Determine assigned operator
    let assignedOperatorId = req.user.id;
    if (operator_user_id && (req.user.role === 'admin' || req.user.role === 'supervisor')) {
      assignedOperatorId = Number(operator_user_id);
    }

    const assignment = await pool.query(
      `SELECT id, part_id, mould_id FROM machine_assignments WHERE machine_id = $1 AND status = 'approved' ORDER BY approved_at DESC LIMIT 1`,
      [machine_id]
    );
    if (!assignment.rows[0]) {
      return res.status(409).json({ error: 'No approved mould/part assignment for this machine yet - submit a Mould Setup request first' });
    }

    // Hard IATF 16949 Gate: Check if FPA has been approved for this specific assignment
    let fpaCheck = { rows: [] };
    try {
      fpaCheck = await pool.query(
        `SELECT id, approval_status 
         FROM fpa_submissions 
         WHERE assignment_id = $1 
         ORDER BY created_at DESC LIMIT 1`,
        [assignment.rows[0].id]
      );
    } catch (fpaErr) {
      console.warn('Could not query fpa_submissions during machine start:', fpaErr.message);
    }

    if (!fpaCheck.rows[0] || !['APPROVED', 'CONDITIONAL', 'VISUAL_APPROVED'].includes(fpaCheck.rows[0].approval_status)) {
      return res.status(403).json({
        error: 'IATF 16949 Clause 8.5.1.1 Gate: First-Piece Approval (Visual or Full) must be APPROVED by QA / Supervisor before starting production session.',
        code: 'fpa_required',
        fpa_status: fpaCheck.rows[0] ? fpaCheck.rows[0].approval_status : 'NOT_SUBMITTED',
        part_id: assignment.rows[0].part_id,
        machine_id: Number(machine_id),
        mould_id: assignment.rows[0].mould_id,
        assignment_id: assignment.rows[0].id
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO machine_sessions (machine_id, part_id, operator_user_id, start_time, start_count)
       VALUES ($1,$2,$3,now(),$4) RETURNING *`,
      [machine_id, assignment.rows[0].part_id, assignedOperatorId, Number(start_count)]
    );

    const fullSession = await pool.query(`
      SELECT ms.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no, u.full_name AS operator_name
      FROM machine_sessions ms
      JOIN machines m ON m.id = ms.machine_id
      JOIN parts p ON p.id = ms.part_id
      JOIN users u ON u.id = ms.operator_user_id
      WHERE ms.id = $1
    `, [rows[0].id]);

    res.status(201).json(fullSession.rows[0] || rows[0]);
  } catch (err) {
    if (err.code === '23505') { // unique_violation on the partial index
      try {
        const conflict = await pool.query(
          `SELECT ms.*, u.full_name AS operator_name, m.machine_code
           FROM machine_sessions ms
           JOIN users u ON u.id = ms.operator_user_id
           JOIN machines m ON m.id = ms.machine_id
           WHERE ms.machine_id = $1 AND ms.status = 'RUNNING'`,
          [machine_id]
        );
        const existing = conflict.rows[0];
        if (existing) {
          return res.status(409).json({
            error: `${existing.machine_code} is already RUNNING under ${existing.operator_name} (started ${new Date(existing.start_time).toLocaleTimeString()}). Switch OFF the active session before starting a new one.`,
            active_session: existing,
          });
        }
      } catch (inner) {
        console.error('Failed to look up conflicting session:', inner);
      }
      return res.status(409).json({ error: 'This machine is already running under another operator.' });
    }
    console.error('Start session error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Switch OFF a machine (close active session)
router.post('/:id/off', async (req, res) => {
  const { id } = req.params;
  const { off_count, off_reason, off_remarks, new_operator_user_id } = req.body;
  if (off_count == null || !OFF_REASONS.includes(off_reason)) {
    return res.status(400).json({ error: `off_count is required and off_reason must be one of: ${OFF_REASONS.join(', ')}` });
  }

  const existing = await pool.query("SELECT * FROM machine_sessions WHERE id = $1 AND status = 'RUNNING'", [id]);
  const current = existing.rows[0];
  if (!current) return res.status(404).json({ error: 'Running session not found' });
  if (current.operator_user_id !== req.user.id && req.user.role === 'operator') {
    return res.status(403).json({ error: 'Only the operator who started this machine can switch it off. Ask a supervisor for help.' });
  }

  // Hard Gate: Check if active assignment on this machine has incomplete visual FPA
  const assignment = await pool.query(
    `SELECT id FROM machine_assignments WHERE machine_id = $1 AND status = 'approved' ORDER BY approved_at DESC LIMIT 1`,
    [current.machine_id]
  );
  if (assignment.rows[0]) {
    const fpaCheck = await pool.query(
      `SELECT id, approval_status FROM fpa_submissions WHERE assignment_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [assignment.rows[0].id]
    );
    // Block routine power-off if Full FPA is incomplete; allow breakdown/emergency for physical safety
    if (fpaCheck.rows[0]?.approval_status === 'VISUAL_APPROVED' && !['breakdown', 'emergency'].includes(off_reason)) {
      return res.status(403).json({
        error: 'Full FPA approval required before this machine can be powered off for shift or mould completion. Please complete Full FPA or select Breakdown if stopping for maintenance.',
        code: 'full_fpa_required_for_off',
        fpa_id: fpaCheck.rows[0].id
      });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `UPDATE machine_sessions
       SET status = 'OFF', off_time = now(), off_count = $1, off_reason = $2, off_remarks = $3
       WHERE id = $4 AND status = 'RUNNING' RETURNING *`,
      [Number(off_count), off_reason, off_remarks || null, id]
    );
    if (!rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Running session not found' });
    }

    let newSession = null;
    // If operator_change and new_operator_user_id provided, create the new session immediately
    if (off_reason === 'operator_change' && new_operator_user_id) {
      const ins = await client.query(
        `INSERT INTO machine_sessions (machine_id, part_id, operator_user_id, start_time, start_count)
         VALUES ($1, $2, $3, now(), $4) RETURNING *`,
        [current.machine_id, current.part_id, Number(new_operator_user_id), Number(off_count)]
      );
      const fullNew = await client.query(`
        SELECT ms.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no, u.full_name AS operator_name
        FROM machine_sessions ms
        JOIN machines m ON m.id = ms.machine_id
        JOIN parts p ON p.id = ms.part_id
        JOIN users u ON u.id = ms.operator_user_id
        WHERE ms.id = $1
      `, [ins.rows[0].id]);
      newSession = fullNew.rows[0];
    }

    await client.query('COMMIT');
    res.json({ closed_session: rows[0], new_session: newSession, ...rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Change Operator (Dedicated Handover Endpoint)
router.post('/:id/change-operator', async (req, res) => {
  const { id } = req.params;
  const { off_count, new_operator_user_id, remarks } = req.body;
  if (off_count == null || !new_operator_user_id) {
    return res.status(400).json({ error: 'off_count and new_operator_user_id are required' });
  }

  const existing = await pool.query("SELECT * FROM machine_sessions WHERE id = $1 AND status = 'RUNNING'", [id]);
  const current = existing.rows[0];
  if (!current) return res.status(404).json({ error: 'Running session not found' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Close current session
    await client.query(
      `UPDATE machine_sessions
       SET status = 'OFF', off_time = now(), off_count = $1, off_reason = 'operator_change', off_remarks = $2
       WHERE id = $3 AND status = 'RUNNING'`,
      [Number(off_count), remarks || 'Operator handover', id]
    );

    // 2. Start new session for new operator
    const ins = await client.query(
      `INSERT INTO machine_sessions (machine_id, part_id, operator_user_id, start_time, start_count)
       VALUES ($1, $2, $3, now(), $4) RETURNING *`,
      [current.machine_id, current.part_id, Number(new_operator_user_id), Number(off_count)]
    );

    const fullNew = await client.query(`
      SELECT ms.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no, u.full_name AS operator_name
      FROM machine_sessions ms
      JOIN machines m ON m.id = ms.machine_id
      JOIN parts p ON p.id = ms.part_id
      JOIN users u ON u.id = ms.operator_user_id
      WHERE ms.id = $1
    `, [ins.rows[0].id]);

    await client.query('COMMIT');
    res.status(201).json(fullNew.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
