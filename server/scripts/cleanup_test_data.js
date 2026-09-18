require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../db/pool');

async function clean() {
  const delRes = await pool.query('DELETE FROM production_entries WHERE id IN (825, 826, 827, 828, 829) RETURNING id');
  console.log('Cleaned up test entries:', delRes.rows.map(r => r.id));
  pool.end();
}
clean();
