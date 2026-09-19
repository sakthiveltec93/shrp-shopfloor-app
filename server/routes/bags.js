const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const {
  isWithinTolerance, isWithinTrimTolerance, isWithinInspectionTolerance,
  isLegitimateStatusAdvance,
} = require('../lib/bagStatus');
const { currentShift, istDateString } = require('../lib/shift');
const { logAudit } = require('../lib/auditTrail');

const router = express.Router();
router.use(requireAuth);

async function logHistory(client, bagId, fromStatus, toStatus, source) {
  await client.query(
    `INSERT INTO bag_status_history (bag_id, from_status, to_status, source) VALUES ($1,$2,$3,$4)`,
    [bagId, fromStatus, toStatus, source]
  );
}

async function checkFifo(partId, requiredStatuses, currentBagId, entryDate, shift, createdAt) {
  const statuses = Array.isArray(requiredStatuses) ? requiredStatuses : [requiredStatuses];
  const { rows } = await pool.query(`
    SELECT b.bag_code, b.entry_date, b.shift, b.id
    FROM bags b
    WHERE b.part_id = $1 AND b.bag_type = 'PART'
      AND b.bag_code NOT ILIKE '%-REJ%'
      AND b.bag_code NOT ILIKE '%-RUNNER%'
      AND b.bag_code NOT ILIKE '%-LUMP%'
      AND b.bag_code NOT ILIKE '%-SCRAP%'
      AND b.bag_type NOT IN ('RUNNER', 'REJECTION', 'LUMP', 'LUMPS', 'SCRAP')
      AND b.status = ANY($2::text[]) AND b.id != $3
      AND (
        b.entry_date < $4 OR
        (b.entry_date = $4 AND b.shift = 'A' AND $5 = 'B') OR
        (b.entry_date = $4 AND b.shift = $5 AND b.created_at < $6)
      )
    ORDER BY b.entry_date ASC, (CASE b.shift WHEN 'A' THEN 0 ELSE 1 END) ASC, b.created_at ASC
    LIMIT 1
  `, [partId, statuses, currentBagId, entryDate, shift, createdAt]);
  return rows[0] || null;
}

async function getBag(id) {
  const { rows } = await pool.query('SELECT * FROM bags WHERE id = $1', [id]);
  return rows[0];
}

async function getPart(id) {
  const { rows } = await pool.query('SELECT * FROM parts WHERE id = $1', [id]);
  return rows[0];
}

// --- Production visibility during bagging ---
router.get('/production-visibility', async (req, res) => {
  const { machine_id, entry_date, shift, part_id } = req.query;
  if (!machine_id || !entry_date || !shift) {
    return res.status(400).json({ error: 'machine_id, entry_date, and shift are required' });
  }

  // Total production good quantity for machine + date + shift (Shift Cumulative)
  const prodRes = await pool.query(
    `SELECT COALESCE(SUM(good_qty), 0)::integer AS total_prod_qty
     FROM production_entries
     WHERE machine_id = $1 AND entry_date = $2 AND shift = $3`,
    [machine_id, entry_date, shift]
  );
  const production_qty = prodRes.rows[0].total_prod_qty;

  // Resolve part details
  let part = null;
  if (part_id) {
    const partRes = await pool.query('SELECT * FROM parts WHERE id = $1', [part_id]);
    part = partRes.rows[0];
  } else {
    const assignRes = await pool.query(
      `SELECT p.* FROM machine_assignments ma
       JOIN parts p ON p.id = ma.part_id
       WHERE ma.machine_id = $1 AND ma.status = 'approved'
       ORDER BY ma.approved_at DESC LIMIT 1`,
      [machine_id]
    );
    part = assignRes.rows[0];
  }

  // Current hour production
  const { hourSlot } = require('../lib/shift');
  const currentSlot = hourSlot(new Date());
  const hourRes = await pool.query(
    `SELECT COALESCE(SUM(good_qty), 0)::integer AS hour_qty
     FROM production_entries
     WHERE machine_id = $1 AND entry_date = $2 AND shift = $3 AND hour_slot = $4`,
    [machine_id, entry_date, shift, currentSlot]
  );
  const current_hour_qty = hourRes.rows[0].hour_qty;

  // Batch / Part cumulative production
  const batchRes = await pool.query(
    `SELECT COALESCE(SUM(good_qty), 0)::integer AS batch_qty
     FROM production_entries
     WHERE machine_id = $1 AND ($2::integer IS NULL OR part_id = $2)`,
    [machine_id, part?.id || null]
  );
  const batch_cumulative_qty = batchRes.rows[0].batch_qty;

  // Already bagged for machine + date + shift
  const baggedRes = await pool.query(
    `SELECT COALESCE(SUM(qty), 0)::integer AS total_bagged_qty,
            COALESCE(SUM(base_weight_kg), 0)::numeric AS total_bagged_wt
     FROM bags
     WHERE machine_id = $1 AND entry_date = $2 AND shift = $3 AND bag_type = 'PART'`,
    [machine_id, entry_date, shift]
  );
  const already_bagged_qty = baggedRes.rows[0].total_bagged_qty;
  const already_bagged_weight_kg = Number(baggedRes.rows[0].total_bagged_wt || 0);

  // Available to Bag = Total Production Qty – Total Already Bagged Qty
  const available_to_bag_qty = Math.max(0, production_qty - already_bagged_qty);

  // Target Qty & Balance Qty = Target Qty – Total Already Bagged Qty
  const target_qty = (part && part.standard_pack_qty) ? part.standard_pack_qty : Math.max(production_qty, 1000);
  const balance_qty = Math.max(0, target_qty - already_bagged_qty);

  // Weight derivations
  const cavityCount = (part && part.cavity_count) || 1;
  const partWeightG = part && part.part_weight_g ? Number(part.part_weight_g) : (part && part.unit_weight_g ? Number(part.unit_weight_g) / cavityCount : 0);
  const shotWeightG = part && part.unit_weight_g ? Number(part.unit_weight_g) : (partWeightG * cavityCount);
  const runnerWeightPerShotG = Math.max(0, shotWeightG - (partWeightG * cavityCount));
  const runnerWeightPerPartG = runnerWeightPerShotG / cavityCount;

  const production_weight_kg = Number(((production_qty * partWeightG) / 1000).toFixed(3));
  const runner_weight_kg = Number(((production_qty * runnerWeightPerPartG) / 1000).toFixed(3));
  const remaining_weight_kg = Number(Math.max(0, production_weight_kg - already_bagged_weight_kg).toFixed(3));

  // Tolerance Rule: Greater of 200 Nos OR tolerance % of Production Qty
  const tolerancePct = (part && part.tolerance_pct ? Number(part.tolerance_pct) : 2) / 100;
  const tolerance_qty = Math.max(200, Math.round(production_qty * tolerancePct));
  const max_allowed_qty = production_qty + tolerance_qty;

  // Completion check
  const is_completed = production_qty > 0 && already_bagged_qty >= Math.max(0, production_qty - tolerance_qty);

  // Existing bags for machine + date + shift
  const { rows: existingBags } = await pool.query(
    `SELECT b.id, b.bag_code, b.batch_no, b.base_weight_kg, b.qty, b.status, b.created_at
     FROM bags b
     WHERE b.machine_id = $1 AND b.entry_date = $2 AND b.shift = $3 AND b.bag_type = 'PART'
     ORDER BY b.created_at ASC`,
    [machine_id, entry_date, shift]
  );

  res.json({
    current_hour_qty,
    shift_cumulative_qty: production_qty,
    batch_cumulative_qty,
    target_qty,
    production_qty,
    already_bagged_qty,
    available_to_bag_qty,
    balance_qty,
    production_weight_kg,
    runner_weight_kg,
    part_weight_g: partWeightG,
    already_bagged_weight_kg: Number(already_bagged_weight_kg.toFixed(3)),
    remaining_qty: available_to_bag_qty,
    remaining_weight_kg,
    tolerance_qty,
    max_allowed_qty,
    is_completed,
    existing_bags: existingBags,
    part_name: part?.part_name || '',
    shrp_part_code: part?.shrp_part_code || part?.part_code || '',
    customer_part_no: part?.customer_part_no || part?.part_code || '',
  });
});

