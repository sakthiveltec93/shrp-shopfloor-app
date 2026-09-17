-- ==============================================================================
-- MIGRATION: 002_reconcile_erp_masters.sql
-- DESCRIPTION: One-time authoritative master data reconciliation from ERP Master Requirements
-- IDEMPOTENT: Safe to re-run; uses atomic transaction, table backups, and ON CONFLICT UPSERTs.
-- ==============================================================================

BEGIN;

-- 1. Table Backups for 100% Rollback Safety
CREATE TABLE IF NOT EXISTS parts_backup_pre_reconcile AS SELECT * FROM parts;
CREATE TABLE IF NOT EXISTS moulds_backup_pre_reconcile AS SELECT * FROM moulds;
CREATE TABLE IF NOT EXISTS customers_backup_pre_reconcile AS SELECT * FROM customers;
CREATE TABLE IF NOT EXISTS suppliers_backup_pre_reconcile AS SELECT * FROM suppliers;
CREATE TABLE IF NOT EXISTS machines_backup_pre_reconcile AS SELECT * FROM machines;
CREATE TABLE IF NOT EXISTS gauges_backup_pre_reconcile AS SELECT * FROM gauges;

-- 2. Ensure Schema Columns & Relational Tables
CREATE TABLE IF NOT EXISTS part_machines (
  id SERIAL PRIMARY KEY,
  part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  cycle_time_sec NUMERIC NOT NULL DEFAULT 0,
  workcenter_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(part_id, machine_id)
);
CREATE INDEX IF NOT EXISTS idx_part_machines_part ON part_machines(part_id);
CREATE INDEX IF NOT EXISTS idx_part_machines_machine ON part_machines(machine_id);

ALTER TABLE parts ADD COLUMN IF NOT EXISTS batch_part_code TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS shrp_part_code TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS customer_part_no TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS part_weight_g NUMERIC;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS shot_weight_g NUMERIC;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS material_grade TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS selling_price NUMERIC DEFAULT 0;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS primary_packing TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS secondary_packing TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS bags_per_box INTEGER;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS rm_ratio JSONB DEFAULT '{}';

ALTER TABLE moulds ADD COLUMN IF NOT EXISTS yom INTEGER;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS mould_type TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS gate_type TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS maker TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS rack_no TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS suitable_machines TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS customer_name TEXT;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS short_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pan_no TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS plant_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS vendor_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS po_no TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gst_type TEXT;

ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS scope_of_supply TEXT;

ALTER TABLE machines ADD COLUMN IF NOT EXISTS is_key_machine BOOLEAN DEFAULT FALSE;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS has_counter BOOLEAN DEFAULT TRUE;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'PRODUCTION';
ALTER TABLE machines ADD COLUMN IF NOT EXISTS make TEXT;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS machine_type TEXT;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS dimension TEXT;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS screw_dia NUMERIC;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS hp NUMERIC;

ALTER TABLE gauges ADD COLUMN IF NOT EXISTS serial_no TEXT;
ALTER TABLE gauges ADD COLUMN IF NOT EXISTS make TEXT;
ALTER TABLE gauges ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT;
ALTER TABLE gauges ADD COLUMN IF NOT EXISTS calibration_agency TEXT;
ALTER TABLE gauges ADD COLUMN IF NOT EXISTS calibration_frequency TEXT;
ALTER TABLE gauges ADD COLUMN IF NOT EXISTS next_calibration_due TEXT;
ALTER TABLE gauges ADD COLUMN IF NOT EXISTS last_calibrated_text TEXT;

