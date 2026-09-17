const path = require('path');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const wb = XLSX.readFile(erpFile);
const rawParts = XLSX.utils.sheet_to_json(wb.Sheets['Part Details'], { header: 1, defval: '' });

console.log('--- ALL PARTS WORKCENTER & CYCLE TIME MAPPINGS ---');
for (let i = 2; i < rawParts.length; i++) {
  const r = rawParts[i];
  if (!r || r.every(v => v === '')) continue;
  const name = String(r[1] || r[2] || `Row ${i+1}`);
  const wcs = [];
  if (r[25]) wcs.push(`WC1: ${r[25]} (${r[26]}s)`);
  if (r[27]) wcs.push(`WC2: ${r[27]} (${r[28]}s)`);
  if (r[29]) wcs.push(`WC3: ${r[29]} (${r[30]}s)`);
  if (r[31]) wcs.push(`WC4: ${r[31]} (${r[32]}s)`);
  console.log(`${String(i-1).padStart(2)}. [${name.padEnd(20)}] -> ${wcs.length > 0 ? wcs.join(' | ') : 'NO WORKCENTER ASSIGNED'}`);
}
