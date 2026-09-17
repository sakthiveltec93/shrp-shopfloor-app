const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const wb = XLSX.readFile(erpFile);

// 1. PARTS
const rawParts = XLSX.utils.sheet_to_json(wb.Sheets['Part Details'], { header: 1, defval: '' });
const pHeaderIdx = 1;
const partsData = [];

for (let i = pHeaderIdx + 1; i < rawParts.length; i++) {
  const r = rawParts[i];
  if (!r || r.every(v => v === '')) continue;
  const shrpName = String(r[1] || r[2] || '').trim();
  if (!shrpName) continue;
  const custNo = String(r[2] || '').trim();
  const desc = String(r[3] || shrpName).trim();
  const batchCode = String(r[4] || '').trim();
  const cavities = Number(r[5]) || 1;
  const customer = String(r[6] || '').trim();
  const matGrade = String(r[7] || '').trim();
  const colour = String(r[8] || '').trim();
  const shotWt = Number(r[14]) || 0;
  const partWt = Number(r[15]) || 0;
  const stdPack = Number(r[16]) || 0;
  const trimReq = String(r[20]).trim().toUpperCase() === 'Y';
  const inspReq = String(r[21]).trim().toUpperCase() === 'Y';
  const packReq = String(r[22]).trim().toUpperCase() === 'Y';
  const dispReq = String(r[23]).trim().toUpperCase() === 'Y';
  const price = Number(r[24]) || 0;

  partsData.push({
    shrpName, custNo, desc, batchCode, cavities, customer, matGrade, colour,
    shotWt, partWt, stdPack, trimReq, inspReq, packReq, dispReq, price
  });
}

console.log(`Generated ${partsData.length} parts for clean_parts.js`);

// 2. MOULDS
const rawMoulds = XLSX.utils.sheet_to_json(wb.Sheets['Mould Details'], { header: 1, defval: '' });
const mouldsData = [];
for (let i = 2; i < rawMoulds.length; i++) {
  const r = rawMoulds[i];
  if (!r || r.every(v => v === '')) continue;
  const mouldCode = String(r[1] || '').trim();
  if (!mouldCode) continue;
  mouldsData.push({
    mouldCode,
    partNo: String(r[2] || '').trim(),
    shrpPartName: String(r[3] || '').trim(),
    yom: Number(r[4]) || null,
    cavities: Number(r[5]) || 1,
    rawMaterial: String(r[6] || '').trim(),
    mouldType: String(r[7] || '').trim(),
    gateType: String(r[8] || '').trim(),
    maker: String(r[9] || '').trim(),
    suitableMachines: String(r[10] || '').trim(),
    ownership: String(r[11] || '').trim().toUpperCase() === 'CUSTOMER' ? 'Customer' : 'SHRP',
    customerName: String(r[12] || '').trim(),
    rackNo: String(r[13] || '').trim()
  });
}

console.log(`Generated ${mouldsData.length} moulds for sync_moulds.js`);
