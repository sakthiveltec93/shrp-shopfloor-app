const path = require('path');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const wb = XLSX.readFile(erpFile);
const rawInst = XLSX.utils.sheet_to_json(wb.Sheets['List of Instruments'], { header: 1, defval: '' });

console.log('Total raw rows in List of Instruments:', rawInst.length);
rawInst.forEach((r, idx) => {
  if (r.some(c => c !== '')) {
    console.log(`Row ${idx}: Code=[${r[1]}] | Desc=[${r[2]}] | Range=[${r[3]}] | Make=[${r[7]}]`);
  }
});
