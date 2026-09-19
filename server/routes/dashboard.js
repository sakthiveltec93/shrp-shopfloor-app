const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { getSupervisorDataFromDb, getManagementDataFromDb } = require('../db/queries/dashboard');
const { calculateSupervisorMetrics, calculateManagementMetrics } = require('../utils/dashboardCalculator');

router.use(requireAuth);

/**
 * 1. GET /api/dashboard/supervisor
 * Real-time operational data for current/selected shift
 */
router.get('/supervisor', async (req, res) => {
  try {
    const { date, shift } = req.query;
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const targetShift = shift || 'A';

    const rawData = await getSupervisorDataFromDb(targetDate, targetShift);
    const metrics = calculateSupervisorMetrics(rawData);

    res.json({
      date: targetDate,
      shift: targetShift,
      timestamp: new Date().toISOString(),
      ...metrics,
    });
  } catch (err) {
    console.error('Error fetching supervisor dashboard:', err);
    res.status(500).json({ error: 'Failed to fetch supervisor dashboard', details: err.message });
  }
});

/**
 * 2. GET /api/dashboard/management
 * Executive performance, OEE, trends, and MPS fulfillment
 */
router.get('/management', async (req, res) => {
  try {
    const { date, period = 'month', startDate, endDate } = req.query;
    const now = new Date();
    let startStr = '';
    let endStr = '';

    if (startDate && endDate) {
      startStr = startDate;
      endStr = endDate;
    } else if (period === 'today') {
      startStr = date || now.toISOString().slice(0, 10);
      endStr = startStr;
    } else if (period === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      startStr = y.toISOString().slice(0, 10);
      endStr = startStr;
    } else if (period === 'week') {
      const w = new Date();
      w.setDate(w.getDate() - 7);
      startStr = w.toISOString().slice(0, 10);
      endStr = now.toISOString().slice(0, 10);
    } else {
      // month to date (default)
      startStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      endStr = now.toISOString().slice(0, 10);
    }

    const rawData = await getManagementDataFromDb(startStr, endStr);
    const metrics = calculateManagementMetrics(rawData);

    res.json({
      period,
      startDate: startStr,
      endDate: endStr,
      timestamp: new Date().toISOString(),
      ...metrics,
    });
  } catch (err) {
    console.error('Error fetching management dashboard:', err);
    res.status(500).json({ error: 'Failed to fetch management dashboard', details: err.message });
  }
});

/**
 * 3. POST /api/dashboard/shift-handover
 * Log shift handover remarks from outgoing supervisor
 */
router.post('/shift-handover', async (req, res) => {
  try {
    const { shift, date, notes, pendingItems } = req.body;
    const userId = req.user.id;
    const userName = req.user.full_name;

    // Record notification/log
    await pool.query(
      `INSERT INTO user_activity_log (user_id, action, details)
       VALUES ($1, 'SHIFT_HANDOVER', $2)`,
      [
        userId,
        JSON.stringify({
          shift,
          date: date || new Date().toISOString().slice(0, 10),
          notes,
          pendingItems,
          by: userName,
          loggedAt: new Date().toISOString(),
        }),
      ]
    );

    res.status(201).json({
      ok: true,
      message: '✅ Shift handover notes recorded successfully.',
    });
  } catch (err) {
    console.error('Error saving shift handover:', err);
    res.status(500).json({ error: 'Failed to save shift handover notes', details: err.message });
  }
});

/**
 * 4. GET /api/dashboard/machine-drilldown/:id
 * Detailed hourly and FPA history for a single machine
 */
router.get('/machine-drilldown/:id', async (req, res) => {
  try {
    const machineId = req.params.id;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().slice(0, 10);

    const [machineInfo, entries, assignments, fpaHistory] = await Promise.all([
      pool.query('SELECT * FROM machines WHERE id = $1', [machineId]),
      pool.query(
        `SELECT pe.*, p.part_code, p.part_name, p.shrp_part_code, u.full_name AS operator_name
         FROM production_entries pe
         JOIN parts p ON p.id = pe.part_id
         LEFT JOIN users u ON u.id = pe.operator_user_id
         WHERE pe.machine_id = $1 AND pe.entry_date = $2
         ORDER BY pe.hour_slot ASC`,
        [machineId, targetDate]
      ),
      pool.query(
        `SELECT ma.*, p.part_code, p.part_name, p.shrp_part_code, u.full_name AS set_by_name
         FROM machine_assignments ma
         JOIN parts p ON p.id = ma.part_id
         LEFT JOIN users u ON u.id = ma.set_by_user_id
         WHERE ma.machine_id = $1
         ORDER BY ma.approved_at DESC LIMIT 5`,
        [machineId]
      ),
      pool.query(
        `SELECT f.*, p.part_code, p.part_name, p.shrp_part_code
         FROM fpa_submissions f
         JOIN parts p ON p.id = f.part_id
         WHERE f.machine_id = $1
         ORDER BY f.created_at DESC LIMIT 5`,
        [machineId]
      ),
    ]);

    res.json({
      machine: machineInfo.rows[0],
      entries: entries.rows,
      recentAssignments: assignments.rows,
      fpaHistory: fpaHistory.rows,
    });
  } catch (err) {
    console.error('Error in machine drilldown:', err);
    res.status(500).json({ error: 'Failed to fetch machine drilldown details' });
  }
});

module.exports = router;
