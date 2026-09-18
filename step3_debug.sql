\pset pager off
WITH canonical_raw(shrp_part_code, customer_part_no, part_name, cavity_count, part_weight_g) AS (
  VALUES
('F885 Y', 'F885-BB1AA-01', 'cap txv', 6, 2.59),
('LAC Blue', 'HC442L3LAC01', 'Cap (A) joint flange', 16, 4.44),
('DM1C', 'DM1C4UBH1B01', 'Cap SHP''G EVAP CORE', 8, 1.29),
('PUNE B', 'FC1E1BAE1D01', 'SHG''G/CAPE. MISC', 6, 2.36),
('2200', 'V0LC-01C022-00', 'PRODUCTION CAPE', 6, 1.62),
('NA-LC', 'WC-SCP-SC21NA-LC-01', 'SHP''G CAP LIQ COND END', 4, 1.43),
('CEEAA-ORANGE', 'FC1F2CEEAA02', 'CAP - (D) JOINT FLANGE', 6, 5.75),
('VW DIA 8 - HW773B', 'HW773G9E1B01', 'Shipping Cap Degas Spout', 6, 0.34),
('A710', 'A710-BBWBA-01', 'CAP-(D)JOINT FLANGE', 6, 5.75),
('F364 16C', 'F364-CB5AA-01', 'HTR PIPE CAP', 16, 3),
('F364 GS', 'F364-CB5AA-01', 'HTR PIPE CAP - GS (Line on Top)', 6, 2.68),
('F442 KQ', 'F442-KQAAA-01', 'DUST CAP CONDS', 6, 4.33),
('F710', 'F710-AKYAA-01', ' CAP-J/F', 7, 3.44),
('AN6B', 'FC1F2AN6BA01', 'SHIPG CAP HYUNDAI/M', 4, 2.37),
('AA02 Y', 'FC1F2SPHAA02', 'SHP''G/CAP-HYUNDAI/M', 4, 1.75),
('SULLA', 'FC1F2SULLA01', 'SHP''G/CAP HYUNDAI/M', 4, 2.62),
('UGKCA', 'FC1F2UGKCA01', 'SHP''G/CAP HYUNDAI/M', 8, 0.8),
('UMEAB', 'FC1F2UMEAB01', 'SHP''G/CAP HYUNDAI/M', 6, 1.69),
('HA715 - W501', 'HA715L5G1A01', 'CAP ACAC', 6, 4.56),
('CXGAA', 'HC442CXGAA01', 'CAP (A) JOINT FLANGE', 6, 3.84),
('OERAA', 'HC442OERAA01', 'Shipping Cap', 6, 1.28),
('AA03', 'HC442SPHAA03', 'CAP (A) JOINT FLANGE', 4, 3.63),
('LBB', 'HC442L3LBB01', 'CAP (A) JOINT FLANGE', 4, 6.07),
('LBC', 'HC442L3LBC02', 'CAP (A) JOINT FLANGE', 4, 7.15),
('SULAC', 'HC442SULAC01', 'CAP (A) JOINT FLANGE', 4, 3.59),
('QQVBA W', 'HC443QQVBA02', 'CCAP (B) JOINT FLANGE (yellow)', 5, 1.79),
('QQVBA Y', 'HC443QQVBA02', 'CCAP (B) JOINT FLANGE (White)', 5, 1.79),
('DH7AA', 'HR230DH7AA01', 'PLUG-RAD PIPE', 4, 7.18),
('PDPKA', 'HR230PDPKA02', 'PLUG-RAD PIPE', 4, 9.34),
('HL180', 'HL180F4W1A01', 'CAP CHL''R NEX GEN PORSCHE', 4, 0.99),
('VW DIA 16 - HW773A', 'HW773G9E1A01', 'CAP WCAC 16DIA', 6, 1.2),
('NCBA', 'R230-NC5BA-01', 'PLUG RAD PIPE', 4, 5.99),
('NCBB', 'R230-NC5BB-01', 'PLUG RAD PIPE', 4, 6.2),
('1901', 'V0LC-01C019-01', 'CAP-J/FLANGE', 6, 1.68),
('2100', 'V0LC-01C021-00', 'CAP-J/FLANGE 12MM', 6, 1.88),
('2800', 'V0LC-01C028-00', 'CAP', 4, 2.26),
('VPAA', 'VP5N1H-407721-AA', 'PROTECTION CAP - INLET', 6, 1.71),
('VPFA', 'VP5N1H-407721-FA', 'CAP-J FLANGE MALE', 6, 2.24),
('PUNE S', 'HR241BAE1B01', 'CAP RAD', 6, 1),
('BH-DIA 8', 'FC1P4L1E1A01', 'Shipping Cap Hose Liquid', 6, 0.78),
('BH-DIA 16 - MAA', 'PLFC1E4K5MAA-00', 'DUST CAP (SUCTION)(16)', 6, 1.24),
('BH-DIA 12 -MBA', 'PLFC1E4K5MBA-00', 'DUST CAP (DISCHARGE)(12)', 6, 1.36),
('KQ NEW', 'F442-KQ', 'SHIPPING END CAP (IA) FLANGE', NULL, 0),
('SHRP-T8', 'SHRP-T8', 'SHIPPING END CAP (IA) FLANGE', 2, 2.21),
('DA', 'WC-SCP-ECC21-DA01', 'Shipping Cap DIS Comp Side ', 2, 2.37),
('LMF', 'WC-SCP-ECC21-LMF01', 'Shipping Cap Liq Middle Female Type ', 2, 2.05),
('LMM', 'WC-SCP-eCC21-Lmm01', 'Shipping Cap LIQ Middle Male Type ', 2, 0),
('SMF', 'WC-SCP-ECC21-SMF01', 'Shipping Cap Suc Middle Female Type ', 2, 2.73),
('SMM', 'WC-SCP-eCC21-Smm01', 'Shipping Cap SUC Middle Male Type ', 6, 2.48),
('NA-DB', 'WC-SCP-SC21NA-DB-01', 'SHIPING CAP DIS COND SIDE', 4, 2.68),
('AFM BIG', 'CA581CAWXX01', 'CAP ASY-SUC', 6, 5.77),
('AFM SMALL', 'CA582DDRXX01', 'CAP ASY-DIS', 6, 4.92),
('F442 QQ', 'F442-QQ7AA-01', 'DUST CAP COND', 4, 3.97),
('F442 WB', 'F442-WBAAA-01', 'DUST CAP-COND', 1, 3.31),
('NDGAA', 'FC1F2NDGAA02', 'CAP-(D)JOINT FLANGE', 6, 2),
('UMEAA', 'FC1F2UMEAA01', 'SHP''G/CAP HYUNDAI/M', 4, 2.57),
('QVEAC', 'HC442QVEAC01', 'CAP (A) JOINT FLANGE', 8, 1.21),
('QVEBC', 'HC442QVEBC01', 'CAP (A) JOINT FLANGE', 8, 1.5),
('UMNAA', 'HC442UMNAA02', 'CAP (A) JOINT FLANGE', 6, 3.56),
('', 'DM1C1QRJAA01', 'SHIPPPING CAP HTR', NULL, 3),
('9AB', 'VPR230-WC9AB-01', 'DUST PROTECTION CAP', 4, 3.1),
('HR241', 'HR241G6C1A01', 'CAP MG RAD 18.5', 6, 0),
('INLET', 'HC442G6C1A', 'MG Condensor INLET', 4, 1.44),
('OUTLET', 'HC442G6C1B', 'MG Condensor Outlet', 4, 1.44),
('R101', 'R101WC9AA01', 'CAP TOC-CONN', 4, NULL),
('9AA', 'VPR230WC9AA01', 'DUST PROTECTION CAP RAD', 4, NULL),
('F390', 'F390-QQDC-A02', 'SHIPPING CAP', 4, NULL),
('SHRP-T7', 'SHRP-T7', 'SHIPPING (WHITE)-HP (IA)', 2, NULL),
('SHRP-T10', 'SHRP-T10', 'SHIPPING (white)-LP (IA)', 2, NULL),
('LAC GREEN', 'VPMGH-18B602-DA', 'SHIPPING CAP SV CT', 16, 4.44),
('NA-TB', 'WC-SCP-SC21NA-TB-T01', 'SHP''G CAP TXV SIDE', 4, 3.61),
('ATBAB', 'F442-ATBAB-02', 'SHP''G CAP GS JUMPER TUBE JF', 2, 3.63),
('', 'SmallGrommet', 'GROMMET', 4, NULL),
('VP6T', 'VP6TLU11N087AA', 'CVR STR MTR SOLE TERM', 16, NULL),
('', 'HandlePlastic', 'HNDL', 1, NULL),
('SYRINGE CAP', 'SYRNGECAP', 'CAP', 12, NULL)
),
canonical AS (
  SELECT *, lower(trim(customer_part_no)) AS cpn_norm,
    CASE WHEN lower(trim(customer_part_no)) IN ('f364-cb5aa-01', 'hc443qqvba02')
         THEN lower(trim(customer_part_no)) || '|cav' || cavity_count::text
         ELSE lower(trim(customer_part_no))
    END AS canon_key
  FROM canonical_raw
),
part_keyed AS (
  SELECT p.id, p.part_code, p.customer_part_no, p.cavity_count, p.active,
    lower(trim(p.customer_part_no)) AS cpn_norm,
    CASE WHEN lower(trim(p.customer_part_no)) IN ('f364-cb5aa-01', 'hc443qqvba02')
         THEN lower(trim(p.customer_part_no)) || '|cav' || p.cavity_count::text
         ELSE lower(trim(p.customer_part_no))
    END AS canon_key
  FROM parts p
)
SELECT 'total_parts' AS metric, count(*)::text AS val FROM parts
UNION ALL SELECT 'total_canonical_rows', count(*)::text FROM canonical
UNION ALL SELECT 'distinct_canonical_keys', count(DISTINCT canon_key)::text FROM canonical
UNION ALL SELECT 'total_part_keyed', count(*)::text FROM part_keyed
UNION ALL SELECT 'matched_join_rowcount', count(*)::text FROM part_keyed pk JOIN canonical c ON c.canon_key = pk.canon_key
UNION ALL SELECT 'distinct_matched_ids', count(DISTINCT pk.id)::text FROM part_keyed pk JOIN canonical c ON c.canon_key = pk.canon_key
UNION ALL SELECT 'unmatched_ids', count(*)::text FROM part_keyed pk WHERE NOT EXISTS (SELECT 1 FROM canonical c WHERE c.canon_key = pk.canon_key);
