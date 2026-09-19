const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { optimizeImage } = require('../lib/imageProcessor');
const { isValidGSTIN } = require('../lib/gstinValidator');
const { uploadFile, getFile, deleteFile, isR2Configured } = require('../lib/r2');
const { getSuggestedDocFormat, formatDocumentNumber } = require('../lib/docSequenceHelper');

const router = express.Router();
router.use(requireAuth);

router.get('/machines', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM machines WHERE active = TRUE ORDER BY machine_code');
  res.json(rows);
});

router.get('/customers', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT c.*,
           c.name AS customer_name,
           COUNT(p.id) FILTER (WHERE p.active = TRUE)::int AS active_parts_count
    FROM customers c
    LEFT JOIN parts p ON p.customer_id = c.id
    GROUP BY c.id
    ORDER BY c.active DESC, c.name ASC
  `);
  res.json(rows);
});

router.post('/customers', requireRole('admin', 'supervisor'), async (req, res) => {
  const {
    customer_code, name, gstin, pan_no, contact_person, phone, email,
    address, city, state, pincode, payment_terms, active,
    gst_last_verified_at, gst_verification_status,
  } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Customer name is required' });

  const cleanGstin = gstin ? gstin.trim().toUpperCase() : null;
  if (cleanGstin && !isValidGSTIN(cleanGstin)) {
    return res.status(400).json({ error: 'Invalid GSTIN format or checksum digit. Please verify the 15-character GST number.' });
  }

  let code = customer_code && customer_code.trim();
  if (!code) {
    const seqRes = await pool.query("SELECT * FROM document_sequences WHERE document_type = 'CUSTOMER'");
    if (seqRes.rows[0]) {
      const seq = seqRes.rows[0];
      const nextVal = Number(seq.current_number || 0) + 1;
      await pool.query('UPDATE document_sequences SET current_number = $1, updated_at = now() WHERE id = $2', [nextVal, seq.id]);
      code = formatDocumentNumber({
        prefix: seq.prefix,
        padding_digits: seq.padding_digits,
        include_year: seq.include_year,
        suffix: seq.suffix,
        number: nextVal,
      });
    } else {
      code = 'SHRP/C-' + String(Math.floor(Math.random() * 90) + 10);
    }
  }

  const { rows } = await pool.query(
    `INSERT INTO customers (
       customer_code, name, gstin, pan_no, contact_person, phone, email,
       address, city, state, pincode, payment_terms, active,
       gst_last_verified_at, gst_verification_status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, COALESCE($13, TRUE), $14, $15)
     ON CONFLICT (name) DO UPDATE SET
       customer_code = COALESCE(EXCLUDED.customer_code, customers.customer_code),
       gstin = COALESCE(EXCLUDED.gstin, customers.gstin),
       pan_no = COALESCE(EXCLUDED.pan_no, customers.pan_no),
       contact_person = COALESCE(EXCLUDED.contact_person, customers.contact_person),
       phone = COALESCE(EXCLUDED.phone, customers.phone),
       email = COALESCE(EXCLUDED.email, customers.email),
       address = COALESCE(EXCLUDED.address, customers.address),
       city = COALESCE(EXCLUDED.city, customers.city),
       state = COALESCE(EXCLUDED.state, customers.state),
       pincode = COALESCE(EXCLUDED.pincode, customers.pincode),
       payment_terms = COALESCE(EXCLUDED.payment_terms, customers.payment_terms),
       active = COALESCE(EXCLUDED.active, customers.active),
       gst_last_verified_at = COALESCE(EXCLUDED.gst_last_verified_at, customers.gst_last_verified_at),
       gst_verification_status = COALESCE(EXCLUDED.gst_verification_status, customers.gst_verification_status)
     RETURNING *`,
    [
      code, name.trim(), cleanGstin, pan_no || null, contact_person || null, phone || null,
      email || null, address || null, city || null, state || 'Tamil Nadu', pincode || null,
      payment_terms || '30 Days', active !== false,
      gst_last_verified_at || null, gst_verification_status || null,
    ]
  );
  res.status(201).json(rows[0]);
});

router.put('/customers/:id', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const {
    customer_code, name, gstin, pan_no, contact_person, phone, email,
    address, city, state, pincode, payment_terms, active,
    gst_last_verified_at, gst_verification_status,
  } = req.body;

  const cleanGstin = gstin ? gstin.trim().toUpperCase() : null;
  if (cleanGstin && !isValidGSTIN(cleanGstin)) {
    return res.status(400).json({ error: 'Invalid GSTIN format or checksum digit. Please verify the 15-character GST number.' });
  }

  const { rows } = await pool.query(
    `UPDATE customers SET
       customer_code = COALESCE($1, customer_code),
       name = COALESCE($2, name),
       gstin = $3,
       pan_no = $4,
       contact_person = $5,
       phone = $6,
       email = $7,
       address = $8,
       city = $9,
       state = COALESCE($10, state),
       pincode = $11,
       payment_terms = COALESCE($12, payment_terms),
       active = COALESCE($13, active),
       gst_last_verified_at = COALESCE($14, gst_last_verified_at),
       gst_verification_status = COALESCE($15, gst_verification_status)
     WHERE id = $16 RETURNING *`,
    [
      customer_code, name ? name.trim() : null, cleanGstin, pan_no || null,
      contact_person || null, phone || null, email || null, address || null,
      city || null, state || null, pincode || null, payment_terms || null,
      active, gst_last_verified_at || null, gst_verification_status || null, id
    ]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Customer not found' });
  res.json(rows[0]);
});

router.delete('/customers/:id', requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT id, name FROM customers WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Customer not found' });
    await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    res.json({ ok: true, message: `Customer "${rows[0].name}" deleted permanently.` });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'This customer has linked parts or dispatches and cannot be permanently deleted. Deactivate it instead.',
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// Lightweight list for dropdowns and masters list, with photo_file_id, customer and mould details
router.get('/parts', async (req, res) => {
  const includeInactive = req.query.include_inactive === 'true' || req.query.all === 'true';
  const { rows } = await pool.query(`
    SELECT p.*,
           c.name AS customer_name,
           c.customer_code,
           m.mould_code,
           m.mould_name,
           COALESCE(mp.cavities_for_part, p.cavity_count, 1) AS cavities_for_part,
           p.standard_cycle_time_sec AS cycle_time_seconds,
           COALESCE(p.unit_weight_g, p.part_weight_g) AS net_weight_grams,
           COALESCE(p.part_weight_g, p.unit_weight_g) AS gross_weight_grams,
           (SELECT pf.id FROM part_files pf WHERE pf.part_id = p.id AND pf.file_type = 'photo' ORDER BY pf.uploaded_at DESC LIMIT 1) AS photo_file_id
    FROM parts p
    LEFT JOIN customers c ON c.id = p.customer_id
    LEFT JOIN mould_parts mp ON mp.part_id = p.id
    LEFT JOIN moulds m ON m.id = mp.mould_id
    WHERE ($1::boolean IS TRUE OR p.active = TRUE)
    ORDER BY p.part_code
  `, [includeInactive]);
  res.json(rows);
});

router.get('/check-items', async (req, res) => {
  const { category } = req.query;
  const { rows } = category
    ? await pool.query('SELECT * FROM check_items WHERE category = $1 ORDER BY code NULLS LAST, item_name', [category])
    : await pool.query('SELECT * FROM check_items ORDER BY category, code NULLS LAST, item_name');
  res.json(rows);
});

router.post('/check-items', requireRole('admin', 'supervisor'), async (req, res) => {
  const { item_name, category, code, default_disposition, related_to } = req.body;
  if (!item_name || !category) return res.status(400).json({ error: 'item_name and category are required' });
  const { rows } = await pool.query(
    `INSERT INTO check_items (item_name, category, code, default_disposition, related_to)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (item_name, category) DO UPDATE SET code = EXCLUDED.code, default_disposition = EXCLUDED.default_disposition, related_to = EXCLUDED.related_to
     RETURNING *`,
    [item_name, category, code || null, default_disposition || null, related_to || null]
  );
  res.status(201).json(rows[0]);
});

router.put('/check-items/:id', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const { item_name, category, code, default_disposition, related_to } = req.body;
  const { rows } = await pool.query(
    `UPDATE check_items SET
       item_name = COALESCE($1, item_name),
       category = COALESCE($2, category),
       code = $3,
       default_disposition = $4,
       related_to = $5
     WHERE id = $6 RETURNING *`,
    [item_name, category, code, default_disposition, related_to, id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Check item not found' });
  res.json(rows[0]);
});

router.delete('/check-items/:id', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM check_items WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Check item not found' });
    res.json({ ok: true, deleted: result.rows[0] });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete: this item is referenced in existing production logs.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Daily Check Items (Machine/Shift check sheet points)
router.get('/daily-check-items', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM daily_check_items ORDER BY sort_order, id');
  res.json(rows);
});

router.post('/daily-check-items', requireRole('admin', 'supervisor'), async (req, res) => {
  const { item_name, local_label, specification, icon, category, sort_order, active } = req.body;
  if (!item_name) return res.status(400).json({ error: 'item_name is required' });
  const { rows } = await pool.query(
    `INSERT INTO daily_check_items (item_name, local_label, specification, icon, category, sort_order, active)
     VALUES ($1, $2, $3, $4, COALESCE($5, 'MACHINE'), COALESCE($6, 0), COALESCE($7, TRUE))
     RETURNING *`,
    [item_name, local_label || null, specification || null, icon || null, category || 'MACHINE', sort_order || 0, active !== false]
  );
  res.status(201).json(rows[0]);
});

router.put('/daily-check-items/:id', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const { item_name, local_label, specification, icon, category, sort_order, active } = req.body;
  const { rows } = await pool.query(
    `UPDATE daily_check_items SET
       item_name = COALESCE($1, item_name),
       local_label = $2,
       specification = $3,
       icon = $4,
       category = COALESCE($5, category),
       sort_order = COALESCE($6, sort_order),
       active = COALESCE($7, active)
     WHERE id = $8 RETURNING *`,
    [item_name, local_label, specification, icon, category, sort_order, active, id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Daily check item not found' });
  res.json(rows[0]);
});

router.delete('/daily-check-items/:id', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM daily_check_items WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Daily check item not found' });
    res.json({ ok: true, deleted: result.rows[0] });
  } catch (err) {
    if (err.code === '23503') {
      await pool.query('UPDATE daily_check_items SET active = FALSE WHERE id = $1', [id]);
      return res.json({ ok: true, message: 'Item linked to submissions; deactivated.' });
    }
    res.status(500).json({ error: err.message });
  }
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

  const [params, dims, machines, files, moulds] = await Promise.all([
    pool.query('SELECT * FROM part_process_parameters WHERE part_id = $1 ORDER BY sort_order, id', [id]),
    pool.query('SELECT * FROM part_critical_dimensions WHERE part_id = $1 ORDER BY sort_order, id', [id]),
    pool.query('SELECT machine_id FROM part_machines WHERE part_id = $1', [id]),
    pool.query('SELECT id, file_type, filename, mime_type, uploaded_at FROM part_files WHERE part_id = $1 ORDER BY uploaded_at DESC', [id]),
    pool.query(`
      SELECT m.id AS mould_id, m.mould_code, m.mould_name, m.total_cavities, mp.cavities_for_part,
             m.storage_location, m.tool_type, m.tool_maker, m.suitable_machines, m.funded_by
      FROM mould_parts mp
      JOIN moulds m ON m.id = mp.mould_id
      WHERE mp.part_id = $1
    `, [id]),
  ]);

  res.json({
    ...partRes.rows[0],
    process_parameters: params.rows,
    critical_dimensions: dims.rows,
    suitable_machine_ids: machines.rows.map((r) => r.machine_id),
    files: files.rows,
    linked_moulds: moulds.rows,
  });
});

// Create a part - supervisor/admin only
router.post('/parts', requireRole('admin', 'supervisor'), async (req, res) => {
  const {
    part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
    trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty,
    customer_id, notes, batch_part_code, part_weight_g, shrp_part_code, customer_part_no, tolerance_pct,
  } = req.body;
  if (!part_code || !part_name || standard_cycle_time_sec === undefined || standard_cycle_time_sec === null || standard_cycle_time_sec === '') {
    return res.status(400).json({ error: 'part_code, part_name and standard_cycle_time_sec are required' });
  }
  const { rows } = await pool.query(
    `INSERT INTO parts (part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
       trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty,
       customer_id, notes, batch_part_code, part_weight_g, shrp_part_code, customer_part_no, tolerance_pct)
     VALUES ($1, $2, COALESCE($3, 1), $4, $5, COALESCE($6,FALSE), COALESCE($7,FALSE), COALESCE($8,TRUE), COALESCE($9,TRUE), $10, $11, $12, $13, $14, $15, $16, COALESCE($17, 2))
     RETURNING *`,
    [part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
      trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty,
      customer_id || null, notes || null, batch_part_code || null, part_weight_g || null,
      shrp_part_code || null, customer_part_no || part_code, tolerance_pct != null ? Number(tolerance_pct) : 2]
  );
  if (req.body.mould_id) {
    await pool.query(
      `INSERT INTO mould_parts (mould_id, part_id, cavities_for_part) VALUES ($1, $2, $3) ON CONFLICT (mould_id, part_id) DO UPDATE SET cavities_for_part = EXCLUDED.cavities_for_part`,
      [req.body.mould_id, rows[0].id, Number(cavity_count) || 1]
    );
  }
  res.status(201).json(rows[0]);
});

// Update a part's scalar fields - supervisor/admin only
router.put('/parts/:id', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const {
    part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
    trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty,
    customer_id, notes, active, batch_part_code, part_weight_g, shrp_part_code, customer_part_no, tolerance_pct,
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
       part_weight_g = $15,
       shrp_part_code = COALESCE($16, shrp_part_code),
       customer_part_no = COALESCE($17, customer_part_no),
       tolerance_pct = COALESCE($18, tolerance_pct)
     WHERE id = $19 RETURNING *`,
    [part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
      trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty,
      customer_id || null, notes || null, active, batch_part_code || null, part_weight_g || null,
      shrp_part_code || null, customer_part_no || null, tolerance_pct != null ? Number(tolerance_pct) : null, id]
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
  const { rows } = await pool.query('SELECT * FROM part_process_parameters WHERE part_id = $1 ORDER BY sort_order, id'); res.json(rows);
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
  const rawBuffer = Buffer.from(data_base64, 'base64');
  const { buffer, mime_type: finalMimeType } = await optimizeImage(rawBuffer, mime_type);

  let storageKey = null;
  if (isR2Configured()) {
    try {
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      storageKey = `part-files/${id}/${Date.now()}_${sanitizedFilename}`;
      await uploadFile(storageKey, buffer, finalMimeType);
    } catch (r2Err) {
      console.warn('[R2-UPLOAD] Cloudflare R2 upload failed, saving to DB bytea fallback:', r2Err.message);
      storageKey = null;
    }
  }

  const { rows } = await pool.query(
    `INSERT INTO part_files (part_id, file_type, filename, mime_type, data, storage_key, uploaded_by_user_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, file_type, filename, mime_type, storage_key, uploaded_at`,
    [id, file_type, filename, finalMimeType, buffer, storageKey, req.user.id]
  );
  res.status(201).json(rows[0]);
});