// --- Bag Entry: create a new bag under a batch with excess bagging tolerance ---
router.post('/', async (req, res) => {
  const {
    machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, remarks,
    supervisor_pin, approval_reason,
  } = req.body;

  if (!machine_id || !part_id || !batch_no || !base_weight_kg || !qty) {
    return res.status(400).json({ error: 'machine_id, part_id, batch_no, base_weight_kg and qty are required' });
  }
  const type = bag_type === 'RUNNER' ? 'RUNNER' : 'PART';
  const now = new Date();
  const entryDate = istDateString(now);
  const shift = currentShift(now);

  let isOverTolerance = false;
  let toleranceApprovedBy = null;
  let toleranceApprovedAt = null;
  let toleranceApprovalRemarks = null;

  // Tolerance check on PART bags
  if (type === 'PART') {
    const prodRes = await pool.query(
      `SELECT COALESCE(SUM(good_qty), 0)::integer AS total_prod_qty
       FROM production_entries
       WHERE machine_id = $1 AND entry_date = $2 AND shift = $3`,
      [machine_id, entryDate, shift]
    );
    const prodQty = prodRes.rows[0].total_prod_qty;

    if (prodQty > 0) {
      const baggedRes = await pool.query(
        `SELECT COALESCE(SUM(qty), 0)::integer AS total_bagged_qty
         FROM bags
         WHERE machine_id = $1 AND entry_date = $2 AND shift = $3 AND bag_type = 'PART'`,
        [machine_id, entryDate, shift]
      );
      const alreadyBagged = baggedRes.rows[0].total_bagged_qty;
      const newTotal = alreadyBagged + Number(qty);
      const part = await getPart(part_id);
      const tolerancePct = (part && part.tolerance_pct ? Number(part.tolerance_pct) : 2) / 100;
      const toleranceQty = Math.max(200, Math.round(prodQty * tolerancePct));
      const maxAllowed = prodQty + toleranceQty;

      if (newTotal > maxAllowed) {
        let approvedUser = null;
        if (req.user.role === 'admin' || req.user.role === 'supervisor') {
          approvedUser = req.user;
        } else if (supervisor_pin) {
          const supRes = await pool.query(
            `SELECT id, pin_hash, full_name, role FROM users WHERE role IN ('supervisor', 'admin') AND active = TRUE`
          );
          for (const sup of supRes.rows) {
            const match = await bcrypt.compare(String(supervisor_pin), sup.pin_hash);
            if (match) {
              approvedUser = sup;
              break;
            }
          }
        }

        if (!approvedUser || !approval_reason) {
          return res.status(422).json({
            error: 'Quantity exceeds allowed tolerance.',
            code: 'over_tolerance',
            production_qty: prodQty,
            already_processed: alreadyBagged,
            new_total: newTotal,
            allowed_max: maxAllowed,
          });
        }

        isOverTolerance = true;
        toleranceApprovedBy = approvedUser.id;
        toleranceApprovedAt = new Date();
        toleranceApprovalRemarks = approval_reason;
      }
    }
  }

  const { rows: existing } = await pool.query(
    `SELECT bag_code FROM bags WHERE batch_no = $1`, [batch_no]
  );
  let maxNo = 0;
  for (const row of existing) {
    const suffix = row.bag_code.slice(-3);
    if (/^\d{3}$/.test(suffix)) maxNo = Math.max(maxNo, parseInt(suffix, 10));
  }
  const bagCode = `${batch_no}-${String(maxNo + 1).padStart(3, '0')}`;

  const { rows } = await pool.query(
    `INSERT INTO bags (bag_code, batch_no, entry_date, shift, machine_id, part_id, bag_type,
       base_weight_kg, qty, operator_user_id, status, remarks,
       is_over_tolerance, tolerance_approved_by, tolerance_approved_at, tolerance_approval_remarks)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'OPEN',$11,$12,$13,$14,$15) RETURNING *`,
    [bagCode, batch_no, entryDate, shift, machine_id, part_id, type, base_weight_kg, qty, req.user.id,
      remarks || null, isOverTolerance, toleranceApprovedBy, toleranceApprovedAt, toleranceApprovalRemarks]
  );
  const bag = rows[0];
  await logHistory(pool, bag.id, null, 'OPEN', 'Bag Entry');

  await logAudit(pool, {
    process: 'bagging',
    bag_id: bag.id,
    bag_code: bag.bag_code,
    batch_no: bag.batch_no,
    part_id: bag.part_id,
    machine_id: bag.machine_id,
    user_id: req.user.id,
    qty,
    weight_kg: base_weight_kg,
    status_from: null,
    status_to: 'OPEN',
    is_over_tolerance: isOverTolerance,
    approved_by: toleranceApprovedBy,
    approval_reason: toleranceApprovalRemarks,
    remarks: remarks || null,
  });

  res.status(201).json(bag);
});

// Batch info
router.get('/batch-info', async (req, res) => {
  const { machine_id, entry_date, shift } = req.query;
  if (!machine_id || !entry_date || !shift) {
    return res.status(400).json({ error: 'machine_id, entry_date and shift are required' });
  }
  const assignment = await pool.query(
    `SELECT p.* FROM machine_assignments ma
     JOIN parts p ON p.id = ma.part_id
     WHERE ma.machine_id = $1 AND ma.status = 'approved'
     ORDER BY ma.approved_at DESC LIMIT 1`,
    [machine_id]
  );
  const part = assignment.rows[0];
  if (!part) return res.status(409).json({ error: 'No approved mould/part assignment for this machine' });
  if (!part.batch_part_code) {
    return res.status(409).json({ error: `Part ${part.part_code} has no batch code set yet - add one in Parts before logging bags for it.` });
  }

  const [yyyy, mm, dd] = entry_date.split('-');
  const ddmmyy = `${dd}${mm}${yyyy.slice(2)}`;
  const batch_no = `${part.batch_part_code}${ddmmyy}${shift}`;

  res.json({
    batch_no,
    part_id: part.id,
    part_code: part.part_code,
    part_name: part.part_name,
    shrp_part_code: part.shrp_part_code,
    customer_part_no: part.customer_part_no,
    cavity_count: part.cavity_count,
    shot_weight_g: part.unit_weight_g,
    part_weight_g: part.part_weight_g,
  });
});

// Stage-eligible parts: returns all active parts ordered by ready_bag_count
router.get('/stage-parts', async (req, res) => {
  const { stage } = req.query;
  const { rows } = await pool.query(`
    SELECT p.id, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no,
           p.trim_required, p.inspection_required, p.packing_required, p.dispatch_required,
           p.part_weight_g, p.unit_weight_g, p.batch_part_code, p.standard_pack_qty,
           COUNT(b.id) FILTER (
             WHERE b.bag_type = 'PART'
               AND b.bag_code NOT ILIKE '%-REJ%'
               AND b.bag_code NOT ILIKE '%-RUNNER%'
               AND b.bag_code NOT ILIKE '%-LUMP%'
               AND b.bag_code NOT ILIKE '%-SCRAP%'
               AND b.status != 'HOLD'
               AND b.status != 'SCRAPPED'
           ) AS active_bag_count,
           COUNT(b.id) FILTER (
             WHERE b.bag_type = 'PART'
               AND b.bag_code NOT ILIKE '%-REJ%'
               AND b.bag_code NOT ILIKE '%-RUNNER%'
               AND b.bag_code NOT ILIKE '%-LUMP%'
               AND b.bag_code NOT ILIKE '%-SCRAP%'
                AND b.status != 'HOLD' AND (
                ($1 = 'trim' AND b.status IN ('OPEN', 'PARTIAL_TRIM')) OR
                ($1 = 'inspect' AND (
                  ((p.trim_required = TRUE OR b.weighed_with_runner = TRUE) AND b.status IN ('TRIMMED', 'PARTIAL_INSPECT')) OR
                  (NOT (p.trim_required = TRUE OR b.weighed_with_runner = TRUE) AND b.status IN ('OPEN', 'TRIMMED', 'PARTIAL_INSPECT'))
                )) OR
                ($1 = 'pack' AND (
                  (p.inspection_required AND b.status = 'INSPECTED') OR
                  (NOT p.inspection_required AND (p.trim_required = TRUE OR b.weighed_with_runner = TRUE) AND b.status IN ('TRIMMED', 'INSPECTED')) OR
                  (NOT p.inspection_required AND NOT (p.trim_required = TRUE OR b.weighed_with_runner = TRUE) AND b.status IN ('OPEN', 'TRIMMED', 'INSPECTED'))
                )) OR
                ($1 = 'dispatch' AND b.status = 'PACKED')
              )
            ) AS ready_bag_count
    FROM parts p
    LEFT JOIN bags b ON b.part_id = p.id
    WHERE p.active = TRUE
    GROUP BY p.id
    ORDER BY (
      COUNT(b.id) FILTER (
        WHERE b.bag_type = 'PART'
          AND b.bag_code NOT ILIKE '%-REJ%'
          AND b.bag_code NOT ILIKE '%-RUNNER%'
          AND b.bag_code NOT ILIKE '%-LUMP%'
          AND b.bag_code NOT ILIKE '%-SCRAP%'
          AND b.status != 'HOLD' AND (
          ($1 = 'trim' AND b.status IN ('OPEN', 'PARTIAL_TRIM')) OR
          ($1 = 'inspect' AND (
            ((p.trim_required = TRUE OR b.weighed_with_runner = TRUE) AND b.status IN ('TRIMMED', 'PARTIAL_INSPECT')) OR
            (NOT (p.trim_required = TRUE OR b.weighed_with_runner = TRUE) AND b.status IN ('OPEN', 'TRIMMED', 'PARTIAL_INSPECT'))
          )) OR
          ($1 = 'pack' AND (
            (p.inspection_required AND b.status = 'INSPECTED') OR
            (NOT p.inspection_required AND (p.trim_required = TRUE OR b.weighed_with_runner = TRUE) AND b.status IN ('TRIMMED', 'INSPECTED')) OR
            (NOT p.inspection_required AND NOT (p.trim_required = TRUE OR b.weighed_with_runner = TRUE) AND b.status IN ('OPEN', 'TRIMMED', 'INSPECTED'))
          )) OR
          ($1 = 'dispatch' AND b.status = 'PACKED')
        )
      )
    ) DESC,
    COUNT(b.id) FILTER (
      WHERE b.bag_type = 'PART'
        AND b.bag_code NOT ILIKE '%-REJ%'
        AND b.bag_code NOT ILIKE '%-RUNNER%'
        AND b.bag_code NOT ILIKE '%-LUMP%'
        AND b.bag_code NOT ILIKE '%-SCRAP%'
        AND b.status != 'HOLD'
        AND b.status != 'SCRAPPED'
    ) DESC,
    p.part_code ASC
  `, [stage || '']);
  res.json(rows);
});

