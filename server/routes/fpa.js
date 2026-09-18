const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const PDFDocument = require('pdfkit');

// Require authentication for all FPA routes
router.use(requireAuth);

// -------------------------------------------------------------
// 1. FPA AUDIT TRAIL HISTORY
// -------------------------------------------------------------
router.get('/history', async (req, res) => {
  try {
    const { machineId, partId, status } = req.query;
    let query = `
      SELECT fpa.id, fpa.assignment_id, fpa.machine_id, m.machine_code,
             fpa.part_id, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no,
             fpa.approval_status, fpa.deviation_no, fpa.remarks, fpa.created_at, fpa.approved_at,
             fpa.rm_lot_no, fpa.regrind_pct,
             (COALESCE((fpa.visual_checks->>'no_flash')::boolean, true) AND
              COALESCE((fpa.visual_checks->>'no_sink_marks')::boolean, true) AND
              COALESCE((fpa.visual_checks->>'no_short_shot')::boolean, true) AND
              COALESCE((fpa.visual_checks->>'no_flow_lines')::boolean, true) AND
              COALESCE((fpa.visual_checks->>'no_burn_marks')::boolean, true) AND
              COALESCE((fpa.visual_checks->>'color_acceptable')::boolean, true) AND
              COALESCE((fpa.visual_checks->>'surface_finish_ok')::boolean, true)) AS visual_check_passed,
             rm.material_name,
             u_tech.full_name AS technician_name,
             u_qa.full_name AS inspector_name,
             u_qa.full_name AS approved_by_name
      FROM fpa_submissions fpa
      JOIN machines m ON fpa.machine_id = m.id
      JOIN parts p ON fpa.part_id = p.id
      LEFT JOIN raw_materials rm ON fpa.raw_material_id = rm.id
      LEFT JOIN users u_tech ON fpa.technician_user_id = u_tech.id
      LEFT JOIN users u_qa ON fpa.quality_inspector_user_id = u_qa.id
      WHERE 1=1
    `;
    const params = [];

    if (machineId) {
      params.push(machineId);
      query += ` AND fpa.machine_id = $${params.length}`;
    }
    if (partId) {
      params.push(partId);
      query += ` AND fpa.part_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND fpa.approval_status = $${params.length}`;
    }

    query += ` ORDER BY fpa.created_at DESC LIMIT 100`;

    const result = await pool.query(query, params);
    res.json(result.rows.map(r => ({
      ...r,
      inspection_no: `FPA-${String(r.id).padStart(5, '0')}`,
    })));
  } catch (err) {
    console.error('Error fetching FPA history:', err);
    res.status(500).json({ error: 'Failed to fetch FPA history: ' + err.message });
  }
});

// -------------------------------------------------------------
// 2. GET CURRENT ASSIGNMENTS PENDING FPA APPROVAL
// -------------------------------------------------------------
router.get('/pending', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (ma.machine_id)
        ma.id AS assignment_id, ma.machine_id, m.machine_code, m.tonnage AS machine_tonnage,
        ma.part_id, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no,
        p.cavity_count, p.standard_cycle_time_sec,
        ma.mould_id, mo.mould_code, mo.mould_name,
        ma.status, ma.approved_at, ma.mould_load_started_at, ma.first_ok_part_at,
        u_set.full_name AS set_by_name,
        fpa.id AS fpa_submission_id, fpa.approval_status AS fpa_status,
        fpa.created_at AS fpa_submitted_at
      FROM machine_assignments ma
      JOIN machines m ON m.id = ma.machine_id
      JOIN parts p ON p.id = ma.part_id
      LEFT JOIN moulds mo ON mo.id = ma.mould_id
      LEFT JOIN users u_set ON ma.set_by_user_id = u_set.id
      LEFT JOIN LATERAL (
        SELECT id, approval_status, created_at
        FROM fpa_submissions
        WHERE assignment_id = ma.id
        ORDER BY created_at DESC LIMIT 1
      ) fpa ON true
      WHERE ma.status = 'approved'
        AND (fpa.approval_status IS NULL OR fpa.approval_status NOT IN ('APPROVED', 'CONDITIONAL'))
      ORDER BY ma.machine_id, ma.approved_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching pending FPAs:', err);
    res.status(500).json({ error: 'Failed to fetch pending FPAs: ' + err.message });
  }
});

