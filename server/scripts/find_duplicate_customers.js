require('dotenv').config({ path: '../.env' });
const pool = require('../db/pool');

async function findDuplicates() {
  const result = await pool.query(`
    SELECT
      LOWER(TRIM(customer_name)) as name_normalized,
      COUNT(*) as count,
      JSON_AGG(JSON_BUILD_OBJECT('id', id, 'code', customer_code, 'name', customer_name) ORDER BY id) as entries
    FROM customers
    WHERE active = TRUE
    GROUP BY LOWER(TRIM(customer_name))
    HAVING COUNT(*) > 1
    ORDER BY count DESC
  `);

  console.log('\n=== DUPLICATE CUSTOMERS FOUND ===\n');
  result.rows.forEach(row => {
    console.log(`${row.name_normalized} (COUNT: ${row.count})`);
    row.entries.forEach(e => console.log(`  → ID ${e.id} | ${e.code} | ${e.name}`));
    console.log('');
  });

  await pool.end();
}

findDuplicates().catch(console.error);
