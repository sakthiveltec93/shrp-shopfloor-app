const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');

function parseSheetWithDynamicHeaders(filePath, sheetName, expectedKeyHeaders = []) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return null;
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (rawRows.length === 0) return { headers: [], rows: [] };

  // Find the actual header row
  const headerRowIndex = rawRows.findIndex(row => {
    const filled = row.filter(c => c !== '' && c !== null && c !== undefined);
    if (filled.length < 2) return false;
    if (expectedKeyHeaders.length > 0) {
      const rowStr = row.map(c => String(c).trim().toLowerCase());
      const matchCount = expectedKeyHeaders.filter(eh => rowStr.includes(eh.toLowerCase())).length;
      return matchCount >= Math.min(2, expectedKeyHeaders.length);
    }
    return filled.length > row.length / 3;
  });

  if (headerRowIndex === -1) {
    console.warn(`Could not find header row for sheet [${sheetName}]`);
    return { headers: [], rows: [] };
  }

  const headerRow = rawRows[headerRowIndex].map(h => String(h).trim());
  const colIndex = (name) => {
    const target = name.trim().toLowerCase();
    // exact match first
    let idx = headerRow.findIndex(h => h.toLowerCase() === target);
    if (idx !== -1) return idx;
    // fallback to partial match
    idx = headerRow.findIndex(h => h.toLowerCase().includes(target));
    return idx;
  };

  const dataRows = rawRows.slice(headerRowIndex + 1);

  return {
    headerRowIndex,
    headerRow,
    colIndex,
    dataRows,
    wb
  };
}

console.log('================================================================');
console.log('   DYNAMIC HEADER-BASED AUDIT ACROSS ALL TRANSACTION SHEETS     ');
console.log('================================================================\n');

// 1. AUDIT PRODUCTION_LOG
const prodParsed = parseSheetWithDynamicHeaders(formFile, 'PRODUCTION_LOG', ['Production Date', 'Machine', 'Part No', 'Operator']);
const pIdx = {
  date: prodParsed.colIndex('Production Date'),
  shift: prodParsed.colIndex('Shift'),
  machine: prodParsed.colIndex('Machine'),
  partNo: prodParsed.colIndex('Part No'),
  partName: prodParsed.colIndex('Part Name'),
  operator: prodParsed.colIndex('Operator'),
  startTime: prodParsed.colIndex('Start Time'),
  endTime: prodParsed.colIndex('End Time'),
  counterStart: prodParsed.colIndex('Start Mach Count'),
  counterEnd: prodParsed.colIndex('End Mach Count'),
  shotsProduced: prodParsed.colIndex('Shots Produced'),
  cavities: prodParsed.colIndex('Cavities'),
  productionQty: prodParsed.colIndex('Production Qty'),
  rejectQty: prodParsed.colIndex('Reject Qty'),
  netQty: prodParsed.colIndex('Net Qty'),
  downtimeMinutes: prodParsed.colIndex('Downtime Minutes'),
  remarks: prodParsed.colIndex('Remarks'),
  batchNo: prodParsed.colIndex('Batch No'),
  cycleTime: prodParsed.colIndex('Cycle Time'),
  netRunMinutes: prodParsed.colIndex('Net Run Minutes'),
  efficiency: prodParsed.colIndex('Effiecency') // handles source file spelling
};

console.log('--- PRODUCTION_LOG COLUMN INDICES ---');
Object.entries(pIdx).forEach(([key, i]) => {
  if (i === -1) {
    console.warn(`WARNING: column "${key}" not found in PRODUCTION_LOG header row`);
  } else {
    console.log(`  ${key.padEnd(16)} -> Index ${String(i).padStart(2)} ("${prodParsed.headerRow[i]}")`);
  }
});

