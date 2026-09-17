const path = require('path');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const wb = XLSX.readFile(erpFile);
const rawMoulds = XLSX.utils.sheet_to_json(wb.Sheets['Mould Details'], { header: 1, defval: '' });

console.log('--- MOULDS AUDIT ---');
for (let i = 2; i < rawMoulds.length; i++) {
  const r = rawMoulds[i];
  if (!r || r.every(v => v === '')) continue;
  console.log(`${String(i-1).padStart(2)}. Mould: [${String(r[1]).padEnd(10)}] | PartNo: [${String(r[2]).padEnd(18)}] | SHRP Part: [${String(r[3]).padEnd(15)}] | Cav: ${r[5]} | Machines: [${r[10]}] | Cust: [${r[12]}]`);
}
