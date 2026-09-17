const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');

function parseSheetDynamic(filePath, sheetName, expectedKeyHeaders = []) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return { headers: [], dataRows: [], headerRowIndex: -1, colIndex: () => -1 };

  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (rawRows.length === 0) return { headers: [], dataRows: [], headerRowIndex: -1, colIndex: () => -1 };

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

  const headerRow = rawRows[headerRowIndex].map(h => String(h).trim());
  const colIndex = (name) => {
    const target = name.trim().toLowerCase();
    let idx = headerRow.findIndex(h => h.toLowerCase() === target);
    if (idx !== -1) return idx;
    idx = headerRow.findIndex(h => h.toLowerCase().includes(target));
    return idx;
  };

  const dataRows = rawRows.slice(headerRowIndex + 1);
  return { headerRowIndex, headerRow, colIndex, dataRows };
}

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

console.log('Generating 002_reconcile_erp_masters.sql from local Erp Master Requirements.xlsx...');

// 1. PARTS
const partParsed = parseSheetDynamic(erpFile, 'Part Details', ['SHRP Part Name', 'PART NUMBER', 'No of Cavities']);
const pHeaders = partParsed.headerRow;
const pCol = {
  shrpName: partParsed.colIndex('SHRP Part Name'),
  partNo: partParsed.colIndex('PART NUMBER'),
  desc: partParsed.colIndex('Part Name'),
  batchCode: partParsed.colIndex('BATCH CODE'),
  cavities: partParsed.colIndex('No of Cavities'),
  customer: partParsed.colIndex('customer'),
  material: partParsed.colIndex('Material Grade'),
  colour: partParsed.colIndex('colour'),
  grade1: partParsed.colIndex('Grade 1'),
  grade2: partParsed.colIndex('Grade 2'),
  mb: partParsed.colIndex('MB'),
  colourRegrind: partParsed.colIndex('Colour Regrind'),
  naturalRegrind: partParsed.colIndex('Natural Regrind'),
  shotWeight: partParsed.colIndex('single short wt'),
  partWeight: partParsed.colIndex('single part weight (grams)'),
  packingQty: partParsed.colIndex('Packing Qty'),
  bagsPerBinBox: partParsed.colIndex('No of Bag per bin/Box'),
  primaryPacking: partParsed.colIndex('Primary Packing'),
  secondaryPacking: partParsed.colIndex('Secondary Packing'),
  trimReq: partParsed.colIndex('Trim Req'),
  inspectionReq: partParsed.colIndex('Inspection Req'),
  packingReq: partParsed.colIndex('Packing Req'),
  dispatchReq: partParsed.colIndex('Dispatch Req'),
  sellingPrice: partParsed.colIndex('Selling Price'),
  wc1: partParsed.colIndex('Workcenter 1'),
  ct1: pHeaders.indexOf('Cycle Time in sec'),
  wc2: partParsed.colIndex('Workcenter 2'),
  ct2: pHeaders.indexOf('Cycle Time in sec') + 2,
  wc3: partParsed.colIndex('Workcenter 3'),
  ct3: pHeaders.indexOf('Cycle Time in sec') + 4,
  wc4: partParsed.colIndex('Workcenter 4'),
  ct4: pHeaders.indexOf('Cycle Time in sec') + 6
};

