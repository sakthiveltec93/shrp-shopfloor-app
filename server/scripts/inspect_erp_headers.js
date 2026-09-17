const path = require('path');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const wb = XLSX.readFile(erpFile);

wb.SheetNames.forEach(sheetName => {
  const sheet = wb.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  console.log(`\n================ SHEET: ${sheetName} (Total Rows: ${raw.length}) ================`);
  for (let i = 0; i < Math.min(raw.length, 6); i++) {
    console.log(`Row ${i}:`, raw[i]);
  }
});
