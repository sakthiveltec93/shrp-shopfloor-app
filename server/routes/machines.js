const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { istDateString } = require('../lib/shift');

const router = express.Router();
router.use(requireAuth);

function todayIST() {
  return istDateString(new Date());
}

// 1. Machine Live Overview & TPM Status
router.get('/overview', async (req, res) => {
  const date = req.query.date || todayIST();

  // Fetch all active machines with specs
  const { rows: machines } = await pool.query(`
    SELECT m.*
    FROM machines m
    WHERE m.active = TRUE
    ORDER BY m.machine_code
  `);

  // Fetch active sessions
  const { rows: sessions } = await pool.query(`
    SELECT us.*, u.full_name AS operator_name
    FROM user_sessions us
    JOIN users u ON u.id = us.user_id
    WHERE us.status = 'ACTIVE'
  `);
  const sessionMap = {};
  for (const s of sessions) sessionMap[s.machine_id] = s;

  // Fetch current approved assignments
  const { rows: assignments } = await pool.query(`
    SELECT DISTINCT ON (ma.machine_id) ma.*, p.part_code, p.shrp_part_code, p.part_name, p.cavity_count, p.unit_weight_g
    FROM machine_assignments ma
    JOIN parts p ON p.id = ma.part_id
    WHERE ma.status = 'approved'
    ORDER BY ma.machine_id, ma.set_at DESC
  `);
  const assignMap = {};
  for (const a of assignments) assignMap[a.machine_id] = a;

  // Fetch today's production totals per machine
  const { rows: prodStats } = await pool.query(`
    SELECT pe.machine_id,
           COALESCE(SUM(pe.end_count - pe.start_count), 0) AS production_qty,
           COALESCE(SUM(pe.good_qty), 0) AS ok_qty,
           COALESCE(SUM(pe.reject_qty), 0) AS reject_qty,
           COALESCE(SUM(pe.downtime_minutes), 0) AS downtime_minutes,
           COUNT(pe.id) AS entries_count
    FROM production_entries pe
    WHERE pe.entry_date = $1
    GROUP BY pe.machine_id
  `, [date]);
  const prodMap = {};
  for (const p of prodStats) prodMap[p.machine_id] = p;

  // Fetch total historical breakdowns and downtime per machine for MTBF/MTTR
  const { rows: bdStats } = await pool.query(`
    SELECT machine_id,
           COUNT(id) AS total_breakdowns,
           COALESCE(SUM(downtime_minutes), 0) AS total_downtime_minutes
    FROM machine_breakdown_logs
    GROUP BY machine_id
  `);
  const bdMap = {};
  for (const b of bdStats) bdMap[b.machine_id] = b;

  const result = machines.map((m) => {
    const s = sessionMap[m.id];
    const a = assignMap[m.id];
    const p = prodMap[m.id] || {};
    const bd = bdMap[m.id] || { total_breakdowns: 0, total_downtime_minutes: 0 };

    const prodQty = Number(p.production_qty || 0);
    const cav = a ? Math.max(1, Number(a.cavity_count) || 1) : 1;
    const shots = Math.round(prodQty / cav);

    // Determine status
    let status = 'IDLE';
    let statusLabel = 'Idle - No Operator';
    let statusClass = 'idle';

    if (s && s.status === 'ACTIVE') {
      if (prodQty > 0) {
        status = 'RUNNING';
        statusLabel = 'Running Production';
        statusClass = 'running';
      } else {
        status = 'STARTED';
        statusLabel = 'Machine ON / Setup';
        statusClass = 'started';
      }
    }

    const totalBd = Number(bd.total_breakdowns) || 0;
    const totalDtMin = Number(bd.total_downtime_minutes) || 0;
    const mttrMin = totalBd > 0 ? Math.round(totalDtMin / totalBd) : 0;
    // MTBF in operating days/hours
    const mtbfHours = totalBd > 0 ? Math.round((365 * 24) / totalBd) : 720;

    return {
      id: m.id,
      machine_code: m.machine_code,
      description: m.description,
      tonnage: m.tonnage || 100,
      make_model: m.make_model || 'Injection Moulding Machine',
      year_of_commission: m.year_of_commission || 2020,
      screw_diameter_mm: m.screw_diameter_mm || 35,
      clamping_force_kn: m.clamping_force_kn || 1000,
      pm_due_date: m.pm_due_date,
      status,
      status_label: statusLabel,
      status_class: statusClass,
      active_session: s ? { operator_name: s.operator_name, started_at: s.started_at } : null,
      current_part: a ? {
        part_id: a.part_id,
        shrp_part_code: a.shrp_part_code || a.part_code,
        part_name: a.part_name,
        cavity_count: a.cavity_count,
        unit_weight_g: a.unit_weight_g,
      } : null,
      today: {
        shots,
        production_qty: prodQty,
        ok_qty: Number(p.ok_qty || 0),
        reject_qty: Number(p.reject_qty || 0),
        downtime_minutes: Number(p.downtime_minutes || 0),
      },
      tpm: {
        total_breakdowns: totalBd,
        total_downtime_minutes: totalDtMin,
        mttr_minutes: mttrMin,
        mtbf_hours: mtbfHours,
      },
    };
  });

  res.json(result);
});

