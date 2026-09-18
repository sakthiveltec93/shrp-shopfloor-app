const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db/pool');

async function generateReport() {
  const client = await pool.connect();
  try {
    // 1. Diagnosis query exactly as requested
    const qDiag = `
      SELECT id, username, full_name, role, active, to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
        (SELECT count(*) FROM production_entries WHERE operator_user_id = users.id) AS pe_count,
        (SELECT count(*) FROM bags WHERE operator_user_id = users.id) AS bag_count,
        (SELECT count(*) FROM trim_entries WHERE operator_user_id = users.id) AS trim_count,
        (SELECT count(*) FROM inspection_entries WHERE operator_user_id = users.id) AS insp_count,
        (SELECT count(*) FROM packing_entries WHERE operator_user_id = users.id) AS pack_count,
        (SELECT count(*) FROM login_history WHERE user_id = users.id) AS login_count
      FROM users
      ORDER BY username, id;
    `;
    const diagRows = (await client.query(qDiag)).rows;

    console.log('DIAG_ROW_COUNT:' + diagRows.length);

    // Write diagnostic markdown table
    let diagMd = '| ID | Username | Full Name | Role | Active | Created At | PE Count | Bag Count | Trim Count | Insp Count | Pack Count | Login Count |\n';
    diagMd += '| :--- | :--- | :--- | :--- | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n';
    for (const r of diagRows) {
      diagMd += `| \`${r.id}\` | \`${r.username}\` | **${r.full_name}** | \`${r.role}\` | ${r.active ? '✅ true' : '❌ false'} | ${r.created_at} | ${r.pe_count} | ${r.bag_count} | ${r.trim_count} | ${r.insp_count} | ${r.pack_count} | ${r.login_count} |\n`;
    }

    require('fs').writeFileSync(path.join(__dirname, 'diag_table.md'), diagMd);

  } finally {
    client.release();
    await pool.end();
  }
}

generateReport();
