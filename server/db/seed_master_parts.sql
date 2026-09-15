-- ============================================================
-- Seed Master Parts (77 Parts from Shopfloor Excel Master)
-- Fully idempotent: creates tolerance_pct column, backfills 77 parts,
-- preserves existing foreign keys (machine_assignments, bags, etc.)
-- ============================================================

ALTER TABLE parts ADD COLUMN IF NOT EXISTS tolerance_pct NUMERIC DEFAULT 2;
ALTER TABLE parts ALTER COLUMN standard_cycle_time_sec SET DEFAULT 0;
UPDATE parts SET tolerance_pct = 2 WHERE tolerance_pct IS NULL;

CREATE OR REPLACE FUNCTION upsert_part_master(
  p_shrp_part_code TEXT,
  p_customer_part_no TEXT,
  p_part_weight_g NUMERIC,
  p_trim_required BOOLEAN,
  p_inspection_required BOOLEAN,
  p_packing_required BOOLEAN,
  p_dispatch_required BOOLEAN,
  p_tolerance_pct NUMERIC,
  p_standard_pack_qty INTEGER,
  p_cavity_count INTEGER,
  p_unit_weight_g NUMERIC,
  p_batch_part_code TEXT
) RETURNS VOID AS $func$
DECLARE
  v_part_id INTEGER;
  v_part_code TEXT;
BEGIN
  -- Determine default unique part_code
  IF p_shrp_part_code = 'F364 GS' THEN
    v_part_code := 'F364-CB5AA-01-GS';
  ELSIF p_shrp_part_code = 'F364 16C' THEN
    v_part_code := 'F364-CB5AA-01';
  ELSIF p_shrp_part_code = 'QQVBA Y' THEN
    v_part_code := 'HC443QQVBA02-Y';
  ELSIF p_shrp_part_code = 'QQVBA W' THEN
    v_part_code := 'HC443QQVBA02';
  ELSIF p_shrp_part_code = 'LAC Green' THEN
    v_part_code := 'HC442L3LAC01-GRN';
  ELSIF p_shrp_part_code = 'LAC Blue' THEN
    v_part_code := 'HC442L3LAC01';
  ELSIF p_shrp_part_code = 'SYRINGE CAP' THEN
    v_part_code := 'SYRINGE-CAP';
  ELSE
    v_part_code := COALESCE(NULLIF(p_customer_part_no, ''), p_shrp_part_code);
  END IF;

  -- Look for an existing part whose identity overlaps with EITHER identifier we were
  -- given, across ALL four identity-bearing columns. Different seed scripts have stored
  -- the same physical part's short code / long technical number in different columns
  -- (sometimes swapped relative to each other), so a narrow single-column exact match
  -- misses rows that already exist under a different field, creating a duplicate.
  SELECT id INTO v_part_id FROM parts
  WHERE UPPER(TRIM(part_code)) IN (UPPER(TRIM(p_shrp_part_code)), UPPER(TRIM(COALESCE(p_customer_part_no, ''))))
     OR UPPER(TRIM(part_name)) IN (UPPER(TRIM(p_shrp_part_code)), UPPER(TRIM(COALESCE(p_customer_part_no, ''))))
     OR UPPER(TRIM(COALESCE(shrp_part_code, ''))) IN (UPPER(TRIM(p_shrp_part_code)), UPPER(TRIM(COALESCE(p_customer_part_no, ''))))
     OR UPPER(TRIM(COALESCE(customer_part_no, ''))) IN (UPPER(TRIM(p_shrp_part_code)), UPPER(TRIM(COALESCE(p_customer_part_no, ''))))
  LIMIT 1;

  -- If not found, look by exact part_code match
  IF v_part_id IS NULL THEN
    SELECT id INTO v_part_id FROM parts WHERE part_code = v_part_code LIMIT 1;
  END IF;

  -- If not found and customer_part_no is unique
  IF v_part_id IS NULL AND p_customer_part_no IS NOT NULL 
     AND p_customer_part_no NOT IN ('F364-CB5AA-01', 'HC443QQVBA02', 'HC442L3LAC01') THEN
    SELECT id INTO v_part_id FROM parts WHERE customer_part_no = p_customer_part_no OR part_code = p_customer_part_no LIMIT 1;
  END IF;

  IF v_part_id IS NOT NULL THEN
    UPDATE parts SET
      shrp_part_code = p_shrp_part_code,
      customer_part_no = COALESCE(p_customer_part_no, customer_part_no, p_shrp_part_code),
      part_name = COALESCE(NULLIF(part_name, ''), p_shrp_part_code),
      part_weight_g = p_part_weight_g,
      cavity_count = p_cavity_count,
      unit_weight_g = p_unit_weight_g,
      standard_pack_qty = p_standard_pack_qty,
      batch_part_code = p_batch_part_code,
      trim_required = p_trim_required,
      inspection_required = p_inspection_required,
      packing_required = p_packing_required,
      dispatch_required = p_dispatch_required,
      tolerance_pct = p_tolerance_pct,
      active = TRUE
    WHERE id = v_part_id;
  ELSE
    IF EXISTS (SELECT 1 FROM parts WHERE part_code = v_part_code) THEN
      v_part_code := p_shrp_part_code;
    END IF;

    INSERT INTO parts (
      part_code, part_name, shrp_part_code, customer_part_no,
      part_weight_g, cavity_count, unit_weight_g, standard_pack_qty,
      batch_part_code, trim_required, inspection_required, packing_required,
      dispatch_required, tolerance_pct, standard_cycle_time_sec, active
    ) VALUES (
      v_part_code,
      p_shrp_part_code,
      p_shrp_part_code,
      COALESCE(p_customer_part_no, p_shrp_part_code),
      p_part_weight_g,
      p_cavity_count,
      p_unit_weight_g,
      p_standard_pack_qty,
      p_batch_part_code,
      p_trim_required,
      p_inspection_required,
      p_packing_required,
      p_dispatch_required,
      p_tolerance_pct,
      0,
      TRUE
    );
  END IF;
