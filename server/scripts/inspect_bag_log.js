const path = require('path');
const XLSX = require('xlsx');

const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');
const wb = XLSX.readFile(formFile);
const sheet = wb.Sheets['BAG_LOG'];
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

const headerRow = raw[0].map(h => String(h).trim());
console.log('BAG_LOG Headers:', headerRow);

for (let i = 1; i <= 5; i++) {
  console.log(`\nBAG_LOG Row ${i}:`, raw[i]);
}
