-- Sample reject/downtime reasons and one example part with full routing flags,
-- so Bag Entry / Trimming / Inspection / Packing have something to work with
-- out of the box. Replace/extend via the admin API once real master data is in.
INSERT INTO check_items (item_name, category) VALUES
  ('Short shot', 'reject_reason'), ('Flash', 'reject_reason'), ('Black spot', 'reject_reason'),
  ('Mould change', 'downtime_reason'), ('Power outage', 'downtime_reason'), ('Material shortage', 'downtime_reason')
ON CONFLICT (item_name, category) DO NOTHING;

-- Seed SHRP's real machine list (10 machines)
INSERT INTO machines (machine_code) VALUES
  ('VIM - 01'), ('VIM - 02'), ('VIM - 03'),
  ('RUB - 01'),
  ('HSIM - 01'), ('HSIM - 02'), ('HSIM - 03'), ('HSIM - 04'), ('HSIM - 05'),
  ('VSIM - 01')
ON CONFLICT (machine_code) DO NOTHING;

-- One example part with full routing (trim + inspection required) so the
-- Bag Entry -> Trimming -> Inspection -> Packing pipeline has something to
-- run through immediately. Replace with real PART_MASTER data via the
-- admin API once available.
INSERT INTO parts (part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
                    trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty)
VALUES ('DEMO-100', 'Demo Bracket', 4, 18.5, 22.5, TRUE, TRUE, TRUE, TRUE, 500)
ON CONFLICT (part_code) DO NOTHING;