const parts = [];
partParsed.dataRows.forEach((r, i) => {
  if (!r || r.every(v => v === '')) return;
  const shrpName = String(r[pCol.shrpName] || r[pCol.partNo] || '').trim();
  if (!shrpName) return;

  const workcenters = [];
  if (r[pCol.wc1]) workcenters.push({ wc: String(r[pCol.wc1]).trim(), cycleTime: Number(r[pCol.ct1]) || 0, order: 1 });
  if (r[pCol.wc2]) workcenters.push({ wc: String(r[pCol.wc2]).trim(), cycleTime: Number(r[pCol.ct2]) || 0, order: 2 });
  if (r[pCol.wc3]) workcenters.push({ wc: String(r[pCol.wc3]).trim(), cycleTime: Number(r[pCol.ct3]) || 0, order: 3 });
  if (r[pCol.wc4]) workcenters.push({ wc: String(r[pCol.wc4]).trim(), cycleTime: Number(r[pCol.ct4]) || 0, order: 4 });

  parts.push({
    shrpPartCode: shrpName,
    customerPartNo: String(r[pCol.partNo] || '').trim(),
    partName: String(r[pCol.desc] || shrpName).trim(),
    batchPartCode: String(r[pCol.batchCode] || '').trim(),
    cavityCount: Number(r[pCol.cavities]) || 1,
    customerName: String(r[pCol.customer] || '').trim(),
    materialGrade: String(r[pCol.material] || '').trim(),
    colour: String(r[pCol.colour] || '').trim(),
    rmRatio: {
      grade1: r[pCol.grade1],
      grade2: r[pCol.grade2],
      mb: r[pCol.mb],
      colourRegrind: r[pCol.colourRegrind],
      naturalRegrind: r[pCol.naturalRegrind]
    },
    shotWt: Number(r[pCol.shotWeight]) || 0,
    partWeightG: Number(r[pCol.partWeight]) || 0,
    standardPackQty: Number(r[pCol.packingQty]) || 0,
    bagsPerBinBox: Number(r[pCol.bagsPerBinBox]) || null,
    primaryPacking: String(r[pCol.primaryPacking] || '').trim(),
    secondaryPacking: String(r[pCol.secondaryPacking] || '').trim(),
    trimRequired: String(r[pCol.trimReq] || '').trim().toUpperCase() === 'Y',
    inspectionRequired: String(r[pCol.inspectionReq] || '').trim().toUpperCase() === 'Y',
    packingRequired: String(r[pCol.packingReq] || '').trim().toUpperCase() === 'Y',
    dispatchRequired: String(r[pCol.dispatchReq] || '').trim().toUpperCase() === 'Y',
    sellingPrice: Number(r[pCol.sellingPrice]) || 0,
    workcenters
  });
});

// 2. MOULDS
const mouldParsed = parseSheetDynamic(erpFile, 'Mould Details', ['Mould Identi. No.', 'Part Name / Part No.', 'NO OF CAVITY']);
const mCol = {
  mouldNo: mouldParsed.colIndex('Mould Identi. No.'),
  partNo: mouldParsed.colIndex('Part Name / Part No.'),
  shrpPartName: mouldParsed.colIndex('SHRP Part Name'),
  yom: mouldParsed.colIndex('YOM'),
  cavities: mouldParsed.colIndex('NO OF CAVITY'),
  rawMaterial: mouldParsed.colIndex('Raw Material'),
  mouldType: mouldParsed.colIndex('mould type'),
  gateType: mouldParsed.colIndex('Gate type'),
  toolMaker: mouldParsed.colIndex('TOOL MAKER'),
  suitableMachines: mouldParsed.colIndex('Suitable Mach'),
  ownedBy: mouldParsed.colIndex('Tool  Owned by'),
  customerName: mouldParsed.colIndex('Customer Name'),
  rackNo: mouldParsed.colIndex('Rack No')
};

const moulds = [];
mouldParsed.dataRows.forEach((r, i) => {
  if (!r || r.every(v => v === '')) return;
  const mouldNo = String(r[mCol.mouldNo] || '').trim();
  if (!mouldNo) return;
  moulds.push({
    mouldCode: mouldNo,
    mouldName: `${mouldNo} - ${String(r[mCol.shrpPartName] || r[mCol.partNo] || '').trim()}`,
    partNo: String(r[mCol.partNo] || '').trim(),
    shrpPartName: String(r[mCol.shrpPartName] || '').trim(),
    yom: Number(r[mCol.yom]) || null,
    cavityCount: Number(r[mCol.cavities]) || 1,
    rawMaterial: String(r[mCol.rawMaterial] || '').trim(),
    mouldType: String(r[mCol.mouldType] || '').trim(),
    gateType: String(r[mCol.gateType] || '').trim(),
    maker: String(r[mCol.toolMaker] || '').trim(),
    suitableMachines: String(r[mCol.suitableMachines] || '').trim(),
    ownership: String(r[mCol.ownedBy] || '').trim().toUpperCase() === 'CUSTOMER' ? 'Customer' : 'SHRP',
    customerName: String(r[mCol.customerName] || '').trim(),
    rackNo: String(r[mCol.rackNo] || '').trim()
  });
});

