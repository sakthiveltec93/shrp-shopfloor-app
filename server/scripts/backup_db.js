const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { execSync } = require('child_process');

const d = new Date();
const dateStr = d.getFullYear().toString() +
  String(d.getMonth() + 1).padStart(2, '0') +
  String(d.getDate()).padStart(2, '0') + '_' +
  String(d.getHours()).padStart(2, '0') +
  String(d.getMinutes()).padStart(2, '0') +
  String(d.getSeconds()).padStart(2, '0');

const backupPath = path.join(__dirname, '..', `backup_users_cleanup_${dateStr}.dump`);
const dbUrl = process.env.DATABASE_URL;

console.log('Starting full backup to:', backupPath);
try {
  execSync(`pg_dump -Fc "${dbUrl}" -f "${backupPath}"`, { stdio: 'inherit' });
  const stat = fs.statSync(backupPath);
  console.log(`BACKUP_CONFIRMED_SUCCESS: File created at ${backupPath} (Size: ${stat.size} bytes)`);
} catch (e) {
  console.error('BACKUP_FAILED:', e.message);
  process.exit(1);
}
