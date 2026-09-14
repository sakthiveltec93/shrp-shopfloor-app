-- ============================================================
-- Deletion Requests & Soft-Delete Support for IATF Audit Safety
-- ============================================================

ALTER TABLE parts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id);
ALTER TABLE parts ADD COLUMN IF NOT EXISTS delete_reason TEXT;

CREATE TABLE IF NOT EXISTS deletion_requests (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('part', 'production_entry', 'bag', 'trim_entry', 'inspection_entry', 'packing_entry', 'dispatch_entry')),
  entity_id INTEGER NOT NULL,
  requested_by INTEGER NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  details JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status, created_at DESC);
