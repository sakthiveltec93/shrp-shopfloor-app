-- Real rejection and idle/downtime reason masters, replacing the placeholder
-- demo rows in seed.sql. Safe to re-run (idempotent) - runs after seed.sql
-- on every deploy via migrate.js.

-- Add code / disposition / grouping columns to check_items
ALTER TABLE check_items ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE check_items ADD COLUMN IF NOT EXISTS default_disposition TEXT;
ALTER TABLE check_items ADD COLUMN IF NOT EXISTS related_to TEXT;

-- Drop the old demo placeholders, but only if nothing has actually logged
-- against them yet (keeps this safe to run against a live database).
DELETE FROM check_items
 WHERE item_name IN ('Short shot', 'Black spot') AND category = 'reject_reason'
   AND NOT EXISTS (SELECT 1 FROM reject_log WHERE reject_reason_id = check_items.id);

DELETE FROM check_items
 WHERE item_name IN ('Mould change', 'Power outage', 'Material shortage') AND category = 'downtime_reason'
   AND NOT EXISTS (SELECT 1 FROM downtime_log WHERE downtime_reason_id = check_items.id)
   AND NOT EXISTS (SELECT 1 FROM production_entries WHERE downtime_reason_id = check_items.id);

-- Rejection master (code + default disposition)
INSERT INTO check_items (item_name, category, code, default_disposition) VALUES
  ('ShortMold', 'reject_reason', 'R001', 'SCRAP'),
  ('Black', 'reject_reason', 'R002', 'HOLD'),
  ('Punching', 'reject_reason', 'R003', 'SCRAP'),
  ('SettingPiece', 'reject_reason', 'R004', 'SCRAP'),
  ('Startup', 'reject_reason', 'R005', 'SCRAP'),
  ('DoubleShot', 'reject_reason', 'R006', 'SCRAP'),
  ('Crack/Weldline', 'reject_reason', 'R007', 'SCRAP'),
  ('FlowMark', 'reject_reason', 'R008', 'SCRAP'),
  ('Airbubbles', 'reject_reason', 'R009', 'HOLD'),
  ('Shrinkage', 'reject_reason', 'R010', 'HOLD'),
  ('Dent/bendMark', 'reject_reason', 'R011', 'HOLD'),
  ('Spray', 'reject_reason', 'R012', 'HOLD'),
  ('Flash', 'reject_reason', 'R013', 'Return To Trimming'),
  ('MixedMaterial', 'reject_reason', 'R014', 'SCRAP'),
  ('Part Damage/Cut by Operator', 'reject_reason', 'R015', 'SCRAP')
ON CONFLICT (item_name, category) DO UPDATE
  SET code = EXCLUDED.code, default_disposition = EXCLUDED.default_disposition;

-- Idle / downtime reason master (grouped by "Related To")
INSERT INTO check_items (item_name, category, related_to) VALUES
  ('Mold Change', 'downtime_reason', 'Changeover'),
  ('Low voltage', 'downtime_reason', 'EB'),
  ('Power Failure', 'downtime_reason', 'EB'),
  ('No Plan - Mach Off', 'downtime_reason', 'Idle'),
  ('Hydraulic Issue', 'downtime_reason', 'Machine'),
  ('Machine Breakdown', 'downtime_reason', 'Machine'),
  ('Machine Ejector not working', 'downtime_reason', 'Machine'),
  ('Nozzle Block', 'downtime_reason', 'Machine'),
  ('Oil Leak', 'downtime_reason', 'Machine'),
  ('PLC Issue', 'downtime_reason', 'Machine'),
  ('Planned Shutdown', 'downtime_reason', 'Maintenance'),
  ('Ejector Pin Damage', 'downtime_reason', 'Mold'),
  ('Mold parts broke', 'downtime_reason', 'Mold'),
  ('Tool Breakdown', 'downtime_reason', 'Mold'),
  ('No Operator', 'downtime_reason', 'Operator'),
  ('Quality Issue', 'downtime_reason', 'Process'),
  ('Setting Issue', 'downtime_reason', 'Process'),
  ('Material Shortage', 'downtime_reason', 'RM'),
  ('Morning Meeting', 'downtime_reason', 'Meeting'),
  ('Others', 'downtime_reason', NULL)
ON CONFLICT (item_name, category) DO UPDATE
  SET related_to = EXCLUDED.related_to;
