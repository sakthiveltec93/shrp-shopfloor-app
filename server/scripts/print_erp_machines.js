const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const erpFile = path.join(__dirname, '..', '..', 'Erp Master Requirements.xlsx');
const wb = XLSX.readFile(erpFile);
const machSheet = wb.Sheets['Machine Details'];
const rows = XLSX.utils.sheet_to_json(machSheet, { header: 1, defval: '' });

console.log('Total rows in Machine Details:', rows.length);
rows.forEach((r, idx) => {
  if (r.some(c => c !== '')) {
    console.log(`[Row ${idx}]:`, JSON.stringify(r));
  }
});
