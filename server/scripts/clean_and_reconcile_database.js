const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');
const { EXCEL_PARTS } = require('../db/clean_parts');

const APPLY = process.argv.includes('--apply');

async function main() {
  console.log('======================================================================');
  console.log(' DATABASE PARTS CLEANUP & CANONICAL RECONCILIATION');
  console.log(APPLY ? ' Mode: APPLY (EXECUTING IN TRANSACTION)' : ' Mode: DRY RUN (REPORT ONLY)');
  console.log('======================================================================\n');

  const client = await pool.connect();
  try {
    if (APPLY) await client.query('BEGIN');

    // 1. Initial State
    const totalPartsPre = await client.query('SELECT count(*) as total, count(*) FILTER (WHERE active) as active FROM parts');
    const prodsPre = await client.query('SELECT count(*) as total FROM production_entries');
    const bagsPre = await client.query('SELECT count(*) as total FROM bags');
    const maPre = await client.query('SELECT count(*) as total FROM machine_assignments');
    const msPre = await client.query('SELECT count(*) as total FROM machine_sessions');
    const fpaPre = await client.query('SELECT count(*) as total FROM fpa_submissions');

    console.log('Initial Database State:');
    console.log(`  Parts Total: ${totalPartsPre.rows[0].total} (Active: ${totalPartsPre.rows[0].active})`);
    console.log(`  Production Entries: ${prodsPre.rows[0].total}`);
    console.log(`  Bags: ${bagsPre.rows[0].total}`);
    console.log(`  Machine Assignments: ${maPre.rows[0].total}`);
    console.log(`  Machine Sessions: ${msPre.rows[0].total}`);
    console.log(`  FPA Submissions: ${fpaPre.rows[0].total}\n`);

    // Pre-fetch all counts in batch
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

    // 2. Fetch all existing parts
    const allDbParts = await client.query('SELECT * FROM parts ORDER BY id');
    console.log(`Fetched ${allDbParts.rows.length} rows from parts table.`);

    // 3. Match 76 canonical parts to DB rows
    const canonicalMatches = [];
    const claimedDbIds = new Set();

    for (const p of EXCEL_PARTS) {
      const [shrpCode, custPartNo, pWt, trimReq, inspReq, packReq, dispReq, tol, stdPack, cavity, shotWt, batchCode] = p;
      const cleanCode = shrpCode || custPartNo;

      const matchingRows = allDbParts.rows.filter(r => {
        const shrpMatch = r.shrp_part_code && (r.shrp_part_code.trim().toUpperCase() === shrpCode.trim().toUpperCase());
        const custMatch = r.customer_part_no && (r.customer_part_no.trim().toUpperCase() === custPartNo.trim().toUpperCase());
        const codeMatch = r.part_code && (
          r.part_code.trim().toUpperCase() === cleanCode.trim().toUpperCase() ||
          r.part_code.trim().toUpperCase() === shrpCode.trim().toUpperCase() ||
          r.part_code.trim().toUpperCase() === custPartNo.trim().toUpperCase()
        );
        const nameMatch = r.part_name && (
          r.part_name.trim().toUpperCase() === shrpCode.trim().toUpperCase() ||
          r.part_name.trim().toUpperCase() === custPartNo.trim().toUpperCase()
        );
        return shrpMatch || custMatch || codeMatch || nameMatch;
      });

      if (matchingRows.length === 0) {
        console.warn(`WARNING: No DB row found for canonical part: ${shrpCode} / ${custPartNo}`);
        canonicalMatches.push({
          excelPart: p,
          survivorId: null,
          duplicateIds: []
        });
      } else {
        let bestRow = null;
        let bestScore = -1;

        for (const row of matchingRows) {
          const stats = getPartLogStats(row.id);
          let score = stats.total > 0 ? (100000 + stats.total) : (row.active ? 1000 : 0);
          
          if (score > bestScore) {
            bestScore = score;
            bestRow = row;
          }
        }

        const duplicateRows = matchingRows.filter(r => r.id !== bestRow.id);
        canonicalMatches.push({
          excelPart: p,
          survivorId: bestRow.id,
          duplicateIds: duplicateRows.map(r => r.id)
        });

        claimedDbIds.add(bestRow.id);
        duplicateRows.forEach(r => claimedDbIds.add(r.id));
      }
    }

    console.log(`Matched ${canonicalMatches.filter(m => m.survivorId !== null).length} / 76 canonical parts.`);
    
    const obsoleteRows = allDbParts.rows.filter(r => !claimedDbIds.has(r.id));
    console.log(`Identified ${obsoleteRows.length} obsolete/unmatched part rows.`);

    // 4. Re-link foreign keys for duplicate rows
    console.log('\n--- Step 4: Re-linking Duplicate Parts to Canonical Survivors ---');
    let reLinkedCount = 0;
    for (const match of canonicalMatches) {
      if (!match.survivorId || match.duplicateIds.length === 0) continue;
      for (const dupId of match.duplicateIds) {
        const stats = getPartLogStats(dupId);
        if (stats.total > 0) {
          console.log(`  Re-linking Dup ID ${dupId} -> Survivor ID ${match.survivorId} (${match.excelPart[0]} / ${match.excelPart[1]}): ` +
            `pe=${stats.pe}, bg=${stats.bg}, ma=${stats.ma}, ms=${stats.ms}, fpa=${stats.fpa}, rw=${stats.rw}, tal=${stats.tal}`);
          
          if (APPLY) {
            if (stats.pe > 0) await client.query('UPDATE production_entries SET part_id = $1 WHERE part_id = $2', [match.survivorId, dupId]);
            if (stats.bg > 0) await client.query('UPDATE bags SET part_id = $1 WHERE part_id = $2', [match.survivorId, dupId]);
            if (stats.ma > 0) await client.query('UPDATE machine_assignments SET part_id = $1 WHERE part_id = $2', [match.survivorId, dupId]);
            if (stats.ms > 0) await client.query('UPDATE machine_sessions SET part_id = $1 WHERE part_id = $2', [match.survivorId, dupId]);
            if (stats.fpa > 0) await client.query('UPDATE fpa_submissions SET part_id = $1 WHERE part_id = $2', [match.survivorId, dupId]);
            if (stats.rw > 0) await client.query('UPDATE rework_log SET part_id = $1 WHERE part_id = $2', [match.survivorId, dupId]);
            if (stats.tal > 0) await client.query('UPDATE traceability_audit_log SET part_id = $1 WHERE part_id = $2', [match.survivorId, dupId]);
          }
          reLinkedCount++;
        }
      }
    }
    console.log(`Re-linked ${reLinkedCount} duplicate clusters with active production records.`);

    // Check if any obsolete rows have production logs
    console.log('\n--- Checking Obsolete Rows for Production Logs ---');
    for (const obs of obsoleteRows) {
      const stats = getPartLogStats(obs.id);
      if (stats.total > 0) {
        console.warn(`WARNING: Obsolete part ID ${obs.id} (${obs.part_code}) has ${stats.total} records (pe=${stats.pe}, bg=${stats.bg})!`);
      }
    }

    const nonSurvivorIds = [];
    canonicalMatches.forEach(m => nonSurvivorIds.push(...m.duplicateIds));
    obsoleteRows.forEach(r => nonSurvivorIds.push(r.id));

    console.log(`\n--- Step 5: Deleting Secondary Metadata References for ${nonSurvivorIds.length} Non-Survivor Part IDs ---`);
    if (APPLY && nonSurvivorIds.length > 0) {
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
      console.log('Secondary metadata references cleared.');
    }

    console.log(`\n--- Step 6: Hard-Deleting ${nonSurvivorIds.length} Non-Survivor Part Rows ---`);
    if (APPLY && nonSurvivorIds.length > 0) {
      const delRes = await client.query('DELETE FROM parts WHERE id = ANY($1)', [nonSurvivorIds]);
      console.log(`Deleted ${delRes.rowCount} non-survivor rows from parts table.`);
    }

    console.log('\n--- Step 7: Updating / Inserting Exactly 76 Canonical Parts ---');
    for (const match of canonicalMatches) {
      const [shrpCode, custPartNo, pWt, trimReq, inspReq, packReq, dispReq, tol, stdPack, cavity, shotWt, batchCode] = match.excelPart;
      const cleanCode = shrpCode || custPartNo;

      if (APPLY) {
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
    }

    if (APPLY) {
      await client.query('COMMIT');
      console.log('\nTransaction COMMITTED successfully.');
    } else {
      console.log('\nDRY RUN complete. No changes made to database.');
    }

    const totalPartsPost = await client.query('SELECT count(*) as total, count(*) FILTER (WHERE active) as active FROM parts');
    const prodsPost = await client.query('SELECT count(*) as total FROM production_entries');
    const bagsPost = await client.query('SELECT count(*) as total FROM bags');
    const maPost = await client.query('SELECT count(*) as total FROM machine_assignments');
    const msPost = await client.query('SELECT count(*) as total FROM machine_sessions');
    const fpaPost = await client.query('SELECT count(*) as total FROM fpa_submissions');

    console.log('\nFinal Database State:');
    console.log(`  Parts Total: ${totalPartsPost.rows[0].total} (Active: ${totalPartsPost.rows[0].active})`);
    console.log(`  Production Entries: ${prodsPost.rows[0].total} (Pre: ${prodsPre.rows[0].total})`);
    console.log(`  Bags: ${bagsPost.rows[0].total} (Pre: ${bagsPre.rows[0].total})`);
    console.log(`  Machine Assignments: ${maPost.rows[0].total} (Pre: ${maPre.rows[0].total})`);
    console.log(`  Machine Sessions: ${msPost.rows[0].total} (Pre: ${msPre.rows[0].total})`);
    console.log(`  FPA Submissions: ${fpaPost.rows[0].total} (Pre: ${fpaPre.rows[0].total})`);

  } catch (err) {
    if (APPLY) await client.query('ROLLBACK');
    console.error('Error during cleanup:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
