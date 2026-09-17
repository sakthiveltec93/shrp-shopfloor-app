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

console.log('=== RUNNING COMPLETE AUDIT & PARSING OF ALL SHEETS ===\n');

// 1. PART DETAILS (Header is at Row 1)
const rawParts = getRawSheet(erpFile, 'Part Details');
const partHeaders = rawParts[1];
const parts = [];
for (let i = 2; i < rawParts.length; i++) {
  const r = rawParts[i];
  if (!r || r.every(v => v === '')) continue;
  const part = {
    rowNum: i + 1,
    slNo: r[0],
    shrpPartName: String(r[1]).trim(),
    partNumber: String(r[2]).trim(),
    partName: String(r[3]).trim(),
    batchCode: String(r[4]).trim(),
    cavities: Number(r[5]) || 0,
    customer: String(r[6]).trim(),
    materialGrade: String(r[7]).trim(),
    colour: String(r[8]).trim(),
    rmRatio: {
      grade1: r[9],
      grade2: r[10],
      mb: r[11],
      colourRegrind: r[12],
      naturalRegrind: r[13]
    },
    shotWeight: Number(r[14]) || 0,
    partWeight: Number(r[15]) || 0,
    packingQty: Number(r[16]) || 0,
    bagsPerBinBox: r[17],
    primaryPacking: r[18],
    secondaryPacking: r[19],
    trimReq: String(r[20]).trim().toUpperCase() === 'Y',
    inspectionReq: String(r[21]).trim().toUpperCase() === 'Y',
    packingReq: String(r[22]).trim().toUpperCase() === 'Y',
    dispatchReq: String(r[23]).trim().toUpperCase() === 'Y',
    sellingPrice: Number(r[24]) || 0,
    workcenters: []
  };

  if (r[25]) part.workcenters.push({ wc: String(r[25]).trim(), cycleTime: Number(r[26]) || 0 });
  if (r[27]) part.workcenters.push({ wc: String(r[27]).trim(), cycleTime: Number(r[28]) || 0 });
  if (r[29]) part.workcenters.push({ wc: String(r[29]).trim(), cycleTime: Number(r[30]) || 0 });
  if (r[31]) part.workcenters.push({ wc: String(r[31]).trim(), cycleTime: Number(r[32]) || 0 });

  parts.push(part);
}

console.log(`PARTS: Total Parsed = ${parts.length}`);
console.log('Sample parsed part:', JSON.stringify(parts[0], null, 2));

// Check duplicates or missing keys in Parts
const partNameSet = new Set();
const partNumSet = new Set();
const dupPartNames = [];
const missingPartNames = [];
const missingWeights = [];
const missingCavities = [];

parts.forEach(p => {
  if (!p.shrpPartName) missingPartNames.push(p.rowNum);
  if (partNameSet.has(p.shrpPartName)) dupPartNames.push(p.shrpPartName);
  partNameSet.add(p.shrpPartName);
  if (p.partWeight <= 0) missingWeights.push(p.shrpPartName);
  if (p.cavities <= 0) missingCavities.push(p.shrpPartName);
});

console.log(`- Duplicate SHRP Part Names: ${dupPartNames.length > 0 ? dupPartNames.join(', ') : 'NONE'}`);
console.log(`- Parts with 0 or Missing Part Weight: ${missingWeights.length > 0 ? missingWeights.join(', ') : 'NONE'}`);
console.log(`- Parts with 0 or Missing Cavities: ${missingCavities.length > 0 ? missingCavities.join(', ') : 'NONE'}`);

// 2. MOULD DETAILS (Header is at Row 0)
const rawMoulds = getRawSheet(erpFile, 'Mould Details');
const moulds = [];
for (let i = 2; i < rawMoulds.length; i++) {
  const r = rawMoulds[i];
  if (!r || r.every(v => v === '')) continue;
  moulds.push({
    rowNum: i + 1,
    slNo: r[0],
    mouldNo: String(r[1]).trim(),
    partNo: String(r[2]).trim(),
    shrpPartName: String(r[3]).trim(),
    yom: r[4],
    cavities: Number(r[5]) || 0,
    rawMaterial: String(r[6]).trim(),
    mouldType: String(r[7]).trim(),
    gateType: String(r[8]).trim(),
    toolMaker: String(r[9]).trim(),
    suitableMachines: String(r[10]).trim(),
    ownedBy: String(r[11]).trim(),
    customerName: String(r[12]).trim(),
    rackNo: String(r[13]).trim()
  });
}

console.log(`\nMOULDS: Total Parsed = ${moulds.length}`);
console.log('Sample parsed mould:', JSON.stringify(moulds[0], null, 2));

// 3. CUSTOMER DETAILS (Header at Row 0)
const rawCust = getRawSheet(erpFile, 'Customer Details');
const customers = [];
for (let i = 1; i < rawCust.length; i++) {
  const r = rawCust[i];
  if (!r || r.every(v => v === '')) continue;
  customers.push({
    rowNum: i + 1,
    refNo: String(r[0]).trim(),
    shortName: String(r[1]).trim(),
    customerName: String(r[2]).trim(),
    address: String(r[3]).trim(),
    gstNumber: String(r[4]).trim(),
    panNumber: String(r[5]).trim(),
    stateCode: String(r[6]).trim(),
    plantCode: String(r[7]).trim(),
    vendorCode: String(r[8]).trim(),
    poNo: String(r[9]).trim(),
    gstType: String(r[10]).trim()
  });
}

console.log(`\nCUSTOMERS: Total Parsed = ${customers.length}`);
console.log(customers);

