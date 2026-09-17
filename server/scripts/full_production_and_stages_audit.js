const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');

function getRawSheet(file, sheetName) {
  const wb = XLSX.readFile(file);
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
}

// 1. Parse Masters
const rawParts = getRawSheet(erpFile, 'Part Details');
const parts = [];
for (let i = 2; i < rawParts.length; i++) {
  const r = rawParts[i];
  if (!r || r.every(v => v === '')) continue;
  parts.push({
    row: i + 1,
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
    workcenters: [
      r[25] ? { wc: String(r[25]).trim(), cycleTime: Number(r[26]) || 0 } : null,
      r[27] ? { wc: String(r[27]).trim(), cycleTime: Number(r[28]) || 0 } : null,
      r[29] ? { wc: String(r[29]).trim(), cycleTime: Number(r[30]) || 0 } : null,
      r[31] ? { wc: String(r[31]).trim(), cycleTime: Number(r[32]) || 0 } : null
    ].filter(Boolean)
  });
}

const rawMoulds = getRawSheet(erpFile, 'Mould Details');
const moulds = [];
for (let i = 2; i < rawMoulds.length; i++) {
  const r = rawMoulds[i];
  if (!r || r.every(v => v === '')) continue;
  moulds.push({
    row: i + 1,
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

const rawMach = getRawSheet(erpFile, 'Machine Details');
const machines = [];
for (let i = 2; i < rawMach.length; i++) {
  const r = rawMach[i];
  if (!r || r.every(v => v === '')) continue;
  machines.push({
    row: i + 1,
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

const rawCust = getRawSheet(erpFile, 'Customer Details');
const customers = [];
for (let i = 1; i < rawCust.length; i++) {
  const r = rawCust[i];
  if (!r || r.every(v => v === '')) continue;
  customers.push({
    row: i + 1,
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

const rawSupp = getRawSheet(erpFile, 'Supplier Details');
const suppliers = [];
for (let i = 2; i < rawSupp.length; i++) {
  const r = rawSupp[i];
  if (!r || r.every(v => v === '')) continue;
  suppliers.push({
    row: i + 1,
    supplierCode: String(r[0]).trim(),
    supplierName: String(r[1]).trim() || (r[3] ? String(r[3]).split('\n')[0].replace('M/s.', '').trim() : ''),
    gstNumber: String(r[2]).trim(),
    address: String(r[3]).trim(),
    contactPerson: String(r[4]).trim(),
    mobile: String(r[6]).trim(),
    email: String(r[7]).trim(),
    scopeOfSupply: String(r[8]).trim()
  });
}

const rawInst = getRawSheet(erpFile, 'List of Instruments');
const instruments = [];
for (let i = 2; i < rawInst.length; i++) {
  const r = rawInst[i];
  if (!r || r.every(v => v === '')) continue;
  instruments.push({
    row: i + 1,
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

const rawOps = getRawSheet(formFile, 'OperatorMaster');
const operators = [];
for (let i = 1; i < rawOps.length; i++) {
  const r = rawOps[i];
  if (!r || r.every(v => v === '')) continue;
  operators.push({
    name: String(r[0]).trim(),
    department: String(r[1]).trim(),
    userOption: String(r[2]).trim(),
    username: String(r[3]).trim(),
    pin: String(r[4]).trim()
  });
}

// Normalized maps for fast lookup
const partByShrpName = new Map();
const partByPartNumber = new Map();
const partByAny = new Map();

parts.forEach(p => {
  if (p.shrpPartName) {
    partByShrpName.set(p.shrpPartName.toLowerCase(), p);
    partByAny.set(p.shrpPartName.toLowerCase(), p);
  }
  if (p.partNumber) {
    partByPartNumber.set(p.partNumber.toLowerCase(), p);
    partByAny.set(p.partNumber.toLowerCase(), p);
  }
});

const machineByCode = new Map();
machines.forEach(m => {
  const clean = m.machineNo.toLowerCase().replace(/[\s\-_]/g, '');
  machineByCode.set(clean, m);
  machineByCode.set(m.machineNo.toLowerCase(), m);
});

const operatorByName = new Map();
operators.forEach(o => {
  operatorByName.set(o.name.toLowerCase(), o);
  operatorByName.set(o.username.toLowerCase(), o);
});

// 2. Audit PRODUCTION_LOG
const rawProd = getRawSheet(formFile, 'PRODUCTION_LOG');
let validProdRows = 0;
let emptyProdRows = 0;
const unmappedProdParts = new Map();
const unmappedProdMachines = new Map();
const unmappedProdOperators = new Map();

for (let i = 1; i < rawProd.length; i++) {
  const r = rawProd[i];
  if (!r || r.every(v => v === '')) {
    emptyProdRows++;
    continue;
  }
  const date = r[1];
  const shift = String(r[2]).trim();
  const machine = String(r[3]).trim();
  const partNo = String(r[4]).trim();
  const partName = String(r[5]).trim();
  const operator = String(r[6]).trim();
  const batchNo = String(r[18]).trim();

  // If no date and no part, skip
  if (!date && !partNo && !batchNo) {
    emptyProdRows++;
    continue;
  }

  validProdRows++;

  // Check Part
  const matchedPart = partByAny.get(partNo.toLowerCase()) || partByAny.get(partName.toLowerCase());
  if (!matchedPart) {
    unmappedProdParts.set(partNo, (unmappedProdParts.get(partNo) || 0) + 1);
  }

  // Check Machine
  const cleanM = machine.toLowerCase().replace(/[\s\-_]/g, '');
  if (!machineByCode.has(cleanM)) {
    unmappedProdMachines.set(machine, (unmappedProdMachines.get(machine) || 0) + 1);
  }

  // Check Operator
  if (operator && !operatorByName.has(operator.toLowerCase())) {
    unmappedProdOperators.set(operator, (unmappedProdOperators.get(operator) || 0) + 1);
  }
}

// 3. Audit BAG_LOG
const rawBags = getRawSheet(formFile, 'BAG_LOG');
let validBagRows = 0;
const unmappedBagParts = new Map();
for (let i = 1; i < rawBags.length; i++) {
  const r = rawBags[i];
  if (!r || r.every(v => v === '')) continue;
  const part = String(r[3]).trim();
  if (!part) continue;
  validBagRows++;
  if (!partByAny.has(part.toLowerCase())) {
    unmappedBagParts.set(part, (unmappedBagParts.get(part) || 0) + 1);
  }
}

// 4. Audit TRIM_LOG
const rawTrim = getRawSheet(formFile, 'TRIM_LOG');
let validTrimRows = 0;
const unmappedTrimParts = new Map();
for (let i = 1; i < rawTrim.length; i++) {
  const r = rawTrim[i];
  if (!r || r.every(v => v === '')) continue;
  const part = String(r[2]).trim();
  if (!part) continue;
  validTrimRows++;
  if (!partByAny.has(part.toLowerCase())) {
    unmappedTrimParts.set(part, (unmappedTrimParts.get(part) || 0) + 1);
  }
}

// 5. Audit INSPECTION_LOG
const rawInsp = getRawSheet(formFile, 'INSPECTION_LOG');
let validInspRows = 0;
const unmappedInspParts = new Map();
for (let i = 1; i < rawInsp.length; i++) {
  const r = rawInsp[i];
  if (!r || r.every(v => v === '')) continue;
  const part = String(r[2]).trim();
  if (!part) continue;
  validInspRows++;
  if (!partByAny.has(part.toLowerCase())) {
    unmappedInspParts.set(part, (unmappedInspParts.get(part) || 0) + 1);
  }
}

// 6. Audit PACKING_LOG
const rawPack = getRawSheet(formFile, 'PACKING_LOG');
let validPackRows = 0;
const unmappedPackParts = new Map();
for (let i = 1; i < rawPack.length; i++) {
  const r = rawPack[i];
  if (!r || r.every(v => v === '')) continue;
  const part = String(r[2]).trim();
  if (!part) continue;
  validPackRows++;
  if (!partByAny.has(part.toLowerCase())) {
    unmappedPackParts.set(part, (unmappedPackParts.get(part) || 0) + 1);
  }
}

console.log('================================================================');
console.log('                    RECONCILIATION REPORT                       ');
console.log('================================================================\n');

console.log('--- 1. MASTER TABLES PARSED ---');
console.log(`- Parts: ${parts.length} total rows`);
console.log(`- Moulds: ${moulds.length} total rows`);
console.log(`- Customers: ${customers.length} total rows`);
console.log(`- Suppliers: ${suppliers.length} total rows`);
console.log(`- Machines: ${machines.length} total rows`);
console.log(`- Instruments / Gauges: ${instruments.length} total rows`);
console.log(`- Operators: ${operators.length} total users`);

console.log('\n--- 2. TRANSACTION LOG COUNTS ---');
console.log(`- PRODUCTION_LOG: ${validProdRows} populated rows (${emptyProdRows} empty/template rows)`);
console.log(`- BAG_LOG: ${validBagRows} populated rows`);
console.log(`- TRIM_LOG: ${validTrimRows} populated rows`);
console.log(`- INSPECTION_LOG: ${validInspRows} populated rows`);
console.log(`- PACKING_LOG: ${validPackRows} populated rows`);

console.log('\n--- 3. UNMAPPED KEYS & DISCREPANCIES ---');
console.log(`- Unmapped Parts in PRODUCTION_LOG (${unmappedProdParts.size}):`, Object.fromEntries(unmappedProdParts));
console.log(`- Unmapped Machines in PRODUCTION_LOG (${unmappedProdMachines.size}):`, Object.fromEntries(unmappedProdMachines));
console.log(`- Unmapped Operators in PRODUCTION_LOG (${unmappedProdOperators.size}):`, Object.fromEntries(unmappedProdOperators));
console.log(`- Unmapped Parts in BAG_LOG (${unmappedBagParts.size}):`, Object.fromEntries(unmappedBagParts));
console.log(`- Unmapped Parts in TRIM_LOG (${unmappedTrimParts.size}):`, Object.fromEntries(unmappedTrimParts));
console.log(`- Unmapped Parts in INSPECTION_LOG (${unmappedInspParts.size}):`, Object.fromEntries(unmappedInspParts));
console.log(`- Unmapped Parts in PACKING_LOG (${unmappedPackParts.size}):`, Object.fromEntries(unmappedPackParts));