// 3. CUSTOMERS
const custParsed = parseSheetDynamic(erpFile, 'Customer Details', ['Customer Ref No', 'CUSTOMER NAME', 'GST NUMBER']);
const cCol = {
  refNo: custParsed.colIndex('Customer Ref No'),
  shortName: custParsed.colIndex('Short Name'),
  custName: custParsed.colIndex('CUSTOMER NAME'),
  address: custParsed.colIndex('ADDRESS'),
  gst: custParsed.colIndex('GST NUMBER'),
  pan: custParsed.colIndex('PAN NUMBER'),
  stateCode: custParsed.colIndex('STATE CODE'),
  plantCode: custParsed.colIndex('PLANT CODE'),
  vendorCode: custParsed.colIndex('VENDOR CODE'),
  poNo: custParsed.colIndex('PO No:'),
  gstType: custParsed.colIndex('GST TYPE')
};

const customers = [];
custParsed.dataRows.forEach((r, i) => {
  if (!r || r.every(v => v === '')) return;
  const refNo = String(r[cCol.refNo] || '').trim();
  if (!refNo) return;
  customers.push({
    customerCode: refNo,
    customerName: String(r[cCol.custName] || '').trim(),
    shortName: String(r[cCol.shortName] || '').trim(),
    address: String(r[cCol.address] || '').trim(),
    gstin: String(r[cCol.gst] || '').trim(),
    pan: String(r[cCol.pan] || '').trim(),
    stateCode: String(r[cCol.stateCode] || '').trim(),
    plantCode: String(r[cCol.plantCode] || '').trim(),
    vendorCode: String(r[cCol.vendorCode] || '').trim(),
    poNo: String(r[cCol.poNo] || '').trim(),
    gstType: String(r[cCol.gstType] || '').trim()
  });
});

// 4. SUPPLIERS
const suppParsed = parseSheetDynamic(erpFile, 'Supplier Details', ['Supplier Code No', 'GST Number', 'Contact Details']);
const sCol = {
  suppCode: suppParsed.colIndex('Supplier Code No'),
  suppName: suppParsed.colIndex('Supplier Name'),
  gst: suppParsed.colIndex('GST Number'),
  address: suppParsed.colIndex('Address'),
  contactPerson: suppParsed.colIndex('Contact Person'),
  mobile: suppParsed.colIndex('Mobile'),
  email: suppParsed.colIndex('E-mail'),
  scope: suppParsed.colIndex('Scope & Supply')
};

const suppliers = [];
suppParsed.dataRows.forEach((r, i) => {
  if (!r || r.every(v => v === '')) return;
  const code = String(r[sCol.suppCode] || '').trim();
  if (!code) return;
  const addr = String(r[sCol.address] || '').trim();
  let name = String(r[sCol.suppName] || '').trim();
  if (!name && addr) {
    name = addr.split('\n')[0].replace('M/s.', '').trim();
  }
  suppliers.push({
    supplierCode: code,
    supplierName: name,
    gstin: String(r[sCol.gst] || '').trim(),
    address: addr,
    contactPerson: String(r[sCol.contactPerson] || '').trim(),
    mobile: String(r[sCol.mobile] || '').trim(),
    email: String(r[sCol.email] || '').trim(),
    scopeOfSupply: String(r[sCol.scope] || '').trim()
  });
});

// 5. MACHINES
const machParsed = parseSheetDynamic(erpFile, 'Machine Details', ['Machine No.', 'Machine Description', 'Make']);
const mcCol = {
  machineNo: machParsed.colIndex('Machine No.'),
  desc: machParsed.colIndex('Machine Description'),
  make: machParsed.colIndex('Make'),
  capacity: machParsed.colIndex('Capacity'),
  type: machParsed.colIndex('Type'),
  dimension: machParsed.colIndex('Dimension'),
  screwDia: machParsed.colIndex('Screw Dia'),
  maxShotWeight: machParsed.colIndex('Max Shot Weight'),
  hp: machParsed.colIndex('HP'),
  yom: machParsed.colIndex('Installation'),
  hourlyRate: machParsed.colIndex('Machine Rate/Hr'),
  hasCounter: machParsed.colIndex('Counter Available'),
  status: machParsed.colIndex('status'),
  category: machParsed.colIndex('PRODUCTION')
};

