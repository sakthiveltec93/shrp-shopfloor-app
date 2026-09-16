const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const XLSX = require('xlsx');

// Ensure authentication for all planning routes
router.use(requireAuth);

// Helper to compute gross weight per piece (part weight + runner weight per cavity)
function calculatePartGrossWeightWithRunnerG(part) {
  const cavities = Math.max(1, Number(part.cavity_count) || 1);
  const shotWeight = Number(part.unit_weight_g) || 0; // Total shot weight (including runner + all cavities)
  const netPartWeight = Number(part.part_weight_g) || 0; // Net single part weight

  if (shotWeight > 0) {
    if (netPartWeight > 0 && shotWeight < (netPartWeight * cavities)) {
      // If unit_weight_g was recorded per piece including runner
      return shotWeight;
    }
    // Single shot weight / cavities = gross resin needed per piece including runner
    return shotWeight / cavities;
  }
  if (netPartWeight > 0) {
    // If only net part weight is configured, add standard 5% runner allowance
    return netPartWeight * 1.05;
  }
  return 10.0;
}

// -------------------------------------------------------------
// 1. UPLOAD, PARSE & IMPORT MPS EXCEL
// -------------------------------------------------------------
router.post('/mps/upload', requireRole('admin', 'supervisor'), async (req, res) => {
  const client = await pool.connect();
  try {
    const rawData = req.body.fileData || req.body.excel_base64;
    const fileName = req.body.fileName || 'MPS_Schedule.xlsx';
    let scheduleMonth = req.body.scheduleMonth || req.body.month_year || new Date().toISOString().slice(0, 7);
    let customerId = req.body.customerId;

    if (!rawData) {
      return res.status(400).json({ error: 'Excel file data (base64) is required.' });
    }

    if (scheduleMonth.length === 7) {
      scheduleMonth = `${scheduleMonth}-01`;
    }

    // Default customer if none specified
    if (!customerId) {
      const defaultCust = await pool.query('SELECT id FROM customers ORDER BY id ASC LIMIT 1');
      customerId = defaultCust.rows[0]?.id || 1;
    }

    const buffer = Buffer.from(rawData, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (!rows || rows.length < 2) {
      return res.status(400).json({ error: 'Uploaded Excel sheet is empty or invalid.' });
    }

    // Load parts and customers
    const [partsRes, customersRes] = await Promise.all([
      pool.query('SELECT id, part_code, shrp_part_code, customer_part_no, part_name, standard_cycle_time_sec, cavity_count, unit_weight_g, part_weight_g FROM parts WHERE active = true'),
      pool.query('SELECT id, name, customer_code, plant_location, transit_lead_days FROM customers WHERE active = true'),
    ]);

    const parts = partsRes.rows;
    const customers = customersRes.rows;

    const parsedLines = [];
    const varianceAlerts = [];

    let headerRowIndex = -1;
    for (let r = 0; r < Math.min(rows.length, 20); r++) {
      const rowStr = rows[r].map(c => String(c).toLowerCase()).join(' ');
      if (rowStr.includes('part number') || rowStr.includes('part no') || (rowStr.includes('description') && rowStr.includes('unit')) || rowStr.includes('program') || rowStr.includes('shrp')) {
        headerRowIndex = r;
        break;
      }
    }

    if (headerRowIndex === -1) {
      headerRowIndex = 0;
    }

    const headers = rows[headerRowIndex].map(h => String(h).trim());
    
    let partColIdx = headers.findIndex(h => /part\s*(no|number|code)/i.test(h));
    let descColIdx = headers.findIndex(h => /desc|item|name/i.test(h));
    let programColIdx = headers.findIndex(h => /program|model/i.test(h));
    let commodityColIdx = headers.findIndex(h => /commodity/i.test(h));
    let receiptsColIdx = headers.findIndex(h => /receipt|recipt|target|firm/i.test(h));

    let demandColIdx = headers.findIndex(h => /gross|demand|cust.*sch|sales|order\s*qty/i.test(h));

    if (partColIdx === -1) partColIdx = 2;
    if (descColIdx === -1) descColIdx = 3;
    if (programColIdx === -1) programColIdx = 4;
    if (commodityColIdx === -1) commodityColIdx = 6;
    if (receiptsColIdx === -1) receiptsColIdx = headers.length - 1;

    const monthCols = [];
    headers.forEach((h, idx) => {
      if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z0-9\-_ ]*$/i.test(h)) {
        monthCols.push({ index: idx, label: h });
      }
    });

    await client.query('BEGIN');

    for (let r = headerRowIndex + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const rawPartCode = String(row[partColIdx] || '').trim();
      if (!rawPartCode || rawPartCode.toLowerCase() === 'part no' || rawPartCode.toLowerCase() === 'total') continue;

      const cleanCode = rawPartCode.replace(/[\s-]/g, '').toUpperCase();
      const matchedPart = parts.find(p => {
        const pCode = (p.part_code || '').replace(/[\s-]/g, '').toUpperCase();
        const pShrp = (p.shrp_part_code || '').replace(/[\s-]/g, '').toUpperCase();
        const pCust = (p.customer_part_no || '').replace(/[\s-]/g, '').toUpperCase();
        return pCode === cleanCode || pShrp === cleanCode || pCust === cleanCode || cleanCode.includes(pCode) || pCode.includes(cleanCode);
      });

      if (!matchedPart) continue;

      const description = String(row[descColIdx] || matchedPart.part_name).trim();
      const program = programColIdx !== -1 ? String(row[programColIdx] || '').trim() : '';
      const commodity = commodityColIdx !== -1 ? String(row[commodityColIdx] || '').trim() : '';

      let grossDemand = 0;
      let receiptsTarget = 0;

      if (demandColIdx !== -1 && row[demandColIdx] !== '') {
        grossDemand = parseInt(row[demandColIdx], 10) || 0;
      } else if (monthCols.length > 0) {
        grossDemand = parseInt(row[monthCols[0].index], 10) || 0;
      }

      if (receiptsColIdx !== -1 && row[receiptsColIdx] !== '') {
        receiptsTarget = parseInt(row[receiptsColIdx], 10) || 0;
      } else {
        receiptsTarget = grossDemand;
      }

      // If demand wasn't in separate column but receipts target is set, set demand
      if (grossDemand === 0 && receiptsTarget > 0) {
        grossDemand = receiptsTarget;
      }

      if (grossDemand === 0 && receiptsTarget === 0) continue;

      const forecastPeriods = [];
      if (monthCols.length > 1) {
        for (let m = 1; m < Math.min(monthCols.length, 4); m++) {
          const fQty = parseInt(row[monthCols[m].index], 10) || 0;
          forecastPeriods.push({ monthLabel: monthCols[m].label, qty: fQty });
        }
      }

      const maxVal = Math.max(grossDemand, receiptsTarget);
      const minVal = Math.min(grossDemand, receiptsTarget);
      const variancePct = maxVal > 0 ? Number((((maxVal - minVal) / maxVal) * 100).toFixed(1)) : 0;
      const hasHighVariance = variancePct > 15.0;

      // Update part program / commodity if present
      if (program || commodity) {
        await client.query(
          `UPDATE parts 
           SET program = COALESCE(NULLIF($1, ''), program), commodity = COALESCE(NULLIF($2, ''), commodity) 
           WHERE id = $3`,
          [program || null, commodity || null, matchedPart.id]
        );
      }

      // Insert or update master_production_schedules
      const mpsRes = await client.query(
        `INSERT INTO master_production_schedules (
          customer_id, part_id, schedule_month, working_days,
          gross_demand, receipts_target, variance_pct,
          is_variance_override, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE')
        ON CONFLICT (customer_id, part_id, schedule_month) DO UPDATE SET
          gross_demand = EXCLUDED.gross_demand,
          receipts_target = EXCLUDED.receipts_target,
          variance_pct = EXCLUDED.variance_pct,
          working_days = EXCLUDED.working_days,
          status = 'ACTIVE'
        RETURNING id`,
        [
          customerId,
          matchedPart.id,
          scheduleMonth,
          26,
          grossDemand,
          receiptsTarget,
          variancePct,
          false,
        ]
      );

      const mpsId = mpsRes.rows[0].id;

      // Insert rolling forecast horizons
      if (forecastPeriods.length > 0) {
        for (const fp of forecastPeriods) {
          const fMonthDate = scheduleMonth; // fallback horizon
          await client.query(
            `INSERT INTO mps_forecast_periods (mps_id, forecast_month, forecast_qty)
             VALUES ($1, $2, $3)
             ON CONFLICT (mps_id, forecast_month) DO UPDATE SET
               forecast_qty = EXCLUDED.forecast_qty`,
            [mpsId, fMonthDate, fp.qty]
          );
        }
      }

      const grossPieceWeightG = calculatePartGrossWeightWithRunnerG(matchedPart);
      const reqRMKg = Number(((grossPieceWeightG * receiptsTarget) / 1000).toFixed(1));

      const lineItem = {
        id: mpsId,
        rowNumber: r + 1,
        part_id: matchedPart.id,
        part_code: matchedPart.part_code,
        shrp_part_code: matchedPart.shrp_part_code,
        customer_part_no: matchedPart.customer_part_no,
        part_name: matchedPart.part_name,
        program: program || matchedPart.program || 'Standard',
        commodity: commodity || matchedPart.commodity || 'Injection',
        gross_demand_qty: grossDemand,
        net_production_target_qty: receiptsTarget,
        required_rm_kg: reqRMKg,
        variance_pct: variancePct,
        is_high_variance: hasHighVariance,
        hasHighVariance,
        forecast_periods: forecastPeriods.map((f, idx) => ({ id: idx, period_label: f.monthLabel, quantity: f.qty })),
      };

      parsedLines.push(lineItem);
      if (hasHighVariance) {
        varianceAlerts.push(lineItem);
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      fileName,
      totalRows: parsedLines.length,
      imported_count: parsedLines.length,
      imported: parsedLines,
      highVarianceCount: varianceAlerts.length,
      varianceAlerts,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error parsing/saving MPS Excel:', err);
    res.status(500).json({ error: 'Failed to parse MPS file: ' + err.message });
  } finally {
    client.release();
  }
});

// -------------------------------------------------------------
// 2. CONFIRM & AUDIT VARIANCE OVERRIDE
// -------------------------------------------------------------
router.post('/mps/confirm-variance', requireRole('admin', 'supervisor'), async (req, res) => {
  try {
    const { mps_id, confirm_reason } = req.body;
    if (!mps_id) {
      return res.status(400).json({ error: 'mps_id is required' });
    }

    const { rows } = await pool.query(
      `UPDATE master_production_schedules
       SET is_variance_override = true,
           variance_confirmed_by = $1,
           variance_confirmed_at = now(),
           variance_confirm_reason = $2
       WHERE id = $3
       RETURNING *`,
      [req.user.id, confirm_reason || 'Verified demand tolerance', mps_id]
    );

    res.json({ success: true, updated: rows[0] });
  } catch (err) {
    console.error('Error confirming variance:', err);
    res.status(500).json({ error: 'Failed to confirm variance: ' + err.message });
  }
});

// -------------------------------------------------------------
// DELETE MPS FOR ENTIRE MONTH OR SINGLE RECORD (REMOVE IMPORT FULLY)
// -------------------------------------------------------------
router.delete('/mps/month/:month', requireRole('admin', 'supervisor'), async (req, res) => {
  const client = await pool.connect();
  try {
    let targetMonth = req.params.month;
    if (!targetMonth) {
      return res.status(400).json({ error: 'Month parameter is required (e.g. 2026-09).' });
    }
    if (targetMonth.length === 7) {
      targetMonth = `${targetMonth}-01`;
    }

    await client.query('BEGIN');

    // 1. Delete forecast periods for schedules in that month
    await client.query(
      `DELETE FROM mps_forecast_periods 
       WHERE mps_id IN (
         SELECT id FROM master_production_schedules 
         WHERE (to_char(schedule_month, 'YYYY-MM') = to_char($1::date, 'YYYY-MM') OR schedule_month = $1::date)
       )`,
      [targetMonth]
    );

    // 2. Unlink delivery milestones associated with this month's mps
    await client.query(
      `UPDATE customer_delivery_milestones 
       SET mps_id = NULL 
       WHERE mps_id IN (
         SELECT id FROM master_production_schedules 
         WHERE (to_char(schedule_month, 'YYYY-MM') = to_char($1::date, 'YYYY-MM') OR schedule_month = $1::date)
       )`,
      [targetMonth]
    );

    // 3. Delete master_production_schedules
    const delRes = await client.query(
      `DELETE FROM master_production_schedules 
       WHERE (to_char(schedule_month, 'YYYY-MM') = to_char($1::date, 'YYYY-MM') OR schedule_month = $1::date)
       RETURNING id`,
      [targetMonth]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      month: targetMonth,
      deletedCount: delRes.rowCount,
      message: `Successfully removed all ${delRes.rowCount} MPS schedule(s) for ${targetMonth.slice(0, 7)}.`,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error clearing month MPS:', err);
    res.status(500).json({ error: 'Failed to clear MPS import: ' + err.message });
  } finally {
    client.release();
  }
});

router.delete('/mps/item/:id', requireRole('admin', 'supervisor'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    await client.query('DELETE FROM mps_forecast_periods WHERE mps_id = $1', [id]);
    await client.query('UPDATE customer_delivery_milestones SET mps_id = NULL WHERE mps_id = $1', [id]);
    const delRes = await client.query('DELETE FROM master_production_schedules WHERE id = $1 RETURNING id', [id]);
    await client.query('COMMIT');

    if (delRes.rowCount === 0) {
      return res.status(404).json({ error: 'MPS item not found.' });
    }

    res.json({ success: true, id, message: 'MPS item deleted successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting MPS item:', err);
    res.status(500).json({ error: 'Failed to delete MPS item: ' + err.message });
  } finally {
    client.release();
  }
});

// -------------------------------------------------------------
// 3. GET MONTHLY MASTER PRODUCTION SCHEDULE (MPS)
// -------------------------------------------------------------
router.get('/mps', requireAuth, async (req, res) => {
  try {
    const { month, month_year, customerId, customer_id } = req.query;
    let targetMonth = month || month_year || new Date().toISOString().slice(0, 7);
    if (targetMonth.length === 7) {
      targetMonth = `${targetMonth}-01`;
    }

    let query = `
      SELECT 
        mps.id,
        mps.customer_id,
        c.name AS customer_name,
        c.plant_location,
        c.transit_lead_days,
        mps.part_id,
        p.part_code,
        p.shrp_part_code,
        p.customer_part_no,
        p.part_name,
        p.program,
        p.commodity,
        p.velocity_class,
        p.standard_cycle_time_sec,
        p.cavity_count,
        p.unit_weight_g,
        p.part_weight_g,
        mps.schedule_month,
        mps.working_days,
        mps.gross_demand,
        mps.receipts_target,
        mps.variance_pct,
        mps.is_variance_override,
        u.full_name AS variance_confirmed_by_name,
        mps.variance_confirmed_at,
        mps.variance_confirm_reason,
        mps.status
      FROM master_production_schedules mps
      JOIN customers c ON mps.customer_id = c.id
      JOIN parts p ON mps.part_id = p.id
      LEFT JOIN users u ON mps.variance_confirmed_by = u.id
      WHERE (to_char(mps.schedule_month, 'YYYY-MM') = to_char($1::date, 'YYYY-MM') OR mps.schedule_month = $1::date)
    `;
    const params = [targetMonth];

    const targetCust = customerId || customer_id;
    if (targetCust) {
      params.push(targetCust);
      query += ` AND mps.customer_id = $${params.length}`;
    }

    query += ` ORDER BY p.part_name ASC`;

    const result = await pool.query(query, params);

    const mpsIds = result.rows.map(r => r.id);
    let forecastsMap = {};

    if (mpsIds.length > 0) {
      const forecastRes = await pool.query(
        `SELECT mps_id, forecast_month, forecast_qty 
         FROM mps_forecast_periods 
         WHERE mps_id = ANY($1) 
         ORDER BY forecast_month ASC`,
        [mpsIds]
      );
      forecastRes.rows.forEach(f => {
        if (!forecastsMap[f.mps_id]) forecastsMap[f.mps_id] = [];
        forecastsMap[f.mps_id].push(f);
      });
    }

    const records = result.rows.map(row => {
      const workingDays = row.working_days || 26;
      const dailyReqPcs = Math.ceil(row.receipts_target / workingDays);
      const cavities = row.cavity_count || 1;
      const cycleTime = Number(row.standard_cycle_time_sec) || 20;
      const dailyShots = Math.ceil(dailyReqPcs / cavities);
      const dailyHours = Number(((dailyShots * cycleTime) / 3600).toFixed(1));
      const grossPieceWeightG = calculatePartGrossWeightWithRunnerG(row);
      const reqRMKg = Number(((grossPieceWeightG * row.receipts_target) / 1000).toFixed(1));

      return {
        ...row,
        gross_demand_qty: row.gross_demand,
        net_production_target_qty: row.receipts_target,
        required_rm_kg: reqRMKg,
        dailyReqPcs,
        dailyShots,
        dailyHours,
        is_high_variance: Math.abs(Number(row.variance_pct) || 0) > 15,
        forecastPeriods: forecastsMap[row.id] || [],
        forecast_periods: (forecastsMap[row.id] || []).map((f, idx) => ({
          id: idx,
          period_label: f.forecast_month,
          quantity: f.forecast_qty
        })),
      };
    });

    res.json({ month: targetMonth, total: records.length, records, imported: records });
  } catch (err) {
    console.error('Error fetching MPS:', err);
    res.status(500).json({ error: 'Failed to fetch MPS: ' + err.message });
  }
});

// -------------------------------------------------------------
// 4. LIVE PLAN VS ACTUAL PERFORMANCE MATRIX & FG STOCK
// -------------------------------------------------------------
router.get('/plan-vs-actual', requireAuth, async (req, res) => {
  try {
    const { month, month_year } = req.query;
    let targetMonth = month || month_year || new Date().toISOString().slice(0, 7);
    if (targetMonth.length === 7) {
      targetMonth = `${targetMonth}-01`;
    }

    const sql = `
      WITH mps_data AS (
        SELECT 
          mps.part_id,
          mps.customer_id,
          c.name AS customer_name,
          p.part_code,
          p.shrp_part_code,
          p.customer_part_no,
          p.part_name,
          p.program,
          p.commodity,
          SUM(mps.gross_demand) AS planned_gross,
          SUM(mps.receipts_target) AS planned_target
        FROM master_production_schedules mps
        JOIN customers c ON mps.customer_id = c.id
        JOIN parts p ON mps.part_id = p.id
        WHERE (to_char(mps.schedule_month, 'YYYY-MM') = to_char($1::date, 'YYYY-MM') OR mps.schedule_month = $1::date)
          AND mps.status = 'ACTIVE'
        GROUP BY mps.part_id, mps.customer_id, c.name, p.part_code, p.shrp_part_code, p.customer_part_no, p.part_name, p.program, p.commodity
      ),
      prod_actuals AS (
        SELECT 
          part_id,
          COALESCE(SUM(good_qty), 0) AS total_produced_qty,
          COALESCE(SUM(reject_qty), 0) AS total_reject_qty
        FROM production_entries
        WHERE entry_date >= $1::date AND entry_date < ($1::date + INTERVAL '1 month')
        GROUP BY part_id
      ),
      dispatch_actuals AS (
        SELECT 
          b.part_id,
          COALESCE(SUM(de.dispatched_qty), 0) AS total_dispatched_qty
        FROM dispatch_entries de
        JOIN bags b ON de.bag_id = b.id
        WHERE de.created_at >= $1::timestamptz AND de.created_at < ($1::timestamptz + INTERVAL '1 month')
        GROUP BY b.part_id
      ),
      live_fg AS (
        SELECT 
          part_id,
          COALESCE(SUM(qty), 0) AS fg_stock_qty
        FROM bags
        WHERE status = 'PACKED' AND bag_type = 'PART'
        GROUP BY part_id
      )
      SELECT 
        m.part_id,
        m.customer_id,
        m.customer_name,
        m.part_code,
        m.shrp_part_code,
        m.customer_part_no,
        m.part_name,
        m.program,
        m.commodity,
        m.planned_gross,
        m.planned_target,
        m.planned_target AS customer_plan_qty,
        COALESCE(pa.total_produced_qty, 0) AS actual_produced_qty,
        COALESCE(pa.total_produced_qty, 0) AS produced_qty,
        COALESCE(pa.total_reject_qty, 0) AS actual_reject_qty,
        COALESCE(da.total_dispatched_qty, 0) AS actual_dispatched_qty,
        COALESCE(da.total_dispatched_qty, 0) AS dispatched_qty,
        COALESCE(fg.fg_stock_qty, 0) AS current_fg_stock_qty,
        COALESCE(fg.fg_stock_qty, 0) AS fg_stock_qty,
        CASE 
          WHEN m.planned_target > 0 THEN 
            ROUND((COALESCE(da.total_dispatched_qty, 0)::numeric / m.planned_target::numeric) * 100, 1)
          ELSE 0 
        END AS dispatch_fulfillment_pct,
        CASE 
          WHEN m.planned_target > 0 THEN 
            ROUND((COALESCE(pa.total_produced_qty, 0)::numeric / m.planned_target::numeric) * 100, 1)
          ELSE 0 
        END AS production_progress_pct
      FROM mps_data m
      LEFT JOIN prod_actuals pa ON m.part_id = pa.part_id
      LEFT JOIN dispatch_actuals da ON m.part_id = da.part_id
      LEFT JOIN live_fg fg ON m.part_id = fg.part_id
      ORDER BY m.customer_name, m.part_name;
    `;

    const result = await pool.query(sql, [targetMonth]);
    res.json({ month: targetMonth, records: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('Error fetching Plan vs Actual matrix:', err);
    res.status(500).json({ error: 'Failed to fetch Plan vs Actual: ' + err.message });
  }
});

// -------------------------------------------------------------
// 5. CUSTOMER DELIVERY MILESTONES (BACKWARD SCHEDULER)
// -------------------------------------------------------------
router.get('/milestones', requireAuth, async (req, res) => {
  try {
    const { status, customerId, customer_id, dateFrom, dateTo, month_year, month } = req.query;
    const targetCust = customerId || customer_id;
    const targetMonth = month_year || month;

    let query = `
      SELECT 
        cdm.id,
        cdm.mps_id,
        cdm.customer_id,
        c.name AS customer_name,
        c.plant_location,
        c.transit_lead_days,
        cdm.part_id,
        p.part_code,
        p.shrp_part_code,
        p.customer_part_no,
        p.part_name,
        p.standard_cycle_time_sec,
        p.cavity_count,
        cdm.delivery_date,
        cdm.delivery_date AS milestone_date,
        cdm.target_dispatch_date,
        cdm.target_production_date,
        cdm.target_production_date AS scheduled_prod_date,
        cdm.scheduled_qty,
        cdm.scheduled_qty AS quantity,
        cdm.dispatched_qty,
        cdm.status,
        cdm.notes,
        cdm.created_at,
        (cdm.delivery_date - CURRENT_DATE) AS days_until_delivery,
        (cdm.target_dispatch_date - CURRENT_DATE) AS days_until_dispatch
      FROM customer_delivery_milestones cdm
      JOIN customers c ON cdm.customer_id = c.id
      JOIN parts p ON cdm.part_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND cdm.status = $${params.length}`;
    }
    if (targetCust) {
      params.push(targetCust);
      query += ` AND cdm.customer_id = $${params.length}`;
    }
    if (targetMonth) {
      params.push(targetMonth);
      query += ` AND to_char(cdm.delivery_date, 'YYYY-MM') = $${params.length}`;
    }
    if (dateFrom) {
      params.push(dateFrom);
      query += ` AND cdm.delivery_date >= $${params.length}`;
    }
    if (dateTo) {
      params.push(dateTo);
      query += ` AND cdm.delivery_date <= $${params.length}`;
    }

    query += ` ORDER BY cdm.target_dispatch_date ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching milestones:', err);
    res.status(500).json({ error: 'Failed to fetch milestones: ' + err.message });
  }
});

router.post('/milestones', requireRole('admin', 'supervisor'), async (req, res) => {
  try {
    const {
      mpsId,
      customerId,
      partId,
      deliveryDate,
      scheduledQty,
      notes,
    } = req.body;

    if (!customerId || !partId || !deliveryDate || !scheduledQty) {
      return res.status(400).json({ error: 'customerId, partId, deliveryDate and scheduledQty are required.' });
    }

    const [custRes, partRes] = await Promise.all([
      pool.query('SELECT transit_lead_days FROM customers WHERE id = $1', [customerId]),
      pool.query('SELECT standard_cycle_time_sec, cavity_count FROM parts WHERE id = $1', [partId]),
    ]);

    const transitDays = custRes.rows[0]?.transit_lead_days || 1;
    const cycleTime = Number(partRes.rows[0]?.standard_cycle_time_sec) || 20;
    const cavities = partRes.rows[0]?.cavity_count || 1;

    const requiredShots = Math.ceil(Number(scheduledQty) / cavities);
    const prodHours = (requiredShots * cycleTime) / 3600;
    const prodDaysNeeded = Math.ceil(prodHours / 16.0) + 1;

    const dDate = new Date(deliveryDate);
    const dispatchDate = new Date(dDate);
    dispatchDate.setDate(dispatchDate.getDate() - transitDays);

    const prodStartDate = new Date(dispatchDate);
    prodStartDate.setDate(prodStartDate.getDate() - prodDaysNeeded);

    const result = await pool.query(
      `INSERT INTO customer_delivery_milestones (
        mps_id, customer_id, part_id, delivery_date,
        target_dispatch_date, target_production_date,
        scheduled_qty, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
      RETURNING *`,
      [
        mpsId || null,
        customerId,
        partId,
        deliveryDate,
        dispatchDate.toISOString().slice(0, 10),
        prodStartDate.toISOString().slice(0, 10),
        scheduledQty,
        notes || null,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating delivery milestone:', err);
    res.status(500).json({ error: 'Failed to create delivery milestone: ' + err.message });
  }
});

// -------------------------------------------------------------
// 6. DAILY SHIFT MACHINE SCHEDULES (PRODUCTION PLANS)
// -------------------------------------------------------------
router.get('/daily-schedules', requireAuth, async (req, res) => {
  try {
    const { date, machineId, machine_id, shift } = req.query;
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const mach = machineId || machine_id;

    let query = `
      SELECT 
        pp.id,
        pp.plan_date,
        pp.shift,
        pp.machine_id,
        m.machine_code,
        pp.part_id,
        p.part_code,
        p.shrp_part_code,
        p.customer_part_no,
        p.part_name,
        p.cavity_count,
        pp.mould_id,
        mo.mould_code,
        mo.mould_name,
        pp.target_qty,
        pp.target_qty AS planned_qty,
        pp.cycle_time_sec,
        pp.planned_hours,
        pp.required_rm_details,
        pp.rm_status,
        pp.priority,
        pp.status,
        pp.notes,
        COALESCE(SUM(pe.good_qty), 0) AS actual_produced_qty,
        COALESCE(SUM(pe.reject_qty), 0) AS actual_reject_qty,
        CASE 
          WHEN pp.target_qty > 0 THEN 
            ROUND((COALESCE(SUM(pe.good_qty), 0)::numeric / pp.target_qty::numeric) * 100, 1)
          ELSE 0 
        END AS completion_pct
      FROM production_plans pp
      JOIN machines m ON pp.machine_id = m.id
      JOIN parts p ON pp.part_id = p.id
      LEFT JOIN moulds mo ON pp.mould_id = mo.id
      LEFT JOIN production_entries pe ON 
        pe.machine_id = pp.machine_id AND 
        pe.part_id = pp.part_id AND 
        pe.entry_date = pp.plan_date AND 
        (pp.shift = 'ALL' OR pe.shift = pp.shift)
      WHERE pp.plan_date = $1
    `;
    const params = [targetDate];

    if (mach) {
      params.push(mach);
      query += ` AND pp.machine_id = $${params.length}`;
    }
    if (shift && shift !== 'ALL') {
      params.push(shift);
      query += ` AND (pp.shift = $${params.length} OR pp.shift = 'ALL')`;
    }

    query += `
      GROUP BY pp.id, pp.plan_date, pp.shift, pp.machine_id, m.machine_code,
               pp.part_id, p.part_code, p.shrp_part_code, p.customer_part_no, p.part_name, p.cavity_count,
               pp.mould_id, mo.mould_code, mo.mould_name, pp.target_qty, pp.cycle_time_sec,
               pp.planned_hours, pp.required_rm_details, pp.rm_status, pp.priority, pp.status, pp.notes
      ORDER BY m.machine_code, pp.shift
    `;

    const result = await pool.query(query, params);
    const plans = result.rows.map(r => {
      const cav = Number(r.cavity_count) || 1;
      const plannedShots = Math.ceil(Number(r.target_qty || 0) / cav);
      return {
        ...r,
        planned_shots: plannedShots,
      };
    });
    res.json({ date: targetDate, plans, schedules: plans, records: plans });
  } catch (err) {
    console.error('Error fetching daily schedules:', err);
    res.status(500).json({ error: 'Failed to fetch daily schedules: ' + err.message });
  }
});

router.post('/daily-schedules', requireRole('admin', 'supervisor'), async (req, res) => {
  try {
    const {
      planDate,
      shift = 'A',
      machineId,
      partId,
      mouldId,
      targetQty,
      priority = 'MEDIUM',
      notes,
    } = req.body;

    if (!planDate || !machineId || !partId || !targetQty) {
      return res.status(400).json({ error: 'planDate, machineId, partId and targetQty are required.' });
    }

    const [partRes, recipeRes] = await Promise.all([
      pool.query('SELECT standard_cycle_time_sec, cavity_count, unit_weight_g, part_weight_g FROM parts WHERE id = $1', [partId]),
      pool.query(`
        SELECT 
          pr.*,
          rm1.material_name AS primary_name, rm1.material_code AS primary_code,
          rm2.material_name AS secondary_name,
          rm_reg.material_name AS regrind_name,
          rm_mb.material_name AS masterbatch_name
        FROM part_recipes pr
        LEFT JOIN raw_materials rm1 ON pr.primary_material_id = rm1.id
        LEFT JOIN raw_materials rm2 ON pr.secondary_material_id = rm2.id
        LEFT JOIN raw_materials rm_reg ON pr.regrind_material_id = rm_reg.id
        LEFT JOIN raw_materials rm_mb ON pr.masterbatch_material_id = rm_mb.id
        WHERE pr.part_id = $1
      `, [partId]),
    ]);

    const part = partRes.rows[0] || {};
    const cycleTime = Number(part.standard_cycle_time_sec) || 20;
    const cavities = part.cavity_count || 1;
    const grossPieceWeightG = calculatePartGrossWeightWithRunnerG(part);

    const requiredShots = Math.ceil(Number(targetQty) / cavities);
    const plannedHours = Number(((requiredShots * cycleTime) / 3600).toFixed(1));

    const capRes = await pool.query(
      `SELECT COALESCE(SUM(planned_hours), 0) AS total_scheduled_hours
       FROM production_plans
       WHERE plan_date = $1 AND machine_id = $2 AND status != 'CANCELLED'`,
      [planDate, machineId]
    );
    const currentScheduled = Number(capRes.rows[0]?.total_scheduled_hours || 0);
    const wouldExceedCapacity = (currentScheduled + plannedHours) > 20.0;

    const recipe = recipeRes.rows[0];
    const totalResinKg = (Number(targetQty) * grossPieceWeightG) / 1000.0;
    const requiredRmDetails = [];
    let overallRmStatus = 'AVAILABLE';

    if (recipe && recipe.primary_material_id) {
      const primRatio = Number(recipe.primary_ratio_pct || 100) / 100.0;
      const primReqKg = Number((totalResinKg * primRatio).toFixed(2));
      const primStockRes = await pool.query(
        'SELECT COALESCE(SUM(current_stock_kg - reserved_stock_kg), 0) AS net_stock FROM rm_stock_register WHERE material_id = $1',
        [recipe.primary_material_id]
      );
      const primNet = Number(primStockRes.rows[0]?.net_stock || 0);
      const primStatus = primNet >= primReqKg ? 'OK' : 'INSUFFICIENT';
      if (primStatus === 'INSUFFICIENT') overallRmStatus = 'INSUFFICIENT_STOCK';

      requiredRmDetails.push({
        materialId: recipe.primary_material_id,
        materialCode: recipe.primary_code,
        materialName: recipe.primary_name,
        role: 'PRIMARY_POLYMER',
        requiredKg: primReqKg,
        required_kg: primReqKg,
        availableNetKg: primNet,
        available_kg: primNet,
        status: primStatus,
      });

      if (recipe.masterbatch_material_id && Number(recipe.masterbatch_ratio_pct) > 0) {
        const mbRatio = Number(recipe.masterbatch_ratio_pct) / 100.0;
        const mbReqKg = Number((totalResinKg * mbRatio).toFixed(2));
        const mbStockRes = await pool.query(
          'SELECT COALESCE(SUM(current_stock_kg - reserved_stock_kg), 0) AS net_stock FROM rm_stock_register WHERE material_id = $1',
          [recipe.masterbatch_material_id]
        );
        const mbNet = Number(mbStockRes.rows[0]?.net_stock || 0);
        const mbStatus = mbNet >= mbReqKg ? 'OK' : 'INSUFFICIENT';
        if (mbStatus === 'INSUFFICIENT') overallRmStatus = 'INSUFFICIENT_STOCK';

        requiredRmDetails.push({
          materialId: recipe.masterbatch_material_id,
          materialName: recipe.masterbatch_name,
          role: 'MASTERBATCH',
          requiredKg: mbReqKg,
          required_kg: mbReqKg,
          availableNetKg: mbNet,
          available_kg: mbNet,
          status: mbStatus,
        });
      }
    } else {
      requiredRmDetails.push({
        materialId: null,
        materialName: 'Virgin Polymer (Standard)',
        role: 'PRIMARY_POLYMER',
        requiredKg: Number(totalResinKg.toFixed(2)),
        required_kg: Number(totalResinKg.toFixed(2)),
        availableNetKg: 9999,
        available_kg: 9999,
        status: 'OK',
      });
    }

    const insertRes = await pool.query(
      `INSERT INTO production_plans (
        plan_date, shift, machine_id, part_id, mould_id,
        target_qty, cycle_time_sec, planned_hours,
        required_rm_details, rm_status, priority, notes, status, created_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PLANNED', $13)
      RETURNING *`,
      [
        planDate,
        shift,
        machineId,
        partId,
        mouldId || null,
        targetQty,
        cycleTime,
        plannedHours,
        JSON.stringify(requiredRmDetails),
        overallRmStatus,
        priority,
        notes || null,
        req.user.id,
      ]
    );

    res.json({
      ...insertRes.rows[0],
      warning: wouldExceedCapacity ? `Machine ${machineId} total scheduled time (${(currentScheduled + plannedHours).toFixed(1)}h) exceeds 20 hours capacity.` : null,
    });
  } catch (err) {
    console.error('Error creating daily plan:', err);
    res.status(500).json({ error: 'Failed to create daily plan: ' + err.message });
  }
});

// -------------------------------------------------------------
// 7. ACTIVE PLAN TARGET FOR PRODUCTION ENTRY
// -------------------------------------------------------------
const handleActiveTarget = async (req, res) => {
  try {
    const { machineId, machine_id, date, shift } = req.query;
    const mach = machineId || machine_id;
    if (!mach) {
      return res.status(400).json({ error: 'machineId / machine_id is required.' });
    }

    const targetDate = date || new Date().toISOString().slice(0, 10);
    const targetShift = shift || 'A';

    const result = await pool.query(
      `SELECT 
        pp.id,
        pp.target_qty,
        pp.planned_hours,
        pp.priority,
        pp.status,
        p.part_name,
        p.part_code
       FROM production_plans pp
       JOIN parts p ON pp.part_id = p.id
       WHERE pp.machine_id = $1 AND pp.plan_date = $2 
         AND (pp.shift = $3 OR pp.shift = 'ALL')
         AND pp.status != 'CANCELLED'
       ORDER BY pp.created_at DESC
       LIMIT 1`,
      [mach, targetDate, targetShift]
    );

    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('Error fetching active target:', err);
    res.status(500).json({ error: 'Failed to fetch active target: ' + err.message });
  }
};

router.get('/daily-schedules/active-target', requireAuth, handleActiveTarget);
router.get('/active-target', requireAuth, handleActiveTarget);

module.exports = router;

