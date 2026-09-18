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
  return val;
}

async function debugPeMatch() {
  const dbEntries = (await pool.query('SELECT id, machine_id, part_id, entry_date::text, shift, start_count, end_count, good_qty, reject_qty FROM production_entries')).rows;
  const parts = (await pool.query('SELECT id, part_code, shrp_part_code, customer_part_no FROM parts')).rows;
  const machines = (await pool.query('SELECT id, machine_code FROM machines')).rows;

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

  const sheet = wb.Sheets['PRODUCTION_LOG'];
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const hIdx = raw.findIndex(r => r.some(c => String(c).toLowerCase().includes('production date')));
  const headers = raw[hIdx].map(h => String(h).trim());
  const col = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
  const rows = raw.slice(hIdx + 1).filter(r => r[col('production date')]);

  console.log('Total DB rows:', dbEntries.length, 'Total Excel rows:', rows.length);

  let exactMatch = 0;
  let partialMatch = 0;
  let noMatch = 0;
  const sampleDiffs = [];

  rows.forEach((r, idx) => {
    const dateStr = convertOADate(r[col('production date')]);
    const shift = String(r[col('shift')] || 'A').trim().toUpperCase();
    const mach = findMachineId(r[col('machine')]);
    const part = findPartId(r[col('part no')] || r[col('part name')]);
    const startCnt = Number(r[col('start mach count')]) || 0;
    const endCnt = Number(r[col('end mach count')]) || 0;
    const prodQty = Number(r[col('production qty')]) || 0;
    const rejQty = Number(r[col('reject qty')]) || 0;
    const goodQty = (prodQty >= rejQty) ? (prodQty - rejQty) : prodQty;

    const dMatch = dbEntries.find(d => 
      d.machine_id === mach &&
      d.part_id === part &&
      d.entry_date.slice(0, 10) === dateStr &&
      d.shift === shift &&
      d.start_count === startCnt &&
      d.end_count === endCnt
    );

    if (dMatch) {
      exactMatch++;
    } else {
      const pMatch = dbEntries.find(d => 
        d.machine_id === mach &&
        d.entry_date.slice(0, 10) === dateStr &&
        d.shift === shift
      );
      if (pMatch) {
        partialMatch++;
        if (sampleDiffs.length < 5) {
          sampleDiffs.push({
            excel: { row: idx + 2, dateStr, shift, mach, part, startCnt, endCnt, goodQty, rejQty },
            db: { id: pMatch.id, part_id: pMatch.part_id, start_count: pMatch.start_count, end_count: pMatch.end_count, good_qty: pMatch.good_qty, reject_qty: pMatch.reject_qty }
          });
        }
      } else {
        noMatch++;
      }
    }
  });

  console.log('Exact match (date+shift+mach+part+start+end):', exactMatch);
  console.log('Date+shift+mach match but different count/part:', partialMatch);
  console.log('No match (completely new entries):', noMatch);
  console.log('Sample partial diffs:', JSON.stringify(sampleDiffs, null, 2));

  await pool.end();
}
debugPeMatch().catch(console.error);
