const path = require('path');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const wb = XLSX.readFile(erpFile);
const sheet = wb.Sheets['Part Details'];
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log('Total Rows in Part Details:', raw.length);
for (let i = 0; i < Math.min(raw.length, 6); i++) {
  console.log(`\nRow ${i}:`);
  console.log(raw[i]);
}
