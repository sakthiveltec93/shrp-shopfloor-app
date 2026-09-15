const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function calibrationStatus(lastCalibratedAt, intervalDays) {
  if (!lastCalibratedAt) return 'OVERDUE';
  const elapsedDays = (Date.now() - new Date(lastCalibratedAt).getTime()) / 86400000;
  const pct = (elapsedDays / Math.max(1, Number(intervalDays) || 365)) * 100;
  if (pct >= 100) return 'OVERDUE';
  if (pct >= 85) return 'DUE_SOON';
  return 'HEALTHY';
}

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM gauges ORDER BY gauge_code');
  const withStatus = rows.map((g) => ({
    ...g,
    calibration_status: calibrationStatus(g.last_calibrated_at, g.calibration_interval_days),
  }));
  res.json(withStatus);
});

router.get('/calibration-summary', async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, gauge_code, gauge_name, last_calibrated_at, calibration_interval_days FROM gauges WHERE status = 'active'"
  );
  const summary = { HEALTHY: 0, DUE_SOON: 0, OVERDUE: 0 };
  const gauges = rows.map((g) => {
    const status = calibrationStatus(g.last_calibrated_at, g.calibration_interval_days);
    summary[status] += 1;
    return { id: g.id, gauge_code: g.gauge_code, gauge_name: g.gauge_name, calibration_status: status };
  });
  res.json({ summary, gauges });
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM gauges WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Gauge not found' });
  const g = rows[0];
  res.json({ ...g, calibration_status: calibrationStatus(g.last_calibrated_at, g.calibration_interval_days) });
});

router.post('/', requireRole('admin', 'supervisor'), async (req, res) => {
  const {
    gauge_code, gauge_name, gauge_type, range_spec, accuracy, location,
    calibration_interval_days, last_calibrated_at, calibration_cert_no,
  } = req.body;

  if (!gauge_code || !gauge_name) {
    return res.status(400).json({ error: 'gauge_code and gauge_name are required' });
  }

  const { rows } = await pool.query(
    `INSERT INTO gauges
      (gauge_code, gauge_name, gauge_type, range_spec, accuracy, location,
       calibration_interval_days, last_calibrated_at, calibration_cert_no)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [gauge_code, gauge_name, gauge_type || null, range_spec || null, accuracy || null, location || null,
      Number(calibration_interval_days) || 365, last_calibrated_at || null, calibration_cert_no || null]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const {
    gauge_code, gauge_name, gauge_type, range_spec, accuracy, location,
    calibration_interval_days, last_calibrated_at, calibration_cert_no, status,
  } = req.body;

  const { rows } = await pool.query(
    `UPDATE gauges SET
       gauge_code = COALESCE($1, gauge_code),
       gauge_name = COALESCE($2, gauge_name),
       gauge_type = COALESCE($3, gauge_type),
       range_spec = COALESCE($4, range_spec),
       accuracy = COALESCE($5, accuracy),
       location = COALESCE($6, location),
       calibration_interval_days = COALESCE($7, calibration_interval_days),
       last_calibrated_at = COALESCE($8, last_calibrated_at),
       calibration_cert_no = COALESCE($9, calibration_cert_no),
       status = COALESCE($10, status)
     WHERE id = $11 RETURNING *`,
    [gauge_code, gauge_name, gauge_type, range_spec, accuracy, location,
      calibration_interval_days != null ? Number(calibration_interval_days) : null,
      last_calibrated_at, calibration_cert_no, status, id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Gauge not found' });
  res.json(rows[0]);
});

// Record a calibration event: sets last_calibrated_at = now (or given date) and cert number.
router.post('/:id/calibrate', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const { calibrated_at, calibration_cert_no } = req.body;
  const { rows } = await pool.query(
    `UPDATE gauges SET last_calibrated_at = COALESCE($1, CURRENT_DATE), calibration_cert_no = COALESCE($2, calibration_cert_no)
     WHERE id = $3 RETURNING *`,
    [calibrated_at || null, calibration_cert_no || null, id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Gauge not found' });
  res.json(rows[0]);
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT gauge_code, gauge_name FROM gauges WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Gauge not found' });

    await pool.query('DELETE FROM gauges WHERE id = $1', [id]);
    res.json({ ok: true, message: `Gauge "${rows[0].gauge_name}" (${rows[0].gauge_code}) deleted permanently.` });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'This gauge has linked history and cannot be permanently deleted. Deactivate it instead.',
      });
    }
    console.error('Error deleting gauge:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
