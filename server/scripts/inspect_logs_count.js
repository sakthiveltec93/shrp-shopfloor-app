require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../db/pool');

async function inspectLogs() {
  const rej = await pool.query(`SELECT count(*) as count FROM reject_log;`);
  const down = await pool.query(`SELECT count(*) as count FROM downtime_log;`);
  console.log('reject_log count:', rej.rows[0].count);
  console.log('downtime_log count:', down.rows[0].count);
  pool.end();
}

inspectLogs();
