const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { logAudit } = require('../lib/auditTrail');

const router = express.Router();
router.use(requireAuth);

// Helper to record diffs in record_correction_log
async function recordDiffs(client, { entityType, entityId, entityCode, action, oldRecord, newRecord, fieldsToTrack, user, reason, details, requestId }) {
  const diffs = [];
  if (action === 'EDIT' && oldRecord && newRecord) {
    for (const f of fieldsToTrack) {
      const oldVal = oldRecord[f] != null ? String(oldRecord[f]) : null;
      const newVal = newRecord[f] != null ? String(newRecord[f]) : null;
      if (oldVal !== newVal) {
        diffs.push({ field_name: f, old_value: oldVal, new_value: newVal });
      }
    }
  }

  if (diffs.length > 0) {
    for (const d of diffs) {
      await client.query(`
        INSERT INTO record_correction_log 
          (entity_type, entity_id, entity_code, action, field_name, old_value, new_value, changed_by, changed_by_name, changed_by_role, reason, details, request_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [entityType, entityId, entityCode, action, d.field_name, d.old_value, d.new_value, user.id, user.full_name || user.username, user.role, reason, details ? JSON.stringify(details) : null, requestId || null]);
    }
  } else {
    // Single summary log entry (for BACKDATED_CREATE, STATUS_OVERRIDE, or general edits)
    await client.query(`
      INSERT INTO record_correction_log 
        (entity_type, entity_id, entity_code, action, field_name, old_value, new_value, changed_by, changed_by_name, changed_by_role, reason, details, request_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      entityType,
      entityId,
      entityCode,
      action,
      action === 'STATUS_OVERRIDE' ? 'status' : null,
      oldRecord?.status || null,
      newRecord?.status || null,
      user.id,
      user.full_name || user.username,
      user.role,
      reason,
      details ? JSON.stringify(details) : null,
      requestId || null
    ]);
  }
}

// Helper to execute correction/backdate changes inside a database client transaction
async function executeCorrection(client, { entityType, entityId, entityCode, action, payload, user, reason, requestId }) {
  if (entityType === 'production_entry') {
    if (action === 'BACKDATED_CREATE') {
      const {
        machine_id, part_id, operator_user_id, shift, entry_date, hour_slot,
        period_start_at, period_end_at, start_count, end_count, good_qty, reject_qty = 0,
        downtime_minutes = 0, downtime_reason_id, remarks, efficiency_pct, rejects = [], downtimes = []
      } = payload;

      const { rows } = await client.query(`
        INSERT INTO production_entries 
          (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot,
           period_start_at, period_end_at, start_time, end_time,
           start_count, end_count, good_qty, reject_qty, downtime_minutes, downtime_reason_id,
           remarks, efficiency_pct, is_backdated, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18, TRUE, COALESCE($8, now()))
        RETURNING *
      `, [
        machine_id, part_id, operator_user_id || user.id, shift, entry_date, hour_slot || null,
        period_start_at || null, period_end_at || null, period_start_at || null, period_end_at || null,
        start_count, end_count, good_qty, reject_qty, downtime_minutes, downtime_reason_id || null,
        remarks || null, efficiency_pct || null
      ]);
      const created = rows[0];

      // Insert itemized rejects/downtimes
      if (Array.isArray(rejects)) {
        for (const r of rejects) {
          if (r.reason_id && Number(r.qty) > 0) {
            await client.query(`INSERT INTO reject_log (production_entry_id, reject_reason_id, qty) VALUES ($1,$2,$3)`, [created.id, r.reason_id, r.qty]);
          }
        }
      }
      if (Array.isArray(downtimes)) {
        for (const d of downtimes) {
          if (d.reason_id && Number(d.minutes) > 0) {
            await client.query(`INSERT INTO downtime_log (production_entry_id, downtime_reason_id, minutes) VALUES ($1,$2,$3)`, [created.id, d.reason_id, d.minutes]);
          }
        }
      }

      await recordDiffs(client, {
        entityType, entityId: created.id, entityCode: entityCode || `PE-${created.id}`,
        action, oldRecord: null, newRecord: created, fieldsToTrack: [],
        user, reason, details: created, requestId
      });

      return created;
    }

    if (action === 'EDIT') {
      const oldRes = await client.query(`SELECT * FROM production_entries WHERE id = $1`, [entityId]);
      const oldRecord = oldRes.rows[0];
      if (!oldRecord) throw new Error('Production entry not found.');

        const {
        machine_id, part_id, operator_user_id, shift, entry_date, hour_slot,
        period_start_at, period_end_at, start_count, end_count, good_qty, reject_qty,
        downtime_minutes, downtime_reason_id, remarks, efficiency_pct,
        rejects, downtimes
      } = payload;

      const { rows } = await client.query(`
        UPDATE production_entries
        SET machine_id = COALESCE($1, machine_id),
            part_id = COALESCE($2, part_id),
            operator_user_id = COALESCE($3, operator_user_id),
            shift = COALESCE($4, shift),
            entry_date = COALESCE($5, entry_date),
            hour_slot = $6,
            period_start_at = COALESCE($7, period_start_at),
            period_end_at = COALESCE($8, period_end_at),
            start_count = COALESCE($9, start_count),
            end_count = COALESCE($10, end_count),
            good_qty = COALESCE($11, good_qty),
            reject_qty = COALESCE($12, reject_qty),
            downtime_minutes = COALESCE($13, downtime_minutes),
            downtime_reason_id = $14,
            remarks = COALESCE($15, remarks),
            efficiency_pct = COALESCE($16, efficiency_pct),
            is_edited = TRUE,
            last_edited_at = now()
        WHERE id = $17
        RETURNING *
      `, [
        machine_id, part_id, operator_user_id, shift, entry_date, hour_slot,
        period_start_at, period_end_at, start_count, end_count, good_qty, reject_qty,
        downtime_minutes, downtime_reason_id, remarks, efficiency_pct, entityId
      ]);
      const updated = rows[0];

      if (Array.isArray(rejects)) {
        await client.query(`DELETE FROM reject_log WHERE production_entry_id = $1`, [entityId]);
        for (const r of rejects) {
          if (r.reason_id && Number(r.qty) > 0) {
            await client.query(`INSERT INTO reject_log (production_entry_id, reject_reason_id, qty) VALUES ($1,$2,$3)`, [entityId, r.reason_id, r.qty]);
          }
        }
      }

      if (Array.isArray(downtimes)) {
        await client.query(`DELETE FROM downtime_log WHERE production_entry_id = $1`, [entityId]);
        for (const d of downtimes) {
          if (d.reason_id && Number(d.minutes) > 0) {
            await client.query(`INSERT INTO downtime_log (production_entry_id, downtime_reason_id, minutes) VALUES ($1,$2,$3)`, [entityId, d.reason_id, d.minutes]);
          }
        }
      }

      await recordDiffs(client, {
        entityType, entityId, entityCode: entityCode || `PE-${entityId}`,
        action, oldRecord, newRecord: updated,
        fieldsToTrack: ['start_count', 'end_count', 'good_qty', 'reject_qty', 'downtime_minutes', 'shift', 'entry_date', 'remarks', 'operator_user_id', 'machine_id', 'part_id'],
        user, reason, details: { before: oldRecord, after: updated }, requestId
      });

      return updated;
    }
  }

  if (entityType === 'bag') {
    if (action === 'BACKDATED_CREATE') {
      const {
        bag_code, batch_no, entry_date, shift, machine_id, part_id, bag_type = 'PART',
        base_weight_kg, qty, status = 'OPEN', weighed_with_runner = false, remarks, created_at
      } = payload;

      const { rows } = await client.query(`
        INSERT INTO bags 
          (bag_code, batch_no, entry_date, shift, machine_id, part_id, bag_type,
           base_weight_kg, qty, status, weighed_with_runner, remarks, is_backdated, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, TRUE, COALESCE($13, now()))
        RETURNING *
      `, [
        bag_code, batch_no, entry_date, shift, machine_id, part_id, bag_type,
        base_weight_kg, qty, status, weighed_with_runner, remarks || null, created_at || null
      ]);
      const created = rows[0];

      await client.query(`
        INSERT INTO bag_status_history (bag_id, from_status, to_status, source, changed_at)
        VALUES ($1, NULL, $2, 'BACKDATED_CREATE', COALESCE($3, now()))
      `, [created.id, status, created_at || null]);

      await recordDiffs(client, {
        entityType, entityId: created.id, entityCode: created.bag_code,
        action, oldRecord: null, newRecord: created, fieldsToTrack: [],
        user, reason, details: created, requestId
      });

      return created;
    }

    if (action === 'EDIT') {
      const oldRes = await client.query(`SELECT * FROM bags WHERE id = $1`, [entityId]);
      const oldRecord = oldRes.rows[0];
      if (!oldRecord) throw new Error('Bag record not found.');

      const {
        base_weight_kg, qty, entry_date, shift, machine_id, part_id, bag_type, remarks
      } = payload;

      const { rows } = await client.query(`
        UPDATE bags
        SET base_weight_kg = COALESCE($1, base_weight_kg),
            qty = COALESCE($2, qty),
            entry_date = COALESCE($3, entry_date),
            shift = COALESCE($4, shift),
            machine_id = COALESCE($5, machine_id),
            part_id = COALESCE($6, part_id),
            bag_type = COALESCE($7, bag_type),
            remarks = COALESCE($8, remarks),
            is_edited = TRUE,
            last_edited_at = now()
        WHERE id = $9
        RETURNING *
      `, [base_weight_kg, qty, entry_date, shift, machine_id, part_id, bag_type, remarks, entityId]);
      const updated = rows[0];

      await recordDiffs(client, {
        entityType, entityId, entityCode: updated.bag_code,
        action, oldRecord, newRecord: updated,
        fieldsToTrack: ['base_weight_kg', 'qty', 'entry_date', 'shift', 'machine_id', 'part_id', 'bag_type', 'remarks'],
        user, reason, details: { before: oldRecord, after: updated }, requestId
      });

      return updated;
    }

    if (action === 'STATUS_OVERRIDE') {
      const oldRes = await client.query(`SELECT * FROM bags WHERE id = $1`, [entityId]);
      const oldRecord = oldRes.rows[0];
      if (!oldRecord) throw new Error('Bag record not found.');

      const newStatus = payload.status || payload.to_status;
      if (!newStatus) throw new Error('New status is required for STATUS_OVERRIDE');

      const { rows } = await client.query(`
        UPDATE bags
        SET status = $1, is_edited = TRUE, last_edited_at = now()
        WHERE id = $2
        RETURNING *
      `, [newStatus, entityId]);
      const updated = rows[0];

      await client.query(`
        INSERT INTO bag_status_history (bag_id, from_status, to_status, source, changed_at)
        VALUES ($1, $2, $3, 'ADMIN_OVERRIDE', now())
      `, [entityId, oldRecord.status, newStatus]);

      await recordDiffs(client, {
        entityType, entityId, entityCode: updated.bag_code,
        action, oldRecord, newRecord: updated,
        fieldsToTrack: ['status'],
        user, reason, details: { from: oldRecord.status, to: newStatus }, requestId
      });

      return updated;
    }
  }

  if (entityType === 'trim_entry') {
    if (action === 'BACKDATED_CREATE') {
      const {
        bag_id, trimmed_wt_kg = 0, runner_wt_kg = 0, reject_wt_kg = 0, reject_reason_id,
        remaining_wt_kg, is_partial = false, pass_number = 1, operator_user_id, created_at
      } = payload;

      const { rows } = await client.query(`
        INSERT INTO trim_entries 
          (bag_id, trimmed_wt_kg, runner_wt_kg, reject_wt_kg, reject_reason_id, remaining_wt_kg,
           is_partial, pass_number, operator_user_id, is_backdated, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, TRUE, COALESCE($10, now()))
        RETURNING *
      `, [
        bag_id, trimmed_wt_kg, runner_wt_kg, reject_wt_kg, reject_reason_id || null,
        remaining_wt_kg, is_partial, pass_number, operator_user_id || user.id, created_at || null
      ]);
      const created = rows[0];

      // Update bag status
      const targetStatus = is_partial ? 'PARTIAL_TRIM' : 'TRIMMED';
      await client.query(`UPDATE bags SET status = $1 WHERE id = $2`, [targetStatus, bag_id]);
      await client.query(`INSERT INTO bag_status_history (bag_id, from_status, to_status, source, changed_at) VALUES ($1, 'OPEN', $2, 'BACKDATED_TRIM', COALESCE($3, now()))`, [bag_id, targetStatus, created_at || null]);

      await recordDiffs(client, {
        entityType, entityId: created.id, entityCode: entityCode || `TRIM-${created.id}`,
        action, oldRecord: null, newRecord: created, fieldsToTrack: [],
        user, reason, details: created, requestId
      });

      return created;
    }

    if (action === 'EDIT') {
      const oldRes = await client.query(`SELECT * FROM trim_entries WHERE id = $1`, [entityId]);
      const oldRecord = oldRes.rows[0];
      if (!oldRecord) throw new Error('Trim entry not found.');

      const { trimmed_wt_kg, runner_wt_kg, reject_wt_kg, reject_reason_id, remaining_wt_kg, is_partial } = payload;
      const { rows } = await client.query(`
        UPDATE trim_entries
        SET trimmed_wt_kg = COALESCE($1, trimmed_wt_kg),
            runner_wt_kg = COALESCE($2, runner_wt_kg),
            reject_wt_kg = COALESCE($3, reject_wt_kg),
            reject_reason_id = $4,
            remaining_wt_kg = COALESCE($5, remaining_wt_kg),
            is_partial = COALESCE($6, is_partial),
            is_edited = TRUE,
            last_edited_at = now()
        WHERE id = $7
        RETURNING *
      `, [trimmed_wt_kg, runner_wt_kg, reject_wt_kg, reject_reason_id, remaining_wt_kg, is_partial, entityId]);
      const updated = rows[0];

      await recordDiffs(client, {
        entityType, entityId, entityCode: entityCode || `TRIM-${entityId}`,
        action, oldRecord, newRecord: updated,
        fieldsToTrack: ['trimmed_wt_kg', 'runner_wt_kg', 'reject_wt_kg', 'remaining_wt_kg'],
        user, reason, details: { before: oldRecord, after: updated }, requestId
      });

      return updated;
    }
  }

  if (entityType === 'inspection_entry') {
    if (action === 'BACKDATED_CREATE') {
      const {
        bag_id, inspected_wt_kg = 0, remaining_wt_kg = 0, reject_wt_kg = 0, reject_reason_id,
        sent_to_rework_qty = 0, variance_tier = 'AUTO', remarks, operator_user_id, is_partial = false, created_at
      } = payload;

      const { rows } = await client.query(`
        INSERT INTO inspection_entries 
          (bag_id, inspected_wt_kg, remaining_wt_kg, reject_wt_kg, reject_reason_id,
           sent_to_rework_qty, variance_tier, remarks, operator_user_id, is_partial, is_backdated, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, TRUE, COALESCE($11, now()))
        RETURNING *
      `, [
        bag_id, inspected_wt_kg, remaining_wt_kg, reject_wt_kg, reject_reason_id || null,
        sent_to_rework_qty, variance_tier, remarks || null, operator_user_id || user.id, is_partial, created_at || null
      ]);
      const created = rows[0];

      const targetStatus = is_partial ? 'PARTIAL_INSPECT' : 'INSPECTED';
      await client.query(`UPDATE bags SET status = $1 WHERE id = $2`, [targetStatus, bag_id]);
      await client.query(`INSERT INTO bag_status_history (bag_id, from_status, to_status, source, changed_at) VALUES ($1, 'TRIMMED', $2, 'BACKDATED_INSPECT', COALESCE($3, now()))`, [bag_id, targetStatus, created_at || null]);

      await recordDiffs(client, {
        entityType, entityId: created.id, entityCode: entityCode || `INSP-${created.id}`,
        action, oldRecord: null, newRecord: created, fieldsToTrack: [],
        user, reason, details: created, requestId
      });

      return created;
    }

    if (action === 'EDIT') {
      const oldRes = await client.query(`SELECT * FROM inspection_entries WHERE id = $1`, [entityId]);
      const oldRecord = oldRes.rows[0];
      if (!oldRecord) throw new Error('Inspection entry not found.');

      const { inspected_wt_kg, remaining_wt_kg, reject_wt_kg, reject_reason_id, remarks } = payload;
      const { rows } = await client.query(`
        UPDATE inspection_entries
        SET inspected_wt_kg = COALESCE($1, inspected_wt_kg),
            remaining_wt_kg = COALESCE($2, remaining_wt_kg),
            reject_wt_kg = COALESCE($3, reject_wt_kg),
            reject_reason_id = $4,
            remarks = COALESCE($5, remarks),
            is_edited = TRUE,
            last_edited_at = now()
        WHERE id = $6
        RETURNING *
      `, [inspected_wt_kg, remaining_wt_kg, reject_wt_kg, reject_reason_id, remarks, entityId]);
      const updated = rows[0];

      await recordDiffs(client, {
        entityType, entityId, entityCode: entityCode || `INSP-${entityId}`,
        action, oldRecord, newRecord: updated,
        fieldsToTrack: ['inspected_wt_kg', 'remaining_wt_kg', 'reject_wt_kg', 'remarks'],
        user, reason, details: { before: oldRecord, after: updated }, requestId
      });

      return updated;
    }
  }

  if (entityType === 'packing_entry') {
    if (action === 'BACKDATED_CREATE') {
      const {
        bag_id, packed_qty, packed_wt_kg, sample_packet_wt_g, calculated_part_wt_g,
        packets_count = 1, balance_qty = 0, operator_user_id, is_partial = false, created_at
      } = payload;

      const { rows } = await client.query(`
        INSERT INTO packing_entries 
          (bag_id, packed_qty, packed_wt_kg, sample_packet_wt_g, calculated_part_wt_g,
           packets_count, balance_qty, operator_user_id, is_backdated, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8, TRUE, COALESCE($9, now()))
        RETURNING *
      `, [
        bag_id, packed_qty, packed_wt_kg, sample_packet_wt_g || null, calculated_part_wt_g || null,
        packets_count, balance_qty, operator_user_id || user.id, created_at || null
      ]);
      const created = rows[0];

      const targetStatus = is_partial ? 'PARTIAL_PACK' : 'PACKED';
      await client.query(`UPDATE bags SET status = $1 WHERE id = $2`, [targetStatus, bag_id]);
      await client.query(`INSERT INTO bag_status_history (bag_id, from_status, to_status, source, changed_at) VALUES ($1, 'INSPECTED', $2, 'BACKDATED_PACK', COALESCE($3, now()))`, [bag_id, targetStatus, created_at || null]);

      await recordDiffs(client, {
        entityType, entityId: created.id, entityCode: entityCode || `PACK-${created.id}`,
        action, oldRecord: null, newRecord: created, fieldsToTrack: [],
        user, reason, details: created, requestId
      });

      return created;
    }

    if (action === 'EDIT') {
      const oldRes = await client.query(`SELECT * FROM packing_entries WHERE id = $1`, [entityId]);
      const oldRecord = oldRes.rows[0];
      if (!oldRecord) throw new Error('Packing entry not found.');

      const { packed_qty, packed_wt_kg, packets_count, balance_qty } = payload;
      const { rows } = await client.query(`
        UPDATE packing_entries
        SET packed_qty = COALESCE($1, packed_qty),
            packed_wt_kg = COALESCE($2, packed_wt_kg),
            packets_count = COALESCE($3, packets_count),
            balance_qty = COALESCE($4, balance_qty),
            is_edited = TRUE,
            last_edited_at = now()
        WHERE id = $5
        RETURNING *
      `, [packed_qty, packed_wt_kg, packets_count, balance_qty, entityId]);
      const updated = rows[0];

      await recordDiffs(client, {
        entityType, entityId, entityCode: entityCode || `PACK-${entityId}`,
        action, oldRecord, newRecord: updated,
        fieldsToTrack: ['packed_qty', 'packed_wt_kg', 'packets_count', 'balance_qty'],
        user, reason, details: { before: oldRecord, after: updated }, requestId
      });

      return updated;
    }
  }

  throw new Error(`Unsupported entityType: ${entityType}`);
}

// 1. Submit a Correction Request (Supervisor / Admin)
router.post('/request', async (req, res) => {
  const { entity_type, entity_id, entity_code, action, payload, reason } = req.body;
  if (!entity_type || !action || !payload || !reason || !reason.trim()) {
    return res.status(400).json({ error: 'entity_type, action, payload and a mandatory non-empty reason are required.' });
  }

  // If Admin directly submits via /request, they can opt for direct execution or pending request
  const isDirect = req.user.role === 'admin' && req.body.direct === true;

  if (isDirect) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await executeCorrection(client, {
        entityType: entity_type,
        entityId: entity_id || null,
        entityCode: entity_code || null,
        action,
        payload,
        user: req.user,
        reason: reason.trim(),
      });
      await client.query('COMMIT');
      return res.status(201).json({ success: true, direct: true, result });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Direct correction execution failed:', err);
      return res.status(500).json({ error: err.message || 'Direct correction execution failed' });
    } finally {
      client.release();
    }
  }

  // Default: Supervisor creates pending correction request
  try {
    const { rows } = await pool.query(`
      INSERT INTO correction_requests 
        (entity_type, entity_id, entity_code, action, payload, reason, requested_by, requested_by_name, requested_by_role, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *
    `, [
      entity_type,
      entity_id || null,
      entity_code || null,
      action,
      JSON.stringify(payload),
      reason.trim(),
      req.user.id,
      req.user.full_name || req.user.username,
      req.user.role
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Failed to create correction request:', err);
    res.status(500).json({ error: 'Failed to create correction request' });
  }
});

// 2. Get Pending Correction Requests (Admin & Supervisor can view in Approvals dashboard)
router.get('/pending', requireRole('admin', 'supervisor'), async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT cr.*, u.full_name AS requested_by_full_name, u.role AS requested_by_user_role
      FROM correction_requests cr
      JOIN users u ON u.id = cr.requested_by
      WHERE cr.status = 'pending'
      ORDER BY cr.created_at ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Failed to get pending corrections:', err);
    res.status(500).json({ error: 'Failed to get pending corrections' });
  }
});

