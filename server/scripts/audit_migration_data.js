const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const pool = require('../db/pool');

async function runAudit() {
  console.log('=== STARTING EXCEL & DATABASE AUDIT ===\n');

  const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
  const formFile = path.join(__dirname, '..', '..', 'FORM ENTRY 26-271.xlsm');

  console.log('1. Checking File Existence:');
  console.log(`   - Erp Master Requirements: ${fs.existsSync(erpFile) ? 'FOUND' : 'MISSING'} (${erpFile})`);
  console.log(`   - FORM ENTRY 26-271: ${fs.existsSync(formFile) ? 'FOUND' : 'MISSING'} (${formFile})\n`);

  // --- INSPECT ERP MASTER REQUIREMENTS ---
  if (fs.existsSync(erpFile)) {
    console.log('--- 2. INSPECTING: Erp Master Requirements.xlsx ---');
    const wb = XLSX.readFile(erpFile);
    console.log('Sheets found:', wb.SheetNames);

    for (const name of wb.SheetNames) {
      const sheet = wb.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      console.log(`\nSheet [${name}]: ${rows.length} rows`);
      if (rows.length > 0) {
        console.log('Columns:', Object.keys(rows[0]));
        console.log('Sample Row 1:', rows[0]);
      }
    }
  }

  // --- INSPECT FORM ENTRY 26-271.xlsm ---
  if (fs.existsSync(formFile)) {
    console.log('\n--- 3. INSPECTING: FORM ENTRY 26-271.xlsm ---');
    const wb2 = XLSX.readFile(formFile);
    console.log('Sheets found:', wb2.SheetNames);

    for (const name of wb2.SheetNames) {
      const sheet = wb2.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      console.log(`\nSheet [${name}]: ${rows.length} rows`);
      if (rows.length > 0) {
        console.log('Columns:', Object.keys(rows[0]));
        console.log('Sample Row 1:', rows[0]);
      }
    }
  }

  // --- INSPECT CURRENT DATABASE STATUS ---
  console.log('\n--- 4. INSPECTING: Current Postgres Database Counts ---');
  try {
    const tables = [
      'parts', 'moulds', 'mould_parts', 'customers', 'suppliers', 'machines', 'gauges',
      'production_entries', 'bags', 'bag_status_history', 'trim_entries', 'inspection_entries',
      'packing_entries', 'dispatch_entries', 'reject_log', 'downtime_log', 'users', 'machine_assignments'
    ];

    for (const t of tables) {
      try {
        const res = await pool.query(`SELECT count(*)::int as count FROM ${t}`);
        console.log(`  Table [${t.padEnd(22)}]: ${res.rows[0].count} records`);
      } catch (tErr) {
        console.log(`  Table [${t.padEnd(22)}]: Table does not exist or error (${tErr.message})`);
      }
    }
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await pool.end();
  }
}

runAudit().catch(console.error);
