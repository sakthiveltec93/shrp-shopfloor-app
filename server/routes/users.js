const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
router.use(requireRole('admin'));

const VALID_PAGES = [
  'mould_setup', 'entry', 'bag_entry', 'trimming', 'inspection',
  'packing', 'dispatch', 'log', 'approvals', 'parts', 'users', 'attendance',
];

async function pagesForUser(userId) {
  const { rows } = await pool.query('SELECT page_key FROM user_page_access WHERE user_id = $1', [userId]);
  return rows.map((r) => r.page_key);
}

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT id, username, full_name, role, active, can_override_fifo, can_approve_tolerance, created_at FROM users ORDER BY full_name');
  const withPages = await Promise.all(rows.map(async (u) => ({ ...u, pages: await pagesForUser(u.id) })));
  res.json(withPages);
});

router.post('/', async (req, res) => {
  const { username, pin, full_name, role, pages, can_override_fifo, can_approve_tolerance } = req.body;
  if (!username || !pin || !full_name || !['operator', 'supervisor', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'username, pin, full_name and a valid role are required' });
  }
  if (!/^\d{4,6}$/.test(pin)) {
    return res.status(400).json({ error: 'PIN must be 4-6 digits' });
  }
  const invalidPages = (pages || []).filter((p) => !VALID_PAGES.includes(p));
  if (invalidPages.length) return res.status(400).json({ error: `Unknown page(s): ${invalidPages.join(', ')}` });

  const pinHash = await bcrypt.hash(pin, 10);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO users (username, pin_hash, full_name, role, can_override_fifo, can_approve_tolerance) VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, username, full_name, role, active, can_override_fifo, can_approve_tolerance, created_at`,
      [username.trim().toLowerCase(), pinHash, full_name, role, !!can_override_fifo, !!can_approve_tolerance]
    );
    const user = rows[0];
    for (const page of pages || []) {
      await client.query('INSERT INTO user_page_access (user_id, page_key) VALUES ($1,$2)', [user.id, page]);
    }
    await client.query('COMMIT');
    res.status(201).json({ ...user, pages: pages || [] });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ error: 'That username is already taken' });
    throw err;
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, role, active, pin, pages, can_override_fifo, can_approve_tolerance } = req.body;
  if (role && !['operator', 'supervisor', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (pin && !/^\d{4,6}$/.test(pin)) {
    return res.status(400).json({ error: 'PIN must be 4-6 digits' });
  }
  if (pages) {
    const invalidPages = pages.filter((p) => !VALID_PAGES.includes(p));
    if (invalidPages.length) return res.status(400).json({ error: `Unknown page(s): ${invalidPages.join(', ')}` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const pinHash = pin ? await bcrypt.hash(pin, 10) : null;
    const { rows } = await client.query(
      `UPDATE users SET
         full_name = COALESCE($1, full_name),
         role = COALESCE($2, role),
         active = COALESCE($3, active),
         pin_hash = COALESCE($4, pin_hash),
         can_override_fifo = COALESCE($5, can_override_fifo),
         can_approve_tolerance = COALESCE($6, can_approve_tolerance)
       WHERE id = $7 RETURNING id, username, full_name, role, active, can_override_fifo, can_approve_tolerance, created_at`,
      [full_name || null, role || null, active, pinHash, can_override_fifo != null ? !!can_override_fifo : null, can_approve_tolerance != null ? !!can_approve_tolerance : null, id]
    );
    if (!rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'User not found' }); }

    if (pages) {
      await client.query('DELETE FROM user_page_access WHERE user_id = $1', [id]);
      for (const page of pages) {
        await client.query('INSERT INTO user_page_access (user_id, page_key) VALUES ($1,$2)', [id, page]);
      }
    }
    await client.query('COMMIT');
    res.json({ ...rows[0], pages: pages || await pagesForUser(id) });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

module.exports = router;
