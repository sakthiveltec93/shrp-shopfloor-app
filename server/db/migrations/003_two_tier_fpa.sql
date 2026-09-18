-- ==============================================================================
-- MIGRATION: 003_two_tier_fpa.sql
-- DESCRIPTION: Two-Tier First Piece Approval (Visual Approval + Full FPA) & Part x Machine Process Parameters
-- IDEMPOTENT: Safe to run multiple times
-- ==============================================================================

BEGIN;

-- 1. Part Process Parameters: Add machine_id for Part x Machine specific standards
ALTER TABLE part_process_parameters ADD COLUMN IF NOT EXISTS machine_id INTEGER REFERENCES machines(id) ON DELETE CASCADE;

-- Replace part-only unique index with part x machine unique index (COALESCE(machine_id, -1) handles NULL machine_id)
DROP INDEX IF EXISTS idx_part_params_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_part_machine_params_unique ON part_process_parameters(part_id, COALESCE(machine_id, -1), parameter_name);

-- 2. FPA Submissions: Visual Approval & Grace Window Tracking
ALTER TABLE fpa_submissions ADD COLUMN IF NOT EXISTS visual_approved_at TIMESTAMPTZ;
ALTER TABLE fpa_submissions ADD COLUMN IF NOT EXISTS visual_approved_by_user_id INTEGER REFERENCES users(id);
ALTER TABLE fpa_submissions ADD COLUMN IF NOT EXISTS full_approval_deadline TIMESTAMPTZ;

-- Update approval_status constraint to include VISUAL_APPROVED
ALTER TABLE fpa_submissions DROP CONSTRAINT IF EXISTS fpa_submissions_approval_status_check;
ALTER TABLE fpa_submissions ADD CONSTRAINT fpa_submissions_approval_status_check 
  CHECK (approval_status IN ('PENDING', 'VISUAL_APPROVED', 'APPROVED', 'CONDITIONAL', 'REJECTED'));

COMMIT;
