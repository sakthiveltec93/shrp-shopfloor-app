const path = require('path');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');
const wb = XLSX.readFile(formFile);

async function compareStages() {
  const dbTrims = (await pool.query('SELECT te.id, b.bag_code FROM trim_entries te JOIN bags b ON te.bag_id = b.id')).rows;
  const dbTrimCodes = new Set(dbTrims.map(t => t.bag_code.trim().toUpperCase()));

  const dbInsps = (await pool.query('SELECT ie.id, b.bag_code FROM inspection_entries ie JOIN bags b ON ie.bag_id = b.id')).rows;
  const dbInspCodes = new Set(dbInsps.map(i => i.bag_code.trim().toUpperCase()));

  const dbPacks = (await pool.query('SELECT pe.id, b.bag_code FROM packing_entries pe JOIN bags b ON pe.bag_id = b.id')).rows;
  const dbPackCodes = new Set(dbPacks.map(p => p.bag_code.trim().toUpperCase()));

  console.log('Live DB Counts:', { trims: dbTrims.length, insps: dbInsps.length, packs: dbPacks.length });

  // 1. TRIM_LOG
  const tSheet = wb.Sheets['TRIM_LOG'];
  const tRaw = XLSX.utils.sheet_to_json(tSheet, { header: 1, defval: '' });
  const tHeaderIdx = tRaw.findIndex(r => r.some(c => String(c).toLowerCase().includes('batch no') || String(c).toLowerCase().includes('bag barcode')));
  const tHeaders = tRaw[tHeaderIdx].map(h => String(h).trim());
  const tCol = (name) => tHeaders.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
  const tRows = tRaw.slice(tHeaderIdx + 1).filter(r => r[tCol('batch no')]);

  let tExist = 0, tNew = 0;
  tRows.forEach(r => {
    const code = String(r[tCol('batch no')]).trim().toUpperCase();
    if (dbTrimCodes.has(code)) tExist++;
    else tNew++;
  });

  // 2. INSPECTION_LOG
  const iSheet = wb.Sheets['INSPECTION_LOG'];
  const iRaw = XLSX.utils.sheet_to_json(iSheet, { header: 1, defval: '' });
  const iHeaderIdx = iRaw.findIndex(r => r.some(c => String(c).toLowerCase().includes('batch no') || String(c).toLowerCase().includes('bag barcode')));
  const iHeaders = iRaw[iHeaderIdx].map(h => String(h).trim());
  const iCol = (name) => iHeaders.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
  const iRows = iRaw.slice(iHeaderIdx + 1).filter(r => r[iCol('batch no')]);

  let iExist = 0, iNew = 0;
  iRows.forEach(r => {
    const code = String(r[iCol('batch no')]).trim().toUpperCase();
    if (dbInspCodes.has(code)) iExist++;
    else iNew++;
  });

  // 3. PACKING_LOG
  const pSheet = wb.Sheets['PACKING_LOG'];
  const pRaw = XLSX.utils.sheet_to_json(pSheet, { header: 1, defval: '' });
  const pHeaderIdx = pRaw.findIndex(r => r.some(c => String(c).toLowerCase().includes('batch no') || String(c).toLowerCase().includes('bag barcode')));
  const pHeaders = pRaw[pHeaderIdx].map(h => String(h).trim());
  const pCol = (name) => pHeaders.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
  const pRows = pRaw.slice(pHeaderIdx + 1).filter(r => r[pCol('batch no')]);

  let pExist = 0, pNew = 0;
  pRows.forEach(r => {
    const code = String(r[pCol('batch no')]).trim().toUpperCase();
    if (dbPackCodes.has(code)) pExist++;
    else pNew++;
  });

  console.log(`TRIM_LOG (${tRows.length} in sheet): Existing in DB = ${tExist}, New = ${tNew}`);
  console.log(`INSPECTION_LOG (${iRows.length} in sheet): Existing in DB = ${iExist}, New = ${iNew}`);
  console.log(`PACKING_LOG (${pRows.length} in sheet): Existing in DB = ${pExist}, New = ${pNew}`);

  await pool.end();
}
compareStages().catch(console.error);
