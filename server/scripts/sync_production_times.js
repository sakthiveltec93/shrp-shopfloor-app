require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const path = require('path');
const XLSX = require('xlsx');
const pool = require('../db/pool');

const formFile = path.join(__dirname, '../../FORM ENTRY 26-271.xlsm');
const wb = XLSX.readFile(formFile);
const sheet = wb.Sheets['PRODUCTION_LOG'];
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

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
  return null;
}

function excelFractionToTimestamptz(dateStr, fraction, isShiftBEnd = false) {
  const num = parseFloat(fraction);
  if (isNaN(num)) return null;

  let targetDate = new Date(`${dateStr}T00:00:00+05:30`);
  if (isShiftBEnd) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');

  const totalMinutes = Math.round(num * 24 * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const pad = (n) => String(n).padStart(2, '0');

  return `${y}-${m}-${d}T${pad(hours)}:${pad(mins)}:00+05:30`;
}

async function syncProductionTimes() {
  console.log('======================================================================');
  console.log(' SYNC PRODUCTION TIMES FROM EXCOL COLUMNS H & I (FORM ENTRY 26-271.xlsm)');
  console.log(APPLY ? ' Mode: APPLY (COMMITTING TO DATABASE)' : ' Mode: DRY RUN (REPORT ONLY)');
  console.log('======================================================================\n');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Remove live test session entries made directly in the app
    const delRej = await client.query(`
      DELETE FROM reject_log WHERE production_entry_id IN (SELECT id FROM production_entries WHERE session_id IS NOT NULL);
    `);
    const delDown = await client.query(`
      DELETE FROM downtime_log WHERE production_entry_id IN (SELECT id FROM production_entries WHERE session_id IS NOT NULL);
    `);

    const appDelRes = await client.query(`
      DELETE FROM production_entries 
      WHERE session_id IS NOT NULL
      RETURNING id, machine_id, part_id, entry_date;
    `);
    console.log(`1. Removed ${appDelRes.rows.length} test entries created directly in app (session_id IS NOT NULL).`);

    // Clean up machine_sessions
    const sessDelRes = await client.query(`
      DELETE FROM machine_sessions RETURNING id;
    `);
    console.log(`- Cleaned up ${sessDelRes.rows.length} machine sessions.\n`);

    // 2. Fetch master lookups
    const parts = (await client.query('SELECT id, part_code, shrp_part_code, customer_part_no FROM parts')).rows;
    const machines = (await client.query('SELECT id, machine_code FROM machines')).rows;
    const users = (await client.query('SELECT id, username, full_name FROM users')).rows;

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

    // 3. Process each row in PRODUCTION_LOG
    console.log('2. Processing Excel PRODUCTION_LOG sheet (Columns H & I)...');
    let updatedCount = 0;
    let insertedCount = 0;
    let sampleLogs = [];

    // Fetch existing DB entries
    const dbEntries = (await client.query(`
      SELECT id, machine_id, part_id, entry_date::text, shift, start_count, end_count, good_qty, reject_qty
      FROM production_entries
      ORDER BY id ASC
    `)).rows;

    const matchedDbIds = new Set();

    for (let i = 1; i < raw.length; i++) {
      const r = raw[i];
      const rawDate = r[1];
      const shift = String(r[2] || 'A').trim().toUpperCase();
      const machStr = String(r[3] || '').trim();
      const partStr = String(r[4] || r[5] || '').trim();
      const opStr = String(r[6] || '').trim();
      const startFrac = r[7];
      const endFrac = r[8];
      const startCnt = Number(r[9]) || 0;
      const endCnt = Number(r[10]) || 0;
      const shots = Number(r[11]) || 0;
      const cavities = Number(r[12]) || 1;
      const prodQty = Number(r[13]) || (shots * cavities);
      const rejQty = Number(r[14]) || 0;
      const goodQty = (prodQty >= rejQty) ? (prodQty - rejQty) : prodQty;
      const downtimeMin = Number(r[16]) || 0;
      const remarks = String(r[17] || '').trim();

      if (!rawDate || !machStr || !partStr) continue;

      const dateStr = convertOADate(rawDate);
      if (!dateStr) continue;

      const machId = findMachineId(machStr);
      const partId = findPartId(partStr);
      if (!machId || !partId) continue;

      const opUserId = await getOrCreateUserId(opStr);

      const isShiftBEnd = shift === 'B' && parseFloat(endFrac) < parseFloat(startFrac);
      const startTz = excelFractionToTimestamptz(dateStr, startFrac, false);
      const endTz = excelFractionToTimestamptz(dateStr, endFrac, isShiftBEnd);

      // Find best match in existing DB rows that hasn't been updated yet
      const match = dbEntries.find(e =>
        !matchedDbIds.has(e.id) &&
        e.machine_id === machId &&
        e.part_id === partId &&
        e.entry_date.slice(0, 10) === dateStr &&
        e.shift === shift &&
        (
          (e.start_count === startCnt && e.end_count === endCnt) ||
          (e.good_qty === goodQty && e.reject_qty === rejQty)
        )
      );

      if (match) {
        matchedDbIds.add(match.id);
        if (APPLY) {
          await client.query(`
            UPDATE production_entries
            SET period_start_at = $1, period_end_at = $2, start_time = $1, end_time = $2,
                operator_user_id = $3, downtime_minutes = $4, remarks = COALESCE(NULLIF($5, ''), remarks),
                start_count = $6, end_count = $7, good_qty = $8, reject_qty = $9
            WHERE id = $10;
          `, [startTz, endTz, opUserId, downtimeMin, remarks, startCnt, endCnt, goodQty, rejQty, match.id]);
        }
        updatedCount++;
      } else {
        if (APPLY) {
          await client.query(`
            INSERT INTO production_entries (
              machine_id, part_id, operator_user_id, shift, entry_date,
              start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks,
              period_start_at, period_end_at, start_time, end_time
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $12, $13);
          `, [machId, partId, opUserId, shift, dateStr, startCnt, endCnt, goodQty, rejQty, downtimeMin, remarks, startTz, endTz]);
        }
        insertedCount++;
      }

      if (sampleLogs.length < 8) {
        sampleLogs.push({
          row: i,
          date: dateStr,
          shift,
          machine: machStr,
          part: partStr,
          start: `${startFrac} -> ${startTz}`,
          end: `${endFrac} -> ${endTz}`,
          matchedDbId: match ? match.id : 'NEW_INSERT'
        });
      }
    }

    console.log(`\nResults: ${updatedCount} DB entries matched and updated with exact times, ${insertedCount} new entries inserted.`);
    console.log('Sample converted rows:');
    console.table(sampleLogs);

    if (APPLY) {
      await client.query('COMMIT');
      console.log('\n✅ Successfully committed all production time conversions and cleaned app test entries!');
    } else {
      await client.query('ROLLBACK');
      console.log('\nDRY RUN complete. Re-run with --apply to commit.');
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in syncProductionTimes:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

syncProductionTimes();
