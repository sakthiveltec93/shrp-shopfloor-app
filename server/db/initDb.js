const fs = require('fs');
const path = require('path');
const pool = require('./pool');
const { syncParts } = require('./clean_parts');
const { syncMoulds } = require('./sync_moulds');
const { syncMaterials } = require('./seed_materials');
const { syncPartPhotos } = require('./seed_photos');
const { syncDocSequences } = require('./seed_doc_sequences');

async function initDb() {
  try {
    console.log('[DB-INIT] Applying latest database schema...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_process TEXT NOT NULL DEFAULT 'PRODUCTION';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
      ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

      CREATE TABLE IF NOT EXISTS approved_devices (
        id SERIAL PRIMARY KEY,
        device_id TEXT UNIQUE NOT NULL,
        device_label TEXT,
        approved_by_user_id INTEGER REFERENCES users(id),
        approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        approval_lat NUMERIC,
        approval_lng NUMERIC,
        approval_distance_m NUMERIC
      );
      CREATE INDEX IF NOT EXISTS idx_approved_devices_id ON approved_devices(device_id);

      CREATE TABLE IF NOT EXISTS document_sequences (
        id SERIAL PRIMARY KEY,
        document_type TEXT UNIQUE NOT NULL,
        type_label TEXT,
        prefix TEXT NOT NULL,
        suffix TEXT DEFAULT '',
        padding_digits INTEGER NOT NULL DEFAULT 4,
        include_year BOOLEAN NOT NULL DEFAULT FALSE,
        year_format TEXT NOT NULL DEFAULT 'YYYY',
        current_number INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_document_sequences_type ON document_sequences(document_type);
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

    console.log('[DB-INIT] Syncing standard document sequences & numbering formats...');
    await syncDocSequences();
    console.log('[DB-INIT] Document sequences synced successfully.');

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
  } catch (err) {
    console.error('[DB-INIT] Warning during database init:', err.message || err);
  }
}

module.exports = { initDb };
