const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');
const wb = XLSX.readFile(formFile);

const APPLY = process.argv.includes('--apply');

function convertOADate(val) {
  const num = parseFloat(val);
  if (!isNaN(num) && num > 40000 && num < 60000) {
    const epoch = new Date(1899, 11, 30);
    const d = new Date(epoch.getTime() + num * 86400000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) {
    return val.slice(0, 10);
  }
  return '2026-09-01';
}

function parseSheetDynamic(sheetName, keyHeaders = []) {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return null;
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (raw.length === 0) return { headers: [], rows: [] };

  const headerIdx = raw.findIndex(row => {
    const filled = row.filter(c => c !== '' && c !== null && c !== undefined);
    if (filled.length < 2) return false;
    if (keyHeaders.length > 0) {
      const rowStr = row.map(c => String(c).trim().toLowerCase());
      const matchCount = keyHeaders.filter(eh => rowStr.includes(eh.toLowerCase())).length;
      return matchCount >= Math.min(2, keyHeaders.length);
    }
    return filled.length > row.length / 3;
  });

  if (headerIdx === -1) return { headers: [], rows: [] };

  const headers = raw[headerIdx].map(h => String(h).trim());
  const colIndex = (name) => {
    const target = name.trim().toLowerCase();
    let idx = headers.findIndex(h => h.toLowerCase() === target);
    if (idx !== -1) return idx;
    idx = headers.findIndex(h => h.toLowerCase().includes(target));
    return idx;
  };

  const dataRows = raw.slice(headerIdx + 1).filter(r => r.some(c => c !== ''));
  return { headers, colIndex, dataRows };
}

async function main() {
  console.log('======================================================================');
  console.log(' AUTHORITATIVE DYNAMIC HISTORICAL IMPORT: FORM ENTRY 26-271.xlsm');
  console.log(APPLY ? ' Mode: APPLY (WRITING TO DATABASE)' : ' Mode: DRY RUN (REPORT ONLY)');
  console.log('======================================================================\n');

  const client = await pool.connect();
  try {
    if (APPLY) await client.query('BEGIN');

    // 1. Master Lookups
    const parts = (await client.query('SELECT id, part_code, shrp_part_code, customer_part_no FROM parts')).rows;
    const machines = (await client.query('SELECT id, machine_code FROM machines')).rows;
    const users = (await client.query('SELECT id, username, full_name FROM users')).rows;
    const checkItems = (await client.query('SELECT id, item_name, category FROM check_items')).rows;

    const findPartId = (str) => {
      if (!str) return null;
      const s = String(str).trim().toLowerCase();
      const p = parts.find(p =>
        (p.shrp_part_code && p.shrp_part_code.trim().toLowerCase() === s) ||
        (p.customer_part_no && p.customer_part_no.trim().toLowerCase() === s) ||
        (p.part_code && p.part_code.trim().toLowerCase() === s)
      );
      return p ? p.id : null;
    };

    const findMachineId = (str) => {
      if (!str) return null;
      const s = String(str).replace(/\s+/g, '').toLowerCase();
      const m = machines.find(m => m.machine_code.replace(/\s+/g, '').toLowerCase() === s);
      return m ? m.id : null;
    };

    const findCheckItemId = (str, category) => {
      if (!str) return null;
      const s = String(str).replace(/[\s\-_]+/g, '').toLowerCase();
      const item = checkItems.find(c => 
        c.category === category &&
        c.item_name.replace(/[\s\-_]+/g, '').toLowerCase() === s
      );
      return item ? item.id : null;
    };

    const getOrCreateUserId = async (opName) => {
      if (!opName) return 1;
      const s = String(opName).trim();
      const found = users.find(u =>
        u.username.toLowerCase() === s.toLowerCase() ||
        u.full_name.toLowerCase() === s.toLowerCase() ||
        u.full_name.toLowerCase().includes(s.toLowerCase())
      );
      if (found) return found.id;

      if (APPLY) {
        const pinHash = '$2a$10$CYFec7XoshX6gdF.BNOKaO3KrW3OB29KzhybN5r3deZ8A1y1UUxmq';
        const ins = await client.query(
          'INSERT INTO users (username, full_name, pin_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name RETURNING id',
          [s.toLowerCase().replace(/[^a-z0-9]/g, '_'), s, pinHash, 'operator']
        );
        const newId = ins.rows[0].id;
        users.push({ id: newId, username: s.toLowerCase().replace(/[^a-z0-9]/g, '_'), full_name: s });
        return newId;
      }
      return 1;
    };

    // -----------------------------------------------------------------
    // 1. PRODUCTION_LOG -> production_entries
    // -----------------------------------------------------------------
    console.log('--- 1. Importing PRODUCTION_LOG ---');
    const pParsed = parseSheetDynamic('PRODUCTION_LOG', ['Production Date', 'Machine', 'Part No']);
    const pCol = pParsed.colIndex;
    const pRows = pParsed.dataRows;

    const existingPe = (await client.query(`
      SELECT id, machine_id, part_id, entry_date::text, shift, start_count, end_count, good_qty, reject_qty
      FROM production_entries
    `)).rows;

    let peInserted = 0;
    let peSkipped = 0;
    const peCreatedMap = new Map(); // key -> pe_id

    for (let i = 0; i < pRows.length; i++) {
      const r = pRows[i];
      const dateStr = convertOADate(r[pCol('production date')]);
      const shift = String(r[pCol('shift')] || 'A').trim().toUpperCase();
      const machStr = String(r[pCol('machine')] || '').trim();
      const partStr = String(r[pCol('part no')] || r[pCol('part name')] || '').trim();
      const opStr = String(r[pCol('operator')] || '').trim();

      const machId = findMachineId(machStr);
      const partId = findPartId(partStr);

      if (!machId || !partId) {
        continue;
      }

      const opUserId = await getOrCreateUserId(opStr);
      const startCnt = Number(r[pCol('start mach count')]) || 0;
      const endCnt = Number(r[pCol('end mach count')]) || 0;
      const prodQty = Number(r[pCol('production qty')]) || 0;
      const rejQty = Number(r[pCol('reject qty')]) || 0;
      const goodQty = (prodQty >= rejQty) ? (prodQty - rejQty) : prodQty;
      const downtimeMin = Number(r[pCol('downtime minutes')]) || 0;
      const remarks = String(r[pCol('remarks')] || '').trim();
      const hourSlot = (i % 12) + 1;

      const matchedExisting = existingPe.find(e =>
        e.machine_id === machId &&
        e.part_id === partId &&
        e.entry_date.slice(0, 10) === dateStr &&
        e.shift === shift &&
        ((e.start_count === startCnt && e.end_count === endCnt) || (e.good_qty === goodQty && e.reject_qty === rejQty))
      );

      const peKey = `${dateStr}_${machId}_${partId}_${shift}`;

      if (matchedExisting) {
        peSkipped++;
        peCreatedMap.set(peKey, matchedExisting.id);
      } else {
        if (APPLY) {
          const insRes = await client.query(`
            INSERT INTO production_entries (
              machine_id, part_id, operator_user_id, shift, entry_date, hour_slot,
              start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id
          `, [
            machId, partId, opUserId, shift, dateStr, hourSlot,
            startCnt, endCnt, goodQty, rejQty, downtimeMin, remarks
          ]);
          peCreatedMap.set(peKey, insRes.rows[0].id);
        }
        peInserted++;
      }
    }
    console.log(`PRODUCTION_LOG: ${peInserted} inserted, ${peSkipped} existing skipped.`);

    // -----------------------------------------------------------------
    // 2. BAG_LOG -> bags
    // -----------------------------------------------------------------
    console.log('\n--- 2. Importing BAG_LOG ---');
    const bParsed = parseSheetDynamic('BAG_LOG', ['Batch No', 'Part', 'Bag Barcode']);
    const bCol = bParsed.colIndex;
    const bRows = bParsed.dataRows;

    let bagInserted = 0;
    let bagUpdated = 0;

    for (let i = 0; i < bRows.length; i++) {
      const r = bRows[i];
      const bagCode = String(r[bCol('bag barcode')] || '').trim();
      if (!bagCode) continue;

      const dateStr = convertOADate(r[bCol('entry date')] || r[bCol('date')]);
      const machStr = String(r[bCol('machine')] || '').trim();
      const batchNo = String(r[bCol('batch no')] || '').trim();
      const partStr = String(r[bCol('part no')] || r[bCol('part')] || '').trim();
      const opStr = String(r[bCol('operator')] || '').trim();
      const rawType = String(r[bCol('bag type')] || 'PART').trim().toUpperCase();
      let bagType = 'PART';
      if (rawType.includes('RUNNER')) bagType = 'RUNNER';
      else if (rawType.includes('REJ')) bagType = 'REJECTION';
      else if (rawType.includes('LUMP')) bagType = 'LUMP';
      else if (rawType.includes('SCRAP')) bagType = 'SCRAP';

      const weightKg = Number(r[bCol('weight kg')] || r[bCol('gross weight')]) || 0;
      const qty = Number(r[bCol('approx qty')] || r[bCol('pieces')]) || 0;
      const rawStatus = String(r[bCol('status')] || 'OPEN').trim().toUpperCase();
      const status = ['OPEN', 'PARTIAL_TRIM', 'TRIMMED', 'PARTIAL_INSPECT', 'INSPECTED', 'PACKED', 'DISPATCHED', 'HOLD', 'SCRAPPED', 'REWORK_DONE'].includes(rawStatus)
        ? rawStatus
        : 'OPEN';
      const withRunner = String(r[bCol('with runner')] || '').toLowerCase().includes('yes');
      const remarks = String(r[bCol('remarks')] || '').trim();

      const shiftMatch = batchNo.match(/([AB])$/);
      const shift = shiftMatch ? shiftMatch[1] : 'A';

      const machId = findMachineId(machStr) || 1;
      const partId = findPartId(partStr);

      if (!partId) continue;
      const opUserId = await getOrCreateUserId(opStr);

      if (APPLY) {
        const res = await client.query(`
          INSERT INTO bags (
            bag_code, batch_no, entry_date, shift, machine_id, part_id,
            bag_type, base_weight_kg, qty, operator_user_id, status, weighed_with_runner, remarks, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::timestamptz)
          ON CONFLICT (bag_code) DO UPDATE SET
            status = EXCLUDED.status,
            base_weight_kg = CASE WHEN bags.base_weight_kg = 0 THEN EXCLUDED.base_weight_kg ELSE bags.base_weight_kg END,
            qty = CASE WHEN bags.qty = 0 THEN EXCLUDED.qty ELSE bags.qty END,
            remarks = COALESCE(NULLIF(EXCLUDED.remarks, ''), bags.remarks)
          RETURNING (xmax = 0) AS is_insert
        `, [
          bagCode, batchNo, dateStr, shift, machId, partId,
          bagType, weightKg, qty, opUserId, status, withRunner, remarks, `${dateStr} 09:30:00+05:30`
        ]);

        if (res.rows[0].is_insert) bagInserted++;
        else bagUpdated++;
      } else {
        bagInserted++;
      }
    }
    console.log(`BAG_LOG: ${bagInserted} inserted, ${bagUpdated} updated.`);

    // -----------------------------------------------------------------
    // 3. TRIM_LOG -> trim_entries
    // -----------------------------------------------------------------
    console.log('\n--- 3. Importing TRIM_LOG ---');
    const tParsed = parseSheetDynamic('TRIM_LOG', ['Batch No', 'Part', 'Operator']);
    const tCol = tParsed.colIndex;
    const tRows = tParsed.dataRows;

    let trimInserted = 0;
    let trimSkipped = 0;

    for (const r of tRows) {
      const bagBarcode = String(r[tCol('batch no')] || '').trim();
      if (!bagBarcode) continue;

      const dateStr = convertOADate(r[tCol('date')]);
      const opStr = String(r[tCol('operator')] || '').trim();
      const opUserId = await getOrCreateUserId(opStr);
      const weight = Number(r[tCol('weight')]) || 0;
      const runnerWt = Number(r[tCol('runner wt')]) || 0;
      const rejectQty = Number(r[tCol('reject qty')]) || 0;
      const isPartial = String(r[tCol('entry type')] || '').toUpperCase() === 'PARTIAL';

      if (APPLY) {
        const bagRes = await client.query('SELECT id FROM bags WHERE bag_code = $1', [bagBarcode]);
        if (bagRes.rows.length === 0) {
          trimSkipped++;
          continue;
        }
        const bagId = bagRes.rows[0].id;

        const exists = await client.query(
          'SELECT 1 FROM trim_entries WHERE bag_id = $1 AND (trimmed_wt_kg = $2 OR created_at::date = $3::date)',
          [bagId, weight, dateStr]
        );

        if (exists.rows.length === 0) {
          await client.query(`
            INSERT INTO trim_entries (
              bag_id, trimmed_wt_kg, runner_wt_kg, reject_wt_kg, remaining_wt_kg,
              is_partial, operator_user_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz)
          `, [bagId, weight, runnerWt, rejectQty, weight, isPartial, opUserId, `${dateStr} 10:00:00+05:30`]);
          trimInserted++;
        } else {
          trimSkipped++;
        }
      } else {
        trimInserted++;
      }
    }
    console.log(`TRIM_LOG: ${trimInserted} inserted, ${trimSkipped} skipped.`);

    // -----------------------------------------------------------------
    // 4. INSPECTION_LOG -> inspection_entries
    // -----------------------------------------------------------------
    console.log('\n--- 4. Importing INSPECTION_LOG ---');
    const iParsed = parseSheetDynamic('INSPECTION_LOG', ['Batch No', 'Part', 'Accept Weight']);
    const iCol = iParsed.colIndex;
    const iRows = iParsed.dataRows;

    let inspInserted = 0;
    let inspSkipped = 0;

    for (const r of iRows) {
      const bagBarcode = String(r[iCol('batch no')] || '').trim();
      if (!bagBarcode) continue;

      const dateStr = convertOADate(r[iCol('date')]);
      const opStr = String(r[iCol('operator')] || '').trim();
      const opUserId = await getOrCreateUserId(opStr);
      const acceptWt = Number(r[iCol('accept weight')]) || 0;
      const rejectWt = Number(r[iCol('reject weight')]) || 0;
      const isPartial = String(r[iCol('entry type')] || '').toUpperCase() === 'PARTIAL';

      if (APPLY) {
        const bagRes = await client.query('SELECT id FROM bags WHERE bag_code = $1', [bagBarcode]);
        if (bagRes.rows.length === 0) {
          inspSkipped++;
          continue;
        }
        const bagId = bagRes.rows[0].id;

        const exists = await client.query(
          'SELECT 1 FROM inspection_entries WHERE bag_id = $1 AND (inspected_wt_kg = $2 OR created_at::date = $3::date)',
          [bagId, acceptWt, dateStr]
        );

        if (exists.rows.length === 0) {
          await client.query(`
            INSERT INTO inspection_entries (
              bag_id, inspected_wt_kg, remaining_wt_kg, reject_wt_kg,
              is_partial, operator_user_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz)
          `, [bagId, acceptWt, acceptWt, rejectWt, isPartial, opUserId, `${dateStr} 11:00:00+05:30`]);
          inspInserted++;
        } else {
          inspSkipped++;
        }
      } else {
        inspInserted++;
      }
    }
    console.log(`INSPECTION_LOG: ${inspInserted} inserted, ${inspSkipped} skipped.`);

    // -----------------------------------------------------------------
    // 5. PACKING_LOG -> packing_entries
    // -----------------------------------------------------------------
    console.log('\n--- 5. Importing PACKING_LOG ---');
    const pkParsed = parseSheetDynamic('PACKING_LOG', ['Batch No', 'Part', 'Packets Packed']);
    const pkCol = pkParsed.colIndex;
    const pkRows = pkParsed.dataRows;

    let packInserted = 0;
    let packSkipped = 0;

    for (const r of pkRows) {
      const bagBarcode = String(r[pkCol('batch no')] || '').trim();
      if (!bagBarcode) continue;

      const dateStr = convertOADate(r[pkCol('date')]);
      const opStr = String(r[pkCol('operator')] || '').trim();
      const opUserId = await getOrCreateUserId(opStr);
      const packedQty = Number(r[pkCol('packed qty')]) || 0;
      const packedWt = Number(r[pkCol('packed weight')]) || 0;
      const samplePacketWt = Number(r[pkCol('actual packet wt')]) || 0;
      const packetsCount = Number(r[pkCol('packets packed')]) || 1;
      const balanceQty = Number(r[pkCol('balance qty')]) || 0;

      if (APPLY) {
        const bagRes = await client.query('SELECT id FROM bags WHERE bag_code = $1', [bagBarcode]);
        if (bagRes.rows.length === 0) {
          packSkipped++;
          continue;
        }
        const bagId = bagRes.rows[0].id;

        const exists = await client.query(
          'SELECT 1 FROM packing_entries WHERE bag_id = $1 AND (packed_qty = $2 OR created_at::date = $3::date)',
          [bagId, packedQty, dateStr]
        );

        if (exists.rows.length === 0) {
          await client.query(`
            INSERT INTO packing_entries (
              bag_id, packed_qty, packed_wt_kg, sample_packet_wt_g,
              packets_count, balance_qty, operator_user_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz)
          `, [bagId, packedQty, packedWt, samplePacketWt, packetsCount, balanceQty, opUserId, `${dateStr} 12:00:00+05:30`]);
          packInserted++;
        } else {
          packSkipped++;
        }
      } else {
        packInserted++;
      }
    }
    console.log(`PACKING_LOG: ${packInserted} inserted, ${packSkipped} skipped.`);

    // -----------------------------------------------------------------
    // 6. PRODUCTION_REJECT_LOG -> reject_log
    // -----------------------------------------------------------------
    console.log('\n--- 6. Importing PRODUCTION_REJECT_LOG ---');
    const rejParsed = parseSheetDynamic('PRODUCTION_REJECT_LOG', ['Date', 'Machine', 'Part', 'Reason']);
    if (rejParsed && rejParsed.dataRows.length > 0) {
      const rCol = rejParsed.colIndex;
      let rejInserted = 0;
      let rejSkipped = 0;

      for (const r of rejParsed.dataRows) {
        const dateStr = convertOADate(r[rCol('date')]);
        const machId = findMachineId(r[rCol('machine')]);
        const partId = findPartId(r[rCol('part')]);
        const reasonStr = String(r[rCol('reason')] || '').trim();
        const qty = Number(r[rCol('qty')]) || 0;
        if (!machId || !partId || !reasonStr || qty <= 0) continue;

        const reasonId = findCheckItemId(reasonStr, 'reject_reason');
        if (!reasonId) continue;

        if (APPLY) {
          // Find production entry
          const peRes = await client.query(`
            SELECT id FROM production_entries
            WHERE machine_id = $1 AND part_id = $2 AND entry_date = $3
            LIMIT 1
          `, [machId, partId, dateStr]);

          if (peRes.rows.length > 0) {
            const peId = peRes.rows[0].id;
            const exists = await client.query(
              'SELECT 1 FROM reject_log WHERE production_entry_id = $1 AND reject_reason_id = $2 AND qty = $3',
              [peId, reasonId, qty]
            );
            if (exists.rows.length === 0) {
              await client.query(
                'INSERT INTO reject_log (production_entry_id, reject_reason_id, qty, created_at) VALUES ($1, $2, $3, $4::timestamptz)',
                [peId, reasonId, qty, `${dateStr} 09:30:00+05:30`]
              );
              rejInserted++;
            } else {
              rejSkipped++;
            }
          }
        } else {
          rejInserted++;
        }
      }
      console.log(`PRODUCTION_REJECT_LOG: ${rejInserted} inserted, ${rejSkipped} skipped.`);
    }

    if (APPLY) {
      await client.query('COMMIT');
      console.log('\nTransaction COMMITTED successfully.');
    } else {
      console.log('\nDRY RUN complete. Zero writes executed.');
    }

    // Final Counts
    const pePost = await client.query('SELECT count(*) as total FROM production_entries');
    const bgPost = await client.query('SELECT count(*) as total FROM bags');
    const trPost = await client.query('SELECT count(*) as total FROM trim_entries');
    const insPost = await client.query('SELECT count(*) as total FROM inspection_entries');
    const pkPost = await client.query('SELECT count(*) as total FROM packing_entries');
    const rjPost = await client.query('SELECT count(*) as total FROM reject_log');
    const partPost = await client.query('SELECT count(*) FILTER (WHERE active) as active, count(*) as total FROM parts');

    console.log('\nFinal Database State:');
    console.log(`  Parts Total: ${partPost.rows[0].total} (Active: ${partPost.rows[0].active})`);
    console.log(`  Production Entries: ${pePost.rows[0].total}`);
    console.log(`  Bags: ${bgPost.rows[0].total}`);
    console.log(`  Trim Entries: ${trPost.rows[0].total}`);
    console.log(`  Inspection Entries: ${insPost.rows[0].total}`);
    console.log(`  Packing Entries: ${pkPost.rows[0].total}`);
    console.log(`  Reject Log Entries: ${rjPost.rows[0].total}`);

  } catch (err) {
    if (APPLY) await client.query('ROLLBACK');
    console.error('Error during historical import:', err);
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
