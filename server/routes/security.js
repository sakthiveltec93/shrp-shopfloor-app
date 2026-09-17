const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
router.use(requireRole('admin'));

// ============================================================
// 1. Allowed Office IPs Management
// ============================================================
router.get('/allowed-ips', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, ip_address, label, active, created_at FROM allowed_ips ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch allowed IPs: ' + err.message });
  }
});

router.post('/allowed-ips', async (req, res) => {
  const { ip_address, label } = req.body;
  if (!ip_address || !ip_address.trim()) {
    return res.status(400).json({ error: 'IP address is required' });
  }

  const cleanIp = ip_address.trim();
  try {
    const { rows } = await pool.query(
      `INSERT INTO allowed_ips (ip_address, label, active)
       VALUES ($1, $2, TRUE)
       RETURNING id, ip_address, label, active, created_at`,
      [cleanIp, label ? label.trim() : null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add allowed IP: ' + err.message });
  }
});

router.delete('/allowed-ips/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM allowed_ips WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Allowed IP record not found' });
    }
    res.json({ ok: true, message: 'Allowed IP removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete allowed IP: ' + err.message });
  }
});

// ============================================================
// 2. Login History & Device Tracking
// ============================================================
router.get('/login-history', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  try {
    const { rows } = await pool.query(
      `SELECT lh.id, lh.user_id, u.full_name, u.username, u.role,
              lh.device_id, lh.ip_address, lh.user_agent, lh.device_label, lh.login_at,
              EXISTS(SELECT 1 FROM blocked_devices bd WHERE bd.device_id = lh.device_id) AS is_blocked
       FROM login_history lh
       LEFT JOIN users u ON u.id = lh.user_id
       ORDER BY lh.login_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch login history: ' + err.message });
  }
});

// ============================================================
// 3. Blocked Devices Management
// ============================================================
router.get('/blocked-devices', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT bd.id, bd.device_id, bd.reason, bd.created_at,
              u.full_name AS blocked_by_name, u.username AS blocked_by_username
       FROM blocked_devices bd
       LEFT JOIN users u ON u.id = bd.blocked_by_user_id
       ORDER BY bd.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blocked devices: ' + err.message });
  }
});

router.post('/blocked-devices', async (req, res) => {
  const { device_id, reason } = req.body;
  if (!device_id || !device_id.trim()) {
    return res.status(400).json({ error: 'Device ID is required' });
  }

  const cleanDeviceId = device_id.trim();
  const blockerUserId = req.user ? req.user.id : null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO blocked_devices (device_id, blocked_by_user_id, reason)
       VALUES ($1, $2, $3)
       ON CONFLICT (device_id)
       DO UPDATE SET reason = EXCLUDED.reason, blocked_by_user_id = EXCLUDED.blocked_by_user_id
       RETURNING id, device_id, reason, created_at`,
      [cleanDeviceId, blockerUserId, reason ? reason.trim() : 'Blocked by administrator']
    );
    res.status(201).json({ ok: true, blocked: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to block device: ' + err.message });
  }
});

router.delete('/blocked-devices/:id', async (req, res) => {
  const targetParam = req.params.id;
  const numId = Number(targetParam);

  try {
    const { rowCount } = await pool.query(
      'DELETE FROM blocked_devices WHERE id = $1 OR device_id = $2',
      [isNaN(numId) ? -1 : numId, targetParam]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Blocked device record not found' });
    }
    res.json({ ok: true, message: 'Device unblocked successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unblock device: ' + err.message });
  }
});

module.exports = router;
