require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const path = require('path');
const XLSX = require('xlsx');
const pool = require('../db/pool');

const formFile = path.join(__dirname, '../../FORM ENTRY 26-271.xlsm');
const wb = XLSX.readFile(formFile);
const sheet = wb.Sheets['PRODUCTION_LOG'];
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

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
    // If Shift B end time is next morning (e.g. 07:30 or 09:30 AM), add 1 day
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

async function checkSync() {
  const client = await pool.connect();
  try {
    const { rows: dbRows } = await client.query(`
      SELECT pe.id, pe.entry_date::text, pe.shift, m.machine_code, p.part_name, p.part_code, p.shrp_part_code, p.customer_part_no,
             pe.start_count, pe.end_count, pe.good_qty, pe.reject_qty, pe.session_id,
             pe.period_start_at, pe.period_end_at, pe.start_time, pe.end_time
      FROM production_entries pe
      LEFT JOIN machines m ON m.id = pe.machine_id
      LEFT JOIN parts p ON p.id = pe.part_id
      ORDER BY pe.id ASC;
    `);

    console.log(`DB production_entries count: ${dbRows.length}`);
    console.log(`Excel PRODUCTION_LOG row count: ${raw.length - 1}`);

    // Inspect first 5 rows converted
    for (let i = 1; i <= 5; i++) {
      const r = raw[i];
      const dateStr = convertOADate(r[1]);
      const shift = String(r[2]).trim().toUpperCase();
      const startFrac = r[7];
      const endFrac = r[8];
      const isShiftBEnd = shift === 'B' && parseFloat(endFrac) < parseFloat(startFrac);
      const startTz = excelFractionToTimestamptz(dateStr, startFrac, false);
      const endTz = excelFractionToTimestamptz(dateStr, endFrac, isShiftBEnd);

      console.log(`Excel Row ${i}: Date=${dateStr}, Shift=${shift}, Start=${startFrac} -> ${startTz}, End=${endFrac} -> ${endTz}`);
    }

  } finally {
    client.release();
    await pool.end();
  }
}

checkSync();
