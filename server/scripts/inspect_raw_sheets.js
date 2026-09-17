const path = require('path');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');

function inspectRawRows(file, sheetName, maxRows = 5) {
  const wb = XLSX.readFile(file);
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return console.log(`Sheet [${sheetName}] not found`);
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  console.log(`\n======================================================`);
  console.log(`FILE: ${path.basename(file)} | SHEET: [${sheetName}] | TOTAL ROWS: ${raw.length}`);
  console.log(`======================================================`);
  for (let i = 0; i < Math.min(raw.length, maxRows); i++) {
    console.log(`Row ${i}:`, JSON.stringify(raw[i]));
  }
}

const erpWb = XLSX.readFile(erpFile);
erpWb.SheetNames.forEach(name => inspectRawRows(erpFile, name, 4));

const formWb = XLSX.readFile(formFile);
formWb.SheetNames.forEach(name => inspectRawRows(formFile, name, 3));
