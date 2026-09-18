const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function checkCols() {
  const client = await pool.connect();
  try {
    const machCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'machines' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.log('Machines table columns:');
    console.table(machCols.rows);

    const gaugeCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'gauges' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.log('\nGauges table columns:');
    console.table(gaugeCols.rows);

  } finally {
    client.release();
    await pool.end();
  }
}

checkCols();