-- 3. Upsert 22 Machines

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('HSIM-01', 'Horizontal Injection Mould Machine', 'PAYAL', 50, 'SCREW TYPE', '270X320', 35, 140, 10, 2012, 157, TRUE, 'PRODUCTIon', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('HSIM-02', 'Horizontal Injection Mould Machine', 'SUPERMASTER', 50, 'SCREW TYPE', '310X370', 35, 140, 10, 2014, 157, TRUE, 'PRODUCTIon', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('HSIM-03', 'Horizontal Injection Mould Machine', 'L&T', 100, 'SCREW TYPE', '420X470', 35, 160, 27.5, 2022, 188, TRUE, 'PRODUCTIon', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('HSIM-04', 'Horizontal Injection Mould Machine', 'Haitian 120', 120, 'SCREW TYPE', '410x410', NULL, 157, 27, 2024, 200, TRUE, 'PRODUCTIon', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('HSIM-05', 'Horizontal Injection Mould Machine', 'Haitian 90', 90, 'SCREW TYPE', '360X360', NULL, 109, 22, 2022, 188, TRUE, 'PRODUCTIon', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('VIM-01', 'Vertical Injection Mould-01', 'TEXAIR', 40, 'TOGGLE TYPE - Vertical Plunger', '200 X 200', 25, 65, 4, 1999, 150, FALSE, 'PRODUCTIon', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('VIM-02', 'Vertical Injection Mould-02', 'HYDROFEX', 40, 'TOGGLE TYPE - Vertical Plunger', '200 X 200', 25, 65, 4, 2002, 150, TRUE, 'PRODUCTIon', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('VIM-03', 'Vertical Injection Mould-03', 'POLYTEX', 20, 'CYLINDER TYPE - Vertical Plunger', '150 X 150', 20, 45, 4, 2004, 125, FALSE, 'PRODUCTIon', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('VSIM-01', 'Vertical Screw Injection Mould', 'Tex Shine', 40, 'Vertical SCREW TYPE', '270 X220', 35, 140, 8, 2021, 150, TRUE, 'PRODUCTIon', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('RUB-01', 'Rubber hand press', 'PREMIER', 100, 'HAND FLY PRESS', '300X300', NULL, NULL, 3, 2005, 0, FALSE, 'PRODUCTIon', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('RUB-02', 'Hydraulic Rubber Press', '', 120, 'Hydraulic Press', '450 X 450', NULL, NULL, 9.4, 2012, 157, FALSE, 'PRODUCTIon', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('RUB-03', 'Hydraulic Rubber Press', '', 300, 'Hydraulic Press', '1000 X 300', NULL, NULL, 9.4, 2014, 0, FALSE, 'PRODUCTIon', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('HD-01', 'DRILLING MACHINE', 'BOSCH', 2500, '-', '-', NULL, NULL, NULL, 41688, 0, FALSE, 'non prodcution', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('HD-01', 'DRILLING MACHINE', 'BOSCH', 1500, '-', '-', NULL, NULL, NULL, 43506, 0, FALSE, 'non prodcution', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('HG-01', 'Grinding', 'BOSCH', 1500, '-', '-', NULL, NULL, NULL, 41045, 0, FALSE, 'non prodcution', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('AC-01', 'Air Compressor', 'Varsha', 2, '-', '-', NULL, NULL, NULL, 38599, 0, FALSE, 'non prodcution', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('CT-01', 'COOLING TOWER', '', 40, '-', '-', NULL, NULL, NULL, 40982, 0, FALSE, 'non prodcution', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('DG-01', 'DIESEL GENERATOR', 'KIRLOSKAR', 32, '-', '-', NULL, NULL, NULL, 41142, 0, FALSE, 'non prodcution', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('CR-01', 'CRANE', 'HSN-CHAIN BLOCK', 1, '-', '-', NULL, NULL, NULL, NULL, 0, FALSE, 'non prodcution', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('CR-02', 'CRANE', 'HSN-CHAIN BLOCK', 2, '-', '-', NULL, NULL, NULL, NULL, 0, FALSE, 'non prodcution', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('CR-03', 'CRANE', 'HSN-CHAIN BLOCK', 2, '-', '-', NULL, NULL, NULL, NULL, 0, FALSE, 'non prodcution', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

INSERT INTO machines (machine_code, description, make, tonnage, machine_type, dimension, screw_dia, max_shot_weight_g, hp, year_of_commission, hourly_rate_inr, has_counter, category, active)
VALUES ('CR-04', 'CRANE', 'HSN-CHAIN BLOCK', 3, '-', '-', NULL, NULL, NULL, NULL, 0, FALSE, 'non prodcution', TRUE)
ON CONFLICT (machine_code) DO UPDATE SET
  description = EXCLUDED.description,
  make = EXCLUDED.make,
  tonnage = EXCLUDED.tonnage,
  machine_type = EXCLUDED.machine_type,
  dimension = EXCLUDED.dimension,
  screw_dia = EXCLUDED.screw_dia,
  max_shot_weight_g = EXCLUDED.max_shot_weight_g,
  hp = EXCLUDED.hp,
  year_of_commission = EXCLUDED.year_of_commission,
  hourly_rate_inr = EXCLUDED.hourly_rate_inr,
  has_counter = EXCLUDED.has_counter,
  category = EXCLUDED.category,
  active = TRUE;

-- 4. Upsert 10 Customers (SHRP/CUS-001 Series)

INSERT INTO customers (customer_code, customer_name, short_name, address, gstin, pan_no, state_code, plant_code, vendor_code, po_no, gst_type, active)
VALUES ('SHRP/CUS-001', 'HANON AUTOMOTIVE SYSTEMS INDIA PVT LTD, TN', 'HANON CHENNAI', 'HANON AUTOMOTIVE SYSTEMS INDIA PVT LTD
KEELAKARANANI VILLAGE,MALROSAPURAM
CHENGALPATTU; TAMIL NADU 603204', '33AAACM6890R1ZS', 'AAACM6890R', '33 - Tamil Nadu', '1311', '1004430', '5100003060', '9% CGST+ 9% SGST', TRUE)
ON CONFLICT (customer_code) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  short_name = EXCLUDED.short_name,
  address = EXCLUDED.address,
  gstin = EXCLUDED.gstin,
  pan_no = EXCLUDED.pan_no,
  state_code = EXCLUDED.state_code,
  plant_code = EXCLUDED.plant_code,
  vendor_code = EXCLUDED.vendor_code,
  po_no = EXCLUDED.po_no,
  gst_type = EXCLUDED.gst_type,
  active = TRUE;

INSERT INTO customers (customer_code, customer_name, short_name, address, gstin, pan_no, state_code, plant_code, vendor_code, po_no, gst_type, active)
VALUES ('SHRP/CUS-002', 'HANON AUTOMOTIVE SYSTEMS INDIA PVT LTD, MH', 'HANON PUNE', 'HANON AUTOMOTIVE SYSTEMS INDIA PVT LTD
GATE NO 895,896,899/1,900,901 SANASWADI; SHIRUR
PUNE MAHARASTRA 412208
Delivery Contact Person - +91-9004000545', '27AAACM6890R1ZL', 'AAACM6890R', '27 - MAHARASTRA', '1313', '1004430', '5100003222', 'IGST 18%', TRUE)
ON CONFLICT (customer_code) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  short_name = EXCLUDED.short_name,
  address = EXCLUDED.address,
  gstin = EXCLUDED.gstin,
  pan_no = EXCLUDED.pan_no,
  state_code = EXCLUDED.state_code,
  plant_code = EXCLUDED.plant_code,
  vendor_code = EXCLUDED.vendor_code,
  po_no = EXCLUDED.po_no,
  gst_type = EXCLUDED.gst_type,
  active = TRUE;

INSERT INTO customers (customer_code, customer_name, short_name, address, gstin, pan_no, state_code, plant_code, vendor_code, po_no, gst_type, active)
VALUES ('SHRP/CUS-003', 'HANON CLIMATE CONTROL SYSTEMS INDIA PVT LTD', 'HANON CLIMATE SYSTEMS, BHIWADI', 'HANON CLIMATE CONTROL SYSTEMS INDIA PVT LTD
SP-812-A INDUSTRIAL AREA, PHASE 11,
BHIWADI, RAJASATHAN - 301019
Delivery Contact Person- +91-8003298106', '08AAACC1074D1Z6', 'AAACC1074D', '08 - RAJASTHAN', '1331', '1004205', '5100003216', 'IGST 18%', TRUE)
ON CONFLICT (customer_code) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  short_name = EXCLUDED.short_name,
  address = EXCLUDED.address,
  gstin = EXCLUDED.gstin,
  pan_no = EXCLUDED.pan_no,
  state_code = EXCLUDED.state_code,
  plant_code = EXCLUDED.plant_code,
  vendor_code = EXCLUDED.vendor_code,
  po_no = EXCLUDED.po_no,
  gst_type = EXCLUDED.gst_type,
  active = TRUE;

INSERT INTO customers (customer_code, customer_name, short_name, address, gstin, pan_no, state_code, plant_code, vendor_code, po_no, gst_type, active)
VALUES ('SHRP/CUS-004', 'WONJIN AUTOPARTS INDIA PVT. LTD.', 'WONJIN', 'WONJIN AUTOPARTS INDIA PVT. LTD.
PLOT NO AIK, CMDA INDUSTRIAL COMPLEX,
MARAIMALAINAGAR, CHENGALPATTU TALUK
KANCHEEPURAM DIST. PIN CODE 603209', '33AADCP2334E1ZY', 'AADCP2334E', '33 - Tamil Nadu', 'NA', 'WV0041', '', '9% CGST+ 9% SGST', TRUE)
ON CONFLICT (customer_code) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  short_name = EXCLUDED.short_name,
  address = EXCLUDED.address,
  gstin = EXCLUDED.gstin,
  pan_no = EXCLUDED.pan_no,
  state_code = EXCLUDED.state_code,
  plant_code = EXCLUDED.plant_code,
  vendor_code = EXCLUDED.vendor_code,
  po_no = EXCLUDED.po_no,
  gst_type = EXCLUDED.gst_type,
  active = TRUE;

INSERT INTO customers (customer_code, customer_name, short_name, address, gstin, pan_no, state_code, plant_code, vendor_code, po_no, gst_type, active)
VALUES ('SHRP/CUS-005', 'VK INDUSTRIES', 'VK INDUSTRIES', 'VK INDUSTRIES
No 326, Annai Moogambigai Nagar,
Near Indra Projects, Sengundram,
Singaperumal kovil - 603204', '33AKEPC1169N1Z8', 'AKEPC1169N', '33 - Tamil Nadu', 'NA', '', 'BY PHONE', '9% CGST+ 9% SGST', TRUE)
ON CONFLICT (customer_code) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  short_name = EXCLUDED.short_name,
  address = EXCLUDED.address,
  gstin = EXCLUDED.gstin,
  pan_no = EXCLUDED.pan_no,
  state_code = EXCLUDED.state_code,
  plant_code = EXCLUDED.plant_code,
  vendor_code = EXCLUDED.vendor_code,
  po_no = EXCLUDED.po_no,
  gst_type = EXCLUDED.gst_type,
  active = TRUE;

INSERT INTO customers (customer_code, customer_name, short_name, address, gstin, pan_no, state_code, plant_code, vendor_code, po_no, gst_type, active)
VALUES ('SHRP/CUS-006', 'Avadh Rail Infra Ltd', 'Avadh Rail Infra Ltd', 'Avadh Rail Infra Ltd
PA 5, Industrial Complex
MARAIMALAI NAGAR, Tamil Nadu-Chengalpattu 603209', '33AACCM8669A2ZJ', 'AACCM8669A', '33 - Tamil Nadu', 'NA', 'AP000251', '24741', '9% CGST+ 9% SGST', TRUE)
ON CONFLICT (customer_code) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  short_name = EXCLUDED.short_name,
  address = EXCLUDED.address,
  gstin = EXCLUDED.gstin,
  pan_no = EXCLUDED.pan_no,
  state_code = EXCLUDED.state_code,
  plant_code = EXCLUDED.plant_code,
  vendor_code = EXCLUDED.vendor_code,
  po_no = EXCLUDED.po_no,
  gst_type = EXCLUDED.gst_type,
  active = TRUE;

INSERT INTO customers (customer_code, customer_name, short_name, address, gstin, pan_no, state_code, plant_code, vendor_code, po_no, gst_type, active)
VALUES ('SHRP/CUS-007', 'NECCO TOOLS', 'NECCO TOOLS', 'NECCO TOOLS
Guindy, Chennai-600 032
C-57 & Partly C-23 Thiru-vi-ka Industrial Estate
Phone No:22500914', '33AAAPN3722G1Z6', 'AAAPN3722G', '33 - Tamil Nadu', 'NA', '', 'G00172/2025-2026', '9% CGST+ 9% SGST', TRUE)
ON CONFLICT (customer_code) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  short_name = EXCLUDED.short_name,
  address = EXCLUDED.address,
  gstin = EXCLUDED.gstin,
  pan_no = EXCLUDED.pan_no,
  state_code = EXCLUDED.state_code,
  plant_code = EXCLUDED.plant_code,
  vendor_code = EXCLUDED.vendor_code,
  po_no = EXCLUDED.po_no,
  gst_type = EXCLUDED.gst_type,
  active = TRUE;

INSERT INTO customers (customer_code, customer_name, short_name, address, gstin, pan_no, state_code, plant_code, vendor_code, po_no, gst_type, active)
VALUES ('SHRP/CUS-008', 'SONA BLW PRECISION FORGING LTD.,', 'SONA COMSTAR', 'SONA BLW PRECISION FORGING LTD., KEELAKARANAI VILLAGE,MELROSAPURAMPOST,
MARAIMALAINAGAR, CHENGALPATTU TALUK
KANCHEEPURAM DIST. PIN CODE 603 204', '33AABCS4786P1ZQ', 'AABCS4786P', '33 - Tamil Nadu', 'NA', '2000021', '5100000026', '14% CGST+ 14% SGST', TRUE)
ON CONFLICT (customer_code) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  short_name = EXCLUDED.short_name,
  address = EXCLUDED.address,
  gstin = EXCLUDED.gstin,
  pan_no = EXCLUDED.pan_no,
  state_code = EXCLUDED.state_code,
  plant_code = EXCLUDED.plant_code,
  vendor_code = EXCLUDED.vendor_code,
  po_no = EXCLUDED.po_no,
  gst_type = EXCLUDED.gst_type,
  active = TRUE;

INSERT INTO customers (customer_code, customer_name, short_name, address, gstin, pan_no, state_code, plant_code, vendor_code, po_no, gst_type, active)
VALUES ('SHRP/CUS-009', 'PRECISE LAPPING SOLUTIONS', 'PRECISE LAPPING', 'PRECISE LAPPING SOLUTIONS
1/700, M.R.K.NAGAR,MAIN ROAD, KOLAPAKKAM, Chennai, Tamil Nadu, 600128
Ph - 97895 47268 Email - sales@preciselapindia.com', '33AASFP3017E1ZF', 'AASFP3017E', '33 - Tamil Nadu', 'NA', 'NA', 'Email Communication', '9% CGST+ 9% SGST', TRUE)
ON CONFLICT (customer_code) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  short_name = EXCLUDED.short_name,
  address = EXCLUDED.address,
  gstin = EXCLUDED.gstin,
  pan_no = EXCLUDED.pan_no,
  state_code = EXCLUDED.state_code,
  plant_code = EXCLUDED.plant_code,
  vendor_code = EXCLUDED.vendor_code,
  po_no = EXCLUDED.po_no,
  gst_type = EXCLUDED.gst_type,
  active = TRUE;

INSERT INTO customers (customer_code, customer_name, short_name, address, gstin, pan_no, state_code, plant_code, vendor_code, po_no, gst_type, active)
VALUES ('SHRP/CUS-010', 'PONNORE ENTERPRISES LLP', 'PONNORE ENTERPRISES LLP', '76/1B, NUMBAL VILLAGE, VELAPPANCHAVADI
CHENNAI - 600077. PH - 044-26491507', '33AAPFP7515A1ZF', 'AAPFP7515A', '33 - Tamil Nadu', 'NA', 'NA', '', '9% CGST+ 9% SGST', TRUE)
ON CONFLICT (customer_code) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  short_name = EXCLUDED.short_name,
  address = EXCLUDED.address,
  gstin = EXCLUDED.gstin,
  pan_no = EXCLUDED.pan_no,
  state_code = EXCLUDED.state_code,
  plant_code = EXCLUDED.plant_code,
  vendor_code = EXCLUDED.vendor_code,
  po_no = EXCLUDED.po_no,
  gst_type = EXCLUDED.gst_type,
  active = TRUE;

-- 5. Upsert 11 Suppliers (SHRP/SUP-01 Series)

INSERT INTO suppliers (supplier_code, supplier_name, gstin, address, contact_person, mobile, email, scope_of_supply, active)
VALUES ('SHRP/SUP-01', 'RELIANCE INDUSTIRES LTD.', '33AAACR5055K1ZE', 'M/s. Reliance Industries Limited
No.60-A, Pariyapalayam High Road
Kannigaipair, Pariyapalayam, Thiruvallur', '', '', '', 'Raw Material', TRUE)
ON CONFLICT (supplier_code) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  gstin = EXCLUDED.gstin,
  address = EXCLUDED.address,
  contact_person = EXCLUDED.contact_person,
  mobile = EXCLUDED.mobile,
  email = EXCLUDED.email,
  scope_of_supply = EXCLUDED.scope_of_supply,
  active = TRUE;

INSERT INTO suppliers (supplier_code, supplier_name, gstin, address, contact_person, mobile, email, scope_of_supply, active)
VALUES ('SHRP/SUP-02', 'J J TOOLS AND TECHNOLOGIES', '33FVEPS9830L1ZX', 'M/s. JJ TOOLS AND TECHNOLOGIES
No.7/14, Ganapathi Nagar 1st Street
Ejjattuthangal, Chennai-600 032', '', '', '', 'Moulds-Manu', TRUE)
ON CONFLICT (supplier_code) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  gstin = EXCLUDED.gstin,
  address = EXCLUDED.address,
  contact_person = EXCLUDED.contact_person,
  mobile = EXCLUDED.mobile,
  email = EXCLUDED.email,
  scope_of_supply = EXCLUDED.scope_of_supply,
  active = TRUE;

INSERT INTO suppliers (supplier_code, supplier_name, gstin, address, contact_person, mobile, email, scope_of_supply, active)
VALUES ('SHRP/SUP-03', 'SHRI SWASTHIK POLYMERS', '33BJRPS4592N1Z7', 'M/s. Sri Swasthik Polymers
No.63, Thirupillai Street
Chennai-600 079', '', '', '', 'Raw Material', TRUE)
ON CONFLICT (supplier_code) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  gstin = EXCLUDED.gstin,
  address = EXCLUDED.address,
  contact_person = EXCLUDED.contact_person,
  mobile = EXCLUDED.mobile,
  email = EXCLUDED.email,
  scope_of_supply = EXCLUDED.scope_of_supply,
  active = TRUE;

INSERT INTO suppliers (supplier_code, supplier_name, gstin, address, contact_person, mobile, email, scope_of_supply, active)
VALUES ('SHRP/SUP-04', 'HYUNDAI ENGINEERING PLASTICS INDIA PVT LTD.', '33AABCH8073Q1Z3', 'Hyundai Engineering Plastics
No.137, Vayalur Village
Sriperumbudur, Thiruvallur (Dist)', '', '', '', 'Raw Material', TRUE)
ON CONFLICT (supplier_code) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  gstin = EXCLUDED.gstin,
  address = EXCLUDED.address,
  contact_person = EXCLUDED.contact_person,
  mobile = EXCLUDED.mobile,
  email = EXCLUDED.email,
  scope_of_supply = EXCLUDED.scope_of_supply,
  active = TRUE;

INSERT INTO suppliers (supplier_code, supplier_name, gstin, address, contact_person, mobile, email, scope_of_supply, active)
VALUES ('SHRP/SUP-05', 'SOUTHERN POLYMER INDUSTRIES', '33ABMFS7321P1ZM', 'M/s. Southern Polymer Industries
No.4, M.E.S. Road, 1st Cross Street
Ganapathypuram, East Tambaram, Chennai-600 033', '', '', '', 'Poly Bags', TRUE)
ON CONFLICT (supplier_code) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  gstin = EXCLUDED.gstin,
  address = EXCLUDED.address,
  contact_person = EXCLUDED.contact_person,
  mobile = EXCLUDED.mobile,
  email = EXCLUDED.email,
  scope_of_supply = EXCLUDED.scope_of_supply,
  active = TRUE;

INSERT INTO suppliers (supplier_code, supplier_name, gstin, address, contact_person, mobile, email, scope_of_supply, active)
VALUES ('SHRP/SUP-06', 'YESENR INSTRUMENT', '33AWGPR7314A1ZV', 'M/s. Yesner Calibration Services
No.2108, 13th Main Road
Anna Nagar, Chennai-600040', '', '', '', 'Instrument Calibration', TRUE)
ON CONFLICT (supplier_code) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  gstin = EXCLUDED.gstin,
  address = EXCLUDED.address,
  contact_person = EXCLUDED.contact_person,
  mobile = EXCLUDED.mobile,
  email = EXCLUDED.email,
  scope_of_supply = EXCLUDED.scope_of_supply,
  active = TRUE;

INSERT INTO suppliers (supplier_code, supplier_name, gstin, address, contact_person, mobile, email, scope_of_supply, active)
VALUES ('SHRP/SUP-07', 'PONNORE ENTERPRISES LLP', '33AAPFP7515A1ZF', 'M/s. Ponnore Enterprises LLP
No.76/1B, Poonamallee High Road
Velappanchavadi, Chennai-600077', '', '', '', 'Raw Material', TRUE)
ON CONFLICT (supplier_code) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  gstin = EXCLUDED.gstin,
  address = EXCLUDED.address,
  contact_person = EXCLUDED.contact_person,
  mobile = EXCLUDED.mobile,
  email = EXCLUDED.email,
  scope_of_supply = EXCLUDED.scope_of_supply,
  active = TRUE;

INSERT INTO suppliers (supplier_code, supplier_name, gstin, address, contact_person, mobile, email, scope_of_supply, active)
VALUES ('SHRP/SUP-08', 'Mechatron Calibration & Instrument', '', 'M/s. Mechatron Calibration & Instrument
No.19/37, 2nd Main Road
Sabari Nagar, Mugalivakkam, Chennai-600116', '', '', '', 'Calibration', TRUE)
ON CONFLICT (supplier_code) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  gstin = EXCLUDED.gstin,
  address = EXCLUDED.address,
  contact_person = EXCLUDED.contact_person,
  mobile = EXCLUDED.mobile,
  email = EXCLUDED.email,
  scope_of_supply = EXCLUDED.scope_of_supply,
  active = TRUE;

INSERT INTO suppliers (supplier_code, supplier_name, gstin, address, contact_person, mobile, email, scope_of_supply, active)
VALUES ('SHRP/SUP-09', 'Venus Calibration & Instruments', '', 'M/s. Venus Calibration & Instruments
No.16, 6th Street
Anna Sathya Nagar, Poothapedu, Ramapuram, Chennai-89', '', '', '', 'Calibration', TRUE)
ON CONFLICT (supplier_code) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  gstin = EXCLUDED.gstin,
  address = EXCLUDED.address,
  contact_person = EXCLUDED.contact_person,
  mobile = EXCLUDED.mobile,
  email = EXCLUDED.email,
  scope_of_supply = EXCLUDED.scope_of_supply,
  active = TRUE;

INSERT INTO suppliers (supplier_code, supplier_name, gstin, address, contact_person, mobile, email, scope_of_supply, active)
VALUES ('SHRP/SUP-10', 'Polymer Distributors', '33AAEFP0421C1Z3', 'M/s. Polymer Distributors
Godown: G 1 A, Industrial Estate, Vysarpadi, Chennai-600039
Office: No.34, Amman Koil Street, Park Town, Chennai-600003', '', '', '', 'Raw MAterial', TRUE)
ON CONFLICT (supplier_code) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  gstin = EXCLUDED.gstin,
  address = EXCLUDED.address,
  contact_person = EXCLUDED.contact_person,
  mobile = EXCLUDED.mobile,
  email = EXCLUDED.email,
  scope_of_supply = EXCLUDED.scope_of_supply,
  active = TRUE;

INSERT INTO suppliers (supplier_code, supplier_name, gstin, address, contact_person, mobile, email, scope_of_supply, active)
VALUES ('SHRP/SUP-11', 'SARVODAYA PLASTIC PRODUCTS', '33AABFS2606R1Z1', 'M/s. Sarvodaya Plastic Products
No.4, Krishnappa Tank Street
Kondithope, Chennai-600079', '', '', '', 'Raw MAterial', TRUE)
ON CONFLICT (supplier_code) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  gstin = EXCLUDED.gstin,
  address = EXCLUDED.address,
  contact_person = EXCLUDED.contact_person,
  mobile = EXCLUDED.mobile,
  email = EXCLUDED.email,
  scope_of_supply = EXCLUDED.scope_of_supply,
  active = TRUE;

-- 6. Upsert 25 Gauges & Calibration Master

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('DVC-01', 'Digital Vernier Caliper', '0 - 150 mm', '0.01 mm', 'X1406193178', 'Insize', 'Refer History Card', 'Venus Calibration', 'Once ia a Year', 'Shop Floor', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('DVC-02', 'Digital Vernier Caliper', '1 - 250 mm', '0.01 mm', '', 'Insize', 'Refer History Card', 'Venus Calibration', 'Once ia a Year', 'Shop Floor', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('DWB-01', 'Weighing Balance', '0 - 100 kg', '0.01kg', '-', '-', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'Shop Floor', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('DWB-02', 'Digital Thermo Meter', '0 - 15kg', '0.5g', 'H2500106283', 'Essae', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', '2 nd floor', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('DTM-01', 'Digital Thermo Meter', '-150 to 1300° c', '1° c', '100610688', 'Vartech', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', '-', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('DTH-01', 'Digital Thermo Hygrometer', '20 to 99% RH & -50 to 70° c', '1% RH & 0.1° c', '-', '-', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'VIM-01', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('DLM-01', 'Digital Lux Meter', '0-50000 Lux', '1/10/100 Lux', '202305025463', 'Mextech', '', 'Mechatron Calibration', 'Once ia a Year', 'APO', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('DTC-01', 'Temperature Controller', '0 - 400° c', '1° c', '-', 'Naveen Syatem', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'VIM-01', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('DTC-02', 'Temperature Controller', '0 - 400° c', '1° c', '-', 'Naveen Syatem', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'VIM-02', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('DTC-03', 'Temperature Controller', '0 - 400° c', '1° c', '-', 'Modem', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'VIM-03', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('DTC-04', 'Temperature Controller', '0 - 399° c', '1° c', '-', 'XMTE', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'HSIM02', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('DTC-05', 'Temperature Controller', '0 - 400° c', '1° c', '-', 'Indutrial Heaters', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'RUB 02', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('DTC-06', 'Temperature Controller', '0 - 400° c', '1° c', '', 'Elmec', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'RUB 02', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('PG-01', 'Pressure Gauge', '0 - 210 kg/ cm2', '5 kg/ cm2', 'I212798', 'Delta', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'HSIM04', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('PG-02', 'Pressure Gauge', '0 - 16 Mpa', '0.5 Mpa', '-', 'Tecsis', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'HSIM04', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('PG-03', 'Pressure Gauge', '0-25 Mpa', '1 Mpa', '-', 'Tecsis', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'HSIM05', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('PG-04', 'Pressure Gauge', '0 - 16 Mpa', '0.5 Mpa', '-', 'Tecsis', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'HSIM05', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('PG-05', 'Pressure Gauge', '0 - 210 kg/ cm2', '5 kg/ cm2', '-', 'kains', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'VSIM 01', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('PG-06', 'Pressure Gauge', '0 - 210 kg/ cm2', '5 kg/ cm2', '-', 'Delta', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'VIM 01', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('PG-07', 'Pressure Gauge', '0 - 210 kg/ cm2', '5 kg/ cm2', '-', 'Delta', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'VIM 02', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('PG-08', 'Pressure Gauge', '0 - 420 kg/ cm2', '10 kg/ cm2', '-', 'kains', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'RUB 02', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('PG-09', 'Pressure Gauge', '0 - 210 kg/ cm2', '5 kg/ cm2', '-', 'Delta', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'HSIM01', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('PG-10', 'Pressure Gauge', '0 - 280 kg/ cm2', '5 kg/ cm2', '-', 'Mass', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'HSIM03', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('PG-11', 'Pressure Gauge', '0 - 280 kg/ cm2', '5 kg/ cm2', '-', 'Mass', 'Refer History Card', 'Mechatron Calibration', 'Once ia a Year', 'HSIM03', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

INSERT INTO gauges (gauge_code, gauge_name, range_spec, accuracy, serial_no, make, acceptance_criteria, calibration_agency, calibration_frequency, location, last_calibrated_text, next_calibration_due, status)
VALUES ('SHR/HT-01', 'Shore A Hardness Tester', '0-100 Shore A', '1 Shore A', '-', 'K', 'Refer History Card', 'MSIA INDIA Calibration', 'Once ia a Year', '-', '26.11.2025', '25.11.2026', 'active')
ON CONFLICT (gauge_code) DO UPDATE SET
  gauge_name = EXCLUDED.gauge_name,
  range_spec = EXCLUDED.range_spec,
  accuracy = EXCLUDED.accuracy,
  serial_no = EXCLUDED.serial_no,
  make = EXCLUDED.make,
  acceptance_criteria = EXCLUDED.acceptance_criteria,
  calibration_agency = EXCLUDED.calibration_agency,
  calibration_frequency = EXCLUDED.calibration_frequency,
  location = EXCLUDED.location,
  last_calibrated_text = EXCLUDED.last_calibrated_text,
  next_calibration_due = EXCLUDED.next_calibration_due,
  status = 'active';

-- 7. Upsert 76 Parts & Workcenter Linkages

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'F885-BB1AA-01', 'cap txv', 'F885 Y', 'F885-BB1AA-01', '8',
    6, 32, 2.59, 22.5, 22.5,
    500, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'yellow', 0.96, 'PE Cover', 'Bin', 4, '{"grade1":0.13,"grade2":0.24,"mb":0.16,"colourRegrind":0.32,"naturalRegrind":0.16}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 32, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 36, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HC442L3LAC01', 'Cap (A) joint flange', 'LAC Blue', 'HC442L3LAC01', '35',
    16, 37, 4.44, 95.5, 95.5,
    400, FALSE, TRUE, TRUE, TRUE,
    'PVC GR65', 'navy blue', 2.5, 'PE Cover', 'Bin', 4, '{"grade1":0.7,"grade2":"","mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 37, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'DM1C4UBH1B01', 'Cap SHP''G EVAP CORE', 'DM1C', 'DM1C4UBH1B01', '32',
    8, 41, 1.29, 14, 14,
    750, TRUE, TRUE, TRUE, TRUE,
    'TPE MULTIFLEX', 'WHITE', 2.72, 'PE Cover', 'Bin', 4, '{"grade1":0.7,"grade2":"","mb":"","colourRegrind":"","naturalRegrind":0.3}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 41, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 38, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'FC1E1BAE1D01', 'SHG''G/CAPE. MISC', 'PUNE B', 'FC1E1BAE1D01', 'P1',
    6, 29, 2.36, 19.5, 19.5,
    400, FALSE, TRUE, TRUE, TRUE,
    'PPCP B030MG', 'Natural', 1.8, 'PE Cover', 'Box', 7, '{"grade1":0.7,"grade2":"","mb":"","colourRegrind":"","naturalRegrind":0.3}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 29, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'V0LC-01C022-00', 'PRODUCTION CAPE', '2200', 'V0LC-01C022-00', '28',
    6, 29, 1.62, 11, 11,
    750, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 0.75, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 29, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'WC-SCP-SC21NA-LC-01', 'SHP''G CAP LIQ COND END', 'NA-LC', 'WC-SCP-SC21NA-LC-01', 'W15',
    4, 38, 1.43, 7, 7,
    750, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.43, 'PE Cover', 'Bin', NULL, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 38, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'FC1F2CEEAA02', 'CAP - (D) JOINT FLANGE', 'CEEAA-ORANGE', 'FC1F2CEEAA02', '1A',
    6, 36, 5.75, 47.5, 47.5,
    250, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'orange', 2.78, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 36, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HW773G9E1B01', 'Shipping Cap Degas Spout', 'VW DIA 8 - HW773B', 'HW773G9E1B01', '23',
    6, 19, 0.34, 3.7, 3.7,
    3000, TRUE, FALSE, TRUE, TRUE,
    'LDPE 16MA400', 'Yellow', 0.8, 'PE Cover', 'Bin', 4, '{"grade1":0.14,"grade2":0.27,"mb":0.19,"colourRegrind":0.31,"naturalRegrind":0.9}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 19, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'A710-BBWBA-01', 'CAP-(D)JOINT FLANGE', 'A710', 'A710-BBWBA-01', '1',
    6, 36, 5.75, 47.5, 47.5,
    250, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.51, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 36, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim04'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'F364-CB5AA-01', 'HTR PIPE CAP', 'F364 16C', 'F364-CB5AA-01', '2',
    16, 42, 3, 62, 62,
    400, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.24, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 42, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 38, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim04'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 40, 3
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'F364-CB5AA-01', 'HTR PIPE CAP - GS (Line on Top)', 'F364 GS', 'F364-CB5AA-01', '2A',
    6, 29, 2.68, 19.5, 19.5,
    400, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.24, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 29, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 33, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'F442-KQAAA-01', 'DUST CAP CONDS', 'F442 KQ', 'F442-KQAAA-01', '4',
    6, 34, 4.33, 31.5, 31.5,
    200, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 34, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'F710-AKYAA-01', 'CAP-J/F', 'F710', 'F710-AKYAA-01', '7',
    7, 47, 3.44, 26.5, 26.5,
    400, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.29, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 47, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 45, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 38, 3
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'FC1F2AN6BA01', 'SHIPG CAP HYUNDAI/M', 'AN6B', 'FC1F2AN6BA01', '9',
    4, 30, 2.37, 13, 13,
    500, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.2, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 30, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 31, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 28, 3
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'FC1F2SPHAA02', 'SHP''G/CAP-HYUNDAI/M', 'AA02 Y', 'FC1F2SPHAA02', '10',
    4, 26, 1.75, 10, 10,
    750, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Yellow', 1.2, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 26, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 30, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'FC1F2SULLA01', 'SHP''G/CAP HYUNDAI/M', 'SULLA', 'FC1F2SULLA01', '11',
    4, 35, 2.62, 12, 12,
    300, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Blue', 2.23, 'PE Cover', 'Bin', 4, '{"grade1":"","grade2":"","mb":"","colourRegrind":"","naturalRegrind":""}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 35, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'FC1F2UGKCA01', 'SHP''G/CAP HYUNDAI/M', 'UGKCA', 'FC1F2UGKCA01', '12',
    8, 29, 0.8, 12.5, 12.5,
    1500, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.35, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 29, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'FC1F2UMEAB01', 'SHP''G/CAP HYUNDAI/M', 'UMEAB', 'FC1F2UMEAB01', '13',
    6, 33, 1.69, 14, 14,
    750, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.26, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 33, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HA715L5G1A01', 'CAP ACAC', 'HA715 - W501', 'HA715L5G1A01', '14',
    6, 31, 4.56, 31, 31,
    200, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.2, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 31, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 29, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim04'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HC442CXGAA01', 'CAP (A) JOINT FLANGE', 'CXGAA', 'HC442CXGAA01', '15',
    6, 35, 3.84, 29, 29,
    250, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 35, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 35, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HC442OERAA01', 'Shipping Cap', 'OERAA', 'HC442OERAA01', '38',
    6, 34, 1.28, 0, 0,
    1000, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 5.5, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 34, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HC442SPHAA03', 'CAP (A) JOINT FLANGE', 'AA03', 'HC442SPHAA03', '16',
    4, 36, 3.63, 18, 18,
    250, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 36, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HC442L3LBB01', 'CAP (A) JOINT FLANGE', 'LBB', 'HC442L3LBB01', '33',
    4, 34, 6.07, 31, 31,
    250, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.47, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 34, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim04'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 36, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HC442L3LBC02', 'CAP (A) JOINT FLANGE', 'LBC', 'HC442L3LBC02', '34',
    4, 37, 7.15, 36, 36,
    150, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.84, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 37, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim04'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 36, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HC442SULAC01', 'CAP (A) JOINT FLANGE', 'SULAC', 'HC442SULAC01', '17',
    4, 41, 3.59, 17.5, 17.5,
    300, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.82, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 41, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HC443QQVBA02', 'CCAP (B) JOINT FLANGE (yellow)', 'QQVBA W', 'HC443QQVBA02', '18',
    5, 34, 1.79, 11.5, 11.5,
    750, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Yellow', 1.6, 'PE Cover', 'Bin', 4, '{"grade1":"","grade2":"","mb":"","colourRegrind":"","naturalRegrind":""}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 34, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HC443QQVBA02', 'CCAP (B) JOINT FLANGE (White)', 'QQVBA Y', 'HC443QQVBA02', '18Y',
    5, 34, 1.79, 11.5, 11.5,
    750, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Yellow', 1.6, 'PE Cover', 'Bin', 4, '{"grade1":"","grade2":"","mb":"","colourRegrind":"","naturalRegrind":""}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 34, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HR230DH7AA01', 'PLUG-RAD PIPE', 'DH7AA', 'HR230DH7AA01', '21',
    4, 29, 7.18, 31, 31,
    100, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 3.25, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 29, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim04'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HR230PDPKA02', 'PLUG-RAD PIPE', 'PDPKA', 'HR230PDPKA02', '20',
    4, 36, 9.34, 38.5, 38.5,
    100, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 3.1, 'PE Cover', 'Bin', 3, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 36, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim04'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HL180F4W1A01', 'CAP CHL''R NEX GEN PORSCHE', 'HL180', 'HL180F4W1A01', '19',
    4, 0, 0.99, 6.5, 6.5,
    1000, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 0.8, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HW773G9E1A01', 'CAP WCAC 16DIA', 'VW DIA 16 - HW773A', 'HW773G9E1A01', '22',
    6, 23, 1.2, 9.3, 9.3,
    1000, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Yellow', 0.88, 'PE Cover', 'Bin', 4, '{"grade1":"","grade2":"","mb":"","colourRegrind":"","naturalRegrind":""}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 23, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'R230-NC5BA-01', 'PLUG RAD PIPE', 'NCBA', 'R230-NC5BA-01', '24',
    4, 33, 5.99, 26.5, 26.5,
    200, TRUE, FALSE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.91, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 33, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 39, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 36, 3
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim04'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 33, 4
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'R230-NC5BB-01', 'PLUG RAD PIPE', 'NCBB', 'R230-NC5BB-01', '25',
    4, 33, 6.2, 28, 28,
    105, TRUE, FALSE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.91, 'PE Cover', 'Bin', 6, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 33, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim04'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 33, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'V0LC-01C019-01', 'CAP-J/FLANGE', '1901', 'V0LC-01C019-01', '26',
    6, 24, 1.68, 11.7, 11.7,
    600, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 0.8, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 24, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'V0LC-01C021-00', 'CAP-J/FLANGE 12MM', '2100', 'V0LC-01C021-00', '27',
    6, 33, 1.88, 15.5, 15.5,
    750, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 0.8, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 33, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'V0LC-01C028-00', 'CAP', '2800', 'V0LC-01C028-00', '29',
    4, 31, 2.26, 11, 11,
    500, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 0.96, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 31, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 33, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'VP5N1H-407721-AA', 'PROTECTION CAP - INLET', 'VPAA', 'VP5N1H-407721-AA', '30',
    6, 27, 1.71, 15, 15,
    650, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 0.82, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 27, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 27, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 32, 3
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim04'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'VP5N1H-407721-FA', 'CAP-J FLANGE MALE', 'VPFA', 'VP5N1H-407721-FA', '31',
    6, 30, 2.24, 16.5, 16.5,
    500, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 0.96, 'PE Cover', 'Bin', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 30, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 32, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HR241BAE1B01', 'CAP RAD', 'PUNE S', 'HR241BAE1B01', 'P2',
    6, 29, 1, 11.5, 11.5,
    800, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.8, 'PE Cover', 'Box', 7, '{"grade1":"","grade2":"","mb":"","colourRegrind":"","naturalRegrind":""}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 29, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 25, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'FC1P4L1E1A01', 'Shipping Cap Hose Liquid', 'BH-DIA 8', 'FC1P4L1E1A01', 'B3',
    6, 25, 0.78, 7, 7,
    1500, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.39, 'PE Cover', 'Box', 11, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 25, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim04'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 20, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'PLFC1E4K5MAA-00', 'DUST CAP (SUCTION)(16)', 'BH-DIA 16 - MAA', 'PLFC1E4K5MAA-00', 'B1',
    6, 26, 1.24, 13, 13,
    1000, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.5, 'PE Cover', 'Box', 7, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 26, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 21, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim04'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 22, 3
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'PLFC1E4K5MBA-00', 'DUST CAP (DISCHARGE)(12)', 'BH-DIA 12 -MBA', 'PLFC1E4K5MBA-00', 'B2',
    6, 23, 1.36, 14, 14,
    750, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.5, 'PE Cover', 'Box', 8, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 23, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 29, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 23, 3
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim04'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 22, 4
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim05'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'F442-KQ', 'SHIPPING END CAP (IA) FLANGE', 'KQ NEW', 'F442-KQ', 'W3',
    1, 0, 0, 0, 0,
    1000, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.07, 'PE Cover', 'Bag', 6, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'SHRP-T8', 'SHIPPING END CAP (IA) FLANGE', 'SHRP-T8', 'SHRP-T8', 'W8',
    2, 0, 2.21, 5.5, 5.5,
    500, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.5, 'PE Cover', 'Bag', 6, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'WC-SCP-ECC21-DA01', 'Shipping Cap DIS Comp Side', 'DA', 'WC-SCP-ECC21-DA01', 'W9',
    2, 0, 2.37, 5.5, 5.5,
    500, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.35, 'PE Cover', 'Bag', 6, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'WC-SCP-ECC21-LMF01', 'Shipping Cap Liq Middle Female Type', 'LMF', 'WC-SCP-ECC21-LMF01', 'W10',
    2, 0, 2.05, 6.5, 6.5,
    650, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.19, 'PE Cover', 'Bag', 6, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'WC-SCP-eCC21-Lmm01', 'Shipping Cap LIQ Middle Male Type', 'LMM', 'WC-SCP-eCC21-Lmm01', 'W11',
    2, 0, 0, 0, 0,
    650, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.36, 'PE Cover', 'Bag', 6, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'WC-SCP-ECC21-SMF01', 'Shipping Cap Suc Middle Female Type', 'SMF', 'WC-SCP-ECC21-SMF01', 'W12',
    2, 0, 2.73, 6.5, 6.5,
    500, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.41, 'PE Cover', 'Bag', 6, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'WC-SCP-eCC21-Smm01', 'Shipping Cap SUC Middle Male Type', 'SMM', 'WC-SCP-eCC21-Smm01', 'W13',
    6, 0, 2.48, 5, 5,
    500, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.09, 'PE Cover', 'Bag', 6, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'WC-SCP-SC21NA-DB-01', 'SHIPING CAP DIS COND SIDE', 'NA-DB', 'WC-SCP-SC21NA-DB-01', 'W14',
    4, 0, 2.68, 13.12, 13.12,
    500, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.71, 'PE Cover', 'Bag', 6, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'CA581CAWXX01', 'CAP ASY-SUC', 'AFM BIG', 'CA581CAWXX01', '36',
    6, 0, 5.77, 85.5, 85.5,
    250, FALSE, TRUE, TRUE, TRUE,
    'HNBR', 'BLACK', 13.88, 'PE Cover', 'Box', 4, '{"grade1":1,"grade2":"","mb":"","colourRegrind":"","naturalRegrind":""}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'rub01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'CA582DDRXX01', 'CAP ASY-DIS', 'AFM SMALL', 'CA582DDRXX01', '37',
    6, 0, 4.92, 68.5, 68.5,
    250, FALSE, TRUE, TRUE, TRUE,
    'HNBR', 'BLACK', 13.48, 'PE Cover', 'Box', 4, '{"grade1":1,"grade2":"","mb":"","colourRegrind":"","naturalRegrind":""}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'rub01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'F442-QQ7AA-01', 'DUST CAP COND', 'F442 QQ', 'F442-QQ7AA-01', '3',
    4, 27, 3.97, 19.1, 19.1,
    300, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.66, 'PE Cover', 'BIN', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 27, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vsim01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'F442-WBAAA-01', 'DUST CAP-COND', 'F442 WB', 'F442-WBAAA-01', '5',
    1, 0, 3.31, 4, 4,
    300, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.93, 'PE Cover', 'BIN', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'FC1F2NDGAA02', 'CAP-(D)JOINT FLANGE', 'NDGAA', 'FC1F2NDGAA02', '47',
    6, 32, 2, 16.7, 16.7,
    650, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.37, 'PE Cover', 'BIN', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 32, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'FC1F2UMEAA01', 'SHP''G/CAP HYUNDAI/M', 'UMEAA', 'FC1F2UMEAA01', '46',
    4, 30, 2.57, 12.5, 12.5,
    300, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.52, 'PE Cover', 'BIN', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 30, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HC442QVEAC01', 'CAP (A) JOINT FLANGE', 'QVEAC', 'HC442QVEAC01', '39',
    8, 30, 1.21, 16, 16,
    1000, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.5, 'PE Cover', 'BIN', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 30, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 30, 2
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim04'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HC442QVEBC01', 'CAP (A) JOINT FLANGE', 'QVEBC', 'HC442QVEBC01', '40',
    8, 32, 1.5, 19, 19,
    1000, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.47, 'PE Cover', 'BIN', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 32, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HC442UMNAA02', 'CAP (A) JOINT FLANGE', 'UMNAA', 'HC442UMNAA02', '45',
    6, 35, 3.56, 29.5, 29.5,
    250, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.66, 'PE Cover', 'BIN', 4, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 35, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'DM1C1QRJAA01', 'SHIPPPING CAP HTR', 'DM1C1QRJAA01', 'DM1C1QRJAA01', '',
    1, 30, 3, 62, 62,
    400, FALSE, FALSE, FALSE, FALSE,
    'LDPE 16MA400', 'Natural', 1.77, 'PE Cover', 'Box', 7, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'VPR230-WC9AB-01', 'DUST PROTECTION CAP', '9AB', 'VPR230-WC9AB-01', 'B9',
    4, 0, 3.1, 13.6, 13.6,
    300, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 3.3, 'PE Cover', 'Box', 8, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HR241G6C1A01', 'CAP MG RAD 18.5', 'HR241', 'HR241G6C1A01', 'B4',
    6, 26, 0, 18.5, 18.5,
    400, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.92, 'PE Cover', 'Box', 8, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 26, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'hsim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HC442G6C1A', 'MG Condensor INLET', 'INLET', 'HC442G6C1A', 'B6',
    4, 0, 1.44, 8.5, 8.5,
    1000, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.04, 'PE Cover', 'Box', 12, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HC442G6C1B', 'MG Condensor Outlet', 'OUTLET', 'HC442G6C1B', 'B5',
    4, 0, 1.44, 8.5, 8.5,
    1000, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.94, 'PE Cover', 'Box', 12, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'R101WC9AA01', 'CAP TOC-CONN', 'R101', 'R101WC9AA01', 'B7',
    4, 0, 0, 0, 0,
    2000, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 1.98, 'PE Cover', 'Box', 12, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'VPR230WC9AA01', 'DUST PROTECTION CAP RAD', '9AA', 'VPR230WC9AA01', 'B8',
    4, 0, 0, 0, 0,
    400, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 3.13, 'PE Cover', 'Box', 8, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'F390-QQDC-A02', 'SHIPPING CAP', 'F390', 'F390-QQDC-A02', 'W1',
    4, 30, 0, 0, 0,
    1000, FALSE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 0.4, 'PE Cover', 'BAG', 6, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'SHRP-T7', 'SHIPPING (WHITE)-HP (IA)', 'SHRP-T7', 'SHRP-T7', 'W7',
    2, 30, 0, 0, 0,
    2000, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 0.5, 'PE Cover', 'BAG', 6, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'SHRP-T10', 'SHIPPING (white)-LP (IA)', 'SHRP-T10', 'SHRP-T10', 'W4',
    2, 30, 0, 0, 0,
    2000, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 0.5, 'PE Cover', 'BAG', 6, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'VPMGH-18B602-DA', 'SHIPPING CAP SV CT', 'LAC GREEN', 'VPMGH-18B602-DA', 'W15',
    16, 30, 4.44, 95.5, 95.5,
    400, FALSE, TRUE, TRUE, TRUE,
    'PVC GR65', 'GREEN', 2.15, 'PE Cover', 'BAG', 6, '{"grade1":0.7,"grade2":"","mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'WC-SCP-SC21NA-TB-T01', 'SHP''G CAP TXV SIDE', 'NA-TB', 'WC-SCP-SC21NA-TB-T01', 'W16',
    4, 0, 3.61, 16.5, 16.5,
    300, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.14, 'PE Cover', 'BAG', 6, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'F442-ATBAB-02', 'SHP''G CAP GS JUMPER TUBE JF', 'ATBAB', 'F442-ATBAB-02', 'W18',
    2, 30, 3.63, 8.5, 8.5,
    300, TRUE, TRUE, TRUE, TRUE,
    'LDPE 16MA400', 'Natural', 2.15, 'PE Cover', 'BAG', 6, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 30, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'SmallGrommet', 'GROMMET', 'SmallGrommet', 'SmallGrommet', '',
    4, 0, 0, 0, 0,
    3000, FALSE, FALSE, FALSE, FALSE,
    'LDPE 16MA400', 'Natural', 0.4, 'PE Cover', 'BAG', NULL, '{"grade1":0.2,"grade2":0.6,"mb":"","colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim02'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'VP6TLU11N087AA', 'CVR STR MTR SOLE TERM', 'VP6T', 'VP6TLU11N087AA', 'C1',
    16, 0, 0, 0, 0,
    1000, TRUE, TRUE, TRUE, TRUE,
    'NBR', 'BLACK', 2.75, 'PE Cover', 'BOX', NULL, '{"grade1":1,"grade2":"","mb":"","colourRegrind":"","naturalRegrind":""}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'rub01'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'HandlePlastic', 'HNDL', 'HandlePlastic', 'HandlePlastic', '',
    1, 0, 0, 0, 0,
    90, FALSE, FALSE, FALSE, FALSE,
    'LDPE 16MA400', 'RED', 30, 'PE Cover', 'OPEN', NULL, '{"grade1":0.15,"grade2":0.45,"mb":0.2,"colourRegrind":"","naturalRegrind":0.2}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

DO $$
DECLARE
  v_part_id INTEGER;
BEGIN
  INSERT INTO parts (
    part_code, part_name, shrp_part_code, customer_part_no, batch_part_code,
    cavity_count, standard_cycle_time_sec, part_weight_g, unit_weight_g, shot_weight_g,
    standard_pack_qty, trim_required, inspection_required, packing_required, dispatch_required,
    material_grade, color, selling_price, primary_packing, secondary_packing, bags_per_box, rm_ratio, active
  )
  VALUES (
    'SYRNGECAP', 'CAP', 'SYRINGE CAP', 'SYRNGECAP', 'O1',
    12, 0, 0, 0, 0,
    1500, TRUE, TRUE, TRUE, TRUE,
    'TPE MULTIFLEX', 'WHITE', 0.8, 'PE Cover', 'OPEN', NULL, '{"grade1":"","grade2":"","mb":"","colourRegrind":"","naturalRegrind":1}'::jsonb, TRUE
  )
  ON CONFLICT (part_code) DO UPDATE SET
    part_name = EXCLUDED.part_name,
    shrp_part_code = EXCLUDED.shrp_part_code,
    customer_part_no = EXCLUDED.customer_part_no,
    batch_part_code = EXCLUDED.batch_part_code,
    cavity_count = EXCLUDED.cavity_count,
    standard_cycle_time_sec = EXCLUDED.standard_cycle_time_sec,
    part_weight_g = EXCLUDED.part_weight_g,
    unit_weight_g = EXCLUDED.unit_weight_g,
    shot_weight_g = EXCLUDED.shot_weight_g,
    standard_pack_qty = EXCLUDED.standard_pack_qty,
    trim_required = EXCLUDED.trim_required,
    inspection_required = EXCLUDED.inspection_required,
    packing_required = EXCLUDED.packing_required,
    dispatch_required = EXCLUDED.dispatch_required,
    material_grade = EXCLUDED.material_grade,
    color = EXCLUDED.color,
    selling_price = EXCLUDED.selling_price,
    primary_packing = EXCLUDED.primary_packing,
    secondary_packing = EXCLUDED.secondary_packing,
    bags_per_box = EXCLUDED.bags_per_box,
    rm_ratio = EXCLUDED.rm_ratio,
    active = TRUE
  RETURNING id INTO v_part_id;

  INSERT INTO part_machines (part_id, machine_id, cycle_time_sec, workcenter_order)
  SELECT v_part_id, id, 0, 1
  FROM machines 
  WHERE replace(replace(replace(lower(machine_code), ' ', ''), '-', ''), '_', '') = 'vim03'
  ON CONFLICT (part_id, machine_id) DO UPDATE SET
    cycle_time_sec = EXCLUDED.cycle_time_sec,
    workcenter_order = EXCLUDED.workcenter_order;
END $$;

-- 8. Upsert 69 Moulds & Tooling Linkages

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC01', 'SH HC01 - A710', 'Customer', 'HASI CHENNAI', 6, 6,
    2025, 'SIDE CORE - 3 PLATE TOOL', 'PIN POINT GATE', 'JJ TOOLS', 'HSIM - 04', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('A710') OR lower(part_code) = lower('A710-BBWBA-01') OR lower(customer_part_no) = lower('A710-BBWBA-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC02', 'SH HC02 - F364 16C', 'SHRP', 'HASI CHENNAI', 16, 16,
    2025, '3 PLATE TOOL', 'PIN POINT GATE', 'JJ TOOLS', 'HSIM - 01, HSIM - 04, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 16
  FROM parts
  WHERE lower(shrp_part_code) = lower('F364 16C') OR lower(part_code) = lower('F364-CB5AA-01') OR lower(customer_part_no) = lower('F364-CB5AA-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC03', 'SH HC03 - F364 GS', 'SHRP', 'HASI CHENNAI', 6, 6,
    2020, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 01, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('F364 GS') OR lower(part_code) = lower('F364-CB5AA-01') OR lower(customer_part_no) = lower('F364-CB5AA-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC04', 'SH HC04 - F442 KQ', 'SHRP', 'HASI CHENNAI', 6, 6,
    2011, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('F442 KQ') OR lower(part_code) = lower('F442-KQAAA-01') OR lower(customer_part_no) = lower('F442-KQAAA-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC05', 'SH HC05 - F442 QQ', 'SHRP', 'HASI CHENNAI', 4, 4,
    2007, '2 PLATE TOOL', 'EDGE GATE', 'OLD', 'VSIM - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('F442 QQ') OR lower(part_code) = lower('F442-QQ7AA-01') OR lower(customer_part_no) = lower('F442-QQ7AA-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC06', 'SH HC06 - F442 WB', 'SHRP', 'HASI CHENNAI', 1, 1,
    2011, '2 PLATE TOOL', 'EDGE GATE', 'OLD', 'VIM 03', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 1
  FROM parts
  WHERE lower(shrp_part_code) = lower('F442 WB') OR lower(part_code) = lower('F442-WBAAA-01') OR lower(customer_part_no) = lower('F442-WBAAA-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC07', 'SH HC07 - F710', 'SHRP', 'HASI CHENNAI', 7, 7,
    2007, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 02, HSIM - 03, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 7
  FROM parts
  WHERE lower(shrp_part_code) = lower('F710') OR lower(part_code) = lower('F710-AKYAA-01') OR lower(customer_part_no) = lower('F710-AKYAA-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC08', 'SH HC08 - F885 Y', 'SHRP', 'HASI CHENNAI', 6, 6,
    2007, '2 PLATE TOOL', 'EDGE GATE', 'OLD', 'HSIM - 01, HSIM - 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('F885 Y') OR lower(part_code) = lower('F885-BB1AA-01') OR lower(customer_part_no) = lower('F885-BB1AA-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC09', 'SH HC09 - AN6B', 'SHRP', 'HASI CHENNAI', 4, 4,
    2019, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 02, HSIM - 03, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('AN6B') OR lower(part_code) = lower('FC1F2AN6BA 01') OR lower(customer_part_no) = lower('FC1F2AN6BA 01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC10', 'SH HC10 - AA02 Y', 'SHRP', 'HASI CHENNAI', 4, 4,
    2019, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 01, HSIM - 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('AA02 Y') OR lower(part_code) = lower('FC1F2SPHAA 02') OR lower(customer_part_no) = lower('FC1F2SPHAA 02')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC11', 'SH HC11 - SULLA', 'Customer', 'HASI CHENNAI', 4, 4,
    2021, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('SULLA') OR lower(part_code) = lower('FC1F2SULLA 01') OR lower(customer_part_no) = lower('FC1F2SULLA 01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC12', 'SH HC12 - UGKCA', 'Customer', 'HASI CHENNAI', 8, 8,
    2021, 'SIDE CORE TOOL', 'PIN GATE', 'JJ TOOLS', 'HSIM - 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 8
  FROM parts
  WHERE lower(shrp_part_code) = lower('UGKCA') OR lower(part_code) = lower('FC1F2UGKCA 01') OR lower(customer_part_no) = lower('FC1F2UGKCA 01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC13', 'SH HC13 - UMEAB', 'Customer', 'HASI CHENNAI', 6, 6,
    2021, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('UMEAB') OR lower(part_code) = lower('FC1F2UMEAB01') OR lower(customer_part_no) = lower('FC1F2UMEAB01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC14', 'SH HC14 - HA715', 'Customer', 'HASI CHENNAI', 6, 6,
    2023, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 03, HSIM - 04', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('HA715') OR lower(part_code) = lower('HA715L5G1A01') OR lower(customer_part_no) = lower('HA715L5G1A01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC15', 'SH HC15 - CXGAA', 'SHRP', 'HASI CHENNAI', 6, 6,
    2025, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 03, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('CXGAA') OR lower(part_code) = lower('HC442CXGAA 01') OR lower(customer_part_no) = lower('HC442CXGAA 01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC16', 'SH HC16 - AA03', 'SHRP', 'HASI CHENNAI', 4, 4,
    2019, '2 PLATE TOOL', 'EDGE GATE', 'HP TOOLS', 'VSIM - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('AA03') OR lower(part_code) = lower('HC442SPHAA 03') OR lower(customer_part_no) = lower('HC442SPHAA 03')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC17', 'SH HC17 - SULAC', 'Customer', 'HASI CHENNAI', 4, 4,
    2023, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VSIM - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('SULAC') OR lower(part_code) = lower('HC442SULAC01') OR lower(customer_part_no) = lower('HC442SULAC01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC18', 'SH HC18 - QQVBA W', 'SHRP', 'HASI CHENNAI', 5, 5,
    2021, '2 PLATE TOOL', 'EDGE GATE', 'HP TOOLS', 'VSIM - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 5
  FROM parts
  WHERE lower(shrp_part_code) = lower('QQVBA W') OR lower(part_code) = lower('HC443QQVBA02') OR lower(customer_part_no) = lower('HC443QQVBA02')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC19', 'SH HC19 - HL180', 'SHRP', 'HASI CHENNAI', 4, 4,
    2020, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VIM - 02, VSIM - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('HL180') OR lower(part_code) = lower('HL180F4W1A 01') OR lower(customer_part_no) = lower('HL180F4W1A 01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC20', 'SH HC20 - DH7AA', 'Customer', 'HASI CHENNAI', 4, 4,
    2023, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 04', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('DH7AA') OR lower(part_code) = lower('HR230DH7AA01') OR lower(customer_part_no) = lower('HR230DH7AA01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC21', 'SH HC21 - PDPKA', 'Customer', 'HASI CHENNAI', 4, 4,
    2023, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 04', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('PDPKA') OR lower(part_code) = lower('HR230PDPKA02') OR lower(customer_part_no) = lower('HR230PDPKA02')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC22', 'SH HC22 - VW DIA 16 - HW773A', 'Customer', 'HASI CHENNAI', 6, 6,
    2022, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VSIM - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('VW DIA 16 - HW773A') OR lower(part_code) = lower('HW773G9E1A01') OR lower(customer_part_no) = lower('HW773G9E1A01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC23', 'SH HC23 - VW DIA 8 - HW773B', 'Customer', 'HASI CHENNAI', 6, 6,
    2022, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VSIM - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('VW DIA 8 - HW773B') OR lower(part_code) = lower('HW773G9E1B01') OR lower(customer_part_no) = lower('HW773G9E1B01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC24', 'SH HC24 - NCBA', 'SHRP', 'HASI CHENNAI', 4, 4,
    2023, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 02, HSIM - 03, HSIM - 04, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('NCBA') OR lower(part_code) = lower('R230-NC5BA-01') OR lower(customer_part_no) = lower('R230-NC5BA-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC25', 'SH HC25 - NCBB', 'SHRP', 'HASI CHENNAI', 4, 4,
    2024, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 04, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('NCBB') OR lower(part_code) = lower('R230-NC5BB-01') OR lower(customer_part_no) = lower('R230-NC5BB-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC26', 'SH HC26 - 1901', 'SHRP', 'HASI CHENNAI', 6, 6,
    2007, '2 PLATE TOOL', 'EDGE GATE', 'OLD', 'VSIM - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('1901') OR lower(part_code) = lower('V0LC-01C019-01') OR lower(customer_part_no) = lower('V0LC-01C019-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC27', 'SH HC27 - 2100', 'SHRP', 'HASI CHENNAI', 6, 6,
    2007, '2 PLATE TOOL', 'EDGE GATE', 'OLD', 'VSIM - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('2100') OR lower(part_code) = lower('V0LC-01C021-00') OR lower(customer_part_no) = lower('V0LC-01C021-00')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC28', 'SH HC28 - 2200', 'SHRP', 'HASI CHENNAI', 6, 6,
    2007, '2 PLATE TOOL', 'EDGE GATE', 'OLD', 'VSIM - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('2200') OR lower(part_code) = lower('V0LC-01C022-00') OR lower(customer_part_no) = lower('V0LC-01C022-00')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC29', 'SH HC29 - 2800', 'SHRP', 'HASI CHENNAI', 4, 4,
    2007, '2 PLATE TOOL', 'EDGE GATE', 'OLD', 'HSIM - 05, VSIM - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('2800') OR lower(part_code) = lower('V0LC-01C028-00') OR lower(customer_part_no) = lower('V0LC-01C028-00')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC30', 'SH HC30 - VPAA', 'SHRP', 'HASI CHENNAI', 6, 6,
    2007, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 01, HSIM - 02, HSIM - 04', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('VPAA') OR lower(part_code) = lower('VP5N1H-407721-AA') OR lower(customer_part_no) = lower('VP5N1H-407721-AA')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC31', 'SH HC31 - VPFA', 'SHRP', 'HASI CHENNAI', 6, 6,
    2007, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 02, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('VPFA') OR lower(part_code) = lower('VP5N1H-407721-FA') OR lower(customer_part_no) = lower('VP5N1H-407721-FA')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC32', 'SH HC32 - DM1C', 'SHRP', 'HASI CHENNAI', 8, 8,
    2023, '3 PLATE TOOL', 'PIN POINT GATE', 'JJ TOOLS', 'HSIM - 03, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 8
  FROM parts
  WHERE lower(shrp_part_code) = lower('DM1C') OR lower(part_code) = lower('DM1C4UBH1B01') OR lower(customer_part_no) = lower('DM1C4UBH1B01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC33', 'SH HC33 - LBB', 'Customer', 'HASI CHENNAI', 4, 4,
    2023, 'SIDE CORE - 3 PLATE TOOL', 'PIN POINT GATE', 'JJ TOOLS', 'HSIM - 04, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('LBB') OR lower(part_code) = lower('HC442L3LBB01') OR lower(customer_part_no) = lower('HC442L3LBB01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC34', 'SH HC34 - LBC', 'Customer', 'HASI CHENNAI', 4, 4,
    2023, 'SIDE CORE - 3 PLATE TOOL', 'PIN POINT GATE', 'JJ TOOLS', 'HSIM - 04, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('LBC') OR lower(part_code) = lower('HC442L3LBC02') OR lower(customer_part_no) = lower('HC442L3LBC02')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC35', 'SH HC35 - LAC BLUE', 'Customer', 'HASI CHENNAI', 16, 16,
    2024, '3 PLATE TOOL', 'PIN POINT GATE', 'JJ TOOLS', 'HSIM - 03', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 16
  FROM parts
  WHERE lower(shrp_part_code) = lower('LAC BLUE') OR lower(part_code) = lower('HC442L3LAC01') OR lower(customer_part_no) = lower('HC442L3LAC01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC36', 'SH HC36 - AFM BIG', 'Customer', 'HASI CHENNAI', 6, 6,
    2024, '', '', 'AMMAN ENGINEERING', 'RUB - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('AFM BIG') OR lower(part_code) = lower('CA581CAWXX01') OR lower(customer_part_no) = lower('CA581CAWXX01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC37', 'SH HC37 - AFM SMALL', 'Customer', 'HASI CHENNAI', 6, 6,
    2024, '', '', 'AMMAN ENGINEERING', 'RUB - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('AFM SMALL') OR lower(part_code) = lower('CA582DDRXX01') OR lower(customer_part_no) = lower('CA582DDRXX01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC38', 'SH HC38 - OERAA', 'Customer', 'HASI CHENNAI', 6, 6,
    2025, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VSIM - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('OERAA') OR lower(part_code) = lower('HC442OERAA01') OR lower(customer_part_no) = lower('HC442OERAA01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC39', 'SH HC39 - QVEAC', 'Customer', 'HASI CHENNAI', 8, 8,
    2025, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 02, HSIM - 04', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 8
  FROM parts
  WHERE lower(shrp_part_code) = lower('QVEAC') OR lower(part_code) = lower('HC442QVEAC') OR lower(customer_part_no) = lower('HC442QVEAC')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC40', 'SH HC40 - QVEBC', 'Customer', 'HASI CHENNAI', 8, 8,
    2025, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 8
  FROM parts
  WHERE lower(shrp_part_code) = lower('QVEBC') OR lower(part_code) = lower('HC442QVEBC') OR lower(customer_part_no) = lower('HC442QVEBC')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC41', 'SH HC41 - SPHCA', 'Customer', 'HASI CHENNAI', 8, 8,
    2025, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 8
  FROM parts
  WHERE lower(shrp_part_code) = lower('SPHCA') OR lower(part_code) = lower('FC1F2SPHCA01') OR lower(customer_part_no) = lower('FC1F2SPHCA01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC42', 'SH HC42 - UMEAA', 'Customer', 'HASI CHENNAI', 4, 4,
    2026, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('UMEAA') OR lower(part_code) = lower('FC1F2UMEAA') OR lower(customer_part_no) = lower('FC1F2UMEAA')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC43', 'SH HC43 - UMNAA', 'Customer', 'HASI CHENNAI', 6, 6,
    2026, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('UMNAA') OR lower(part_code) = lower('FC1F2UMNAA') OR lower(customer_part_no) = lower('FC1F2UMNAA')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC44', 'SH HC44 - NDGAA', 'Customer', 'HASI CHENNAI', 6, 6,
    2026, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('NDGAA') OR lower(part_code) = lower('FC1F2NDGAA') OR lower(customer_part_no) = lower('FC1F2NDGAA')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HP01', 'SH HP01 - PUNE B', 'Customer', 'HASI PUNE', 6, 6,
    2020, '2 PLATE TOOL', 'SUBMERSIBLE GATE', 'JJ TOOLS', 'HSIM - 03', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('PUNE B') OR lower(part_code) = lower('FC1E1BAE1D01') OR lower(customer_part_no) = lower('FC1E1BAE1D01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HP02', 'SH HP02 - PUNE S', 'Customer', 'HASI PUNE', 6, 6,
    2020, '2 PLATE TOOL', 'SUBMERSIBLE GATE', 'JJ TOOLS', 'HSIM - 03, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('PUNE S') OR lower(part_code) = lower('HR241BAE1B01') OR lower(customer_part_no) = lower('HR241BAE1B01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HB01', 'SH HB01 - BH-DIA 16', 'Customer', 'HCCSIL BHIWADI', 6, 6,
    2021, 'SIDE CORE - 2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 02, HSIM - 04, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('BH-DIA 16') OR lower(part_code) = lower('PLFC1E4K5MAA-00') OR lower(customer_part_no) = lower('PLFC1E4K5MAA-00')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HB02', 'SH HB02 - BH-DIA 12', 'Customer', 'HCCSIL BHIWADI', 6, 6,
    2021, 'SIDE CORE - 2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 02, HSIM - 03, HSIM - 04, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('BH-DIA 12') OR lower(part_code) = lower('PLFC1E4K5MBA-00') OR lower(customer_part_no) = lower('PLFC1E4K5MBA-00')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HB03', 'SH HB03 - BH-DIA 8', 'Customer', 'HCCSIL BHIWADI', 6, 6,
    2021, 'SIDE CORE - 2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 04, HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('BH-DIA 8') OR lower(part_code) = lower('FC1P4L1E1A01') OR lower(customer_part_no) = lower('FC1P4L1E1A01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HB04', 'SH HB04 - OUTLET/INLET', 'Customer', 'HCCSIL BHIWADI', 4, 4,
    2018, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VIM-02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('OUTLET/INLET') OR lower(part_code) = lower('HC442G6C1B01/A01') OR lower(customer_part_no) = lower('HC442G6C1B01/A01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HB05', 'SH HB05 - HR241', 'Customer', 'HCCSIL BHIWADI', 6, 6,
    2018, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'HSIM - 03', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('HR241') OR lower(part_code) = lower('HR241G6C1A01') OR lower(customer_part_no) = lower('HR241G6C1A01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HB06', 'SH HB06 - 9AA', 'Customer', 'HCCSIL BHIWADI', 4, 4,
    2015, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VIM 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('9AA') OR lower(part_code) = lower('R101WC9AA01') OR lower(customer_part_no) = lower('R101WC9AA01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HB07', 'SH HB07 - R101', 'Customer', 'HCCSIL BHIWADI', 4, 4,
    2015, '2 PLATE TOOL', 'SUBMERSIBLE GATE', 'JJ TOOLS', 'VIM 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('R101') OR lower(part_code) = lower('VPR230-WC9AA-01') OR lower(customer_part_no) = lower('VPR230-WC9AA-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HB08', 'SH HB08 - 9AB', 'Customer', 'HCCSIL BHIWADI', 4, 4,
    2015, '2 PLATE TOOL', 'SUBMERSIBLE GATE', 'JJ TOOLS', 'VIM 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('9AB') OR lower(part_code) = lower('VPR230-WC9AB-01') OR lower(customer_part_no) = lower('VPR230-WC9AB-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH SC01', 'SH SC01 - VP6T', 'SHRP', 'SONA COMSTAR', 16, 16,
    NULL, '', '', 'JJ TOOLS', 'RUB-01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 16
  FROM parts
  WHERE lower(shrp_part_code) = lower('VP6T') OR lower(part_code) = lower('VP6TLU-11N087-AA') OR lower(customer_part_no) = lower('VP6TLU-11N087-AA')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH WN05', 'SH WN05 - DA', 'Customer', 'WONJIN', 2, 2,
    NULL, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VIM - 03', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 2
  FROM parts
  WHERE lower(shrp_part_code) = lower('DA') OR lower(part_code) = lower('WC-SCP-ECC21-DA01') OR lower(customer_part_no) = lower('WC-SCP-ECC21-DA01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH WN06', 'SH WN06 - LMF', 'Customer', 'WONJIN', 2, 2,
    NULL, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VIM - 03', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 2
  FROM parts
  WHERE lower(shrp_part_code) = lower('LMF') OR lower(part_code) = lower('WC-SCP-ECC21-LMF01') OR lower(customer_part_no) = lower('WC-SCP-ECC21-LMF01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH WN07', 'SH WN07 - LMM', 'Customer', 'WONJIN', 2, 2,
    NULL, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VIM - 03', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 2
  FROM parts
  WHERE lower(shrp_part_code) = lower('LMM') OR lower(part_code) = lower('WC-SCP-ECC21-LMM01') OR lower(customer_part_no) = lower('WC-SCP-ECC21-LMM01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH WN08', 'SH WN08 - SMF', 'Customer', 'WONJIN', 2, 2,
    NULL, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VIM - 03', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 2
  FROM parts
  WHERE lower(shrp_part_code) = lower('SMF') OR lower(part_code) = lower('WC-SCP-ECC21-SMF01') OR lower(customer_part_no) = lower('WC-SCP-ECC21-SMF01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH WN09', 'SH WN09 - SMM', 'Customer', 'WONJIN', 6, 6,
    NULL, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VIM - 03', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('SMM') OR lower(part_code) = lower('WC-SCP-ECC21-SMM01') OR lower(customer_part_no) = lower('WC-SCP-ECC21-SMM01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH WN10', 'SH WN10 - NADB', 'Customer', 'WONJIN', 4, 4,
    NULL, '2 PLATE TOOL', 'EDGE GATE', 'MM MOULDS', 'VIM - 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('NADB') OR lower(part_code) = lower('WC-SCP-SC21NA-DB-01') OR lower(customer_part_no) = lower('WC-SCP-SC21NA-DB-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH WN11', 'SH WN11 - NALC', 'Customer', 'WONJIN', 4, 4,
    NULL, '2 PLATE TOOL', 'EDGE GATE', 'MM MOULDS', 'VIM - 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('NALC') OR lower(part_code) = lower('WC-SCP-SC21NA-LC-01') OR lower(customer_part_no) = lower('WC-SCP-SC21NA-LC-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH WN12', 'SH WN12 - NATB', 'Customer', 'WONJIN', 4, 4,
    NULL, '2 PLATE TOOL', 'EDGE GATE', 'MM MOULDS', 'VIM - 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('NATB') OR lower(part_code) = lower('WC-SCP-SC21NA-TB-T01') OR lower(customer_part_no) = lower('WC-SCP-SC21NA-TB-T01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH WN13', 'SH WN13 - ATBAB', 'SHRP', 'WONJIN', 2, 2,
    NULL, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VIM - 02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 2
  FROM parts
  WHERE lower(shrp_part_code) = lower('ATBAB') OR lower(part_code) = lower('F442-ATBAB-02') OR lower(customer_part_no) = lower('F442-ATBAB-02')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH HC01', 'SH HC01 - CEEAA-ORANGE', 'Customer', 'HASI CHENNAI', 6, 6,
    2025, 'SIDE CORE - 3 PLATE TOOL', 'PIN POINT GATE', 'JJ TOOLS', 'HSIM - 05', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 6
  FROM parts
  WHERE lower(shrp_part_code) = lower('CEEAA-ORANGE') OR lower(part_code) = lower('FC1F2CEEAA02') OR lower(customer_part_no) = lower('FC1F2CEEAA02')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH OLD01', 'SH OLD01 - F442 QQ', 'SHRP', 'HASI CHENNAI', 4, 4,
    NULL, '2 PLATE TOOL', 'EDGE GATE', 'OLD', 'VSIM - 01', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('F442 QQ') OR lower(part_code) = lower('F442-QQ7AA-01') OR lower(customer_part_no) = lower('F442-QQ7AA-01')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH AR01', 'SH AR01 - Handle', 'SHRP', 'AVADH RAIL', 1, 1,
    NULL, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VIM-03', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 1
  FROM parts
  WHERE lower(shrp_part_code) = lower('Handle') OR lower(part_code) = lower('HandlePlastic') OR lower(customer_part_no) = lower('HandlePlastic')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH PL01', 'SH PL01 - Syrnge Cap', 'Customer', 'PRECISE LAPPING', 12, 12,
    NULL, '2 PLATE TOOL', 'EDGE GATE', 'JJ TOOLS', 'VIM-03', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 12
  FROM parts
  WHERE lower(shrp_part_code) = lower('Syrnge Cap') OR lower(part_code) = lower('SYRNGECAP') OR lower(customer_part_no) = lower('SYRNGECAP')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

DO $$
DECLARE
  v_mould_id INTEGER;
BEGIN
  INSERT INTO moulds (
    mould_code, mould_name, ownership, customer_name, total_cavities, active_cavities,
    yom, mould_type, gate_type, maker, suitable_machines, rack_no, status
  )
  VALUES (
    'SH VK01', 'SH VK01 - Small Grommet', 'Customer', 'VK INDUSTRIES', 4, 4,
    NULL, 'SIDE CORE TOOL', 'PIN GATE', 'JJ TOOLS', 'VIM-02', '', 'ready'
  )
  ON CONFLICT (mould_code) DO UPDATE SET
    mould_name = EXCLUDED.mould_name,
    ownership = EXCLUDED.ownership,
    customer_name = EXCLUDED.customer_name,
    total_cavities = EXCLUDED.total_cavities,
    active_cavities = EXCLUDED.active_cavities,
    yom = EXCLUDED.yom,
    mould_type = EXCLUDED.mould_type,
    gate_type = EXCLUDED.gate_type,
    maker = EXCLUDED.maker,
    suitable_machines = EXCLUDED.suitable_machines,
    rack_no = EXCLUDED.rack_no,
    status = 'ready'
  RETURNING id INTO v_mould_id;

  INSERT INTO mould_parts (mould_id, part_id, cavities_for_part)
  SELECT v_mould_id, id, 4
  FROM parts
  WHERE lower(shrp_part_code) = lower('Small Grommet') OR lower(part_code) = lower('SmallGrommet') OR lower(customer_part_no) = lower('SmallGrommet')
  LIMIT 1
  ON CONFLICT (mould_id, part_id) DO UPDATE SET
    cavities_for_part = EXCLUDED.cavities_for_part;
END $$;

COMMIT;
