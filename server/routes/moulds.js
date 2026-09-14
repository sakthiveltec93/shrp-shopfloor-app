const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// 1. List all Moulds with Tool Life & PM Status
router.get('/', async (req, res) => {
  const { rows: moulds } = await pool.query(`
    SELECT m.*,
           COALESCE(json_agg(
             json_build_object(
               'part_id', p.id,
               'part_code', p.part_code,
               'shrp_part_code', p.shrp_part_code,
               'customer_part_no', p.customer_part_no,
               'part_name', p.part_name,
               'cavity_count', p.cavity_count
             )
           ) FILTER (WHERE p.id IS NOT NULL), '[]') AS linked_parts
    FROM moulds m
    LEFT JOIN mould_parts mp ON mp.mould_id = m.id
    LEFT JOIN parts p ON p.id = mp.part_id AND p.active = TRUE
    GROUP BY m.id
    ORDER BY m.mould_code
  `);

  // Fetch last PM service for each mould
  const { rows: lastPmRows } = await pool.query(`
    SELECT DISTINCT ON (mould_id) mould_id, created_at AS last_pm_date, technician_name, action_type, description
    FROM mould_maintenance_logs
    ORDER BY mould_id, created_at DESC
  `);
  const pmMap = {};
  for (const pm of lastPmRows) pmMap[pm.mould_id] = pm;

  const result = moulds.map((m) => {
    const cumShots = Number(m.cumulative_shots || 0);
    const shotsSincePm = Number(m.shots_since_pm || 0);
    const interval = Math.max(1, Number(m.pm_interval_shots || 20000));
    const progressPct = Math.min(150, Math.round((shotsSincePm / interval) * 100));

    let pmStatus = 'ok';
    let pmStatusLabel = 'Tool Healthy';
    let pmBadgeClass = 'emerald';

    if (progressPct >= 100) {
      pmStatus = 'overdue';
      pmStatusLabel = 'PM OVERDUE';
      pmBadgeClass = 'red';
    } else if (progressPct >= 80) {
      pmStatus = 'due_soon';
      pmStatusLabel = 'PM Due Soon';
      pmBadgeClass = 'amber';
    }

    const lastPm = pmMap[m.id] || null;

    return {
      ...m,
      cumulative_shots: cumShots,
      shots_since_pm: shotsSincePm,
      pm_interval_shots: interval,
      pm_progress_pct: progressPct,
      pm_status: pmStatus,
      pm_status_label: pmStatusLabel,
      pm_badge_class: pmBadgeClass,
      remaining_shots_to_pm: Math.max(0, interval - shotsSincePm),
      last_pm: lastPm,
    };
  });

  res.json(result);
});

// 2. Get Single Mould Detail with Maintenance History
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { rows: mouldRows } = await pool.query('SELECT * FROM moulds WHERE id = $1', [id]);
  if (!mouldRows.length) return res.status(404).json({ error: 'Mould not found' });
  const mould = mouldRows[0];

  // Linked parts
  const { rows: parts } = await pool.query(`
    SELECT p.*, mp.cavities_for_part
    FROM mould_parts mp
    JOIN parts p ON p.id = mp.part_id
    WHERE mp.mould_id = $1
  `, [id]);

  // Maintenance logs
  const { rows: logs } = await pool.query(`
    SELECT mml.*, u.full_name AS logged_by_name
    FROM mould_maintenance_logs mml
    LEFT JOIN users u ON u.id = mml.logged_by
    WHERE mml.mould_id = $1
    ORDER BY mml.created_at DESC
  `, [id]);

  const cumShots = Number(mould.cumulative_shots || 0);
  const shotsSincePm = Number(mould.shots_since_pm || 0);
  const interval = Math.max(1, Number(mould.pm_interval_shots || 20000));
  const progressPct = Math.min(150, Math.round((shotsSincePm / interval) * 100));

  res.json({
    mould: {
      ...mould,
      cumulative_shots: cumShots,
      shots_since_pm: shotsSincePm,
      pm_interval_shots: interval,
      pm_progress_pct: progressPct,
      remaining_shots_to_pm: Math.max(0, interval - shotsSincePm),
    },
    linked_parts: parts,
    maintenance_logs: logs,
  });
});

