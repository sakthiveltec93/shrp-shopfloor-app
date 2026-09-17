const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

const APPLY = process.argv.includes('--apply');
const DELETE_TEST_IDS = [58, 21, 42, 63, 38];

async function deletePartCascade(client, partId) {
  // 1. Find production entries
  const peRes = await client.query('SELECT id FROM production_entries WHERE part_id = $1', [partId]);
  const peIds = peRes.rows.map(r => r.id);
  if (peIds.length > 0) {
    await client.query('DELETE FROM reject_log WHERE production_entry_id = ANY($1)', [peIds]);
    await client.query('DELETE FROM downtime_log WHERE production_entry_id = ANY($1)', [peIds]);
    await client.query('DELETE FROM bag_reject_log WHERE entry_id = ANY($1)', [peIds]);
    await client.query('DELETE FROM production_entries WHERE id = ANY($1)', [peIds]);
  }

  // 2. Find bags
  const bagRes = await client.query('SELECT id FROM bags WHERE part_id = $1', [partId]);
  const bagIds = bagRes.rows.map(r => r.id);
  if (bagIds.length > 0) {
    await client.query('DELETE FROM trim_entries WHERE bag_id = ANY($1)', [bagIds]);
    await client.query('DELETE FROM inspection_entries WHERE bag_id = ANY($1)', [bagIds]);
    await client.query('DELETE FROM packing_entries WHERE bag_id = ANY($1)', [bagIds]);
    await client.query('DELETE FROM dispatch_entries WHERE bag_id = ANY($1)', [bagIds]);
    await client.query('DELETE FROM traceability_audit_log WHERE bag_id = ANY($1)', [bagIds]);
    await client.query('DELETE FROM bag_status_history WHERE bag_id = ANY($1)', [bagIds]);
    await client.query('DELETE FROM bag_hold_log WHERE bag_id = ANY($1)', [bagIds]);
    await client.query('DELETE FROM packing_balance_pool WHERE bag_id = ANY($1)', [bagIds]);
    await client.query('DELETE FROM rework_log WHERE bag_id = ANY($1)', [bagIds]);
    await client.query('DELETE FROM bag_reject_log WHERE bag_id = ANY($1)', [bagIds]);
    await client.query('DELETE FROM bags WHERE id = ANY($1)', [bagIds]);
  }

  // 3. Machine sessions & assignments
  await client.query('DELETE FROM machine_sessions WHERE part_id = $1', [partId]);
  await client.query('DELETE FROM machine_assignments WHERE part_id = $1', [partId]);

  // 4. Other part-specific child tables
  await client.query('DELETE FROM traceability_audit_log WHERE part_id = $1', [partId]);
  await client.query('DELETE FROM packing_balance_pool WHERE part_id = $1', [partId]);
  await client.query('DELETE FROM rework_log WHERE part_id = $1', [partId]);
  await client.query('DELETE FROM customer_delivery_milestones WHERE part_id = $1', [partId]);
  await client.query('DELETE FROM master_production_schedules WHERE part_id = $1', [partId]);
  await client.query('DELETE FROM production_plans WHERE part_id = $1', [partId]);
  await client.query('DELETE FROM fpa_submissions WHERE part_id = $1', [partId]);
  await client.query('DELETE FROM part_process_parameters WHERE part_id = $1', [partId]);
  await client.query('DELETE FROM part_critical_dimensions WHERE part_id = $1', [partId]);
  await client.query('DELETE FROM part_machines WHERE part_id = $1', [partId]);
  await client.query('DELETE FROM mould_parts WHERE part_id = $1', [partId]);
  await client.query('DELETE FROM part_files WHERE part_id = $1', [partId]);
  await client.query('DELETE FROM part_recipes WHERE part_id = $1', [partId]);

  // 5. Delete part
  await client.query('DELETE FROM parts WHERE id = $1', [partId]);
}

