const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const {
  isWithinTolerance, isWithinTrimTolerance, isWithinInspectionTolerance,
  isLegitimateStatusAdvance,
} = require('../lib/bagStatus');
const { currentShift, istDateString } = require('../lib/shift');

const router = express.Router();
router.use(requireAuth);

async function logHistory(client, bagId, fromStatus, toStatus, source) {
  await client.query(
    `INSERT INTO bag_status_history (bag_id, from_status, to_status, source) VALUES ($1,$2,$3,$4)`,
    [bagId, fromStatus, toStatus, source]
  );
}

// --- Bag Entry: create a new bag under a batch ---
// Bag code = BatchNo + next 3-digit sequence within that batch (ported from GetNextBagNo)
router.post('/', async (req, res) => {
  const { machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, remarks } = req.body;
  if (!machine_id || !part_id || !batch_no || !base_weight_kg || !qty) {
    return res.status(400).json({ error: 'machine_id, part_id, batch_no, base_weight_kg and qty are required' });
  }
  const type = bag_type === 'RUNNER' ? 'RUNNER' : 'PART';

  const { rows: existing } = await pool.query(
    `SELECT bag_code FROM bags WHERE batch_no = $1`, [batch_no]
  );
  let maxNo = 0;
  for (const row of existing) {
    const suffix = row.bag_code.slice(-3);
    if (/^\d{3}$/.test(suffix)) maxNo = Math.max(maxNo, parseInt(suffix, 10));
  }
  const bagCode = `${batch_no}-${String(maxNo + 1).padStart(3, '0')}`;

  const now = new Date();
  const { rows } = await pool.query(
    `INSERT INTO bags (bag_code, batch_no, entry_date, shift, machine_id, part_id, bag_type,
       base_weight_kg, qty, operator_user_id, status, remarks)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'OPEN',$11) RETURNING *`,
    [bagCode, batch_no, istDateString(now), currentShift(now),
      machine_id, part_id, type, base_weight_kg, qty, req.user.id, remarks || null]
  );
  const bag = rows[0];
  await logHistory(pool, bag.id, null, 'OPEN', 'Bag Entry');
  res.status(201).json(bag);
});

// Derive the batch number for a machine's currently assigned part on a given
// production date + shift, ported from Modproduction.bas's GetPartCode:
// BatchNo = batch_part_code + ddmmyy(date) + Shift. Also returns the
// weight fields Bag Entry needs for the with-runner/separately toggle.
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
    cavity_count: part.cavity_count,
    shot_weight_g: part.unit_weight_g,
    part_weight_g: part.part_weight_g,
  });
});


router.get('/', async (req, res) => {
  const { batch_no, status, part_id } = req.query;
  const clauses = [];
  const params = [];
  if (batch_no) { params.push(batch_no); clauses.push(`b.batch_no = $${params.length}`); }
  if (status) { params.push(status); clauses.push(`b.status = $${params.length}`); }
  if (part_id) { params.push(part_id); clauses.push(`b.part_id = $${params.length}`); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const { rows } = await pool.query(`
    SELECT b.*, m.machine_code, p.part_code, p.part_name
    FROM bags b
    JOIN machines m ON m.id = b.machine_id
    JOIN parts p ON p.id = b.part_id
    ${where}
    ORDER BY b.created_at DESC LIMIT 200
  `, params);
  res.json(rows);
});

// --- FIFO pick: oldest ready bag for a part at a given stage ---
// stage: 'trim' | 'inspect' | 'pack'. Ported from modFIFOBagPicker - oldest
// entry_date then shift (A before B), status must be the correct predecessor
// for this part's routing, bag_type must be PART (never auto-pick a RUNNER).
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
  else return res.status(400).json({ error: "stage must be 'trim', 'inspect' or 'pack'" });

  const { rows } = await pool.query(`
    SELECT b.*, m.machine_code, p.part_code, p.part_name
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

// Single bag detail - used by the printable label. Comes after /fifo (and
// any other literal-path GETs) so it doesn't swallow them as :id="fifo".
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(`
    SELECT b.*, m.machine_code, p.part_code, p.part_name
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
  const { remaining_wt_kg, confirm } = req.body;
  if (remaining_wt_kg == null) return res.status(400).json({ error: 'remaining_wt_kg is required' });

  const bag = await getBag(id);
  if (!bag) return res.status(404).json({ error: 'Bag not found' });

  await pool.query(
    `INSERT INTO trim_entries (bag_id, remaining_wt_kg, operator_user_id) VALUES ($1,$2,$3)`,
    [id, remaining_wt_kg, req.user.id]
  );

  const ready = remaining_wt_kg <= 0.001 || isWithinTrimTolerance(remaining_wt_kg, bag.base_weight_kg);
  if (!ready) return res.json({ bag, closed: false });

  if (remaining_wt_kg > 0.001 && !confirm) {
    return res.json({
      needsConfirmation: true,
      message: `Remaining weight ${remaining_wt_kg}kg is within tolerance of ${bag.base_weight_kg}kg. Mark bag fully trimmed?`,
    });
  }

  const part = await getPart(bag.part_id);
  if (!isLegitimateStatusAdvance(bag.status, 'TRIMMED', part.trim_required, part.inspection_required)) {
    return res.status(409).json({ error: `Bag is currently '${bag.status}' - not ready to advance to TRIMMED` });
  }

  await pool.query(`UPDATE bags SET status = 'TRIMMED' WHERE id = $1`, [id]);
  await logHistory(pool, id, bag.status, 'TRIMMED', 'Trimming');
  res.json({ bag: { ...bag, status: 'TRIMMED' }, closed: true });
});

