-- SHRP Shop Floor App schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('operator', 'supervisor', 'admin')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS machines (
  id SERIAL PRIMARY KEY,
  machine_code TEXT UNIQUE NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS parts (
  id SERIAL PRIMARY KEY,
  part_code TEXT UNIQUE NOT NULL,
  part_name TEXT NOT NULL,
  cavity_count INTEGER NOT NULL DEFAULT 1,
  standard_cycle_time_sec NUMERIC NOT NULL,
  unit_weight_g NUMERIC,
  -- Routing flags, ported from PART_MASTER columns D/E/F/G
  trim_required BOOLEAN NOT NULL DEFAULT FALSE,
  inspection_required BOOLEAN NOT NULL DEFAULT FALSE,
  packing_required BOOLEAN NOT NULL DEFAULT TRUE,
  dispatch_required BOOLEAN NOT NULL DEFAULT TRUE,
  standard_pack_qty INTEGER,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Efficiency bands: map an efficiency % range to a status/color label
CREATE TABLE IF NOT EXISTS efficiency_bands (
  id SERIAL PRIMARY KEY,
  band_name TEXT NOT NULL,
  min_pct NUMERIC NOT NULL,
  max_pct NUMERIC NOT NULL,
  color TEXT
);

-- Rejection / downtime reason master
CREATE TABLE IF NOT EXISTS check_items (
  id SERIAL PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('reject_reason', 'downtime_reason', 'quality_check')),
  UNIQUE (item_name, category)
);

-- Current part assignment per machine - set only via Mould Setup/Approval form
CREATE TABLE IF NOT EXISTS machine_assignments (
  id SERIAL PRIMARY KEY,
  machine_id INTEGER NOT NULL REFERENCES machines(id),
  part_id INTEGER NOT NULL REFERENCES parts(id),
  set_by_user_id INTEGER NOT NULL REFERENCES users(id),
  approved_by_user_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  set_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_machine_assignments_machine ON machine_assignments(machine_id, set_at DESC);

-- Hourly production entries logged by operators
CREATE TABLE IF NOT EXISTS production_entries (
  id SERIAL PRIMARY KEY,
  machine_id INTEGER NOT NULL REFERENCES machines(id),
  part_id INTEGER NOT NULL REFERENCES parts(id),
  operator_user_id INTEGER NOT NULL REFERENCES users(id),
  shift TEXT NOT NULL CHECK (shift IN ('A', 'B')),
  entry_date DATE NOT NULL,
  hour_slot INTEGER NOT NULL, -- 1-12 within the shift
  start_count INTEGER NOT NULL,
  end_count INTEGER NOT NULL,
  good_qty INTEGER NOT NULL,
  reject_qty INTEGER NOT NULL DEFAULT 0,
  downtime_minutes INTEGER NOT NULL DEFAULT 0,
  downtime_reason_id INTEGER REFERENCES check_items(id),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_production_entries_machine_date ON production_entries(machine_id, entry_date, hour_slot);

-- Setup-approval timing (mould load start, first OK part) and per-entry
-- start/end/efficiency - added via ALTER so this stays safe to re-run
-- against a database that already has these tables from before.
ALTER TABLE machine_assignments ADD COLUMN IF NOT EXISTS mould_load_started_at TIMESTAMPTZ;
ALTER TABLE machine_assignments ADD COLUMN IF NOT EXISTS first_ok_part_at TIMESTAMPTZ;
ALTER TABLE production_entries ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE production_entries ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;
ALTER TABLE production_entries ADD COLUMN IF NOT EXISTS efficiency_pct NUMERIC;

CREATE TABLE IF NOT EXISTS reject_log (
  id SERIAL PRIMARY KEY,
  production_entry_id INTEGER NOT NULL REFERENCES production_entries(id),
  reject_reason_id INTEGER NOT NULL REFERENCES check_items(id),
  qty INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- Bag traceability pipeline (ported from BAG_LOG / TRIM_LOG /
-- INSPECTION_LOG / PACKING_LOG + modBagStatus, modFIFOBagPicker,
-- Modbagentry). A "bag" is a unit of material moving through
-- Bag Entry -> Trimming -> Inspection -> Packing, tracked by
-- weight/qty and a status that only ever advances one direction.
-- ================================================================

CREATE TABLE IF NOT EXISTS bags (
  id SERIAL PRIMARY KEY,
  bag_code TEXT UNIQUE NOT NULL, -- BatchNo + 3-digit sequence, e.g. "B00123001"
  batch_no TEXT NOT NULL,
  entry_date DATE NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('A', 'B')),
  machine_id INTEGER NOT NULL REFERENCES machines(id),
  part_id INTEGER NOT NULL REFERENCES parts(id),
  bag_type TEXT NOT NULL DEFAULT 'PART' CHECK (bag_type IN ('PART', 'RUNNER')),
  base_weight_kg NUMERIC NOT NULL,
  qty INTEGER NOT NULL,
  operator_user_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'TRIMMED', 'INSPECTED', 'PACKED')),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bags_batch ON bags(batch_no);
CREATE INDEX IF NOT EXISTS idx_bags_part_status ON bags(part_id, status, bag_type);

CREATE TABLE IF NOT EXISTS bag_status_history (
  id SERIAL PRIMARY KEY,
  bag_id INTEGER NOT NULL REFERENCES bags(id),
  from_status TEXT,
  to_status TEXT NOT NULL,
  source TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trim_entries (
  id SERIAL PRIMARY KEY,
  bag_id INTEGER NOT NULL REFERENCES bags(id),
  remaining_wt_kg NUMERIC NOT NULL,
  operator_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_entries (
  id SERIAL PRIMARY KEY,
  bag_id INTEGER NOT NULL REFERENCES bags(id),
  remaining_wt_kg NUMERIC NOT NULL,
  reject_wt_kg NUMERIC NOT NULL DEFAULT 0,
  reject_reason_id INTEGER REFERENCES check_items(id),
  operator_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS packing_entries (
  id SERIAL PRIMARY KEY,
  bag_id INTEGER NOT NULL REFERENCES bags(id),
  packed_qty INTEGER NOT NULL,
  packed_wt_kg NUMERIC NOT NULL,
  operator_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- Full part master: process parameters, critical dimensions, suitable
-- machines, customer, and file attachments (photo/SOP/PPAP), so parts
-- can be added and edited directly in the app instead of a spreadsheet.
-- ================================================================

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

ALTER TABLE parts ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id);
ALTER TABLE parts ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE TABLE IF NOT EXISTS part_process_parameters (
  id SERIAL PRIMARY KEY,
  part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  parameter_name TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS part_critical_dimensions (
  id SERIAL PRIMARY KEY,
  part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  dimension_name TEXT NOT NULL,
  nominal_value NUMERIC,
  tol_plus NUMERIC,
  tol_minus NUMERIC,
  unit TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS part_machines (
  part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  PRIMARY KEY (part_id, machine_id)
);

-- Photo / SOP / PPAP attachments, stored directly in the database so
-- there's no separate file-storage service to keep in sync.
CREATE TABLE IF NOT EXISTS part_files (
  id SERIAL PRIMARY KEY,
  part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('photo', 'sop', 'ppap')),
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  data BYTEA NOT NULL,
  uploaded_by_user_id INTEGER NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_part_files_part ON part_files(part_id, file_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_part_params_unique ON part_process_parameters(part_id, parameter_name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_part_dims_unique ON part_critical_dimensions(part_id, dimension_name);

-- ================================================================
-- Machine sessions: an explicit Start Machine -> hourly entries -> Off
-- Machine lifecycle per your operator-workflow spec. The partial unique
-- index is what actually enforces "only one operator can run a machine
-- at a time" at the database level - not just app logic.
-- ================================================================

CREATE TABLE IF NOT EXISTS machine_sessions (
  id SERIAL PRIMARY KEY,
  machine_id INTEGER NOT NULL REFERENCES machines(id),
  part_id INTEGER NOT NULL REFERENCES parts(id),
  operator_user_id INTEGER NOT NULL REFERENCES users(id),
  start_time TIMESTAMPTZ NOT NULL,
  start_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'OFF')),
  off_time TIMESTAMPTZ,
  off_count INTEGER,
  off_reason TEXT,
  off_remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- At most one RUNNING session per machine, enforced by the database itself
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_running_session_per_machine
  ON machine_sessions(machine_id) WHERE status = 'RUNNING';

CREATE INDEX IF NOT EXISTS idx_machine_sessions_machine ON machine_sessions(machine_id, created_at DESC);

ALTER TABLE production_entries ADD COLUMN IF NOT EXISTS session_id INTEGER REFERENCES machine_sessions(id);
ALTER TABLE production_entries ADD COLUMN IF NOT EXISTS target_qty NUMERIC;
ALTER TABLE production_entries ADD COLUMN IF NOT EXISTS below_target BOOLEAN NOT NULL DEFAULT FALSE;

-- =================================================================
-- Daily check sheet: safety/5S/IATF checks, gated in front of Start
-- Machine. One submission per machine+shift+date.
-- ================================================================

CREATE TABLE IF NOT EXISTS daily_check_items (
  id SERIAL PRIMARY KEY,
  item_name TEXT NOT NULL UNIQUE,
  local_label TEXT,
  specification TEXT,
  icon TEXT,
  category TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS daily_check_submissions (
  id SERIAL PRIMARY KEY,
  machine_id INTEGER NOT NULL REFERENCES machines(id),
  shift TEXT NOT NULL CHECK (shift IN ('A', 'B')),
  entry_date DATE NOT NULL,
  operator_user_id INTEGER NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_checksheet_per_machine_shift_day
  ON daily_check_submissions(machine_id, shift, entry_date);

ALTER TABLE daily_check_items ADD COLUMN IF NOT EXISTS local_label TEXT;
ALTER TABLE daily_check_items ADD COLUMN IF NOT EXISTS specification TEXT;
ALTER TABLE daily_check_items ADD COLUMN IF NOT EXISTS icon TEXT;

CREATE TABLE IF NOT EXISTS daily_check_responses (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES daily_check_submissions(id) ON DELETE CASCADE,
  check_item_id INTEGER NOT NULL REFERENCES daily_check_items(id),
  status TEXT NOT NULL CHECK (status IN ('OK', 'NG', 'NA')),
  remarks TEXT
);

-- Batch numbering and weighing-method fields, ported from Modproduction.bas
-- (GetPartCode) and frmbagentry.frm (chkWithRunner logic).
-- batch_part_code = the short numeric/alnum code from PART_MASTER col L,
-- used to build BatchNo = batch_part_code + ddmmyy + Shift.
-- part_weight_g = weight of the part alone, no runner (PART_MASTER col C) -
-- distinct from the existing unit_weight_g, which is the SHOT weight
-- (part + runner together, PART_MASTER col K "Single Shot Wt").
ALTER TABLE parts ADD COLUMN IF NOT EXISTS batch_part_code TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS part_weight_g NUMERIC;

-- =================================================================
-- Per-user page access, so an admin can fine-tune exactly what each
-- operator sees beyond the three broad roles (which still govern
-- server-side authorization for actions like approving/creating parts).
-- ================================================================
CREATE TABLE IF NOT EXISTS user_page_access (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  page_key TEXT NOT NULL,
  PRIMARY KEY (user_id, page_key)
);

-- =================================================================
-- Itemized downtime logging, added to support multiple downtime
-- reasons per hourly production_entries row. Mirrors reject_log,
-- which already existed but was previously unused by the API.
-- =================================================================
CREATE TABLE IF NOT EXISTS downtime_log (
  id SERIAL PRIMARY KEY,
  production_entry_id INTEGER NOT NULL REFERENCES production_entries(id),
  downtime_reason_id INTEGER NOT NULL REFERENCES check_items(id),
  minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_downtime_log_entry ON downtime_log(production_entry_id);
CREATE INDEX IF NOT EXISTS idx_reject_log_entry ON reject_log(production_entry_id);

-- ============================================================
-- In-app notifications: mould-change requests notify supervisors/
-- admins, and approvals notify the submitting operator to mark the
-- 1st OK part. Read status is per-recipient (user_id).
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

-- ============================================================
-- Attendance: GPS-geofenced check-in/check-out, one row per
-- user per day. app_settings holds the admin-configurable factory
-- geofence center + radius (self-service, no coordinates hardcoded).
-- ============================================================
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);

-- Ensure daily_check_submissions shift check includes 'A' even if migrated from older schema
DO $$
BEGIN
  ALTER TABLE daily_check_submissions DROP CONSTRAINT IF EXISTS daily_check_submissions_shift_check;
  ALTER TABLE daily_check_submissions ADD CONSTRAINT daily_check_submissions_shift_check CHECK (shift IN ('A', 'B'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- SHRP Part Code identification & Customer Part No separation
-- ============================================================
ALTER TABLE parts ADD COLUMN IF NOT EXISTS shrp_part_code TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS customer_part_no TEXT;

-- Backfill customer_part_no with part_code if not set
UPDATE parts SET customer_part_no = part_code WHERE customer_part_no IS NULL;

-- Backfill shrp_part_code:
-- Specific known SHRP abbreviations
UPDATE parts SET shrp_part_code = 'LBB' WHERE part_code = 'HC442L3LBB01';
UPDATE parts SET shrp_part_code = 'LAC' WHERE part_code = 'HC442L3LAC01';
UPDATE parts SET shrp_part_code = 'LBC' WHERE part_code = 'HC442L3LBC02';
UPDATE parts SET shrp_part_code = 'CXG' WHERE part_code = 'HC442CXGAA01';
UPDATE parts SET shrp_part_code = 'SPH' WHERE part_code = 'HC442SPHAA03';
UPDATE parts SET shrp_part_code = 'OER' WHERE part_code = 'HC442OERAA01';
UPDATE parts SET shrp_part_code = 'QVE' WHERE part_code = 'HC442QVEAC01';
UPDATE parts SET shrp_part_code = 'QVE-B' WHERE part_code = 'HC442QVEBC01';
UPDATE parts SET shrp_part_code = 'SUL' WHERE part_code = 'HC442SULAC01';
UPDATE parts SET shrp_part_code = 'UMN' WHERE part_code = 'HC442UMNAA02';
UPDATE parts SET shrp_part_code = 'G6C1A' WHERE part_code = 'HC442G6C1A';
UPDATE parts SET shrp_part_code = 'G6C1B' WHERE part_code = 'HC442G6C1B';
UPDATE parts SET shrp_part_code = 'FC1' WHERE part_code = 'FC1F2AN6BA01';
UPDATE parts SET shrp_part_code = 'A710' WHERE part_code = 'A710-BBWBA-01';
UPDATE parts SET shrp_part_code = 'CB5' WHERE part_code = 'F364-CB5AA-01';
UPDATE parts SET shrp_part_code = 'KQ' WHERE part_code = 'F442-KQAAA-01';
UPDATE parts SET shrp_part_code = 'QQ7' WHERE part_code = 'F442-QQ7AA-01';
UPDATE parts SET shrp_part_code = 'WBA' WHERE part_code = 'F442-WBAAA-01';
UPDATE parts SET shrp_part_code = 'AKY' WHERE part_code = 'F710-AKYAA-01';
UPDATE parts SET shrp_part_code = 'BB1' WHERE part_code = 'F885-BB1AA-01';
UPDATE parts SET shrp_part_code = 'UBH' WHERE part_code = 'DM1C4UBH1B01';
UPDATE parts SET shrp_part_code = 'CAW' WHERE part_code = 'CA581CAWXX01';
UPDATE parts SET shrp_part_code = 'DDR' WHERE part_code = 'CA582DDRXX01';

-- For parts starting with HC442 followed by letters, extract the 3-letter code
UPDATE parts SET shrp_part_code = substring(part_code from 6 for 3)
WHERE (shrp_part_code IS NULL OR shrp_part_code = part_code OR shrp_part_code ~ '^[0-9]+$') AND part_code LIKE 'HC442%' AND length(part_code) >= 8;

-- For parts with hyphen, use prefix
UPDATE parts SET shrp_part_code = split_part(part_code, '-', 1) 
WHERE (shrp_part_code IS NULL OR shrp_part_code = part_code OR shrp_part_code ~ '^[0-9]+$') AND part_code LIKE '%-%';

-- Fallback to first 4-6 chars of part_code if still null or too long
UPDATE parts SET shrp_part_code = substring(part_code from 1 for 6)
WHERE shrp_part_code IS NULL OR length(shrp_part_code) > 8;

-- ============================================================
-- Bag status: include DISPATCHED, tolerance approval & FIFO override
-- ============================================================
DO $$
BEGIN
  ALTER TABLE bags DROP CONSTRAINT IF EXISTS bags_status_check;
  ALTER TABLE bags ADD CONSTRAINT bags_status_check CHECK (status IN ('OPEN', 'TRIMMED', 'INSPECTED', 'PACKED', 'DISPATCHED'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE bags ADD COLUMN IF NOT EXISTS is_over_tolerance BOOLEAN DEFAULT FALSE;
ALTER TABLE bags ADD COLUMN IF NOT EXISTS tolerance_approved_by INTEGER REFERENCES users(id);
ALTER TABLE bags ADD COLUMN IF NOT EXISTS tolerance_approved_at TIMESTAMPTZ;
ALTER TABLE bags ADD COLUMN IF NOT EXISTS tolerance_approval_remarks TEXT;
ALTER TABLE bags ADD COLUMN IF NOT EXISTS is_fifo_override BOOLEAN DEFAULT FALSE;
ALTER TABLE bags ADD COLUMN IF NOT EXISTS fifo_override_by INTEGER REFERENCES users(id);
ALTER TABLE bags ADD COLUMN IF NOT EXISTS fifo_override_at TIMESTAMPTZ;
ALTER TABLE bags ADD COLUMN IF NOT EXISTS fifo_override_reason TEXT;

-- ============================================================
-- Dispatch Entries: final stage in process status flow
-- ============================================================
CREATE TABLE IF NOT EXISTS dispatch_entries (
  id SERIAL PRIMARY KEY,
  bag_id INTEGER NOT NULL REFERENCES bags(id),
  dispatched_qty INTEGER NOT NULL,
  dispatched_wt_kg NUMERIC NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  invoice_no TEXT,
  vehicle_no TEXT,
  operator_user_id INTEGER NOT NULL REFERENCES users(id),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dispatch_entries_bag ON dispatch_entries(bag_id);

-- ============================================================
-- Full Audit Trail: complete traceability from production to dispatch
-- ============================================================
CREATE TABLE IF NOT EXISTS traceability_audit_log (
  id SERIAL PRIMARY KEY,
  process TEXT NOT NULL, -- production, bagging, trimming, inspection, packing, dispatch, setup, session
  bag_id INTEGER REFERENCES bags(id),
  bag_code TEXT,
  batch_no TEXT,
  part_id INTEGER REFERENCES parts(id),
  machine_id INTEGER REFERENCES machines(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  qty INTEGER,
  weight_kg NUMERIC,
  status_from TEXT,
  status_to TEXT,
  is_fifo_override BOOLEAN DEFAULT FALSE,
  oldest_bag_code TEXT,
  is_over_tolerance BOOLEAN DEFAULT FALSE,
  approved_by INTEGER REFERENCES users(id),
  approval_reason TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_traceability_bag_code ON traceability_audit_log(bag_code);
CREATE INDEX IF NOT EXISTS idx_traceability_batch_no ON traceability_audit_log(batch_no);
CREATE INDEX IF NOT EXISTS idx_traceability_process ON traceability_audit_log(process, created_at DESC);

-- ============================================================
-- Specific user permissions for FIFO override and tolerance approval
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS can_override_fifo BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS can_approve_tolerance BOOLEAN DEFAULT FALSE;

