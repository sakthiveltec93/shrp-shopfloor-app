const path = require('path');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');
const wb = XLSX.readFile(formFile);

async function auditDownstream() {
  const parts = (await pool.query('SELECT id, part_code, shrp_part_code, customer_part_no FROM parts')).rows;

  const sheets = ['TRIM_LOG', 'INSPECTION_LOG', 'PACKING_LOG', 'DISPATCH_LOG', 'PRODUCTION_REJECT_LOG', 'PRODUCTION_IDLE_LOG'];

  for (const sName of sheets) {
    const s = wb.Sheets[sName];
    if (!s) {
      console.log(`Sheet [${sName}] not found.`);
      continue;
    }
    const raw = XLSX.utils.sheet_to_json(s, { header: 1, defval: '' });
    if (raw.length === 0) {
      console.log(`Sheet [${sName}] is empty.`);
      continue;
    }
    const headerIdx = raw.findIndex(r => r.filter(c => c !== '').length >= 2);
    const headers = raw[headerIdx].map(h => String(h).trim());
    const dataRows = raw.slice(headerIdx + 1).filter(r => r.some(c => c !== ''));

    console.log(`\n=== Sheet: ${sName} ===`);
    console.log('Headers:', headers);
    console.log('Total populated rows:', dataRows.length);
    if (dataRows.length > 0) {
      console.log('Sample Row 1:', dataRows[0]);
    }
  }
  await pool.end();
}
auditDownstream().catch(console.error);
