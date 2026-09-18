// Runs schema.sql then seed.sql then any seed_*.sql files (if present)
// against DATABASE_URL, in filename order. Safe to re-run (idempotent).
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');
const { syncParts } = require('./clean_parts');

const readSql = (p) => fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');

async function main() {
  const dir = __dirname;
  const schema = readSql(path.join(dir, 'schema.sql'));
  const seed = readSql(path.join(dir, 'seed.sql'));

  console.log('Applying schema...');
  await pool.query(schema);
  console.log('Applying seed data...');
  await pool.query(seed);

  // Ensure applied_seeds tracking table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS applied_seeds (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const extraSeeds = fs.readdirSync(dir)
    .filter((f) => f.startsWith('seed_') && f.endsWith('.sql'))
    .sort();

  for (const file of extraSeeds) {
    if (file === 'seed_users.sql') {
      const checkRes = await pool.query('SELECT id FROM applied_seeds WHERE filename = $1', [file]);
      if (checkRes.rows.length > 0) {
        console.log(`Skipping ${file} (already recorded in applied_seeds)...`);
        continue;
      }
      console.log(`Applying ${file} (one-time execution)...`);
      await pool.query(readSql(path.join(dir, file)));
      await pool.query('INSERT INTO applied_seeds (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING', [file]);
    } else {
      console.log(`Applying ${file}...`);
      await pool.query(readSql(path.join(dir, file)));
    }
  }

  console.log('Synchronizing canonical master parts...');
  await syncParts(false);

  console.log('Done.');
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
