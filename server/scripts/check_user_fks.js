const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function dryRunPlan() {
  const client = await pool.connect();
  try {
    console.log('======================================================================');
    console.log(' USERS CLEANUP DRY-RUN AUDIT');
    console.log('======================================================================\n');

    // Check all tables with FK to users
    const fkTablesRes = await client.query(`
      SELECT
        tc.table_name, 
        kcu.column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name = 'users'
        AND tc.table_schema = 'public';
    `);

    console.log('All Foreign Key References to users(id):');
    console.table(fkTablesRes.rows);

  } finally {
    client.release();
    await pool.end();
  }
}

dryRunPlan();