// 3. Log Mould Maintenance / PM Service & Reset Shot Counter
router.post('/:id/maintenance', requireRole('supervisor', 'admin'), async (req, res) => {
  const { id } = req.params;
  const {
    action_type, // 'pm_service', 'repair', 'inspection', 'polishing', 'overhaul'
    description,
    technician_name,
    reset_shots = true,
  } = req.body;

  if (!action_type || !description) {
    return res.status(400).json({ error: 'Action type and description are required' });
  }

  // Fetch current shots
  const { rows: mouldRows } = await pool.query('SELECT * FROM moulds WHERE id = $1', [id]);
  if (!mouldRows.length) return res.status(404).json({ error: 'Mould not found' });
  const mould = mouldRows[0];

  const shotsAtService = Number(mould.cumulative_shots || 0);

  // Insert log
  const { rows: logRows } = await pool.query(`
    INSERT INTO mould_maintenance_logs
      (mould_id, action_type, shots_at_service, description, technician_name, logged_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [
    id,
    action_type,
    shotsAtService,
    description,
    technician_name || req.user.full_name,
    req.user.id,
  ]);

  // If PM service or overhaul, reset shots_since_pm to 0
  if (reset_shots && (action_type === 'pm_service' || action_type === 'overhaul')) {
    await pool.query(`
      UPDATE moulds
      SET shots_since_pm = 0, status = 'ready'
      WHERE id = $1
    `, [id]);
  }

  res.status(201).json({
    log: logRows[0],
    message: reset_shots ? 'Maintenance logged and PM shot counter reset to 0.' : 'Maintenance logged.',
  });
});

// 4. Create New Mould
router.post('/', requireRole('admin', 'supervisor'), async (req, res) => {
  const {
    mould_code,
    mould_name,
    ownership = 'SHRP',
    customer_name,
    total_cavities = 1,
    active_cavities = 1,
    pm_interval_shots = 20000,
    storage_location = 'Tool Crib Rack A-01',
    notes,
    part_ids = [],
  } = req.body;

  if (!mould_code || !mould_name) {
    return res.status(400).json({ error: 'Mould code and mould name are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`
      INSERT INTO moulds
        (mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities, pm_interval_shots, storage_location, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      mould_code.trim(),
      mould_name.trim(),
      ownership,
      customer_name || null,
      Number(total_cavities) || 1,
      Number(active_cavities) || 1,
      Number(pm_interval_shots) || 20000,
      storage_location || 'Tool Crib',
      notes || null,
    ]);

    const createdMould = rows[0];

    // Link parts
    for (const pid of part_ids) {
      await client.query(`
        INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [createdMould.id, pid, Number(total_cavities) || 1]);
    }

    await client.query('COMMIT');
    res.status(201).json(createdMould);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 5. Update Mould Specifications
router.put('/:id', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const {
    mould_name,
    ownership,
    customer_name,
    total_cavities,
    active_cavities,
    pm_interval_shots,
    storage_location,
    status,
    notes,
  } = req.body;

  const { rows } = await pool.query(`
    UPDATE moulds
    SET mould_name = COALESCE($1, mould_name),
        ownership = COALESCE($2, ownership),
        customer_name = COALESCE($3, customer_name),
        total_cavities = COALESCE($4, total_cavities),
        active_cavities = COALESCE($5, active_cavities),
        pm_interval_shots = COALESCE($6, pm_interval_shots),
        storage_location = COALESCE($7, storage_location),
        status = COALESCE($8, status),
        notes = COALESCE($9, notes)
    WHERE id = $10
    RETURNING *
  `, [
    mould_name,
    ownership,
    customer_name,
    total_cavities ? Number(total_cavities) : null,
    active_cavities ? Number(active_cavities) : null,
    pm_interval_shots ? Number(pm_interval_shots) : null,
    storage_location,
    status,
    notes,
    id,
  ]);

  if (!rows.length) return res.status(404).json({ error: 'Mould not found' });
  res.json(rows[0]);
});

module.exports = router;
