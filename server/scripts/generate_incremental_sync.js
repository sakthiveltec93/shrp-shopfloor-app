const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../../scratch/logs_only');
const outSql = path.join(__dirname, '../db/sync_new_logs_26_27.sql');

function convertOADate(val) {
  const num = parseFloat(val);
  if (!isNaN(num) && num > 40000 && num < 60000) {
    const epoch = new Date(1899, 11, 30);
    const d = new Date(epoch.getTime() + num * 86400000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return val || '2026-09-12';
}

function escapeSql(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/'/g, "''").trim();
}

const lines = [
  '-- ===========================================================',
  '-- Incremental Sync of Newly Added Logs from FORM ENTRY 26-271.xlsm',
  '-- Idempotent: Only inserts new log records without altering masters',
  '-- ===========================================================',
  'BEGIN;',
  ''
];

// 1. BAG_LOG
if (fs.existsSync(path.join(dir, 'BAG_LOG.json'))) {
  const bags = JSON.parse(fs.readFileSync(path.join(dir, 'BAG_LOG.json'), 'utf8'));
  lines.push(`-- 1. Bags Sync (${bags.length} total in sheet)`);
  for (const b of bags) {
    const code = escapeSql(b['Bag Barcode']);
    if (!code) continue;
    const date = convertOADate(b['Entry Date']);
    const mCode = escapeSql(b['Machine']);
    const batch = escapeSql(b['Batch No']);
    const pCode = escapeSql(b['Part No']);
    const type = b['Bag Type'] && b['Bag Type'].includes('RUNNER') ? 'RUNNER' : 'PART';
    const wt = parseFloat(b['Weight Kg']) || 0;
    const qty = parseInt(b['Approx Qty'], 10) || 0;
    const status = escapeSql(b['Status']) || 'OPEN';
    const runner = b['With runner'] && b['With runner'].toLowerCase().includes('yes') ? 'TRUE' : 'FALSE';
    const shiftMatch = batch.match(/([AB])$/);
    const shift = shiftMatch ? shiftMatch[1] : 'A';

    lines.push(`INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '${code}', '${date}'::DATE, '${shift}', m.id, p.id, '${batch}', '${type}', ${wt}, ${qty}, '${status}', ${runner}, '${date} 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = '${mCode}' AND (p.part_code = '${pCode}' OR p.shrp_part_code = '${pCode}' OR p.customer_part_no = '${pCode}')
ON CONFLICT (bag_code) DO NOTHING;`);
  }
}

// 2. TRIM_LOG
if (fs.existsSync(path.join(dir, 'TRIM_LOG.json'))) {
  const trims = JSON.parse(fs.readFileSync(path.join(dir, 'TRIM_LOG.json'), 'utf8'));
  lines.push(`\n-- 2. Trim Log Sync (${trims.length} total)`);
  for (const t of trims) {
    const code = escapeSql(t['Bag Barcode']);
    if (!code) continue;
    const date = convertOADate(t['Entry Date']);
    const op = escapeSql(t['Operator']);
    const wt = parseFloat(t['Net Weight']) || 0;
    const qty = parseInt(t['Approved Qty'] || t['Net Qty'], 10) || 0;
    const scrap = parseFloat(t['Scrap Wt'] || t['Runner Wt']) || 0;

    lines.push(`INSERT INTO trim_entries (bag_id, operator_user_id, weight_kg, qty, runner_weight_kg, status, created_at)
SELECT b.id, COALESCE((SELECT id FROM users WHERE username ILIKE '${op}' OR full_name ILIKE '%${op}%' LIMIT 1), 1), ${wt}, ${qty}, ${scrap}, 'TRIMMED', '${date} 10:00:00'::TIMESTAMPTZ
FROM bags b
WHERE b.bag_code = '${code}'
AND NOT EXISTS (SELECT 1 FROM trim_entries te WHERE te.bag_id = b.id);`);
  }
}

// 3. INSPECTION_LOG
if (fs.existsSync(path.join(dir, 'INSPECTION_LOG.json'))) {
  const ins = JSON.parse(fs.readFileSync(path.join(dir, 'INSPECTION_LOG.json'), 'utf8'));
  lines.push(`\n-- 3. Inspection Log Sync (${ins.length} total)`);
  for (const i of ins) {
    const code = escapeSql(i['Bag Barcode']);
    if (!code) continue;
    const date = convertOADate(i['Entry Date']);
    const op = escapeSql(i['Inspector'] || i['Operator']);
    const wt = parseFloat(i['Net Weight'] || i['Weight']) || 0;
    const okQty = parseInt(i['Ok Qty'] || i['Net Qty'], 10) || 0;
    const rejQty = parseInt(i['Reject Qty'], 10) || 0;

    lines.push(`INSERT INTO inspection_entries (bag_id, operator_user_id, weight_kg, ok_qty, reject_qty, status, created_at)
SELECT b.id, COALESCE((SELECT id FROM users WHERE username ILIKE '${op}' OR full_name ILIKE '%${op}%' LIMIT 1), 1), ${wt}, ${okQty}, ${rejQty}, 'INSPECTED', '${date} 11:00:00'::TIMESTAMPTZ
FROM bags b
WHERE b.bag_code = '${code}'
AND NOT EXISTS (SELECT 1 FROM inspection_entries ie WHERE ie.bag_id = b.id);`);
  }
}

// 4. PACKING_LOG
if (fs.existsSync(path.join(dir, 'PACKING_LOG.json'))) {
  const packs = JSON.parse(fs.readFileSync(path.join(dir, 'PACKING_LOG.json'), 'utf8'));
  lines.push(`\n-- 4. Packing Log Sync (${packs.length} total)`);
  for (const pk of packs) {
    const code = escapeSql(pk['Bag Barcode']);
    if (!code) continue;
    const date = convertOADate(pk['Entry Date']);
    const op = escapeSql(pk['Packer'] || pk['Operator']);
    const boxNo = escapeSql(pk['Box No'] || pk['Carton No'] || 'BOX-01');
    const boxQty = parseInt(pk['Packed Qty'] || pk['Qty'], 10) || 0;

    lines.push(`INSERT INTO packing_entries (bag_id, operator_user_id, carton_code, packed_qty, status, created_at)
SELECT b.id, COALESCE((SELECT id FROM users WHERE username ILIKE '${op}' OR full_name ILIKE '%${op}%' LIMIT 1), 1), '${boxNo}', ${boxQty}, 'PACKED', '${date} 12:00:00'::TIMESTAMPTZ
FROM bags b
WHERE b.bag_code = '${code}'
AND NOT EXISTS (SELECT 1 FROM packing_entries pe WHERE pe.bag_id = b.id);`);
  }
}

lines.push('\nCOMMIT;');
fs.writeFileSync(outSql, lines.join('\n'), 'utf8');
console.log(`Generated idempotent sync script at ${outSql} (${lines.length} lines)`);
