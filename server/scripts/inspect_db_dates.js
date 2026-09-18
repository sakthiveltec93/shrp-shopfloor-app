require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../db/pool');

async function inspect() {
  const res = await pool.query(`
    SELECT entry_date, count(*) as count,
           count(period_start_at) as with_period_start,
           count(start_time) as with_start_time
    FROM production_entries
    GROUP BY entry_date
    ORDER BY entry_date ASC;
  `);
  console.table(res.rows);
  pool.end();
}

inspect();
