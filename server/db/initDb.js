const fs = require('fs');
const path = require('path');
const pool = require('./pool');
const { syncParts } = require('./clean_parts');
const { syncMoulds } = require('./sync_moulds');
const { syncMaterials } = require('./seed_materials');
const { syncPartPhotos } = require('./seed_photos');
const { auditDuplicates } = require('./audit_duplicates');

async function initDb() {
  try {
    console.log('[DB-INIT] Applying latest database schema...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_process TEXT NOT NULL DEFAULT 'PRODUCTION';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
      ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    `);
    console.log('[DB-INIT] Schema updated successfully.');

    console.log('[DB-INIT] Syncing clean 77 master parts...');
    await syncParts(false);
    console.log('[DB-INIT] Master parts synced.');

    console.log('[DB-INIT] Syncing 73 tooling masters & part linkages...');
    await syncMoulds(false);
    console.log('[DB-INIT] Moulds and part linkages synced successfully.');

    console.log('[DB-INIT] Syncing standard raw materials & default recipes...');
    await syncMaterials();
    console.log('[DB-INIT] Raw materials and default recipes synced successfully.');

    console.log('[DB-INIT] Syncing part photos from PART PHOTO folder...');
    await syncPartPhotos(false);
    console.log('[DB-INIT] Part photos synced successfully.');

    console.log('[DB-INIT] Cleaning up bag types for historical rejection/runner/lump bags...');
    await pool.query(`
      UPDATE bags SET bag_type = 'REJECTION'
      WHERE (bag_code ILIKE '%-REJ%' OR bag_code ILIKE '%REJECTION%') AND bag_type != 'REJECTION'
    `);
    await pool.query(`
      UPDATE bags SET bag_type = 'RUNNER'
      WHERE (bag_code ILIKE '%-RUNNER%' OR bag_code ILIKE '%RUNNER%') AND bag_type != 'RUNNER'
    `);
    await pool.query(`
      UPDATE bags SET bag_type = 'LUMP'
      WHERE (bag_code ILIKE '%-LUMP%' OR bag_code ILIKE '%LUMPS%') AND bag_type != 'LUMP'
    `);
    await pool.query(`
      UPDATE bags SET bag_type = 'SCRAP'
      WHERE (bag_code ILIKE '%-SCRAP%' OR bag_code ILIKE '%SCRAP%') AND bag_type != 'SCRAP'
    `);
    console.log('[DB-INIT] Bag types cleaned up successfully.');

    await auditDuplicates();
  } catch (err) {
    console.error('[DB-INIT] Warning during database init:', err.message || err);
  }
}

module.exports = { initDb };