const machines = [];
machParsed.dataRows.forEach((r, i) => {
  if (!r || r.every(v => v === '')) return;
  const machineNo = String(r[mcCol.machineNo] || '').trim();
  if (!machineNo) return;
  machines.push({
    machineCode: machineNo,
    description: String(r[mcCol.desc] || machineNo).trim(),
    make: String(r[mcCol.make] || '').trim(),
    tonnage: parseInt(String(r[mcCol.capacity]).replace(/[^0-9]/g, '')) || 50,
    machineType: String(r[mcCol.type] || '').trim(),
    dimension: String(r[mcCol.dimension] || '').trim(),
    screwDia: Number(r[mcCol.screwDia]) || null,
    maxShotWeight: Number(r[mcCol.maxShotWeight]) || null,
    hp: Number(r[mcCol.hp]) || null,
    installationYear: Number(r[mcCol.yom]) || null,
    hourlyRate: Number(r[mcCol.hourlyRate]) || 0,
    hasCounter: String(r[mcCol.hasCounter] || '').trim().toUpperCase() === 'YES',
    status: String(r[mcCol.status] || 'ACTIVE').trim().toUpperCase(),
    category: String(r[mcCol.category] || 'PRODUCTION').trim()
  });
});

// 6. GAUGES
const instParsed = parseSheetDynamic(erpFile, 'List of Instruments', ['MMR & GAUSES CODE NO', 'DESCRIPTION', 'RANGE']);
const gCol = {
  code: instParsed.colIndex('MMR & GAUSES CODE NO'),
  desc: instParsed.colIndex('DESCRIPTION'),
  range: instParsed.colIndex('RANGE'),
  serialNo: instParsed.colIndex('SERIAL NO'),
  leastCount: instParsed.colIndex('LEAST COUNT'),
  criteria: instParsed.colIndex('ACCEPTANCE CRITERIA'),
  make: instParsed.colIndex('MAKE'),
  frequency: instParsed.colIndex('CALIBRATION FREQUENCY'),
  source: instParsed.colIndex('CALIBRATION SOURCE'),
  location: instParsed.colIndex('LOCATION'),
  doneOn: instParsed.colIndex('CALIBRATION DONE ON'),
  dueOn: instParsed.colIndex('CALIBRATION DUE ON')
};

const gauges = [];
instParsed.dataRows.forEach((r, i) => {
  if (!r || r.every(v => v === '') || i >= 25) return;
  const code = String(r[gCol.code] || '').trim();
  const desc = String(r[gCol.desc] || '').trim();
  if (!code || code === '#' || typeof r[0] !== 'number' || !/[A-Za-z]/.test(code)) return;
  gauges.push({
    gaugeCode: code,
    gaugeName: desc,
    rangeSpec: String(r[gCol.range] || '').trim(),
    serialNo: String(r[gCol.serialNo] || '').trim(),
    accuracy: String(r[gCol.leastCount] || '').trim(),
    acceptanceCriteria: String(r[gCol.criteria] || '').trim(),
    make: String(r[gCol.make] || '').trim(),
    calibrationFrequency: String(r[gCol.frequency] || '').trim(),
    calibrationAgency: String(r[gCol.source] || '').trim(),
    location: String(r[gCol.location] || '').trim(),
    lastCalibratedAt: r[gCol.doneOn] || null,
    nextCalibrationDue: r[gCol.dueOn] || null
  });
});

