const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ============================================================
// 1. Get Current User Profile & App Usage Stats
// ============================================================
router.get('/profile', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, full_name, role, assigned_process, phone, aadhaar_no,
              bank_name, bank_account_no, bank_ifsc,
              nominee_name, nominee_relation, default_language,
              avatar_data, created_at, last_login_at, last_active_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const profile = rows[0];

    // Fetch today's app usage stats
    const { rows: actRows } = await pool.query(
      `SELECT active_minutes, actions_count, first_login_at, last_active_at
       FROM user_activity_log
       WHERE user_id = $1 AND activity_date = CURRENT_DATE`,
      [req.user.id]
    );
    profile.today_activity = actRows[0] || { active_minutes: 0, actions_count: 0 };

    // Fetch weekly summary
    const { rows: weekRows } = await pool.query(
      `SELECT COALESCE(SUM(active_minutes), 0) AS weekly_active_minutes,
              COALESCE(SUM(actions_count), 0) AS weekly_actions_count
       FROM user_activity_log
       WHERE user_id = $1 AND activity_date >= CURRENT_DATE - INTERVAL '7 days'`,
      [req.user.id]
    );
    profile.weekly_activity = weekRows[0];

    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ============================================================
// 2. Update Current User Profile
// ============================================================
router.put('/profile', async (req, res) => {
  const {
    full_name,
    phone,
    aadhaar_no,
    bank_name,
    bank_account_no,
    bank_ifsc,
    nominee_name,
    nominee_relation,
    default_language,
    avatar_data,
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           aadhaar_no = COALESCE($3, aadhaar_no),
           bank_name = COALESCE($4, bank_name),
           bank_account_no = COALESCE($5, bank_account_no),
           bank_ifsc = COALESCE($6, bank_ifsc),
           nominee_name = COALESCE($7, nominee_name),
           nominee_relation = COALESCE($8, nominee_relation),
           default_language = COALESCE($9, default_language),
           avatar_data = COALESCE($10, avatar_data)
       WHERE id = $11
       RETURNING id, username, full_name, role, phone, aadhaar_no,
                 bank_name, bank_account_no, bank_ifsc,
                 nominee_name, nominee_relation, default_language,
                 avatar_data`,
      [
        full_name || null,
        phone || null,
        aadhaar_no || null,
        bank_name || null,
        bank_account_no || null,
        bank_ifsc || null,
        nominee_name || null,
        nominee_relation || null,
        default_language || 'en',
        avatar_data || null,
        req.user.id,
      ]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 3. Change PIN
// ============================================================
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

// ============================================================
// 4. Leave & Permission Requests
// ============================================================

// Submit Request
router.post('/leave', async (req, res) => {
  const { request_type = 'LEAVE', leave_type, from_date, to_date, from_time, to_time, reason } = req.body;

  if (!from_date || !to_date || !reason) {
    return res.status(400).json({ error: 'from_date, to_date, and reason are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO leave_requests (
         user_id, request_type, leave_type, from_date, to_date, from_time, to_time, reason
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        request_type,
        leave_type || 'Casual',
        from_date,
        to_date,
        from_time || null,
        to_time || null,
        reason.trim(),
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating leave request:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get My Requests
router.get('/leave', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT lr.*, u_rev.full_name AS reviewer_name
       FROM leave_requests lr
       LEFT JOIN users u_rev ON u_rev.id = lr.reviewed_by
       WHERE lr.user_id = $1
       ORDER BY lr.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching leave requests:', err);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// Supervisor/Admin: View All Requests
router.get('/leave/all', requireRole('admin', 'supervisor'), async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT lr.*,
             u.full_name AS staff_name,
             u.username,
             u.role,
             u_rev.full_name AS reviewer_name
      FROM leave_requests lr
      JOIN users u ON u.id = lr.user_id
      LEFT JOIN users u_rev ON u_rev.id = lr.reviewed_by
      ORDER BY lr.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching all leave requests:', err);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// Supervisor/Admin: Decide (Approve/Reject)
router.post('/leave/:id/decide', requireRole('admin', 'supervisor'), async (req, res) => {
  const { decision, review_notes } = req.body;
  const requestId = req.params.id;

  if (!['APPROVED', 'REJECTED'].includes(decision)) {
    return res.status(400).json({ error: 'Decision must be APPROVED or REJECTED' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE leave_requests
       SET status = $1,
           reviewed_by = $2,
           reviewed_at = now(),
           review_notes = $3
       WHERE id = $4
       RETURNING *`,
      [decision, req.user.id, review_notes || null, requestId]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Request not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error deciding leave request:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
