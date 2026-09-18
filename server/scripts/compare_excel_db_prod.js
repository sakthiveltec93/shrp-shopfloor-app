const path = require('path');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');
const wb = XLSX.readFile(formFile);

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
  return val;
}

async function compareProdEntries() {
  const dbEntries = (await pool.query(`
    SELECT pe.id, pe.entry_date::text, pe.shift, m.machine_code, p.part_code, p.shrp_part_code, p.customer_part_no,
           pe.start_count, pe.end_count, pe.good_qty, pe.reject_qty, pe.hour_slot
    FROM production_entries pe
    JOIN machines m ON pe.machine_id = m.id
    JOIN parts p ON pe.part_id = p.id
    ORDER BY pe.entry_date, pe.id
  `)).rows;

  console.log(`Live DB Production Entries: ${dbEntries.length}`);

  // Excel PRODUCTION_LOG
  const sheet = wb.Sheets['PRODUCTION_LOG'];
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const hIdx = raw.findIndex(r => r.some(c => String(c).toLowerCase().includes('production date')));
  const headers = raw[hIdx].map(h => String(h).trim());
  const col = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));

  const rows = raw.slice(hIdx + 1).filter(r => r[col('production date')]);
  console.log(`Excel PRODUCTION_LOG Populated Rows: ${rows.length}`);

  let matchedInDb = 0;
  let missingFromDb = 0;
  const missingSamples = [];

  for (const r of rows) {
    const dateStr = convertOADate(r[col('production date')]);
    const shift = String(r[col('shift')] || 'A').trim().toUpperCase();
    const mach = String(r[col('machine')] || '').trim();
    const part = String(r[col('part no')] || r[col('part name')] || '').trim();
    const startCnt = Number(r[col('start mach count')]) || 0;
    const endCnt = Number(r[col('end mach count')]) || 0;
    const prodQty = Number(r[col('production qty')]) || 0;
    const rejQty = Number(r[col('reject qty')]) || 0;

    // Match against DB entries
    const found = dbEntries.find(d => {
      const dateMatch = d.entry_date.slice(0, 10) === dateStr;
      const shiftMatch = d.shift === shift;
      const machMatch = d.machine_code.replace(/\s+/g, '').toLowerCase() === mach.replace(/\s+/g, '').toLowerCase();
      const countMatch = (d.start_count === startCnt && d.end_count === endCnt) || (d.good_qty === (prodQty - rejQty) && d.reject_qty === rejQty);
      return dateMatch && shiftMatch && machMatch && countMatch;
    });

    if (found) {
      matchedInDb++;
    } else {
      missingFromDb++;
      if (missingSamples.length < 5) {
        missingSamples.push({ dateStr, shift, mach, part, startCnt, endCnt, prodQty, rejQty });
      }
    }
  }

  console.log(`Matching Summary: Matched in DB = ${matchedInDb}, Missing from DB = ${missingFromDb}`);
  console.log('Sample Missing Rows:', JSON.stringify(missingSamples, null, 2));

  await pool.end();
}
compareProdEntries().catch(console.error);
