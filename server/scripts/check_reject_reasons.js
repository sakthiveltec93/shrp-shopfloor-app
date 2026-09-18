const path = require('path');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');
const wb = XLSX.readFile(formFile);

async function checkReasons() {
  const dbItems = (await pool.query('SELECT id, item_name, category FROM check_items')).rows;
  console.log('Current check_items in DB:', dbItems);

  const rSheet = wb.Sheets['PRODUCTION_REJECT_LOG'];
  const rRaw = XLSX.utils.sheet_to_json(rSheet, { header: 1, defval: '' });
  const hIdx = rRaw.findIndex(r => r.some(c => String(c).toLowerCase().includes('reason')));
  const headers = rRaw[hIdx].map(h => String(h).trim());
  const col = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
  const rRows = rRaw.slice(hIdx + 1).filter(r => r[col('reason')]);

  const uniqueReasons = Array.from(new Set(rRows.map(r => String(r[col('reason')]).trim()).filter(Boolean)));
  console.log('Unique Reject Reasons in Excel:', uniqueReasons);

  await pool.end();
}
checkReasons().catch(console.error);
