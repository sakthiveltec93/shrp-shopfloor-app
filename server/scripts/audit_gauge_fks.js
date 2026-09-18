const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function checkFKs() {
  const client = await pool.connect();
  try {
    const gaugeRefs = await client.query(`
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
        AND ccu.table_name = 'gauges'
        AND tc.table_schema = 'public';
    `);
    console.log('Foreign keys pointing to gauges:');
    console.table(gaugeRefs.rows);

    for (const r of gaugeRefs.rows) {
      const c = await client.query(`SELECT count(*) as count FROM "${r.table_name}" WHERE "${r.column_name}" IS NOT NULL`);
      console.log(`  Table [${r.table_name}.${r.column_name}]: ${c.rows[0].count} referencing rows`);
    }

    // Also check if any table in public schema has a column named gauge_id
    const gaugeCols = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND (column_name ILIKE '%gauge%' OR column_name ILIKE '%instrument%')
    `);
    console.log('\nAll gauge/instrument columns in database:');
    console.table(gaugeCols.rows);

    for (const r of gaugeCols.rows) {
      if (r.table_name !== 'gauges' && r.table_name !== 'gauges_backup_pre_reconcile') {
        const c = await client.query(`SELECT count(*) as count FROM "${r.table_name}" WHERE "${r.column_name}" IS NOT NULL`);
        console.log(`  Column [${r.table_name}.${r.column_name}]: ${c.rows[0].count} rows with non-null value`);
      }
    }

  } finally {
    client.release();
    await pool.end();
  }
}

checkFKs();