// 4. SUPPLIER DETAILS (Header at Row 0/1)
const rawSupp = getRawSheet(erpFile, 'Supplier Details');
const suppliers = [];
for (let i = 2; i < rawSupp.length; i++) {
  const r = rawSupp[i];
  if (!r || r.every(v => v === '')) continue;
  suppliers.push({
    rowNum: i + 1,
    supplierCode: String(r[0]).trim(),
    supplierName: String(r[1]).trim(),
    gstNumber: String(r[2]).trim(),
    address: String(r[3]).trim(),
    contactPerson: String(r[4]).trim(),
    mobile: String(r[6]).trim(),
    email: String(r[7]).trim(),
    scopeOfSupply: String(r[8]).trim()
  });
}

console.log(`\nSUPPLIERS: Total Parsed = ${suppliers.length}`);
console.log(suppliers);

// 5. MACHINE DETAILS (Header at Row 0/1)
const rawMach = getRawSheet(erpFile, 'Machine Details');
const machines = [];
for (let i = 2; i < rawMach.length; i++) {
  const r = rawMach[i];
  if (!r || r.every(v => v === '')) continue;
  machines.push({
    rowNum: i + 1,
    slNo: r[0],
    machineNo: String(r[1]).trim(),
    description: String(r[2]).trim(),
    make: String(r[3]).trim(),
    tonnage: String(r[4]).trim(),
    type: String(r[5]).trim(),
    dimension: String(r[6]).trim(),
    screwDia: r[7],
    maxShotWeight: r[8],
    hp: r[9],
    installationYear: r[10],
    isKeyMachine: String(r[12]).trim() === '√' || String(r[12]).toUpperCase() === 'YES',
    hourlyRate: Number(r[14]) || 0,
    hasCounter: String(r[15]).trim().toUpperCase() === 'YES',
    status: String(r[16]).trim().toUpperCase(),
    category: String(r[17]).trim()
  });
}

console.log(`\nMACHINES: Total Parsed = ${machines.length}`);
console.log('Sample parsed machine:', JSON.stringify(machines[0], null, 2));

// 6. INSTRUMENTS / GAUGES (Header at Row 1)
const rawInst = getRawSheet(erpFile, 'List of Instruments');
const instruments = [];
for (let i = 2; i < rawInst.length; i++) {
  const r = rawInst[i];
  if (!r || r.every(v => v === '')) continue;
  instruments.push({
    rowNum: i + 1,
    slNo: r[0],
    code: String(r[1]).trim(),
    description: String(r[2]).trim(),
    range: String(r[3]).trim(),
    serialNo: String(r[4]).trim(),
    leastCount: String(r[5]).trim(),
    acceptanceCriteria: String(r[6]).trim(),
    make: String(r[7]).trim(),
    calibrationFrequency: String(r[8]).trim(),
    calibrationSource: String(r[9]).trim(),
    location: String(r[10]).trim(),
    calibrationDoneOn: r[12],
    calibrationDueOn: r[13]
  });
}

console.log(`\nINSTRUMENTS / GAUGES: Total Parsed = ${instruments.length}`);
console.log('Sample gauge:', JSON.stringify(instruments[0], null, 2));

// 7. FORM ENTRY CROSS-REFERENCE
console.log('\n======================================================');
console.log('       FORM ENTRY 26-27 HISTORICAL LOGS AUDIT         ');
console.log('======================================================');

const rawProd = getRawSheet(formFile, 'PRODUCTION_LOG');
const prodRows = [];
for (let i = 1; i < rawProd.length; i++) {
  const r = rawProd[i];
  if (!r || r.every(v => v === '')) continue;
  prodRows.push({
    row: i + 1,
    date: r[0],
    shift: r[1],
    machine: String(r[2]).trim(),
    partNo: String(r[3]).trim(),
    operator: String(r[4]).trim(),
    counterStart: r[5],
    counterEnd: r[6],
    prodShots: r[7],
    totalPieces: r[8],
    rejectShots: r[9],
    rejectPieces: r[10],
    okShots: r[11],
    okPieces: r[12],
    batchNo: String(r[13]).trim()
  });
}

console.log(`PRODUCTION_LOG: Total records = ${prodRows.length}`);

// Cross reference with ERP Master
const distinctProdParts = new Set(prodRows.map(p => p.partNo));
const distinctProdMachines = new Set(prodRows.map(p => p.machine));
const erpPartMap = new Map(parts.map(p => [p.shrpPartName.toLowerCase(), p]));
const erpMachMap = new Map(machines.map(m => [m.machineNo.toLowerCase().replace(/\s+/g, ''), m]));

const unmappedParts = [];
distinctProdParts.forEach(p => {
  if (!erpPartMap.has(p.toLowerCase())) {
    unmappedParts.push(p);
  }
});

console.log(`- Distinct Parts in Production: ${distinctProdParts.size}`);
console.log(`- Unmapped Parts against ERP Master: ${unmappedParts.length} ->`, unmappedParts);

const unmappedMachines = [];
distinctProdMachines.forEach(m => {
  const normM = m.toLowerCase().replace(/\s+/g, '').replace('-', '');
  const found = machines.some(em => em.machineNo.toLowerCase().replace(/\s+/g, '').replace('-', '') === normM);
  if (!found) unmappedMachines.push(m);
});
console.log(`- Distinct Machines in Production: ${distinctProdMachines.size}`);
console.log(`- Unmapped Machines against ERP Master: ${unmappedMachines.length} ->`, unmappedMachines);
