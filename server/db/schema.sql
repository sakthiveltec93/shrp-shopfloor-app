-- SHRP Shop Floor App schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('operator', 'supervisor', 'admin')),
  assigned_process TEXT NOT NULL DEFAULT 'PRODUCTION' CHECK (assigned_process IN ('PRODUCTION', 'TRIMMING', 'PACKING_INSPECTION')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
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
ALTER TABLE production_entries ADD COLUMN IF NOT EXISTS period_start_at TIMESTAMPTZ;
ALTER TABLE production_entries ADD COLUMN IF NOT EXISTS period_end_at TIMESTAMPTZ;
ALTER TABLE production_entries ALTER COLUMN hour_slot DROP NOT NULL;

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
  operator_user_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'OPEN',
  weighed_with_runner BOOLEAN DEFAULT FALSE,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- In case bags table was already created in earlier versions, ensure all columns and constraints exist
ALTER TABLE bags ADD COLUMN IF NOT EXISTS weighed_with_runner BOOLEAN DEFAULT FALSE;
ALTER TABLE bags ADD COLUMN IF NOT EXISTS is_over_tolerance BOOLEAN DEFAULT FALSE;
ALTER TABLE bags ADD COLUMN IF NOT EXISTS tolerance_approved_by INTEGER REFERENCES users(id);
ALTER TABLE bags ADD COLUMN IF NOT EXISTS tolerance_approved_at TIMESTAMPTZ;
ALTER TABLE bags ADD COLUMN IF NOT EXISTS tolerance_approval_remarks TEXT;
ALTER TABLE bags ADD COLUMN IF NOT EXISTS is_fifo_override BOOLEAN DEFAULT FALSE;
ALTER TABLE bags ADD COLUMN IF NOT EXISTS fifo_override_by INTEGER REFERENCES users(id);
ALTER TABLE bags ADD COLUMN IF NOT EXISTS fifo_override_at TIMESTAMPTZ;
ALTER TABLE bags ADD COLUMN IF NOT EXISTS fifo_override_reason TEXT;
ALTER TABLE bags ALTER COLUMN operator_user_id DROP NOT NULL;

ALTER TABLE bags DROP CONSTRAINT IF EXISTS bags_status_check;
ALTER TABLE bags ADD CONSTRAINT bags_status_check CHECK (status IN ('OPEN', 'PARTIAL_TRIM', 'TRIMMED', 'PARTIAL_INSPECT', 'INSPECTED', 'PARTIAL_PACK', 'PACKED', 'DISPATCHED', 'HOLD', 'SCRAPPED', 'REWORK_DONE'));

ALTER TABLE bags DROP CONSTRAINT IF EXISTS bags_bag_type_check;
ALTER TABLE bags ADD CONSTRAINT bags_bag_type_check CHECK (bag_type IN ('PART', 'RUNNER', 'REJECTION', 'LUMP', 'LUMPS', 'SCRAP'));

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

CREATE TABLE IF NOT EXISTS bag_hold_log (
  id SERIAL PRIMARY KEY,
  bag_id INTEGER NOT NULL REFERENCES bags(id),
  stage TEXT NOT NULL CHECK (stage IN ('PRODUCTION', 'TRIMMING', 'INSPECTION', 'PACKING')),
  reason TEXT NOT NULL,
  hold_by_user_id INTEGER NOT NULL REFERENCES users(id),
  hold_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  released_by_user_id INTEGER REFERENCES users(id),
  released_at TIMESTAMPTZ,
  release_remarks TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS trim_entries (
  id SERIAL PRIMARY KEY,
  bag_id INTEGER NOT NULL REFERENCES bags(id),
  trimmed_wt_kg NUMERIC NOT NULL DEFAULT 0,
  runner_wt_kg NUMERIC NOT NULL DEFAULT 0,
  reject_wt_kg NUMERIC NOT NULL DEFAULT 0,
  reject_reason_id INTEGER REFERENCES check_items(id),
  remaining_wt_kg NUMERIC NOT NULL,
  is_partial BOOLEAN NOT NULL DEFAULT FALSE,
  pass_number INTEGER NOT NULL DEFAULT 1,
  operator_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE trim_entries ADD COLUMN IF NOT EXISTS trimmed_wt_kg NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE trim_entries ADD COLUMN IF NOT EXISTS runner_wt_kg NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE trim_entries ADD COLUMN IF NOT EXISTS reject_wt_kg NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE trim_entries ADD COLUMN IF NOT EXISTS reject_reason_id INTEGER REFERENCES check_items(id);
ALTER TABLE trim_entries ADD COLUMN IF NOT EXISTS is_partial BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE trim_entries ADD COLUMN IF NOT EXISTS pass_number INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS inspection_entries (
  id SERIAL PRIMARY KEY,
  bag_id INTEGER NOT NULL REFERENCES bags(id),
  inspected_wt_kg NUMERIC NOT NULL DEFAULT 0,
  remaining_wt_kg NUMERIC NOT NULL,
  reject_wt_kg NUMERIC NOT NULL DEFAULT 0,
  reject_reason_id INTEGER REFERENCES check_items(id),
  sent_to_rework_qty INTEGER NOT NULL DEFAULT 0,
  variance_tier TEXT,
  is_partial BOOLEAN NOT NULL DEFAULT FALSE,
  remarks TEXT,
  operator_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE inspection_entries ADD COLUMN IF NOT EXISTS inspected_wt_kg NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE inspection_entries ADD COLUMN IF NOT EXISTS sent_to_rework_qty INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inspection_entries ADD COLUMN IF NOT EXISTS variance_tier TEXT;
ALTER TABLE inspection_entries ADD COLUMN IF NOT EXISTS is_partial BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE inspection_entries ADD COLUMN IF NOT EXISTS remarks TEXT;

CREATE TABLE IF NOT EXISTS packing_entries (
  id SERIAL PRIMARY KEY,
  bag_id INTEGER NOT NULL REFERENCES bags(id),
  packed_qty INTEGER NOT NULL,
  packed_wt_kg NUMERIC NOT NULL,
  sample_packet_wt_g NUMERIC,
  calculated_part_wt_g NUMERIC,
  packets_count INTEGER NOT NULL DEFAULT 1,
  balance_qty INTEGER NOT NULL DEFAULT 0,
  operator_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE packing_entries ADD COLUMN IF NOT EXISTS sample_packet_wt_g NUMERIC;
ALTER TABLE packing_entries ADD COLUMN IF NOT EXISTS calculated_part_wt_g NUMERIC;
ALTER TABLE packing_entries ADD COLUMN IF NOT EXISTS packets_count INTEGER NOT NULL DEFAULT 1;
ALTER TABLE packing_entries ADD COLUMN IF NOT EXISTS balance_qty INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS packing_balance_pool (
  id SERIAL PRIMARY KEY,
  part_id INTEGER NOT NULL REFERENCES parts(id),
  bag_id INTEGER REFERENCES bags(id),
  quantity INTEGER NOT NULL,
  sample_packet_wt_g NUMERIC,
  calculated_part_wt_g NUMERIC,
  operator_user_id INTEGER NOT NULL REFERENCES users(id),
  is_consumed BOOLEAN NOT NULL DEFAULT FALSE,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rework_log (
  id SERIAL PRIMARY KEY,
  bag_id INTEGER REFERENCES bags(id),
  part_id INTEGER NOT NULL REFERENCES parts(id),
  stage TEXT NOT NULL CHECK (stage IN ('TRIMMING', 'INSPECTION')),
  source_reject_reason_id INTEGER REFERENCES check_items(id),
  rework_qty INTEGER NOT NULL,
  reworked_good_qty INTEGER NOT NULL DEFAULT 0,
  scrap_qty INTEGER NOT NULL DEFAULT 0,
  remarks TEXT,
  created_by_user_id INTEGER NOT NULL REFERENCES users(id),
  worked_by_user_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS bag_reject_log (
  id SERIAL PRIMARY KEY,
  bag_id INTEGER NOT NULL REFERENCES bags(id),
  stage TEXT NOT NULL CHECK (stage IN ('TRIMMING', 'INSPECTION')),
  entry_id INTEGER,
  reject_reason_id INTEGER NOT NULL REFERENCES check_items(id),
  reject_wt_kg NUMERIC NOT NULL DEFAULT 0,
  reject_qty INTEGER NOT NULL DEFAULT 0,
  disposition TEXT,
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
  machine_id INTEGER REFERENCES machines(id) ON DELETE CASCADE,
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

-- Machine process parameter template: defines what parameters each machine expects
CREATE TABLE IF NOT EXISTS machine_process_parameter_templates (
  id SERIAL PRIMARY KEY,
  machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  description TEXT,
  parameters JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Part-specific process parameters per machine with structured data
CREATE TABLE IF NOT EXISTS part_machine_process_specs (
  id SERIAL PRIMARY KEY,
  part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  parameter_specs JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(part_id, machine_id)
);

-- Photo / SOP / PPAP attachments, stored directly in the database so
-- there's no separate file-storage service to keep in sync.
CREATE TABLE IF NOT EXISTS part_files (
  id SERIAL PRIMARY KEY,
  part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('photo', 'sop', 'ppap')),
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  data BYTEA,
  storage_key TEXT,
  uploaded_by_user_id INTEGER NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE part_files ADD COLUMN IF NOT EXISTS storage_key TEXT;
ALTER TABLE part_files ALTER COLUMN data DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_part_files_part ON part_files(part_id, file_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_part_machine_params_unique ON part_process_parameters(part_id, COALESCE(machine_id, -1), parameter_name);
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
ALTER TABLE parts ADD COLUMN IF NOT EXISTS tolerance_pct NUMERIC DEFAULT 2;
UPDATE parts SET tolerance_pct = 2 WHERE tolerance_pct IS NULL;

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
  ALTER TABLE bags ADD CONSTRAINT bags_status_check CHECK (status IN ('OPEN', 'PARTIAL_TRIM', 'TRIMMED', 'PARTIAL_INSPECT', 'INSPECTED', 'PACKED', 'DISPATCHED', 'HOLD', 'SCRAPPED', 'REWORK_DONE'));
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

-- ============================================================
-- Phase 1: Machine & Mould History, Tool Life Tracking & TPM
-- IATF 16949 Clause 8.5.1.5 (Total Productive Maintenance)
-- ============================================================
ALTER TABLE machines ADD COLUMN IF NOT EXISTS tonnage INTEGER DEFAULT 100;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS make_model TEXT DEFAULT 'Injection Moulding Machine';
ALTER TABLE machines ADD COLUMN IF NOT EXISTS year_of_commission INTEGER DEFAULT 2020;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS screw_diameter_mm NUMERIC DEFAULT 35;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS clamping_force_kn NUMERIC DEFAULT 1000;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS pm_due_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days');
ALTER TABLE machines ADD COLUMN IF NOT EXISTS tie_bar_distance_mm TEXT DEFAULT '410 x 410';
ALTER TABLE machines ADD COLUMN IF NOT EXISTS platen_size_mm TEXT DEFAULT '600 x 600';
ALTER TABLE machines ADD COLUMN IF NOT EXISTS min_mould_height_mm NUMERIC DEFAULT 150;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS max_mould_height_mm NUMERIC DEFAULT 450;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS clamping_stroke_mm NUMERIC DEFAULT 350;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS max_daylight_mm NUMERIC DEFAULT 800;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS ejector_stroke_mm NUMERIC DEFAULT 100;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS ejector_force_kn NUMERIC DEFAULT 35;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS max_shot_weight_g NUMERIC DEFAULT 180;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS motor_type TEXT DEFAULT 'Servo Hydraulic';
ALTER TABLE machines ADD COLUMN IF NOT EXISTS connected_load_kw NUMERIC DEFAULT 22;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS hourly_rate_inr NUMERIC DEFAULT 450;

CREATE TABLE IF NOT EXISTS moulds (
  id SERIAL PRIMARY KEY,
  mould_code TEXT UNIQUE NOT NULL,
  mould_name TEXT NOT NULL,
  ownership TEXT DEFAULT 'SHRP' CHECK (ownership IN ('SHRP', 'Customer')),
  customer_name TEXT,
  total_cavities INTEGER DEFAULT 1,
  active_cavities INTEGER DEFAULT 1,
  cumulative_shots INTEGER DEFAULT 0,
  shots_since_pm INTEGER DEFAULT 0,
  pm_interval_shots INTEGER DEFAULT 20000,
  storage_location TEXT DEFAULT 'Tool Crib Rack A-01',
  status TEXT DEFAULT 'ready' CHECK (status IN ('ready', 'running', 'under_maintenance', 'damaged')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mould_parts (
  id SERIAL PRIMARY KEY,
  mould_id INTEGER NOT NULL REFERENCES moulds(id) ON DELETE CASCADE,
  part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  cavities_for_part INTEGER DEFAULT 1,
  UNIQUE (mould_id, part_id)
);

CREATE INDEX IF NOT EXISTS idx_mould_parts_part ON mould_parts(part_id);
CREATE INDEX IF NOT EXISTS idx_mould_parts_mould ON mould_parts(mould_id);

CREATE TABLE IF NOT EXISTS mould_maintenance_logs (
  id SERIAL PRIMARY KEY,
  mould_id INTEGER NOT NULL REFERENCES moulds(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('pm_service', 'repair', 'inspection', 'polishing', 'overhaul')),
  shots_at_service INTEGER NOT NULL,
  description TEXT NOT NULL,
  technician_name TEXT NOT NULL,
  logged_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mould_maint_mould ON mould_maintenance_logs(mould_id, created_at DESC);

CREATE TABLE IF NOT EXISTS machine_breakdown_logs (
  id SERIAL PRIMARY KEY,
  machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
  breakdown_type TEXT NOT NULL CHECK (breakdown_type IN ('hydraulic', 'electrical', 'mechanical', 'heater', 'pneumatic', 'other')),
  downtime_minutes INTEGER NOT NULL DEFAULT 0,
  root_cause TEXT,
  corrective_action TEXT,
  parts_replaced TEXT,
  technician_name TEXT,
  logged_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_machine_bd_machine ON machine_breakdown_logs(machine_id, incident_date DESC);

-- Tooling Extensions (IATF 16949 Tool Management)
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS tool_maker TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS funded_by TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS tool_type TEXT DEFAULT 'Cold Runner';
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS suitable_machines TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS total_rated_life_shots INTEGER DEFAULT 500000;

CREATE TABLE IF NOT EXISTS mould_files (
  id SERIAL PRIMARY KEY,
  mould_id INTEGER NOT NULL REFERENCES moulds(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('drawing_3d', 'drawing_2d', 'photo_top', 'photo_op_side', 'photo_non_op_side', 'photo_parting_line', 'photo_shot', 'photo_general')),
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  data BYTEA NOT NULL,
  uploaded_by_user_id INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mould_files_mould ON mould_files(mould_id, file_type);

-- ================================================================
-- PHASE 1: RAW MATERIAL INWARD, DUAL-LAYER RECIPES & STOCK REGISTERS
-- ================================================================

CREATE TABLE IF NOT EXISTS raw_materials (
  id SERIAL PRIMARY KEY,
  material_code TEXT UNIQUE NOT NULL,
  material_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('VIRGIN_POLYMER', 'MASTERBATCH', 'RUBBER_COMPOUND', 'CHEMICAL_ADDITIVE', 'REGRIND')),
  supplier_name TEXT,
  grade_code TEXT,
  color TEXT,
  density_g_cm3 NUMERIC,
  mfi_g_10min NUMERIC,
  standard_bag_wt_kg NUMERIC DEFAULT 25.0,
  min_stock_kg NUMERIC DEFAULT 100.0,
  default_parameters TEXT, -- JSON array of check parameters
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rm_inward_entries (
  id SERIAL PRIMARY KEY,
  inward_no TEXT UNIQUE NOT NULL,
  material_id INTEGER NOT NULL REFERENCES raw_materials(id),
  supplier_name TEXT NOT NULL,
  invoice_no TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  supplier_lot_no TEXT NOT NULL,
  received_bags INTEGER NOT NULL,
  received_wt_kg NUMERIC NOT NULL,
  standard_bag_wt_kg NUMERIC DEFAULT 25.0,
  sample_size_bags INTEGER DEFAULT 5,
  has_supplier_tc BOOLEAN DEFAULT TRUE,
  tc_document_data TEXT,
  tc_filename TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_INSPECTION' CHECK (status IN ('PENDING_INSPECTION', 'ACCEPTED', 'REJECTED', 'QUARANTINE')),
  inspector_user_id INTEGER REFERENCES users(id),
  approved_by_user_id INTEGER REFERENCES users(id),
  inspected_at TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rm_inspection_parameters (
  id SERIAL PRIMARY KEY,
  inward_id INTEGER NOT NULL REFERENCES rm_inward_entries(id) ON DELETE CASCADE,
  parameter_name TEXT NOT NULL,
  specification TEXT,
  method_of_checking TEXT,
  obs_b1 TEXT,
  obs_b2 TEXT,
  obs_b3 TEXT,
  obs_b4 TEXT,
  obs_b5 TEXT,
  result TEXT NOT NULL DEFAULT 'OK' CHECK (result IN ('OK', 'NOT_OK', 'NA')),
  remarks TEXT
);

CREATE TABLE IF NOT EXISTS rm_stock_register (
  id SERIAL PRIMARY KEY,
  material_id INTEGER NOT NULL REFERENCES raw_materials(id),
  lot_no TEXT NOT NULL,
  inward_id INTEGER REFERENCES rm_inward_entries(id),
  current_stock_kg NUMERIC NOT NULL DEFAULT 0,
  reserved_stock_kg NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(material_id, lot_no)
);

CREATE TABLE IF NOT EXISTS part_recipes (
  id SERIAL PRIMARY KEY,
  part_id INTEGER NOT NULL REFERENCES parts(id) UNIQUE,
  primary_material_id INTEGER NOT NULL REFERENCES raw_materials(id),
  primary_ratio_pct NUMERIC NOT NULL DEFAULT 100.0,
  secondary_material_id INTEGER REFERENCES raw_materials(id),
  secondary_ratio_pct NUMERIC DEFAULT 0.0,
  regrind_material_id INTEGER REFERENCES raw_materials(id),
  regrind_ratio_pct NUMERIC DEFAULT 0.0,
  masterbatch_material_id INTEGER REFERENCES raw_materials(id),
  masterbatch_ratio_pct NUMERIC DEFAULT 0.0,
  max_allowed_regrind_pct NUMERIC DEFAULT 15.0,
  mixing_instructions TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shopfloor_wip_rm_pool (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('A', 'B')),
  machine_id INTEGER NOT NULL REFERENCES machines(id),
  material_id INTEGER NOT NULL REFERENCES raw_materials(id),
  opening_balance_kg NUMERIC NOT NULL DEFAULT 0,
  issued_qty_kg NUMERIC NOT NULL DEFAULT 0,
  consumed_qty_kg NUMERIC NOT NULL DEFAULT 0,
  closing_balance_kg NUMERIC NOT NULL DEFAULT 0,
  is_over_consumed BOOLEAN DEFAULT FALSE,
  over_consumed_approved_by INTEGER REFERENCES users(id),
  approval_remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, shift, machine_id, material_id)
);

-- ================================================================
-- USER ACTIVITY & LIVE SESSION MONITORING
-- ================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id);

-- HR Profile & Personal Details
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_data TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_no TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_no TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_ifsc TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nominee_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nominee_relation TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en';

CREATE TABLE IF NOT EXISTS user_activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  first_login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active_minutes INTEGER NOT NULL DEFAULT 1,
  actions_count INTEGER NOT NULL DEFAULT 1,
  last_page TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_user_activity_date ON user_activity_log(activity_date, user_id);

-- Leave & Permission Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('LEAVE', 'PERMISSION')),
  leave_type TEXT, -- Casual, Sick, Earned, Festival, Medical
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  from_time TIME,
  to_time TIME,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status, created_at DESC);






-- ============================================================
-- Deletion Audit Trail with Mandatory Remarks (IATF 16949 / ISO 9001)
-- ============================================================
CREATE TABLE IF NOT EXISTS deletion_audit_log (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  entity_code TEXT,
  deleted_by INTEGER REFERENCES users(id),
  deleted_by_name TEXT,
  deleted_by_role TEXT,
  reason TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deletion_audit_created_at ON deletion_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deletion_audit_entity ON deletion_audit_log(entity_type, entity_id);

-- ============================================================
-- Data Correction Requests & Audit Trail (IATF 16949 / ISO 9001)
-- ============================================================
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

-- ============================================================
-- Gauges & Instruments Master (calibration tracking, IATF 16949)
-- ============================================================
CREATE TABLE IF NOT EXISTS gauges (
  id SERIAL PRIMARY KEY,
  gauge_code TEXT UNIQUE NOT NULL,
  gauge_name TEXT NOT NULL,
  gauge_type TEXT,
  range_spec TEXT,
  accuracy TEXT,
  location TEXT,
  calibration_interval_days INTEGER NOT NULL DEFAULT 365,
  last_calibrated_at DATE,
  calibration_cert_no TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'scrapped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gauges_status ON gauges(status);

-- ============================================================
-- Supplier Master (separate from customers - who SHRP buys RM/services from)
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  supplier_code TEXT UNIQUE NOT NULL,
  supplier_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  materials_supplied TEXT,
  payment_terms TEXT,
  lead_time_days INTEGER,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(active);

-- ============================================================
-- Customer & Supplier Master IATF 16949 & GST Compliance
-- ============================================================
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gstin TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pan_no TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Tamil Nadu';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT '30 Days';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gst_last_verified_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gst_verification_status TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Auto-populate customer_code if missing
UPDATE customers SET customer_code = 'CUST-' || lpad(id::text, 3, '0') WHERE customer_code IS NULL;

ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS gstin TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS pan_no TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Tamil Nadu';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS vendor_rating NUMERIC DEFAULT 100;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS iso_iatf_certified BOOLEAN DEFAULT TRUE;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS cert_valid_upto DATE;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS gst_last_verified_at TIMESTAMPTZ;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS gst_verification_status TEXT;

-- Raw Materials drying parameters
ALTER TABLE raw_materials ADD COLUMN IF NOT EXISTS drying_temp_c NUMERIC DEFAULT 80;
ALTER TABLE raw_materials ADD COLUMN IF NOT EXISTS drying_time_hrs NUMERIC DEFAULT 4;
ALTER TABLE raw_materials ADD COLUMN IF NOT EXISTS melt_temp_c NUMERIC;

-- ============================================================
-- PRODUCTION PLANNING & IATF 16949 FIRST-PIECE APPROVAL (FPA)
-- ============================================================

-- 1. Extend Roles with Quality Inspector
DO $$
BEGIN
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
  ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('operator', 'supervisor', 'admin', 'quality_inspector'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2. Authoritative mould_id on machine_assignments
ALTER TABLE machine_assignments ADD COLUMN IF NOT EXISTS mould_id INTEGER REFERENCES moulds(id);

-- 3. Extend Parts with Program, Commodity, Velocity & Buffer Days
ALTER TABLE parts ADD COLUMN IF NOT EXISTS program TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS commodity TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS velocity_class TEXT DEFAULT 'FAST_MOVING' CHECK (velocity_class IN ('FAST_MOVING', 'SLOW_MOVING'));
ALTER TABLE parts ADD COLUMN IF NOT EXISTS buffer_stock_days INTEGER DEFAULT 7;

-- 4. Extend Customers with Plant Location & Transit Lead Times
ALTER TABLE customers ADD COLUMN IF NOT EXISTS plant_location TEXT DEFAULT 'Chennai';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS transit_lead_days INTEGER DEFAULT 1;

-- 5. Master Production Schedules (MPS)
CREATE TABLE IF NOT EXISTS master_production_schedules (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  part_id INTEGER NOT NULL REFERENCES parts(id),
  schedule_month DATE NOT NULL, -- First of month, e.g. '2026-09-01'
  working_days INTEGER NOT NULL DEFAULT 26,
  gross_demand INTEGER NOT NULL,
  net_demand INTEGER,
  receipts_target INTEGER NOT NULL,
  variance_pct NUMERIC NOT NULL DEFAULT 0,
  is_variance_override BOOLEAN NOT NULL DEFAULT FALSE,
  variance_confirmed_by INTEGER REFERENCES users(id),
  variance_confirmed_at TIMESTAMPTZ,
  variance_confirm_reason TEXT,
  prev_month_forecast INTEGER,
  consumption_variance_kg NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, part_id, schedule_month)
);

CREATE INDEX IF NOT EXISTS idx_mps_customer_month ON master_production_schedules(customer_id, schedule_month);
CREATE INDEX IF NOT EXISTS idx_mps_part_month ON master_production_schedules(part_id, schedule_month);

-- 6. Dynamic Rolling Forecast Child Table
CREATE TABLE IF NOT EXISTS mps_forecast_periods (
  id SERIAL PRIMARY KEY,
  mps_id INTEGER NOT NULL REFERENCES master_production_schedules(id) ON DELETE CASCADE,
  forecast_month DATE NOT NULL,
  forecast_qty INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(mps_id, forecast_month)
);

CREATE INDEX IF NOT EXISTS idx_mps_forecast_mps ON mps_forecast_periods(mps_id);

-- 7. Customer Delivery Milestones (Weekly Dispatches with Lead-Time Offset)
CREATE TABLE IF NOT EXISTS customer_delivery_milestones (
  id SERIAL PRIMARY KEY,
  mps_id INTEGER REFERENCES master_production_schedules(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  part_id INTEGER NOT NULL REFERENCES parts(id),
  delivery_date DATE NOT NULL,
  target_dispatch_date DATE NOT NULL,
  target_production_date DATE NOT NULL,
  scheduled_qty INTEGER NOT NULL,
  dispatched_qty INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PRODUCED', 'DISPATCHED', 'OVERDUE', 'CANCELLED')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_milestones_part_delivery ON customer_delivery_milestones(part_id, delivery_date);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON customer_delivery_milestones(status);

-- 8. Production Plans (Daily Shift Machine Schedules)
CREATE TABLE IF NOT EXISTS production_plans (
  id SERIAL PRIMARY KEY,
  plan_date DATE NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('A', 'B', 'ALL')),
  machine_id INTEGER NOT NULL REFERENCES machines(id),
  part_id INTEGER NOT NULL REFERENCES parts(id),
  mould_id INTEGER REFERENCES moulds(id),
  target_qty INTEGER NOT NULL,
  cycle_time_sec NUMERIC NOT NULL,
  planned_hours NUMERIC NOT NULL,
  required_rm_details JSONB NOT NULL DEFAULT '[]', -- Array of {material_id, material_name, required_kg, available_kg, status}
  rm_status TEXT NOT NULL DEFAULT 'AVAILABLE',
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  notes TEXT,
  created_by_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_production_plans_date_machine ON production_plans(plan_date, machine_id, shift);

-- 9. First-Piece Approval Submissions (IATF 16949 Cl. 8.5.1.1)
CREATE TABLE IF NOT EXISTS fpa_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL REFERENCES machine_assignments(id) ON DELETE CASCADE,
  machine_id INTEGER NOT NULL REFERENCES machines(id),
  part_id INTEGER NOT NULL REFERENCES parts(id),
  mould_id INTEGER REFERENCES moulds(id),
  setup_reason TEXT NOT NULL DEFAULT 'Mould Change',
  raw_material_id INTEGER REFERENCES raw_materials(id),
  rm_lot_no TEXT,
  dryer_temp_c NUMERIC,
  dryer_time_hrs NUMERIC,
  regrind_pct NUMERIC DEFAULT 0,
  regrind_approved BOOLEAN DEFAULT TRUE,
  regrind_exceeded_allowed BOOLEAN DEFAULT FALSE,
  mould_pm_overdue BOOLEAN DEFAULT FALSE,
  process_parameters JSONB NOT NULL DEFAULT '{}',
  visual_checks JSONB NOT NULL DEFAULT '{}',
  dimension_readings JSONB NOT NULL DEFAULT '{"dimensions":[],"overall_dimension_status":"PENDING"}',
  technician_user_id INTEGER REFERENCES users(id),
  quality_inspector_user_id INTEGER REFERENCES users(id),
  supervisor_user_id INTEGER REFERENCES users(id),
  approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'VISUAL_APPROVED', 'APPROVED', 'CONDITIONAL', 'REJECTED')),
  visual_approved_at TIMESTAMPTZ,
  visual_approved_by_user_id INTEGER REFERENCES users(id),
  full_approval_deadline TIMESTAMPTZ,
  deviation_no TEXT,
  remarks TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fpa_assignment ON fpa_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_fpa_status ON fpa_submissions(approval_status);

-- Add submission_type to distinguish FPA vs First-Off Sign-Off
ALTER TABLE fpa_submissions ADD COLUMN IF NOT EXISTS submission_type TEXT NOT NULL DEFAULT 'FPA' CHECK (submission_type IN ('FPA', 'FIRST_OFF_SIGNOFF'));
CREATE INDEX IF NOT EXISTS idx_fpa_submission_type ON fpa_submissions(submission_type);

-- 10. Update Deletion Requests Governance Check Constraint
DO $$
BEGIN
  ALTER TABLE deletion_requests DROP CONSTRAINT IF EXISTS deletion_requests_entity_type_check;
  ALTER TABLE deletion_requests ADD CONSTRAINT deletion_requests_entity_type_check
    CHECK (entity_type IN ('part', 'production_entry', 'bag', 'trim_entry', 'inspection_entry', 'packing_entry', 'dispatch_entry', 'fpa_submission', 'production_plan', 'master_production_schedule', 'machine_assignment'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 11. Private Office Premises & Device Security Management
CREATE TABLE IF NOT EXISTS allowed_ips (
  id SERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  label TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  device_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_label TEXT,
  login_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blocked_devices (
  id SERIAL PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,
  blocked_by_user_id INTEGER REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS approved_devices (
  id SERIAL PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,
  device_label TEXT,
  approved_by_user_id INTEGER REFERENCES users(id),
  approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approval_lat NUMERIC,
  approval_lng NUMERIC,
  approval_distance_m NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_approved_devices_id ON approved_devices(device_id);

-- 12. Master Document Numbering & Sequence Configuration
CREATE TABLE IF NOT EXISTS document_sequences (
  id SERIAL PRIMARY KEY,
  document_type TEXT UNIQUE NOT NULL,
  type_label TEXT,
  prefix TEXT NOT NULL,
  suffix TEXT DEFAULT '',
  padding_digits INTEGER NOT NULL DEFAULT 4,
  include_year BOOLEAN NOT NULL DEFAULT FALSE,
  year_format TEXT NOT NULL DEFAULT 'YYYY',
  current_number INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_sequences_type ON document_sequences(document_type);

-- Applied seeds tracking (one-time execution for seed files like seed_users.sql)
CREATE TABLE IF NOT EXISTS applied_seeds (
  id SERIAL PRIMARY KEY,
  filename TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