// --- Inspection entry ---
router.post('/:id/inspect', async (req, res) => {
  const { id } = req.params;
  const { remaining_wt_kg, reject_wt_kg, reject_reason_id, confirm } = req.body;
  if (remaining_wt_kg == null) return res.status(400).json({ error: 'remaining_wt_kg is required' });

  const bag = await getBag(id);
  if (!bag) return res.status(404).json({ error: 'Bag not found' });

  await pool.query(
    `INSERT INTO inspection_entries (bag_id, remaining_wt_kg, reject_wt_kg, reject_reason_id, operator_user_id)
     VALUES ($1,$2,$3,$4,$5)`,
    [id, remaining_wt_kg, reject_wt_kg || 0, reject_reason_id || null, req.user.id]
  );

  const ready = remaining_wt_kg <= 0.001 || isWithinInspectionTolerance(remaining_wt_kg, bag.base_weight_kg);
  if (!ready) return res.json({ bag, closed: false });

  if (remaining_wt_kg > 0.001 && !confirm) {
    return res.json({
      needsConfirmation: true,
      message: `Remaining weight ${remaining_wt_kg}kg is within tolerance of ${bag.base_weight_kg}kg. Mark bag fully inspected?`,
    });
  }

  const part = await getPart(bag.part_id);
  if (!isLegitimateStatusAdvance(bag.status, 'INSPECTED', part.trim_required, part.inspection_required)) {
    return res.status(409).json({ error: `Bag is currently '${bag.status}' - not ready to advance to INSPECTED` });
  }

  await pool.query(`UPDATE bags SET status = 'INSPECTED' WHERE id = $1`, [id]);
  await logHistory(pool, id, bag.status, 'INSPECTED', 'Inspection');
  res.json({ bag: { ...bag, status: 'INSPECTED' }, closed: true });
});

// --- Packing entry ---
router.post('/:id/pack', async (req, res) => {
  const { id } = req.params;
  const { packed_qty, packed_wt_kg, confirm } = req.body;
  if (packed_qty == null || packed_wt_kg == null) {
    return res.status(400).json({ error: 'packed_qty and packed_wt_kg are required' });
  }

  const bag = await getBag(id);
  if (!bag) return res.status(404).json({ error: 'Bag not found' });

  await pool.query(
    `INSERT INTO packing_entries (bag_id, packed_qty, packed_wt_kg, operator_user_id) VALUES ($1,$2,$3,$4)`,
    [id, packed_qty, packed_wt_kg, req.user.id]
  );

  const remainingWt = Math.max(0, bag.base_weight_kg - packed_wt_kg);
  const ready = remainingWt <= 0.001 || isWithinTolerance(remainingWt, bag.base_weight_kg);
  if (!ready) return res.json({ bag, closed: false });

  if (remainingWt > 0.001 && !confirm) {
    return res.json({
      needsConfirmation: true,
      message: `Remaining weight ${remainingWt.toFixed(3)}kg is within tolerance. Mark bag fully packed?`,
    });
  }

  const part = await getPart(bag.part_id);
  if (!isLegitimateStatusAdvance(bag.status, 'PACKED', part.trim_required, part.inspection_required)) {
    return res.status(409).json({ error: `Bag is currently '${bag.status}' - not ready to advance to PACKED` });
  }

  await pool.query(`UPDATE bags SET status = 'PACKED' WHERE id = $1`, [id]);
  await logHistory(pool, id, bag.status, 'PACKED', 'Packing');
  res.json({ bag: { ...bag, status: 'PACKED' }, closed: true });
});

module.exports = router;
