const path = require('path');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const wb = XLSX.readFile(erpFile);
const sheet = wb.Sheets['List of Instruments'];
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log('=== ALL ROWS IN List of Instruments ===');
raw.forEach((r, idx) => {
  console.log(`Row index ${idx} (Excel line ${idx + 1}):`, JSON.stringify(r));
});
