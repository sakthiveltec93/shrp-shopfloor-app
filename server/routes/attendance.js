const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { haversineMeters } = require('../lib/geo');
const { istDateString } = require('../lib/shift');

const router = express.Router();
router.use(requireAuth);

const DEFAULT_RADIUS_M = 200;

async function getSettings() {
  const { rows } = await pool.query(
    "SELECT key, value FROM app_settings WHERE key IN ('geofence_lat','geofence_lng','geofence_radius_m')"
  );
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    lat: map.geofence_lat != null ? Number(map.geofence_lat) : null,
    lng: map.geofence_lng != null ? Number(map.geofence_lng) : null,
    radius_m: map.geofence_radius_m != null ? Number(map.geofence_radius_m) : DEFAULT_RADIUS_M,
  };
}

// Anyone can read the geofence center/radius - it's not a secret, and the
// check-in screen needs it to show "you're 40m away" before submitting.
router.get('/settings', async (req, res) => {
  res.json(await getSettings());
});

// Only an admin can move the factory's geofence center or change its radius.
router.put('/settings', requireRole('admin'), async (req, res) => {
  const { lat, lng, radius_m } = req.body;
  if (lat == null || lng == null) return res.status(400).json({ error: 'lat and lng are required' });
  const entries = [
    ['geofence_lat', String(lat)],
    ['geofence_lng', String(lng)],
    ['geofence_radius_m', String(radius_m || DEFAULT_RADIUS_M)],
  ];
  for (const [key, value] of entries) {
    await pool.query(
      'INSERT INTO app_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
      [key, value]
    );
  }
  res.json(await getSettings());
});

router.get('/today', async (req, res) => {
  const date = istDateString(new Date());
  const { rows } = await pool.query(
    'SELECT * FROM attendance WHERE user_id = $1 AND attendance_date = $2',
    [req.user.id, date]
  );
  res.json(rows[0] || null);
});

// Check in - blocked if outside the geofence (when one is configured).
// One check-in per user per day; re-posting after check-in is a no-op that
// just returns the existing row rather than erroring, so a flaky network
// retry doesn't confuse the operator.
router.post('/check-in', async (req, res) => {
  const { lat, lng } = req.body;
  if (lat == null || lng == null) return res.status(400).json({ error: 'lat and lng are required' });

  const settings = await getSettings();
  let distance = null;
  let within = true;
  if (settings.lat != null && settings.lng != null) {
    distance = haversineMeters(Number(lat), Number(lng), settings.lat, settings.lng);
    within = distance <= settings.radius_m;
    if (!within) {
      return res.status(403).json({
        error: `You're ${Math.round(distance)}m from the factory - check-in only works within ${settings.radius_m}m.`,
        distance_m: Math.round(distance),
        radius_m: settings.radius_m,
      });
    }
  }

  const date = istDateString(new Date());
  const { rows } = await pool.query(
    `INSERT INTO attendance (user_id, attendance_date, check_in_at, check_in_lat, check_in_lng, check_in_distance_m, check_in_within_geofence)
     VALUES ($1,$2,now(),$3,$4,$5,$6)
     ON CONFLICT (user_id, attendance_date) DO UPDATE SET
       check_in_at = COALESCE(attendance.check_in_at, EXCLUDED.check_in_at),
       check_in_lat = COALESCE(attendance.check_in_lat, EXCLUDED.check_in_lat),
       check_in_lng = COALESCE(attendance.check_in_lng, EXCLUDED.check_in_lng),
       check_in_distance_m = COALESCE(attendance.check_in_distance_m, EXCLUDED.check_in_distance_m),
       check_in_within_geofence = COALESCE(attendance.check_in_within_geofence, EXCLUDED.check_in_within_geofence)
     RETURNING *`,
    [req.user.id, date, lat, lng, distance, within]
  );
  res.status(201).json(rows[0]);
});

// Check out - never blocked by the geofence (an operator stepping outside
// at the end of shift shouldn't get trapped); distance is still recorded
// for a supervisor to review if it looks off.
router.post('/check-out', async (req, res) => {
  const { lat, lng } = req.body;
  if (lat == null || lng == null) return res.status(400).json({ error: 'lat and lng are required' });

  const settings = await getSettings();
  let distance = null;
  let within = true;
  if (settings.lat != null && settings.lng != null) {
    distance = haversineMeters(Number(lat), Number(lng), settings.lat, settings.lng);
    within = distance <= settings.radius_m;
  }

  const date = istDateString(new Date());
  const { rows } = await pool.query(
    `UPDATE attendance
     SET check_out_at = now(), check_out_lat = $1, check_out_lng = $2, check_out_distance_m = $3, check_out_within_geofence = $4
     WHERE user_id = $5 AND attendance_date = $6 AND check_in_at IS NOT NULL
     RETURNING *`,
    [lat, lng, distance, within, req.user.id, date]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Check in first before checking out.' });
  res.json(rows[0]);
});

// Supervisor/admin roster view for a given day (defaults to today).
router.get('/', requireRole('supervisor', 'admin'), async (req, res) => {
  const { date } = req.query;
  const d = date || istDateString(new Date());
  const { rows } = await pool.query(
    `SELECT a.*, u.full_name, u.username
     FROM attendance a JOIN users u ON u.id = a.user_id
     WHERE a.attendance_date = $1
     ORDER BY a.check_in_at NULLS LAST`,
    [d]
  );
  res.json(rows);
});

module.exports = router;
