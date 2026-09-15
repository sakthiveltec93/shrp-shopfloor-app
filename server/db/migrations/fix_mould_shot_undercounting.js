// One-time, idempotent backfill for the mould shot-undercounting bug.
//
// Background: server/routes/entries.js previously divided the raw shot count
// (end_count - start_count) by the part's cavity count a SECOND time before
// adding it to moulds.cumulative_shots / moulds.shots_since_pm. That formula
// was wrong - (end_count - start_count) is already the direct shot count. The
// live bug is fixed in entries.js; THIS script corrects the historical totals
// that were already accumulated with the old, wrong formula.
//
// Safe to run multiple times: it records completion in migrations_applied and
// exits immediately on subsequent runs. Run manually, once, against production:
//   DATABASE_URL=... node server/db/migrations/fix_mould_shot_undercounting.js
//
// Do NOT wire this into server/db/migrate.js - it must not run automatically
// on every deploy.

require('dotenv').config();
const pool = require('../pool');

const MIGRATION_KEY = 'fix_mould_shot_undercounting_v1';

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations_applied (
      key TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const already = await pool.query('SELECT 1 FROM migrations_applied WHERE key = $1', [MIGRATION_KEY]);
  if (already.rows.length > 0) {
    console.log(`Migration "${MIGRATION_KEY}" already applied. Nothing to do.`);
    await pool.end();
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Recompute cumulative_shots per mould: for every mould, sum the raw shot
    // count (end_count - start_count) across every production_entries row for
    // every part linked to that mould via mould_parts. This mirrors exactly
    // how the (now-fixed) live code attributes shots to moulds in real time,
    // so the backfilled total will be consistent with all future accumulation.
    const { rows: moulds } = await client.query('SELECT id, mould_code FROM moulds');

    const report = [];

    for (const mould of moulds) {
      const { rows: cumRows } = await client.query(
        `SELECT COALESCE(SUM(pe.end_count - pe.start_count), 0) AS total_shots
         FROM production_entries pe
         JOIN mould_parts mp ON mp.part_id = pe.part_id
         WHERE mp.mould_id = $1`,
        [mould.id]
      );
      const correctCumulative = Number(cumRows[0].total_shots);

      // shots_since_pm: same sum, but only counting entries created after the
      // mould's most recent PM service log (action_type = 'pm_service', the
      // actual value allowed by mould_maintenance_logs' CHECK constraint).
      const { rows: pmRows } = await client.query(
        `SELECT MAX(created_at) AS last_pm_at
         FROM mould_maintenance_logs
         WHERE mould_id = $1 AND action_type = 'pm_service'`,
        [mould.id]
      );
      const lastPmAt = pmRows[0].last_pm_at;

      const { rows: sincePmRows } = await client.query(
        `SELECT COALESCE(SUM(pe.end_count - pe.start_count), 0) AS shots_since_pm
         FROM production_entries pe
         JOIN mould_parts mp ON mp.part_id = pe.part_id
         WHERE mp.mould_id = $1
           AND ($2::timestamptz IS NULL OR pe.created_at > $2::timestamptz)`,
        [mould.id, lastPmAt]
      );
      const correctSincePm = Number(sincePmRows[0].shots_since_pm);

      const { rows: beforeRows } = await client.query(
        'SELECT cumulative_shots, shots_since_pm FROM moulds WHERE id = $1',
        [mould.id]
      );
      const before = beforeRows[0];

      await client.query(
        'UPDATE moulds SET cumulative_shots = $1, shots_since_pm = $2 WHERE id = $3',
        [correctCumulative, correctSincePm, mould.id]
      );

      report.push({
        mould_code: mould.mould_code,
        cumulative_before: before.cumulative_shots,
        cumulative_after: correctCumulative,
        shots_since_pm_before: before.shots_since_pm,
        shots_since_pm_after: correctSincePm,
      });
    }

    await client.query(
      'INSERT INTO migrations_applied (key) VALUES ($1)',
      [MIGRATION_KEY]
    );

    await client.query('COMMIT');

    console.log('Mould shot counters corrected. Before/after per mould:');
    for (const r of report) {
      console.log(
        `  ${r.mould_code}: cumulative_shots ${r.cumulative_before} -> ${r.cumulative_after}, ` +
        `shots_since_pm ${r.shots_since_pm_before} -> ${r.shots_since_pm_after}`
      );
    }
    console.log(`Done. ${report.length} mould(s) corrected.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Backfill failed, rolled back:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