const prodRows = [];
prodParsed.dataRows.forEach((r, i) => {
  if (!r || r.every(v => v === '')) return;
  const dateVal = r[pIdx.date];
  const partVal = r[pIdx.partNo];
  const batchVal = r[pIdx.batchNo];
  if (!dateVal && !partVal && !batchVal) return;

  prodRows.push({
    rowNum: prodParsed.headerRowIndex + 2 + i,
    date: dateVal,
    shift: String(r[pIdx.shift] || '').trim(),
    machine: String(r[pIdx.machine] || '').trim(),
    partNo: String(r[pIdx.partNo] || '').trim(),
    partName: String(r[pIdx.partName] || '').trim(),
    operator: String(r[pIdx.operator] || '').trim(),
    startTime: r[pIdx.startTime],
    endTime: r[pIdx.endTime],
    counterStart: Number(r[pIdx.counterStart]) || 0,
    counterEnd: Number(r[pIdx.counterEnd]) || 0,
    shotsProduced: Number(r[pIdx.shotsProduced]) || 0,
    cavities: Number(r[pIdx.cavities]) || 0,
    productionQty: Number(r[pIdx.productionQty]) || 0,
    rejectQty: Number(r[pIdx.rejectQty]) || 0,
    netQty: Number(r[pIdx.netQty]) || 0,
    downtimeMinutes: Number(r[pIdx.downtimeMinutes]) || 0,
    remarks: String(r[pIdx.remarks] || '').trim(),
    batchNo: String(r[pIdx.batchNo] || '').trim(),
    cycleTime: Number(r[pIdx.cycleTime]) || 0,
    netRunMinutes: Number(r[pIdx.netRunMinutes]) || 0
  });
});

console.log(`\nPRODUCTION_LOG: Total Valid Populated Records = ${prodRows.length}\n`);

console.log('--- SAMPLE PRODUCTION_LOG PARSED ROWS ---');
[0, 1, 2, 50, 150, 300, prodRows.length - 1].forEach(idx => {
  if (prodRows[idx]) {
    console.log(`\nSample Record #${idx + 1} (Excel Row ${prodRows[idx].rowNum}):`);
    console.log(JSON.stringify(prodRows[idx], null, 2));
  }
});

// 2. AUDIT BAG_LOG
const bagParsed = parseSheetWithDynamicHeaders(formFile, 'BAG_LOG', ['Batch No', 'Part', 'Bag Barcode']);
console.log('\n--- BAG_LOG HEADERS ---', bagParsed.headerRow);
const bIdx = {
  date: bagParsed.colIndex('Date'),
  batchNo: bagParsed.colIndex('Batch No'),
  part: bagParsed.colIndex('Part'),
  bagBarcode: bagParsed.colIndex('Bag Barcode'),
  bagType: bagParsed.colIndex('Bag Type'),
  grossWeight: bagParsed.colIndex('Gross Weight'),
  pieces: bagParsed.colIndex('Pieces'),
  status: bagParsed.colIndex('Status'),
  isFull: bagParsed.colIndex('Is Full Bag')
};
const bagRows = [];
bagParsed.dataRows.forEach((r, i) => {
  if (!r || r.every(v => v === '')) return;
  const bagBarcode = String(r[bIdx.bagBarcode] || '').trim();
  if (!bagBarcode) return;
  bagRows.push({
    rowNum: bagParsed.headerRowIndex + 2 + i,
    date: r[bIdx.date],
    batchNo: String(r[bIdx.batchNo] || '').trim(),
    part: String(r[bIdx.part] || '').trim(),
    bagBarcode,
    bagType: String(r[bIdx.bagType] || '').trim(),
    grossWeight: Number(r[bIdx.grossWeight]) || 0,
    pieces: Number(r[bIdx.pieces]) || 0,
    status: String(r[bIdx.status] || '').trim()
  });
});
console.log(`BAG_LOG: Total Valid Records = ${bagRows.length}`);
console.log('Sample Bag:', JSON.stringify(bagRows[0], null, 2));

// 3. AUDIT TRIM_LOG
const trimParsed = parseSheetWithDynamicHeaders(formFile, 'TRIM_LOG', ['Batch No', 'Part', 'Operator', 'Weight']);
console.log('\n--- TRIM_LOG HEADERS ---', trimParsed.headerRow);
const tIdx = {
  date: trimParsed.colIndex('Date'),
  batchNo: trimParsed.colIndex('Batch No'),
  part: trimParsed.colIndex('Part'),
  operator: trimParsed.colIndex('Operator'),
  weight: trimParsed.colIndex('Weight'),
  pieces: trimParsed.colIndex('Pieces'),
  rejectQty: trimParsed.colIndex('Reject Qty'),
  runnerWt: trimParsed.colIndex('Runner wt')
};
const trimRows = [];
trimParsed.dataRows.forEach((r, i) => {
  if (!r || r.every(v => v === '')) return;
  const batchNo = String(r[tIdx.batchNo] || '').trim();
  if (!batchNo) return;
  trimRows.push({
    rowNum: trimParsed.headerRowIndex + 2 + i,
    date: r[tIdx.date],
    batchNo,
    part: String(r[tIdx.part] || '').trim(),
    operator: String(r[tIdx.operator] || '').trim(),
    weight: Number(r[tIdx.weight]) || 0,
    pieces: Number(r[tIdx.pieces]) || 0,
    runnerWt: Number(r[tIdx.runnerWt]) || 0
  });
});
console.log(`TRIM_LOG: Total Valid Records = ${trimRows.length}`);
console.log('Sample Trim:', JSON.stringify(trimRows[0], null, 2));