// 3. Approve Correction Request (Admin Only)
router.post('/:id/approve', requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { review_notes } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const reqRes = await client.query(`SELECT * FROM correction_requests WHERE id = $1 FOR UPDATE`, [id]);
    const correctionReq = reqRes.rows[0];
    if (!correctionReq) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Correction request not found' });
    }
    if (correctionReq.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Request has already been ${correctionReq.status}` });
    }

    // Execute changes
    const result = await executeCorrection(client, {
      entityType: correctionReq.entity_type,
      entityId: correctionReq.entity_id,
      entityCode: correctionReq.entity_code,
      action: correctionReq.action,
      payload: correctionReq.payload,
      user: req.user,
      reason: correctionReq.reason,
      requestId: correctionReq.id,
    });

    await client.query(`
      UPDATE correction_requests
      SET status = 'approved', reviewed_by = $1, reviewed_at = now(), review_notes = $2
      WHERE id = $3
    `, [req.user.id, review_notes || null, id]);

    await client.query('COMMIT');
    res.json({ success: true, result });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to approve correction request:', err);
    res.status(500).json({ error: err.message || 'Failed to approve correction request' });
  } finally {
    client.release();
  }
});

// 4. Reject Correction Request (Admin Only)
router.post('/:id/reject', requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { review_notes } = req.body;
  if (!review_notes || !review_notes.trim()) {
    return res.status(400).json({ error: 'Rejection reason / review notes are required.' });
  }

  try {
    const { rows } = await pool.query(`
      UPDATE correction_requests
      SET status = 'rejected', reviewed_by = $1, reviewed_at = now(), review_notes = $2
      WHERE id = $3 AND status = 'pending'
      RETURNING *
    `, [req.user.id, review_notes.trim(), id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pending correction request not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Failed to reject correction request:', err);
    res.status(500).json({ error: 'Failed to reject correction request' });
  }
});

// 5. Direct Correction Execution (Admin Only)
router.post('/direct', requireRole('admin'), async (req, res) => {
  const { entity_type, entity_id, entity_code, action, payload, reason } = req.body;
  if (!entity_type || !action || !payload || !reason || !reason.trim()) {
    return res.status(400).json({ error: 'entity_type, action, payload, and a mandatory reason are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await executeCorrection(client, {
      entityType: entity_type,
      entityId: entity_id || null,
      entityCode: entity_code || null,
      action,
      payload,
      user: req.user,
      reason: reason.trim(),
    });
    await client.query('COMMIT');
    res.status(201).json({ success: true, result });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Direct correction failed:', err);
    res.status(500).json({ error: err.message || 'Failed to execute direct correction' });
  } finally {
    client.release();
  }
});

// 6. Query Record Correction Log (Admin Only)
router.get('/log', requireRole('admin'), async (req, res) => {
  const { entity_type, entity_id, action, date_from, date_to } = req.query;
  const params = [];
  const clauses = [];

  if (entity_type) {
    params.push(entity_type);
    clauses.push(`rcl.entity_type = $${params.length}`);
  }
  if (entity_id) {
    params.push(Number(entity_id));
    clauses.push(`rcl.entity_id = $${params.length}`);
  }
  if (action) {
    params.push(action);
    clauses.push(`rcl.action = $${params.length}`);
  }
  if (date_from) {
    params.push(date_from);
    clauses.push(`rcl.created_at >= $${params.length}::timestamptz`);
  }
  if (date_to) {
    params.push(date_to);
    clauses.push(`rcl.created_at <= ($${params.length}::date + interval '1 day')`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

  try {
    const { rows } = await pool.query(`
      SELECT rcl.*, u.full_name AS user_full_name, u.role AS user_role
      FROM record_correction_log rcl
      LEFT JOIN users u ON u.id = rcl.changed_by
      ${where}
      ORDER BY rcl.created_at DESC
      LIMIT 200
    `, params);
    res.json(rows);
  } catch (err) {
    console.error('Failed to query record_correction_log:', err);
    res.status(500).json({ error: 'Failed to query record_correction_log' });
  }
});

// 7. Auto-Lookup on Date + Machine Selection (VBA Continuation Behavior & Mould Change Detection)
router.get('/machine-last-state', async (req, res) => {
  const { machine_id, entry_date } = req.query;
  if (!machine_id || !entry_date) {
    return res.status(400).json({ error: 'machine_id and entry_date are required' });
  }

  try {
    // Fetch latest approved assignment for this machine
    const assignRes = await pool.query(`
      SELECT ma.*, p.part_code, p.shrp_part_code, p.part_name, m.machine_code
      FROM machine_assignments ma
      JOIN parts p ON p.id = ma.part_id
      JOIN machines m ON m.id = ma.machine_id
      WHERE ma.machine_id = $1 AND ma.status = 'approved'
      ORDER BY ma.approved_at DESC NULLS LAST, ma.id DESC
      LIMIT 1
    `, [machine_id]);
    const latestAssign = assignRes.rows[0] || null;

    // 1. Exact date lookup
    const exactRes = await pool.query(`
      SELECT pe.*, p.part_code, p.shrp_part_code, p.part_name, u.full_name AS operator_name
      FROM production_entries pe
      LEFT JOIN parts p ON p.id = pe.part_id
      LEFT JOIN users u ON u.id = pe.operator_user_id
      WHERE pe.machine_id = $1 AND pe.entry_date = $2
      ORDER BY COALESCE(pe.period_end_at, pe.end_time, pe.created_at) DESC
      LIMIT 1
    `, [machine_id, entry_date]);

    if (exactRes.rows.length > 0) {
      const exactEntry = exactRes.rows[0];
      // Check if machine assignment changed to another part or was approved after this entry
      const entryTime = exactEntry.period_end_at || exactEntry.end_time || exactEntry.created_at;
      const assignTime = latestAssign ? (latestAssign.mould_load_started_at || latestAssign.approved_at || latestAssign.set_at) : null;
      const isMouldChanged = latestAssign && (
        String(latestAssign.part_id) !== String(exactEntry.part_id) ||
        (assignTime && entryTime && new Date(assignTime) >= new Date(entryTime))
      );

      if (isMouldChanged) {
        return res.json({
          found_exact: true,
          entry: {
            part_id: latestAssign.part_id,
            part_code: latestAssign.part_code,
            shrp_part_code: latestAssign.shrp_part_code,
            part_name: latestAssign.part_name,
            start_count: 0,
            end_count: '',
            hour_slot: 1,
            is_mould_change: true,
            previous_part_code: exactEntry.shrp_part_code || exactEntry.part_code,
            new_part_code: latestAssign.shrp_part_code || latestAssign.part_code,
            period_start_at: latestAssign.mould_load_started_at || latestAssign.first_ok_part_at || latestAssign.approved_at || entryTime,
          },
          message: `Mould Change Detected: Part switched from ${exactEntry.shrp_part_code || exactEntry.part_code} to ${latestAssign.shrp_part_code || latestAssign.part_code}. Counter reset to 0.`
        });
      }

      return res.json({
        found_exact: true,
        entry: exactEntry,
        message: `Found prior entry for ${exactEntry.shrp_part_code || exactEntry.part_code}. Continuing from shot ${exactEntry.end_count}.`
      });
    }

    // 2. Fallback prior date lookup
    const priorRes = await pool.query(`
      SELECT pe.*, p.part_code, p.shrp_part_code, p.part_name, u.full_name AS operator_name
      FROM production_entries pe
      LEFT JOIN parts p ON p.id = pe.part_id
      LEFT JOIN users u ON u.id = pe.operator_user_id
      WHERE pe.machine_id = $1 AND pe.entry_date < $2
      ORDER BY pe.entry_date DESC, COALESCE(pe.period_end_at, pe.end_time, pe.created_at) DESC
      LIMIT 1
    `, [machine_id, entry_date]);

    if (priorRes.rows.length > 0) {
      const priorEntry = priorRes.rows[0];
      const isMouldChanged = latestAssign && String(latestAssign.part_id) !== String(priorEntry.part_id);

      if (isMouldChanged) {
        return res.json({
          found_exact: false,
          entry: {
            part_id: latestAssign.part_id,
            part_code: latestAssign.part_code,
            shrp_part_code: latestAssign.shrp_part_code,
            part_name: latestAssign.part_name,
            start_count: 0,
            end_count: '',
            hour_slot: 1,
            is_mould_change: true,
            previous_part_code: priorEntry.shrp_part_code || priorEntry.part_code,
            new_part_code: latestAssign.shrp_part_code || latestAssign.part_code,
            period_start_at: latestAssign.mould_load_started_at || latestAssign.first_ok_part_at || latestAssign.approved_at,
          },
          message: `Mould Change: Part is ${latestAssign.shrp_part_code || latestAssign.part_code}. Counter reset to 0.`
        });
      }

      return res.json({
        found_exact: false,
        entry: priorEntry,
        message: `No entry on ${entry_date}. Showing previous state from ${priorEntry.entry_date} (Shot ${priorEntry.end_count}).`
      });
    }

    // 3. Fallback to machine's active assignment
    return res.json({
      found_exact: false,
      entry: latestAssign ? {
        part_id: latestAssign.part_id,
        part_code: latestAssign.part_code,
        shrp_part_code: latestAssign.shrp_part_code,
        part_name: latestAssign.part_name,
        start_count: 0,
        end_count: '',
        hour_slot: 1,
        is_mould_change: true,
        period_start_at: latestAssign.mould_load_started_at || latestAssign.first_ok_part_at || latestAssign.approved_at,
      } : null,
      assignment: latestAssign,
      message: latestAssign ? `Assigned Part: ${latestAssign.shrp_part_code || latestAssign.part_code}. Counter starts at 0.` : 'No previous entries or active assignment found.'
    });
  } catch (err) {
    console.error('Failed to get machine last state:', err);
    res.status(500).json({ error: 'Failed to get machine last state' });
  }
});

module.exports = router;
