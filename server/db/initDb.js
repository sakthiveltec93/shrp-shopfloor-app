const fs = require('fs');
const path = require('path');
const pool = require('./pool');
const { syncParts } = require('./clean_parts');

async function initDb() {
  try {
    console.log('[DB-INIT] Applying latest database schema...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('[DB-INIT] Schema updated successfully.');

    console.log('[DB-INIT] Syncing clean 77 master parts...');
    await syncParts(false);
    console.log('[DB-INIT] Master parts synced.');
  } catch (err) {
    console.error('[DB-INIT] Warning during database init:', err.message || err);
  }
}

module.exports = { initDb };
