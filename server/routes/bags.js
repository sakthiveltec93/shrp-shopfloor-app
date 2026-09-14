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

async function checkFifo(partId, requiredStatus, currentBagId, entryDate, shift, createdAt) {
  const { rows } = await pool.query(`
    SELECT b.bag_code, b.entry_date, b.shift, b.id
    FROM bags b
    WHERE b.part_id = $1 AND b.bag_type = 'PART' AND b.status = $2 AND b.id != $3
      AND (
        b.entry_date < $4 OR
        (b.entry_date = $4 AND b.shift = 'A' AND $5 = 'B') OR
        (b.entry_date = $4 AND b.shift = $5 AND b.created_at < $6)
      )
    ORDER BY b.entry_date ASC, (CASE b.shift WHEN 'A' THEN 0 ELSE 1 END) ASC, b.created_at ASC
    LIMIT 1
  `, [partId, requiredStatus, currentBagId, entryDate, shift, createdAt]);
  return rows[0] || null;
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

  // Tolerance Rule: Greater of 200 Nos OR 1% of Production Qty
  const tolerance_qty = Math.max(200, Math.round(production_qty * 0.01));
  const max_allowed_qty = production_qty + tolerance_qty;

  // Completion check
  const is_completed = production_qty > 0 && already_bagged_qty >= Math.max(0, production_qty - tolerance_qty);

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
      const toleranceQty = Math.max(200, Math.round(prodQty * 0.01));
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

// List bags with part identification
router.get('/', async (req, res) => {
  const { batch_no, status, part_id } = req.query;
  const clauses = [];
  const params = [];
  if (batch_no) { params.push(batch_no); clauses.push(`b.batch_no = $${params.length}`); }
  if (status) { params.push(status); clauses.push(`b.status = $${params.length}`); }
  if (part_id) { params.push(part_id); clauses.push(`b.part_id = $${params.length}`); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const { rows } = await pool.query(`
    SELECT b.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no
    FROM bags b
    JOIN machines m ON m.id = b.machine_id
    JOIN parts p ON p.id = b.part_id
    ${where}
    ORDER BY b.created_at DESC LIMIT 200
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

  let requiredStatus;
  if (stage === 'trim') requiredStatus = 'OPEN';
  else if (stage === 'inspect') requiredStatus = part.trim_required ? 'TRIMMED' : 'OPEN';
  else if (stage === 'pack') requiredStatus = part.inspection_required ? 'INSPECTED' : (part.trim_required ? 'TRIMMED' : 'OPEN');
  else if (stage === 'dispatch') requiredStatus = 'PACKED';
  else return res.status(400).json({ error: "stage must be 'trim', 'inspect', 'pack', or 'dispatch'" });

  const { rows } = await pool.query(`
    SELECT b.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no
    FROM bags b
    JOIN machines m ON m.id = b.machine_id
    JOIN parts p ON p.id = b.part_id
    WHERE b.part_id = $1 AND b.bag_type = 'PART' AND b.status = $2
    ORDER BY b.entry_date ASC, (CASE b.shift WHEN 'A' THEN 0 ELSE 1 END) ASC, b.created_at ASC
    LIMIT 1
  `, [part_id, requiredStatus]);

  if (!rows[0]) return res.status(404).json({ error: `No bag ready for ${stage} on this part` });
  res.json(rows[0]);
});

// QR Code / Barcode Scan Lookup & Validation
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

  let fifoValid = true;
  let oldestBag = null;

  if (stage) {
    let requiredStatus;
    if (stage === 'trim') requiredStatus = 'OPEN';
    else if (stage === 'inspect') requiredStatus = bag.trim_required ? 'TRIMMED' : 'OPEN';
    else if (stage === 'pack') requiredStatus = bag.inspection_required ? 'INSPECTED' : (bag.trim_required ? 'TRIMMED' : 'OPEN');
    else if (stage === 'dispatch') requiredStatus = 'PACKED';

    if (requiredStatus && bag.status === requiredStatus) {
      const older = await checkFifo(bag.part_id, requiredStatus, bag.id, bag.entry_date, bag.shift, bag.created_at);
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

// Single bag detail
router.get('/:id', async (req, res) => {
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

async function getBag(id) {
  const { rows } = await pool.query('SELECT * FROM bags WHERE id = $1', [id]);
  return rows[0];
}
async function getPart(id) {
  const { rows } = await pool.query('SELECT * FROM parts WHERE id = $1', [id]);
  return rows[0];
}

// --- Trimming entry ---
router.post('/:id/trim', async (req, res) => {
  const { id } = req.params;
  const { remaining_wt_kg, confirm, fifo_override, fifo_override_reason } = req.body;
  if (remaining_wt_kg == null) return res.status(400).json({ error: 'remaining_wt_kg is required' });

  const bag = await getBag(id);
  if (!bag) return res.status(404).json({ error: 'Bag not found' });

  // FIFO check
  const older = await checkFifo(bag.part_id, 'OPEN', bag.id, bag.entry_date, bag.shift, bag.created_at);
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
    `INSERT INTO trim_entries (bag_id, remaining_wt_kg, operator_user_id) VALUES ($1,$2,$3)`,
    [id, remaining_wt_kg, req.user.id]
  );

  const ready = remaining_wt_kg <= 0.001 || isWithinTrimTolerance(remaining_wt_kg, bag.base_weight_kg);
  if (!ready) return res.json({ bag, closed: false });

  if (!confirm) {
    return res.json({
      needsConfirmation: true,
      message: 'This bag has been fully trimmed within tolerance. Mark status as TRIMMED?',
    });
  }

  const part = await getPart(bag.part_id);
  if (!isLegitimateStatusAdvance(bag.status, 'TRIMMED', part.trim_required, part.inspection_required)) {
    return res.status(409).json({ error: `Bag is currently '${bag.status}' - not ready to advance to TRIMMED` });
  }

  await pool.query(`UPDATE bags SET status = 'TRIMMED' WHERE id = $1`, [id]);
  await logHistory(pool, id, bag.status, 'TRIMMED', 'Trimming');

  await logAudit(pool, {
    process: 'trimming',
    bag_id: id,
    bag_code: bag.bag_code,
    batch_no: bag.batch_no,
    part_id: bag.part_id,
    machine_id: bag.machine_id,
    user_id: req.user.id,
    weight_kg: remaining_wt_kg,
    status_from: bag.status,
    status_to: 'TRIMMED',
    is_fifo_override: isFifoOverride,
    oldest_bag_code: older?.bag_code || null,
  });

  res.json({ bag: { ...bag, status: 'TRIMMED' }, closed: true });
});

// --- Inspection entry ---
router.post('/:id/inspect', async (req, res) => {
  const { id } = req.params;
  const { remaining_wt_kg, reject_wt_kg, reject_reason_id, confirm, fifo_override, fifo_override_reason } = req.body;
  if (remaining_wt_kg == null) return res.status(400).json({ error: 'remaining_wt_kg is required' });

  const bag = await getBag(id);
  if (!bag) return res.status(404).json({ error: 'Bag not found' });
  const part = await getPart(bag.part_id);
  const requiredStatus = part.trim_required ? 'TRIMMED' : 'OPEN';

  // FIFO check
  const older = await checkFifo(bag.part_id, requiredStatus, bag.id, bag.entry_date, bag.shift, bag.created_at);
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
    `INSERT INTO inspection_entries (bag_id, remaining_wt_kg, reject_wt_kg, reject_reason_id, operator_user_id)
     VALUES ($1,$2,$3,$4,$5)`,
    [id, remaining_wt_kg, reject_wt_kg || 0, reject_reason_id || null, req.user.id]
  );

  const ready = remaining_wt_kg <= 0.001 || isWithinInspectionTolerance(remaining_wt_kg, bag.base_weight_kg);
  if (!ready) return res.json({ bag, closed: false });

  if (!confirm) {
    return res.json({
      needsConfirmation: true,
      message: 'This bag has been fully inspected within tolerance. Mark status as INSPECTED?',
    });
  }

  if (!isLegitimateStatusAdvance(bag.status, 'INSPECTED', part.trim_required, part.inspection_required)) {
    return res.status(409).json({ error: `Bag is currently '${bag.status}' - not ready to advance to INSPECTED` });
  }

  await pool.query(`UPDATE bags SET status = 'INSPECTED' WHERE id = $1`, [id]);
  await logHistory(pool, id, bag.status, 'INSPECTED', 'Inspection');

  await logAudit(pool, {
    process: 'inspection',
    bag_id: id,
    bag_code: bag.bag_code,
    batch_no: bag.batch_no,
    part_id: bag.part_id,
    machine_id: bag.machine_id,
    user_id: req.user.id,
    weight_kg: remaining_wt_kg,
    status_from: bag.status,
    status_to: 'INSPECTED',
    is_fifo_override: isFifoOverride,
    oldest_bag_code: older?.bag_code || null,
  });

  res.json({ bag: { ...bag, status: 'INSPECTED' }, closed: true });
});

// --- Packing entry ---
router.post('/:id/pack', async (req, res) => {
  const { id } = req.params;
  const { packed_qty, packed_wt_kg, confirm, fifo_override, fifo_override_reason } = req.body;
  if (packed_qty == null || packed_wt_kg == null) {
    return res.status(400).json({ error: 'packed_qty and packed_wt_kg are required' });
  }

  const bag = await getBag(id);
  if (!bag) return res.status(404).json({ error: 'Bag not found' });
  const part = await getPart(bag.part_id);
  const requiredStatus = part.inspection_required ? 'INSPECTED' : (part.trim_required ? 'TRIMMED' : 'OPEN');

  // FIFO check
  const older = await checkFifo(bag.part_id, requiredStatus, bag.id, bag.entry_date, bag.shift, bag.created_at);
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
    `INSERT INTO packing_entries (bag_id, packed_qty, packed_wt_kg, operator_user_id) VALUES ($1,$2,$3,$4)`,
    [id, packed_qty, packed_wt_kg, req.user.id]
  );

  const remainingWt = Math.max(0, bag.base_weight_kg - packed_wt_kg);
  const ready = remainingWt <= 0.001 || isWithinTolerance(remainingWt, bag.base_weight_kg);
  if (!ready) return res.json({ bag, closed: false });

  if (!confirm) {
    return res.json({
      needsConfirmation: true,
      message: 'This bag has been fully packed within tolerance. Mark status as PACKED?',
    });
  }

  if (!isLegitimateStatusAdvance(bag.status, 'PACKED', part.trim_required, part.inspection_required)) {
    return res.status(409).json({ error: `Bag is currently '${bag.status}' - not ready to advance to PACKED` });
  }

  await pool.query(`UPDATE bags SET status = 'PACKED' WHERE id = $1`, [id]);
  await logHistory(pool, id, bag.status, 'PACKED', 'Packing');

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
    status_to: 'PACKED',
    is_fifo_override: isFifoOverride,
    oldest_bag_code: older?.bag_code || null,
  });

  res.json({ bag: { ...bag, status: 'PACKED' }, closed: true });
});

// --- Dispatch entry ---
router.post('/:id/dispatch', async (req, res) => {
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

module.exports = router;