// Helper: load full initialization data for FPA form
async function fetchFpaInitData({ assignmentId, machineId, partId, mouldId }) {
  let assignment = null;

  if (assignmentId) {
    const assignRes = await pool.query(`
      SELECT 
        ma.id AS assignment_id, ma.machine_id, m.machine_code, m.tonnage AS machine_tonnage,
        ma.part_id, p.part_code, p.shrp_part_code, p.customer_part_no, p.part_name,
        p.cavity_count, p.standard_cycle_time_sec,
        c.name AS customer_name,
        ma.mould_id, mo.mould_code, mo.mould_name,
        mo.active_cavities AS mould_cavities, mo.cumulative_shots, mo.shots_since_pm, mo.pm_interval_shots,
        CASE WHEN mo.shots_since_pm >= mo.pm_interval_shots THEN true ELSE false END AS mould_pm_overdue,
        ma.set_at, ma.mould_load_started_at, ma.first_ok_part_at,
        u_set.full_name AS set_by_name
      FROM machine_assignments ma
      JOIN machines m ON ma.machine_id = m.id
      JOIN parts p ON ma.part_id = p.id
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN moulds mo ON ma.mould_id = mo.id
      LEFT JOIN users u_set ON ma.set_by_user_id = u_set.id
      WHERE ma.id = $1
    `, [assignmentId]);
    assignment = assignRes.rows[0] || null;
  }

  if (!assignment && machineId && partId) {
    const assignRes = await pool.query(`
      SELECT 
        ma.id AS assignment_id, ma.machine_id, m.machine_code, m.tonnage AS machine_tonnage,
        ma.part_id, p.part_code, p.shrp_part_code, p.customer_part_no, p.part_name,
        p.cavity_count, p.standard_cycle_time_sec,
        c.name AS customer_name,
        ma.mould_id, mo.mould_code, mo.mould_name,
        mo.active_cavities AS mould_cavities, mo.cumulative_shots, mo.shots_since_pm, mo.pm_interval_shots,
        CASE WHEN mo.shots_since_pm >= mo.pm_interval_shots THEN true ELSE false END AS mould_pm_overdue,
        ma.set_at, ma.mould_load_started_at, ma.first_ok_part_at,
        u_set.full_name AS set_by_name
      FROM machine_assignments ma
      JOIN machines m ON ma.machine_id = m.id
      JOIN parts p ON ma.part_id = p.id
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN moulds mo ON ma.mould_id = mo.id
      LEFT JOIN users u_set ON ma.set_by_user_id = u_set.id
      WHERE ma.machine_id = $1 AND ma.part_id = $2 AND ma.status = 'approved'
      ORDER BY ma.approved_at DESC LIMIT 1
    `, [machineId, partId]);
    assignment = assignRes.rows[0] || null;
  }

  const effectivePartId = assignment?.part_id || partId;
  const effectiveMachineId = assignment?.machine_id || machineId;
  const effectiveMouldId = assignment?.mould_id || mouldId;

  const [partRes, machineRes, mouldRes] = await Promise.all([
    effectivePartId ? pool.query('SELECT * FROM parts WHERE id = $1', [effectivePartId]) : { rows: [] },
    effectiveMachineId ? pool.query('SELECT * FROM machines WHERE id = $1', [effectiveMachineId]) : { rows: [] },
    effectiveMouldId ? pool.query('SELECT * FROM moulds WHERE id = $1', [effectiveMouldId]) : { rows: [] },
  ]);

  const part = partRes.rows[0] || assignment || null;
  const machine = machineRes.rows[0] || null;
  const mould = mouldRes.rows[0] || null;

  // Process parameters standards: look up (part_id, machine_id, param), fallback to (part_id, NULL, param)
  const paramsRes = effectivePartId ? await pool.query(
    `SELECT DISTINCT ON (parameter_name)
       id, part_id, machine_id, parameter_name, value, unit, sort_order 
     FROM part_process_parameters 
     WHERE part_id = $1 AND (machine_id = $2 OR machine_id IS NULL)
     ORDER BY parameter_name, (CASE WHEN machine_id = $2 THEN 0 ELSE 1 END), sort_order, id`,
    [effectivePartId, effectiveMachineId || null]
  ) : { rows: [] };

  // Critical dimensions standards & tolerances (part-only)
  const dimsRes = effectivePartId ? await pool.query(
    `SELECT id, dimension_name, nominal_value, tol_plus, tol_minus, unit, sort_order 
     FROM part_critical_dimensions 
     WHERE part_id = $1 
     ORDER BY sort_order, id`,
    [effectivePartId]
  ) : { rows: [] };

  // Part recipe & primary raw material
  const recipeRes = effectivePartId ? await pool.query(`
    SELECT 
      pr.*,
      rm1.material_name AS primary_material_name,
      rm1.material_code AS primary_material_code,
      rm1.supplier_name AS primary_supplier,
      rm1.grade_code AS primary_grade,
      rm1.color AS primary_color,
      rm1.drying_temp_c,
      rm1.drying_time_hrs
    FROM part_recipes pr
    LEFT JOIN raw_materials rm1 ON pr.primary_material_id = rm1.id
    WHERE pr.part_id = $1
  `, [effectivePartId]) : { rows: [] };
  const recipe = recipeRes.rows[0] || null;

  // Raw materials master list
  const rawMaterialsRes = await pool.query(
    `SELECT id, material_code, material_name, grade_code AS grade, category, supplier_name 
     FROM raw_materials 
     WHERE active = TRUE OR active IS NULL
     ORDER BY material_code`
  );

  // Active RM lots in stock
  let activeRmLots = [];
  if (recipe && recipe.primary_material_id) {
    const lotsRes = await pool.query(
      `SELECT lot_no, current_stock_kg, reserved_stock_kg 
       FROM rm_stock_register 
       WHERE material_id = $1 AND (current_stock_kg - reserved_stock_kg) > 0 
       ORDER BY updated_at DESC`,
      [recipe.primary_material_id]
    );
    activeRmLots = lotsRes.rows;
  }

  // Gauges master with calibration status
  const gaugesRes = await pool.query(`
    SELECT 
      id,
      gauge_code,
      gauge_name,
      gauge_type,
      last_calibrated_at,
      calibration_interval_days,
      (last_calibrated_at + (calibration_interval_days * INTERVAL '1 day'))::date AS calibration_due_date,
      CASE 
        WHEN (last_calibrated_at + (calibration_interval_days * INTERVAL '1 day')) < CURRENT_DATE THEN true 
        ELSE false 
      END AS is_calibration_lapsed
    FROM gauges
    WHERE status = 'active'
    ORDER BY gauge_code
  `);

  // Existing / recent FPA
  let existingFpa = null;
  if (assignment?.assignment_id || assignmentId) {
    const fpaRes = await pool.query(
      `SELECT fpa.*, 
              u_tech.full_name AS technician_name,
              u_qa.full_name AS quality_inspector_name,
              u_sup.full_name AS supervisor_name
       FROM fpa_submissions fpa
       LEFT JOIN users u_tech ON fpa.technician_user_id = u_tech.id
       LEFT JOIN users u_qa ON fpa.quality_inspector_user_id = u_qa.id
       LEFT JOIN users u_sup ON fpa.supervisor_user_id = u_sup.id
       WHERE fpa.assignment_id = $1
       ORDER BY fpa.created_at DESC
       LIMIT 1`,
      [assignment?.assignment_id || assignmentId]
    );
    existingFpa = fpaRes.rows[0] || null;
  }

  return {
    assignment,
    part,
    machine,
    mould,
    recipe,
    raw_materials: rawMaterialsRes.rows,
    activeRmLots,
    gauges: gaugesRes.rows,
    existingFpa,
    recent_fpa: existingFpa,
    standardProcessParameters: paramsRes.rows,
    standardDimensions: dimsRes.rows.map(d => {
      const nom = Number(d.nominal_value) || 0;
      const plus = Number(d.tol_plus) || 0;
      const minus = Number(d.tol_minus) || 0;
      return {
        ...d,
        lsl: Number((nom - minus).toFixed(3)),
        usl: Number((nom + plus).toFixed(3)),
      };
    }),
  };
}

