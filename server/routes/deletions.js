const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { logAudit } = require('../lib/auditTrail');

const router = express.Router();
router.use(requireAuth);

// Helper to snapshot entity data before deletion
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
      `SELECT pe.id, pe.machine_id, pe.part_id, pe.entry_date, pe.shift, pe.hour_slot,
              pe.start_count, pe.end_count, pe.good_qty, pe.reject_qty, pe.downtime_minutes,
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

// 1. Submit a deletion request (For records requiring dual sign-off)
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
    return res.status(409).json({ error: 'A deletion request for this item is already pending approval.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO deletion_requests (entity_type, entity_id, requested_by, reason, details, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING *`,
    [entity_type, entity_id, req.user.id, reason.trim(), JSON.stringify(snapshot)]
  );

  res.status(201).json(rows[0]);
});

// 2. Get pending deletion requests
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

// Helper to execute deletion with strict stage validation
async function executeDeleteWithValidation(entityType, entityId, user, reason, client) {
  const db = client || pool;

  if (entityType === 'production_entry') {
    // 1. Fetch the production entry
    const peRes = await db.query(
      `SELECT pe.*, m.machine_code, p.part_code, p.shrp_part_code
       FROM production_entries pe
       LEFT JOIN machines m ON m.id = pe.machine_id
       LEFT JOIN parts p ON p.id = pe.part_id
       WHERE pe.id = $1`,
      [entityId]
    );
    const pe = peRes.rows[0];
    if (!pe) throw new Error('Production entry not found.');

    // 2. Calculate remaining good production if this entry were deleted
    const remProdRes = await db.query(
      `SELECT COALESCE(SUM(good_qty), 0)::integer AS total_good
       FROM production_entries
       WHERE machine_id = $1 AND entry_date = $2 AND shift = $3 AND id != $4`,
      [pe.machine_id, pe.entry_date, pe.shift, pe.id]
    );
    const remainingGoodQty = remProdRes.rows[0].total_good;

    // 3. Calculate total bagged pieces already created on this machine + date + shift
    const bagRes = await db.query(
      `SELECT COALESCE(SUM(qty), 0)::integer AS total_bagged
       FROM bags
       WHERE machine_id = $1 AND entry_date = $2 AND shift = $3
         AND status != 'CANCELLED' AND bag_type = 'PART'`,
      [pe.machine_id, pe.entry_date, pe.shift]
    );
    const totalBaggedQty = bagRes.rows[0].total_bagged;

    if (totalBaggedQty > remainingGoodQty) {
      throw new Error(
        `Cannot delete production entry (Hr ${pe.hour_slot}, ${pe.good_qty} pcs). Total bagged quantity (${totalBaggedQty} pcs) exceeds the remaining production for Shift ${pe.shift} (${remainingGoodQty} pcs). Please delete or reduce the excess bags first.`
      );
    }

    // Snapshot
    const entityCode = `${pe.machine_code || 'Machine'} Hr ${pe.hour_slot} (${pe.shrp_part_code || pe.part_code || 'Part'})`;
    const snapshot = { ...pe };

    // Delete dependent reject and downtime records
    await db.query(`DELETE FROM reject_log WHERE production_entry_id = $1`, [entityId]);
    await db.query(`DELETE FROM downtime_log WHERE production_entry_id = $1`, [entityId]);
    await db.query(`DELETE FROM production_entries WHERE id = $1`, [entityId]);

    // Insert into permanent Deletion Audit Log
    try {
      await db.query(
        `INSERT INTO deletion_audit_log (entity_type, entity_id, entity_code, deleted_by, deleted_by_name, deleted_by_role, reason, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        ['production_entry', entityId, entityCode, user.id, user.full_name || user.username, user.role, reason, JSON.stringify(snapshot)]
      );
    } catch (e) {
      console.warn('Could not insert into deletion_audit_log:', e.message);
    }

    await logAudit(pool, {
      process: 'deletion',
      user_id: user.id,
      remarks: `Deleted production entry ${entityCode}. Reason: ${reason}`,
    });

    return { ok: true, entityCode, message: `Production entry ${entityCode} deleted successfully.` };
  }

  if (entityType === 'bag') {
    // 1. Fetch bag details
    const bagRes = await db.query(
      `SELECT b.*, m.machine_code, p.part_code, p.shrp_part_code
       FROM bags b
       LEFT JOIN machines m ON m.id = b.machine_id
       LEFT JOIN parts p ON p.id = b.part_id
       WHERE b.id = $1`,
      [entityId]
    );
    const bag = bagRes.rows[0];
    if (!bag) throw new Error('Bag record not found.');

    // 2. Strict validation: Check if bag has already advanced to downstream stages
    const downstreamRes = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM trim_entries WHERE bag_id = $1)::integer AS trim_count,
         (SELECT COUNT(*) FROM inspection_entries WHERE bag_id = $1)::integer AS inspect_count,
         (SELECT COUNT(*) FROM packing_entries WHERE bag_id = $1)::integer AS pack_count`,
      [entityId]
    );
    const { trim_count, inspect_count, pack_count } = downstreamRes.rows[0];
    const totalDownstream = trim_count + inspect_count + pack_count;

    if (totalDownstream > 0 || (bag.status && bag.status !== 'OPEN')) {
      const currentStage = pack_count > 0 ? 'Packing' : inspect_count > 0 ? 'Inspection' : trim_count > 0 ? 'Trimming' : bag.status;
      throw new Error(
        `Cannot delete Bag ${bag.bag_code} because it has already started/completed ${currentStage} stage. Downstream processing records must be deleted/reverted first.`
      );
    }

    const entityCode = bag.bag_code;
    const snapshot = { ...bag };

    // Clean up history & hold logs
    try { await db.query(`DELETE FROM bag_status_history WHERE bag_id = $1`, [entityId]); } catch (e) {}
    try { await db.query(`DELETE FROM bag_hold_log WHERE bag_id = $1`, [entityId]); } catch (e) {}
    await db.query(`DELETE FROM bags WHERE id = $1`, [entityId]);

    // Insert into permanent Deletion Audit Log
    try {
      await db.query(
        `INSERT INTO deletion_audit_log (entity_type, entity_id, entity_code, deleted_by, deleted_by_name, deleted_by_role, reason, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        ['bag', entityId, entityCode, user.id, user.full_name || user.username, user.role, reason, JSON.stringify(snapshot)]
      );
    } catch (e) {
      console.warn('Could not insert into deletion_audit_log:', e.message);
    }

    await logAudit(pool, {
      process: 'deletion',
      user_id: user.id,
      remarks: `Deleted Bag ${entityCode} (${bag.base_weight_kg}kg, ${bag.qty}pcs). Reason: ${reason}`,
    });

    return { ok: true, entityCode, message: `Bag ${entityCode} deleted permanently.` };
  }

  if (entityType === 'trim_entry') {
    const trRes = await db.query(
      `SELECT te.*, b.bag_code, b.status AS bag_status
       FROM trim_entries te
       JOIN bags b ON b.id = te.bag_id
       WHERE te.id = $1`,
      [entityId]
    );
    const tr = trRes.rows[0];
    if (!tr) throw new Error('Trimming entry not found.');

    const inspectRes = await db.query(`SELECT COUNT(*) FROM inspection_entries WHERE bag_id = $1`, [tr.bag_id]);
    if (Number(inspectRes.rows[0]?.count || 0) > 0) {
      throw new Error(`Cannot delete trimming entry for Bag ${tr.bag_code} because it has already been inspected in QA.`);
    }

    // Revert bag status back to OPEN
    await db.query(`UPDATE bags SET status = 'OPEN' WHERE id = $1`, [tr.bag_id]);
    await db.query(`DELETE FROM trim_entries WHERE id = $1`, [entityId]);

    try {
      await db.query(
        `INSERT INTO deletion_audit_log (entity_type, entity_id, entity_code, deleted_by, deleted_by_name, deleted_by_role, reason, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        ['trim_entry', entityId, tr.bag_code, user.id, user.full_name || user.username, user.role, reason, JSON.stringify(tr)]
      );
    } catch (e) {}

    return { ok: true, entityCode: tr.bag_code, message: `Trimming entry for Bag ${tr.bag_code} deleted and bag reverted to OPEN.` };
  }

  if (entityType === 'inspection_entry') {
    const inRes = await db.query(
      `SELECT ie.*, b.bag_code, b.status AS bag_status
       FROM inspection_entries ie
       JOIN bags b ON b.id = ie.bag_id
       WHERE ie.id = $1`,
      [entityId]
    );
    const ie = inRes.rows[0];
    if (!ie) throw new Error('Inspection entry not found.');

    const packRes = await db.query(`SELECT COUNT(*) FROM packing_entries WHERE bag_id = $1`, [ie.bag_id]);
    if (Number(packRes.rows[0]?.count || 0) > 0) {
      throw new Error(`Cannot delete inspection entry for Bag ${ie.bag_code} because it has already been Packed.`);
    }

    // Revert bag status back to TRIMMING
    await db.query(`UPDATE bags SET status = 'TRIMMING' WHERE id = $1`, [ie.bag_id]);
    await db.query(`DELETE FROM inspection_entries WHERE id = $1`, [entityId]);

    try {
      await db.query(
        `INSERT INTO deletion_audit_log (entity_type, entity_id, entity_code, deleted_by, deleted_by_name, deleted_by_role, reason, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        ['inspection_entry', entityId, ie.bag_code, user.id, user.full_name || user.username, user.role, reason, JSON.stringify(ie)]
      );
    } catch (e) {}

    return { ok: true, entityCode: ie.bag_code, message: `Inspection entry for Bag ${ie.bag_code} deleted and bag reverted to TRIMMING.` };
  }

  if (entityType === 'part') {
    await db.query(
      `UPDATE parts SET active = FALSE, deleted_at = now(), deleted_by = $1, delete_reason = $2 WHERE id = $3`,
      [user.id, reason, entityId]
    );
    return { ok: true, message: 'Part deactivated/archived.' };
  }

  throw new Error(`Unsupported entity type: ${entityType}`);
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
    const result = await executeDeleteWithValidation(delReq.entity_type, delReq.entity_id, req.user, delReq.reason, client);
    await client.query(
      `UPDATE deletion_requests SET status = 'approved', reviewed_by = $1, reviewed_at = now(), review_notes = $2 WHERE id = $3`,
      [req.user.id, review_notes || null, id]
    );
    await client.query('COMMIT');
    res.json({ ok: true, message: result.message });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 4. Reject deletion request
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

// 5. Direct delete with mandatory remarks and strict stage validation
router.delete('/direct/:entity_type/:entity_id', async (req, res) => {
  const { entity_type, entity_id } = req.params;
  const { reason } = req.body || {};
  const why = (reason && reason.trim()) || (req.query.reason && req.query.reason.trim());

  if (!why) {
    return res.status(400).json({ error: 'A mandatory reason / remarks is required to delete this record.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await executeDeleteWithValidation(entity_type, Number(entity_id), req.user, why, client);
    await client.query('COMMIT');
    res.json({ ok: true, message: result.message });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Direct deletion error:', err.message);
    res.status(400).json({ error: err.message || 'Failed to delete record' });
  } finally {
    client.release();
  }
});

// 6. Deletion Audit Log API (Viewable & Downloadable CSV)
router.get('/audit-log', async (req, res) => {
  const { start_date, end_date, entity_type } = req.query;
  let where = [];
  let params = [];

  if (start_date) {
    params.push(start_date);
    where.push(`created_at >= $ ${params.length}::date`.replace(' ', ''));
  }
  if (end_date) {
    params.push(end_date + ' 23:59:59');
    where.push(`created_at <= $ ${params.length}::timestamptz`.replace(' ', ''));
  }
  if (entity_type && entity_type !== 'ALL') {
    params.push(entity_type);
    where.push(`entity_type = $ ${params.length}`.replace(' ', ''));
  }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  try {
    const { rows } = await pool.query(
      `SELECT id, entity_type, entity_id, entity_code, deleted_by_name, deleted_by_role, reason, details, created_at
       FROM deletion_audit_log
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT 500`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching deletion audit log:', err);
    res.status(500).json({ error: 'Failed to fetch deletion audit log' });
  }
});

module.exports = router;
