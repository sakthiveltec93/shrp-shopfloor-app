const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { haversineMeters } = require('../lib/geo');

const router = express.Router();
router.use(requireAuth);
router.use(requireRole('admin'));

// Helper to get factory geofence settings
async function getGeofenceSettings() {
  const { rows } = await pool.query(
    "SELECT key, value FROM app_settings WHERE key IN ('geofence_lat','geofence_lng','geofence_radius_m')"
  );
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    lat: map.geofence_lat != null ? Number(map.geofence_lat) : null,
    lng: map.geofence_lng != null ? Number(map.geofence_lng) : null,
    radius_m: map.geofence_radius_m != null ? Number(map.geofence_radius_m) : 200,
  };
}

// ============================================================
// 0. Approved & Pending Devices Management (Strict Allowlist)
// ============================================================
router.get('/approved-devices', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ad.id, ad.device_id, ad.device_label, ad.approved_at,
              ad.approval_lat, ad.approval_lng, ad.approval_distance_m,
              u.full_name AS approved_by_name, u.username AS approved_by_username,
              (
                SELECT json_agg(DISTINCT jsonb_build_object('full_name', u2.full_name, 'username', u2.username))
                FROM login_history lh
                JOIN users u2 ON u2.id = lh.user_id
                WHERE lh.device_id = ad.device_id
              ) AS used_by,
              (
                SELECT MAX(lh.login_at) FROM login_history lh WHERE lh.device_id = ad.device_id
              ) AS last_login_at
       FROM approved_devices ad
       LEFT JOIN users u ON u.id = ad.approved_by_user_id
       ORDER BY ad.approved_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch approved devices: ' + err.message });
  }
});

router.get('/pending-devices', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
         lh.device_id,
         COALESCE(MAX(lh.device_label), 'Unknown Device') AS device_label,
         MAX(lh.login_at) AS last_attempt_at,
         MIN(lh.login_at) AS first_seen_at,
         COUNT(lh.id)::int AS attempt_count,
         MAX(lh.ip_address) AS latest_ip,
         EXISTS(SELECT 1 FROM blocked_devices bd WHERE bd.device_id = lh.device_id) AS is_blocked,
         json_agg(DISTINCT jsonb_build_object(
           'user_id', u.id,
           'username', u.username,
           'full_name', u.full_name,
           'role', u.role
         )) FILTER (WHERE u.id IS NOT NULL) AS attempted_users
       FROM login_history lh
       LEFT JOIN users u ON u.id = lh.user_id
       WHERE NOT EXISTS (
         SELECT 1 FROM approved_devices ad WHERE ad.device_id = lh.device_id
       )
       AND lh.device_id IS NOT NULL 
       AND lh.device_id != 'unknown'
       GROUP BY lh.device_id
       ORDER BY MAX(lh.login_at) DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending devices: ' + err.message });
  }
});

router.post('/approved-devices', async (req, res) => {
  const { device_id, device_label, lat, lng } = req.body;
  if (!device_id || !device_id.trim()) {
    return res.status(400).json({ error: 'Device ID is required.' });
  }

  const cleanDeviceId = device_id.trim();
  const settings = await getGeofenceSettings();
  let distanceM = null;

  if (settings.lat != null && settings.lng != null) {
    if (lat == null || lng == null) {
      return res.status(400).json({
        error: 'GPS location is required to verify factory premises before approving a device.',
      });
    }
    distanceM = Math.round(haversineMeters(Number(lat), Number(lng), settings.lat, settings.lng));
    if (distanceM > settings.radius_m) {
      return res.status(403).json({
        error: `Device approval must be done within factory premises. You are ${distanceM}m away (allowed radius: ${settings.radius_m}m).`,
        distance_m: distanceM,
        radius_m: settings.radius_m,
      });
    }
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO approved_devices (device_id, device_label, approved_by_user_id, approved_at, approval_lat, approval_lng, approval_distance_m)
       VALUES ($1, $2, $3, now(), $4, $5, $6)
       ON CONFLICT (device_id) DO UPDATE SET
         device_label = COALESCE(EXCLUDED.device_label, approved_devices.device_label),
         approved_by_user_id = EXCLUDED.approved_by_user_id,
         approved_at = EXCLUDED.approved_at,
         approval_lat = EXCLUDED.approval_lat,
         approval_lng = EXCLUDED.approval_lng,
         approval_distance_m = EXCLUDED.approval_distance_m
       RETURNING *`,
      [
        cleanDeviceId,
        device_label ? device_label.trim() : 'Approved Device',
        req.user.id,
        lat != null ? Number(lat) : null,
        lng != null ? Number(lng) : null,
        distanceM,
      ]
    );

    res.status(201).json({
      ok: true,
      approved_device: rows[0],
      message: `Device '${rows[0].device_label || rows[0].device_id}' approved successfully${distanceM != null ? ` (${distanceM}m from factory center)` : ''}.`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve device: ' + err.message });
  }
});

router.delete('/approved-devices/:id', async (req, res) => {
  const targetParam = req.params.id;
  const numId = Number(targetParam);

  try {
    const { rowCount } = await pool.query(
      'DELETE FROM approved_devices WHERE id = $1 OR device_id = $2',
      [isNaN(numId) ? -1 : numId, targetParam]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Approved device record not found' });
    }
    res.json({ ok: true, message: 'Device approval revoked successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke device approval: ' + err.message });
  }
});

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
              u.full_name AS blocked_by_name, u.username AS blocked_by_username,
              (
                SELECT json_agg(DISTINCT jsonb_build_object('full_name', u2.full_name, 'username', u2.username))
                FROM login_history lh
                JOIN users u2 ON u2.id = lh.user_id
                WHERE lh.device_id = bd.device_id
              ) AS used_by,
              (
                SELECT MAX(lh.login_at) FROM login_history lh WHERE lh.device_id = bd.device_id
              ) AS last_login_at
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
