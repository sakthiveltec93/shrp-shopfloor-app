const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function diag() {
  const client = await pool.connect();
  try {
    const q = `
      SELECT id, username, full_name, role, active, pin_hash, to_char(created_at, 'YYYY-MM-DD HH24:MI') as created_at,
        (SELECT count(*) FROM production_entries WHERE operator_user_id = users.id) AS pe_count,
        (SELECT count(*) FROM bags WHERE operator_user_id = users.id) AS bag_count,
        (SELECT count(*) FROM trim_entries WHERE operator_user_id = users.id) AS trim_count,
        (SELECT count(*) FROM inspection_entries WHERE operator_user_id = users.id) AS insp_count,
        (SELECT count(*) FROM packing_entries WHERE operator_user_id = users.id) AS pack_count,
        (SELECT count(*) FROM login_history WHERE user_id = users.id) AS login_count
      FROM users
      ORDER BY lower(username), id;
    `;
    const res = await client.query(q);
    fs.writeFileSync(path.join(__dirname, 'diag_users_full.json'), JSON.stringify(res.rows, null, 2));
    console.log('Saved diag_users_full.json. Total users:', res.rows.length);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

diag();