// BUILD SQL STATEMENTS
let sql = `-- ==============================================================================
-- MIGRATION: 002_reconcile_erp_masters.sql
-- DESCRIPTION: One-time authoritative master data reconciliation from ERP Master Requirements
-- IDEMPOTENT: Safe to re-run; uses atomic transaction, table backups, and ON CONFLICT UPSERTs.
-- ==============================================================================

BEGIN;

-- 1. Table Backups for 100% Rollback Safety
CREATE TABLE IF NOT EXISTS parts_backup_pre_reconcile AS SELECT * FROM parts;
CREATE TABLE IF NOT EXISTS moulds_backup_pre_reconcile AS SELECT * FROM moulds;
CREATE TABLE IF NOT EXISTS customers_backup_pre_reconcile AS SELECT * FROM customers;
CREATE TABLE IF NOT EXISTS suppliers_backup_pre_reconcile AS SELECT * FROM suppliers;
CREATE TABLE IF NOT EXISTS machines_backup_pre_reconcile AS SELECT * FROM machines;
CREATE TABLE IF NOT EXISTS gauges_backup_pre_reconcile AS SELECT * FROM gauges;

-- 2. Ensure Schema Columns & Relational Tables
CREATE TABLE IF NOT EXISTS part_machines (
  part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  PRIMARY KEY (part_id, machine_id)
);
ALTER TABLE part_machines ADD COLUMN IF NOT EXISTS cycle_time_sec NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE part_machines ADD COLUMN IF NOT EXISTS workcenter_order INTEGER NOT NULL DEFAULT 1;
ALTER TABLE part_machines ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_part_machines_part ON part_machines(part_id);
CREATE INDEX IF NOT EXISTS idx_part_machines_machine ON part_machines(machine_id);

ALTER TABLE parts ADD COLUMN IF NOT EXISTS batch_part_code TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS shrp_part_code TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS customer_part_no TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS part_weight_g NUMERIC;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS shot_weight_g NUMERIC;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS material_grade TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS selling_price NUMERIC DEFAULT 0;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS primary_packing TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS secondary_packing TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS bags_per_box INTEGER;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS rm_ratio JSONB DEFAULT '{}';

ALTER TABLE moulds ADD COLUMN IF NOT EXISTS yom INTEGER;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS mould_type TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS gate_type TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS maker TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS tool_maker TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS rack_no TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS suitable_machines TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS customer_name TEXT;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS short_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gstin TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pan_no TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS plant_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS vendor_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS po_no TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gst_type TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS scope_of_supply TEXT;

ALTER TABLE machines ADD COLUMN IF NOT EXISTS is_key_machine BOOLEAN DEFAULT FALSE;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS has_counter BOOLEAN DEFAULT TRUE;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'PRODUCTION';
ALTER TABLE machines ADD COLUMN IF NOT EXISTS make TEXT;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS machine_type TEXT;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS dimension TEXT;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS screw_dia NUMERIC;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS max_shot_weight_g NUMERIC;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS hp NUMERIC;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS year_of_commission INTEGER;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS hourly_rate_inr NUMERIC DEFAULT 450;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS tonnage NUMERIC;

ALTER TABLE gauges ADD COLUMN IF NOT EXISTS serial_no TEXT;
ALTER TABLE gauges ADD COLUMN IF NOT EXISTS make TEXT;
ALTER TABLE gauges ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT;
ALTER TABLE gauges ADD COLUMN IF NOT EXISTS calibration_agency TEXT;
ALTER TABLE gauges ADD COLUMN IF NOT EXISTS calibration_frequency TEXT;
ALTER TABLE gauges ADD COLUMN IF NOT EXISTS next_calibration_due TEXT;
ALTER TABLE gauges ADD COLUMN IF NOT EXISTS last_calibrated_text TEXT;

-- 3. Upsert 22 Machines
`;

machines.forEach(m => {
  sql += `
INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES (${escapeSql(m.machineCode)}, ${escapeSql(m.description)}, ${escapeSql(m.make)}, ${m.tonnage}, ${escapeSql(m.machineType)}, ${escapeSql(m.dimension)}, ${m.screwDia || 'NULL'}, ${m.maxShotWeight || 'NULL'}, ${m.hp || 'NULL'}, ${m.installationYear || 'NULL'}, ${m.hourlyRate}, ${m.hasCounter ? 'TRUE' : 'FALSE'}, ${escapeSql(m.category)}, TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;
`;
});

sql += `\n-- 4. Upsert 10 Customers (SHRP/CUS-001 Series)\n`;
customers.forEach(c => {
  sql += `
DO $$
BEGIN
  UPDATE customers SET
    customer_code = ${escapeSql(c.customerCode)},
    short_name = ${escapeSql(c.shortName)},
    address = ${escapeSql(c.address)},
    gstin = ${escapeSql(c.gstin)},
    pan_no = ${escapeSql(c.pan)},
    state_code = ${escapeSql(c.stateCode)},
    plant_code = ${escapeSql(c.plantCode)},
    vendor_code = ${escapeSql(c.vendorCode)},
    po_no = ${escapeSql(c.poNo)},
    gst_type = ${escapeSql(c.gstType)},
    active = TRUE
  WHERE (customer_code IS NOT NULL AND customer_code = ${escapeSql(c.customerCode)}) OR lower(name) = lower(${escapeSql(c.customerName)});

  IF NOT FOUND THEN
    INSERT INTO customers (customer_code, name, short_name, address, gstin, pan_no, state_code, plant_code, vendor_code, po_no, gst_type, active)
    VALUES (${escapeSql(c.customerCode)}, ${escapeSql(c.customerName)}, ${escapeSql(c.shortName)}, ${escapeSql(c.address)}, ${escapeSql(c.gstin)}, ${escapeSql(c.pan)}, ${escapeSql(c.stateCode)}, ${escapeSql(c.plantCode)}, ${escapeSql(c.vendorCode)}, ${escapeSql(c.poNo)}, ${escapeSql(c.gstType)}, TRUE);
  END IF;
END $$;
`;
});

