const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');

function readSheet(filePath, sheetName) {
  const wb = XLSX.readFile(filePath);
  if (!wb.Sheets[sheetName]) return [];
  return XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
}

console.log('================================================================');
console.log('   DEEP RECONCILIATION ANALYSIS: EXCEL MASTERS & TRANSACTIONS   ');
console.log('================================================================\n');

// 1. PART DETAILS ANALYSIS
const erpParts = readSheet(erpFile, 'Part Details');
const formParts = readSheet(formFile, 'PART_MASTER');

console.log(`1. PARTS COMPARISON:`);
console.log(`   - Erp Master Requirements [Part Details]: ${erpParts.length} rows`);
console.log(`   - FORM ENTRY [PART_MASTER]: ${formParts.length} rows`);

const erpPartNos = new Set(erpParts.map(p => String(p['SHRP Part No.'] || p['Part Identi. No.']).trim()));
const formPartNos = new Set(formParts.map(p => String(p['Part No'] || p['Part Name']).trim()));

console.log(`\n   Erp Part Sample:`, erpParts[0]);
console.log(`\n   Workcenter / Cycle Time Breakdown from Erp Master Requirements:`);
let multiWcCount = 0;
let noWcCount = 0;
const wcUsage = {};

erpParts.forEach((p, idx) => {
  const pNo = p['SHRP Part No.'] || p['Part Identi. No.'];
  const wc1 = p['Workcenter 1'] || '';
  const ct1 = p['Cycle Time 1'] || '';
  const wc2 = p['Workcenter 2'] || '';
  const ct2 = p['Cycle Time 2'] || '';
  const wc3 = p['Workcenter 3'] || '';
  const ct3 = p['Cycle Time 3'] || '';

  if (!wc1 && !wc2 && !wc3) {
    noWcCount++;
  }
  if (wc2 || wc3) {
    multiWcCount++;
  }
  [wc1, wc2, wc3].filter(Boolean).forEach(wc => {
    wcUsage[wc] = (wcUsage[wc] || 0) + 1;
  });
});

console.log(`   - Parts with No Workcenter: ${noWcCount}`);
console.log(`   - Parts with Multiple Workcenters: ${multiWcCount}`);
console.log(`   - Workcenter distribution:`, wcUsage);

// 2. MOULDS COMPARISON
const erpMoulds = readSheet(erpFile, 'Mould Details');
const formMoulds = readSheet(formFile, 'MOULD_MASTER');
console.log(`\n2. MOULDS COMPARISON:`);
console.log(`   - Erp Master Requirements [Mould Details]: ${erpMoulds.length} rows`);
console.log(`   - FORM ENTRY [MOULD_MASTER]: ${formMoulds.length} rows`);
console.log(`   - Sample Mould:`, erpMoulds[0]);

// 3. CUSTOMER DETAILS
const erpCustomers = readSheet(erpFile, 'Customer Details');
console.log(`\n3. CUSTOMER DETAILS: ${erpCustomers.length} rows`);
console.log(erpCustomers.map(c => ({
  code: c['Customer Identi. No.'],
  name: c['Customer Name'],
  city: c['City'],
  gst: c['GSTIN / Tax ID']
})));

// 4. SUPPLIER DETAILS
const erpSuppliers = readSheet(erpFile, 'Supplier Details');
console.log(`\n4. SUPPLIER DETAILS: ${erpSuppliers.length} rows`);
console.log(erpSuppliers.map(s => ({
  code: s['Supplier Identi. No.'],
  name: s['Supplier Name'],
  category: s['Supplier Category'],
  city: s['City'],
  gst: s['GSTIN / Tax ID']
})));

// 5. MACHINE DETAILS
const erpMachines = readSheet(erpFile, 'Machine Details');
const formMachines = readSheet(formFile, 'Machine_Master');
console.log(`\n5. MACHINES COMPARISON:`);
console.log(`   - Erp Master Requirements [Machine Details]: ${erpMachines.length} rows`);
console.log(`   - FORM ENTRY [Machine_Master]: ${formMachines.length} rows`);
console.log(`   - Machine list in Erp:`, erpMachines.map(m => m['Machine No.']));
console.log(`   - Machine list in Form Entry:`, formMachines.map(m => m['Machine No']));

// 6. GAUGES / INSTRUMENTS
const erpGauges = readSheet(erpFile, 'List of Instruments');
console.log(`\n6. GAUGES / INSTRUMENTS: ${erpGauges.length} rows`);
console.log(`   - Sample Gauge:`, erpGauges[0]);

// 7. PRODUCTION LOG AUDIT
const prodLogs = readSheet(formFile, 'PRODUCTION_LOG');
console.log(`\n7. PRODUCTION LOG AUDIT (${prodLogs.length} rows):`);
const prodParts = new Set();
const prodMachines = new Set();
const prodOperators = new Set();
const invalidDates = [];

prodLogs.forEach((r, idx) => {
  if (r['Part No']) prodParts.add(String(r['Part No']).trim());
  if (r['Machine']) prodMachines.add(String(r['Machine']).trim());
  if (r['Operator']) prodOperators.add(String(r['Operator']).trim());
});

console.log(`   - Distinct Parts referenced in Production Log: ${prodParts.size}`);
console.log(`   - Distinct Machines referenced: ${prodMachines.size}`, Array.from(prodMachines));
console.log(`   - Distinct Operators referenced: ${prodOperators.size}`, Array.from(prodOperators));

// Check missing parts
const unmappedProdParts = Array.from(prodParts).filter(p => !erpPartNos.has(p));
console.log(`   - Unmapped Parts in Production Log against Erp Part Details: ${unmappedProdParts.length}`, unmappedProdParts);

// 8. OTHER TRANSACTION LOGS
const bagLogs = readSheet(formFile, 'BAG_LOG');
const bagHist = readSheet(formFile, 'BAG_STATUS_HISTORY');
const trimLogs = readSheet(formFile, 'TRIM_LOG');
const inspLogs = readSheet(formFile, 'INSPECTION_LOG');
const packLogs = readSheet(formFile, 'PACKING_LOG');
const dispLogs = readSheet(formFile, 'DISPATCH_LOG');
const rejLog = readSheet(formFile, 'REJECT_LOG');
const idleLog = readSheet(formFile, 'IDLE_LOG');
const machineStatus = readSheet(formFile, 'MACHINE_STATUS');

console.log(`\n8. TRANSACTION TABLES SUMMARY:`);
console.log(`   - BAG_LOG: ${bagLogs.length} rows`);
console.log(`   - BAG_STATUS_HISTORY: ${bagHist.length} rows`);
console.log(`   - TRIM_LOG: ${trimLogs.length} rows`);
console.log(`   - INSPECTION_LOG: ${inspLogs.length} rows`);
console.log(`   - PACKING_LOG: ${packLogs.length} rows`);
console.log(`   - DISPATCH_LOG: ${dispLogs.length} rows`);
console.log(`   - REJECT_LOG: ${rejLog.length} rows`);
console.log(`   - IDLE_LOG: ${idleLog.length} rows`);
console.log(`   - MACHINE_STATUS: ${machineStatus.length} rows`);
