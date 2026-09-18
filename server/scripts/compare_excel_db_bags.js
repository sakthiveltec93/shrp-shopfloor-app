const path = require('path');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');
const wb = XLSX.readFile(formFile);

async function compareBags() {
  const dbBags = (await pool.query('SELECT id, bag_code, status, qty FROM bags')).rows;
  const dbBagCodes = new Set(dbBags.map(b => b.bag_code.trim().toUpperCase()));
  console.log(`Live DB Bags Count: ${dbBags.length}`);

  const sheet = wb.Sheets['BAG_LOG'];
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const hIdx = raw.findIndex(r => r.some(c => String(c).toLowerCase().includes('bag barcode')));
  const headers = raw[hIdx].map(h => String(h).trim());
  const col = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));

  const rows = raw.slice(hIdx + 1).filter(r => r[col('bag barcode')]);
  console.log(`Excel BAG_LOG Total Rows with Barcode: ${rows.length}`);

  let existingInDb = 0;
  let newToInsert = 0;
  const newSamples = [];

  for (const r of rows) {
    const code = String(r[col('bag barcode')]).trim().toUpperCase();
    if (dbBagCodes.has(code)) {
      existingInDb++;
    } else {
      newToInsert++;
      if (newSamples.length < 5) {
        newSamples.push({
          code,
          batch: r[col('batch no')],
          part: r[col('part no')] || r[col('part')],
          qty: r[col('approx qty')] || r[col('qty')],
          status: r[col('status')]
        });
      }
    }
  }

  console.log(`Bags Summary: Existing in DB = ${existingInDb}, New to Insert = ${newToInsert}`);
  console.log('Sample New Bags:', JSON.stringify(newSamples, null, 2));

  await pool.end();
}
compareBags().catch(console.error);