sql += `\n-- 5. Upsert 11 Suppliers (SHRP/SUP-01 Series)\n`;
suppliers.forEach(s => {
  sql += `
INSERT INTO suppliers (supplier_code, supplier_name, gstin, address, contact_person, mobile, email, scope_of_supply, active)
VALUES (${escapeSql(s.supplierCode)}, ${escapeSql(s.supplierName)}, ${escapeSql(s.gstin)}, ${escapeSql(s.address)}, ${escapeSql(s.contactPerson)}, ${escapeSql(s.mobile)}, ${escapeSql(s.email)}, ${escapeSql(s.scopeOfSupply)}, TRUE)
ON CONFLICT (supplier_code) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  gstin = EXCLUDED.gstin,
  address = EXCLUDED.address,
  contact_person = EXCLUDED.contact_person,
  mobile = EXCLUDED.mobile,
  email = EXCLUDED.email,
  scope_of_supply = EXCLUDED.scope_of_supply,
  active = TRUE;
`;
});

sql += `\n-- 6. Upsert 25 Gauges & Calibration Master\n`;
gauges.forEach(g => {
  sql += `
INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES (${escapeSql(g.gaugeCode)}, ${escapeSql(g.gaugeName)}, ${escapeSql(g.rangeSpec)}, ${escapeSql(g.accuracy)}, ${escapeSql(g.serialNo)}, ${escapeSql(g.make)}, ${escapeSql(g.acceptanceCriteria)}, ${escapeSql(g.calibrationAgency)}, ${escapeSql(g.calibrationFrequency)}, ${escapeSql(g.location)}, ${escapeSql(String(g.lastCalibratedAt || ''))}, ${escapeSql(String(g.nextCalibrationDue || ''))}, 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';
`;
});

sql += `\n-- 7. Upsert 76 Parts & Workcenter Linkages\n`;
sql += `
-- Avoid unique constraint collisions during batch rename by prefixing all codes temporarily
UPDATE parts SET part_code = 'TEMP_' || id;
`;

