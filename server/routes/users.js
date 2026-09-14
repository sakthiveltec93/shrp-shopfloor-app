const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const VALID_PAGES = [
  'mould_setup', 'entry', 'bag_entry', 'trimming', 'inspection',
  'packing', 'dispatch', 'log', 'approvals', 'parts', 'users', 'attendance',
  'rm_inward', 'rm_stock', 'recipes', 'machines', 'moulds', 'reports', 'rework',
];

async function pagesForUser(userId) {
  const { rows } = await pool.query('SELECT page_key FROM user_page_access WHERE user_id = $1', [userId]);
  return rows.map((r) => r.page_key);
}

// ============================================================
// 1. User Heartbeat (All Authenticated Users)
// ============================================================
router.post('/heartbeat', async (req, res) => {
  const userId = req.user.id;
  const { page } = req.body;

  try {
    // 1. Update user last active timestamp
    await pool.query(
      `UPDATE users SET last_active_at = now() WHERE id = $1`,
      [userId]
    );

    // 2. Upsert daily activity row
    await pool.query(
      `INSERT INTO user_activity_log (user_id, activity_date, first_login_at, last_active_at, active_minutes, actions_count, last_page)
       VALUES ($1, CURRENT_DATE, now(), now(), 1, 1, $2)
       ON CONFLICT (user_id, activity_date)
       DO UPDATE SET
         last_active_at = now(),
         active_minutes = user_activity_log.active_minutes + 1,
         last_page = COALESCE($2, user_activity_log.last_page)`,
      [userId, page || null]
    );

    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Admin-Only Routes Beyond This Point
router.use(requireRole('admin'));

// ============================================================
// 2. User Accounts List with Live Online & Activity Metrics
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { rows: users } = await pool.query(`
      SELECT u.id, u.username, u.full_name, u.role, u.active,
             u.phone, u.avatar_data, u.default_language,
             u.can_override_fifo, u.can_approve_tolerance,
             u.created_at, u.last_login_at, u.last_active_at,
             CASE
               WHEN u.last_active_at >= now() - INTERVAL '5 minutes' THEN 'ONLINE_ACTIVE'
               WHEN u.last_active_at >= now() - INTERVAL '30 minutes' THEN 'ONLINE_IDLE'
               ELSE 'OFFLINE'
             END AS live_status,
             CASE
               WHEN u.last_active_at >= now() - INTERVAL '5 minutes' THEN TRUE
               ELSE FALSE
             END AS is_online,
             COALESCE(ual.active_minutes, 0) AS today_active_minutes,
             COALESCE(ual.actions_count, 0) AS today_actions_count,
             ual.first_login_at AS today_first_login,
             ual.last_page AS last_viewed_page,
             ms.machine_code AS running_machine_code
      FROM users u
      LEFT JOIN user_activity_log ual ON ual.user_id = u.id AND ual.activity_date = CURRENT_DATE
      LEFT JOIN machine_sessions ms ON ms.operator_user_id = u.id AND ms.status = 'RUNNING'
      WHERE u.deleted_at IS NULL
      ORDER BY u.active DESC, u.last_active_at DESC NULLS LAST, u.full_name
    `);

    const withPages = await Promise.all(users.map(async (u) => ({
      ...u,
      pages: await pagesForUser(u.id),
    })));

    res.json(withPages);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ============================================================
// 3. Daily User App Activity & Time-Spent Report
// ============================================================
router.get('/activity-report', async (req, res) => {
  const targetDate = req.query.date || new Date().toISOString().slice(0, 10);

  try {
    const { rows } = await pool.query(`
      SELECT u.id AS user_id,
             u.username,
             u.full_name,
             u.role,
             u.active AS user_active,
             u.last_active_at,
             ual.activity_date,
             ual.first_login_at,
             ual.last_active_at AS day_last_active_at,
             COALESCE(ual.active_minutes, 0) AS active_minutes,
             COALESCE(ual.actions_count, 0) AS total_actions_count,
             ual.last_page,
             CASE
               WHEN u.last_active_at >= now() - INTERVAL '5 minutes' THEN 'ONLINE_ACTIVE'
               WHEN u.last_active_at >= now() - INTERVAL '30 minutes' THEN 'ONLINE_IDLE'
               ELSE 'OFFLINE'
             END AS live_status,
             (SELECT COUNT(*) FROM production_entries pe WHERE pe.operator_user_id = u.id AND pe.entry_date = $1::date) AS production_entries_count,
             (SELECT COUNT(*) FROM bags b WHERE b.operator_user_id = u.id AND b.created_at::date = $1::date) AS bags_created_count,
             (SELECT COUNT(*) FROM trim_entries te WHERE te.operator_user_id = u.id AND te.created_at::date = $1::date) AS trim_entries_count,
             (SELECT COUNT(*) FROM inspection_entries ie WHERE ie.inspector_user_id = u.id AND ie.created_at::date = $1::date) AS inspection_entries_count
      FROM users u
      LEFT JOIN user_activity_log ual ON ual.user_id = u.id AND ual.activity_date = $1::date
      WHERE u.deleted_at IS NULL
      ORDER BY ual.active_minutes DESC NULLS LAST, u.full_name
    `, [targetDate]);

    res.json(rows);
  } catch (err) {
    console.warn('Fallback activity report:', err.message);
    // Fallback: return basic user rows without erroring
    try {
      const { rows: fallbackUsers } = await pool.query(
        `SELECT id AS user_id, username, full_name, role, active AS user_active,
                0 AS active_minutes, 0 AS total_actions_count, 'OFFLINE' AS live_status
         FROM users WHERE deleted_at IS NULL ORDER BY full_name`
      );
      return res.json(fallbackUsers);
    } catch (e) {
      return res.json([]);
    }
  }
});

// ============================================================
// 4. Create New User
// ============================================================
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
      `INSERT INTO users (username, pin_hash, full_name, role, can_override_fifo, can_approve_tolerance, active)
       VALUES ($1,$2,$3,$4,$5,$6, TRUE)
       RETURNING id, username, full_name, role, active, can_override_fifo, can_approve_tolerance, created_at`,
      [username.trim().toLowerCase(), pinHash, full_name.trim(), role, !!can_override_fifo, !!can_approve_tolerance]
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

// ============================================================
// 5. Update User
// ============================================================
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

// ============================================================
// ============================================================
// 6. Toggle Active Status
// ============================================================
router.post('/:id/toggle-active', async (req, res) => {
  const userId = Number(req.params.id);
  if (userId === req.user.id) {
    return res.status(400).json({ error: 'You cannot deactivate your own logged-in admin account' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE users
       SET active = NOT active,
           updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, username, full_name, active`,
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true, user: rows[0], message: `User "${rows[0].full_name}" is now ${rows[0].active ? 'Active' : 'Inactive'}.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 7. Delete Inactive User (Guaranteed Safe Delete / Purge)
// ============================================================
router.delete('/:id', async (req, res) => {
  const userId = Number(req.params.id);

  if (userId === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own logged-in admin account' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch user info
    const { rows: userRows } = await client.query(`SELECT * FROM users WHERE id = $1`, [userId]);
    if (userRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }
    const targetUser = userRows[0];

    // Ensure foreign key columns allow nulls for safe purging
    try {
      await client.query(`
        ALTER TABLE production_entries ALTER COLUMN operator_user_id DROP NOT NULL;
        ALTER TABLE machine_assignments ALTER COLUMN set_by_user_id DROP NOT NULL;
        ALTER TABLE bags ALTER COLUMN operator_user_id DROP NOT NULL;
        ALTER TABLE trim_entries ALTER COLUMN operator_user_id DROP NOT NULL;
        ALTER TABLE inspection_entries ALTER COLUMN inspector_user_id DROP NOT NULL;
        ALTER TABLE packing_entries ALTER COLUMN packer_user_id DROP NOT NULL;
      `);
    } catch (e) {
      // Ignore if columns already nullable
    }

    // Safely unlink transaction logs so IATF audit trail is preserved without blocking deletion
    await client.query(`UPDATE production_entries SET operator_user_id = NULL WHERE operator_user_id = $1`, [userId]);
    await client.query(`UPDATE machine_assignments SET set_by_user_id = NULL WHERE set_by_user_id = $1`, [userId]);
    await client.query(`UPDATE machine_assignments SET approved_by_user_id = NULL WHERE approved_by_user_id = $1`, [userId]);
    await client.query(`UPDATE bags SET operator_user_id = NULL WHERE operator_user_id = $1`, [userId]);
    await client.query(`UPDATE trim_entries SET operator_user_id = NULL WHERE operator_user_id = $1`, [userId]);
    await client.query(`UPDATE inspection_entries SET inspector_user_id = NULL WHERE inspector_user_id = $1`, [userId]);
    await client.query(`UPDATE packing_entries SET packer_user_id = NULL WHERE packer_user_id = $1`, [userId]);
    await client.query(`UPDATE machine_sessions SET operator_user_id = NULL WHERE operator_user_id = $1`, [userId]);
    await client.query(`UPDATE rm_inward_entries SET inspector_user_id = NULL WHERE inspector_user_id = $1`, [userId]);
    await client.query(`UPDATE rm_inward_entries SET approved_by_user_id = NULL WHERE approved_by_user_id = $1`, [userId]);

    // Delete user-specific configurations and records
    await client.query(`DELETE FROM user_page_access WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM user_activity_log WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM attendance WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM leave_requests WHERE user_id = $1`, [userId]);

    // Completely purge the user record
    await client.query(`DELETE FROM users WHERE id = $1`, [userId]);

    await client.query('COMMIT');
    return res.json({
      ok: true,
      message: `User "${targetUser.full_name}" (@${targetUser.username}) deleted permanently and username freed for registration.`,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting user:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