// 2. Machine Detailed History & Audit Log
router.get('/:id/history', async (req, res) => {
  const { id } = req.params;

  // Machine specs
  const { rows: machineRows } = await pool.query('SELECT * FROM machines WHERE id = $1', [id]);
  if (!machineRows.length) return res.status(404).json({ error: 'Machine not found' });
  const machine = machineRows[0];

  // Breakdown and maintenance history
  const { rows: breakdowns } = await pool.query(`
    SELECT mbl.*, u.full_name AS logged_by_name
    FROM machine_breakdown_logs mbl
    LEFT JOIN users u ON u.id = mbl.logged_by
    WHERE mbl.machine_id = $1
    ORDER BY mbl.incident_date DESC, mbl.created_at DESC
  `, [id]);

  // Mould assignment history (last 15 mould changes)
  const { rows: assignments } = await pool.query(`
    SELECT ma.*, p.part_code, p.shrp_part_code, p.part_name, u.full_name AS set_by_name, app.full_name AS approved_by_name
    FROM machine_assignments ma
    JOIN parts p ON p.id = ma.part_id
    JOIN users u ON u.id = ma.set_by_user_id
    LEFT JOIN users app ON app.id = ma.approved_by_user_id
    WHERE ma.machine_id = $1
    ORDER BY ma.set_at DESC
    LIMIT 15
  `, [id]);

  // Production entries history (last 30 entries)
  const { rows: entries } = await pool.query(`
    SELECT pe.*, p.part_code, p.shrp_part_code, p.part_name, u.full_name AS operator_name
    FROM production_entries pe
    JOIN parts p ON p.id = pe.part_id
    JOIN users u ON u.id = pe.operator_user_id
    WHERE pe.machine_id = $1
    ORDER BY pe.entry_date DESC, pe.hour_slot DESC
    LIMIT 30
  `, [id]);

  // Lifetime totals
  const { rows: lifetime } = await pool.query(`
    SELECT COALESCE(SUM(end_count - start_count), 0) AS total_production,
           COALESCE(SUM(good_qty), 0) AS total_ok,
           COALESCE(SUM(reject_qty), 0) AS total_rejection,
           COUNT(DISTINCT entry_date) AS operating_days
    FROM production_entries
    WHERE machine_id = $1
  `, [id]);

  const lifeStats = lifetime[0] || {};
  const totalBd = breakdowns.length;
  const totalDtMin = breakdowns.reduce((sum, b) => sum + Number(b.downtime_minutes || 0), 0);
  const mttr = totalBd > 0 ? Math.round(totalDtMin / totalBd) : 0;
  const mtbf = totalBd > 0 ? Math.round((Number(lifeStats.operating_days || 1) * 24) / totalBd) : 720;

  res.json({
    machine,
    breakdowns,
    assignments,
    recent_entries: entries,
    summary: {
      total_production_qty: Number(lifeStats.total_production || 0),
      total_ok_qty: Number(lifeStats.total_ok || 0),
      total_reject_qty: Number(lifeStats.total_rejection || 0),
      operating_days: Number(lifeStats.operating_days || 0),
      total_breakdowns: totalBd,
      total_downtime_minutes: totalDtMin,
      mttr_minutes: mttr,
      mtbf_hours: mtbf,
    },
  });
});

// 3. Log a Machine Breakdown or TPM Repair
router.post('/:id/breakdown', requireRole('supervisor', 'admin'), async (req, res) => {
  const { id } = req.params;
  const {
    incident_date,
    breakdown_type,
    downtime_minutes,
    root_cause,
    corrective_action,
    parts_replaced,
    technician_name,
  } = req.body;

  if (!breakdown_type) {
    return res.status(400).json({ error: 'Breakdown type is required' });
  }

  const { rows } = await pool.query(`
    INSERT INTO machine_breakdown_logs
      (machine_id, incident_date, breakdown_type, downtime_minutes, root_cause, corrective_action, parts_replaced, technician_name, logged_by)
    VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `, [
    id,
    incident_date || todayIST(),
    breakdown_type,
    Number(downtime_minutes || 0),
    root_cause || '',
    corrective_action || '',
    parts_replaced || '',
    technician_name || req.user.full_name,
    req.user.id,
  ]);

  res.status(201).json(rows[0]);
});

// 4. Update Machine Specifications
router.put('/:id', requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const {
    description,
    tonnage,
    make_model,
    year_of_commission,
    screw_diameter_mm,
    clamping_force_kn,
    pm_due_date,
  } = req.body;

  const { rows } = await pool.query(`
    UPDATE machines
    SET description = COALESCE($1, description),
        tonnage = COALESCE($2, tonnage),
        make_model = COALESCE($3, make_model),
        year_of_commission = COALESCE($4, year_of_commission),
        screw_diameter_mm = COALESCE($5, screw_diameter_mm),
        clamping_force_kn = COALESCE($6, clamping_force_kn),
        pm_due_date = COALESCE($7, pm_due_date)
    WHERE id = $8
    RETURNING *
  `, [
    description,
    tonnage ? Number(tonnage) : null,
    make_model,
    year_of_commission ? Number(year_of_commission) : null,
    screw_diameter_mm ? Number(screw_diameter_mm) : null,
    clamping_force_kn ? Number(clamping_force_kn) : null,
    pm_due_date || null,
    id,
  ]);

  if (!rows.length) return res.status(404).json({ error: 'Machine not found' });
  res.json(rows[0]);
});

module.exports = router;