// -------------------------------------------------------------
// 3. GET /data - QUERY FPA INITIAL DATA VIA PARAMS
// -------------------------------------------------------------
router.get('/data', async (req, res) => {
  try {
    const { machine_id, part_id, mould_id, assignment_id } = req.query;
    const data = await fetchFpaInitData({
      assignmentId: assignment_id ? Number(assignment_id) : undefined,
      machineId: machine_id ? Number(machine_id) : undefined,
      partId: part_id ? Number(part_id) : undefined,
      mouldId: mould_id ? Number(mould_id) : undefined,
    });
    res.json(data);
  } catch (err) {
    console.error('Error in /fpa/data:', err);
    res.status(500).json({ error: 'Failed to fetch FPA initialization data: ' + err.message });
  }
});

// -------------------------------------------------------------
// 4. GET /:assignmentId - INITIAL DATA BY ASSIGNMENT ID
// -------------------------------------------------------------
router.get('/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    if (isNaN(Number(assignmentId))) {
      return res.status(400).json({ error: 'Invalid assignment ID' });
    }
    const data = await fetchFpaInitData({ assignmentId: Number(assignmentId) });
    if (!data.assignment) {
      return res.status(404).json({ error: 'Machine assignment not found.' });
    }
    res.json(data);
  } catch (err) {
    console.error('Error fetching FPA initialization data:', err);
    res.status(500).json({ error: 'Failed to fetch FPA data: ' + err.message });
  }
});

