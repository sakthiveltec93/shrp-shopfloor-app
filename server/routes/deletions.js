const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { logAudit } = require('../lib/auditTrail');

const router = express.Router();
router.use(requireAuth);

// Helper to snapshot entity data before deletion request
async function getEntitySnapshot(entityType, entityId) {
  if (entityType === 'part') {
    const { rows } = await pool.query(
      'SELECT id, part_code, shrp_part_code, customer_part_no, part_name FROM parts WHERE id = $1',
      [entityId]
    );
    return rows[0] || null;
  }
  if (entityType === 'production_entry') {
    const { rows } = await pool.query(
      `SELECT pe.id, pe.entry_date, pe.shift, pe.hour_slot, pe.start_count, pe.end_count, pe.good_qty, pe.reject_qty,
              m.machine_code, p.part_code, p.shrp_part_code, p.part_name, u.full_name AS operator_name
       FROM production_entries pe
       LEFT JOIN machines m ON m.id = pe.machine_id
       LEFT JOIN parts p ON p.id = pe.part_id
       LEFT JOIN users u ON u.id = pe.operator_user_id
       WHERE pe.id = $1`,
      [entityId]
    );
    return rows[0] || null;
  }
  if (entityType === 'bag') {
    const { rows } = await pool.query(
      `SELECT b.id, b.bag_code, b.batch_no, b.entry_date, b.shift, b.bag_type, b.qty, b.base_weight_kg, b.status,
              m.machine_code, p.part_code, p.shrp_part_code, p.part_name
       FROM bags b
       LEFT JOIN machines m ON m.id = b.machine_id
       LEFT JOIN parts p ON p.id = b.part_id
       WHERE b.id = $1`,
      [entityId]
    );
    return rows[0] || null;
  }
  return null;
}

// 1. Submit a deletion request (Operator or any user)
router.post('/request', async (req, res) => {
  const { entity_type, entity_id, reason } = req.body;
  if (!entity_type || !entity_id || !reason || !reason.trim()) {
    return res.status(400).json({ error: 'entity_type, entity_id and a mandatory reason are required' });
  }

  const snapshot = await getEntitySnapshot(entity_type, entity_id);
  if (!snapshot) {
    return res.status(404).json({ error: `The ${entity_type} could not be found to request deletion.` });
  }

  // Check if a pending request already exists
  const existing = await pool.query(
    `SELECT id FROM deletion_requests WHERE entity_type = $1 AND entity_id = $2 AND status = 'pending'`,
    [entity_type, entity_id]
  );
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'A deletion request for this item is already pending admin approval.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO deletion_requests (entity_type, entity_id, requested_by, reason, details, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING *`,
    [entity_type, entity_id, req.user.id, reason.trim(), JSON.stringify(snapshot)]
  );

  res.status(201).json(rows[0]);
});

// 2. Get pending deletion requests (Supervisor/Admin)
router.get('/pending', requireRole('admin', 'supervisor'), async (req, res) => {
  const { rows } = await pool.query(`
    SELECT dr.*, u.full_name AS requested_by_name, u.role AS requested_by_role
    FROM deletion_requests dr
    JOIN users u ON u.id = dr.requested_by
    WHERE dr.status = 'pending'
    ORDER BY dr.created_at ASC
  `);
  res.json(rows);
});

// Internal function to execute deletion logic safely
async function executeDelete(entityType, entityId, deletedByUserId, reason, client) {
  const db = client || pool;

  if (entityType === 'part') {
    // Soft delete to protect all historical production, batch and bag records
    await db.query(
      `UPDATE parts SET active = FALSE, deleted_at = now(), deleted_by = $1, delete_reason = $2 WHERE id = $3`,
      [deletedByUserId, reason, entityId]
    );
  } else if (entityType === 'production_entry') {
    // Check if reject logs or downtime logs exist
    await db.query(`DELETE FROM reject_log WHERE production_entry_id = $1`, [entityId]);
    await db.query(`DELETE FROM downtime_log WHERE production_entry_id = $1`, [entityId]);
    await db.query(`DELETE FROM production_entries WHERE id = $1`, [entityId]);
  } else if (entityType === 'bag') {
    // Check if bag has downstream logs
    const downstream = await db.query(
      `SELECT (SELECT COUNT(*) FROM trim_entries WHERE bag_id = $1) +
              (SELECT COUNT(*) FROM inspection_entries WHERE bag_id = $1) +
              (SELECT COUNT(*) FROM packing_entries WHERE bag_id = $1) AS total`,
      [entityId]
    );
    if (Number(downstream.rows[0]?.total || 0) > 0) {
      await db.query(`UPDATE bags SET status = 'CANCELLED' WHERE id = $1`, [entityId]);
    } else {
      await db.query(`DELETE FROM bags WHERE id = $1`, [entityId]);
    }
  }

  await logAudit(pool, {
    process: 'deletion',
    user_id: deletedByUserId,
    remarks: `Deleted ${entityType} #${entityId}. Reason: ${reason}`,
  });
}

// 3. Approve deletion request (Admin / Supervisor)
router.post('/:id/approve', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const { review_notes } = req.body;

  const reqRes = await pool.query('SELECT * FROM deletion_requests WHERE id = $1', [id]);
  const delReq = reqRes.rows[0];
  if (!delReq) return res.status(404).json({ error: 'Deletion request not found' });
  if (delReq.status !== 'pending') return res.status(409).json({ error: `Request is already ${delReq.status}` });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await executeDelete(delReq.entity_type, delReq.entity_id, req.user.id, delReq.reason, client);
    await client.query(
      `UPDATE deletion_requests SET status = 'approved', reviewed_by = $1, reviewed_at = now(), review_notes = $2 WHERE id = $3`,
      [req.user.id, review_notes || null, id]
    );
    await client.query('COMMIT');
    res.json({ ok: true, message: `${delReq.entity_type} deleted successfully.` });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// 4. Reject deletion request (Admin / Supervisor)
router.post('/:id/reject', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const { review_notes } = req.body;

  const reqRes = await pool.query('SELECT * FROM deletion_requests WHERE id = $1', [id]);
  const delReq = reqRes.rows[0];
  if (!delReq) return res.status(404).json({ error: 'Deletion request not found' });
  if (delReq.status !== 'pending') return res.status(409).json({ error: `Request is already ${delReq.status}` });

  await pool.query(
    `UPDATE deletion_requests SET status = 'rejected', reviewed_by = $1, reviewed_at = now(), review_notes = $2 WHERE id = $3`,
    [req.user.id, review_notes || 'Rejected by supervisor/admin', id]
  );
  res.json({ ok: true, message: 'Deletion request rejected.' });
});

// 5. Direct delete by Admin
router.delete('/direct/:entity_type/:entity_id', requireRole('admin'), async (req, res) => {
  const { entity_type, entity_id } = req.params;
  const { reason } = req.body;
  const why = reason || 'Direct deletion by Administrator';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await executeDelete(entity_type, Number(entity_id), req.user.id, why, client);
    await client.query('COMMIT');
    res.json({ ok: true, message: `${entity_type} deleted successfully.` });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

module.exports = router;
