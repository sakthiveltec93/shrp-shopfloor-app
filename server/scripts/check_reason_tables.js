require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../db/pool');

async function checkReasonTables() {
  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('Public tables:', tables.rows.map(r => r.table_name));

  const checkItemsCat = await pool.query(`
    SELECT DISTINCT category FROM check_items;
  `);
  console.log('check_items categories:', checkItemsCat.rows);

  const reasons = await pool.query(`
    SELECT id, category, item_name, active FROM check_items WHERE category LIKE '%mould%' OR category LIKE '%setup%' OR category LIKE '%reason%';
  `);
  console.log('Existing reason items in check_items:');
  console.table(reasons.rows);

  pool.end();
}

checkReasonTables();