async function main() {
  console.log('======================================================================');
  console.log(' AUDIT AND CLEAN DUPLICATE PARTS');
  console.log(APPLY ? ' Mode: APPLY (EXECUTING REAL WRITES IN TRANSACTION)' : ' Mode: DRY RUN (REPORT-ONLY, ZERO WRITES)');
  console.log('======================================================================\n');

  const client = await pool.connect();
  try {
    if (APPLY) {
      await client.query('BEGIN');
    }

    // 1. First, handle explicitly confirmed test log deletion for IDs [58, 21, 42, 63, 38]
    console.log('--- STEP 1: USER-CONFIRMED TEST DATA CLEANUP FOR IDs [58, 21, 42, 63, 38] ---');
    for (const testId of DELETE_TEST_IDS) {
      const pe = await client.query('SELECT count(*) FROM production_entries WHERE part_id = $1', [testId]);
      const pb = await client.query('SELECT count(*) FROM bags WHERE part_id = $1', [testId]);
      const ma = await client.query('SELECT count(*) FROM machine_assignments WHERE part_id = $1', [testId]);
      const ms = await client.query('SELECT count(*) FROM machine_sessions WHERE part_id = $1', [testId]);
      
      console.log(`Part ID ${testId}: prod_entries=${pe.rows[0].count}, bags=${pb.rows[0].count}, assignments=${ma.rows[0].count}, sessions=${ms.rows[0].count}`);

      if (APPLY) {
        await deletePartCascade(client, testId);
        console.log(`  -> Hard-deleted Part ID ${testId} and all associated test records.`);
      } else {
        console.log(`  -> [WOULD DELETE] Part ID ${testId} and associated test records.`);
      }
    }

    // Also clean test log from id 8989 if present
    if (APPLY) {
      await deletePartCascade(client, 8989);
    }

    console.log('\n--- STEP 2: CLUSTER AUDIT ACROSS REMAINING PARTS ---');
    const query = `
      SELECT 
        p.id, p.part_code, p.shrp_part_code, p.customer_part_no, p.part_name,
        p.active, p.cavity_count, p.part_weight_g, p.unit_weight_g, p.standard_pack_qty,
        p.notes,
        (SELECT count(*) FROM production_entries pe WHERE pe.part_id = p.id) AS prod_count,
        (SELECT count(*) FROM bags b WHERE b.part_id = p.id) AS bag_count,
        (SELECT count(*) FROM machine_assignments ma WHERE ma.part_id = p.id) AS assign_count,
        (SELECT count(*) FROM packing_balance_pool pbp WHERE pbp.part_id = p.id) AS pool_count
      FROM parts p
      ${APPLY ? '' : 'WHERE p.id NOT IN (58, 21, 42, 63, 38, 8989)'}
      ORDER BY p.id ASC;
    `;

    const { rows: allParts } = await client.query(query);
    console.log(`Total remaining parts to evaluate: ${allParts.length}`);

    const clusters = [];
    const visitedIds = new Set();

    for (let i = 0; i < allParts.length; i++) {
      const p1 = allParts[i];
      if (visitedIds.has(p1.id)) continue;

      const cluster = [p1];
      visitedIds.add(p1.id);

      for (let j = i + 1; j < allParts.length; j++) {
        const p2 = allParts[j];
        if (visitedIds.has(p2.id)) continue;

        const p1Code = (p1.part_code || '').trim().toUpperCase();
        const p2Code = (p2.part_code || '').trim().toUpperCase();
        const p1Cust = (p1.customer_part_no || '').trim().toUpperCase();
        const p2Cust = (p2.customer_part_no || '').trim().toUpperCase();
        const p1Shrp = (p1.shrp_part_code || '').trim().toUpperCase();
        const p2Shrp = (p2.shrp_part_code || '').trim().toUpperCase();

        let isDup = false;

        if (p1Code && p1Code === p2Code) {
          isDup = true;
        } else if (p1Cust && p1Cust === p2Cust && p1Shrp && p1Shrp === p2Shrp) {
          isDup = true;
        } else if (p1Code && p1Code === p2Cust && (!p1Shrp || p1Shrp === p2Shrp || p2Code.includes(p1Shrp))) {
          isDup = true;
        } else if (p2Code && p2Code === p1Cust && (!p2Shrp || p2Shrp === p1Shrp || p1Code.includes(p2Shrp))) {
          isDup = true;
        }

        if (p1Shrp && p2Shrp && p1Shrp !== p2Shrp) {
          isDup = false;
        }

        if (isDup) {
          cluster.push(p2);
          visitedIds.add(p2.id);
        }
      }

      if (cluster.length > 1) {
        clusters.push(cluster);
      }
    }

    console.log(`Found ${clusters.length} remaining duplicate cluster(s).\n`);

    let totalDeleted = 0;
    let totalDeactivated = 0;

    for (const cluster of clusters) {
      const scored = cluster.map(p => {
        const historyCount = Number(p.prod_count) + Number(p.bag_count) + Number(p.assign_count) + Number(p.pool_count);
        const specCompleteness = [p.cavity_count > 1 ? 1 : 0, p.part_weight_g > 0 ? 1 : 0, p.shrp_part_code ? 1 : 0, p.customer_part_no ? 1 : 0].reduce((a, b) => a + b, 0);
        return {
          part: p,
          historyCount,
          score: [
            historyCount > 0 ? 1000 + historyCount : 0,
            p.active ? 100 : 0,
            specCompleteness * 10,
            -p.id
          ]
        };
      });

      scored.sort((a, b) => {
        for (let idx = 0; idx < a.score.length; idx++) {
          if (a.score[idx] !== b.score[idx]) return b.score[idx] - a.score[idx];
        }
        return 0;
      });

      const survivor = scored[0].part;
      const losers = scored.slice(1);

      console.log('----------------------------------------------------------------------');
      console.log(`CLUSTER: Survivor: id=${survivor.id} | part_code="${survivor.part_code}" | shrp_code="${survivor.shrp_part_code || ''}" | cust_no="${survivor.customer_part_no || ''}" | active=${survivor.active}`);

      for (const item of losers) {
        const p = item.part;
        const hist = item.historyCount;
        const label = `id=${p.id} | part_code="${p.part_code}" | shrp_code="${p.shrp_part_code || ''}" | cust_no="${p.customer_part_no || ''}" | active=${p.active}`;

        if (hist === 0) {
          totalDeleted++;
          if (!APPLY) {
            console.log(`  >>> [WOULD DELETE] ${label} (0 history logs)`);
          } else {
            await deletePartCascade(client, p.id);
            console.log(`  >>> [DELETED]      ${label}`);
          }
        } else {
          totalDeactivated++;
          if (!APPLY) {
            console.log(`  >>> [WOULD DEACTIVATE] ${label} (History: ${hist} logs)`);
          } else {
            await client.query('UPDATE parts SET active = FALSE WHERE id = $1', [p.id]);
            console.log(`  >>> [DEACTIVATED]  ${label}`);
          }
        }
      }
    }

    if (APPLY) {
      await client.query('COMMIT');
      console.log('\n=======================================================================');
      console.log(' SUCCESS: All test data and duplicate rows cleaned up atomically!');
      console.log(` Deleted confirmed test parts: ${DELETE_TEST_IDS.length}`);
      console.log(` Deleted zero-history duplicate parts: ${totalDeleted}`);
      console.log(` Deactivated parts with history: ${totalDeactivated}`);
      console.log('=======================================================================');
    } else {
      console.log('\n=======================================================================');
      console.log(' DRY-RUN FINISHED (Zero writes were executed)');
      console.log(` Test parts to delete: ${DELETE_TEST_IDS.length}`);
      console.log(` Zero-history duplicates to delete: ${totalDeleted}`);
      console.log(` Duplicates to deactivate: ${totalDeactivated}`);
      console.log(' Run with --apply to execute these changes.');
      console.log('=======================================================================');
    }
  } catch (err) {
    if (APPLY) {
      await client.query('ROLLBACK');
    }
    console.error('Error during cleanup:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
