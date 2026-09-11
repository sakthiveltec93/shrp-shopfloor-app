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
    'SELECT * FROM users WHERE username = $1 AND active = TRUE',
    [username.trim().toLowerCase()]
  );
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid username or PIN' });

  const ok = await bcrypt.compare(pin, user.pin_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid username or PIN' });

  const pagesRes = await pool.query('SELECT page_key FROM user_page_access WHERE user_id = $1', [user.id]);
  const pages = pagesRes.rows.map((r) => r.page_key);

  const token = jwt.sign(
    { id: user.id, username: user.username, full_name: user.full_name, role: user.role },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
  res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role, pages } });
});

module.exports = router;
