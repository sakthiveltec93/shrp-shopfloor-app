const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { istDateString } = require('../lib/shift');

const router = express.Router();
router.use(requireAuth);

router.get('/items', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM daily_check_items WHERE active = TRUE ORDER BY sort_order, id'
  );
  res.json(rows);
});

// Has today's (IST) check sheet for this machine+shift already been submitted?
router.get('/today', async (req, res) => {
  const { machine_id, shift } = req.query;
  if (!machine_id || !shift) return res.status(400).json({ error: 'machine_id and shift are required' });
  const entryDate = istDateString(new Date());
  const { rows } = await pool.query(
    `SELECT s.*, u.full_name AS operator_name FROM daily_check_submissions s
     JOIN users u ON u.id = s.operator_user_id
     WHERE s.machine_id = $1 AND s.shift = $2 AND s.entry_date = $3`,
    [machine_id, shift, entryDate]
  );
  res.json(rows[0] || null);
});

// Submit the check sheet. Every active item must be answered; any 'NG'
// requires remarks - enforced here, not just in the UI.
router.post('/submit', async (req, res) => {
  const { machine_id, shift, responses } = req.body; // responses: [{ check_item_id, status, remarks }]
  if (!machine_id || !shift || !Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({ error: 'machine_id, shift and responses are required' });
  }
  for (const r of responses) {
    if (!['OK', 'NG', 'NA'].includes(r.status)) {
      return res.status(400).json({ error: 'Each response status must be OK, NG or NA' });
    }
    if (r.status === 'NG' && !r.remarks) {
      return res.status(400).json({ error: 'Remarks are required for any item marked NG' });
    }
  }

  const entryDate = istDateString(new Date());
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const subRes = await client.query(
      `INSERT INTO daily_check_submissions (machine_id, shift, entry_date, operator_user_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [machine_id, shift, entryDate, req.user.id]
    );
    const submissionId = subRes.rows[0].id;
    for (const r of responses) {
      await client.query(
        `INSERT INTO daily_check_responses (submission_id, check_item_id, status, remarks) VALUES ($1,$2,$3,$4)`,
        [submissionId, r.check_item_id, r.status, r.remarks || null]
      );
    }
    await client.query('COMMIT');
    res.status(201).json(subRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ error: "Today's check sheet for this machine and shift was already submitted." });
    }
    throw err;
  } finally {
    client.release();
  }
});

module.exports = router;
