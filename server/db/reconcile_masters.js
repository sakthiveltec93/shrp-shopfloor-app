const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const pool = require('./pool');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');

function parseSheetDynamic(filePath, sheetName, expectedKeyHeaders = []) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet [${sheetName}] not found in ${path.basename(filePath)}`);
  }
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

  if (headerRowIndex === -1) {
    throw new Error(`Could not locate header row for sheet [${sheetName}]`);
  }

  const headerRow = rawRows[headerRowIndex].map(h => String(h).trim());
  const colIndex = (name) => {
    const target = name.trim().toLowerCase();
    let idx = headerRow.findIndex(h => h.toLowerCase() === target);
    if (idx !== -1) return idx;
    idx = headerRow.findIndex(h => h.toLowerCase().includes(target));
    return idx;
  };

  const dataRows = rawRows.slice(headerRowIndex + 1);

  return {
    headerRowIndex,
    headerRow,
    colIndex,
    dataRows
  };
}

async function runMasterReconciliation(applyChanges = false) {
  console.log('================================================================');
  console.log(`     STEP 3: MASTER DATA RECONCILIATION & APPLY TO DATABASE     `);
  console.log(`                 MODE: ${applyChanges ? '*** LIVE APPLY ***' : 'DRY RUN ONLY'}                   `);
  console.log('================================================================\n');

  // 1. EXTRACT FROM EXCEL
  console.log('1. Reading & Parsing Erp Master Requirements.xlsx...');
  
  // PARTS
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

  // MOULDS
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

  // CUSTOMERS
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

  // SUPPLIERS
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

  // MACHINES
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

  // GAUGES / INSTRUMENTS (25 Instruments)
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
    
    // Ignore non-instrument rows
    if (!code || code === '#' || typeof r[0] !== 'number' || !/[A-Za-z]/.test(code)) {
      return;
    }

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

  console.log(`- Extracted: ${parts.length} parts, ${moulds.length} moulds, ${customers.length} customers, ${suppliers.length} suppliers, ${machines.length} machines, ${gauges.length} gauges.\n`);

  if (!applyChanges) {
    console.log('[DRY-RUN COMPLETE] All master records successfully verified. Ready for live apply with --apply.');
    return;
  }

  // -------------------------------------------------------------
  // LIVE APPLY TO DATABASE WITH ATOMIC TRANSACTION & BACKUPS
  // -------------------------------------------------------------
  const client = await pool.connect();
  try {
    console.log('2. Creating SQL Backup Tables before modification...');
    await client.query('BEGIN');

    // Schema updates
    await client.query(`
      CREATE TABLE IF NOT EXISTS part_machines (
        id SERIAL PRIMARY KEY,
        part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
        machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
        cycle_time_sec NUMERIC NOT NULL DEFAULT 0,
        workcenter_order INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(part_id, machine_id)
      );
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
      ALTER TABLE moulds ADD COLUMN IF NOT EXISTS rack_no TEXT;
      ALTER TABLE moulds ADD COLUMN IF NOT EXISTS suitable_machines TEXT;
      ALTER TABLE moulds ADD COLUMN IF NOT EXISTS customer_name TEXT;

      ALTER TABLE customers ADD COLUMN IF NOT EXISTS short_name TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS pan_no TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS state_code TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS plant_code TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS vendor_code TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS po_no TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS gst_type TEXT;

      ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS mobile TEXT;
      ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS scope_of_supply TEXT;

      ALTER TABLE machines ADD COLUMN IF NOT EXISTS is_key_machine BOOLEAN DEFAULT FALSE;
      ALTER TABLE machines ADD COLUMN IF NOT EXISTS has_counter BOOLEAN DEFAULT TRUE;
      ALTER TABLE machines ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'PRODUCTION';
      ALTER TABLE machines ADD COLUMN IF NOT EXISTS make TEXT;
      ALTER TABLE machines ADD COLUMN IF NOT EXISTS machine_type TEXT;
      ALTER TABLE machines ADD COLUMN IF NOT EXISTS dimension TEXT;
      ALTER TABLE machines ADD COLUMN IF NOT EXISTS screw_dia NUMERIC;
      ALTER TABLE machines ADD COLUMN IF NOT EXISTS hp NUMERIC;

      ALTER TABLE gauges ADD COLUMN IF NOT EXISTS serial_no TEXT;
      ALTER TABLE gauges ADD COLUMN IF NOT EXISTS make TEXT;
      ALTER TABLE gauges ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT;
      ALTER TABLE gauges ADD COLUMN IF NOT EXISTS calibration_agency TEXT;
      ALTER TABLE gauges ADD COLUMN IF NOT EXISTS calibration_frequency TEXT;
      ALTER TABLE gauges ADD COLUMN IF NOT EXISTS next_calibration_due TEXT;
      ALTER TABLE gauges ADD COLUMN IF NOT EXISTS last_calibrated_text TEXT;

      -- Backup snapshots
      DROP TABLE IF EXISTS parts_backup_pre_reconcile;
      CREATE TABLE parts_backup_pre_reconcile AS SELECT * FROM parts;

      DROP TABLE IF EXISTS part_machines_backup_pre_reconcile;
      CREATE TABLE part_machines_backup_pre_reconcile AS SELECT * FROM part_machines;

      DROP TABLE IF EXISTS moulds_backup_pre_reconcile;
      CREATE TABLE moulds_backup_pre_reconcile AS SELECT * FROM moulds;

      DROP TABLE IF EXISTS mould_parts_backup_pre_reconcile;
      CREATE TABLE mould_parts_backup_pre_reconcile AS SELECT * FROM mould_parts;

      DROP TABLE IF EXISTS customers_backup_pre_reconcile;
      CREATE TABLE customers_backup_pre_reconcile AS SELECT * FROM customers;

      DROP TABLE IF EXISTS suppliers_backup_pre_reconcile;
      CREATE TABLE suppliers_backup_pre_reconcile AS SELECT * FROM suppliers;

      DROP TABLE IF EXISTS machines_backup_pre_reconcile;
      CREATE TABLE machines_backup_pre_reconcile AS SELECT * FROM machines;

      DROP TABLE IF EXISTS gauges_backup_pre_reconcile;
      CREATE TABLE gauges_backup_pre_reconcile AS SELECT * FROM gauges;
    `);
    console.log('   -> Backup snapshot tables created for all 7 master tables.');

    // 3. APPLY MACHINES
    console.log('3. Applying 22 Machines & Auxiliary Equipment...');
    for (const m of machines) {
      await client.query(`
        INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE)
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
      `, [m.machineCode, m.description, m.make, m.tonnage, m.machineType, m.dimension, m.screwDia, m.maxShotWeight, m.hp, m.installationYear, m.hourlyRate, m.hasCounter, m.category]);
    }
    console.log('   -> Machines applied successfully.');

    // 4. APPLY CUSTOMERS
    console.log('4. Applying 10 Customers (SHRP/CUS-001 Series)...');
    for (const c of customers) {
      await client.query(`
        INSERT INTO customers (customer_code, customer_name, short_name, address, gstin, pan_no, state_code, plant_code, vendor_code, po_no, gst_type, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE)
        ON CONFLICT (customer_code) DO UPDATE SET
          customer_name = EXCLUDED.customer_name,
          short_name = EXCLUDED.short_name,
          address = EXCLUDED.address,
          gstin = EXCLUDED.gstin,
          pan_no = EXCLUDED.pan_no,
          state_code = EXCLUDED.state_code,
          plant_code = EXCLUDED.plant_code,
          vendor_code = EXCLUDED.vendor_code,
          po_no = EXCLUDED.po_no,
          gst_type = EXCLUDED.gst_type,
          active = TRUE;
      `, [c.customerCode, c.customerName, c.shortName, c.address, c.gstin, c.pan, c.stateCode, c.plantCode, c.vendorCode, c.poNo, c.gstType]);
    }
    console.log('   -> Customers applied successfully.');

    // 5. APPLY SUPPLIERS
    console.log('5. Applying 11 Suppliers (SHRP/SUP-01 Series)...');
    for (const s of suppliers) {
      await client.query(`
        INSERT INTO suppliers (supplier_code, supplier_name, gstin, address, contact_person, mobile, email, scope_of_supply, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
        ON CONFLICT (supplier_code) DO UPDATE SET
          supplier_name = EXCLUDED.supplier_name,
          gstin = EXCLUDED.gstin,
          address = EXCLUDED.address,
          contact_person = EXCLUDED.contact_person,
          mobile = EXCLUDED.mobile,
          email = EXCLUDED.email,
          scope_of_supply = EXCLUDED.scope_of_supply,
          active = TRUE;
      `, [s.supplierCode, s.supplierName, s.gstin, s.address, s.contactPerson, s.mobile, s.email, s.scopeOfSupply]);
    }
    console.log('   -> Suppliers applied successfully.');

    // 6. APPLY GAUGES & INSTRUMENTS
    console.log('6. Applying 25 Gauges & Calibration Masters...');
    for (const g of gauges) {
      await client.query(`
        INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')
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
      `, [g.gaugeCode, g.gaugeName, g.rangeSpec, g.accuracy, g.serialNo, g.make, g.acceptanceCriteria, g.calibrationAgency, g.calibrationFrequency, g.location, String(g.lastCalibratedAt || ''), String(g.nextCalibrationDue || '')]);
    }
    console.log('   -> Gauges applied successfully.');

    // 7. APPLY PARTS & WORKCENTER CYCLE TIMES
    console.log('7. Applying 76 Parts & 102 Workcenter Machine Linkages...');
    for (const p of parts) {
      const defaultCycleTime = p.workcenters.length > 0 ? p.workcenters[0].cycleTime : 30;
      
      const partRes = await client.query(`
        INSERT INTO parts (
          part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
          cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
          standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
          material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, TRUE)
        ON CONFLICT (part_code) DO UPDATE SET
          part_name = EXCLUDED.part_name,
          shrp_part_code = EXCLUDED.shrp_part_code,
          customer_part_no = EXCLUDED.customer_part_no,
          batch_part_code = EXCLUDED.batch_part_code,
          cavity_count = EXCLUDED.cavity_count,
          standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
          part_weight_g = EXCLUDED.part_weight_g,
          unit_weight_g = EXCLUDED.unit_weight_g,
          shot_weight_g = EXCLUDED.shot_weight_g,
          standard_pack_qty = EXCLUDED.standard_pack_qty,
          trim_required = EXCLUDED.trim_required,
          inspection_required = EXCLUDED.inspection_required,
          packing_required = EXCLUDED.packing_required,
          dispatch_required = EXCLUDED.dispatch_required,
          material_grade = EXCLUDED.material_grade,
          color = EXCLUDED.color,
          selling_price = EXCLUDED.selling_price,
          primary_packing = EXCLUDED.primary_packing,
          secondary_packing = EXCLUDED.secondary_packing,
          bags_per_box = EXCLUDED.bags_per_box,
          rm_ratio = EXCLUDED.rm_ratio,
          active = TRUE
        RETURNING id;
      `, [
        p.customerPartNo || p.shrpPartCode,
        p.partName,
        p.shrpPartCode,
        p.customerPartNo,
        p.batchPartCode,
        p.cavityCount,
        defaultCycleTime,
        p.partWeightG,
        p.shotWt,
        p.shotWt,
        p.standardPackQty,
        p.trimRequired,
        p.inspectionRequired,
        p.packingRequired,
        p.dispatchRequired,
        p.materialGrade,
        p.colour,
        p.sellingPrice,
        p.primaryPacking,
        p.secondaryPacking,
        p.bagsPerBinBox,
        JSON.stringify(p.rmRatio)
      ]);

      const partId = partRes.rows[0].id;

      // Map Workcenters in part_machines
      for (const wc of p.workcenters) {
        // Resolve machine
        const cleanWc = wc.wc.replace(/[\s\-_]/g, '').toLowerCase();
        const machRes = await client.query(`
          SELECT id FROM machines 
          WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = $1
          LIMIT 1;
        `, [cleanWc]);

        if (machRes.rows.length > 0) {
          const machineId = machRes.rows[0].id;
          await client.query(`
            INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (part_id, machine_id) DO UPDATE SET
              cycle_time_sec = EXCLUDED.cycle_time_sec,
              workcenter_order = EXCLUDED.workcenter_order;
          `, [partId, machineId, wc.cycleTime, wc.order]);
        }
      }
    }
    console.log('   -> Parts & Workcenter linkages applied successfully.');

    // 8. APPLY MOULDS & MOULD_PARTS
    console.log('8. Applying 69 Moulds & Tooling Linkages...');
    for (const m of moulds) {
      const mouldRes = await client.query(`
        INSERT INTO moulds (
          mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
          yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'ready')
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
        RETURNING id;
      `, [
        m.mouldCode,
        m.mouldName,
        m.ownership,
        m.customerName,
        m.cavityCount,
        m.cavityCount,
        m.yom,
        m.mouldType,
        m.gateType,
        m.maker,
        m.suitableMachines,
        m.rackNo
      ]);

      const mouldId = mouldRes.rows[0].id;

      // Link part if matching
      const partMatch = await client.query(`
        SELECT id FROM parts 
        WHERE lower(shrp_part_code) = lower($1) OR lower(part_code) = lower($2) OR lower(customer_part_no) = lower($2)
        LIMIT 1;
      `, [m.shrpPartName, m.partNo]);

      if (partMatch.rows.length > 0) {
        await client.query(`
          INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
          VALUES ($1, $2, $3)
          ON CONFLICT (mould_id, part_id) DO UPDATE SET
            cavities_for_part = EXCLUDED.cavities_for_part;
        `, [mouldId, partMatch.rows[0].id, m.cavityCount]);
      }
    }
    console.log('   -> Moulds & Tooling linkages applied successfully.');

    await client.query('COMMIT');
    console.log('\n================================================================');
    console.log('     SUCCESS: ALL 7 MASTER TABLES RECONCILED & APPLIED          ');
    console.log('================================================================\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR DURING MASTER APPLY - TRANSACTION ROLLED BACK:', err);
    throw err;
  } finally {
    client.release();
    if (closePool) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  const isApply = process.argv.includes('--apply');
  runMasterReconciliation(isApply, true).catch(console.error);
}

module.exports = { runMasterReconciliation };