// Comprehensive bag history log with operator details and stage timelines
router.get('/log/history', async (req, res) => {
  const { date, shift, stage, part_id, search } = req.query;
  const clauses = [];
  const params = [];

  if (date) {
    params.push(date);
    const pIdx = params.length;
    clauses.push(`(
      b.entry_date = $${pIdx} OR
      b.created_at::date = $${pIdx} OR
      EXISTS (SELECT 1 FROM trim_entries te WHERE te.bag_id = b.id AND te.created_at::date = $${pIdx}) OR
      EXISTS (SELECT 1 FROM inspection_entries ie WHERE ie.bag_id = b.id AND ie.created_at::date = $${pIdx}) OR
      EXISTS (SELECT 1 FROM packing_entries pe WHERE pe.bag_id = b.id AND pe.created_at::date = $${pIdx})
    )`);
  }
  if (shift && shift !== 'ALL') {
    params.push(shift);
    clauses.push(`b.shift = $${params.length}`);
  }
  if (part_id) {
    params.push(part_id);
    clauses.push(`b.part_id = $${params.length}`);
  }
  if (stage) {
    const stg = stage.toLowerCase();
    if (stg === 'trim' || stg === 'trimming') {
      clauses.push(`(b.status IN ('TRIMMED', 'PARTIAL_INSPECT', 'INSPECTED', 'PACKED', 'DISPATCHED') OR EXISTS (SELECT 1 FROM trim_entries te WHERE te.bag_id = b.id))`);
    } else if (stg === 'inspect' || stg === 'inspection') {
      clauses.push(`(b.status IN ('INSPECTED', 'PACKED', 'DISPATCHED') OR EXISTS (SELECT 1 FROM inspection_entries ie WHERE ie.bag_id = b.id))`);
    } else if (stg === 'pack' || stg === 'packing') {
      clauses.push(`(b.status IN ('PACKED', 'DISPATCHED') OR EXISTS (SELECT 1 FROM packing_entries pe WHERE pe.bag_id = b.id))`);
    } else if (stg === 'dispatch') {
      clauses.push(`b.status = 'DISPATCHED'`);
    }
  }
  if (search && search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    clauses.push(`(LOWER(b.bag_code) LIKE $${params.length} OR LOWER(b.batch_no) LIKE $${params.length} OR LOWER(p.shrp_part_code) LIKE $${params.length} OR LOWER(p.customer_part_no) LIKE $${params.length})`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const query = `
    SELECT b.*,
           m.machine_code,
           p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no,
           u.full_name AS created_by_name,
           (
             SELECT json_agg(json_build_object(
               'id', te.id,
               'trimmed_wt_kg', te.trimmed_wt_kg,
               'runner_wt_kg', te.runner_wt_kg,
               'reject_wt_kg', te.reject_wt_kg,
               'remaining_wt_kg', te.remaining_wt_kg,
               'is_partial', te.is_partial,
               'pass_number', te.pass_number,
               'reject_reason', ci.item_name,
               'operator_name', ou.full_name,
               'created_at', te.created_at
             ) ORDER BY te.pass_number ASC, te.created_at ASC)
             FROM trim_entries te
             LEFT JOIN check_items ci ON ci.id = te.reject_reason_id
             LEFT JOIN users ou ON ou.id = te.operator_user_id
             WHERE te.bag_id = b.id
           ) AS trim_history,
           (
             SELECT json_agg(json_build_object(
               'id', ie.id,
               'inspected_wt_kg', ie.inspected_wt_kg,
               'remaining_wt_kg', ie.remaining_wt_kg,
               'reject_wt_kg', ie.reject_wt_kg,
               'sent_to_rework_qty', ie.sent_to_rework_qty,
               'variance_tier', ie.variance_tier,
               'is_partial', ie.is_partial,
               'remarks', ie.remarks,
               'reject_reason', ci.item_name,
               'operator_name', ou.full_name,
               'created_at', ie.created_at
             ) ORDER BY ie.created_at ASC)
             FROM inspection_entries ie
             LEFT JOIN check_items ci ON ci.id = ie.reject_reason_id
             LEFT JOIN users ou ON ou.id = ie.operator_user_id
             WHERE ie.bag_id = b.id
           ) AS inspection_history,
           (
             SELECT json_agg(json_build_object(
               'id', pe.id,
               'packed_qty', pe.packed_qty,
               'packed_wt_kg', pe.packed_wt_kg,
               'sample_packet_wt_g', pe.sample_packet_wt_g,
               'packets_count', pe.packets_count,
               'balance_qty', pe.balance_qty,
               'operator_name', ou.full_name,
               'created_at', pe.created_at
             ) ORDER BY pe.created_at ASC)
             FROM packing_entries pe
             LEFT JOIN users ou ON ou.id = pe.operator_user_id
             WHERE pe.bag_id = b.id
           ) AS packing_history,
           (
             SELECT json_agg(json_build_object(
               'id', hl.id,
               'stage', hl.stage,
               'reason', hl.reason,
               'hold_by', hu.full_name,
               'hold_at', hl.hold_at,
               'released_by', ru.full_name,
               'released_at', hl.released_at,
               'release_remarks', hl.release_remarks,
               'is_active', hl.is_active
             ) ORDER BY hl.hold_at DESC)
             FROM bag_hold_log hl
             LEFT JOIN users hu ON hu.id = hl.hold_by_user_id
             LEFT JOIN users ru ON ru.id = hl.released_by_user_id
             WHERE hl.bag_id = b.id
           ) AS hold_history,
           (
             SELECT json_agg(json_build_object(
               'id', brl.id,
               'stage', brl.stage,
               'reject_reason', ci.item_name,
               'reject_wt_kg', brl.reject_wt_kg,
               'reject_qty', brl.reject_qty,
               'disposition', brl.disposition,
               'operator_name', ou.full_name,
               'created_at', brl.created_at
             ) ORDER BY brl.created_at ASC)
             FROM bag_reject_log brl
             LEFT JOIN check_items ci ON ci.id = brl.reject_reason_id
             LEFT JOIN users ou ON ou.id = brl.operator_user_id
             WHERE brl.bag_id = b.id
           ) AS reject_history
    FROM bags b
    JOIN machines m ON m.id = b.machine_id
    JOIN parts p ON p.id = b.part_id
    JOIN users u ON u.id = b.operator_user_id
    ${where}
    ORDER BY b.entry_date DESC, b.created_at DESC
    LIMIT 500
  `;

  const { rows } = await pool.query(query, params);
  res.json(rows);
});

// List bags with stage filtering: only returns eligible PART bags ready for that stage
router.get('/', async (req, res) => {
  const { batch_no, status, part_id, stage, bag_type } = req.query;
  const clauses = [];
  const params = [];
  if (batch_no && batch_no !== 'undefined') { params.push(batch_no); clauses.push(`b.batch_no = $${params.length}`); }
  if (status && status !== 'undefined') { params.push(status); clauses.push(`b.status = $${params.length}`); }
  if (part_id && part_id !== 'undefined' && !isNaN(part_id)) { params.push(parseInt(part_id, 10)); clauses.push(`b.part_id = $${params.length}`); }
  if (bag_type && bag_type !== 'undefined') {
    params.push(bag_type);
    clauses.push(`b.bag_type = $${params.length}`);
  }

  // If a specific shopfloor stage is passed, filter strictly for eligible PART bags
  if (stage === 'trim') {
    clauses.push(`b.bag_type = 'PART'`);
    clauses.push(`b.bag_code NOT ILIKE '%-REJ%' AND b.bag_code NOT ILIKE '%-RUNNER%' AND b.bag_code NOT ILIKE '%-LUMP%' AND b.bag_code NOT ILIKE '%-SCRAP%' AND b.bag_type NOT IN ('RUNNER', 'REJECTION', 'LUMP', 'LUMPS', 'SCRAP')`);
    clauses.push(`b.status IN ('OPEN', 'PARTIAL_TRIM')`);
  } else if (stage === 'inspect') {
    clauses.push(`b.bag_type = 'PART'`);
    clauses.push(`b.bag_code NOT ILIKE '%-REJ%' AND b.bag_code NOT ILIKE '%-RUNNER%' AND b.bag_code NOT ILIKE '%-LUMP%' AND b.bag_code NOT ILIKE '%-SCRAP%' AND b.bag_type NOT IN ('RUNNER', 'REJECTION', 'LUMP', 'LUMPS', 'SCRAP')`);
    clauses.push(`(
      ((p.trim_required = TRUE OR b.weighed_with_runner = TRUE) AND b.status IN ('TRIMMED', 'PARTIAL_INSPECT')) OR
      (NOT (p.trim_required = TRUE OR b.weighed_with_runner = TRUE) AND b.status IN ('OPEN', 'TRIMMED', 'PARTIAL_INSPECT'))
    )`);
  } else if (stage === 'pack') {
    clauses.push(`b.bag_type = 'PART'`);
    clauses.push(`b.bag_code NOT ILIKE '%-REJ%' AND b.bag_code NOT ILIKE '%-RUNNER%' AND b.bag_code NOT ILIKE '%-LUMP%' AND b.bag_code NOT ILIKE '%-SCRAP%' AND b.bag_type NOT IN ('RUNNER', 'REJECTION', 'LUMP', 'LUMPS', 'SCRAP')`);
    clauses.push(`(
      (p.inspection_required = TRUE AND b.status = 'INSPECTED') OR
      (p.inspection_required = FALSE AND (p.trim_required = TRUE OR b.weighed_with_runner = TRUE) AND b.status IN ('TRIMMED', 'INSPECTED')) OR
      (p.inspection_required = FALSE AND NOT (p.trim_required = TRUE OR b.weighed_with_runner = TRUE) AND b.status IN ('OPEN', 'TRIMMED', 'INSPECTED'))
    )`);
  } else if (stage === 'dispatch') {
    clauses.push(`b.bag_type = 'PART'`);
    clauses.push(`b.bag_code NOT ILIKE '%-REJ%' AND b.bag_code NOT ILIKE '%-RUNNER%' AND b.bag_code NOT ILIKE '%-LUMP%' AND b.bag_code NOT ILIKE '%-SCRAP%' AND b.bag_type NOT IN ('RUNNER', 'REJECTION', 'LUMP', 'LUMPS', 'SCRAP')`);
    clauses.push(`b.status = 'PACKED'`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const { rows } = await pool.query(`
    SELECT b.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no,
           p.trim_required, p.inspection_required, p.packing_required, p.dispatch_required
    FROM bags b
    JOIN machines m ON m.id = b.machine_id
    JOIN parts p ON p.id = b.part_id
    ${where}
    ORDER BY b.entry_date ASC, (CASE b.shift WHEN 'A' THEN 0 ELSE 1 END) ASC, b.created_at ASC
    LIMIT 300
  `, params);
  res.json(rows);
});

// FIFO eligible bags for a stage
router.get('/fifo', async (req, res) => {
  const { part_id, stage } = req.query;
  if (!part_id || !stage) return res.status(400).json({ error: 'part_id and stage are required' });

  const partRes = await pool.query('SELECT * FROM parts WHERE id = $1', [part_id]);
  const part = partRes.rows[0];
  if (!part) return res.status(404).json({ error: 'Part not found' });

  let statusFilter;
  if (stage === 'trim') {
    statusFilter = "b.status IN ('OPEN', 'PARTIAL_TRIM')";
  } else if (stage === 'inspect') {
    statusFilter = part.trim_required ? "b.status IN ('TRIMMED', 'PARTIAL_INSPECT')" : "b.status IN ('OPEN', 'TRIMMED', 'PARTIAL_INSPECT')";
  } else if (stage === 'pack') {
    statusFilter = part.inspection_required ? "b.status = 'INSPECTED'" : (part.trim_required ? "b.status IN ('TRIMMED', 'INSPECTED')" : "b.status IN ('OPEN', 'TRIMMED', 'INSPECTED')");
  } else if (stage === 'dispatch') {
    statusFilter = "b.status = 'PACKED'";
  } else {
    return res.status(400).json({ error: "stage must be 'trim', 'inspect', 'pack', or 'dispatch'" });
  }

  const { rows } = await pool.query(`
    SELECT b.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no
    FROM bags b
    JOIN machines m ON m.id = b.machine_id
    JOIN parts p ON p.id = b.part_id
    WHERE b.part_id = $1 AND b.bag_type = 'PART'
      AND b.bag_code NOT ILIKE '%-REJ%'
      AND b.bag_code NOT ILIKE '%-RUNNER%'
      AND b.bag_code NOT ILIKE '%-LUMP%'
      AND b.bag_code NOT ILIKE '%-SCRAP%'
      AND b.bag_type NOT IN ('RUNNER', 'REJECTION', 'LUMP', 'LUMPS', 'SCRAP')
      AND ${statusFilter}
    ORDER BY b.entry_date ASC, (CASE b.shift WHEN 'A' THEN 0 ELSE 1 END) ASC, b.created_at ASC
    LIMIT 1
  `, [part_id]);

  if (!rows[0]) return res.status(404).json({ error: `No bag ready for ${stage} on this part` });
  res.json(rows[0]);
});

// QR Code / Barcode Scan Lookup & Validation with strict stage gating
router.get('/by-code/:code', async (req, res) => {
  let { code } = req.params;
  const { stage } = req.query;

  try {
    const parsed = JSON.parse(code);
    code = parsed.bag_code || parsed.bag_number || code;
  } catch {}

  const { rows } = await pool.query(`
    SELECT b.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no,
           p.trim_required, p.inspection_required, p.packing_required, p.dispatch_required,
           p.part_weight_g, p.unit_weight_g, u.full_name AS operator_name
    FROM bags b
    JOIN machines m ON m.id = b.machine_id
    JOIN parts p ON p.id = b.part_id
    JOIN users u ON u.id = b.operator_user_id
    WHERE b.bag_code = $1
  `, [code]);

  const bag = rows[0];
  if (!bag) return res.status(404).json({ error: `Bag '${code}' not found` });

  // Exclude non-part bags from shopfloor process stages
  const isNonPartBag = bag.bag_type !== 'PART' ||
    bag.bag_code.includes('-REJ-') ||
    bag.bag_code.includes('-RUNNER-') ||
    bag.bag_code.includes('-LUMP-') ||
    bag.bag_code.includes('-SCRAP-');

  // Stage validation & Gating
  if (stage) {
    const requiresTrim = Boolean(bag.trim_required || bag.weighed_with_runner);

    if (bag.status === 'HOLD') {
      return res.status(409).json({
        error: `⛔ Bag '${bag.bag_code}' is on HOLD (Quarantined). Must be released by Supervisor before processing.`,
        bag,
        fifoValid: false,
      });
    }

    if (isNonPartBag) {
      return res.status(409).json({
        error: `⛔ Bag '${bag.bag_code}' is a ${bag.bag_type || 'Non-Part'} bag and cannot be processed in ${stage}.`,
      });
    }

    if (stage === 'trim') {
      if (bag.status === 'PACKED' || bag.status === 'INSPECTED' || bag.status === 'TRIMMED') {
        return res.status(409).json({ error: `⛔ Bag '${bag.bag_code}' has already completed Trimming (Current Status: ${bag.status}) and cannot be trimmed again.` });
      }
    } else if (stage === 'inspect') {
      if (bag.bag_type !== 'PART') {
        return res.status(409).json({ error: `⛔ Bag '${bag.bag_code}' is a ${bag.bag_type} bag and cannot be inspected.` });
      }
      if (requiresTrim && (bag.status === 'OPEN' || bag.status === 'PARTIAL_TRIM')) {
        return res.status(409).json({
          error: `⛔ Trimming Required: Part '${bag.shrp_part_code || bag.part_code}' (Bag '${bag.bag_code}') requires trimming because it was bagged with runner. Must be trimmed first before inspection.`,
          bag,
          fifoValid: false
        });
      }
      if (bag.status === 'INSPECTED') {
        return res.status(409).json({ error: `⛔ Bag '${bag.bag_code}' is already INSPECTED and ready for Packing.` });
      }
      if (bag.status === 'PACKED' || bag.status === 'DISPATCHED') {
        return res.status(409).json({ error: `⛔ Bag '${bag.bag_code}' is already ${bag.status}.` });
      }
    } else if (stage === 'pack') {
      if (bag.bag_type !== 'PART') {
        return res.status(409).json({ error: `⛔ Bag '${bag.bag_code}' is a ${bag.bag_type} bag and cannot be packed.` });
      }
      if (requiresTrim && (bag.status === 'OPEN' || bag.status === 'PARTIAL_TRIM')) {
        return res.status(409).json({
          error: `⛔ Trimming Required: Bag '${bag.bag_code}' was bagged with runner and must be trimmed and inspected first before packing.`,
          bag,
          fifoValid: false
        });
      }
      if (bag.inspection_required && bag.status !== 'INSPECTED') {
        return res.status(409).json({
          error: `⛔ Inspection Required: Part '${bag.shrp_part_code || bag.part_code}' requires inspection. Bag '${bag.bag_code}' must be inspected first before packing.`,
          bag,
          fifoValid: false
        });
      }
      if (bag.status === 'PACKED' || bag.status === 'DISPATCHED') {
        return res.status(409).json({ error: `⛔ Bag '${bag.bag_code}' is already ${bag.status}.` });
      }
    } else if (stage === 'dispatch') {
      if (bag.status !== 'PACKED') {
        return res.status(409).json({ error: `⛔ Bag '${bag.bag_code}' is not PACKED yet (Status: ${bag.status}).` });
      }
    }
  }

  let fifoValid = true;
  let oldestBag = null;

  if (stage) {
    const requiresTrim = Boolean(bag.trim_required || bag.weighed_with_runner);
    let requiredStatuses;
    if (stage === 'trim') requiredStatuses = ['OPEN', 'PARTIAL_TRIM'];
    else if (stage === 'inspect') requiredStatuses = requiresTrim ? ['TRIMMED', 'PARTIAL_INSPECT'] : ['OPEN', 'TRIMMED', 'PARTIAL_INSPECT'];
    else if (stage === 'pack') requiredStatuses = bag.inspection_required ? ['INSPECTED'] : (requiresTrim ? ['TRIMMED', 'INSPECTED'] : ['OPEN', 'TRIMMED', 'INSPECTED']);
    else if (stage === 'dispatch') requiredStatuses = ['PACKED'];

    if (requiredStatuses && requiredStatuses.includes(bag.status)) {
      const older = await checkFifo(bag.part_id, requiredStatuses, bag.id, bag.entry_date, bag.shift, bag.created_at);
      if (older) {
        fifoValid = false;
        oldestBag = {
          bag_code: older.bag_code,
          entry_date: older.entry_date,
          shift: older.shift,
        };
      }
    }
  }

  res.json({
    bag,
    fifoValid,
    oldestBag,
    canOverride: req.user.role === 'admin' || req.user.role === 'supervisor' || !!req.user.can_override_fifo,
  });
});

// --- List HOLD bags for a stage or part (placed before parameterized :id routes) ---
router.get('/hold-bags', async (req, res) => {
  const { stage, part_id } = req.query;
  const clauses = ["b.status = 'HOLD'"];
  const params = [];
  if (part_id && part_id !== 'undefined' && !isNaN(part_id)) {
    params.push(parseInt(part_id, 10));
    clauses.push(`b.part_id = $${params.length}`);
  }
  if (stage && stage !== 'undefined') {
    params.push(stage);
    clauses.push(`hl.stage = $${params.length}`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const { rows } = await pool.query(`
    SELECT b.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no,
           hl.reason AS hold_reason, hl.stage AS hold_stage, hl.hold_at, hu.full_name AS hold_by_name
    FROM bags b
    JOIN machines m ON m.id = b.machine_id
    JOIN parts p ON p.id = b.part_id
    LEFT JOIN bag_hold_log hl ON hl.bag_id = b.id AND hl.is_active = TRUE
    LEFT JOIN users hu ON hu.id = hl.hold_by_user_id
    ${where}
    ORDER BY hl.hold_at DESC NULLS LAST, b.created_at DESC
  `, params);

  res.json(rows);
});

// Single bag detail
router.get('/:id(\\d+)', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(`
    SELECT b.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no
    FROM bags b
    JOIN machines m ON m.id = b.machine_id
    JOIN parts p ON p.id = b.part_id
    WHERE b.id = $1
  `, [id]);
  if (!rows[0]) return res.status(404).json({ error: 'Bag not found' });
  res.json(rows[0]);
});

// --- Trimming entry ---
// --- Bag HOLD / Quarantine ---
router.post('/:id(\\d+)/hold', async (req, res) => {
  const { id } = req.params;
  const { stage, reason } = req.body;
  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'Reason for hold is required' });
  }
  const validStages = ['PRODUCTION', 'TRIMMING', 'INSPECTION', 'PACKING'];
  const holdStage = validStages.includes(stage) ? stage : 'PRODUCTION';

  const bag = await getBag(id);
  if (!bag) return res.status(404).json({ error: 'Bag not found' });
  if (bag.status === 'HOLD') {
    return res.status(400).json({ error: 'Bag is already on HOLD' });
  }

  const prevStatus = bag.status;
  await pool.query(
    `INSERT INTO bag_hold_log (bag_id, stage, reason, hold_by_user_id) VALUES ($1, $2, $3, $4)`,
    [id, holdStage, reason.trim(), req.user.id]
  );
  await pool.query(`UPDATE bags SET status = 'HOLD', remarks = COALESCE(remarks || ' | ', '') || 'HOLD: ' || $2 WHERE id = $1`, [id, reason.trim()]);
  await logHistory(pool, id, prevStatus, 'HOLD', `${holdStage} Hold: ${reason.trim()}`);

  res.json({ message: 'Bag placed on HOLD', status: 'HOLD' });
});

// --- Release from HOLD (Supervisor / Admin or Operator with Supervisor PIN) ---
router.post('/:id(\\d+)/release-hold', async (req, res) => {
  const { id } = req.params;
  const { release_remarks, supervisor_pin } = req.body;

  let releasingUser = null;
  if (req.user.role === 'admin' || req.user.role === 'supervisor') {
    releasingUser = req.user;
  } else if (supervisor_pin) {
    const supRes = await pool.query(
      `SELECT id, pin_hash, full_name, role FROM users WHERE role IN ('supervisor', 'admin') AND active = TRUE`
    );
    for (const sup of supRes.rows) {
      const match = await bcrypt.compare(String(supervisor_pin), sup.pin_hash);
      if (match) {
        releasingUser = sup;
        break;
      }
    }
  }

  if (!releasingUser) {
    return res.status(403).json({ error: 'Supervisor approval or PIN is required to release a bag from HOLD' });
  }

  const bag = await getBag(id);
  if (!bag) return res.status(404).json({ error: 'Bag not found' });
  if (bag.status !== 'HOLD') {
    return res.status(400).json({ error: 'Bag is not on HOLD' });
  }

  // Get active hold log entry
  const holdRes = await pool.query(
    `SELECT * FROM bag_hold_log WHERE bag_id = $1 AND is_active = TRUE ORDER BY id DESC LIMIT 1`,
    [id]
  );
  const hold = holdRes.rows[0];

  // Determine stage to restore to
  let restoreStatus = 'OPEN';
  if (hold) {
    if (hold.stage === 'TRIMMING') restoreStatus = 'OPEN';
    else if (hold.stage === 'INSPECTION') restoreStatus = 'TRIMMED';
    else if (hold.stage === 'PACKING') restoreStatus = 'INSPECTED';
  }

  if (hold) {
    await pool.query(
      `UPDATE bag_hold_log SET is_active = FALSE, released_by_user_id = $1, released_at = now(), release_remarks = $2 WHERE id = $3`,
      [releasingUser.id, release_remarks || 'Released by supervisor', hold.id]
    );
  }

  await pool.query(`UPDATE bags SET status = $1 WHERE id = $2`, [restoreStatus, id]);
  await logHistory(pool, id, 'HOLD', restoreStatus, `Hold Released by ${releasingUser.full_name}: ${release_remarks || 'Supervisor release'}`);

  res.json({ message: `Bag released to ${restoreStatus}`, status: restoreStatus });
});

// --- Get Trimming History / Pass Details for a Bag ---
router.get('/:id(\\d+)/trim-summary', async (req, res) => {
  const { id } = req.params;
  const bag = await getBag(id);
  if (!bag) return res.status(404).json({ error: 'Bag not found' });

  const { rows: passes } = await pool.query(
    `SELECT te.*, u.full_name as operator_name, ci.item_name as reject_reason_name
     FROM trim_entries te
     JOIN users u ON u.id = te.operator_user_id
     LEFT JOIN check_items ci ON ci.id = te.reject_reason_id
     WHERE te.bag_id = $1
     ORDER BY te.created_at ASC`,
    [id]
  );

  const totalTrimmed = passes.reduce((s, p) => s + Number(p.trimmed_wt_kg || 0), 0);
  const totalRunner = passes.reduce((s, p) => s + Number(p.runner_wt_kg || 0), 0);
  const totalReject = passes.reduce((s, p) => s + Number(p.reject_wt_kg || 0), 0);
  const totalAccounted = totalTrimmed + totalRunner + totalReject;
  const remainingWeightKg = Math.max(0, Number(bag.base_weight_kg) - totalAccounted);

  res.json({
    bag,
    passes,
    pass_count: passes.length,
    total_trimmed_wt_kg: Number(totalTrimmed.toFixed(3)),
    total_runner_wt_kg: Number(totalRunner.toFixed(3)),
    total_reject_wt_kg: Number(totalReject.toFixed(3)),
    remaining_wt_kg: Number(remainingWeightKg.toFixed(3)),
  });
});

// --- Enhanced Multi-Pass Trimming entry with multiple rejects and auto-rework ---
router.post('/:id(\\d+)/trim', async (req, res) => {
  const { id } = req.params;
  const {
    trimmed_wt_kg = 0,
    runner_wt_kg = 0,
    reject_wt_kg = 0,
    reject_reason_id = null,
    rejects = [], // Array of { reason_id, weight_kg, qty }
    remaining_wt_kg,
    is_partial = false,
    confirm = false,
    fifo_override,
    fifo_override_reason,
  } = req.body;

  const bag = await getBag(id);
  if (!bag) return res.status(404).json({ error: 'Bag not found' });
  if (bag.status === 'HOLD') {
    return res.status(403).json({ error: 'Bag is currently on HOLD. Must be released before trimming.' });
  }

  const part = await getPart(bag.part_id);
  const cavityCount = part.cavity_count || 1;
  const partWeightG = Number(part.part_weight_g || (part.unit_weight_g ? part.unit_weight_g / cavityCount : 0));

  // FIFO check
  const older = await checkFifo(bag.part_id, ['OPEN', 'PARTIAL_TRIM'], bag.id, bag.entry_date, bag.shift, bag.created_at);
  if (older && !fifo_override) {
    return res.status(409).json({
      error: 'FIFO Violation',
      code: 'fifo_violation',
      oldest_bag: {
        bag_code: older.bag_code,
        entry_date: older.entry_date,
      },
    });
  }

  let isFifoOverride = false;
  if (older && fifo_override) {
    const canOverride = req.user.role === 'admin' || req.user.role === 'supervisor' || !!req.user.can_override_fifo;
    if (!canOverride) {
      return res.status(403).json({ error: 'You do not have permission to override FIFO' });
    }
    isFifoOverride = true;
    await pool.query(
      `UPDATE bags SET is_fifo_override = TRUE, fifo_override_by = $1, fifo_override_at = now(), fifo_override_reason = $2 WHERE id = $3`,
      [req.user.id, fifo_override_reason || null, id]
    );
  }

  // Parse reject rows
  let parsedRejects = [];
  if (Array.isArray(rejects) && rejects.length > 0) {
    parsedRejects = rejects.filter(r => r && r.reason_id && (Number(r.weight_kg) > 0 || Number(r.qty) > 0));
  } else if (reject_reason_id && (Number(reject_wt_kg) > 0 || Number(req.body.reject_qty) > 0)) {
    parsedRejects = [{ reason_id: Number(reject_reason_id), weight_kg: Number(reject_wt_kg || 0), qty: Number(req.body.reject_qty || 0) }];
  }

  const totalRejectWeight = parsedRejects.length > 0
    ? parsedRejects.reduce((s, r) => s + Number(r.weight_kg || 0), 0)
    : Number(reject_wt_kg || 0);

  // Calculate pass number & remaining weight
  const countRes = await pool.query(`SELECT count(*)::integer as pass_count FROM trim_entries WHERE bag_id = $1`, [id]);
  const passNumber = (countRes.rows[0].pass_count || 0) + 1;

  const currentPassWeight = Number(trimmed_wt_kg || 0) + Number(runner_wt_kg || 0) + totalRejectWeight;

  // Previous passes
  const sumRes = await pool.query(
    `SELECT COALESCE(SUM(trimmed_wt_kg + runner_wt_kg + reject_wt_kg), 0)::numeric as total_prev
     FROM trim_entries WHERE bag_id = $1`,
    [id]
  );
  const totalPrev = Number(sumRes.rows[0].total_prev || 0);
  const calculatedRemaining = Number(Math.max(0, Number(bag.base_weight_kg) - (totalPrev + currentPassWeight)).toFixed(3));
  const finalRemaining = remaining_wt_kg != null ? Number(remaining_wt_kg) : calculatedRemaining;

  const primaryRejectReasonId = parsedRejects.length > 0 ? parsedRejects[0].reason_id : reject_reason_id;

  const trimRes = await pool.query(
    `INSERT INTO trim_entries (bag_id, trimmed_wt_kg, runner_wt_kg, reject_wt_kg, reject_reason_id, remaining_wt_kg, is_partial, pass_number, operator_user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [id, trimmed_wt_kg, runner_wt_kg, totalRejectWeight, primaryRejectReasonId || null, finalRemaining, is_partial, passNumber, req.user.id]
  );
  const trimEntryId = trimRes.rows[0].id;

  // Save each reject breakdown row and auto-route to rework if disposition is reworkable
  for (const r of parsedRejects) {
    const itemRes = await pool.query(`SELECT id, item_name, default_disposition FROM check_items WHERE id = $1`, [r.reason_id]);
    const checkItem = itemRes.rows[0];
    const disposition = checkItem?.default_disposition || 'SCRAP';
    const reasonName = checkItem?.item_name || '';
    const rejQty = r.qty ? Number(r.qty) : (partWeightG > 0 ? Math.round((Number(r.weight_kg || 0) * 1000) / partWeightG) : 0);

    await pool.query(
      `INSERT INTO bag_reject_log (bag_id, stage, entry_id, reject_reason_id, reject_wt_kg, reject_qty, disposition, operator_user_id)
       VALUES ($1, 'TRIMMING', $2, $3, $4, $5, $6, $7)`,
      [id, trimEntryId, r.reason_id, Number(r.weight_kg || 0), rejQty, disposition, req.user.id]
    );

    // Auto move to rework if disposition is reworkable
    const isReworkable = disposition === 'Return To Trimming' || disposition === 'REWORK' || reasonName.toLowerCase().includes('flash') || disposition.toLowerCase().includes('trimming');
    if (isReworkable && rejQty > 0) {
      await pool.query(
        `INSERT INTO rework_log (bag_id, part_id, stage, source_reject_reason_id, rework_qty, created_by_user_id)
         VALUES ($1, $2, 'TRIMMING', $3, $4, $5)`,
        [id, bag.part_id, r.reason_id, rejQty, req.user.id]
      );
    }
  }

  const isComplete = !is_partial && (finalRemaining <= 0.001 || isWithinTrimTolerance(finalRemaining, bag.base_weight_kg));

  if (!isComplete) {
    await pool.query(`UPDATE bags SET status = 'PARTIAL_TRIM' WHERE id = $1 AND status != 'PARTIAL_TRIM'`, [id]);
    await logHistory(pool, id, bag.status, 'PARTIAL_TRIM', `Pass ${passNumber} Trim (Remaining: ${finalRemaining}kg)`);
    return res.json({ bag: { ...bag, status: 'PARTIAL_TRIM' }, closed: false, remaining_wt_kg: finalRemaining });
  }

  if (!confirm) {
    return res.json({
      needsConfirmation: true,
      remaining_wt_kg: finalRemaining,
      message: `Bag fully trimmed (Remaining variance: ${finalRemaining} kg). Mark status as TRIMMED?`,
    });
  }

  if (!isLegitimateStatusAdvance(bag.status, 'TRIMMED', part.trim_required, part.inspection_required)) {
    return res.status(409).json({ error: `Bag is currently '${bag.status}' - not ready to advance to TRIMMED` });
  }

  await pool.query(`UPDATE bags SET status = 'TRIMMED' WHERE id = $1`, [id]);
  await logHistory(pool, id, bag.status, 'TRIMMED', `Trimming completed (Pass ${passNumber})`);

  await logAudit(pool, {
    process: 'trimming',
    bag_id: id,
    bag_code: bag.bag_code,
    batch_no: bag.batch_no,
    part_id: bag.part_id,
    machine_id: bag.machine_id,
    user_id: req.user.id,
    weight_kg: trimmed_wt_kg,
    status_from: bag.status,
    status_to: 'TRIMMED',
    is_fifo_override: isFifoOverride,
    oldest_bag_code: older?.bag_code || null,
  });

  res.json({ bag: { ...bag, status: 'TRIMMED' }, closed: true, remaining_wt_kg: finalRemaining });
});

// --- Enhanced Tiered Inspection entry with multiple rejects and auto-rework ---
router.post('/:id(\\d+)/inspect', async (req, res) => {
  const { id } = req.params;
  const {
    inspected_wt_kg,
    remaining_wt_kg = 0,
    reject_wt_kg = 0,
    reject_reason_id,
    rejects = [], // Array of { reason_id, weight_kg, qty }
    remarks,
    confirm,
    fifo_override,
    fifo_override_reason,
  } = req.body;

  const bag = await getBag(id);
  if (!bag) return res.status(404).json({ error: 'Bag not found' });
  if (bag.status === 'HOLD') {
    return res.status(403).json({ error: 'Bag is currently on HOLD. Must be released before inspection.' });
  }

  const part = await getPart(bag.part_id);
  const cavityCount = part.cavity_count || 1;
  const partWeightG = Number(part.part_weight_g || (part.unit_weight_g ? part.unit_weight_g / cavityCount : 0));
  const requiresTrim = Boolean(part.trim_required || bag.weighed_with_runner);
  const requiredStatuses = requiresTrim ? ['TRIMMED', 'PARTIAL_INSPECT'] : ['OPEN', 'TRIMMED', 'PARTIAL_INSPECT'];

  // FIFO check
  const older = await checkFifo(bag.part_id, requiredStatuses, bag.id, bag.entry_date, bag.shift, bag.created_at);
  if (older && !fifo_override) {
    return res.status(409).json({
      error: 'FIFO Violation',
      code: 'fifo_violation',
      oldest_bag: {
        bag_code: older.bag_code,
        entry_date: older.entry_date,
      },
    });
  }

  let isFifoOverride = false;
  if (older && fifo_override) {
    const canOverride = req.user.role === 'admin' || req.user.role === 'supervisor' || !!req.user.can_override_fifo;
    if (!canOverride) {
      return res.status(403).json({ error: 'You do not have permission to override FIFO' });
    }
    isFifoOverride = true;
    await pool.query(
      `UPDATE bags SET is_fifo_override = TRUE, fifo_override_by = $1, fifo_override_at = now(), fifo_override_reason = $2 WHERE id = $3`,
      [req.user.id, fifo_override_reason || null, id]
    );
  }

  // Parse rejects breakdown
  let parsedRejects = [];
  if (Array.isArray(rejects) && rejects.length > 0) {
    parsedRejects = rejects.filter(r => r && r.reason_id && (Number(r.weight_kg) > 0 || Number(r.qty) > 0));
  } else if (reject_reason_id && (Number(reject_wt_kg) > 0 || Number(req.body.reject_qty) > 0)) {
    parsedRejects = [{ reason_id: Number(reject_reason_id), weight_kg: Number(reject_wt_kg || 0), qty: Number(req.body.reject_qty || 0) }];
  }

  const totalRejectWeight = parsedRejects.length > 0
    ? parsedRejects.reduce((s, r) => s + Number(r.weight_kg || 0), 0)
    : Number(reject_wt_kg || 0);

  const actualInspected = inspected_wt_kg != null ? Number(inspected_wt_kg) : Number(bag.base_weight_kg) - Number(remaining_wt_kg || 0);
  const { getInspectionToleranceTier } = require('../lib/bagStatus');
  const toleranceCheck = getInspectionToleranceTier(actualInspected + totalRejectWeight, Number(bag.base_weight_kg));

  // If Tier 3 (>2% or >200g) and no remarks provided, block and require remarks
  if (toleranceCheck.tier === 'REMARKS_REQUIRED' && (!remarks || !remarks.trim())) {
    return res.status(422).json({
      tier: 'REMARKS_REQUIRED',
      diffKg: toleranceCheck.diffKg,
      diffPct: toleranceCheck.diffPct,
      message: toleranceCheck.message,
    });
  }

  // If Tier 2 (1-2% or <=200g) and not confirmed yet, ask for confirmation
  if (toleranceCheck.tier === 'CONFIRM' && !confirm) {
    return res.json({
      needsConfirmation: true,
      tier: 'CONFIRM',
      diffKg: toleranceCheck.diffKg,
      diffPct: toleranceCheck.diffPct,
      message: toleranceCheck.message,
    });
  }

  const primaryRejectReasonId = parsedRejects.length > 0 ? parsedRejects[0].reason_id : reject_reason_id;

  // Insert inspection record
  const inspRes = await pool.query(
    `INSERT INTO inspection_entries (bag_id, inspected_wt_kg, remaining_wt_kg, reject_wt_kg, reject_reason_id, sent_to_rework_qty, variance_tier, remarks, operator_user_id)
     VALUES ($1, $2, $3, $4, $5, 0, $6, $7, $8) RETURNING id`,
    [id, actualInspected, remaining_wt_kg || 0, totalRejectWeight, primaryRejectReasonId || null, toleranceCheck.tier, remarks || null, req.user.id]
  );
  const inspEntryId = inspRes.rows[0].id;

  // Save each reject breakdown and automatically route reworkable reasons to rework_log
  let totalAutoReworkQty = 0;
  for (const r of parsedRejects) {
    const itemRes = await pool.query(`SELECT id, item_name, default_disposition FROM check_items WHERE id = $1`, [r.reason_id]);
    const checkItem = itemRes.rows[0];
    const disposition = checkItem?.default_disposition || 'SCRAP';
    const reasonName = checkItem?.item_name || '';
    const rejQty = r.qty ? Number(r.qty) : (partWeightG > 0 ? Math.round((Number(r.weight_kg || 0) * 1000) / partWeightG) : 0);

    await pool.query(
      `INSERT INTO bag_reject_log (bag_id, stage, entry_id, reject_reason_id, reject_wt_kg, reject_qty, disposition, operator_user_id)
       VALUES ($1, 'INSPECTION', $2, $3, $4, $5, $6, $7)`,
      [id, inspEntryId, r.reason_id, Number(r.weight_kg || 0), rejQty, disposition, req.user.id]
    );

    // Auto move to rework if disposition is reworkable
    const isReworkable = disposition === 'Return To Trimming' || disposition === 'REWORK' || reasonName.toLowerCase().includes('flash') || disposition.toLowerCase().includes('trimming');
    if (isReworkable && rejQty > 0) {
      totalAutoReworkQty += rejQty;
      await pool.query(
        `INSERT INTO rework_log (bag_id, part_id, stage, source_reject_reason_id, rework_qty, created_by_user_id)
         VALUES ($1, $2, 'INSPECTION', $3, $4, $5)`,
        [id, bag.part_id, r.reason_id, rejQty, req.user.id]
      );
    }
  }

  // Update sent_to_rework_qty on inspection_entries
  if (totalAutoReworkQty > 0) {
    await pool.query(`UPDATE inspection_entries SET sent_to_rework_qty = $1 WHERE id = $2`, [totalAutoReworkQty, inspEntryId]);
  }

  if (!isLegitimateStatusAdvance(bag.status, 'INSPECTED', part.trim_required, part.inspection_required)) {
    return res.status(409).json({ error: `Bag is currently '${bag.status}' - not ready to advance to INSPECTED` });
  }

  await pool.query(`UPDATE bags SET status = 'INSPECTED' WHERE id = $1`, [id]);
  await logHistory(pool, id, bag.status, 'INSPECTED', `Inspection completed (Tier: ${toleranceCheck.tier}${totalAutoReworkQty > 0 ? `, Rework: ${totalAutoReworkQty} Nos` : ''})`);

  await logAudit(pool, {
    process: 'inspection',
    bag_id: id,
    bag_code: bag.bag_code,
    batch_no: bag.batch_no,
    part_id: bag.part_id,
    machine_id: bag.machine_id,
    user_id: req.user.id,
    weight_kg: actualInspected,
    status_from: bag.status,
    status_to: 'INSPECTED',
    is_fifo_override: isFifoOverride,
    oldest_bag_code: older?.bag_code || null,
  });

  res.json({ bag: { ...bag, status: 'INSPECTED' }, closed: true, auto_rework_qty: totalAutoReworkQty });
});


// --- Packing Balance Pool: Get Available Balance for a Part ---
router.get('/balance-pool/:part_id(\\d+)', async (req, res) => {
  const { part_id } = req.params;
  const part = await getPart(part_id);
  if (!part) return res.status(404).json({ error: 'Part not found' });

  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(quantity), 0)::integer as available_qty
     FROM packing_balance_pool
     WHERE part_id = $1 AND is_consumed = FALSE`,
    [part_id]
  );

  const availableQty = rows[0].available_qty;
  const standardPackQty = part.standard_pack_qty || 500;
  const canPackPacket = availableQty >= standardPackQty;
  const fullPackets = Math.floor(availableQty / standardPackQty);
  const remainingBalance = availableQty % standardPackQty;

  res.json({
    part_id: Number(part_id),
    available_qty: availableQty,
    standard_pack_qty: standardPackQty,
    can_pack_packet: canPackPacket,
    full_packets: fullPackets,
    remaining_balance: remainingBalance,
  });
});

// --- Packing Balance Pool: Convert Pool Quantity into a Standard Packet ---
router.post('/balance-pool/:part_id(\\d+)/pack-packet', async (req, res) => {
  const { part_id } = req.params;
  const part = await getPart(part_id);
  if (!part) return res.status(404).json({ error: 'Part not found' });

  const standardPackQty = part.standard_pack_qty || 500;

  // Check available pool
  const { rows } = await pool.query(
    `SELECT id, quantity FROM packing_balance_pool
     WHERE part_id = $1 AND is_consumed = FALSE
     ORDER BY created_at ASC`,
    [part_id]
  );

  const totalAvail = rows.reduce((s, r) => s + r.quantity, 0);
  if (totalAvail < standardPackQty) {
    return res.status(400).json({
      error: `Insufficient balance pool quantity. Available: ${totalAvail}, Needed: ${standardPackQty}`,
    });
  }

  // Consume entries up to standardPackQty
  let remainingToDeduct = standardPackQty;
  for (const entry of rows) {
    if (remainingToDeduct <= 0) break;
    if (entry.quantity <= remainingToDeduct) {
      await pool.query(
        `UPDATE packing_balance_pool SET is_consumed = TRUE, consumed_at = now() WHERE id = $1`,
        [entry.id]
      );
      remainingToDeduct -= entry.quantity;
    } else {
      // Partial consumption: split entry
      await pool.query(
        `UPDATE packing_balance_pool SET quantity = quantity - $1 WHERE id = $2`,
        [remainingToDeduct, entry.id]
      );
      remainingToDeduct = 0;
    }
  }

  res.json({
    success: true,
    message: `Successfully packed 1 packet (${standardPackQty} pcs) from balance pool`,
    packed_qty: standardPackQty,
  });
});

// --- Enhanced Packing entry with Counting Scale & Balance Pool ---
router.post('/:id(\\d+)/pack', async (req, res) => {
  const { id } = req.params;
  const {
    packed_qty,
    packed_wt_kg,
    sample_packet_wt_g,
    calculated_part_wt_g,
    packets_count = 1,
    balance_qty = 0,
    is_partial = false,
    confirm,
    fifo_override,
    fifo_override_reason,
  } = req.body;

  if (packed_qty == null || packed_wt_kg == null) {
    return res.status(400).json({ error: 'packed_qty and packed_wt_kg are required' });
  }

  const bag = await getBag(id);
  if (!bag) return res.status(404).json({ error: 'Bag not found' });
  if (bag.status === 'HOLD') {
    return res.status(403).json({ error: 'Bag is currently on HOLD. Must be released before packing.' });
  }

  const part = await getPart(bag.part_id);
  const requiresTrim = Boolean(part.trim_required || bag.weighed_with_runner);
  const requiredStatuses = part.inspection_required
    ? ['INSPECTED', 'PARTIAL_PACK']
    : (requiresTrim ? ['TRIMMED', 'INSPECTED', 'PARTIAL_PACK'] : ['OPEN', 'TRIMMED', 'INSPECTED', 'PARTIAL_PACK']);

  // FIFO check
  const older = await checkFifo(bag.part_id, requiredStatuses, bag.id, bag.entry_date, bag.shift, bag.created_at);
  if (older && !fifo_override) {
    return res.status(409).json({
      error: 'FIFO Violation',
      code: 'fifo_violation',
      oldest_bag: {
        bag_code: older.bag_code,
        entry_date: older.entry_date,
      },
    });
  }

  let isFifoOverride = false;
  if (older && fifo_override) {
    const canOverride = req.user.role === 'admin' || req.user.role === 'supervisor' || !!req.user.can_override_fifo;
    if (!canOverride) {
      return res.status(403).json({ error: 'You do not have permission to override FIFO' });
    }
    isFifoOverride = true;
    await pool.query(
      `UPDATE bags SET is_fifo_override = TRUE, fifo_override_by = $1, fifo_override_at = now(), fifo_override_reason = $2 WHERE id = $3`,
      [req.user.id, fifo_override_reason || null, id]
    );
  }

  await pool.query(
    `INSERT INTO packing_entries (bag_id, packed_qty, packed_wt_kg, sample_packet_wt_g, calculated_part_wt_g, packets_count, balance_qty, operator_user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, packed_qty, packed_wt_kg, sample_packet_wt_g || null, calculated_part_wt_g || null, packets_count || 1, balance_qty || 0, req.user.id]
  );

  // If there are balance pieces, save to packing_balance_pool
  if (balance_qty > 0) {
    await pool.query(
      `INSERT INTO packing_balance_pool (part_id, bag_id, quantity, sample_packet_wt_g, calculated_part_wt_g, operator_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [bag.part_id, id, balance_qty, sample_packet_wt_g || null, calculated_part_wt_g || null, req.user.id]
    );
  }

  const targetStatus = is_partial ? 'PARTIAL_PACK' : 'PACKED';

  if (!confirm) {
    return res.json({
      needsConfirmation: true,
      message: `Bag packed into ${packets_count} packets (${packed_qty} pcs total) with ${balance_qty} balance pcs logged. Mark status as ${targetStatus}?`,
    });
  }

  if (!isLegitimateStatusAdvance(bag.status, targetStatus, part.trim_required, part.inspection_required)) {
    return res.status(409).json({ error: `Bag is currently '${bag.status}' - not ready to advance to ${targetStatus}` });
  }

  await pool.query(`UPDATE bags SET status = $1 WHERE id = $2`, [targetStatus, id]);
  await logHistory(pool, id, bag.status, targetStatus, `Packing ${is_partial ? 'partial' : 'completed'} (${packets_count} pkts, ${balance_qty} balance)`);

  await logAudit(pool, {
    process: 'packing',
    bag_id: id,
    bag_code: bag.bag_code,
    batch_no: bag.batch_no,
    part_id: bag.part_id,
    machine_id: bag.machine_id,
    user_id: req.user.id,
    qty: packed_qty,
    weight_kg: packed_wt_kg,
    status_from: bag.status,
    status_to: targetStatus,
    is_fifo_override: isFifoOverride,
    oldest_bag_code: older?.bag_code || null,
  });

  res.json({ bag: { ...bag, status: targetStatus }, closed: !is_partial });
});

// --- Rework Pending Pool ---
router.get('/rework/pending', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT rl.*, p.part_code, p.part_name, p.shrp_part_code, b.bag_code, b.batch_no,
           ci.item_name as reject_reason_name, u.full_name as creator_name
    FROM rework_log rl
    JOIN parts p ON p.id = rl.part_id
    LEFT JOIN bags b ON b.id = rl.bag_id
    LEFT JOIN check_items ci ON ci.id = rl.source_reject_reason_id
    JOIN users u ON u.id = rl.created_by_user_id
    WHERE rl.status = 'PENDING'
    ORDER BY rl.created_at ASC
  `);
  res.json(rows);
});

// --- Complete Rework Item ---
router.post('/rework/:id(\\d+)/complete', async (req, res) => {
  const { id } = req.params;
  const { reworked_good_qty, scrap_qty, remarks } = req.body;

  if (reworked_good_qty == null && scrap_qty == null) {
    return res.status(400).json({ error: 'Reworked good qty or scrap qty is required' });
  }

  await pool.query(
    `UPDATE rework_log
     SET reworked_good_qty = $1, scrap_qty = $2, remarks = $3, worked_by_user_id = $4, status = 'COMPLETED', completed_at = now()
     WHERE id = $5`,
    [Number(reworked_good_qty || 0), Number(scrap_qty || 0), remarks || null, req.user.id, id]
  );

  res.json({ success: true, message: 'Rework logged successfully' });
});

// --- Dispatch entry ---
router.post('/:id(\\d+)/dispatch', async (req, res) => {
  const { id } = req.params;
  const {
    dispatched_qty, dispatched_wt_kg, customer_id, invoice_no, vehicle_no,
    remarks, confirm, fifo_override, fifo_override_reason,
  } = req.body;

  if (dispatched_qty == null || dispatched_wt_kg == null) {
    return res.status(400).json({ error: 'dispatched_qty and dispatched_wt_kg are required' });
  }

  const bag = await getBag(id);
  if (!bag) return res.status(404).json({ error: 'Bag not found' });
  if (bag.status !== 'PACKED') {
    return res.status(409).json({ error: `Bag is currently '${bag.status}' - must be PACKED before dispatch` });
  }

  // FIFO check
  const older = await checkFifo(bag.part_id, 'PACKED', bag.id, bag.entry_date, bag.shift, bag.created_at);
  if (older && !fifo_override) {
    return res.status(409).json({
      error: 'FIFO Violation',
      code: 'fifo_violation',
      oldest_bag: {
        bag_code: older.bag_code,
        entry_date: older.entry_date,
      },
    });
  }

  let isFifoOverride = false;
  if (older && fifo_override) {
    const canOverride = req.user.role === 'admin' || req.user.role === 'supervisor' || !!req.user.can_override_fifo;
    if (!canOverride) {
      return res.status(403).json({ error: 'You do not have permission to override FIFO' });
    }
    isFifoOverride = true;
    await pool.query(
      `UPDATE bags SET is_fifo_override = TRUE, fifo_override_by = $1, fifo_override_at = now(), fifo_override_reason = $2 WHERE id = $3`,
      [req.user.id, fifo_override_reason || null, id]
    );
  }

  if (!confirm) {
    return res.json({
      needsConfirmation: true,
      message: 'This bag has been fully dispatched. Mark status as DISPATCHED?',
    });
  }

  await pool.query(
    `INSERT INTO dispatch_entries (bag_id, dispatched_qty, dispatched_wt_kg, customer_id, invoice_no, vehicle_no, operator_user_id, remarks)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, dispatched_qty, dispatched_wt_kg, customer_id || null, invoice_no || null, vehicle_no || null, req.user.id, remarks || null]
  );

  await pool.query(`UPDATE bags SET status = 'DISPATCHED' WHERE id = $1`, [id]);
  await logHistory(pool, id, 'PACKED', 'DISPATCHED', 'Dispatch');

  await logAudit(pool, {
    process: 'dispatch',
    bag_id: id,
    bag_code: bag.bag_code,
    batch_no: bag.batch_no,
    part_id: bag.part_id,
    machine_id: bag.machine_id,
    user_id: req.user.id,
    qty: dispatched_qty,
    weight_kg: dispatched_wt_kg,
    status_from: 'PACKED',
    status_to: 'DISPATCHED',
    is_fifo_override: isFifoOverride,
    oldest_bag_code: older?.bag_code || null,
    remarks: remarks || null,
  });

  res.json({ bag: { ...bag, status: 'DISPATCHED' }, closed: true });
});

