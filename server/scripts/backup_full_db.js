const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function backupAll() {
  const d = new Date();
  const dateStr = d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') + '_' +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0') +
    String(d.getSeconds()).padStart(2, '0');

  const backupFile = path.join(__dirname, '..', '..', `backup_pre_users_cleanup_${dateStr}.json`);
  const client = await pool.connect();
  try {
    console.log('Starting full database table backup...');
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const fullBackup = {
      timestamp: new Date().toISOString(),
      tables: {}
    };

    let totalRows = 0;
    for (const row of tablesRes.rows) {
      const tName = row.table_name;
      const dataRes = await client.query(`SELECT * FROM "${tName}"`);
      fullBackup.tables[tName] = dataRes.rows;
      totalRows += dataRes.rows.length;
      console.log(`  Table [${tName}]: ${dataRes.rows.length} rows backed up`);
    }

    fs.writeFileSync(backupFile, JSON.stringify(fullBackup, null, 2));
    const stat = fs.statSync(backupFile);
    console.log(`\nBACKUP COMPLETE:`);
    console.log(`File: ${backupFile}`);
    console.log(`Size: ${(stat.size / 1024).toFixed(2)} KB`);
    console.log(`Total rows captured across all ${tablesRes.rows.length} tables: ${totalRows}`);
  } catch (err) {
    console.error('Backup failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

backupAll();
