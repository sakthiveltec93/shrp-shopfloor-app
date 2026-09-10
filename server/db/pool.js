const { Pool } = require('pg');

// Railway's private network (app <-> Postgres) is already an encrypted
// WireGuard tunnel - the bare postgres:16 image has no SSL certs configured,
// so requesting SSL here just hangs instead of cleanly falling back. Only
// opt into SSL when explicitly told to (e.g. a genuinely external/managed
// Postgres that requires it) via PGSSL=require.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
});

module.exports = pool;