const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Standard Format SHRP / QA / R / 01 Rev.02 Inspection Checklist Template
const DEFAULT_INSPECTION_PARAMETERS = [
  {
    parameter_name: 'Visual Appearance & Color',
    specification: 'Uniform color pellets, free from foreign particles & black specks',
    method_of_checking: 'Visual Comparison',
  },
  {
    parameter_name: 'Bag Weight & Condition',
    specification: '25.0 kg ± 0.1 kg, Intact bag sealing, No moisture damage',
    method_of_checking: 'Weighing Scale',
  },
  {
    parameter_name: 'Melt Flow Index (MFI)',
    specification: 'As per Material Grade Certificate (g/10min @ 190°C / 2.16kg)',
    method_of_checking: 'MFI Tester / Supplier TC',
  },
  {
    parameter_name: 'Density @ 23°C',
    specification: 'Standard grade range (g/cm³)',
    method_of_checking: 'Density Hydrometer / Supplier TC',
  },
  {
    parameter_name: 'Tensile / Elongation',
    specification: 'As per manufacturer grade datasheet',
    method_of_checking: 'UTM / Supplier TC',
  },
  {
    parameter_name: 'Moisture Content',
    specification: '< 0.05% Max',
    method_of_checking: 'Moisture Analyzer / Supplier TC',
  },
];

// ============================================================
// 1. Raw Materials Master: List & Create/Update
// ============================================================

// GET /api/raw-materials
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT rm.*,
             COALESCE(SUM(sr.current_stock_kg), 0) AS total_stock_kg,
             COALESCE(SUM(sr.reserved_stock_kg), 0) AS total_reserved_kg,
             COUNT(sr.id) AS active_lots_count
      FROM raw_materials rm
      LEFT JOIN rm_stock_register sr ON sr.material_id = rm.id
      WHERE rm.active = TRUE
      GROUP BY rm.id
      ORDER BY rm.category, rm.material_code
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching raw materials:', err);
    res.status(500).json({ error: 'Failed to fetch raw materials' });
  }
});

