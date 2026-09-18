-- ==============================================================================
-- MIGRATION: 004_admin_corrections_audit.sql
-- DESCRIPTION: Admin-Only Historical Corrections, Edits, Status Overrides & Audit Trail
-- IDEMPOTENT: Safe to run multiple times
-- ==============================================================================

BEGIN;

-- 1. Remove fixed hour slot requirement & add real time-tracking columns
ALTER TABLE production_entries ADD COLUMN IF NOT EXISTS period_start_at TIMESTAMPTZ;
ALTER TABLE production_entries ADD COLUMN IF NOT EXISTS period_end_at TIMESTAMPTZ;
ALTER TABLE production_entries ALTER COLUMN hour_slot DROP NOT NULL;

-- 2. Add PARTIAL_PACK to bags status check
ALTER TABLE bags DROP CONSTRAINT IF EXISTS bags_status_check;
ALTER TABLE bags ADD CONSTRAINT bags_status_check 
  CHECK (status IN ('OPEN', 'PARTIAL_TRIM', 'TRIMMED', 'PARTIAL_INSPECT', 'INSPECTED', 'PARTIAL_PACK', 'PACKED', 'DISPATCHED', 'HOLD', 'SCRAPPED', 'REWORK_DONE'));

-- 3. Create correction_requests table (mirrors deletion_requests)
CREATE TABLE IF NOT EXISTS correction_requests (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('production_entry', 'bag', 'trim_entry', 'inspection_entry', 'packing_entry')),
  entity_id INTEGER,
  entity_code TEXT,
  action TEXT NOT NULL CHECK (action IN ('BACKDATED_CREATE', 'EDIT', 'STATUS_OVERRIDE')),
  payload JSONB NOT NULL,
  reason TEXT NOT NULL,
  requested_by INTEGER NOT NULL REFERENCES users(id),
  requested_by_name TEXT,
  requested_by_role TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_correction_requests_status ON correction_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_correction_requests_entity ON correction_requests(entity_type, entity_id);

-- 4. Create record_correction_log table (mirrors deletion_audit_log)
CREATE TABLE IF NOT EXISTS record_correction_log (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  entity_code TEXT,
  action TEXT NOT NULL CHECK (action IN ('BACKDATED_CREATE', 'EDIT', 'STATUS_OVERRIDE')),
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_by INTEGER REFERENCES users(id),
  changed_by_name TEXT,
  changed_by_role TEXT,
  reason TEXT NOT NULL,
  details JSONB,
  request_id INTEGER REFERENCES correction_requests(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_record_correction_created_at ON record_correction_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_record_correction_entity ON record_correction_log(entity_type, entity_id);

-- 5. Add audit indicators to core tables
ALTER TABLE production_entries ADD COLUMN IF NOT EXISTS is_backdated BOOLEAN DEFAULT FALSE;
ALTER TABLE production_entries ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE production_entries ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;

ALTER TABLE bags ADD COLUMN IF NOT EXISTS is_backdated BOOLEAN DEFAULT FALSE;
ALTER TABLE bags ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE bags ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;

ALTER TABLE trim_entries ADD COLUMN IF NOT EXISTS is_backdated BOOLEAN DEFAULT FALSE;
ALTER TABLE trim_entries ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE trim_entries ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;

ALTER TABLE inspection_entries ADD COLUMN IF NOT EXISTS is_backdated BOOLEAN DEFAULT FALSE;
ALTER TABLE inspection_entries ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE inspection_entries ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;

ALTER TABLE packing_entries ADD COLUMN IF NOT EXISTS is_backdated BOOLEAN DEFAULT FALSE;
ALTER TABLE packing_entries ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE packing_entries ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;

COMMIT;
