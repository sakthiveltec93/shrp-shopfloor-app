const path = require('path');
const XLSX = require('xlsx');

const formFile = path.join(__dirname, '../../FORM ENTRY 26-271.xlsm');
const wb = XLSX.readFile(formFile);

console.log('Sheet names:', wb.SheetNames);

const sheet = wb.Sheets['PRODUCTION_LOG'];
if (sheet) {
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  console.log('Row count in PRODUCTION_LOG:', raw.length);
  for (let i = 0; i < Math.min(10, raw.length); i++) {
    console.log(`Row ${i}:`, raw[i]);
  }
}
