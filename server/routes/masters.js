const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/machines', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM machines WHERE active = TRUE ORDER BY machine_code');
  res.json(rows);
});

router.get('/customers', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM customers ORDER BY name');
  res.json(rows);
});

router.post('/customers', requireRole('admin', 'supervisor'), async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const { rows } = await pool.query(
    `INSERT INTO customers (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING *`,
    [name]
  );
  res.status(201).json(rows[0]);
});

// Lightweight list for dropdowns elsewhere in the app
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

// Full detail for the Add/Edit Part screen - part + customer + parameters +
// dimensions + suitable machines + file metadata (not raw file bytes).
router.get('/parts/:id/detail', async (req, res) => {
  const { id } = req.params;
  const partRes = await pool.query(
    `SELECT p.*, c.name AS customer_name FROM parts p
     LEFT JOIN customers c ON c.id = p.customer_id WHERE p.id = $1`,
    [id]
  );
  if (!partRes.rows[0]) return res.status(404).json({ error: 'Part not found' });

  const [params, dims, machines, files] = await Promise.all([
    pool.query('SELECT * FROM part_process_parameters WHERE part_id = $1 ORDER BY sort_order, id', [id]),
    pool.query('SELECT * FROM part_critical_dimensions WHERE part_id = $1 ORDER BY sort_order, id', [id]),
    pool.query('SELECT machine_id FROM part_machines WHERE part_id = $1', [id]),
    pool.query('SELECT id, file_type, filename, mime_type, uploaded_at FROM part_files WHERE part_id = $1 ORDER BY uploaded_at DESC', [id]),
  ]);

  res.json({
    ...partRes.rows[0],
    process_parameters: params.rows,
    critical_dimensions: dims.rows,
    suitable_machine_ids: machines.rows.map((r) => r.machine_id),
    files: files.rows,
  });
});

// Create a part - supervisor/admin only
router.post('/parts', requireRole('admin', 'supervisor'), async (req, res) => {
  const {
    part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
    trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty,
    customer_id, notes, batch_part_code, part_weight_g,
  } = req.body;
  if (!part_code || !part_name || !standard_cycle_time_sec) {
    return res.status(400).json({ error: 'part_code, part_name and standard_cycle_time_sec are required' });
  }
  const { rows } = await pool.query(
    `INSERT INTO parts (part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
       trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty,
       customer_id, notes, batch_part_code, part_weight_g)
     VALUES ($1, $2, COALESCE($3, 1), $4, $5, COALESCE($6,FALSE), COALESCE($7,FALSE), COALESCE($8,TRUE), COALESCE($9,TRUE), $10, $11, $12, $13, $14)
     RETURNING *`,
    [part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
      trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty,
      customer_id || null, notes || null, batch_part_code || null, part_weight_g || null]
  );
  res.status(201).json(rows[0]);
});

// Update a part's scalar fields - supervisor/admin only
router.put('/parts/:id', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const {
    part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
    trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty,
    customer_id, notes, active, batch_part_code, part_weight_g,
  } = req.body;
  const { rows } = await pool.query(
    `UPDATE parts SET
       part_code = COALESCE($1, part_code),
       part_name = COALESCE($2, part_name),
       cavity_count = COALESCE($3, cavity_count),
       standard_cycle_time_sec = COALESCE($4, standard_cycle_time_sec),
       unit_weight_g = $5,
       trim_required = COALESCE($6, trim_required),
       inspection_required = COALESCE($7, inspection_required),
       packing_required = COALESCE($8, packing_required),
       dispatch_required = COALESCE($9, dispatch_required),
       standard_pack_qty = $10,
       customer_id = $11,
       notes = $12,
       active = COALESCE($13, active),
       batch_part_code = $14,
       part_weight_g = $15
     WHERE id = $16 RETURNING *`,
    [part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
      trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty,
      customer_id || null, notes || null, active, batch_part_code || null, part_weight_g || null, id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Part not found' });
  res.json(rows[0]);
});

// Replace all process parameters for a part (repeatable-rows form pattern)
router.put('/parts/:id/parameters', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const { parameters } = req.body; // [{ parameter_name, value, unit }]
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM part_process_parameters WHERE part_id = $1', [id]);
    let i = 0;
    for (const p of parameters || []) {
      await client.query(
        `INSERT INTO part_process_parameters (part_id, parameter_name, value, unit, sort_order)
         VALUES ($1,$2,$3,$4,$5)`,
        [id, p.parameter_name, p.value, p.unit || null, i++]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  const { rows } = await pool.query('SELECT * FROM part_process_parameters WHERE part_id = $1 ORDER BY sort_order, id', [id]);
  res.json(rows);
});

// Replace all critical dimensions for a part
router.put('/parts/:id/dimensions', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const { dimensions } = req.body; // [{ dimension_name, nominal_value, tol_plus, tol_minus, unit }]
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM part_critical_dimensions WHERE part_id = $1', [id]);
    let i = 0;
    for (const d of dimensions || []) {
      await client.query(
        `INSERT INTO part_critical_dimensions (part_id, dimension_name, nominal_value, tol_plus, tol_minus, unit, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [id, d.dimension_name, d.nominal_value || null, d.tol_plus || null, d.tol_minus || null, d.unit || null, i++]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  const { rows } = await pool.query('SELECT * FROM part_critical_dimensions WHERE part_id = $1 ORDER BY sort_order, id', [id]);
  res.json(rows);
});

// Replace suitable machines for a part
router.put('/parts/:id/machines', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const { machine_ids } = req.body; // [1,2,3]
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM part_machines WHERE part_id = $1', [id]);
    for (const mid of machine_ids || []) {
      await client.query('INSERT INTO part_machines (part_id, machine_id) VALUES ($1,$2)', [id, mid]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  res.json({ machine_ids: machine_ids || [] });
});

// Upload a file (photo/sop/ppap) - base64-encoded in the JSON body
router.post('/parts/:id/files', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const { file_type, filename, mime_type, data_base64 } = req.body;
  if (!['photo', 'sop', 'ppap'].includes(file_type)) {
    return res.status(400).json({ error: "file_type must be 'photo', 'sop' or 'ppap'" });
  }
  if (!filename || !mime_type || !data_base64) {
    return res.status(400).json({ error: 'filename, mime_type and data_base64 are required' });
  }
  const buffer = Buffer.from(data_base64, 'base64');
  const { rows } = await pool.query(
    `INSERT INTO part_files (part_id, file_type, filename, mime_type, data, uploaded_by_user_id)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, file_type, filename, mime_type, uploaded_at`,
    [id, file_type, filename, mime_type, buffer, req.user.id]
  );
  res.status(201).json(rows[0]);
});

// Stream a file's raw bytes (used directly as <img src> / download link)
router.get('/parts/:partId/files/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const { rows } = await pool.query('SELECT * FROM part_files WHERE id = $1', [fileId]);
  const file = rows[0];
  if (!file) return res.status(404).send('Not found');
  res.setHeader('Content-Type', file.mime_type);
  res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
  res.send(file.data);
});

router.delete('/parts/:partId/files/:fileId', requireRole('admin', 'supervisor'), async (req, res) => {
  const { fileId } = req.params;
  await pool.query('DELETE FROM part_files WHERE id = $1', [fileId]);
  res.status(204).send();
});

module.exports = router;
