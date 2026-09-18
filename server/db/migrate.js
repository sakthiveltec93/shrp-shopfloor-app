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

  const extraSeeds = fs.readdirSync(dir)
    .filter((f) => f.startsWith('seed_') && f.endsWith('.sql'))
    .sort();
  for (const file of extraSeeds) {
    console.log(`Applying ${file}...`);
    await pool.query(readSql(path.join(dir, file)));
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
