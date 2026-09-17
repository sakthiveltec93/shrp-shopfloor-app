const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const wb = XLSX.readFile(erpFile);

// 1. PARTS
const rawParts = XLSX.utils.sheet_to_json(wb.Sheets['Part Details'], { header: 1, defval: '' });
const partsData = [];

for (let i = 2; i < rawParts.length; i++) {
  const r = rawParts[i];
  if (!r || r.every(v => v === '')) continue;
  const shrpName = String(r[1] || r[2] || '').trim();
  if (!shrpName) continue;
  const custNo = String(r[2] || '').trim();
  const pWt = Number(r[15]) || 0;
  const trimReq = String(r[20]).trim().toUpperCase() === 'Y';
  const inspReq = String(r[21]).trim().toUpperCase() === 'Y';
  const packReq = String(r[22]).trim().toUpperCase() === 'Y';
  const dispReq = String(r[23]).trim().toUpperCase() === 'Y';
  const tol = 2;
  const stdPack = Number(r[16]) || 0;
  const cavity = Number(r[5]) || 1;
  const shotWt = Number(r[14]) || 0;
  const batchCode = String(r[4] || '').trim();

  partsData.push([shrpName, custNo, pWt, trimReq, inspReq, packReq, dispReq, tol, stdPack, cavity, shotWt, batchCode]);
}

const cleanPartsContent = `const pool = require('./pool');

// Clean mapping of all 76 active parts from Erp Master Requirements.xlsx Part Details:
// [SHRP Short Code, Customer Drawing No / Part Name, Part Wt (g), TrimReq, InspReq, PackReq, DispReq, TolerancePct, StdPackQty, Cavity, ShotWt, BatchPrefix]
const EXCEL_PARTS = ${JSON.stringify(partsData, null, 2)};

async function syncParts(closePool = false) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const p of EXCEL_PARTS) {
      const [shrpCode, custPartNo, pWt, trimReq, inspReq, packReq, dispReq, tol, stdPack, cavity, shotWt, batchCode] = p;

      const existing = await client.query(
        'SELECT id, part_code FROM parts WHERE part_code = $1 OR shrp_part_code = $1 OR part_code = $2 LIMIT 1',
        [shrpCode, custPartNo]
      );

      if (existing.rows.length > 0) {
        await client.query(
          \`UPDATE parts SET
            shrp_part_code = COALESCE(shrp_part_code, $1),
            customer_part_no = COALESCE(customer_part_no, $2),
            active = TRUE
          WHERE id = $3\`,
          [shrpCode, custPartNo, existing.rows[0].id]
        );
      } else {
        await client.query(
          \`INSERT INTO parts (
            part_code, shrp_part_code, customer_part_no, part_name,
            part_weight_g, trim_required, inspection_required, packing_required, dispatch_required,
            tolerance_pct, standard_pack_qty, cavity_count, unit_weight_g, batch_part_code, active,
            standard_cycle_time_sec
          ) VALUES ($1, $1, $2, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE, 30)\`,
          [shrpCode, custPartNo, pWt, trimReq, inspReq, packReq, dispReq, tol, stdPack, cavity, shotWt, batchCode]
        );
      }
    }

    await client.query('COMMIT');
    const countRes = await client.query('SELECT count(*) FILTER (WHERE active) as active, count(*) as total FROM parts');
    console.log(\`Clean sync complete! Active parts: \${countRes.rows[0].active} (Total: \${countRes.rows[0].total})\`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error syncing parts:', err);
    throw err;
  } finally {
    client.release();
    if (closePool) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  syncParts(true).catch(() => process.exit(1));
}

module.exports = { syncParts, EXCEL_PARTS };
`;

fs.writeFileSync(path.join(__dirname, '..', 'db', 'clean_parts.js'), cleanPartsContent, 'utf8');
console.log('Updated server/db/clean_parts.js with clean 76 parts!');

// 2. MOULDS
const rawMoulds = XLSX.utils.sheet_to_json(wb.Sheets['Mould Details'], { header: 1, defval: '' });
const mouldsData = [];
for (let i = 2; i < rawMoulds.length; i++) {
  const r = rawMoulds[i];
  if (!r || r.every(v => v === '')) continue;
  const mouldNo = String(r[1] || '').trim();
  if (!mouldNo) continue;
  mouldsData.push({
    mould_code: mouldNo,
    mould_name: `${mouldNo} - ${String(r[3] || r[2] || '').trim()}`,
    shrp_part_name: String(r[3] || '').trim(),
    part_no: String(r[2] || '').trim(),
    cavities: Number(r[5]) || 1,
    yom: Number(r[4]) || null,
    raw_material: String(r[6] || '').trim(),
    mould_type: String(r[7] || '').trim(),
    gate_type: String(r[8] || '').trim(),
    tool_maker: String(r[9] || '').trim(),
    suitable_machines: String(r[10] || '').trim(),
    ownership: String(r[11] || '').trim().toUpperCase() === 'CUSTOMER' ? 'Customer' : 'SHRP',
    customer_name: String(r[12] || '').trim(),
    rack_no: String(r[13] || '').trim()
  });
}

const syncMouldsContent = `const pool = require('./pool');

// Clean mapping of all 69 tooling masters from Erp Master Requirements.xlsx Mould Details:
const EXCEL_MOULDS = ${JSON.stringify(mouldsData, null, 2)};

async function syncMoulds(closePool = false) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const m of EXCEL_MOULDS) {
      const existing = await client.query(
        'SELECT id FROM moulds WHERE mould_code = $1 LIMIT 1',
        [m.mould_code]
      );

      let mouldId;
      if (existing.rows.length > 0) {
        mouldId = existing.rows[0].id;
        await client.query(
          \`UPDATE moulds SET
            mould_name = COALESCE(mould_name, $1),
            customer_name = COALESCE(customer_name, $2),
            suitable_machines = COALESCE(suitable_machines, $3),
            status = 'ready'
          WHERE id = $4\`,
          [m.mould_name, m.customer_name, m.suitable_machines, mouldId]
        );
      } else {
        const ins = await client.query(
          \`INSERT INTO moulds (
            mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
            yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
          ) VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9, $10, $11, 'ready')
          RETURNING id\`,
          [
            m.mould_code, m.mould_name, m.ownership, m.customer_name, m.cavities,
            m.yom, m.mould_type, m.gate_type, m.tool_maker, m.suitable_machines, m.rack_no
          ]
        );
        mouldId = ins.rows[0].id;
      }

      // Link part if matching
      const partMatch = await client.query(
        'SELECT id FROM parts WHERE lower(shrp_part_code) = lower($1) OR lower(part_code) = lower($2) OR lower(customer_part_no) = lower($2) LIMIT 1',
        [m.shrp_part_name, m.part_no]
      );

      if (partMatch.rows.length > 0) {
        await client.query(
          \`INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
          VALUES ($1, $2, $3)
          ON CONFLICT (mould_id, part_id) DO NOTHING\`,
          [mouldId, partMatch.rows[0].id, m.cavities]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Mould sync complete! Synced 69 tooling masters.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error syncing moulds:', err);
    throw err;
  } finally {
    client.release();
    if (closePool) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  syncMoulds(true).catch(() => process.exit(1));
}

module.exports = { syncMoulds, EXCEL_MOULDS };
`;

fs.writeFileSync(path.join(__dirname, '..', 'db', 'sync_moulds.js'), syncMouldsContent, 'utf8');
console.log('Updated server/db/sync_moulds.js with clean 69 moulds!');
