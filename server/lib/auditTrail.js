const pool = require('../db/pool');

async function logAudit(clientOrPool, {
  process,
  bag_id = null,
  bag_code = null,
  batch_no = null,
  part_id = null,
  machine_id = null,
  user_id,
  qty = null,
  weight_kg = null,
  status_from = null,
  status_to = null,
  is_fifo_override = false,
  oldest_bag_code = null,
  is_over_tolerance = false,
  approved_by = null,
  approval_reason = null,
  remarks = null,
}) {
  const db = clientOrPool || pool;
  try {
    const { rows } = await db.query(
      `INSERT INTO traceability_audit_log (
        process, bag_id, bag_code, batch_no, part_id, machine_id, user_id,
        qty, weight_kg, status_from, status_to, is_fifo_override, oldest_bag_code,
        is_over_tolerance, approved_by, approval_reason, remarks
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [
        process, bag_id, bag_code, batch_no, part_id, machine_id, user_id,
        qty, weight_kg, status_from, status_to, is_fifo_override, oldest_bag_code,
        is_over_tolerance, approved_by, approval_reason, remarks,
      ]
    );
    return rows[0];
  } catch (err) {
    console.error('Failed to log traceability audit:', err);
    return null;
  }
}

module.exports = { logAudit };