// Stream a file's raw bytes (used directly as <img src> / download link)
router.get('/parts/:partId/files/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const { rows } = await pool.query('SELECT * FROM part_files WHERE id = $1', [fileId]);
  const file = rows[0];
  if (!file) return res.status(404).send('Not found');

  // Try streaming from Cloudflare R2 if storage_key is present
  if (file.storage_key && isR2Configured()) {
    try {
      const r2File = await getFile(file.storage_key);
      res.setHeader('Content-Type', r2File.contentType || file.mime_type);
      res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
      return res.send(r2File.buffer);
    } catch (r2Err) {
      console.warn(`[R2-STREAM] Failed to fetch key ${file.storage_key} from R2, falling back to database bytea:`, r2Err.message);
    }
  }

  // Fallback to database bytea data column
  if (!file.data) return res.status(404).send('File content not found');
  res.setHeader('Content-Type', file.mime_type);
  res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
  res.send(file.data);
});

router.delete('/parts/:partId/files/:fileId', requireRole('admin', 'supervisor'), async (req, res) => {
  const { fileId } = req.params;
  const { rows } = await pool.query('SELECT storage_key FROM part_files WHERE id = $1', [fileId]);
  if (rows[0]?.storage_key && isR2Configured()) {
    deleteFile(rows[0].storage_key).catch(() => {});
  }
  await pool.query('DELETE FROM part_files WHERE id = $1', [fileId]);
  res.status(204).send();
});

