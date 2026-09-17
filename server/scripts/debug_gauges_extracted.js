const path = require('path');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const wb = XLSX.readFile(erpFile);
const rawInst = XLSX.utils.sheet_to_json(wb.Sheets['List of Instruments'], { header: 1, defval: '' });

const headerRowIndex = 1;
const headerRow = rawInst[headerRowIndex].map(h => String(h).trim());
const dataRows = rawInst.slice(headerRowIndex + 1);

const extracted = [];
dataRows.forEach((r, idx) => {
  const code = String(r[1]).trim();
  const desc = String(r[2]).trim();
  if (!code || code === '#' || code.toLowerCase().startsWith('rev') || 
      desc.toLowerCase().includes('revision') || code.toLowerCase().includes('prepared') || 
      desc.toLowerCase().includes('prepared') || typeof r[0] !== 'number') {
    return;
  }
  extracted.push({ idx, row: idx + 3, slNo: r[0], code, desc });
});

console.log(`Total Extracted: ${extracted.length}`);
console.log(extracted);
