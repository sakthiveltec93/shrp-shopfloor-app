const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Get dispatch history with optional filters
router.get('/history', async (req, res) => {
  const { date_from, date_to, customer_id } = req.query;

  try {
    let query = `
      SELECT
        de.id,
        de.bag_id,
        b.bag_code,
        b.batch_no,
        b.part_id,
        p.part_code,
        p.shrp_part_code,
        p.part_name,
        p.customer_part_no,
        de.dispatched_qty,
        de.dispatched_wt_kg,
        de.customer_id,
        c.customer_code,
        c.customer_name,
        de.invoice_no,
        de.vehicle_no,
        de.remarks,
        de.created_at,
        u.full_name AS dispatched_by
      FROM dispatch_entries de
      JOIN bags b ON b.id = de.bag_id
      JOIN parts p ON p.id = b.part_id
      LEFT JOIN customers c ON c.id = de.customer_id
      JOIN users u ON u.id = de.operator_user_id
      WHERE b.status = 'DISPATCHED'
    `;

    const params = [];

    if (date_from) {
      params.push(date_from);
      query += ` AND DATE(de.created_at) >= $${params.length}`;
    }

    if (date_to) {
      params.push(date_to);
      query += ` AND DATE(de.created_at) <= $${params.length}`;
    }

    if (customer_id) {
      params.push(Number(customer_id));
      query += ` AND de.customer_id = $${params.length}`;
    }

    query += ` ORDER BY de.created_at DESC LIMIT 500`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific dispatch entry
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(`
      SELECT
        de.*,
        b.bag_code,
        b.batch_no,
        b.part_id,
        p.part_code,
        p.shrp_part_code,
        p.part_name,
        c.customer_code,
        c.customer_name,
        u.full_name AS dispatched_by
      FROM dispatch_entries de
      JOIN bags b ON b.id = de.bag_id
      JOIN parts p ON p.id = b.part_id
      LEFT JOIN customers c ON c.id = de.customer_id
      JOIN users u ON u.id = de.operator_user_id
      WHERE de.id = $1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Dispatch entry not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate gate pass data for one or more dispatches
router.post('/gate-pass', async (req, res) => {
  const { dispatch_ids } = req.body;

  if (!Array.isArray(dispatch_ids) || dispatch_ids.length === 0) {
    return res.status(400).json({ error: 'dispatch_ids array required' });
  }

  try {
    const placeholders = dispatch_ids.map((_, i) => `$${i + 1}`).join(',');
    const { rows } = await pool.query(`
      SELECT
        de.id,
        de.bag_id,
        b.bag_code,
        b.batch_no,
        b.qty,
        de.dispatched_qty,
        de.dispatched_wt_kg,
        p.part_code,
        p.shrp_part_code,
        p.part_name,
        c.customer_code,
        c.customer_name,
        de.vehicle_no,
        de.invoice_no,
        de.created_at,
        de.operator_user_id,
        u.full_name AS operator_name
      FROM dispatch_entries de
      JOIN bags b ON b.id = de.bag_id
      JOIN parts p ON p.id = b.part_id
      LEFT JOIN customers c ON c.id = de.customer_id
      JOIN users u ON u.id = de.operator_user_id
      WHERE de.id IN (${placeholders})
      ORDER BY de.created_at DESC
    `, dispatch_ids);

    // Generate gate pass slip data
    const gatePassSlips = rows.map((row, idx) => ({
      slip_number: idx + 1,
      total_slips: rows.length,
      dispatch_id: row.id,
      bag_code: row.bag_code,
      batch_no: row.batch_no,
      part_code: row.shrp_part_code || row.part_code,
      part_name: row.part_name,
      quantity: row.dispatched_qty,
      weight_kg: row.dispatched_wt_kg,
      customer_name: row.customer_name,
      customer_code: row.customer_code,
      vehicle_no: row.vehicle_no || 'TBD',
      invoice_no: row.invoice_no || 'TBD',
      dispatch_date: new Date(row.created_at).toLocaleDateString('en-GB'),
      dispatch_time: new Date(row.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      operator_name: row.operator_name,
    }));

    res.json({
      success: true,
      total_slips: rows.length,
      slips: gatePassSlips
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
