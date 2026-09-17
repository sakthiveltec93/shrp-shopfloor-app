const path = require('path');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const wb = XLSX.readFile(erpFile);
const sheet = wb.Sheets['Part Details'];
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

const headerRowIndex = raw.findIndex(row => row.filter(cell => cell !== '').length > 10);
const headers = raw[headerRowIndex].map(h => String(h).trim());

console.log('Detected Header Row at Index:', headerRowIndex);
console.log('Headers:', headers);

const targetParts = ['DA', 'F364 GS', 'F364 16C', 'PUNE B', 'ATBAB'];

console.log('\n================================================================');
console.log('     EXACT VALUES FOR THE 5 REQUESTED PARTS IN SOURCE EXCEL     ');
console.log('================================================================\n');

for (let i = headerRowIndex + 1; i < raw.length; i++) {
  const r = raw[i];
  if (!r || r.every(v => v === '')) continue;
  
  const rowObj = {};
  headers.forEach((h, colIdx) => {
    if (h) rowObj[h] = r[colIdx];
  });

  const shrpName = String(rowObj['SHRP Part Name'] || '').trim();
  const partNo = String(rowObj['PART NUMBER'] || '').trim();
  const desc = String(rowObj['Part Name'] || '').trim();

  const isMatch = targetParts.some(t => 
    shrpName.toUpperCase() === t.toUpperCase() || 
    partNo.toUpperCase().includes(t.toUpperCase())
  );

  if (isMatch) {
    console.log(`----------------------------------------------------------------`);
    console.log(`Row #${i + 1} | SHRP Part Name: "${shrpName}" | Part Number: "${partNo}"`);
    console.log(`----------------------------------------------------------------`);
    console.log(`- Description (Part Name):`, desc);
    console.log(`- Batch Code:             `, rowObj['BATCH CODE']);
    console.log(`- Cavities (No of Cavities):`, rowObj['No of Cavities']);
    console.log(`- Customer:               `, rowObj['customer']);
    console.log(`- Material Grade:         `, rowObj['Material Grade']);
    console.log(`- Colour:                 `, rowObj['colour']);
    console.log(`- Single Shot Weight (g): `, rowObj['single short wt']);
    console.log(`- Single Part Weight (g): `, rowObj['single part weight (grams)']);
    console.log(`- Std Packing Qty:        `, rowObj['Packing Qty']);
    console.log(`- Workcenter 1:           `, rowObj['Workcenter 1'], `| Cycle Time:`, rowObj['Cycle Time in sec']);
    console.log(`- Workcenter 2:           `, r[headers.indexOf('Workcenter 2')], `| Cycle Time:`, r[headers.indexOf('Cycle Time in sec') + 2]); // check offsets
    console.log(`- Raw Row Data:           `, JSON.stringify(r));
    console.log();
  }
}