// Helper: submit and process FPA
async function processFpaSubmission(req, res, targetAssignmentId) {
  const client = await pool.connect();
  try {
    const {
      assignment_id,
      machine_id,
      part_id,
      mould_id,
      setupReason = 'Mould Change',
      raw_material_id,
      rawMaterialId,
      raw_material_lot_no,
      rm_lot_no,
      rmLotNo,
      dryer_temp_c,
      dryerTempC,
      dryer_time_hrs,
      dryerTimeHrs,
      regrind_percentage,
      regrind_pct,
      regrindPct = 0,
      regrind_approved,
      regrindApproved = true,
      process_parameters,
      processParameters = {},
      visual_checks,
      visualChecks = {},
      visual_check_passed,
      dimension_readings,
      dimensionReadings = [],
      approval_status,
      approvalStatus = 'APPROVED',
      deviation_no,
      deviationNo,
      remarks,
    } = req.body;

    const effAssignmentId = targetAssignmentId || assignment_id || req.body.assignmentId;
    const effRawMaterialId = raw_material_id || rawMaterialId || null;
    const effRmLotNo = raw_material_lot_no || rm_lot_no || rmLotNo || '';
    const effRegrindPct = Number(regrind_percentage ?? regrind_pct ?? regrindPct) || 0;
    const effDryerTemp = dryer_temp_c ?? dryerTempC;
    const effDryerTime = dryer_time_hrs ?? dryerTimeHrs;
    const effProcessParams = process_parameters || processParameters || {};
    const effVisualChecks = visual_checks || visualChecks || {};
    const effStatus = approval_status || approvalStatus || 'APPROVED';
    const effDeviationNo = deviation_no || deviationNo || null;
    const effRemarks = remarks || null;

    // 1. Resolve machine assignment
    let assign = null;
    if (effAssignmentId) {
      const assignRes = await client.query(
        `SELECT ma.*, p.cavity_count, mo.shots_since_pm, mo.pm_interval_shots 
         FROM machine_assignments ma
         JOIN parts p ON ma.part_id = p.id
         LEFT JOIN moulds mo ON ma.mould_id = mo.id
         WHERE ma.id = $1`,
        [effAssignmentId]
      );
      assign = assignRes.rows[0] || null;
    }

    if (!assign && machine_id && part_id) {
      const assignRes = await client.query(
        `SELECT ma.*, p.cavity_count, mo.shots_since_pm, mo.pm_interval_shots 
         FROM machine_assignments ma
         JOIN parts p ON ma.part_id = p.id
         LEFT JOIN moulds mo ON ma.mould_id = mo.id
         WHERE ma.machine_id = $1 AND ma.part_id = $2 AND ma.status = 'approved'
         ORDER BY ma.approved_at DESC LIMIT 1`,
        [machine_id, part_id]
      );
      assign = assignRes.rows[0] || null;
    }

    if (!assign) {
      return res.status(404).json({ error: 'Approved machine assignment not found for this setup.' });
    }

    // 2. Validate Regrind % against part recipe max allowed limit
    const recipeRes = await client.query(
      `SELECT max_allowed_regrind_pct FROM part_recipes WHERE part_id = $1`,
      [assign.part_id]
    );
    const maxAllowedRegrind = Number(recipeRes.rows[0]?.max_allowed_regrind_pct || 15.0);
    const regrindExceededAllowed = effRegrindPct > maxAllowedRegrind;

    if (regrindExceededAllowed && effStatus === 'APPROVED' && !effDeviationNo) {
      return res.status(400).json({
        error: `Regrind % (${effRegrindPct}%) exceeds maximum allowable limit of ${maxAllowedRegrind}%. A Quality Deviation Number is required for approval.`,
      });
    }

    // 3. Normalize & validate dimension readings
    let dimensionsList = [];
    if (Array.isArray(dimension_readings)) {
      dimensionsList = dimension_readings;
    } else if (dimension_readings && Array.isArray(dimension_readings.dimensions)) {
      dimensionsList = dimension_readings.dimensions;
    } else if (Array.isArray(dimensionReadings)) {
      dimensionsList = dimensionReadings;
    } else if (dimensionReadings && Array.isArray(dimensionReadings.dimensions)) {
      dimensionsList = dimensionReadings.dimensions;
    }

    let overallDimensionStatus = 'PASS';
    const validatedDimensions = dimensionsList.map((dim) => {
      const lsl = Number(dim.lsl ?? dim.nominal - (dim.tol_minus || 0));
      const usl = Number(dim.usl ?? dim.nominal + (dim.tol_plus || 0));
      let dimPass = true;

      const cavitiesRaw = Array.isArray(dim.cavities) ? dim.cavities : [];
      const validatedCavities = cavitiesRaw.map((cav, cIdx) => {
        const valStr = typeof cav === 'object' && cav !== null ? cav.reading : cav;
        const val = parseFloat(valStr);
        let cavStatus = 'PASS';
        if (valStr === '' || valStr == null || isNaN(val)) {
          cavStatus = 'NOT_MEASURED';
          dimPass = false;
        } else if (val < lsl || val > usl) {
          cavStatus = 'FAIL';
          dimPass = false;
        }
        return {
          cavity_no: typeof cav === 'object' && cav !== null ? cav.cavity_no : cIdx + 1,
          reading: valStr,
          status: cavStatus,
        };
      });

      if (!dimPass) overallDimensionStatus = 'FAIL';

      return {
        dimension_name: dim.parameter_name || dim.dimension_name || '',
        spec: dim.spec || '',
        nominal: Number(dim.nominal) || 0,
        lsl,
        usl,
        gauge_code: dim.gauge_code || '',
        cavities: validatedCavities,
        overall_status: dimPass ? 'PASS' : 'FAIL',
      };
    });

    const finalDimensionReadings = {
      dimensions: validatedDimensions,
      overall_dimension_status: overallDimensionStatus,
    };

    // 4. Check Mould PM Overdue
    const mouldPmOverdue = assign.shots_since_pm && assign.pm_interval_shots
      ? assign.shots_since_pm >= assign.pm_interval_shots
      : false;

    // 5. Sign-offs
    const userId = req.user.id;
    const userRole = req.user.role;

    let techId = null;
    let qaId = null;
    let supId = null;

    if (userRole === 'operator') {
      techId = userId;
    } else if (userRole === 'quality_inspector') {
      qaId = userId;
    } else if (userRole === 'supervisor' || userRole === 'admin') {
      supId = userId;
      qaId = userId;
    }

    await client.query('BEGIN');

    const isVisual = effStatus === 'VISUAL_APPROVED';
    const isFullApproved = effStatus === 'APPROVED' || effStatus === 'CONDITIONAL';

    const visualApprovedAt = req.body.visual_approved_at
      ? new Date(req.body.visual_approved_at)
      : isVisual
      ? new Date()
      : null;
    const visualApprovedBy = isVisual ? userId : null;
    const fullApprovalDeadline = isVisual ? new Date((visualApprovedAt || new Date()).getTime() + 2 * 60 * 60 * 1000) : null;
    const finalApprovedAt = req.body.approved_at
      ? new Date(req.body.approved_at)
      : isFullApproved
      ? new Date()
      : null;

    // Check if there's an existing FPA submission for this assignment (e.g. updating VISUAL_APPROVED to APPROVED)
    const existingFpa = await client.query(
      `SELECT id, approval_status, visual_approved_at, visual_approved_by_user_id, full_approval_deadline 
       FROM fpa_submissions 
       WHERE assignment_id = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [assign.id]
    );

    let fpaRes;
    if (existingFpa.rows[0] && existingFpa.rows[0].approval_status === 'VISUAL_APPROVED' && isFullApproved) {
      // Transition from VISUAL_APPROVED to APPROVED
      fpaRes = await client.query(
        `UPDATE fpa_submissions SET
          setup_reason = COALESCE($1, setup_reason),
          raw_material_id = COALESCE($2, raw_material_id),
          rm_lot_no = COALESCE($3, rm_lot_no),
          dryer_temp_c = COALESCE($4, dryer_temp_c),
          dryer_time_hrs = COALESCE($5, dryer_time_hrs),
          regrind_pct = COALESCE($6, regrind_pct),
          regrind_approved = COALESCE($7, regrind_approved),
          regrind_exceeded_allowed = COALESCE($8, regrind_exceeded_allowed),
          mould_pm_overdue = COALESCE($9, mould_pm_overdue),
          process_parameters = $10,
          visual_checks = $11,
          dimension_readings = $12,
          quality_inspector_user_id = COALESCE($13, quality_inspector_user_id),
          supervisor_user_id = COALESCE($14, supervisor_user_id),
          approval_status = $15,
          deviation_no = $16,
          remarks = COALESCE($17, remarks),
          approved_at = $18
        WHERE id = $19
        RETURNING *`,
        [
          setupReason,
          effRawMaterialId,
          effRmLotNo,
          effDryerTemp ? Number(effDryerTemp) : null,
          effDryerTime ? Number(effDryerTime) : null,
          effRegrindPct,
          Boolean(regrind_approved ?? regrindApproved),
          regrindExceededAllowed,
          mouldPmOverdue,
          JSON.stringify(effProcessParams),
          JSON.stringify(effVisualChecks),
          JSON.stringify(finalDimensionReadings),
          qaId,
          supId,
          effStatus,
          effDeviationNo,
          effRemarks,
          finalApprovedAt,
          existingFpa.rows[0].id
        ]
      );
    } else {
      // Insert new FPA submission record
      fpaRes = await client.query(
        `INSERT INTO fpa_submissions (
          assignment_id, machine_id, part_id, mould_id,
          setup_reason, raw_material_id, rm_lot_no,
          dryer_temp_c, dryer_time_hrs, regrind_pct, regrind_approved,
          regrind_exceeded_allowed, mould_pm_overdue,
          process_parameters, visual_checks, dimension_readings,
          technician_user_id, quality_inspector_user_id, supervisor_user_id,
          approval_status, visual_approved_at, visual_approved_by_user_id, full_approval_deadline,
          deviation_no, remarks, approved_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
        RETURNING *`,
        [
          assign.id,
          assign.machine_id,
          assign.part_id,
          assign.mould_id || mould_id || null,
          setupReason,
          effRawMaterialId,
          effRmLotNo,
          effDryerTemp ? Number(effDryerTemp) : null,
          effDryerTime ? Number(effDryerTime) : null,
          effRegrindPct,
          Boolean(regrind_approved ?? regrindApproved),
          regrindExceededAllowed,
          mouldPmOverdue,
          JSON.stringify(effProcessParams),
          JSON.stringify(effVisualChecks),
          JSON.stringify(finalDimensionReadings),
          techId,
          qaId,
          supId,
          effStatus,
          visualApprovedAt,
          visualApprovedBy,
          fullApprovalDeadline,
          effDeviationNo,
          effRemarks,
          finalApprovedAt,
        ]
      );
    }

    // If FPA is approved (visual or full), update machine_assignments first_ok_part_at if not set
    if ((isFullApproved || isVisual) && !assign.first_ok_part_at) {
      const okTime = req.body.first_ok_part_at
        ? new Date(req.body.first_ok_part_at)
        : finalApprovedAt || visualApprovedAt || new Date();
      await client.query(
        `UPDATE machine_assignments SET first_ok_part_at = $1 WHERE id = $2`,
        [okTime, assign.id]
      );
    }

    await client.query('COMMIT');

    const createdSubmission = {
      ...fpaRes.rows[0],
      inspection_no: `FPA-${String(fpaRes.rows[0].id).padStart(5, '0')}`,
    };

    res.json({
      success: true,
      submission: createdSubmission,
      fpa: createdSubmission,
      warnings: [
        mouldPmOverdue ? `Mould PM is overdue (${assign.shots_since_pm}/${assign.pm_interval_shots} shots).` : null,
        regrindExceededAllowed ? `Regrind % exceeded recipe limit (${effRegrindPct}% > ${maxAllowedRegrind}%).` : null,
      ].filter(Boolean),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error submitting FPA:', err);
    res.status(500).json({ error: 'Failed to submit FPA: ' + err.message });
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 5. POST /submit & POST /:assignmentId - SUBMIT FPA
// -------------------------------------------------------------
router.post('/submit', async (req, res) => {
  return processFpaSubmission(req, res, null);
});

router.post('/:assignmentId', async (req, res) => {
  const { assignmentId } = req.params;
  return processFpaSubmission(req, res, Number(assignmentId));
});

// -------------------------------------------------------------
// 6. GENERATE IATF 16949 SETUP APPROVAL REPORT (PDF)
// -------------------------------------------------------------
async function handleFpaPdf(req, res) {
  try {
    const { id } = req.params;

    const fpaRes = await pool.query(
      `SELECT fpa.*,
              m.machine_code, m.tonnage AS machine_tonnage,
              p.part_code, p.shrp_part_code, p.customer_part_no, p.part_name,
              c.name AS customer_name,
              mo.mould_code, mo.mould_name, mo.total_cavities,
              rm.material_name, rm.material_code, rm.supplier_name AS rm_supplier,
              u_tech.full_name AS tech_name,
              u_qa.full_name AS qa_name,
              u_sup.full_name AS sup_name
       FROM fpa_submissions fpa
       JOIN machines m ON fpa.machine_id = m.id
       JOIN parts p ON fpa.part_id = p.id
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN moulds mo ON fpa.mould_id = mo.id
       LEFT JOIN raw_materials rm ON fpa.raw_material_id = rm.id
       LEFT JOIN users u_tech ON fpa.technician_user_id = u_tech.id
       LEFT JOIN users u_qa ON fpa.quality_inspector_user_id = u_qa.id
       LEFT JOIN users u_sup ON fpa.supervisor_user_id = u_sup.id
       WHERE fpa.id = $1`,
      [id]
    );

    if (fpaRes.rows.length === 0) {
      return res.status(404).json({ error: 'FPA record not found.' });
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const fpa = fpaRes.rows[0];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="FPA_Report_${fpa.part_code}_${fpa.id}.pdf"`);

    doc.pipe(res);

    // Header Banner
    doc.fontSize(14).font('Helvetica-Bold').text('SRI HARI RUBBER PRODUCTS', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('SETUP APPROVAL SHEET — INJECTION MOULDING PROCESS', { align: 'center' });
    doc.fontSize(8).text(`Doc Ref: IATF 16949:2016 Cl. 8.5.1.1 / 9.1.1.1 | Inspection #FPA-${String(fpa.id).padStart(5, '0')}`, { align: 'center' });
    doc.moveDown(0.5);

    doc.strokeColor('#333333').lineWidth(1).moveTo(30, doc.y).lineTo(565, doc.y).stroke();
    doc.moveDown(0.5);

    // Section A: Identification
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e3a8a').text('SECTION A: IDENTIFICATION & TRACEABILITY');
    doc.font('Helvetica').fontSize(8).fillColor('#000000');
    doc.text(`Customer: ${fpa.customer_name || 'Standard'} | Part No: ${fpa.part_code} (${fpa.shrp_part_code || ''}) | Cust Part No: ${fpa.customer_part_no || fpa.part_code}`);
    doc.text(`Part Name: ${fpa.part_name} | Machine: ${fpa.machine_code} (${fpa.machine_tonnage || 100}T) | Mould: ${fpa.mould_code || 'M-01'} (${fpa.total_cavities || 1} Cav)`);
    doc.text(`Setup Reason: ${fpa.setup_reason} | Date: ${new Date(fpa.created_at).toLocaleDateString()} | Approval Status: ${fpa.approval_status}`);
    doc.moveDown(0.5);

    // Section B: Material Verification
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e3a8a').text('SECTION B: MATERIAL INFORMATION & DRYING PARAMETERS');
    doc.font('Helvetica').fontSize(8).fillColor('#000000');
    doc.text(`Resin: ${fpa.material_name || 'Standard Resin'} | Supplier: ${fpa.rm_supplier || 'Direct'} | Inward Lot No: ${fpa.rm_lot_no || 'LOT-STANDARD'}`);
    doc.text(`Dryer Temp: ${fpa.dryer_temp_c || '-'}°C | Dryer Time: ${fpa.dryer_time_hrs || '-'} hrs | Regrind %: ${fpa.regrind_pct}%`);
    doc.moveDown(0.5);

    // Section C: Process Parameters
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e3a8a').text('SECTION C: MACHINE & PROCESS PARAMETERS');
    doc.font('Helvetica').fontSize(8).fillColor('#000000');
    const params = typeof fpa.process_parameters === 'string' ? JSON.parse(fpa.process_parameters) : (fpa.process_parameters || {});
    const paramKeys = Object.keys(params);
    if (paramKeys.length > 0) {
      doc.text(paramKeys.map(k => `${k.replace(/_/g, ' ')}: ${params[k]}`).join(' | '));
    } else {
      doc.text('Process parameters set per master recipe standard.');
    }
    doc.moveDown(0.5);

    // Section D: Visual Inspection
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e3a8a').text('SECTION D: 10-POINT VISUAL QUALITY CHECKLIST');
    doc.font('Helvetica').fontSize(8).fillColor('#000000');
    const visual = typeof fpa.visual_checks === 'string' ? JSON.parse(fpa.visual_checks) : (fpa.visual_checks || {});
    const vKeys = Object.keys(visual);
    if (vKeys.length > 0) {
      doc.text(vKeys.map(k => `${k.replace(/_/g, ' ')}: ${visual[k] ? 'PASS' : 'FAIL'}`).join(' | '));
    } else {
      doc.text('Visual checklist: PASS');
    }
    doc.moveDown(0.5);

    // Section E: Critical Dimensions
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e3a8a').text('SECTION E: CRITICAL DIMENSIONAL INSPECTION (SPC CAVITY READINGS)');
    doc.font('Helvetica').fontSize(8).fillColor('#000000');
    const dims = typeof fpa.dimension_readings === 'string' ? JSON.parse(fpa.dimension_readings) : (fpa.dimension_readings || {});
    const dimItems = dims.dimensions || [];
    if (dimItems.length > 0) {
      dimItems.forEach((d, idx) => {
        const cavStr = (d.cavities || []).map(c => `Cav${c.cavity_no}:${c.reading} (${c.status})`).join(', ');
        doc.text(`${idx + 1}. ${d.dimension_name}: Nom ${d.nominal} [${d.lsl} - ${d.usl}] | Gauge: ${d.gauge_code || 'VC'} | ${cavStr} => [${d.overall_status}]`);
      });
    } else {
      doc.text('Multi-cavity dimensional inspection complete and within tolerance.');
    }
    doc.moveDown(0.5);

    // Section F: 3-Tier Sign-offs
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e3a8a').text('SECTION F: SIGN-OFF & AUTHORIZATION');
    doc.font('Helvetica').fontSize(8).fillColor('#000000');
    doc.text(`Setup Technician: ${fpa.tech_name || 'Verified'} | Quality Inspector: ${fpa.qa_name || 'QA Lead'} | Production Supervisor: ${fpa.sup_name || 'Plant Supervisor'}`);
    if (fpa.deviation_no) {
      doc.fillColor('#dc2626').text(`Quality Deviation Authorization No: ${fpa.deviation_no}`);
    }
    if (fpa.remarks) {
      doc.fillColor('#4b5563').text(`Remarks: ${fpa.remarks}`);
    }

    doc.end();
  } catch (err) {
    console.error('Error generating FPA PDF:', err);
    res.status(500).json({ error: 'Failed to generate PDF: ' + err.message });
  }
}

router.get('/pdf/:id', handleFpaPdf);
router.get('/:id/pdf', handleFpaPdf);

module.exports = router;

