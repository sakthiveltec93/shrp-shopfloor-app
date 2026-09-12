// Runs schema.sql then seed.sql then seed_masters.sql (if present) against DATABASE_URL. Safe to re-run (idempotent).
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  const mastersPath = path.join(__dirname, 'seed_masters.sql');

  console.log('Applying schema...');
  await pool.query(schema);
  console.log('Applying seed data...');
  await pool.query(seed);
  if (fs.existsSync(mastersPath)) {
    console.log('Applying master data updates...');
    await pool.query(fs.readFileSync(mastersPath, 'utf8'));
  }
  console.log('Done.');
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
