const path = require('path');
const XLSX = require('xlsx');

const formFile = path.join(__dirname, '../../FORM ENTRY 26-271.xlsm');
const wb = XLSX.readFile(formFile);
const sheet = wb.Sheets['PRODUCTION_LOG'];
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

let nonEmptyRows = 0;
for (let i = 1; i < raw.length; i++) {
  const r = raw[i];
  if (r[1] && r[3] && r[4]) { // Date, Machine, Part
    nonEmptyRows++;
  }
}

console.log('Total populated rows in PRODUCTION_LOG:', nonEmptyRows);