-- Default admin user - PIN is '0000', CHANGE THIS after first login
-- pin_hash below is bcrypt hash of '0000'
INSERT INTO users (username, pin_hash, full_name, role) VALUES
  ('admin', '$2a$10$CYFec7XoshX6gdF.BNOKaO3KrW3OB29KzhybN5r3deZ8A1y1UUxmq', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;
-- Bulk import from Invoice_26-27.xlsx (PART NUMBER sheet), 84 parts.
-- Cavity count, cycle time, unit weight and routing flags are NOT in invoice data -
-- placeholders set below (cycle_time=0 signals 'not yet set', efficiency calc skips it).
-- Update each part's manufacturing details via the app's Parts screen.

INSERT INTO customers (name) VALUES
  ('Avadh Rail Infra'),
  ('COMSTAR'),
  ('Hanon Chennai'),
  ('Hanon Climate Bhiwadi'),
  ('Hanon Pune'),
  ('Necco Tools'),
  ('Precise Lapping Solutions'),
  ('VK Industries'),
  ('Wonjin')
ON CONFLICT (name) DO NOTHING;

INSERT INTO parts (part_code, part_name, cavity_count, standard_cycle_time_sec, standard_pack_qty, customer_id, notes)
VALUES
  ('A710-BBWBA-01', 'CAP-(D)JOINT FLANGE', 1, 0, 250, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('CA581CAWXX01', 'CAP ASY-SUC', 1, 0, 250, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('CA582DDRXX01', 'CAP ASY-DIS', 1, 0, 500, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('DM1C4UBH1B01', 'SHIPPING CAP', 1, 0, 750, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('F364-CB5AA-01', 'HTR PIPE CAP', 1, 0, 400, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('F442-KQAAA-01', 'DUST CAP CONDS', 1, 0, 200, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('F442-KP8AA-01-00', 'CAP (A) JOINT FLANGE', 1, 0, 500, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('F442-QQ7AA-01', 'DUST CAP COND', 1, 0, 300, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('F442-WBAAA-01', 'DUST CAP-COND', 1, 0, 300, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('F495-MAXLA-03', 'CLIP (A) LIQ & SUC', 1, 0, 500, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('F710-AKYAA-01', 'CAP-J/F', 1, 0, 400, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('F720-AKYAA-01', 'GROMMET', 1, 0, 250, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('F885-BB1AA-01', 'CAP-TXV', 1, 0, 500, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('FC1F2AN6BA01', 'SHIPG CAP HYUNDAI/M', 1, 0, 500, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('FC1F2CEEAA02', 'CAP-(D)JOINT FLANGE', 1, 0, 250, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('FC1F2NDGAA02', 'CAP-(D)JOINT FLANGE', 1, 0, 650, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('FC1F2SPHAA02', 'SHP''G/CAP-HYUNDAI/M', 1, 0, 750, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('FC1F2SULLA01', 'SHP''G/CAP HYUNDAI/M', 1, 0, 300, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('FC1F2UGKCA01', 'SHP''G/CAP HYUNDAI/M', 1, 0, 1500, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('FC1F2UMEAB01', 'SHP''G/CAP HYUNDAI/M', 1, 0, 750, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('FC1F2UMEAA01', 'SHP''G/CAP HYUNDAI/M', 1, 0, 300, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HA715L5G1A01', 'CAP ACAC', 1, 0, 200, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HC442CXGAA01', 'CAP (A) JOINT FLANGE', 1, 0, 250, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HC442SPHAA03', 'CAP (A) JOINT FLANGE', 1, 0, 250, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HC442L3LAC01', 'CAP (A) JOINT FLANGE', 1, 0, 400, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HC442L3LBB01', 'CAP (A) JOINT FLANGE', 1, 0, 250, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HC442L3LBC02', 'CAP (A) JOINT FLANGE', 1, 0, 150, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HC442OERAA01', 'CAP (A) JOINT FLANGE', 1, 0, 1000, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HC442QVEAC01', 'CAP (A) JOINT FLANGE', 1, 0, 1000, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HC442QVEBC01', 'CAP (A) JOINT FLANGE', 1, 0, 1000, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HC442SULAC01', 'CAP (A) JOINT FLANGE', 1, 0, 300, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HC442UMNAA02', 'CAP (A) JOINT FLANGE', 1, 0, 250, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HC443QQVBA02', 'CAP (B) JOINT FLANGE', 1, 0, 750, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HR230DH7AA01', 'PLUG-RAD PIPE', 1, 0, 100, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HR230PDPKA02', 'PLUG-RAD PIPE', 1, 0, 100, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HL180F4W1A01', 'CAP CHL''R NEX GEN PORSCHE', 1, 0, 1000, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HW773G9E1A01', 'CAP WCAC 16DIA', 1, 0, 1000, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HW773G9E1B01', 'CAP SHIPPINGDEGAS SPOUT', 1, 0, 3000, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('R230-NC5BA-01', 'PLUG RAD PIPE', 1, 0, 200, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('R230-NC5BB-01', 'PLUG RAD PIPE', 1, 0, 105, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('V0LC-01C019-01', 'CAP-J/FLANGE', 1, 0, 600, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('V0LC-01C021-00', 'CAP-J/FLANGE 12MM', 1, 0, 750, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('V0LC-01C022-00', 'PROTECTION-CAP', 1, 0, 750, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('V0LC-01C028-00', 'CAP', 1, 0, 500, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('VP5N1H-407721-AA', 'PROTECTION CAP - INLET', 1, 0, 650, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('VP5N1H-407721-FA', 'CAP-J FLANGE MALE', 1, 0, 500, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('VPCV6H19E778DA', 'CAP A/C MANI FLOD', 1, 0, 400, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('RM-19D935-BA', 'CAP-A/C 1/2 MSLC', 1, 0, 750, (SELECT id FROM customers WHERE name = 'Hanon Chennai'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HR241BAE1B01', 'CAP RAD', 1, 0, 800, (SELECT id FROM customers WHERE name = 'Hanon Pune'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('FC1E1BAE1D01', 'SHP''G/CAP-MISC', 1, 0, 400, (SELECT id FROM customers WHERE name = 'Hanon Pune'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('DM1C1QRJAA01', 'SHIPPPING CAP HTR', 1, 0, 400, (SELECT id FROM customers WHERE name = 'Hanon Pune'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('PLFC1E4K5MAA-00', 'DUST CAP (SUCTION)(16)', 1, 0, 1000, (SELECT id FROM customers WHERE name = 'Hanon Climate Bhiwadi'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('PLFC1E4K5MBA-00', 'DUST CAP (DISCHARGE)(12)', 1, 0, 750, (SELECT id FROM customers WHERE name = 'Hanon Climate Bhiwadi'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('FC1P4L1E1A01', 'SHIPPING Cap Hose Liquid', 1, 0, 1500, (SELECT id FROM customers WHERE name = 'Hanon Climate Bhiwadi'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('VPR230-WC9AB-01', 'DUST PROTECTION CAP', 1, 0, 300, (SELECT id FROM customers WHERE name = 'Hanon Climate Bhiwadi'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HR241G6C1A01', 'CAP MG RAD 18.5', 1, 0, 400, (SELECT id FROM customers WHERE name = 'Hanon Climate Bhiwadi'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HC442G6C1A', 'MG Condensor INLET', 1, 0, 1000, (SELECT id FROM customers WHERE name = 'Hanon Climate Bhiwadi'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HC442G6C1B', 'MG Condensor Outlet', 1, 0, 1000, (SELECT id FROM customers WHERE name = 'Hanon Climate Bhiwadi'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('R101WC9AA01', 'CAP TOC-CONN', 1, 0, 2000, (SELECT id FROM customers WHERE name = 'Hanon Climate Bhiwadi'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('VPR230WC9AA01', 'DUST PROTECTION CAP RAD', 1, 0, 400, (SELECT id FROM customers WHERE name = 'Hanon Climate Bhiwadi'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('F390-QQDC-A02', 'SHIPPING CAP', 1, 0, 1000, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('SHRP-T12', 'SHIPPING CAP', 1, 0, 750, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('SHRP-T3', 'SHIPPING CAP', 1, 0, 600, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('SHRP-T4', 'TRUKEY CAP', 1, 0, 400, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('F442-KQ', 'SHIPPING END CAP (IA) FLANGE', 1, 0, 1000, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('SHRP-T7', 'SHIPPING (WHITE)-HP (IA)', 1, 0, 2000, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('SHRP-T10', 'SHIPPING (white)-LP (IA)', 1, 0, 2000, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('SHRP-T8', 'SHIPPING END CAP (IA) FLANGE', 1, 0, 500, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('VPMGH-18B602-DA', 'SHIPPING CAP SV CT', 1, 0, 400, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('WC-SCP-SC21NA-DB-01', 'SHP''G CAP DIS COND SIDE', 1, 0, 500, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('WC-SCP-SC21NA-LC-01', 'SHP''G CAP LIQ COND END', 1, 0, 750, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('WC-SCP-SC21NA-TB-T01', 'SHP''G CAP TXV SIDE', 1, 0, 300, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('WC-SCP-ECC21-LMF01', 'SHP''G CAP LIQ MID FEMALE', 1, 0, 650, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('WC-SCP-ECC21-SMF01', 'SHP''G CAP SUC MID FEMALE', 1, 0, 500, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('WC-SCP-ECC21-LMM01', 'SHP''G CAP LIQ MID MALE', 1, 0, 650, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('WC-SCP-ECC21-SMM01', 'SHP''G CAP SUC MID MALE', 1, 0, 500, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('WC-SCP-ECC21-DA01', 'SHP''G CAP DIS COMP SIDE', 1, 0, 500, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('F442-ATBAB-02', 'SHP''G CAP GS JUMPER TUBE JF', 1, 0, 300, (SELECT id FROM customers WHERE name = 'Wonjin'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('BIGGROMMET-1316', 'GROMMET', 1, 0, 1500, (SELECT id FROM customers WHERE name = 'VK Industries'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('SmallGrommet', 'GROMMET', 1, 0, 3000, (SELECT id FROM customers WHERE name = 'VK Industries'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('VP6TLU-11N087-AA', 'CVR STR MTR SOLE TERM', 1, 0, NULL, (SELECT id FROM customers WHERE name = 'COMSTAR'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('VP6TLU11N087AA', 'CVR STR MTR SOLE TERM', 1, 0, NULL, (SELECT id FROM customers WHERE name = 'Necco Tools'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('HandlePlastic', 'HNDL', 1, 0, 90, (SELECT id FROM customers WHERE name = 'Avadh Rail Infra'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.'),
  ('SYRNGECAP', 'CAP', 1, 0, 1500, (SELECT id FROM customers WHERE name = 'Precise Lapping Solutions'), 'Imported from Invoice_26-27.xlsx - cycle time/cavity/weight/routing not available from invoice, needs manual update.')
ON CONFLICT (part_code) DO NOTHING;
-- Cross-referenced from Daily_Hourly_production_Sheet_2026.xlsm (PART_MASTER,
-- CYCLETIME_MASTER, PROCESS_PARAMETER_MASTER, DIMENSION_MASTER) for parts already
-- imported above from the invoice. Linked via PART_MASTER's nickname column, which
-- is the real join key to the other master sheets (not the part code itself).

UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 47.5, standard_pack_qty = 250, standard_cycle_time_sec = 36, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'A710-BBWBA-01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 85.5, standard_pack_qty = 250, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'CA581CAWXX01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 68.5, standard_pack_qty = 250, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'CA582DDRXX01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 8, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 14, standard_pack_qty = 750, standard_cycle_time_sec = 41, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'DM1C4UBH1B01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 16, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 62, standard_pack_qty = 400, standard_cycle_time_sec = 38, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'F364-CB5AA-01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 31.5, standard_pack_qty = 200, standard_cycle_time_sec = 34, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'F442-KQAAA-01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 19.1, standard_pack_qty = 300, standard_cycle_time_sec = 27, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'F442-QQ7AA-01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 1, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 4, standard_pack_qty = 300, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'F442-WBAAA-01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 7, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 26.5, standard_pack_qty = 400, standard_cycle_time_sec = 47, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'F710-AKYAA-01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 22.5, standard_pack_qty = 500, standard_cycle_time_sec = 32, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'F885-BB1AA-01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 13, standard_pack_qty = 500, standard_cycle_time_sec = 30, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'FC1F2AN6BA01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 47.5, standard_pack_qty = 250, standard_cycle_time_sec = 36, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'FC1F2CEEAA02' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 16.7, standard_pack_qty = 750, standard_cycle_time_sec = 32, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'FC1F2NDGAA02' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 10, standard_pack_qty = 750, standard_cycle_time_sec = 26, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'FC1F2SPHAA02' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 12, standard_pack_qty = 300, standard_cycle_time_sec = 35, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'FC1F2SULLA01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 8, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 12.5, standard_pack_qty = 1500, standard_cycle_time_sec = 29, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'FC1F2UGKCA01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 14, standard_pack_qty = 750, standard_cycle_time_sec = 33, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'FC1F2UMEAB01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 12.5, standard_pack_qty = 300, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'FC1F2UMEAA01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 31, standard_pack_qty = 200, standard_cycle_time_sec = 31, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HA715L5G1A01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 29, standard_pack_qty = 250, standard_cycle_time_sec = 35, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HC442CXGAA01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 18, standard_pack_qty = 250, standard_cycle_time_sec = 36, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HC442SPHAA03' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 16, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 95.5, standard_pack_qty = 400, standard_cycle_time_sec = 37, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HC442L3LAC01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 31, standard_pack_qty = 250, standard_cycle_time_sec = 34, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HC442L3LBB01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 36, standard_pack_qty = 150, standard_cycle_time_sec = 37, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HC442L3LBC02' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, standard_pack_qty = 1000, standard_cycle_time_sec = 34, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HC442OERAA01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 8, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 16, standard_pack_qty = 1000, standard_cycle_time_sec = 30, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HC442QVEAC01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 8, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 19, standard_pack_qty = 1000, standard_cycle_time_sec = 32, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HC442QVEBC01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 17.5, standard_pack_qty = 300, standard_cycle_time_sec = 41, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HC442SULAC01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 29.5, standard_pack_qty = 250, standard_cycle_time_sec = 35, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HC442UMNAA02' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 5, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 11.5, standard_pack_qty = 750, standard_cycle_time_sec = 34, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HC443QQVBA02' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 31, standard_pack_qty = 100, standard_cycle_time_sec = 29, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HR230DH7AA01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 38.5, standard_pack_qty = 100, standard_cycle_time_sec = 36, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HR230PDPKA02' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 6.5, standard_pack_qty = 1000, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HL180F4W1A01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 9.3, standard_pack_qty = 1000, standard_cycle_time_sec = 23, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HW773G9E1A01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = TRUE, inspection_required = FALSE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 3.7, standard_pack_qty = 3000, standard_cycle_time_sec = 19, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HW773G9E1B01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = FALSE, inspection_required = FALSE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 26.5, standard_pack_qty = 200, standard_cycle_time_sec = 33, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'R230-NC5BA-01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = FALSE, inspection_required = FALSE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 28, standard_pack_qty = 105, standard_cycle_time_sec = 33, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'R230-NC5BB-01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 11.7, standard_pack_qty = 600, standard_cycle_time_sec = 24, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'V0LC-01C019-01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 15.5, standard_pack_qty = 750, standard_cycle_time_sec = 33, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'V0LC-01C021-00' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 11, standard_pack_qty = 750, standard_cycle_time_sec = 29, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'V0LC-01C022-00' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 11, standard_pack_qty = 500, standard_cycle_time_sec = 31, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'V0LC-01C028-00' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 15, standard_pack_qty = 650, standard_cycle_time_sec = 27, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'VP5N1H-407721-AA' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 16.5, standard_pack_qty = 500, standard_cycle_time_sec = 30, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'VP5N1H-407721-FA' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 8, standard_pack_qty = 750, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'RM-19D935-BA' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 11.5, standard_pack_qty = 800, standard_cycle_time_sec = 29, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HR241BAE1B01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 19.5, standard_pack_qty = 400, standard_cycle_time_sec = 29, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'FC1E1BAE1D01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 7, standard_pack_qty = 1500, standard_cycle_time_sec = 25, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'FC1P4L1E1A01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 1, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, standard_pack_qty = 300, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'VPR230-WC9AB-01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 18.5, standard_pack_qty = 400, standard_cycle_time_sec = 26, notes = 'Cavity/weight/routing from PART_MASTER, cycle time from CYCLETIME_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'HR241G6C1A01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 1, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, standard_pack_qty = 2000, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'R101WC9AA01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 1, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, standard_pack_qty = 400, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'VPR230WC9AA01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 1, trim_required = FALSE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, standard_pack_qty = 1000, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'F390-QQDC-A02' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 6, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 11, standard_pack_qty = 750, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'SHRP-T12' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 1, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, standard_pack_qty = 600, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'SHRP-T3' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 1, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, standard_pack_qty = 1000, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'F442-KQ' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 1, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, standard_pack_qty = 2000, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'SHRP-T7' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 1, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, standard_pack_qty = 2000, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'SHRP-T10' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 2, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 5.5, standard_pack_qty = 500, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'SHRP-T8' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 13.5, standard_pack_qty = 500, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'WC-SCP-SC21NA-DB-01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 7, standard_pack_qty = 750, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'WC-SCP-SC21NA-LC-01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 4, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 16.5, standard_pack_qty = 300, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'WC-SCP-SC21NA-TB-T01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 2, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 6.5, standard_pack_qty = 650, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'WC-SCP-ECC21-LMF01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 2, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 6.5, standard_pack_qty = 500, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'WC-SCP-ECC21-SMF01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 2, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, unit_weight_g = 5.5, standard_pack_qty = 500, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'WC-SCP-ECC21-DA01' AND notes LIKE 'Imported from Invoice%';
UPDATE parts SET cavity_count = 16, trim_required = TRUE, inspection_required = TRUE, packing_required = TRUE, dispatch_required = TRUE, standard_pack_qty = 1000, notes = 'Cavity/weight/routing from PART_MASTER (Daily_Hourly_production_Sheet_2026.xlsm).' WHERE part_code = 'VP6TLU-11N087-AA' AND notes LIKE 'Imported from Invoice%';

-- Process parameters and critical dimensions for the 3 parts where the master
-- sheets actually had this data (F364-CB5AA-01, DM1C4UBH1B01, HC442QVEAC01).

INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Zone-1', '135-145', 'C' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Zone-2', '165-175', 'C' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Zone-3', '155-165', 'C' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Zone-4', '140-150', 'C' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Zone-5', '135-145', 'C' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Stage -1', '45-55', 'bar' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Stage-2', '35-45', 'bar' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Stage-3', '27-33', 'bar' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Stage-1', '27-33', 'mm/sec' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Stage-2', '22-28', 'mm/sec' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Stage-3', '22-28', 'mm/sec' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Stage-1', '19-25', 'mm' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Stage-2', '12-18', 'mm' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Stage-3', '10-16', 'mm' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Injection', '1-3', 'sec' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Hold', '22-28', 'bar' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Hold ', '17-23', 'mm/sec' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Hold', '1-3', 'sec' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Cooling', '12-18', 'sec' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Charging', '62-72', 'mm' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Cycle', '32-38', 'sec' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Mold', '37-47', 'C' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'shot wt', '90-93', 'g' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_critical_dimensions (part_id, dimension_name, nominal_value, tol_plus, tol_minus, unit) SELECT id, 'OD', 22.3, 0.25, 0.25, 'mm' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, dimension_name) DO UPDATE SET nominal_value = EXCLUDED.nominal_value, tol_plus = EXCLUDED.tol_plus, tol_minus = EXCLUDED.tol_minus, unit = EXCLUDED.unit;
INSERT INTO part_critical_dimensions (part_id, dimension_name, nominal_value, tol_plus, tol_minus, unit) SELECT id, 'Over All Length', 32.3, 0.25, 0.25, 'mm' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, dimension_name) DO UPDATE SET nominal_value = EXCLUDED.nominal_value, tol_plus = EXCLUDED.tol_plus, tol_minus = EXCLUDED.tol_minus, unit = EXCLUDED.unit;
INSERT INTO part_critical_dimensions (part_id, dimension_name, nominal_value, tol_plus, tol_minus, unit) SELECT id, 'Thickness - Top', 2.0, 0.25, 0.25, 'mm' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, dimension_name) DO UPDATE SET nominal_value = EXCLUDED.nominal_value, tol_plus = EXCLUDED.tol_plus, tol_minus = EXCLUDED.tol_minus, unit = EXCLUDED.unit;
INSERT INTO part_critical_dimensions (part_id, dimension_name, nominal_value, tol_plus, tol_minus, unit) SELECT id, 'STAR OD', 19.5, 0.1, 0.1, 'mm' FROM parts WHERE part_code = 'HC442QVEAC01' ON CONFLICT (part_id, dimension_name) DO UPDATE SET nominal_value = EXCLUDED.nominal_value, tol_plus = EXCLUDED.tol_plus, tol_minus = EXCLUDED.tol_minus, unit = EXCLUDED.unit;
INSERT INTO part_critical_dimensions (part_id, dimension_name, nominal_value, tol_plus, tol_minus, unit) SELECT id, 'PIN OD', 3.6, 0.1, 0.1, 'mm' FROM parts WHERE part_code = 'HC442QVEAC01' ON CONFLICT (part_id, dimension_name) DO UPDATE SET nominal_value = EXCLUDED.nominal_value, tol_plus = EXCLUDED.tol_plus, tol_minus = EXCLUDED.tol_minus, unit = EXCLUDED.unit;
INSERT INTO part_critical_dimensions (part_id, dimension_name, nominal_value, tol_plus, tol_minus, unit) SELECT id, 'C TO C', 20.65, 0.05, 0.05, 'mm' FROM parts WHERE part_code = 'HC442QVEAC01' ON CONFLICT (part_id, dimension_name) DO UPDATE SET nominal_value = EXCLUDED.nominal_value, tol_plus = EXCLUDED.tol_plus, tol_minus = EXCLUDED.tol_minus, unit = EXCLUDED.unit;
INSERT INTO part_critical_dimensions (part_id, dimension_name, nominal_value, tol_plus, tol_minus, unit) SELECT id, 'START HEIGHT', 11.5, 0.1, 0.1, 'mm' FROM parts WHERE part_code = 'HC442QVEAC01' ON CONFLICT (part_id, dimension_name) DO UPDATE SET nominal_value = EXCLUDED.nominal_value, tol_plus = EXCLUDED.tol_plus, tol_minus = EXCLUDED.tol_minus, unit = EXCLUDED.unit;
INSERT INTO part_critical_dimensions (part_id, dimension_name, nominal_value, tol_plus, tol_minus, unit) SELECT id, 'PIN HEIGHT', 5.0, 0.1, 0.1, 'mm' FROM parts WHERE part_code = 'HC442QVEAC01' ON CONFLICT (part_id, dimension_name) DO UPDATE SET nominal_value = EXCLUDED.nominal_value, tol_plus = EXCLUDED.tol_plus, tol_minus = EXCLUDED.tol_minus, unit = EXCLUDED.unit;
INSERT INTO part_critical_dimensions (part_id, dimension_name, nominal_value, tol_plus, tol_minus, unit) SELECT id, 'PART WEIGHT', 1.7, 0.17, 0.17, 'g' FROM parts WHERE part_code = 'HC442QVEAC01' ON CONFLICT (part_id, dimension_name) DO UPDATE SET nominal_value = EXCLUDED.nominal_value, tol_plus = EXCLUDED.tol_plus, tol_minus = EXCLUDED.tol_minus, unit = EXCLUDED.unit;
INSERT INTO part_critical_dimensions (part_id, dimension_name, nominal_value, tol_plus, tol_minus, unit) SELECT id, 'ID', 17.67, 0.1, 0.1, 'mm' FROM parts WHERE part_code = 'DM1C4UBH1B01' ON CONFLICT (part_id, dimension_name) DO UPDATE SET nominal_value = EXCLUDED.nominal_value, tol_plus = EXCLUDED.tol_plus, tol_minus = EXCLUDED.tol_minus, unit = EXCLUDED.unit;
INSERT INTO part_critical_dimensions (part_id, dimension_name, nominal_value, tol_plus, tol_minus, unit) SELECT id, 'ID (2)', 20.3, 0.2, 0.2, 'mm' FROM parts WHERE part_code = 'DM1C4UBH1B01' ON CONFLICT (part_id, dimension_name) DO UPDATE SET nominal_value = EXCLUDED.nominal_value, tol_plus = EXCLUDED.tol_plus, tol_minus = EXCLUDED.tol_minus, unit = EXCLUDED.unit;
INSERT INTO part_critical_dimensions (part_id, dimension_name, nominal_value, tol_plus, tol_minus, unit) SELECT id, 'PART WEIGHT', 3.0, 1.0, 1.0, 'g' FROM parts WHERE part_code = 'DM1C4UBH1B01' ON CONFLICT (part_id, dimension_name) DO UPDATE SET nominal_value = EXCLUDED.nominal_value, tol_plus = EXCLUDED.tol_plus, tol_minus = EXCLUDED.tol_minus, unit = EXCLUDED.unit;
INSERT INTO part_critical_dimensions (part_id, dimension_name, nominal_value, tol_plus, tol_minus, unit) SELECT id, 'PART WEIGHT (2)', 4.0, 1.0, 1.0, 'g' FROM parts WHERE part_code = 'DM1C4UBH1B01' ON CONFLICT (part_id, dimension_name) DO UPDATE SET nominal_value = EXCLUDED.nominal_value, tol_plus = EXCLUDED.tol_plus, tol_minus = EXCLUDED.tol_minus, unit = EXCLUDED.unit;
-- Daily machine check sheet items - from your actual reference sheet
-- (machine cleaning / gate safety / oil / hydraulic / hopper / poka-yoke),
-- bilingual (English + Hindi) with an icon for the pictorial operator view.
INSERT INTO daily_check_items (item_name, local_label, specification, icon, category, sort_order) VALUES
  ('Machine Cleaning', 'मशीन की सफाई', 'No dirt of any kind on the machine', 'ti-wash', 'Machine', 1),
  ('Gate Safety', 'गेट सेफ्टी', 'Mould must not close while gate is open', 'ti-shield', 'Safety', 2),
  ('Oil Level', 'आयल लेवल', 'Oil level must not be below minimum', 'ti-droplet', 'Hydraulic', 3),
  ('Hyd-Oil Temp (Max 40)', 'आयल टेम्प्रेचर', 'Oil temperature must not exceed 40°C', 'ti-thermometer', 'Hydraulic', 4),
  ('Oil Leakage', 'आयल लीकेज', 'No oil leakage anywhere', 'ti-droplet-off', 'Hydraulic', 5),
  ('Water Valve', 'वाटर वाल्व', 'No water leakage, valve fully open', 'ti-refresh', 'Hydraulic', 6),
  ('Pump Noise', 'पम्प नॉइस', 'No abnormal sound from the pump', 'ti-volume', 'Machine', 7),
  ('Emergency Switch', 'एमर्जेन्सी स्विच', 'Switch must work when pressed', 'ti-alert-octagon', 'Safety', 8),
  ('Hopper Preheating System', 'हॉपर प्रीहीटिंग टेम्प्रेचर', 'Hopper preheating system must work', 'ti-flame', 'Machine', 9),
  ('Unbearable Noise', 'असहनीय आवाज', 'No abnormal noise from the machine', 'ti-ear', 'Machine', 10),
  ('Poka-Yoke Validation', 'पोका योके वैलिडेशन', 'Poka-yoke must not fail', 'ti-shield-check', 'Quality', 11)
ON CONFLICT (item_name) DO UPDATE SET
  local_label = EXCLUDED.local_label, specification = EXCLUDED.specification,
  icon = EXCLUDED.icon, category = EXCLUDED.category, sort_order = EXCLUDED.sort_order;

-- Retire the earlier generic placeholder set now that the real sheet is in
DELETE FROM daily_check_items WHERE item_name IN (
  'PPE worn (safety shoes, glasses, gloves as required)',
  'Machine safety guards/doors in place and functional',
  'Emergency stop button tested and working',
  'Fire extinguisher accessible and unobstructed',
  'Work area floor clean, dry, free of obstructions',
  'Tools and gauges returned to designated place',
  'Scrap/rejects segregated in correct bins',
  'Hopper/material covered and free of contamination',
  'Mould clamped and aligned correctly',
  'First-off sample matches approved standard',
  'Process parameters match SOP/approved setup sheet',
  'No unauthorized process changes since last shift'
) AND id NOT IN (SELECT DISTINCT check_item_id FROM daily_check_responses);

-- Batch-numbering code and part-only weight (no runner), from PART_MASTER,
-- for the same parts already cross-referenced above.

UPDATE parts SET batch_part_code = '1', part_weight_g = 5.75 WHERE part_code = 'A710-BBWBA-01';
UPDATE parts SET batch_part_code = '36', part_weight_g = 5.77 WHERE part_code = 'CA581CAWXX01';
UPDATE parts SET batch_part_code = '37', part_weight_g = 4.92 WHERE part_code = 'CA582DDRXX01';
UPDATE parts SET batch_part_code = '32', part_weight_g = 1.29 WHERE part_code = 'DM1C4UBH1B01';
UPDATE parts SET batch_part_code = '2', part_weight_g = 3 WHERE part_code = 'F364-CB5AA-01';
UPDATE parts SET batch_part_code = '4', part_weight_g = 4.33 WHERE part_code = 'F442-KQAAA-01';
UPDATE parts SET batch_part_code = '3', part_weight_g = 3.97 WHERE part_code = 'F442-QQ7AA-01';
UPDATE parts SET batch_part_code = '5', part_weight_g = 3.31 WHERE part_code = 'F442-WBAAA-01';
UPDATE parts SET batch_part_code = '7', part_weight_g = 3.44 WHERE part_code = 'F710-AKYAA-01';
UPDATE parts SET batch_part_code = '8', part_weight_g = 2.59 WHERE part_code = 'F885-BB1AA-01';
UPDATE parts SET batch_part_code = '9', part_weight_g = 2.37 WHERE part_code = 'FC1F2AN6BA01';
UPDATE parts SET batch_part_code = '1A', part_weight_g = 5.75 WHERE part_code = 'FC1F2CEEAA02';
UPDATE parts SET batch_part_code = '47', part_weight_g = 2 WHERE part_code = 'FC1F2NDGAA02';
UPDATE parts SET batch_part_code = '10', part_weight_g = 1.75 WHERE part_code = 'FC1F2SPHAA02';
UPDATE parts SET batch_part_code = '11', part_weight_g = 2.62 WHERE part_code = 'FC1F2SULLA01';
UPDATE parts SET batch_part_code = '12', part_weight_g = 0.8 WHERE part_code = 'FC1F2UGKCA01';
UPDATE parts SET batch_part_code = '13', part_weight_g = 1.69 WHERE part_code = 'FC1F2UMEAB01';
UPDATE parts SET batch_part_code = '46', part_weight_g = 2.57 WHERE part_code = 'FC1F2UMEAA01';
UPDATE parts SET batch_part_code = '14', part_weight_g = 4.56 WHERE part_code = 'HA715L5G1A01';
UPDATE parts SET batch_part_code = '15', part_weight_g = 3.84 WHERE part_code = 'HC442CXGAA01';
UPDATE parts SET batch_part_code = '16', part_weight_g = 3.63 WHERE part_code = 'HC442SPHAA03';
UPDATE parts SET batch_part_code = '35', part_weight_g = 4.44 WHERE part_code = 'HC442L3LAC01';
UPDATE parts SET batch_part_code = '33', part_weight_g = 6.07 WHERE part_code = 'HC442L3LBB01';
UPDATE parts SET batch_part_code = '34', part_weight_g = 7.15 WHERE part_code = 'HC442L3LBC02';
UPDATE parts SET batch_part_code = '38', part_weight_g = 1.28 WHERE part_code = 'HC442OERAA01';
UPDATE parts SET batch_part_code = '39', part_weight_g = 1.21 WHERE part_code = 'HC442QVEAC01';
UPDATE parts SET batch_part_code = '40', part_weight_g = 1.5 WHERE part_code = 'HC442QVEBC01';
UPDATE parts SET batch_part_code = '17', part_weight_g = 3.59 WHERE part_code = 'HC442SULAC01';
UPDATE parts SET batch_part_code = '45', part_weight_g = 3.56 WHERE part_code = 'HC442UMNAA02';
UPDATE parts SET batch_part_code = '18', part_weight_g = 1.79 WHERE part_code = 'HC443QQVBA02';
UPDATE parts SET batch_part_code = '21', part_weight_g = 7.18 WHERE part_code = 'HR230DH7AA01';
UPDATE parts SET batch_part_code = '20', part_weight_g = 9.34 WHERE part_code = 'HR230PDPKA02';
UPDATE parts SET batch_part_code = '19', part_weight_g = 0.99 WHERE part_code = 'HL180F4W1A01';
UPDATE parts SET batch_part_code = '22', part_weight_g = 1.2 WHERE part_code = 'HW773G9E1A01';
UPDATE parts SET batch_part_code = '23', part_weight_g = 0.34 WHERE part_code = 'HW773G9E1B01';
UPDATE parts SET batch_part_code = '24', part_weight_g = 5.99 WHERE part_code = 'R230-NC5BA-01';
UPDATE parts SET batch_part_code = '25', part_weight_g = 6.2 WHERE part_code = 'R230-NC5BB-01';
UPDATE parts SET batch_part_code = '26', part_weight_g = 1.68 WHERE part_code = 'V0LC-01C019-01';
UPDATE parts SET batch_part_code = '27', part_weight_g = 1.88 WHERE part_code = 'V0LC-01C021-00';
UPDATE parts SET batch_part_code = '28', part_weight_g = 1.62 WHERE part_code = 'V0LC-01C022-00';
UPDATE parts SET batch_part_code = '29', part_weight_g = 2.26 WHERE part_code = 'V0LC-01C028-00';
UPDATE parts SET batch_part_code = '30', part_weight_g = 1.71 WHERE part_code = 'VP5N1H-407721-AA';
UPDATE parts SET batch_part_code = '31', part_weight_g = 2.24 WHERE part_code = 'VP5N1H-407721-FA';
UPDATE parts SET batch_part_code = '41', part_weight_g = 1.87 WHERE part_code = 'RM-19D935-BA';
UPDATE parts SET batch_part_code = 'P2', part_weight_g = 1 WHERE part_code = 'HR241BAE1B01';
UPDATE parts SET batch_part_code = 'P1', part_weight_g = 2.36 WHERE part_code = 'FC1E1BAE1D01';
UPDATE parts SET batch_part_code = 'B3', part_weight_g = 0.78 WHERE part_code = 'FC1P4L1E1A01';
UPDATE parts SET batch_part_code = 'B9', part_weight_g = 0 WHERE part_code = 'VPR230-WC9AB-01';
UPDATE parts SET batch_part_code = 'B4', part_weight_g = 0 WHERE part_code = 'HR241G6C1A01';
UPDATE parts SET batch_part_code = 'B7', part_weight_g = 0 WHERE part_code = 'R101WC9AA01';
UPDATE parts SET batch_part_code = 'B8', part_weight_g = 0 WHERE part_code = 'VPR230WC9AA01';
UPDATE parts SET batch_part_code = 'W1', part_weight_g = 0 WHERE part_code = 'F390-QQDC-A02';
UPDATE parts SET batch_part_code = 'W5', part_weight_g = 1.62 WHERE part_code = 'SHRP-T12';
UPDATE parts SET batch_part_code = 'W6', part_weight_g = 0 WHERE part_code = 'SHRP-T3';
UPDATE parts SET batch_part_code = 'W3', part_weight_g = 0 WHERE part_code = 'F442-KQ';
UPDATE parts SET batch_part_code = 'W7', part_weight_g = 0 WHERE part_code = 'SHRP-T7';
UPDATE parts SET batch_part_code = 'W4', part_weight_g = 0 WHERE part_code = 'SHRP-T10';
UPDATE parts SET batch_part_code = 'W8', part_weight_g = 2.21 WHERE part_code = 'SHRP-T8';
UPDATE parts SET batch_part_code = 'W14', part_weight_g = 2.69 WHERE part_code = 'WC-SCP-SC21NA-DB-01';
UPDATE parts SET batch_part_code = 'W15', part_weight_g = 1.43 WHERE part_code = 'WC-SCP-SC21NA-LC-01';
UPDATE parts SET batch_part_code = 'W16', part_weight_g = 3.61 WHERE part_code = 'WC-SCP-SC21NA-TB-T01';
UPDATE parts SET batch_part_code = 'W10', part_weight_g = 2.05 WHERE part_code = 'WC-SCP-ECC21-LMF01';
UPDATE parts SET batch_part_code = 'W12', part_weight_g = 2.73 WHERE part_code = 'WC-SCP-ECC21-SMF01';
UPDATE parts SET batch_part_code = 'W9', part_weight_g = 2.37 WHERE part_code = 'WC-SCP-ECC21-DA01';
UPDATE parts SET batch_part_code = 'C1', part_weight_g = 0 WHERE part_code = 'VP6TLU-11N087-AA';