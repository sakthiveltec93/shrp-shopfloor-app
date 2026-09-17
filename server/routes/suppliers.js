const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { isValidGSTIN } = require('../lib/gstinValidator');

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
    supplier_code, supplier_name, gstin, pan_no, contact_person, phone, email,
    address, city, state, pincode, materials_supplied, payment_terms,
    lead_time_days, vendor_rating, iso_iatf_certified, cert_valid_upto, active,
    gst_last_verified_at, gst_verification_status,
  } = req.body;

  if (!supplier_code || !supplier_name) {
    return res.status(400).json({ error: 'supplier_code and supplier_name are required' });
  }

  const cleanGstin = gstin ? gstin.trim().toUpperCase() : null;
  if (cleanGstin && !isValidGSTIN(cleanGstin)) {
    return res.status(400).json({ error: 'Invalid GSTIN format or checksum digit. Please verify the 15-character GST number.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO suppliers
      (supplier_code, supplier_name, gstin, pan_no, contact_person, phone, email,
       address, city, state, pincode, materials_supplied, payment_terms,
       lead_time_days, vendor_rating, iso_iatf_certified, cert_valid_upto, active,
       gst_last_verified_at, gst_verification_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, COALESCE($18, TRUE), $19, $20)
     RETURNING *`,
    [
      supplier_code.trim(),
      supplier_name.trim(),
      cleanGstin,
      pan_no || null,
      contact_person || null,
      phone || null,
      email || null,
      address || null,
      city || null,
      state || 'Tamil Nadu',
      pincode || null,
      materials_supplied || null,
      payment_terms || '30 Days',
      lead_time_days != null ? Number(lead_time_days) : 7,
      vendor_rating != null ? Number(vendor_rating) : 100,
      iso_iatf_certified !== false,
      cert_valid_upto || null,
      active !== false,
      gst_last_verified_at || null,
      gst_verification_status || null,
    ]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const {
    supplier_code, supplier_name, gstin, pan_no, contact_person, phone, email,
    address, city, state, pincode, materials_supplied, payment_terms,
    lead_time_days, vendor_rating, iso_iatf_certified, cert_valid_upto, active,
    gst_last_verified_at, gst_verification_status,
  } = req.body;

  const cleanGstin = gstin ? gstin.trim().toUpperCase() : null;
  if (cleanGstin && !isValidGSTIN(cleanGstin)) {
    return res.status(400).json({ error: 'Invalid GSTIN format or checksum digit. Please verify the 15-character GST number.' });
  }

  const { rows } = await pool.query(
    `UPDATE suppliers SET
       supplier_code = COALESCE($1, supplier_code),
       supplier_name = COALESCE($2, supplier_name),
       gstin = $3,
       pan_no = $4,
       contact_person = $5,
       phone = $6,
       email = $7,
       address = $8,
       city = $9,
       state = COALESCE($10, state),
       pincode = $11,
       materials_supplied = $12,
       payment_terms = COALESCE($13, payment_terms),
       lead_time_days = COALESCE($14, lead_time_days),
       vendor_rating = COALESCE($15, vendor_rating),
       iso_iatf_certified = COALESCE($16, iso_iatf_certified),
       cert_valid_upto = $17,
       active = COALESCE($18, active),
       gst_last_verified_at = COALESCE($19, gst_last_verified_at),
       gst_verification_status = COALESCE($20, gst_verification_status)
     WHERE id = $21 RETURNING *`,
    [
      supplier_code ? supplier_code.trim() : null,
      supplier_name ? supplier_name.trim() : null,
      cleanGstin,
      pan_no || null,
      contact_person || null,
      phone || null,
      email || null,
      address || null,
      city || null,
      state || null,
      pincode || null,
      materials_supplied || null,
      payment_terms || null,
      lead_time_days != null ? Number(lead_time_days) : null,
      vendor_rating != null ? Number(vendor_rating) : null,
      iso_iatf_certified != null ? Boolean(iso_iatf_certified) : null,
      cert_valid_upto || null,
      active,
      gst_last_verified_at || null,
      gst_verification_status || null,
      id,
    ]
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
