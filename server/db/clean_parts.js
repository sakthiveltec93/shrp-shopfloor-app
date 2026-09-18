const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('./pool');

// Clean mapping of all 76 active parts from Erp Master Requirements.xlsx Part Details:
// [SHRP Short Code, Customer Drawing No / Part Name, Part Wt (g), TrimReq, InspReq, PackReq, DispReq, TolerancePct, StdPackQty, Cavity, ShotWt, BatchPrefix]
const EXCEL_PARTS = [
  ["F885 Y", "F885-BB1AA-01", 2.59, true, true, true, true, 2, 500, 6, 22.5, "8"],
  ["LAC Blue", "HC442L3LAC01", 4.44, false, true, true, true, 2, 400, 16, 95.5, "35"],
  ["DM1C", "DM1C4UBH1B01", 1.29, true, true, true, true, 2, 750, 8, 14, "32"],
  ["PUNE B", "FC1E1BAE1D01", 2.36, false, true, true, true, 2, 400, 6, 19.5, "P1"],
  ["2200", "V0LC-01C022-00", 1.62, false, true, true, true, 2, 750, 6, 11, "28"],
  ["NA-LC", "WC-SCP-SC21NA-LC-01", 1.43, true, true, true, true, 2, 750, 4, 7, "W15"],
  ["CEEAA-ORANGE", "FC1F2CEEAA02", 5.75, false, true, true, true, 2, 250, 6, 47.5, "1A"],
  ["VW DIA 8 - HW773B", "HW773G9E1B01", 0.34, true, false, true, true, 2, 3000, 6, 3.7, "23"],
  ["A710", "A710-BBWBA-01", 5.75, false, true, true, true, 2, 250, 6, 47.5, "1"],
  ["F364 16C", "F364-CB5AA-01", 3, false, true, true, true, 2, 400, 16, 62, "2"],
  ["F364 GS", "F364-CB5AA-01", 2.68, true, true, true, true, 2, 400, 6, 19.5, "2A"],
  ["F442 KQ", "F442-KQAAA-01", 4.33, false, true, true, true, 2, 200, 6, 31.5, "4"],
  ["F710", "F710-AKYAA-01", 3.44, true, true, true, true, 2, 400, 7, 26.5, "7"],
  ["AN6B", "FC1F2AN6BA01", 2.37, false, true, true, true, 2, 500, 4, 13, "9"],
  ["AA02 Y", "FC1F2SPHAA02", 1.75, false, true, true, true, 2, 750, 4, 10, "10"],
  ["SULLA", "FC1F2SULLA01", 2.62, false, true, true, true, 2, 300, 4, 12, "11"],
  ["UGKCA", "FC1F2UGKCA01", 0.8, true, true, true, true, 2, 1500, 8, 12.5, "12"],
  ["UMEAB", "FC1F2UMEAB01", 1.69, false, true, true, true, 2, 750, 6, 14, "13"],
  ["HA715 - W501", "HA715L5G1A01", 4.56, false, true, true, true, 2, 200, 6, 31, "14"],
  ["CXGAA", "HC442CXGAA01", 3.84, false, true, true, true, 2, 250, 6, 29, "15"],
  ["OERAA", "HC442OERAA01", 1.28, false, true, true, true, 2, 1000, 6, 0, "38"],
  ["AA03", "HC442SPHAA03", 3.63, false, true, true, true, 2, 250, 4, 18, "16"],
  ["LBB", "HC442L3LBB01", 6.07, false, true, true, true, 2, 250, 4, 31, "33"],
  ["LBC", "HC442L3LBC02", 7.15, false, true, true, true, 2, 150, 4, 36, "34"],
  ["SULAC", "HC442SULAC01", 3.59, false, true, true, true, 2, 300, 4, 17.5, "17"],
  ["QQVBA W", "HC443QQVBA02", 1.79, true, true, true, true, 2, 750, 5, 11.5, "18"],
  ["QQVBA Y", "HC443QQVBA02", 1.79, true, true, true, true, 2, 750, 5, 11.5, "18Y"],
  ["DH7AA", "HR230DH7AA01", 7.18, true, true, true, true, 2, 100, 4, 31, "21"],
  ["PDPKA", "HR230PDPKA02", 9.34, false, true, true, true, 2, 100, 4, 38.5, "20"],
  ["HL180", "HL180F4W1A01", 0.99, false, true, true, true, 2, 1000, 4, 6.5, "19"],
  ["VW DIA 16 - HW773A", "HW773G9E1A01", 1.2, false, true, true, true, 2, 1000, 6, 9.3, "22"],
  ["NCBA", "R230-NC5BA-01", 5.99, true, false, true, true, 2, 200, 4, 26.5, "24"],
  ["NCBB", "R230-NC5BB-01", 6.2, true, false, true, true, 2, 105, 4, 28, "25"],
  ["1901", "V0LC-01C019-01", 1.68, false, true, true, true, 2, 600, 6, 11.7, "26"],
  ["2100", "V0LC-01C021-00", 1.88, false, true, true, true, 2, 750, 6, 15.5, "27"],
  ["2800", "V0LC-01C028-00", 2.26, true, true, true, true, 2, 500, 4, 11, "29"],
  ["VPAA", "VP5N1H-407721-AA", 1.71, true, true, true, true, 2, 650, 6, 15, "30"],
  ["VPFA", "VP5N1H-407721-FA", 2.24, true, true, true, true, 2, 500, 6, 16.5, "31"],
  ["PUNE S", "HR241BAE1B01", 1, false, true, true, true, 2, 800, 6, 11.5, "P2"],
  ["BH-DIA 8", "FC1P4L1E1A01", 0.78, true, true, true, true, 2, 1500, 6, 7, "B3"],
  ["BH-DIA 16 - MAA", "PLFC1E4K5MAA-00", 1.24, false, true, true, true, 2, 1000, 6, 13, "B1"],
  ["BH-DIA 12 -MBA", "PLFC1E4K5MBA-00", 1.36, false, true, true, true, 2, 750, 6, 14, "B2"],
  ["KQ NEW", "F442-KQ", 0, true, true, true, true, 2, 1000, 1, 0, "W3"],
  ["SHRP-T8", "SHRP-T8", 2.21, true, true, true, true, 2, 500, 2, 5.5, "W8"],
  ["DA", "WC-SCP-ECC21-DA01", 2.37, true, true, true, true, 2, 500, 2, 5.5, "W9"],
  ["LMF", "WC-SCP-ECC21-LMF01", 2.05, true, true, true, true, 2, 650, 2, 6.5, "W10"],
  ["LMM", "WC-SCP-eCC21-Lmm01", 0, true, true, true, true, 2, 650, 2, 0, "W11"],
  ["SMF", "WC-SCP-ECC21-SMF01", 2.73, true, true, true, true, 2, 500, 2, 6.5, "W12"],
  ["SMM", "WC-SCP-eCC21-Smm01", 2.48, true, true, true, true, 2, 500, 6, 5, "W13"],
  ["NA-DB", "WC-SCP-SC21NA-DB-01", 2.68, true, true, true, true, 2, 500, 4, 13.12, "W14"],
  ["AFM BIG", "CA581CAWXX01", 5.77, false, true, true, true, 2, 250, 6, 85.5, "36"],
  ["AFM SMALL", "CA582DDRXX01", 4.92, false, true, true, true, 2, 250, 6, 68.5, "37"],
  ["F442 QQ", "F442-QQ7AA-01", 3.97, true, true, true, true, 2, 300, 4, 19.1, "3"],
  ["F442 WB", "F442-WBAAA-01", 3.31, false, true, true, true, 2, 300, 1, 4, "5"],
  ["NDGAA", "FC1F2NDGAA02", 2, false, true, true, true, 2, 650, 6, 16.7, "47"],
  ["UMEAA", "FC1F2UMEAA01", 2.57, false, true, true, true, 2, 300, 4, 12.5, "46"],
  ["QVEAC", "HC442QVEAC01", 1.21, false, true, true, true, 2, 1000, 8, 16, "39"],
  ["QVEBC", "HC442QVEBC01", 1.5, false, true, true, true, 2, 1000, 8, 19, "40"],
  ["UMNAA", "HC442UMNAA02", 3.56, false, true, true, true, 2, 250, 6, 29.5, "45"],
  ["DM1C1QRJAA01", "DM1C1QRJAA01", 3, false, false, false, false, 2, 400, 1, 62, ""],
  ["9AB", "VPR230-WC9AB-01", 3.1, false, true, true, true, 2, 300, 4, 13.6, "B9"],
  ["HR241", "HR241G6C1A01", 0, false, true, true, true, 2, 400, 6, 18.5, "B4"],
  ["INLET", "HC442G6C1A", 1.44, true, true, true, true, 2, 1000, 4, 8.5, "B6"],
  ["OUTLET", "HC442G6C1B", 1.44, true, true, true, true, 2, 1000, 4, 8.5, "B5"],
  ["R101", "R101WC9AA01", 0, false, true, true, true, 2, 2000, 4, 0, "B7"],
  ["9AA", "VPR230WC9AA01", 0, true, true, true, true, 2, 400, 4, 0, "B8"],
  ["F390", "F390-QQDC-A02", 0, false, true, true, true, 2, 1000, 4, 0, "W1"],
  ["SHRP-T7", "SHRP-T7", 0, true, true, true, true, 2, 2000, 2, 0, "W7"],
  ["SHRP-T10", "SHRP-T10", 0, true, true, true, true, 2, 2000, 2, 0, "W4"],
  ["LAC GREEN", "VPMGH-18B602-DA", 4.44, false, true, true, true, 2, 400, 16, 95.5, "W15"],
  ["NA-TB", "WC-SCP-SC21NA-TB-T01", 3.61, true, true, true, true, 2, 300, 4, 16.5, "W16"],
  ["ATBAB", "F442-ATBAB-02", 3.63, true, true, true, true, 2, 300, 2, 8.5, "W18"],
  ["SmallGrommet", "SmallGrommet", 0, false, false, false, false, 2, 3000, 4, 0, ""],
  ["VP6T", "VP6TLU11N087AA", 0, true, true, true, true, 2, 1000, 16, 0, "C1"],
  ["HandlePlastic", "HandlePlastic", 0, false, false, false, false, 2, 90, 1, 0, ""],
  ["SYRINGE CAP", "SYRNGECAP", 0, true, true, true, true, 2, 1500, 12, 0, "O1"]
];