// Traceability audit trail for a bag or batch
router.get('/audit/traceability/:bagCode', async (req, res) => {
  const { bagCode } = req.params;
  const { rows } = await pool.query(
    `SELECT tal.*, u.full_name as user_name, au.full_name as approver_name,
            p.part_name, p.shrp_part_code, p.customer_part_no, m.machine_code
     FROM traceability_audit_log tal
     JOIN users u ON u.id = tal.user_id
     LEFT JOIN users au ON au.id = tal.approved_by
     LEFT JOIN parts p ON p.id = tal.part_id
     LEFT JOIN machines m ON m.id = tal.machine_id
     WHERE tal.bag_code = $1 OR tal.batch_no = $1
     ORDER BY tal.created_at ASC`,
    [bagCode]
  );
  res.json(rows);
});

// Direct raw socket printing to WiFi / LAN thermal barcode printers (ZPL over TCP port 9100)
router.post('/:id(\\d+)/lan-print', async (req, res) => {
  const { id } = req.params;
  const { printer_ip, printer_port = 9100 } = req.body;

  if (!printer_ip || !printer_ip.trim()) {
    return res.status(400).json({ error: 'Printer IP address is required for direct LAN printing' });
  }

  const { rows } = await pool.query(`
    SELECT b.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no
    FROM bags b
    JOIN machines m ON m.id = b.machine_id
    JOIN parts p ON p.id = b.part_id
    WHERE b.id = $1
  `, [id]);

  const bag = rows[0];
  if (!bag) return res.status(404).json({ error: 'Bag not found' });

  const shrpCode = bag.shrp_part_code || bag.part_code || 'PART';
  const custPart = bag.customer_part_no || bag.part_code || '—';
  const partName = (bag.part_name || '').slice(0, 30);
  const bagCode = bag.bag_code;
  const batchNo = bag.batch_no;
  const qty = bag.qty > 0 ? `${bag.qty}` : '—';
  const wt = Number(bag.base_weight_kg || 0).toFixed(3);
  const prodDate = new Date(bag.entry_date).toLocaleDateString('en-GB');
  const shift = bag.shift || 'A';
  const machine = bag.machine_code || 'M/C';

  const qrPayload = JSON.stringify({
    shrp_code: shrpCode,
    bag_code: bagCode,
    batch_no: batchNo,
    qty: bag.qty,
    weight_kg: Number(bag.base_weight_kg),
    date: bag.entry_date,
    shift: bag.shift,
    machine: bag.machine_code,
  });

  // Standard 3" x 2" (609 x 406 dots at 203 DPI) ZPL template
  const zpl = `^XA
^PW609
^LL406
^LH0,0
^FO20,15^A0N,22,22^FDSRI HARI RUBBER PRODUCTS^FS
^FO440,15^A0N,20,20^FD[PART BAG]^FS
^FO20,38^GB570,2,2^FS
^FO20,48^A0N,32,32^FD${shrpCode}^FS
^FO20,84^A0N,20,20^FD${partName} | Cust: ${custPart}^FS
^FO20,108^GB570,1,1^FS
^FO20,118^A0N,24,24^FDBag No:  ${bagCode}^FS
^FO20,148^A0N,22,22^FDBatch:   ${batchNo}^FS
^FO20,178^A0N,24,24^FDQty:     ${qty} Nos  Wt: ${wt} Kg^FS
^FO20,208^A0N,20,20^FDDate:    ${prodDate}  Shift: ${shift}^FS
^FO20,232^A0N,20,20^FDMachine: ${machine}^FS
^FO410,118^BQN,2,4^FDQA,${qrPayload}^FS
^FO400,248^A0N,18,18^FD${bagCode}^FS
^FO20,270^GB570,2,2^FS
^FO20,282^A0N,18,18^FDSHRP MES - IATF 16949 TRACEABILITY LABEL^FS
^XZ`;

  const net = require('net');
  const socket = new net.Socket();
  const port = parseInt(printer_port, 10) || 9100;

  socket.setTimeout(4000);

  socket.connect(port, printer_ip.trim(), () => {
    socket.write(zpl, 'utf8', () => {
      socket.end();
      res.json({
        success: true,
        message: `Label successfully sent to LAN Thermal Printer at ${printer_ip}:${port}`,
        bag_code: bagCode,
      });
    });
  });

  socket.on('error', (err) => {
    socket.destroy();
    res.status(502).json({
      error: `Could not connect to Thermal Printer at ${printer_ip}:${port} (${err.message}). Verify printer is turned on and connected to the same WiFi/LAN network.`,
    });
  });

  socket.on('timeout', () => {
    socket.destroy();
    res.status(504).json({
      error: `Connection timed out connecting to printer at ${printer_ip}:${port}. Check IP address.`,
    });
  });
});

module.exports = router;