END;
$func$ LANGUAGE plpgsql;

-- Execute upsert for all 77 master parts
SELECT upsert_part_master('LBB', 'HC442L3LBB01', 6.07, FALSE, TRUE, TRUE, TRUE, 2, 250, 4, 31, '33');
SELECT upsert_part_master('LBC', 'HC442L3LBC02', 7.15, FALSE, TRUE, TRUE, TRUE, 2, 150, 4, 36, '34');
SELECT upsert_part_master('LAC Blue', 'HC442L3LAC01', 4.44, FALSE, TRUE, TRUE, TRUE, 2, 400, 16, 95.5, '35');
SELECT upsert_part_master('AFM BIG', 'CA581CAWXX01', 5.77, FALSE, TRUE, TRUE, TRUE, 2, 250, 6, 85.5, '36');
SELECT upsert_part_master('CEEAA-ORANGE', 'FC1F2CEEAA02', 5.75, FALSE, TRUE, TRUE, TRUE, 2, 250, 6, 47.5, '1A');
SELECT upsert_part_master('AFM SMALL', 'CA582DDRXX01', 4.92, FALSE, TRUE, TRUE, TRUE, 2, 250, 6, 68.5, '37');
SELECT upsert_part_master('OERAA', 'HC442OERAA01', 1.28, FALSE, TRUE, TRUE, TRUE, 2, 1000, 6, 0, '38');
SELECT upsert_part_master('A710', 'A710-BBWBA-01', 5.75, FALSE, TRUE, TRUE, TRUE, 2, 250, 6, 47.5, '1');
SELECT upsert_part_master('F364 16C', 'F364-CB5AA-01', 3, FALSE, TRUE, TRUE, TRUE, 2, 400, 16, 62, '2');
SELECT upsert_part_master('F364 GS', 'F364-CB5AA-01', 2.68, TRUE, TRUE, TRUE, TRUE, 2, 400, 6, 19.5, '2A');
SELECT upsert_part_master('F442 QQ', 'F442-QQ7AA-01', 3.97, TRUE, TRUE, TRUE, TRUE, 2, 300, 4, 19.1, '3');
SELECT upsert_part_master('F442 KQ', 'F442-KQAAA-01', 4.33, FALSE, TRUE, TRUE, TRUE, 2, 200, 6, 31.5, '4');
SELECT upsert_part_master('F442 WB', 'F442-WBAAA-01', 3.31, FALSE, TRUE, TRUE, TRUE, 2, 300, 1, 4, '5');
SELECT upsert_part_master('F710', 'F710-AKYAA-01', 3.44, TRUE, TRUE, TRUE, TRUE, 2, 400, 7, 26.5, '7');
SELECT upsert_part_master('F885 Y', 'F885-BB1AA-01', 2.59, TRUE, TRUE, TRUE, TRUE, 2, 500, 6, 22.5, '8');
SELECT upsert_part_master('AN6B', 'FC1F2AN6BA01', 2.37, FALSE, TRUE, TRUE, TRUE, 2, 500, 4, 13, '9');
SELECT upsert_part_master('AA02 Y', 'FC1F2SPHAA02', 1.75, FALSE, TRUE, TRUE, TRUE, 2, 750, 4, 10, '10');
SELECT upsert_part_master('SULLA', 'FC1F2SULLA01', 2.62, FALSE, TRUE, TRUE, TRUE, 2, 300, 4, 12, '11');
SELECT upsert_part_master('UGKCA', 'FC1F2UGKCA01', 0.8, TRUE, TRUE, TRUE, TRUE, 2, 1500, 8, 12.5, '12');
SELECT upsert_part_master('UMEAB', 'FC1F2UMEAB01', 1.69, FALSE, TRUE, TRUE, TRUE, 2, 750, 6, 14, '13');
SELECT upsert_part_master('HA715 - W501', 'HA715L5G1A01', 4.56, FALSE, TRUE, TRUE, TRUE, 2, 200, 6, 31, '14');
SELECT upsert_part_master('CXGAA', 'HC442CXGAA01', 3.84, FALSE, TRUE, TRUE, TRUE, 2, 250, 6, 29, '15');
SELECT upsert_part_master('AA03', 'HC442SPHAA03', 3.63, FALSE, TRUE, TRUE, TRUE, 2, 250, 4, 18, '16');
SELECT upsert_part_master('SULAC', 'HC442SULAC01', 3.59, FALSE, TRUE, TRUE, TRUE, 2, 300, 4, 17.5, '17');
SELECT upsert_part_master('QQVBA W', 'HC443QQVBA02', 1.79, TRUE, TRUE, TRUE, TRUE, 2, 750, 5, 11.5, '18');
SELECT upsert_part_master('QQVBA Y', 'HC443QQVBA02', 1.79, TRUE, TRUE, TRUE, TRUE, 2, 750, 5, 11.5, '18Y');
SELECT upsert_part_master('HL180', 'HL180F4W1A01', 0.99, FALSE, TRUE, TRUE, TRUE, 2, 1000, 4, 6.5, '19');
SELECT upsert_part_master('PDPKA', 'HR230PDPKA02', 9.34, FALSE, TRUE, TRUE, TRUE, 2, 100, 4, 38.5, '20');
SELECT upsert_part_master('DH7AA', 'HR230DH7AA01', 7.18, TRUE, TRUE, TRUE, TRUE, 2, 100, 4, 31, '21');
SELECT upsert_part_master('VW DIA 16 - HW773A', 'HW773G9E1A01', 1.2, FALSE, TRUE, TRUE, TRUE, 2, 1000, 6, 9.3, '22');
SELECT upsert_part_master('VW DIA 8 - HW773B', 'HW773G9E1B01', 0.34, TRUE, FALSE, TRUE, TRUE, 2, 3000, 6, 3.7, '23');
SELECT upsert_part_master('NCBA', 'R230-NC5BA-01', 5.99, TRUE, FALSE, TRUE, TRUE, 2, 200, 4, 26.5, '24');
SELECT upsert_part_master('NCBB', 'R230-NC5BB-01', 6.2, TRUE, FALSE, TRUE, TRUE, 2, 105, 4, 28, '25');
SELECT upsert_part_master('1901', 'V0LC-01C019-01', 1.68, FALSE, TRUE, TRUE, TRUE, 2, 600, 6, 11.7, '26');
SELECT upsert_part_master('2100', 'V0LC-01C021-00', 1.88, FALSE, TRUE, TRUE, TRUE, 2, 750, 6, 15.5, '27');
SELECT upsert_part_master('2200', 'V0LC-01C022-00', 1.62, FALSE, TRUE, TRUE, TRUE, 2, 750, 6, 11, '28');
SELECT upsert_part_master('2800', 'V0LC-01C028-00', 2.26, TRUE, TRUE, TRUE, TRUE, 2, 500, 4, 11, '29');
SELECT upsert_part_master('VPAA', 'VP5N1H-407721-AA', 1.71, TRUE, TRUE, TRUE, TRUE, 2, 650, 6, 15, '30');
SELECT upsert_part_master('VPFA', 'VP5N1H-407721-FA', 2.24, TRUE, TRUE, TRUE, TRUE, 2, 500, 6, 16.5, '31');
SELECT upsert_part_master('DM1C', 'DM1C4UBH1B01', 1.29, TRUE, TRUE, TRUE, TRUE, 2, 750, 8, 14, '32');
SELECT upsert_part_master('UMNAA', 'HC442UMNAA02', 3.56, FALSE, TRUE, TRUE, TRUE, 2, 250, 6, 29.5, '45');
SELECT upsert_part_master('UMEAA', 'FC1F2UMEAA01', 2.57, FALSE, TRUE, TRUE, TRUE, 2, 300, 4, 12.5, '46');
SELECT upsert_part_master('NDGAA', 'FC1F2NDGAA02', 2, FALSE, TRUE, TRUE, TRUE, 2, 750, 6, 16.7, '47');
SELECT upsert_part_master('QVEAC', 'HC442QVEAC01', 1.21, FALSE, TRUE, TRUE, TRUE, 2, 1000, 8, 16, '39');
SELECT upsert_part_master('QVEBC', 'HC442QVEBC01', 1.5, FALSE, TRUE, TRUE, TRUE, 2, 1000, 8, 19, '40');
SELECT upsert_part_master('BH-DIA 16 - MAA', 'PL FC1E4K5MAA - 00', 1.24, FALSE, TRUE, TRUE, TRUE, 2, 1000, 6, 13, 'B1');
SELECT upsert_part_master('BH-DIA 12 -MBA', 'PL FC1E4K5MBA - 00', 1.36, FALSE, TRUE, TRUE, TRUE, 2, 750, 6, 14, 'B2');
SELECT upsert_part_master('BH-DIA 8', 'FC1P4L1E1A01', 0.78, TRUE, TRUE, TRUE, TRUE, 2, 1500, 6, 7, 'B3');
SELECT upsert_part_master('HR241', 'HR241G6C1A01', 0, FALSE, TRUE, TRUE, TRUE, 2, 400, 6, 18.5, 'B4');
SELECT upsert_part_master('OUTLET', 'PLHC442G6C1B', 1.44, TRUE, TRUE, TRUE, TRUE, 2, 1000, 4, 8.5, 'B5');
SELECT upsert_part_master('INLET', 'PLHC442G6C1A', 1.44, TRUE, TRUE, TRUE, TRUE, 2, 1000, 4, 8.5, 'B6');
SELECT upsert_part_master('PUNE B', 'FC1E1BAE1D01', 2.36, FALSE, TRUE, TRUE, TRUE, 2, 400, 6, 19.5, 'P1');
SELECT upsert_part_master('PUNE S', 'HR241BAE1B01', 1, FALSE, TRUE, TRUE, TRUE, 2, 800, 6, 11.5, 'P2');
SELECT upsert_part_master('F390', 'F390-QQDC-A02', 0, FALSE, TRUE, TRUE, TRUE, 2, 1000, 0, 0, 'W1');
SELECT upsert_part_master('LMF', 'WC-SCP-ECC21-LMF01', 2.05, TRUE, TRUE, TRUE, TRUE, 2, 650, 2, 6.5, 'W10');
SELECT upsert_part_master('LMM', 'WC-SCP-eCC21-Lmm01', 0, TRUE, TRUE, TRUE, TRUE, 2, 650, 0, 0, 'W11');
SELECT upsert_part_master('SMF', 'WC-SCP-ECC21-SMF01', 2.73, TRUE, TRUE, TRUE, TRUE, 2, 500, 2, 6.5, 'W12');
SELECT upsert_part_master('SMM', 'WC-SCP-eCC21-Smm01', 2.48, TRUE, TRUE, TRUE, TRUE, 2, 500, 2, 5, 'W13');
SELECT upsert_part_master('NA-DB', 'WC-SCP-SC21NA-DB-01', 2.68, TRUE, TRUE, TRUE, TRUE, 2, 500, 4, 13.12, 'W14');
SELECT upsert_part_master('NA-LC', 'WC-SCP-SC21NA-LC-01', 1.43, TRUE, TRUE, TRUE, TRUE, 2, 750, 4, 7, 'W15');
SELECT upsert_part_master('NA-TB', 'WC-SCP-SC21NA-TB-T01', 3.61, TRUE, TRUE, TRUE, TRUE, 2, 300, 4, 16.5, 'W16');
SELECT upsert_part_master('KQ NEW', 'F442-KQ', 0, TRUE, TRUE, TRUE, TRUE, 2, 1000, 0, 0, 'W3');
SELECT upsert_part_master('SHRP-T10', 'SHRP-T10', 0, TRUE, TRUE, TRUE, TRUE, 2, 2000, 0, 0, 'W4');
SELECT upsert_part_master('SHRP-T12', 'SHRP-T12', 1.62, TRUE, TRUE, TRUE, TRUE, 2, 750, 6, 11, 'W5');
SELECT upsert_part_master('SHRP-T3', 'SHRP-T3', 0, TRUE, TRUE, TRUE, TRUE, 2, 600, 0, 0, 'W6');
SELECT upsert_part_master('SHRP-T7', 'SHRP-T7', 0, TRUE, TRUE, TRUE, TRUE, 2, 2000, 0, 0, 'W7');
SELECT upsert_part_master('SHRP-T8', 'SHRP-T8', 2.21, TRUE, TRUE, TRUE, TRUE, 2, 500, 2, 5.5, 'W8');
SELECT upsert_part_master('ATBAB', 'F442-ATBAB02', 3.63, TRUE, TRUE, TRUE, TRUE, 2, 300, 2, 8.5, 'W18');
SELECT upsert_part_master('DA', 'WC-SCP-ECC21-DA01', 2.37, TRUE, TRUE, TRUE, TRUE, 2, 500, 2, 5.5, 'W9');
SELECT upsert_part_master('LAC Green', 'HC442L3LAC01', 4.44, FALSE, TRUE, TRUE, TRUE, 2, 400, 0, 0, 'W17');
SELECT upsert_part_master('R101', 'R101WC9AA01', 0, FALSE, TRUE, TRUE, TRUE, 2, 2000, 0, 0, 'B7');
SELECT upsert_part_master('T40', 'RM-19D935-BA', 1.87, FALSE, TRUE, TRUE, TRUE, 2, 750, 4, 8, '41');
SELECT upsert_part_master('VK GR -6', 'VK Grommet', 0, TRUE, TRUE, TRUE, TRUE, 2, 1500, 0, 0, '0');
SELECT upsert_part_master('VP6T', 'VP6TLU-11N087-AA', 0, TRUE, TRUE, TRUE, TRUE, 2, 1000, 16, 0, 'C1');
SELECT upsert_part_master('9AA', 'VPR230WC9AA01', 0, TRUE, TRUE, TRUE, TRUE, 2, 400, 0, 0, 'B8');
SELECT upsert_part_master('9AB', 'VPR230-WC9AB-01', 3.1, FALSE, TRUE, TRUE, TRUE, 2, 300, 4, 13.6, 'B9');
SELECT upsert_part_master('SYRINGE CAP', NULL, 0, TRUE, TRUE, TRUE, TRUE, 2, 1500, 12, 0, 'O1');

-- Cleanup helper function
DROP FUNCTION IF EXISTS upsert_part_master(TEXT, TEXT, NUMERIC, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, NUMERIC, INTEGER, INTEGER, NUMERIC, TEXT);