// Link or unlink mould for a part
router.put('/parts/:id/mould', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const { mould_id, cavities_for_part } = req.body;

  if (!mould_id) {
    await pool.query('DELETE FROM mould_parts WHERE part_id = $1', [id]);
    return res.json({ ok: true, linked_mould: null });
  }

  // Remove existing links if only 1 primary mould, or update
  await pool.query('DELETE FROM mould_parts WHERE part_id = $1', [id]);
  const { rows } = await pool.query(`
    INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [mould_id, id, Number(cavities_for_part) || 1]);

  res.json({ ok: true, link: rows[0] });
});


// Permanently delete a part. Only safe for parts with zero production history -
// the foreign keys on production_entries/bags/machine_assignments/rework_log/
// packing_balance_pool/part_recipes are NOT ON DELETE CASCADE, so Postgres itself
// blocks deletion of any part that has real IATF traceability records.
router.delete('/parts/:id', requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  let partInfo = null;
  try {
    const { rows } = await pool.query('SELECT id, part_code, part_name FROM parts WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Part not found' });
    partInfo = rows[0];

    // Clean up dependent metadata tables that shouldn't block deleting an unused duplicate part
    await pool.query('DELETE FROM part_process_parameters WHERE part_id = $1', [id]);
    await pool.query('DELETE FROM part_critical_dimensions WHERE part_id = $1', [id]);
    await pool.query('DELETE FROM part_machines WHERE part_id = $1', [id]);
    await pool.query('DELETE FROM mould_parts WHERE part_id = $1', [id]);
    await pool.query('DELETE FROM part_files WHERE part_id = $1', [id]);
    await pool.query('DELETE FROM part_recipes WHERE part_id = $1', [id]);

    await pool.query('DELETE FROM parts WHERE id = $1', [id]);
    res.json({ ok: true, message: `Part "${partInfo.part_name}" (${partInfo.part_code}) deleted permanently.` });
  } catch (err) {
    if (err.code === '23503') {
      await pool.query('UPDATE parts SET active = FALSE WHERE id = $1', [id]);
      return res.json({
        ok: true,
        message: `Part "${partInfo?.part_name || ''}" (${partInfo?.part_code || ''}) has production history and was deactivated instead of deleted, to preserve the audit trail.`,
      });
    }
    console.error('Error deleting part:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin on-demand compression for legacy part_files images
router.post('/compress-images', requireRole('admin'), async (req, res) => {
  const { compressTableFiles } = require('../db/compress_part_files');
  const client = await pool.connect();
  try {
    const partStats = await compressTableFiles(client, 'part_files', 'id');
    let mouldStats = null;
    const mouldFilesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'mould_files'
      )
    `);
    if (mouldFilesCheck.rows[0]?.exists) {
      mouldStats = await compressTableFiles(client, 'mould_files', 'id');
    }
    res.json({ ok: true, part_files: partStats, mould_files: mouldStats });
  } catch (err) {
    console.error('Error during image compression endpoint:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ============================================================
// Master Document Numbering & Sequences Configuration
// ============================================================

// Suggest sensible default format based on document type name
router.get('/document-sequences/suggest', (req, res) => {
  const { type } = req.query;
  const suggestion = getSuggestedDocFormat(type || '');
  res.json(suggestion);
});

// List all configured document sequences with live next previews
router.get('/document-sequences', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM document_sequences ORDER BY active DESC, document_type ASC'
    );
    const enriched = rows.map((r) => ({
      ...r,
      next_number: Number(r.current_number || 0) + 1,
      preview_next: formatDocumentNumber({
        prefix: r.prefix,
        padding_digits: r.padding_digits,
        include_year: r.include_year,
        suffix: r.suffix,
        number: Number(r.current_number || 0) + 1,
      }),
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch document sequences: ' + err.message });
  }
});

// Create a new document sequence configuration
router.post('/document-sequences', requireRole('admin', 'supervisor'), async (req, res) => {
  const {
    document_type,
    type_label,
    prefix,
    suffix,
    padding_digits,
    include_year,
    year_format,
    current_number,
    active,
  } = req.body;

  if (!document_type || !document_type.trim()) {
    return res.status(400).json({ error: 'Document type is required' });
  }
  if (!prefix || !prefix.trim()) {
    return res.status(400).json({ error: 'Prefix is required' });
  }

  const cleanType = document_type.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
  const cleanPrefix = prefix.trim();
  const digits = Math.max(1, Math.min(10, Number(padding_digits) || 4));
  const startingNum = Math.max(0, Number(current_number) || 0);

  try {
    const { rows } = await pool.query(
      `INSERT INTO document_sequences (
         document_type, type_label, prefix, suffix, padding_digits, include_year,
         year_format, current_number, active, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
       ON CONFLICT (document_type) DO UPDATE SET
         type_label = COALESCE(EXCLUDED.type_label, document_sequences.type_label),
         prefix = EXCLUDED.prefix,
         suffix = EXCLUDED.suffix,
         padding_digits = EXCLUDED.padding_digits,
         include_year = EXCLUDED.include_year,
         year_format = EXCLUDED.year_format,
         current_number = COALESCE(EXCLUDED.current_number, document_sequences.current_number),
         active = COALESCE(EXCLUDED.active, document_sequences.active),
         updated_at = now()
       RETURNING *`,
      [
        cleanType,
        type_label ? type_label.trim() : cleanType,
        cleanPrefix,
        suffix ? suffix.trim() : '',
        digits,
        include_year !== false,
        year_format || 'YYYY',
        startingNum,
        active !== false,
      ]
    );

    const saved = rows[0];
    res.status(201).json({
      ...saved,
      next_number: Number(saved.current_number || 0) + 1,
      preview_next: formatDocumentNumber({
        prefix: saved.prefix,
        padding_digits: saved.padding_digits,
        include_year: saved.include_year,
        suffix: saved.suffix,
        number: Number(saved.current_number || 0) + 1,
      }),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create document sequence: ' + err.message });
  }
});

// Update an existing document sequence
router.put('/document-sequences/:id', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const {
    type_label,
    prefix,
    suffix,
    padding_digits,
    include_year,
    year_format,
    current_number,
    active,
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE document_sequences SET
         type_label = COALESCE($1, type_label),
         prefix = COALESCE($2, prefix),
         suffix = COALESCE($3, suffix),
         padding_digits = COALESCE($4, padding_digits),
         include_year = COALESCE($5, include_year),
         year_format = COALESCE($6, year_format),
         current_number = COALESCE($7, current_number),
         active = COALESCE($8, active),
         updated_at = now()
       WHERE id = $9
       RETURNING *`,
      [
        type_label != null ? type_label.trim() : null,
        prefix != null ? prefix.trim() : null,
        suffix != null ? suffix.trim() : null,
        padding_digits != null ? Number(padding_digits) : null,
        include_year != null ? Boolean(include_year) : null,
        year_format || null,
        current_number != null ? Number(current_number) : null,
        active != null ? Boolean(active) : null,
        id,
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Document sequence record not found' });
    }

    const saved = rows[0];
    res.json({
      ...saved,
      next_number: Number(saved.current_number || 0) + 1,
      preview_next: formatDocumentNumber({
        prefix: saved.prefix,
        padding_digits: saved.padding_digits,
        include_year: saved.include_year,
        suffix: saved.suffix,
        number: Number(saved.current_number || 0) + 1,
      }),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update document sequence: ' + err.message });
  }
});

// Delete a document sequence
router.delete('/document-sequences/:id', requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('DELETE FROM document_sequences WHERE id = $1 RETURNING *', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Document sequence record not found' });
    }
    res.json({ ok: true, message: `Document sequence '${rows[0].document_type}' deleted.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete document sequence: ' + err.message });
  }
});

// Generate and reserve the next real document number atomically
router.post('/document-sequences/:type/next', async (req, res) => {
  const typeParam = req.params.type.trim().toUpperCase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const selRes = await client.query(
      'SELECT * FROM document_sequences WHERE document_type = $1 FOR UPDATE',
      [typeParam]
    );

    let seq = selRes.rows[0];
    if (!seq) {
      // Auto-initialize sequence if missing
      const def = getSuggestedDocFormat(typeParam);
      const insRes = await client.query(
        `INSERT INTO document_sequences (document_type, type_label, prefix, padding_digits, include_year, current_number)
         VALUES ($1, $2, $3, $4, $5, 0)
         RETURNING *`,
        [typeParam, typeParam, def.prefix, def.padding_digits, def.include_year]
      );
      seq = insRes.rows[0];
    }

    const nextVal = Number(seq.current_number || 0) + 1;
    await client.query(
      'UPDATE document_sequences SET current_number = $1, updated_at = now() WHERE id = $2',
      [nextVal, seq.id]
    );
    await client.query('COMMIT');

    const formatted = formatDocumentNumber({
      prefix: seq.prefix,
      padding_digits: seq.padding_digits,
      include_year: seq.include_year,
      suffix: seq.suffix,
      number: nextVal,
    });

    res.json({
      document_type: seq.document_type,
      sequence_number: nextVal,
      formatted_number: formatted,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to generate next document number: ' + err.message });
  } finally {
    client.release();
  }
});

module.exports = router;

