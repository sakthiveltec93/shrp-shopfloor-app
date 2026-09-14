const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Self-service PIN change. Requires the current PIN, not just a valid JWT -
// guards against someone using another operator's still-logged-in session
// on a shared shop-floor device. req.user only carries the JWT payload
// (id/username/role), never pin_hash, so it's looked up fresh here.
router.post('/change-pin', async (req, res) => {
  const { current_pin, new_pin } = req.body;

  if (!current_pin || !new_pin) {
    return res.status(400).json({ error: 'current_pin and new_pin are required' });
  }
  if (!/^\d{4,6}$/.test(new_pin)) {
    return res.status(400).json({ error: 'New PIN must be 4-6 digits' });
  }

  const { rows } = await pool.query('SELECT pin_hash FROM users WHERE id = $1', [req.user.id]);
  const user = rows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const valid = await bcrypt.compare(current_pin, user.pin_hash);
  if (!valid) return res.status(401).json({ error: 'Current PIN is incorrect' });

  const newHash = await bcrypt.hash(new_pin, 10);
  await pool.query('UPDATE users SET pin_hash = $1 WHERE id = $2', [newHash, req.user.id]);
  res.json({ success: true });
});

module.exports = router;
