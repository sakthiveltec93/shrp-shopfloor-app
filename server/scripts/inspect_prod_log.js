const path = require('path');
const XLSX = require('xlsx');

const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');
const wb = XLSX.readFile(formFile);
const sheet = wb.Sheets['PRODUCTION_LOG'];
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log('Total rows in PRODUCTION_LOG:', raw.length);
console.log('Row 0 (headers):', raw[0]);
console.log('Row 1 (sample 1):', raw[1]);
console.log('Row 2 (sample 2):', raw[2]);
console.log('Row 3 (sample 3):', raw[3]);
