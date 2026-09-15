const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// 1. List all Moulds with Tool Life & PM Status
router.get('/', async (req, res) => {
  const { rows: moulds } = await pool.query(`
    SELECT m.*,
           COALESCE((
             SELECT json_agg(
               json_build_object(
                 'part_id', p.id,
                 'part_code', p.part_code,
                 'shrp_part_code', p.shrp_part_code,
                 'customer_part_no', p.customer_part_no,
                 'part_name', p.part_name,
                 'cavity_count', COALESCE(mp.cavities_for_part, p.cavity_count)
               )
             )
             FROM mould_parts mp
             JOIN parts p ON p.id = mp.part_id AND p.active = TRUE
             WHERE mp.mould_id = m.id
           ), '[]'::json) AS linked_parts,
           COALESCE((
             SELECT json_agg(
               json_build_object(
                 'id', mf.id,
                 'file_type', mf.file_type,
                 'filename', mf.filename,
                 'uploaded_at', mf.uploaded_at
               )
             )
             FROM mould_files mf
             WHERE mf.mould_id = m.id
           ), '[]'::json) AS files
    FROM moulds m
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

// 1b. Fleet-wide PM health summary (counts by status) for dashboard tiles
router.get('/pm-summary', async (req, res) => {
  const { rows: moulds } = await pool.query(
    'SELECT id, mould_code, mould_name, cumulative_shots, shots_since_pm, pm_interval_shots FROM moulds'
  );

  const summary = { ok: 0, due_soon: 0, overdue: 0 };
  const details = moulds.map((m) => {
    const shotsSincePm = Number(m.shots_since_pm || 0);
    const interval = Math.max(1, Number(m.pm_interval_shots || 20000));
    const progressPct = Math.min(150, Math.round((shotsSincePm / interval) * 100));

    let pmStatus = 'ok';
    if (progressPct >= 100) pmStatus = 'overdue';
    else if (progressPct >= 80) pmStatus = 'due_soon';

    summary[pmStatus] += 1;

    return {
      id: m.id,
      mould_code: m.mould_code,
      mould_name: m.mould_name,
      pm_progress_pct: progressPct,
      pm_status: pmStatus,
    };
  });

  res.json({ summary, moulds: details });
});


router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { rows: mouldRows } = await pool.query('SELECT * FROM moulds WHERE id = $1', [id]);
  if (!mouldRows.length) return res.status(404).json({ error: 'Mould not found' });
  const mould = mouldRows[0];

  // Linked parts
  const { rows: parts } = await pool.query(`
    SELECT p.id AS part_id,
           p.id,
           p.part_code,
           p.shrp_part_code,
           p.customer_part_no,
           p.part_name,
           COALESCE(mp.cavities_for_part, p.cavity_count) AS cavity_count,
           p.part_weight_g,
           p.unit_weight_g,
           p.standard_pack_qty,
           p.trim_required,
           p.inspection_required,
           p.packing_required
    FROM mould_parts mp
    JOIN parts p ON p.id = mp.part_id
    WHERE mp.mould_id = $1
    ORDER BY p.part_name
  `, [id]);

  // Files & photos
  const { rows: files } = await pool.query(`
    SELECT id, mould_id, file_type, filename, mime_type, uploaded_at
    FROM mould_files
    WHERE mould_id = $1
    ORDER BY uploaded_at DESC
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
    files,
    maintenance_logs: logs,
  });
});