// POST /api/raw-materials
router.post('/', requireRole('admin', 'supervisor'), async (req, res) => {
  const {
    id,
    material_code,
    material_name,
    category,
    supplier_name,
    grade_code,
    color,
    density_g_cm3,
    mfi_g_10min,
    standard_bag_wt_kg = 25.0,
    min_stock_kg = 100.0,
  } = req.body;

  if (!material_code || !material_name || !category) {
    return res.status(400).json({ error: 'Material code, name, and category are required' });
  }

  try {
    if (id) {
      const { rows } = await pool.query(
        `UPDATE raw_materials
         SET material_code = $1, material_name = $2, category = $3,
             supplier_name = $4, grade_code = $5, color = $6,
             density_g_cm3 = $7, mfi_g_10min = $8, standard_bag_wt_kg = $9,
             min_stock_kg = $10
         WHERE id = $11
         RETURNING *`,
        [
          material_code.trim(),
          material_name.trim(),
          category,
          supplier_name,
          grade_code,
          color,
          density_g_cm3 || null,
          mfi_g_10min || null,
          standard_bag_wt_kg,
          min_stock_kg,
          id,
        ]
      );
      return res.json(rows[0]);
    } else {
      const { rows } = await pool.query(
        `INSERT INTO raw_materials (
           material_code, material_name, category, supplier_name,
           grade_code, color, density_g_cm3, mfi_g_10min,
           standard_bag_wt_kg, min_stock_kg
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          material_code.trim(),
          material_name.trim(),
          category,
          supplier_name,
          grade_code,
          color,
          density_g_cm3 || null,
          mfi_g_10min || null,
          standard_bag_wt_kg,
          min_stock_kg,
        ]
      );
      return res.status(201).json(rows[0]);
    }
  } catch (err) {
    console.error('Error saving raw material:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 2. Inward Receipts & SHRP/QA/R/01 Rev.02 Inspection
// ============================================================

// GET /api/raw-materials/inward
router.get('/inward', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT inw.*,
             rm.material_code,
             rm.material_name,
             rm.category AS material_category,
             rm.grade_code,
             u_insp.name AS inspector_name,
             u_appr.name AS approved_by_name
      FROM rm_inward_entries inw
      JOIN raw_materials rm ON rm.id = inw.material_id
      LEFT JOIN users u_insp ON u_insp.id = inw.inspector_user_id
      LEFT JOIN users u_appr ON u_appr.id = inw.approved_by_user_id
      ORDER BY inw.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching inward entries:', err);
    res.status(500).json({ error: 'Failed to fetch inward entries' });
  }
});

// GET /api/raw-materials/inward/:id
router.get('/inward/:id', async (req, res) => {
  try {
    const { rows: inwRows } = await pool.query(
      `SELECT inw.*,
              rm.material_code,
              rm.material_name,
              rm.category AS material_category,
              rm.grade_code,
              rm.density_g_cm3,
              rm.mfi_g_10min,
              u_insp.name AS inspector_name,
              u_appr.name AS approved_by_name
       FROM rm_inward_entries inw
       JOIN raw_materials rm ON rm.id = inw.material_id
       LEFT JOIN users u_insp ON u_insp.id = inw.inspector_user_id
       LEFT JOIN users u_appr ON u_appr.id = inw.approved_by_user_id
       WHERE inw.id = $1`,
      [req.params.id]
    );

    if (inwRows.length === 0) {
      return res.status(404).json({ error: 'Inward entry not found' });
    }

    const inward = inwRows[0];

    // Fetch inspection parameters
    const { rows: paramRows } = await pool.query(
      `SELECT * FROM rm_inspection_parameters WHERE inward_id = $1 ORDER BY id`,
      [inward.id]
    );

    inward.parameters = paramRows;
    res.json(inward);
  } catch (err) {
    console.error('Error fetching inward details:', err);
    res.status(500).json({ error: 'Failed to fetch inward details' });
  }
});

// POST /api/raw-materials/inward
router.post('/inward', async (req, res) => {
  const {
    material_id,
    supplier_name,
    invoice_no,
    invoice_date,
    supplier_lot_no,
    received_bags,
    received_wt_kg,
    standard_bag_wt_kg = 25.0,
    sample_size_bags = 5,
    has_supplier_tc = true,
    tc_document_data,
    tc_filename,
    remarks,
  } = req.body;

  if (!material_id || !supplier_name || !invoice_no || !invoice_date || !supplier_lot_no || !received_bags) {
    return res.status(400).json({ error: 'Missing required inward receipt details' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Generate Inward Number: INW-YYYYMMDD-XXXX
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const { rows: seqRows } = await client.query(
      `SELECT COUNT(*) + 1 AS next_seq FROM rm_inward_entries WHERE inward_no LIKE $1`,
      [`INW-${todayStr}-%`]
    );
    const seq = String(seqRows[0].next_seq).padStart(4, '0');
    const inward_no = `INW-${todayStr}-${seq}`;

    const calculated_wt = received_wt_kg || Number(received_bags) * Number(standard_bag_wt_kg);

    const { rows: inwRows } = await client.query(
      `INSERT INTO rm_inward_entries (
         inward_no, material_id, supplier_name, invoice_no, invoice_date,
         supplier_lot_no, received_bags, received_wt_kg, standard_bag_wt_kg,
         sample_size_bags, has_supplier_tc, tc_document_data, tc_filename,
         remarks, inspector_user_id
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        inward_no,
        material_id,
        supplier_name.trim(),
        invoice_no.trim(),
        invoice_date,
        supplier_lot_no.trim(),
        received_bags,
        calculated_wt,
        standard_bag_wt_kg,
        sample_size_bags,
        has_supplier_tc,
        tc_document_data || null,
        tc_filename || null,
        remarks || null,
        req.user.id,
      ]
    );

    const newInward = inwRows[0];

    // Auto-create initial SHRP / QA / R / 01 Rev.02 checklist rows
    for (const param of DEFAULT_INSPECTION_PARAMETERS) {
      await client.query(
        `INSERT INTO rm_inspection_parameters (
           inward_id, parameter_name, specification, method_of_checking, result
         )
         VALUES ($1, $2, $3, $4, 'OK')`,
        [newInward.id, param.parameter_name, param.specification, param.method_of_checking]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(newInward);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating inward entry:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST /api/raw-materials/inward/:id/inspect
router.post('/inward/:id/inspect', async (req, res) => {
  const inwardId = req.params.id;
  const { status, remarks, parameters = [] } = req.body;

  if (!['ACCEPTED', 'REJECTED', 'QUARANTINE'].includes(status)) {
    return res.status(400).json({ error: 'Status must be ACCEPTED, REJECTED, or QUARANTINE' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch inward entry
    const { rows: inwRows } = await client.query(
      `SELECT * FROM rm_inward_entries WHERE id = $1 FOR UPDATE`,
      [inwardId]
    );
    if (inwRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Inward entry not found' });
    }
    const inward = inwRows[0];

    // 2. Update parameters
    if (parameters.length > 0) {
      // Clear and re-insert or update
      await client.query(`DELETE FROM rm_inspection_parameters WHERE inward_id = $1`, [inwardId]);
      for (const p of parameters) {
        await client.query(
          `INSERT INTO rm_inspection_parameters (
             inward_id, parameter_name, specification, method_of_checking,
             obs_b1, obs_b2, obs_b3, obs_b4, obs_b5, result, remarks
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            inwardId,
            p.parameter_name,
            p.specification || null,
            p.method_of_checking || null,
            p.obs_b1 || null,
            p.obs_b2 || null,
            p.obs_b3 || null,
            p.obs_b4 || null,
            p.obs_b5 || null,
            p.result || 'OK',
            p.remarks || null,
          ]
        );
      }
    }

    // 3. Update Inward status & inspector info
    const { rows: updatedInw } = await client.query(
      `UPDATE rm_inward_entries
       SET status = $1,
           remarks = COALESCE($2, remarks),
           inspector_user_id = $3,
           approved_by_user_id = $3,
           inspected_at = now()
       WHERE id = $4
       RETURNING *`,
      [status, remarks, req.user.id, inwardId]
    );

    // 4. If status is ACCEPTED, credit rm_stock_register with inward quantity
    if (status === 'ACCEPTED') {
      const lotNo = inward.supplier_lot_no;
      const materialId = inward.material_id;
      const qtyKg = Number(inward.received_wt_kg);

      await client.query(
        `INSERT INTO rm_stock_register (material_id, lot_no, inward_id, current_stock_kg, reserved_stock_kg, updated_at)
         VALUES ($1, $2, $3, $4, 0, now())
         ON CONFLICT (material_id, lot_no)
         DO UPDATE SET
           current_stock_kg = rm_stock_register.current_stock_kg + EXCLUDED.current_stock_kg,
           updated_at = now()`,
        [materialId, lotNo, inward.id, qtyKg]
      );
    }

    await client.query('COMMIT');
    res.json(updatedInw[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inspecting inward:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ============================================================
// 3. Live Stock Register & Stock Cards
// ============================================================

// GET /api/raw-materials/stock-register
router.get('/stock-register', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT sr.*,
             rm.material_code,
             rm.material_name,
             rm.category AS material_category,
             rm.grade_code,
             rm.color,
             rm.min_stock_kg,
             inw.inward_no,
             inw.supplier_name,
             inw.invoice_no,
             inw.invoice_date,
             inw.created_at AS inward_date
      FROM rm_stock_register sr
      JOIN raw_materials rm ON rm.id = sr.material_id
      LEFT JOIN rm_inward_entries inw ON inw.id = sr.inward_id
      WHERE sr.current_stock_kg > 0 OR sr.reserved_stock_kg > 0
      ORDER BY rm.category, rm.material_code, sr.updated_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching stock register:', err);
    res.status(500).json({ error: 'Failed to fetch stock register' });
  }
});

// ============================================================
// 4. Dual-Layer Formulation Recipes
// ============================================================

// GET /api/raw-materials/recipes
router.get('/recipes', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT pr.*,
             p.part_code,
             p.shrp_part_code,
             p.customer_part_no,
             p.part_name,
             p.gross_weight_g,
             p.net_weight_g,
             p.runner_weight_g,
             p.target_cycle_time_s,
             rm_pri.material_code AS primary_material_code,
             rm_pri.material_name AS primary_material_name,
             rm_pri.grade_code AS primary_grade_code,
             rm_sec.material_code AS secondary_material_code,
             rm_sec.material_name AS secondary_material_name,
             rm_reg.material_code AS regrind_material_code,
             rm_reg.material_name AS regrind_material_name,
             rm_mb.material_code AS masterbatch_material_code,
             rm_mb.material_name AS masterbatch_material_name
      FROM part_recipes pr
      JOIN parts p ON p.id = pr.part_id AND p.active = TRUE
      JOIN raw_materials rm_pri ON rm_pri.id = pr.primary_material_id
      LEFT JOIN raw_materials rm_sec ON rm_sec.id = pr.secondary_material_id
      LEFT JOIN raw_materials rm_reg ON rm_reg.id = pr.regrind_material_id
      LEFT JOIN raw_materials rm_mb ON rm_mb.id = pr.masterbatch_material_id
      ORDER BY p.part_code
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching part recipes:', err);
    res.status(500).json({ error: 'Failed to fetch part recipes' });
  }
});

// POST /api/raw-materials/recipes/:part_id
router.post('/recipes/:part_id', requireRole('admin', 'supervisor'), async (req, res) => {
  const partId = Number(req.params.part_id);
  const {
    primary_material_id,
    primary_ratio_pct = 100.0,
    secondary_material_id,
    secondary_ratio_pct = 0.0,
    regrind_material_id,
    regrind_ratio_pct = 0.0,
    masterbatch_material_id,
    masterbatch_ratio_pct = 0.0,
    max_allowed_regrind_pct = 15.0,
    mixing_instructions,
  } = req.body;

  if (!primary_material_id) {
    return res.status(400).json({ error: 'Primary raw material is required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO part_recipes (
         part_id, primary_material_id, primary_ratio_pct,
         secondary_material_id, secondary_ratio_pct,
         regrind_material_id, regrind_ratio_pct,
         masterbatch_material_id, masterbatch_ratio_pct,
         max_allowed_regrind_pct, mixing_instructions, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())
       ON CONFLICT (part_id)
       DO UPDATE SET
         primary_material_id = EXCLUDED.primary_material_id,
         primary_ratio_pct = EXCLUDED.primary_ratio_pct,
         secondary_material_id = EXCLUDED.secondary_material_id,
         secondary_ratio_pct = EXCLUDED.secondary_ratio_pct,
         regrind_material_id = EXCLUDED.regrind_material_id,
         regrind_ratio_pct = EXCLUDED.regrind_ratio_pct,
         masterbatch_material_id = EXCLUDED.masterbatch_material_id,
         masterbatch_ratio_pct = EXCLUDED.masterbatch_ratio_pct,
         max_allowed_regrind_pct = EXCLUDED.max_allowed_regrind_pct,
         mixing_instructions = EXCLUDED.mixing_instructions,
         updated_at = now()
       RETURNING *`,
      [
        partId,
        primary_material_id,
        primary_ratio_pct,
        secondary_material_id || null,
        secondary_ratio_pct || 0,
        regrind_material_id || null,
        regrind_ratio_pct || 0,
        masterbatch_material_id || null,
        masterbatch_ratio_pct || 0,
        max_allowed_regrind_pct || 15.0,
        mixing_instructions || null,
      ]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('Error saving part recipe:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 5. Shopfloor WIP Carryover Pool & Daily Material Issue
// ============================================================

// GET /api/raw-materials/wip-pool
router.get('/wip-pool', async (req, res) => {
  try {
    const { date, shift } = req.query;
    let query = `
      SELECT p.*,
             m.machine_name,
             m.machine_code,
             rm.material_code,
             rm.material_name,
             u.name AS approver_name
      FROM shopfloor_wip_rm_pool p
      JOIN machines m ON m.id = p.machine_id
      JOIN raw_materials rm ON rm.id = p.material_id
      LEFT JOIN users u ON u.id = p.over_consumed_approved_by
    `;
    const params = [];
    if (date && shift) {
      query += ` WHERE p.date = $1 AND p.shift = $2`;
      params.push(date, shift);
    } else if (date) {
      query += ` WHERE p.date = $1`;
      params.push(date);
    }
    query += ` ORDER BY p.date DESC, p.shift DESC, m.machine_name`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching wip pool:', err);
    res.status(500).json({ error: 'Failed to fetch WIP pool' });
  }
});

// POST /api/raw-materials/issue
router.post('/issue', async (req, res) => {
  const {
    date,
    shift,
    machine_id,
    material_id,
    lot_no,
    issue_qty_kg,
    remarks,
  } = req.body;

  if (!date || !shift || !machine_id || !material_id || !issue_qty_kg) {
    return res.status(400).json({ error: 'Missing required issue parameters' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Deduct stock from stock register if lot_no provided
    if (lot_no) {
      const { rows: stockRows } = await client.query(
        `SELECT * FROM rm_stock_register WHERE material_id = $1 AND lot_no = $2 FOR UPDATE`,
        [material_id, lot_no]
      );
      if (stockRows.length > 0 && Number(stockRows[0].current_stock_kg) >= Number(issue_qty_kg)) {
        await client.query(
          `UPDATE rm_stock_register
           SET current_stock_kg = current_stock_kg - $1, updated_at = now()
           WHERE material_id = $2 AND lot_no = $3`,
          [issue_qty_kg, material_id, lot_no]
        );
      }
    }

    // 2. Upsert shopfloor_wip_rm_pool for this date, shift, machine, material
    const { rows: poolRows } = await client.query(
      `INSERT INTO shopfloor_wip_rm_pool (
         date, shift, machine_id, material_id, opening_balance_kg,
         issued_qty_kg, consumed_qty_kg, closing_balance_kg
       )
       VALUES ($1, $2, $3, $4, 0, $5, 0, $5)
       ON CONFLICT (date, shift, machine_id, material_id)
       DO UPDATE SET
         issued_qty_kg = shopfloor_wip_rm_pool.issued_qty_kg + EXCLUDED.issued_qty_kg,
         closing_balance_kg = shopfloor_wip_rm_pool.opening_balance_kg + shopfloor_wip_rm_pool.issued_qty_kg + EXCLUDED.issued_qty_kg - shopfloor_wip_rm_pool.consumed_qty_kg
       RETURNING *`,
      [date, shift, machine_id, material_id, issue_qty_kg]
    );

    await client.query('COMMIT');
    res.status(201).json(poolRows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error recording RM issue:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
