-- ============================================================
-- Seed Master Parts (Ensures tolerance_pct column & defaults)
-- Authoritative master parts are managed via clean_parts.js & seed_reconcile_erp_masters.sql
-- ============================================================

ALTER TABLE parts ADD COLUMN IF NOT EXISTS tolerance_pct NUMERIC DEFAULT 2;
ALTER TABLE parts ALTER COLUMN standard_cycle_time_sec SET DEFAULT 0;
UPDATE parts SET tolerance_pct = 2 WHERE tolerance_pct IS NULL;