// 3. Log Mould Maintenance / PM Service & Reset Shot Counter
router.post('/:id/maintenance', requireRole('supervisor', 'admin'), async (req, res) => {
  const { id } = req.params;
  const {
    action_type,
    description,
    technician_name,
    reset_shots = true,
  } = req.body;

  if (!action_type || !description) {
    return res.status(400).json({ error: 'Action type and description are required' });
  }

  const { rows: mouldRows } = await pool.query('SELECT * FROM moulds WHERE id = $1', [id]);
  if (!mouldRows.length) return res.status(404).json({ error: 'Mould not found' });
  const mould = mouldRows[0];

  const shotsAtService = Number(mould.cumulative_shots || 0);

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

// 4. Create New Mould with Full IATF Tooling Specs & Part Allocations
router.post('/', requireRole('admin', 'supervisor'), async (req, res) => {
  const {
    mould_code,
    mould_name,
    tool_type = 'Cold Runner',
    ownership = 'SHRP',
    customer_name,
    tool_maker,
    funded_by,
    suitable_machines,
    total_cavities = 1,
    active_cavities = 1,
    total_rated_life_shots = 500000,
    pm_interval_shots = 20000,
    cumulative_shots = 0,
    storage_location = 'Tool Crib Rack A-01',
    status = 'ready',
    notes,
    part_allocations = [], // [{ part_id, cavities }]
  } = req.body;

  if (!mould_code || !mould_name) {
    return res.status(400).json({ error: 'Mould code and mould name are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`
      INSERT INTO moulds
        (mould_code, mould_name, tool_type, ownership, customer_name, tool_maker, funded_by,
         suitable_machines, total_cavities, active_cavities, total_rated_life_shots,
         pm_interval_shots, cumulative_shots, shots_since_pm, storage_location, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13, $14, $15, $16)
      RETURNING *
    `, [
      mould_code.trim().toUpperCase(),
      mould_name.trim(),
      tool_type || 'Cold Runner',
      ownership || 'SHRP',
      customer_name || null,
      tool_maker || null,
      funded_by || (ownership === 'Customer' ? customer_name : 'SHRP Internal'),
      suitable_machines || null,
      Number(total_cavities) || 1,
      Number(active_cavities) || 1,
      Number(total_rated_life_shots) || 500000,
      Number(pm_interval_shots) || 20000,
      Number(cumulative_shots) || 0,
      storage_location || 'Tool Crib Rack A-01',
      status || 'ready',
      notes || null,
    ]);

    const createdMould = rows[0];

    // Link parts
    for (const p of part_allocations) {
      if (p.part_id) {
        await client.query(`
          INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
          VALUES ($1, $2, $3)
          ON CONFLICT (mould_id, part_id) DO UPDATE SET cavities_for_part = EXCLUDED.cavities_for_part
        `, [createdMould.id, p.part_id, Number(p.cavities) || Number(total_cavities) || 1]);
      }
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
    tool_type,
    ownership,
    customer_name,
    tool_maker,
    funded_by,
    suitable_machines,
    total_cavities,
    active_cavities,
    total_rated_life_shots,
    pm_interval_shots,
    cumulative_shots,
    storage_location,
    status,
    notes,
  } = req.body;

  const { rows } = await pool.query(`
    UPDATE moulds
    SET mould_name = COALESCE($1, mould_name),
        tool_type = COALESCE($2, tool_type),
        ownership = COALESCE($3, ownership),
        customer_name = COALESCE($4, customer_name),
        tool_maker = COALESCE($5, tool_maker),
        funded_by = COALESCE($6, funded_by),
        suitable_machines = COALESCE($7, suitable_machines),
        total_cavities = COALESCE($8, total_cavities),
        active_cavities = COALESCE($9, active_cavities),
        total_rated_life_shots = COALESCE($10, total_rated_life_shots),
        pm_interval_shots = COALESCE($11, pm_interval_shots),
        cumulative_shots = COALESCE($12, cumulative_shots),
        storage_location = COALESCE($13, storage_location),
        status = COALESCE($14, status),
        notes = COALESCE($15, notes)
    WHERE id = $16
    RETURNING *
  `, [
    mould_name,
    tool_type,
    ownership,
    customer_name,
    tool_maker,
    funded_by,
    suitable_machines,
    total_cavities != null ? Number(total_cavities) : null,
    active_cavities != null ? Number(active_cavities) : null,
    total_rated_life_shots != null ? Number(total_rated_life_shots) : null,
    pm_interval_shots != null ? Number(pm_interval_shots) : null,
    cumulative_shots != null ? Number(cumulative_shots) : null,
    storage_location,
    status,
    notes,
    id,
  ]);

  if (!rows.length) return res.status(404).json({ error: 'Mould not found' });
  res.json(rows[0]);
});

// 6. Update Linked Parts for a Mould
router.put('/:id/parts', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const { parts = [] } = req.body; // [{ part_id, cavities }]
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM mould_parts WHERE mould_id = $1', [id]);
    for (const p of parts) {
      if (p.part_id) {
        await client.query(
          'INSERT INTO mould_parts (mould_id, part_id, cavities_for_part) VALUES ($1, $2, $3)',
          [id, p.part_id, Number(p.cavities) || 1]
        );
      }
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 7. Upload Mould File / Photo / 3D CAD Drawing
router.post('/:id/files', requireRole('admin', 'supervisor'), async (req, res) => {
  const { id } = req.params;
  const { file_type, filename, mime_type, data_base64 } = req.body;
  const allowed = [
    'drawing_3d', 'drawing_2d', 'photo_top', 'photo_op_side',
    'photo_non_op_side', 'photo_parting_line', 'photo_shot', 'photo_general',
  ];
  if (!allowed.includes(file_type)) {
    return res.status(400).json({ error: `file_type must be one of: ${allowed.join(', ')}` });
  }
  if (!filename || !mime_type || !data_base64) {
    return res.status(400).json({ error: 'filename, mime_type and data_base64 are required' });
  }

  const buffer = Buffer.from(data_base64, 'base64');
  const { rows } = await pool.query(
    `INSERT INTO mould_files (mould_id, file_type, filename, mime_type, data, uploaded_by_user_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, mould_id, file_type, filename, mime_type, uploaded_at`,
    [id, file_type, filename, mime_type, buffer, req.user.id]
  );
  res.status(201).json(rows[0]);
});

// 8. Stream Mould File / Photo raw bytes
router.get('/:mouldId/files/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const { rows } = await pool.query('SELECT * FROM mould_files WHERE id = $1', [fileId]);
  const file = rows[0];
  if (!file) return res.status(404).send('File not found');
  res.setHeader('Content-Type', file.mime_type);
  res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
  res.send(file.data);
});

// 9. Delete Mould File
router.delete('/:mouldId/files/:fileId', requireRole('admin', 'supervisor'), async (req, res) => {
  const { fileId } = req.params;
  await pool.query('DELETE FROM mould_files WHERE id = $1', [fileId]);
  res.status(204).send();
});

module.exports = router;