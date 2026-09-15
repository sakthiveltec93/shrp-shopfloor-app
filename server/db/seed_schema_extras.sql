-- Extra tables for in-app notifications and GPS-geofenced attendance.
-- Named seed_* so migrate.js picks it up automatically; contains only
-- idempotent DDL (CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS),
-- safe to re-run against a live database.

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at, created_at DESC);

-- Simple key/value store for app-wide config (currently just the factory's
-- geofence center + radius for attendance check-in).
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  attendance_date DATE NOT NULL,
  check_in_at TIMESTAMPTZ,
  check_in_lat NUMERIC,
  check_in_lng NUMERIC,
  check_in_distance_m NUMERIC,
  check_in_within_geofence BOOLEAN,
  check_out_at TIMESTAMPTZ,
  check_out_lat NUMERIC,
  check_out_lng NUMERIC,
  check_out_distance_m NUMERIC,
  check_out_within_geofence BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, attendance_date);

-- Ensure bags table has weighed_with_runner and nullable operator_user_id for incremental seed imports
ALTER TABLE bags ADD COLUMN IF NOT EXISTS weighed_with_runner BOOLEAN DEFAULT FALSE;
ALTER TABLE bags ALTER COLUMN operator_user_id DROP NOT NULL;
