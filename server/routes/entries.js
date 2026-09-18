const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { currentShift, hourSlot, istDateString } = require('../lib/shift');
const { logAudit } = require('../lib/auditTrail');

const router = express.Router();
router.use(requireAuth);

router.get('/context', (req, res) => {
  const now = new Date();
  res.json({
    shift: currentShift(now),
    hour_slot: hourSlot(now),
    entry_date: istDateString(now),
    server_time: now.toISOString(),
  });
});

// Log an hourly entry against a RUNNING session. Only the operator who
// started the session (or a supervisor/admin) may log entries against it -
// prevents another operator who selects a still-running machine from
// logging production against someone else's shift.
// start_time is always the
// session's own clock (previous entry's end_time, or the session's own
// start_time for the first entry) - the client never supplies it, so there
// is no chaining logic to get wrong client-side.
//
// rejects / downtimes are itemized arrays: [{ reason_id, qty }] and
// [{ reason_id, minutes }]. Totals (reject_qty, downtime_minutes) are
// always derived server-side from these arrays and inserted into
// reject_log / downtime_log inside the same transaction as the entry -
// the client-supplied totals are never trusted directly.
//
// If the resulting good_qty is below the theoretical target for the
// elapsed time, remarks are mandatory - enforced here, not just in the UI.
router.post('/', async (req, res) => {
  const {
    session_id, end_count, rejects, downtimes, remarks,
  } = req.body;

  if (!session_id || end_count == null) {
    return res.status(400).json({ error: 'session_id and end_count are required' });
  }

  const rejectRows = Array.isArray(rejects)
    ? rejects.filter((r) => r.reason_id && Number(r.qty) > 0)
    : [];
  const downtimeRows = Array.isArray(downtimes)
    ? downtimes.filter((d) => d.reason_id && Number(d.minutes) > 0)
    : [];
  const rejectQty = rejectRows.reduce((sum, r) => sum + Number(r.qty), 0);
  const downtimeMinutes = downtimeRows.reduce((sum, d) => sum + Number(d.minutes), 0);

  const sessionRes = await pool.query("SELECT * FROM machine_sessions WHERE id = $1 AND status = 'RUNNING'", [session_id]);
  const session = sessionRes.rows[0];
  if (!session) return res.status(404).json({ error: 'Running session not found' });
  if (session.operator_user_id !== req.user.id && req.user.role === 'operator') {
    return res.status(403).json({ error: 'This machine is running under another operator. You cannot log entries for it.' });
  }

  // Hard IATF 16949 Gate: Check if FPA has been approved for the current machine assignment
  const assignment = await pool.query(
    `SELECT id, part_id, mould_id FROM machine_assignments WHERE machine_id = $1 AND status = 'approved' ORDER BY approved_at DESC LIMIT 1`,
    [session.machine_id]
  );

  let fpaCheck = { rows: [] };
  try {
    fpaCheck = await pool.query(
      `SELECT id, approval_status, visual_approved_at, full_approval_deadline 
       FROM fpa_submissions 
       WHERE assignment_id = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [assignment.rows[0]?.id]
    );
  } catch (fpaErr) {
    console.warn('Could not query fpa_submissions during entry creation:', fpaErr.message);
  }

  if (!fpaCheck.rows[0] || !['APPROVED', 'CONDITIONAL', 'VISUAL_APPROVED'].includes(fpaCheck.rows[0].approval_status)) {
    return res.status(403).json({
      error: 'IATF 16949 Clause 8.5.1.1 Gate: First-Piece Approval (Visual or Full) must be APPROVED before logging production entries.',
      code: 'fpa_required',
      fpa_status: fpaCheck.rows[0] ? fpaCheck.rows[0].approval_status : 'NOT_SUBMITTED',
      part_id: assignment.rows[0]?.part_id || session.part_id,
      machine_id: Number(session.machine_id),
      mould_id: assignment.rows[0]?.mould_id || null,
      assignment_id: assignment.rows[0]?.id || null,
    });
  }

  // Tier-2 Gate: If still in VISUAL_APPROVED, check if 3rd entry attempt or past deadline
  if (fpaCheck.rows[0].approval_status === 'VISUAL_APPROVED') {
    const visualApprovedAt = fpaCheck.rows[0].visual_approved_at || session.start_time;
    const entryCountRes = await pool.query(
      `SELECT count(*) as count 
       FROM production_entries 
       WHERE machine_id = $1 AND part_id = $2 AND created_at >= $3`,
      [session.machine_id, session.part_id, visualApprovedAt]
    );
    const entryCount = Number(entryCountRes.rows[0]?.count || 0);
    const deadline = fpaCheck.rows[0].full_approval_deadline ? new Date(fpaCheck.rows[0].full_approval_deadline) : null;
    const isPastDeadline = deadline && (new Date() > deadline);

    // Allow entries 1 and 2 (entryCount < 2); hard-block entry 3 (entryCount >= 2) or expired deadline
    if (entryCount >= 2 || isPastDeadline) {
      return res.status(403).json({
        error: 'IATF 16949 Gate: Full FPA Approval Required. The first 2 production entries under Visual Approval are complete (or grace window expired). Full measured FPA must be approved by supervisor before logging entry #3.',
        code: 'full_fpa_required',
        fpa_id: fpaCheck.rows[0].id,
        fpa_status: fpaCheck.rows[0].approval_status,
        full_approval_deadline: fpaCheck.rows[0].full_approval_deadline,
        entry_count: entryCount,
        part_id: assignment.rows[0]?.part_id || session.part_id,
        machine_id: Number(session.machine_id),
        mould_id: assignment.rows[0]?.mould_id || null,
        assignment_id: assignment.rows[0]?.id || null,
      });
    }
  }

  const lastEntryRes = await pool.query(
    `SELECT * FROM production_entries WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [session_id]
  );
  const prevEntry = lastEntryRes.rows[0];
  const startTime = prevEntry ? new Date(prevEntry.end_time) : new Date(session.start_time);
  const startCount = prevEntry ? prevEntry.end_count : session.start_count;

  if (end_count < startCount) {
    return res.status(400).json({ error: 'end_count cannot be less than the previous count' });
  }

  const partRes = await pool.query(`SELECT cavity_count, standard_cycle_time_sec FROM parts WHERE id = $1`, [session.part_id]);
  const part = partRes.rows[0];
  const cavities = Math.max(1, Number(part?.cavity_count) || 1);
  const cycleSec = Number(part?.standard_cycle_time_sec) || 0;

  const shots = Math.max(0, end_count - startCount);
  const grossPieces = shots * cavities;
  const goodQty = Math.max(0, grossPieces - rejectQty);

  const endTime = new Date();
  const elapsedSeconds = Math.max(1, (endTime.getTime() - startTime.getTime()) / 1000);

  let efficiencyPct = null;
  let targetQty = null;
  if (cycleSec > 0) {
    targetQty = (elapsedSeconds / cycleSec) * cavities;
    const idealSeconds = (goodQty / cavities) * cycleSec;
    efficiencyPct = Math.round((idealSeconds / elapsedSeconds) * 1000) / 10;
  }
  const belowTarget = targetQty != null && goodQty < targetQty;

  if (belowTarget && !remarks) {
    const elapsedMin = Math.max(1, Math.round(elapsedSeconds / 60));
    const targetShots = Math.round(targetQty / cavities);
    return res.status(409).json({
      error: `Output (${goodQty} pcs / ${shots} shots) is below the target (${Math.round(targetQty)} pcs / ${targetShots} shots) for this period (${elapsedMin} min). Remarks are required.`,
      code: 'below_target',
      target_qty: Math.round(targetQty),
      target_shots: targetShots,
      shots_logged: shots,
      cavity_count: cavities,
      gross_qty: grossPieces,
      good_qty: goodQty,
      reject_qty: rejectQty,
      efficiency_pct: efficiencyPct,
      elapsed_minutes: elapsedMin,
    });
  }

  const now = new Date();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO production_entries
        (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot,
         start_count, end_count, good_qty, reject_qty, downtime_minutes, downtime_reason_id, remarks,
         start_time, end_time, period_start_at, period_end_at, efficiency_pct, session_id, target_qty, below_target)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING *`,
      [session.machine_id, session.part_id, req.user.id, currentShift(now), istDateString(now), hourSlot(now),
        startCount, end_count, goodQty, rejectQty, downtimeMinutes, rejectRows[0]?.reason_id || null, remarks || null,
        startTime.toISOString(), endTime.toISOString(), startTime.toISOString(), endTime.toISOString(), efficiencyPct, session_id,
        targetQty != null ? Math.round(targetQty * 100) / 100 : null, belowTarget]
    );
    const entry = rows[0];

    for (const r of rejectRows) {
      await client.query(
        `INSERT INTO reject_log (production_entry_id, reject_reason_id, qty) VALUES ($1,$2,$3)`,
        [entry.id, r.reason_id, r.qty]
      );
    }
    for (const d of downtimeRows) {
      await client.query(
        `INSERT INTO downtime_log (production_entry_id, downtime_reason_id, minutes) VALUES ($1,$2,$3)`,
        [entry.id, d.reason_id, d.minutes]
      );
    }

    await client.query('COMMIT');
    entry.rejects = rejectRows;
    entry.downtimes = downtimeRows;

    // Secondary feature: Automatically accumulate shots on the mould(s) linked to this part.
    // Isolated in try/catch so secondary tooling analytics NEVER block or roll back core production entries!
    try {
      // NOTE: `shots` (computed above as end_count - startCount) is ALREADY the direct
      // machine shot count. Do not divide by cavities again here - that was the bug that
      // undercounted mould wear by a factor of the part's cavity count.
      const shotsRun = shots;
      if (shotsRun > 0) {
        await pool.query(`
          UPDATE moulds
          SET cumulative_shots = cumulative_shots + $1,
              shots_since_pm = shots_since_pm + $1
          WHERE id IN (SELECT mould_id FROM mould_parts WHERE part_id = $2)
        `, [shotsRun, session.part_id]);
      }
    } catch (mouldErr) {
      console.warn('Mould shot accumulation non-blocking warning:', mouldErr.message);
    }

    await logAudit(pool, {
      process: 'production',
      part_id: session.part_id,
      machine_id: session.machine_id,
      user_id: req.user.id,
      qty: goodQty,
      remarks: remarks || null,
    });

    res.status(201).json(entry);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// Entries for a given date (defaults to today in IST). Operators only ever
// see their own entries; supervisors/admins see everyone by default, or
// just their own with ?mine=true.
router.get('/', async (req, res) => {
  const { date, mine } = req.query;
  const entryDate = date || istDateString(new Date());
  const onlyMine = req.user.role === 'operator' || mine === 'true';
  const params = [entryDate];
  let where = 'pe.entry_date = $1';
  if (onlyMine) {
    params.push(req.user.id);
    where += ` AND pe.operator_user_id = $${params.length}`;
  }
  const { rows } = await pool.query(`
    SELECT pe.*, m.machine_code, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no, u.full_name AS operator_name
    FROM production_entries pe
    JOIN machines m ON m.id = pe.machine_id
    JOIN parts p ON p.id = pe.part_id
    JOIN users u ON u.id = pe.operator_user_id
    WHERE ${where} AND m.category = 'PRODUCTION'
    ORDER BY pe.machine_id, COALESCE(pe.period_start_at, pe.start_time, pe.created_at) ASC, pe.hour_slot ASC
  `, params);
  res.json(rows);
});

module.exports = router;
