require('H:/shrp-shopfloor-app/server/node_modules/dotenv').config({ path: 'H:/shrp-shopfloor-app/server/.env' });
const pool = require('H:/shrp-shopfloor-app/server/db/pool');

async function run() {
  console.log('Running Migration 005...');
  await pool.query(`
    ALTER TABLE check_items ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
    ALTER TABLE check_items ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

    ALTER TABLE check_items DROP CONSTRAINT IF EXISTS check_items_category_check;
    ALTER TABLE check_items ADD CONSTRAINT check_items_category_check CHECK (category IN ('daily', 'reject_reason', 'downtime_reason', 'mould_change_reason'));

    ALTER TABLE machine_assignments ADD COLUMN IF NOT EXISTS reason TEXT;
    ALTER TABLE machine_assignments ADD COLUMN IF NOT EXISTS reason_id INTEGER REFERENCES check_items(id);
    ALTER TABLE machine_assignments ADD COLUMN IF NOT EXISTS last_shot_count INTEGER;
    ALTER TABLE machine_assignments ADD COLUMN IF NOT EXISTS previous_part_id INTEGER REFERENCES parts(id);

    INSERT INTO check_items (item_name, category, code, related_to, active, sort_order)
    VALUES 
      ('Plan Completed', 'mould_change_reason', 'MC-01', 'MOULD', TRUE, 1),
      ('Customer Priority', 'mould_change_reason', 'MC-02', 'MOULD', TRUE, 2),
      ('Machine Issue', 'mould_change_reason', 'MC-03', 'MACHINE', TRUE, 3),
      ('Mould Issue', 'mould_change_reason', 'MC-04', 'MOULD', TRUE, 4),
      ('NPD/Trail', 'mould_change_reason', 'MC-05', 'PROCESS', TRUE, 5),
      ('Preventive Maintenance', 'mould_change_reason', 'MC-06', 'MAINTENANCE', TRUE, 6),
      ('Max Stock Reached', 'mould_change_reason', 'MC-07', 'PLANNING', TRUE, 7),
      ('Sudden Plan', 'mould_change_reason', 'MC-08', 'PLANNING', TRUE, 8),
      ('Quality Issue', 'mould_change_reason', 'MC-09', 'QUALITY', TRUE, 9),
      ('Production Balancing', 'mould_change_reason', 'MC-10', 'PLANNING', TRUE, 10)
    ON CONFLICT (item_name, category) DO UPDATE 
    SET code = EXCLUDED.code, related_to = EXCLUDED.related_to, active = TRUE, sort_order = EXCLUDED.sort_order;
  `);

  const check = await pool.query(`SELECT id, item_name, category, code, related_to, sort_order FROM check_items WHERE category = 'mould_change_reason' ORDER BY sort_order, id`);
  console.log('Seeded Mould Change Reasons count:', check.rows.length);
  console.log('Reasons in DB:', check.rows);
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
