const path = require('path');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');

function getRawSheet(file, sheetName) {
  const wb = XLSX.readFile(file);
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
}

const rawErpParts = getRawSheet(erpFile, 'Part Details');
const erpParts = [];
for (let i = 2; i < rawErpParts.length; i++) {
  const r = rawErpParts[i];
  if (!r || r.every(v => v === '')) continue;
  erpParts.push({
    row: i + 1,
    slNo: r[0],
    shrpPartName: String(r[1]).trim(),
    partNumber: String(r[2]).trim(),
    partName: String(r[3]).trim(),
    cavities: Number(r[5]) || 0,
    partWeight: Number(r[15]) || 0,
    shotWeight: Number(r[14]) || 0,
    wc1: r[25], ct1: r[26],
    wc2: r[27], ct2: r[28],
    wc3: r[29], ct3: r[30]
  });
}

const rawFormParts = getRawSheet(formFile, 'PART_MASTER');
const formParts = [];
for (let i = 1; i < rawFormParts.length; i++) {
  const r = rawFormParts[i];
  if (!r || r.every(v => v === '')) continue;
  formParts.push({
    row: i + 1,
    partNo: String(r[0]).trim(),
    partName: String(r[1]).trim(),
    partWeight: Number(r[2]) || 0,
    cavity: Number(r[9]) || 0,
    shotWeight: Number(r[10]) || 0,
    partCode: r[11]
  });
}

console.log(`ERP Parts Count: ${erpParts.length}`);
console.log(`FORM Parts Count: ${formParts.length}`);

const erpSet = new Set(erpParts.map(p => p.shrpPartName.toLowerCase()));
const formSet = new Set(formParts.map(p => p.partNo.toLowerCase()));

console.log('\nParts in FORM_ENTRY but NOT in ERP_Master:');
formParts.forEach(fp => {
  if (!erpSet.has(fp.partNo.toLowerCase())) {
    console.log(' -', fp.partNo, '|', fp.partName);
  }
});

console.log('\nParts in ERP_Master but NOT in FORM_ENTRY:');
erpParts.forEach(ep => {
  if (!formSet.has(ep.shrpPartName.toLowerCase())) {
    console.log(' -', ep.shrpPartName, '|', ep.partNumber, '|', ep.partName);
  }
});

// Check if any specs differ (cavities, part weight, shot weight) between ERP Master and Form Entry
console.log('\n--- SPEC DIFFERENCES (ERP Master vs Form Entry) ---');
let diffCount = 0;
erpParts.forEach(ep => {
  const fp = formParts.find(f => f.partNo.toLowerCase() === ep.shrpPartName.toLowerCase());
  if (fp) {
    const wtDiff = Math.abs(ep.partWeight - fp.partWeight) > 0.01;
    const shotDiff = Math.abs(ep.shotWeight - fp.shotWeight) > 0.1;
    const cavDiff = ep.cavities !== fp.cavity;
    if (wtDiff || shotDiff || cavDiff) {
      diffCount++;
      console.log(`Part [${ep.shrpPartName}]:`);
      if (wtDiff) console.log(`  - Part Weight: ERP=${ep.partWeight}g vs FORM=${fp.partWeight}g`);
      if (shotDiff) console.log(`  - Shot Weight: ERP=${ep.shotWeight}g vs FORM=${fp.shotWeight}g`);
      if (cavDiff) console.log(`  - Cavities: ERP=${ep.cavities} vs FORM=${fp.cavity}`);
    }
  }
});
console.log(`Total Parts with Spec Differences: ${diffCount}`);
