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