// 4. AUDIT INSPECTION_LOG
const inspParsed = parseSheetWithDynamicHeaders(formFile, 'INSPECTION_LOG', ['Batch No', 'Part', 'Accept Weight', 'Accept Pieces']);
console.log('\n--- INSPECTION_LOG HEADERS ---', inspParsed.headerRow);
const inIdx = {
  date: inspParsed.colIndex('Date'),
  batchNo: inspParsed.colIndex('Batch No'),
  part: inspParsed.colIndex('Part'),
  operator: inspParsed.colIndex('Operator'),
  acceptWeight: inspParsed.colIndex('Accept Weight'),
  acceptPieces: inspParsed.colIndex('Accept Pieces'),
  rejectWeight: inspParsed.colIndex('Reject Weight'),
  rejectPieces: inspParsed.colIndex('Reject Pieces')
};
const inspRows = [];
inspParsed.dataRows.forEach((r, i) => {
  if (!r || r.every(v => v === '')) return;
  const batchNo = String(r[inIdx.batchNo] || '').trim();
  if (!batchNo) return;
  inspRows.push({
    rowNum: inspParsed.headerRowIndex + 2 + i,
    date: r[inIdx.date],
    batchNo,
    part: String(r[inIdx.part] || '').trim(),
    operator: String(r[inIdx.operator] || '').trim(),
    acceptWeight: Number(r[inIdx.acceptWeight]) || 0,
    acceptPieces: Number(r[inIdx.acceptPieces]) || 0,
    rejectWeight: Number(r[inIdx.rejectWeight]) || 0,
    rejectPieces: Number(r[inIdx.rejectPieces]) || 0
  });
});
console.log(`INSPECTION_LOG: Total Valid Records = ${inspRows.length}`);
console.log('Sample Inspection:', JSON.stringify(inspRows[0], null, 2));

// 5. AUDIT PACKING_LOG
const packParsed = parseSheetWithDynamicHeaders(formFile, 'PACKING_LOG', ['Batch No', 'Part', 'Std Pack Qty', 'Packets Packed']);
console.log('\n--- PACKING_LOG HEADERS ---', packParsed.headerRow);
const pkIdx = {
  date: packParsed.colIndex('Date'),
  batchNo: packParsed.colIndex('Batch No'),
  part: packParsed.colIndex('Part'),
  operator: packParsed.colIndex('Operator'),
  stdPackQty: packParsed.colIndex('Std Pack Qty'),
  actualPacketWt: packParsed.colIndex('Actual Packet Wt'),
  packetsPacked: packParsed.colIndex('Packets Packed'),
  packedQty: packParsed.colIndex('Packed Qty'),
  packedWeight: packParsed.colIndex('Packed Weight'),
  balanceQty: packParsed.colIndex('Balance Qty'),
  firstPacketNo: packParsed.colIndex('First Packet No'),
  lastPacketNo: packParsed.colIndex('Last Packet No')
};
const packRows = [];
packParsed.dataRows.forEach((r, i) => {
  if (!r || r.every(v => v === '')) return;
  const batchNo = String(r[pkIdx.batchNo] || '').trim();
  if (!batchNo) return;
  packRows.push({
    rowNum: packParsed.headerRowIndex + 2 + i,
    date: r[pkIdx.date],
    batchNo,
    part: String(r[pkIdx.part] || '').trim(),
    operator: String(r[pkIdx.operator] || '').trim(),
    stdPackQty: Number(r[pkIdx.stdPackQty]) || 0,
    actualPacketWt: Number(r[pkIdx.actualPacketWt]) || 0,
    packetsPacked: Number(r[pkIdx.packetsPacked]) || 0,
    packedQty: Number(r[pkIdx.packedQty]) || 0,
    firstPacketNo: String(r[pkIdx.firstPacketNo] || '').trim(),
    lastPacketNo: String(r[pkIdx.lastPacketNo] || '').trim()
  });
});
console.log(`PACKING_LOG: Total Valid Records = ${packRows.length}`);
console.log('Sample Packing:', JSON.stringify(packRows[0], null, 2));