async function syncParts(closePool = false) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch pre-counts
    const peCounts = (await client.query('SELECT part_id, count(*)::int as c FROM production_entries GROUP BY part_id')).rows;
    const bgCounts = (await client.query('SELECT part_id, count(*)::int as c FROM bags GROUP BY part_id')).rows;
    const maCounts = (await client.query('SELECT part_id, count(*)::int as c FROM machine_assignments GROUP BY part_id')).rows;
    const msCounts = (await client.query('SELECT part_id, count(*)::int as c FROM machine_sessions GROUP BY part_id')).rows;
    const fpaCounts = (await client.query('SELECT part_id, count(*)::int as c FROM fpa_submissions GROUP BY part_id')).rows;
    const rwCounts = (await client.query('SELECT part_id, count(*)::int as c FROM rework_log WHERE part_id IS NOT NULL GROUP BY part_id')).rows;
    const talCounts = (await client.query('SELECT part_id, count(*)::int as c FROM traceability_audit_log WHERE part_id IS NOT NULL GROUP BY part_id')).rows;

    const peMap = new Map(peCounts.map(r => [r.part_id, r.c]));
    const bgMap = new Map(bgCounts.map(r => [r.part_id, r.c]));
    const maMap = new Map(maCounts.map(r => [r.part_id, r.c]));
    const msMap = new Map(msCounts.map(r => [r.part_id, r.c]));
    const fpaMap = new Map(fpaCounts.map(r => [r.part_id, r.c]));
    const rwMap = new Map(rwCounts.map(r => [r.part_id, r.c]));
    const talMap = new Map(talCounts.map(r => [r.part_id, r.c]));

    const getPartLogStats = (id) => ({
      pe: peMap.get(id) || 0,
      bg: bgMap.get(id) || 0,
      ma: maMap.get(id) || 0,
      ms: msMap.get(id) || 0,
      fpa: fpaMap.get(id) || 0,
      rw: rwMap.get(id) || 0,
      tal: talMap.get(id) || 0,
      total: (peMap.get(id) || 0) + (bgMap.get(id) || 0) + (maMap.get(id) || 0) + (msMap.get(id) || 0) + (fpaMap.get(id) || 0) + (rwMap.get(id) || 0) + (talMap.get(id) || 0)
    });

    const allDbParts = (await client.query('SELECT * FROM parts ORDER BY id')).rows;

    // 2. Match 76 canonical parts to DB rows
    // Step A: Priority match by exact shrp_part_code / part_code
    const canonicalMatches = [];
    const claimedDbIds = new Set();

    for (const p of EXCEL_PARTS) {
      const [shrpCode, custPartNo] = p;
      const cleanCode = shrpCode || custPartNo;

      // 1. First priority: match exact shrp_part_code or part_code == shrpCode
      let matches = allDbParts.filter(r => !claimedDbIds.has(r.id) && (
        (r.shrp_part_code && r.shrp_part_code.trim().toUpperCase() === shrpCode.trim().toUpperCase()) ||
        (r.part_code && r.part_code.trim().toUpperCase() === shrpCode.trim().toUpperCase())
      ));

      // 2. Second priority: match customer_part_no or part_code == custPartNo
      if (matches.length === 0) {
        matches = allDbParts.filter(r => !claimedDbIds.has(r.id) && (
          (r.customer_part_no && r.customer_part_no.trim().toUpperCase() === custPartNo.trim().toUpperCase()) ||
          (r.part_code && r.part_code.trim().toUpperCase() === custPartNo.trim().toUpperCase()) ||
          (r.part_name && r.part_name.trim().toUpperCase() === custPartNo.trim().toUpperCase())
        ));
      }

      if (matches.length === 0) {
        canonicalMatches.push({ excelPart: p, survivorId: null, duplicateIds: [] });
      } else {
        let bestRow = null;
        let bestScore = -1;

        for (const row of matches) {
          const stats = getPartLogStats(row.id);
          let score = stats.total > 0 ? (100000 + stats.total) : (row.active ? 1000 : 0);
          if (score > bestScore) {
            bestScore = score;
            bestRow = row;
          }
        }

        const duplicateRows = matches.filter(r => r.id !== bestRow.id);
        canonicalMatches.push({
          excelPart: p,
          survivorId: bestRow.id,
          duplicateIds: duplicateRows.map(r => r.id)
        });

        claimedDbIds.add(bestRow.id);
        duplicateRows.forEach(r => claimedDbIds.add(r.id));
      }
    }

    const obsoleteRows = allDbParts.filter(r => !claimedDbIds.has(r.id));

    // 3. Re-link foreign keys for duplicate rows with production records
    for (const match of canonicalMatches) {
      if (!match.survivorId || match.duplicateIds.length === 0) continue;
      for (const dupId of match.duplicateIds) {
        const stats = getPartLogStats(dupId);
        if (stats.total > 0) {
          if (stats.pe > 0) await client.query('UPDATE production_entries SET part_id = $1 WHERE part_id = $2', [match.survivorId, dupId]);
          if (stats.bg > 0) await client.query('UPDATE bags SET part_id = $1 WHERE part_id = $2', [match.survivorId, dupId]);
          if (stats.ma > 0) await client.query('UPDATE machine_assignments SET part_id = $1 WHERE part_id = $2', [match.survivorId, dupId]);
          if (stats.ms > 0) await client.query('UPDATE machine_sessions SET part_id = $1 WHERE part_id = $2', [match.survivorId, dupId]);
          if (stats.fpa > 0) await client.query('UPDATE fpa_submissions SET part_id = $1 WHERE part_id = $2', [match.survivorId, dupId]);
          if (stats.rw > 0) await client.query('UPDATE rework_log SET part_id = $1 WHERE part_id = $2', [match.survivorId, dupId]);
          if (stats.tal > 0) await client.query('UPDATE traceability_audit_log SET part_id = $1 WHERE part_id = $2', [match.survivorId, dupId]);
        }
      }
    }

    // 4. Delete secondary metadata references for non-survivor IDs
    const nonSurvivorIds = [];
    canonicalMatches.forEach(m => nonSurvivorIds.push(...m.duplicateIds));
    obsoleteRows.forEach(r => nonSurvivorIds.push(r.id));

    if (nonSurvivorIds.length > 0) {
      await client.query('DELETE FROM part_machines WHERE part_id = ANY($1)', [nonSurvivorIds]);
      await client.query('DELETE FROM mould_parts WHERE part_id = ANY($1)', [nonSurvivorIds]);
      await client.query('DELETE FROM part_files WHERE part_id = ANY($1)', [nonSurvivorIds]);
      await client.query('DELETE FROM part_recipes WHERE part_id = ANY($1)', [nonSurvivorIds]);
      await client.query('DELETE FROM part_critical_dimensions WHERE part_id = ANY($1)', [nonSurvivorIds]);
      await client.query('DELETE FROM part_process_parameters WHERE part_id = ANY($1)', [nonSurvivorIds]);
      await client.query('DELETE FROM packing_balance_pool WHERE part_id = ANY($1)', [nonSurvivorIds]);
      await client.query('DELETE FROM customer_delivery_milestones WHERE part_id = ANY($1)', [nonSurvivorIds]);
      await client.query('DELETE FROM master_production_schedules WHERE part_id = ANY($1)', [nonSurvivorIds]);
      await client.query('DELETE FROM production_plans WHERE part_id = ANY($1)', [nonSurvivorIds]);
      await client.query('DELETE FROM parts WHERE id = ANY($1)', [nonSurvivorIds]);
    }

    // 5. Update / Insert all 76 Canonical Survivor rows
    for (const match of canonicalMatches) {
      const [shrpCode, custPartNo, pWt, trimReq, inspReq, packReq, dispReq, tol, stdPack, cavity, shotWt, batchCode] = match.excelPart;
      const cleanCode = shrpCode || custPartNo;

      if (match.survivorId) {
        await client.query(`
          UPDATE parts SET
            part_code = $1,
            shrp_part_code = $2,
            customer_part_no = $3,
            part_name = $3,
            part_weight_g = $4,
            unit_weight_g = $5,
            shot_weight_g = $5,
            cavity_count = $6,
            standard_pack_qty = $7,
            tolerance_pct = $8,
            trim_required = $9,
            inspection_required = $10,
            packing_required = $11,
            dispatch_required = $12,
            batch_part_code = $13,
            active = TRUE
          WHERE id = $14
        `, [
          cleanCode, shrpCode, custPartNo, pWt, shotWt, cavity, stdPack, tol,
          trimReq, inspReq, packReq, dispReq, batchCode, match.survivorId
        ]);
      } else {
        await client.query(`
          INSERT INTO parts (
            part_code, shrp_part_code, customer_part_no, part_name,
            part_weight_g, unit_weight_g, shot_weight_g, cavity_count, standard_pack_qty,
            tolerance_pct, trim_required, inspection_required, packing_required, dispatch_required,
            batch_part_code, active, standard_cycle_time_sec
          ) VALUES ($1, $2, $3, $3, $4, $5, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE, 30)
        `, [
          cleanCode, shrpCode, custPartNo, pWt, shotWt, cavity, stdPack, tol,
          trimReq, inspReq, packReq, dispReq, batchCode
        ]);
      }
    }

    await client.query('COMMIT');
    const countRes = await client.query('SELECT count(*) FILTER (WHERE active) as active, count(*) as total FROM parts');
    console.log(`Clean sync complete! Active parts: ${countRes.rows[0].active} (Total: ${countRes.rows[0].total})`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error syncing parts:', err);
    throw err;
  } finally {
    client.release();
    if (closePool) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  syncParts(true).catch(() => process.exit(1));
}

module.exports = { syncParts, EXCEL_PARTS };
