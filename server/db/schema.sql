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

-- ================================================================
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