parts.forEach((p, idx) => {
  const defaultCycleTime = p.workcenters.length > 0 ? p.workcenters[0].cycleTime : 30;
  const partCode = 'SHRP-P' + String(idx + 1).padStart(3, '0');
  sql += `
DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  SELECT id INTO v_part_id FROM parts
  WHERE (shrp_part_code IS NOT NULL AND lower(shrp_part_code) = lower(${escapeSql(p.shrpPartCode)}))
     OR (customer_part_no IS NOT NULL AND lower(customer_part_no) = lower(${escapeSql(p.customerPartNo)}))
     OR lower(part_code) = lower(${escapeSql(partCode)})
     OR lower(part_code) = lower('TEMP_' || ${escapeSql(p.shrpPartCode)})
     OR lower(part_code) = lower(${escapeSql(p.shrpPartCode)})
     OR lower(part_code) = lower(${escapeSql(p.customerPartNo)})
  ORDER BY
    CASE WHEN shrp_part_code IS NOT NULL AND lower(shrp_part_code) = lower(${escapeSql(p.shrpPartCode)}) THEN 1 ELSE 2 END,
    active DESC,
    id ASC
  LIMIT 1;

  IF v_part_id IS NOT NULL THEN
    UPDATE parts SET
      part_code = ${escapeSql(partCode)},
      part_name = ${escapeSql(p.partName)},
      shrp_part_code = ${escapeSql(p.shrpPartCode)},
      customer_part_no = ${escapeSql(p.customerPartNo)},
      batch_part_code = ${escapeSql(p.batchPartCode)},
      cavity_count = ${p.cavityCount},
      standard_cycle_time_sec = ${defaultCycleTime},
      part_weight_g = ${p.partWeightG},
      unit_weight_g = ${p.shotWt},
      shot_weight_g = ${p.shotWt},
      standard_pack_qty = ${p.standardPackQty},
      trim_required = ${p.trimRequired ? 'TRUE' : 'FALSE'},
      inspection_required = ${p.inspectionRequired ? 'TRUE' : 'FALSE'},
      packing_required = ${p.packingRequired ? 'TRUE' : 'FALSE'},
      dispatch_required = ${p.dispatchRequired ? 'TRUE' : 'FALSE'},
      material_grade = ${escapeSql(p.materialGrade)},
      color = ${escapeSql(p.colour)},
      selling_price = ${p.sellingPrice},
      primary_packing = ${escapeSql(p.primaryPacking)},
      secondary_packing = ${escapeSql(p.secondaryPacking)},
      bags_per_box = ${p.bagsPerBinBox || 'NULL'},
      rm_ratio = ${escapeSql(JSON.stringify(p.rmRatio))}::jsonb,
      active = TRUE
    WHERE id = v_part_id;
  ELSE
    INSERT INTO parts (
      part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
      cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
      standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
      material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
    )
    VALUES (
      ${escapeSql(partCode)}, ${escapeSql(p.partName)}, ${escapeSql(p.shrpPartCode)}, ${escapeSql(p.customerPartNo)}, ${escapeSql(p.batchPartCode)},
      ${p.cavityCount}, ${defaultCycleTime}, ${p.partWeightG}, ${p.shotWt}, ${p.shotWt},
      ${p.standardPackQty}, ${p.trimRequired ? 'TRUE' : 'FALSE'}, ${p.inspectionRequired ? 'TRUE' : 'FALSE'}, ${p.packingRequired ? 'TRUE' : 'FALSE'}, ${p.dispatchRequired ? 'TRUE' : 'FALSE'},
      ${escapeSql(p.materialGrade)}, ${escapeSql(p.colour)}, ${p.sellingPrice}, ${escapeSql(p.primaryPacking)}, ${escapeSql(p.secondaryPacking)}, ${p.bagsPerBinBox || 'NULL'}, ${escapeSql(JSON.stringify(p.rmRatio))}::jsonb, TRUE
    )
    RETURNING id INTO v_part_id;
  END IF;
`;

  p.workcenters.forEach(wc => {
    const cleanWc = wc.wc.replace(/[\s\-_]/g, '').toLowerCase();
    sql += `
  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, ${wc.cycleTime}, ${wc.order}
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = '${cleanWc}'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
`;
  });

  sql += `END $$;\n`;
});

sql += `\n-- 8. Upsert 69 Moulds & Tooling Linkages\n`;
moulds.forEach(m => {
  sql += `
DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    ${escapeSql(m.mouldCode)}, ${escapeSql(m.mouldName)}, ${escapeSql(m.ownership)}, ${escapeSql(m.customerName)}, ${m.cavityCount}, ${m.cavityCount},
    ${m.yom || 'NULL'}, ${escapeSql(m.mouldType)}, ${escapeSql(m.gateType)}, ${escapeSql(m.maker)}, ${escapeSql(m.suitableMachines)}, ${escapeSql(m.rackNo)}, 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, ${m.cavityCount}
  FROM parts
  WHERE lower(shrp_part_code) = lower(${escapeSql(m.shrpPartName)}) OR lower(part_code) = lower(${escapeSql(m.partNo)}) OR lower(customer_part_no) = lower(${escapeSql(m.partNo)})
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;\n`;
});

sql += `\nCOMMIT;\n`;

const outPath1 = path.join(__dirname, '..', 'db', 'migrations', '002_reconcile_erp_masters.sql');
const outPath2 = path.join(__dirname, '..', 'db', 'seed_reconcile_erp_masters.sql');

fs.mkdirSync(path.dirname(outPath1), { recursive: true });
fs.writeFileSync(outPath1, sql, 'utf8');
fs.writeFileSync(outPath2, sql, 'utf8');

console.log(`Generated migration file: ${outPath1} (${(sql.length / 1024).toFixed(1)} KB)`);
console.log(`Generated seed file:      ${outPath2}`);
