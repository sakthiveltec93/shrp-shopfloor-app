const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, pin } = req.body;
  if (!username || !pin) {
    return res.status(400).json({ error: 'Username and PIN required' });
  }
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE LOWER(username) = LOWER($1) AND active = TRUE',
    [username.trim()]
  );
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid username or PIN' });

  const ok = await bcrypt.compare(pin, user.pin_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid username or PIN' });

  const pagesRes = await pool.query('SELECT page_key FROM user_page_access WHERE user_id = $1', [user.id]);
  const pages = pagesRes.rows.map((r) => r.page_key);

  const token = jwt.sign(
    { id: user.id, username: user.username, full_name: user.full_name, role: user.role, assigned_process: user.assigned_process || 'PRODUCTION' },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  // Record login activity
  try {
    await pool.query(
      `UPDATE users SET last_login_at = now(), last_active_at = now() WHERE id = $1`,
      [user.id]
    );
    await pool.query(
      `INSERT INTO user_activity_log (user_id, activity_date, first_login_at, last_active_at, active_minutes, actions_count, last_page)
       VALUES ($1, CURRENT_DATE, now(), now(), 1, 1, '/home')
       ON CONFLICT (user_id, activity_date)
       DO UPDATE SET
         last_active_at = now(),
         actions_count = user_activity_log.actions_count + 1`,
      [user.id]
    );
  } catch (logErr) {
    console.warn('Failed to log login activity:', logErr.message);
  }

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      assigned_process: user.assigned_process || 'PRODUCTION',
      default_language: user.default_language || 'en',
      pages,
    },
  });
});

module.exports = router;
