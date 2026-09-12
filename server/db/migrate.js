// Runs schema.sql then seed.sql then any seed_*.sql files (if present)
// against DATABASE_URL, in filename order. Safe to re-run (idempotent).
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function main() {
  const dir = __dirname;
  const schema = fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(dir, 'seed.sql'), 'utf8');

  console.log('Applying schema...');
  await pool.query(schema);
  console.log('Applying seed data...');
  await pool.query(seed);

  const extraSeeds = fs.readdirSync(dir)
    .filter((f) => f.startsWith('seed_') && f.endsWith('.sql'))
    .sort();
  for (const file of extraSeeds) {
    console.log(`Applying ${file}...`);
    await pool.query(fs.readFileSync(path.join(dir, file), 'utf8'));
  }

  console.log('Done.');
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
