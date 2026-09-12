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
