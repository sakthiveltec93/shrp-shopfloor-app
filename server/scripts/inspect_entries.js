require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../db/pool');

async function inspect() {
  const { rows } = await pool.query(`
    SELECT pe.id, pe.entry_date, pe.shift, m.machine_code, p.part_name, p.part_code,
           pe.hour_slot, pe.start_time, pe.end_time, pe.period_start_at, pe.period_end_at,
           pe.start_count, pe.end_count, pe.good_qty, pe.reject_qty, pe.downtime_minutes,
           u.full_name as operator_name, pe.created_at, pe.session_id, pe.is_backdated, pe.is_edited
    FROM production_entries pe
    LEFT JOIN machines m ON m.id = pe.machine_id
    LEFT JOIN parts p ON p.id = pe.part_id
    LEFT JOIN users u ON u.id = pe.operator_user_id
    WHERE pe.entry_date = '2026-09-17'
    ORDER BY pe.id ASC;
  `);
  console.log('Total entries on 2026-09-17:', rows.length);
  console.table(rows.map(r => ({
    id: r.id,
    shift: r.shift,
    machine: r.machine_code,
    part: r.part_code,
    hour_slot: r.hour_slot,
    start_time: r.start_time ? new Date(r.start_time).toISOString() : null,
    end_time: r.end_time ? new Date(r.end_time).toISOString() : null,
    period_start: r.period_start_at ? new Date(r.period_start_at).toISOString() : null,
    period_end: r.period_end_at ? new Date(r.period_end_at).toISOString() : null,
    counts: `${r.start_count}->${r.end_count}`,
    good: r.good_qty,
    rej: r.reject_qty,
    operator: r.operator_name,
    created_at: new Date(r.created_at).toISOString(),
    session_id: r.session_id,
    is_backdated: r.is_backdated,
    is_edited: r.is_edited
  })));
  pool.end();
}
inspect();
