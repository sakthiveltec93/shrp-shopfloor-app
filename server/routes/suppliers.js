const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM suppliers ORDER BY active DESC, supplier_name');
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM suppliers WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
  res.json(rows[0]);
});

router.post('/', requireRole('admin', 'supervisor'), async (req, res) => {
  const {
    supplier_code, supplier_name, contact_person, phone, email, address,
    materials_supplied, payment_terms, lead_time_days,
  } = req.body;

  if (!supplier_code || !supplier_name) {
    return res.status(400).json({ error: 'supplier_code and supplier_name are required' });
  }

  const { rows } = await pool.query(
    `INSERT INTO suppliers
      (supplier_code, supplier_name, contact_person, phone, email, address,
       materials_supplied, payment_terms, lead_time_days)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [supplier_code, supplier_name, contact_person || null, phone || null, email || null, address || null,
      materials_supplied || null, payment_terms || null, lead_time_days != null ? Number(lead_time_days) : null]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const {
    supplier_code, supplier_name, contact_person, phone, email, address,
    materials_supplied, payment_terms, lead_time_days, active,
  } = req.body;

  const { rows } = await pool.query(
    `UPDATE suppliers SET
       supplier_code = COALESCE($1, supplier_code),
       supplier_name = COALESCE($2, supplier_name),
       contact_person = COALESCE($3, contact_person),
       phone = COALESCE($4, phone),
       email = COALESCE($5, email),
       address = COALESCE($6, address),
       materials_supplied = COALESCE($7, materials_supplied),
       payment_terms = COALESCE($8, payment_terms),
       lead_time_days = COALESCE($9, lead_time_days),
       active = COALESCE($10, active)
     WHERE id = $11 RETURNING *`,
    [supplier_code, supplier_name, contact_person, phone, email, address,
      materials_supplied, payment_terms, lead_time_days != null ? Number(lead_time_days) : null,
      active, id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
  res.json(rows[0]);
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT supplier_code, supplier_name FROM suppliers WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });

    await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);
    res.json({ ok: true, message: `Supplier "${rows[0].supplier_name}" (${rows[0].supplier_code}) deleted permanently.` });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'This supplier has linked history and cannot be permanently deleted. Deactivate it instead.',
      });
    }
    console.error('Error deleting supplier:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
