const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/machines', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM machines WHERE active = TRUE ORDER BY machine_code');
  res.json(rows);
});

router.get('/parts', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM parts WHERE active = TRUE ORDER BY part_code');
  res.json(rows);
});

router.get('/check-items', async (req, res) => {
  const { category } = req.query;
  const { rows } = category
    ? await pool.query('SELECT * FROM check_items WHERE category = $1 ORDER BY item_name', [category])
    : await pool.query('SELECT * FROM check_items ORDER BY category, item_name');
  res.json(rows);
});

// Admin-only: add a part to the master
router.post('/parts', requireRole('admin', 'supervisor'), async (req, res) => {
  const {
    part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
    trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty,
  } = req.body;
  if (!part_code || !part_name || !standard_cycle_time_sec) {
    return res.status(400).json({ error: 'part_code, part_name and standard_cycle_time_sec are required' });
  }
  const { rows } = await pool.query(
    `INSERT INTO parts (part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
       trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty)
     VALUES ($1, $2, COALESCE($3, 1), $4, $5, COALESCE($6,FALSE), COALESCE($7,FALSE), COALESCE($8,TRUE), COALESCE($9,TRUE), $10)
     RETURNING *`,
    [part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
      trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty]
  );
  res.status(201).json(rows[0]);
});

module.exports = router;
