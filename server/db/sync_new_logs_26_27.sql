-- ===========================================================
-- Incremental Sync of Newly Added Logs from FORM ENTRY 26-271.xlsm
-- Idempotent: Only inserts new log records without altering masters
-- ===========================================================
BEGIN;
-- 1. Incremental Bags Sync
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34240826A-001', '46258'::DATE, 'A', m.id, p.id, '34240826A', 'PART', , , 'OPEN', FALSE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34240826A-002', '46258'::DATE, 'A', m.id, p.id, '34240826A', 'PART', , , 'OPEN', FALSE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34240826A-003', '46258'::DATE, 'A', m.id, p.id, '34240826A', 'PART', , , 'OPEN', FALSE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34240826A-R01', '46258'::DATE, 'A', m.id, p.id, '34240826A', 'RUNNER', , , 'OPEN', FALSE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34240826A-R02', '46258'::DATE, 'A', m.id, p.id, '34240826A', 'RUNNER', , , 'OPEN', FALSE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '4240826A-001', '46258'::DATE, 'A', m.id, p.id, '4240826A', 'PART', , , 'INSPECTED', FALSE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F442 KQ' OR p.shrp_part_code = 'F442 KQ')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '4240826A-002', '46258'::DATE, 'A', m.id, p.id, '4240826A', 'PART', , , 'OPEN', FALSE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F442 KQ' OR p.shrp_part_code = 'F442 KQ')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '4240826A-003', '46258'::DATE, 'A', m.id, p.id, '4240826A', 'PART', , , 'TRIMMED', FALSE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F442 KQ' OR p.shrp_part_code = 'F442 KQ')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '4240826A-R01', '46258'::DATE, 'A', m.id, p.id, '4240826A', 'RUNNER', , , 'OPEN', FALSE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F442 KQ' OR p.shrp_part_code = 'F442 KQ')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29240826A-001', '46258'::DATE, 'A', m.id, p.id, '29240826A', 'PART', , , 'PACKED', TRUE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29240826A-002', '46258'::DATE, 'A', m.id, p.id, '29240826A', 'PART', , , 'PACKED', TRUE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29240826A-003', '46258'::DATE, 'A', m.id, p.id, '29240826A', 'PART', , , 'PACKED', TRUE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29240826B-001', '46258'::DATE, 'B', m.id, p.id, '29240826B', 'PART', , , 'PACKED', TRUE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29240826B-002', '46258'::DATE, 'B', m.id, p.id, '29240826B', 'PART', , , 'OPEN', TRUE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29240826B-003', '46258'::DATE, 'B', m.id, p.id, '29240826B', 'PART', , , 'OPEN', TRUE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29240826B-004', '46258'::DATE, 'B', m.id, p.id, '29240826B', 'PART', , , 'OPEN', TRUE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '18240826B-001', '46258'::DATE, 'B', m.id, p.id, '18240826B', 'PART', , , 'PACKED', TRUE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'QQVBA W' OR p.shrp_part_code = 'QQVBA W')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '18240826B-002', '46258'::DATE, 'B', m.id, p.id, '18240826B', 'PART', , , 'PACKED', TRUE, '46258 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'QQVBA W' OR p.shrp_part_code = 'QQVBA W')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30250826A-001', '46259'::DATE, 'A', m.id, p.id, '30250826A', 'PART', , , 'PACKED', TRUE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826A-001', '46259'::DATE, 'A', m.id, p.id, '35250826A', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826A-002', '46259'::DATE, 'A', m.id, p.id, '35250826A', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826A-003', '46259'::DATE, 'A', m.id, p.id, '35250826A', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826A-R01', '46259'::DATE, 'A', m.id, p.id, '35250826A', 'RUNNER', , , 'OPEN', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '7250826A-001', '46259'::DATE, 'A', m.id, p.id, '7250826A', 'PART', , , 'OPEN', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'F710' OR p.shrp_part_code = 'F710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '7250826A-002', '46259'::DATE, 'A', m.id, p.id, '7250826A', 'PART', , , 'OPEN', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'F710' OR p.shrp_part_code = 'F710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '7250826A-R01', '46259'::DATE, 'A', m.id, p.id, '7250826A', 'RUNNER', , , 'OPEN', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'F710' OR p.shrp_part_code = 'F710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-001', '46259'::DATE, 'B', m.id, p.id, '35250826B', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-002', '46259'::DATE, 'B', m.id, p.id, '35250826B', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-003', '46259'::DATE, 'B', m.id, p.id, '35250826B', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-004', '46259'::DATE, 'B', m.id, p.id, '35250826B', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-005', '46259'::DATE, 'B', m.id, p.id, '35250826B', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-006', '46259'::DATE, 'B', m.id, p.id, '35250826B', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-R01', '46259'::DATE, 'B', m.id, p.id, '35250826B', 'RUNNER', , , 'OPEN', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-R02', '46259'::DATE, 'B', m.id, p.id, '35250826B', 'RUNNER', , , 'OPEN', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34250826A-001', '46259'::DATE, 'A', m.id, p.id, '34250826A', 'PART', , , 'OPEN', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34250826A-002', '46259'::DATE, 'A', m.id, p.id, '34250826A', 'PART', , , 'OPEN', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34250826A-003', '46259'::DATE, 'A', m.id, p.id, '34250826A', 'PART', , , 'OPEN', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34250826A-R01', '46259'::DATE, 'A', m.id, p.id, '34250826A', 'RUNNER', , , 'OPEN', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34250826A-R02', '46259'::DATE, 'A', m.id, p.id, '34250826A', 'RUNNER', , , 'OPEN', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29250826A-001', '46259'::DATE, 'A', m.id, p.id, '29250826A', 'PART', , , 'OPEN', TRUE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826A-001', '46259'::DATE, 'A', m.id, p.id, '28250826A', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826A-002', '46259'::DATE, 'A', m.id, p.id, '28250826A', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826A-003', '46259'::DATE, 'A', m.id, p.id, '28250826A', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826A-004', '46259'::DATE, 'A', m.id, p.id, '28250826A', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826A-R01', '46259'::DATE, 'A', m.id, p.id, '28250826A', 'RUNNER', , , 'OPEN', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826B-001', '46259'::DATE, 'B', m.id, p.id, '28250826B', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826B-002', '46259'::DATE, 'B', m.id, p.id, '28250826B', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826B-003', '46259'::DATE, 'B', m.id, p.id, '28250826B', 'PART', , , 'PACKED', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826B-R01', '46259'::DATE, 'B', m.id, p.id, '28250826B', 'RUNNER', , , 'OPEN', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8260826A-001', '46260'::DATE, 'A', m.id, p.id, '8260826A', 'PART', , , 'PACKED', TRUE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8260826A-002', '46260'::DATE, 'A', m.id, p.id, '8260826A', 'PART', , , 'PACKED', TRUE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8260826A-003', '46260'::DATE, 'A', m.id, p.id, '8260826A', 'PART', , , 'PACKED', TRUE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8260826A-004', '46260'::DATE, 'A', m.id, p.id, '8260826A', 'PART', , , 'PACKED', TRUE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8260826A-005', '46260'::DATE, 'A', m.id, p.id, '8260826A', 'PART', , , 'PACKED', TRUE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30260826A-001', '46260'::DATE, 'A', m.id, p.id, '30260826A', 'PART', , , 'PACKED', TRUE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30260826A-002', '46260'::DATE, 'A', m.id, p.id, '30260826A', 'PART', , , 'PACKED', TRUE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30260826A-003', '46260'::DATE, 'A', m.id, p.id, '30260826A', 'PART', , , 'PACKED', TRUE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30260826A-004', '46260'::DATE, 'A', m.id, p.id, '30260826A', 'PART', , , 'PACKED', TRUE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-001', '46260'::DATE, 'A', m.id, p.id, '35260826A', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-002', '46260'::DATE, 'A', m.id, p.id, '35260826A', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-003', '46260'::DATE, 'A', m.id, p.id, '35260826A', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-004', '46260'::DATE, 'A', m.id, p.id, '35260826A', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-005', '46260'::DATE, 'A', m.id, p.id, '35260826A', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-006', '46260'::DATE, 'A', m.id, p.id, '35260826A', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-007', '46260'::DATE, 'A', m.id, p.id, '35260826A', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-008', '46260'::DATE, 'A', m.id, p.id, '35260826A', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-R01', '46260'::DATE, 'A', m.id, p.id, '35260826A', 'RUNNER', , , 'OPEN', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-R02', '46260'::DATE, 'A', m.id, p.id, '35260826A', 'RUNNER', , , 'OPEN', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28260826A-001', '46260'::DATE, 'A', m.id, p.id, '28260826A', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28260826A-002', '46260'::DATE, 'A', m.id, p.id, '28260826A', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28260826A-R01', '46260'::DATE, 'A', m.id, p.id, '28260826A', 'RUNNER', , , 'OPEN', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22260826A-001', '46260'::DATE, 'A', m.id, p.id, '22260826A', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22260826A-R01', '46260'::DATE, 'A', m.id, p.id, '22260826A', 'RUNNER', , , 'OPEN', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-001', '46260'::DATE, 'B', m.id, p.id, '35260826B', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-002', '46260'::DATE, 'B', m.id, p.id, '35260826B', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-003', '46260'::DATE, 'B', m.id, p.id, '35260826B', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-004', '46260'::DATE, 'B', m.id, p.id, '35260826B', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-005', '46260'::DATE, 'B', m.id, p.id, '35260826B', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-006', '46260'::DATE, 'B', m.id, p.id, '35260826B', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-007', '46260'::DATE, 'B', m.id, p.id, '35260826B', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-008', '46260'::DATE, 'B', m.id, p.id, '35260826B', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-R01', '46260'::DATE, 'B', m.id, p.id, '35260826B', 'RUNNER', , , 'OPEN', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-R02', '46260'::DATE, 'B', m.id, p.id, '35260826B', 'RUNNER', , , 'OPEN', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22260826B-001', '46260'::DATE, 'B', m.id, p.id, '22260826B', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22260826B-002', '46260'::DATE, 'B', m.id, p.id, '22260826B', 'PART', , , 'PACKED', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22260826B-R01', '46260'::DATE, 'B', m.id, p.id, '22260826B', 'RUNNER', , , 'OPEN', FALSE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8270826A-001', '46261'::DATE, 'A', m.id, p.id, '8270826A', 'PART', , , 'PACKED', TRUE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8270826A-002', '46261'::DATE, 'A', m.id, p.id, '8270826A', 'PART', , , 'PACKED', TRUE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8270826A-003', '46261'::DATE, 'A', m.id, p.id, '8270826A', 'PART', , , 'PACKED', TRUE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8270826A-004', '46261'::DATE, 'A', m.id, p.id, '8270826A', 'PART', , , 'PACKED', TRUE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8270826A-005', '46261'::DATE, 'A', m.id, p.id, '8270826A', 'PART', , , 'PACKED', TRUE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30270826A-001', '46261'::DATE, 'A', m.id, p.id, '30270826A', 'PART', , , 'PACKED', TRUE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30270826A-002', '46261'::DATE, 'A', m.id, p.id, '30270826A', 'PART', , , 'PACKED', TRUE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30270826A-003', '46261'::DATE, 'A', m.id, p.id, '30270826A', 'PART', , , 'PACKED', TRUE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30270826A-004', '46261'::DATE, 'A', m.id, p.id, '30270826A', 'PART', , , 'PACKED', TRUE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-001', '46261'::DATE, 'A', m.id, p.id, '35270826A', 'PART', , , 'PACKED', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-002', '46261'::DATE, 'A', m.id, p.id, '35270826A', 'PART', , , 'PACKED', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-003', '46261'::DATE, 'A', m.id, p.id, '35270826A', 'PART', , , 'INSPECTED', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-004', '46261'::DATE, 'A', m.id, p.id, '35270826A', 'PART', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-005', '46261'::DATE, 'A', m.id, p.id, '35270826A', 'PART', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-006', '46261'::DATE, 'A', m.id, p.id, '35270826A', 'PART', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-007', '46261'::DATE, 'A', m.id, p.id, '35270826A', 'PART', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-R01', '46261'::DATE, 'A', m.id, p.id, '35270826A', 'RUNNER', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-001', '46261'::DATE, 'B', m.id, p.id, '35270826B', 'PART', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-002', '46261'::DATE, 'B', m.id, p.id, '35270826B', 'PART', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-003', '46261'::DATE, 'B', m.id, p.id, '35270826B', 'PART', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-004', '46261'::DATE, 'B', m.id, p.id, '35270826B', 'PART', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-005', '46261'::DATE, 'B', m.id, p.id, '35270826B', 'PART', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-006', '46261'::DATE, 'B', m.id, p.id, '35270826B', 'PART', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-007', '46261'::DATE, 'B', m.id, p.id, '35270826B', 'PART', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-008', '46261'::DATE, 'B', m.id, p.id, '35270826B', 'PART', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-R01', '46261'::DATE, 'B', m.id, p.id, '35270826B', 'RUNNER', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-R02', '46261'::DATE, 'B', m.id, p.id, '35270826B', 'RUNNER', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22270826A-001', '46261'::DATE, 'A', m.id, p.id, '22270826A', 'PART', , , 'PACKED', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22270826A-002', '46261'::DATE, 'A', m.id, p.id, '22270826A', 'PART', , , 'PACKED', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22270826A-R01', '46261'::DATE, 'A', m.id, p.id, '22270826A', 'RUNNER', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22270826B-001', '46261'::DATE, 'B', m.id, p.id, '22270826B', 'PART', , , 'PACKED', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22270826B-002', '46261'::DATE, 'B', m.id, p.id, '22270826B', 'PART', , , 'PACKED', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22270826B-R01', '46261'::DATE, 'B', m.id, p.id, '22270826B', 'RUNNER', , , 'OPEN', FALSE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8280826A-001', '46262'::DATE, 'A', m.id, p.id, '8280826A', 'PART', , , 'TRIMMED', TRUE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30280826A-001', '46262'::DATE, 'A', m.id, p.id, '30280826A', 'PART', , , 'PACKED', TRUE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30280826A-002', '46262'::DATE, 'A', m.id, p.id, '30280826A', 'PART', , , 'PACKED', TRUE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30280826A-003', '46262'::DATE, 'A', m.id, p.id, '30280826A', 'PART', , , 'OPEN', TRUE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30280826A-004', '46262'::DATE, 'A', m.id, p.id, '30280826A', 'PART', , , 'OPEN', TRUE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35280826A-001', '46262'::DATE, 'A', m.id, p.id, '35280826A', 'PART', , , 'OPEN', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35280826A-R01', '46262'::DATE, 'A', m.id, p.id, '35280826A', 'RUNNER', , , 'OPEN', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35280826A-R02', '46262'::DATE, 'A', m.id, p.id, '35280826A', 'RUNNER', , , 'OPEN', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1280826A-001', '46262'::DATE, 'A', m.id, p.id, 'P1280826A', 'PART', , , 'PACKED', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1280826A-R01', '46262'::DATE, 'A', m.id, p.id, 'P1280826A', 'RUNNER', , , 'OPEN', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1280826B-001', '46262'::DATE, 'B', m.id, p.id, 'P1280826B', 'PART', , , 'PACKED', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1280826B-002', '46262'::DATE, 'B', m.id, p.id, 'P1280826B', 'PART', , , 'PACKED', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1280826B-003', '46262'::DATE, 'B', m.id, p.id, 'P1280826B', 'PART', , , 'PACKED', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1280826B-004', '46262'::DATE, 'B', m.id, p.id, 'P1280826B', 'PART', , , 'PACKED', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1280826B-R01', '46262'::DATE, 'B', m.id, p.id, 'P1280826B', 'RUNNER', , , 'OPEN', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22280826B-001', '46262'::DATE, 'B', m.id, p.id, '22280826B', 'PART', , , 'PACKED', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22280826B-002', '46262'::DATE, 'B', m.id, p.id, '22280826B', 'PART', , , 'OPEN', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22280826B-R01', '46262'::DATE, 'B', m.id, p.id, '22280826B', 'RUNNER', , , 'OPEN', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10290826A-001', '46263'::DATE, 'A', m.id, p.id, '10290826A', 'PART', , , 'PACKED', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10290826A-002', '46263'::DATE, 'A', m.id, p.id, '10290826A', 'PART', , , 'PACKED', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10290826A-R01', '46263'::DATE, 'A', m.id, p.id, '10290826A', 'RUNNER', , , 'OPEN', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30290826A-001', '46263'::DATE, 'A', m.id, p.id, '30290826A', 'PART', , , 'OPEN', TRUE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30290826A-002', '46263'::DATE, 'A', m.id, p.id, '30290826A', 'PART', , , 'OPEN', TRUE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30290826A-003', '46263'::DATE, 'A', m.id, p.id, '30290826A', 'PART', , , 'OPEN', TRUE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1290826A-001', '46263'::DATE, 'A', m.id, p.id, 'P1290826A', 'PART', , , 'PACKED', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1290826A-002', '46263'::DATE, 'A', m.id, p.id, 'P1290826A', 'PART', , , 'PACKED', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1290826A-003', '46263'::DATE, 'A', m.id, p.id, 'P1290826A', 'PART', , , 'PACKED', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1290826A-R01', '46263'::DATE, 'A', m.id, p.id, 'P1290826A', 'RUNNER', , , 'OPEN', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1290826A-R02', '46263'::DATE, 'A', m.id, p.id, 'P1290826A', 'RUNNER', , , 'OPEN', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2290826B-001', '46263'::DATE, 'B', m.id, p.id, 'P2290826B', 'PART', , , 'PACKED', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2290826B-002', '46263'::DATE, 'B', m.id, p.id, 'P2290826B', 'PART', , , 'PACKED', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2290826B-003', '46263'::DATE, 'B', m.id, p.id, 'P2290826B', 'PART', , , 'PACKED', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2290826B-R01', '46263'::DATE, 'B', m.id, p.id, 'P2290826B', 'RUNNER', , , 'OPEN', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20290826A-001', '46263'::DATE, 'A', m.id, p.id, '20290826A', 'PART', , , 'PACKED', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20290826A-002', '46263'::DATE, 'A', m.id, p.id, '20290826A', 'PART', , , 'PACKED', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20290826A-003', '46263'::DATE, 'A', m.id, p.id, '20290826A', 'PART', , , 'PACKED', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20290826A-004', '46263'::DATE, 'A', m.id, p.id, '20290826A', 'PART', , , 'PACKED', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20290826A-R01', '46263'::DATE, 'A', m.id, p.id, '20290826A', 'RUNNER', , , 'OPEN', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22290826A-001', '46263'::DATE, 'A', m.id, p.id, '22290826A', 'PART', , , 'OPEN', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22290826A-R01', '46263'::DATE, 'A', m.id, p.id, '22290826A', 'RUNNER', , , 'OPEN', FALSE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23290826A-001', '46263'::DATE, 'A', m.id, p.id, '23290826A', 'PART', , , 'PACKED', TRUE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23290826A-002', '46263'::DATE, 'A', m.id, p.id, '23290826A', 'PART', , , 'PACKED', TRUE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23290826B-001', '29-08-2026'::DATE, 'B', m.id, p.id, '23290826B', 'PART', , , 'PACKED', TRUE, '29-08-2026 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23290826B-002', '29-08-2026'::DATE, 'B', m.id, p.id, '23290826B', 'PART', , , 'PACKED', TRUE, '29-08-2026 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23290826B-REJ-143005', '29-08-2026'::DATE, 'B', m.id, p.id, '23290826B', 'PART', , , 'N/A', TRUE, '29-08-2026 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23290826B-LUMP-143005', '29-08-2026'::DATE, 'B', m.id, p.id, '23290826B', 'PART', , , 'N/A', TRUE, '29-08-2026 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28290826A-001', '46263'::DATE, 'A', m.id, p.id, '28290826A', 'PART', , , 'PACKED', TRUE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28290826A-002', '46263'::DATE, 'A', m.id, p.id, '28290826A', 'PART', , , 'PACKED', TRUE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28290826A-003', '46263'::DATE, 'A', m.id, p.id, '28290826A', 'PART', , , 'PACKED', TRUE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28290826A-REJ-194609', '46263'::DATE, 'A', m.id, p.id, '28290826A', 'PART', , , 'N/A', TRUE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28290826B-001', '46263'::DATE, 'B', m.id, p.id, '28290826B', 'PART', , , 'PACKED', TRUE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28290826B-002', '46263'::DATE, 'B', m.id, p.id, '28290826B', 'PART', , , 'PACKED', TRUE, '46263 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '39310826A-001', '46265'::DATE, 'A', m.id, p.id, '39310826A', 'PART', , , 'PACKED', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '39310826A-R01', '46265'::DATE, 'A', m.id, p.id, '39310826A', 'RUNNER', , , 'OPEN', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '39310826A-R02', '46265'::DATE, 'A', m.id, p.id, '39310826A', 'RUNNER', , , 'OPEN', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '39310826A-REJ-200921', '46265'::DATE, 'A', m.id, p.id, '39310826A', 'PART', , , 'N/A', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826A-001', '46265'::DATE, 'A', m.id, p.id, 'P1310826A', 'PART', , , 'PACKED', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826A-002', '46265'::DATE, 'A', m.id, p.id, 'P1310826A', 'PART', , , 'PACKED', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826A-003', '46265'::DATE, 'A', m.id, p.id, 'P1310826A', 'PART', , , 'PACKED', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826A-004', '46265'::DATE, 'A', m.id, p.id, 'P1310826A', 'PART', , , 'PACKED', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826A-R01', '46265'::DATE, 'A', m.id, p.id, 'P1310826A', 'RUNNER', , , 'OPEN', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826A-REJ-115342', '46265'::DATE, 'A', m.id, p.id, 'P1310826A', 'PART', , , 'N/A', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826B-001', '46265'::DATE, 'B', m.id, p.id, 'P1310826B', 'PART', , , 'PACKED', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826B-002', '46265'::DATE, 'B', m.id, p.id, 'P1310826B', 'PART', , , 'PACKED', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826B-003', '46265'::DATE, 'B', m.id, p.id, 'P1310826B', 'PART', , , 'PACKED', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826B-R01', '46265'::DATE, 'B', m.id, p.id, 'P1310826B', 'RUNNER', , , 'OPEN', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826B-R02', '46265'::DATE, 'B', m.id, p.id, 'P1310826B', 'RUNNER', , , 'OPEN', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826B-REJ-123654', '46265'::DATE, 'B', m.id, p.id, 'P1310826B', 'PART', , , 'N/A', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23310826A-001', '46265'::DATE, 'A', m.id, p.id, '23310826A', 'PART', , , 'OPEN', TRUE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23310826A-REJ-123827', '46265'::DATE, 'A', m.id, p.id, '23310826A', 'PART', , , 'N/A', TRUE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23310826A-LUMP-123827', '46265'::DATE, 'A', m.id, p.id, '23310826A', 'PART', , , 'N/A', TRUE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23310826B-001', '46265'::DATE, 'B', m.id, p.id, '23310826B', 'PART', , , 'OPEN', TRUE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23310826B-002', '46265'::DATE, 'B', m.id, p.id, '23310826B', 'PART', , , 'OPEN', TRUE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23310826B-REJ-124003', '46265'::DATE, 'B', m.id, p.id, '23310826B', 'PART', , , 'N/A', TRUE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28310826A-001', '46265'::DATE, 'A', m.id, p.id, '28310826A', 'PART', , , 'PACKED', TRUE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28310826A-002', '46265'::DATE, 'A', m.id, p.id, '28310826A', 'PART', , , 'PACKED', TRUE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28310826A-003', '46265'::DATE, 'A', m.id, p.id, '28310826A', 'PART', , , 'PACKED', TRUE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10010926A-001', '46266'::DATE, 'A', m.id, p.id, '10010926A', 'PART', , , 'PACKED', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10010926A-R01', '46266'::DATE, 'A', m.id, p.id, '10010926A', 'RUNNER', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10010926A-REJ-162204', '46266'::DATE, 'A', m.id, p.id, '10010926A', 'PART', , , 'N/A', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '39010926A-001', '46266'::DATE, 'A', m.id, p.id, '39010926A', 'PART', , , 'PACKED', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '39010926A-R01', '46266'::DATE, 'A', m.id, p.id, '39010926A', 'RUNNER', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1010926A-001', '46266'::DATE, 'A', m.id, p.id, 'P1010926A', 'PART', , , 'PACKED', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1010926A-002', '46266'::DATE, 'A', m.id, p.id, 'P1010926A', 'PART', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1010926A-R01', '46266'::DATE, 'A', m.id, p.id, 'P1010926A', 'RUNNER', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1010926A-R02', '46266'::DATE, 'A', m.id, p.id, 'P1010926A', 'RUNNER', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2010926A-001', '46266'::DATE, 'A', m.id, p.id, 'P2010926A', 'PART', , , 'PACKED', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2010926A-R01', '46266'::DATE, 'A', m.id, p.id, 'P2010926A', 'RUNNER', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2010926A-REJ-165338', '46266'::DATE, 'A', m.id, p.id, 'P2010926A', 'PART', , , 'N/A', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2010926B-001', '46266'::DATE, 'B', m.id, p.id, 'P2010926B', 'PART', , , 'PACKED', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2010926B-R01', '46266'::DATE, 'B', m.id, p.id, 'P2010926B', 'RUNNER', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20010926A-001', '46266'::DATE, 'A', m.id, p.id, '20010926A', 'PART', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20010926A-002', '46266'::DATE, 'A', m.id, p.id, '20010926A', 'PART', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20010926A-003', '46266'::DATE, 'A', m.id, p.id, '20010926A', 'PART', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20010926A-004', '46266'::DATE, 'A', m.id, p.id, '20010926A', 'PART', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20010926A-005', '46266'::DATE, 'A', m.id, p.id, '20010926A', 'PART', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20010926A-R01', '46266'::DATE, 'A', m.id, p.id, '20010926A', 'RUNNER', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20010926A-REJ-170629', '46266'::DATE, 'A', m.id, p.id, '20010926A', 'PART', , , 'N/A', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23010926A-001', '46266'::DATE, 'A', m.id, p.id, '23010926A', 'PART', , , 'OPEN', TRUE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23010926A-002', '46266'::DATE, 'A', m.id, p.id, '23010926A', 'PART', , , 'OPEN', TRUE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23010926A-REJ-171315', '46266'::DATE, 'A', m.id, p.id, '23010926A', 'PART', , , 'N/A', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23010926A-LUMP-171315', '46266'::DATE, 'A', m.id, p.id, '23010926A', 'PART', , , 'N/A', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23010926B-001', '46266'::DATE, 'B', m.id, p.id, '23010926B', 'PART', , , 'OPEN', TRUE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23010926B-002', '46266'::DATE, 'B', m.id, p.id, '23010926B', 'PART', , , 'OPEN', TRUE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23010926B-REJ-171426', '46266'::DATE, 'B', m.id, p.id, '23010926B', 'PART', , , 'N/A', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28010926A-001', '46266'::DATE, 'A', m.id, p.id, '28010926A', 'PART', , , 'PACKED', TRUE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28010926A-002', '46266'::DATE, 'A', m.id, p.id, '28010926A', 'PART', , , 'PACKED', TRUE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28010926A-REJ-171818', '46266'::DATE, 'A', m.id, p.id, '28010926A', 'PART', , , 'N/A', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28010926A-LUMP-171819', '46266'::DATE, 'A', m.id, p.id, '28010926A', 'PART', , , 'N/A', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-001', '46266'::DATE, 'A', m.id, p.id, '1A010926A', 'PART', , , 'PACKED', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-002', '46266'::DATE, 'A', m.id, p.id, '1A010926A', 'PART', , , 'PACKED', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-003', '46266'::DATE, 'A', m.id, p.id, '1A010926A', 'PART', , , 'PACKED', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-004', '46266'::DATE, 'A', m.id, p.id, '1A010926A', 'PART', , , 'PACKED', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-R01', '46266'::DATE, 'A', m.id, p.id, '1A010926A', 'RUNNER', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-R02', '46266'::DATE, 'A', m.id, p.id, '1A010926A', 'RUNNER', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-R03', '46266'::DATE, 'A', m.id, p.id, '1A010926A', 'RUNNER', , , 'OPEN', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-REJ-172540', '46266'::DATE, 'A', m.id, p.id, '1A010926A', 'PART', , , 'N/A', FALSE, '46266 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-001', '46267'::DATE, 'A', m.id, p.id, '20020926A', 'PART', , , 'OPEN', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-002', '46267'::DATE, 'A', m.id, p.id, '20020926A', 'PART', , , 'OPEN', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-003', '46267'::DATE, 'A', m.id, p.id, '20020926A', 'PART', , , 'OPEN', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-004', '46267'::DATE, 'A', m.id, p.id, '20020926A', 'PART', , , 'OPEN', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-005', '46267'::DATE, 'A', m.id, p.id, '20020926A', 'PART', , , 'OPEN', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-006', '46267'::DATE, 'A', m.id, p.id, '20020926A', 'PART', , , 'OPEN', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-R01', '46267'::DATE, 'A', m.id, p.id, '20020926A', 'RUNNER', , , 'OPEN', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-REJ-091746', '46267'::DATE, 'A', m.id, p.id, '20020926A', 'PART', , , 'N/A', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A020926A-001', '46267'::DATE, 'A', m.id, p.id, '1A020926A', 'PART', , , 'PACKED', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A020926A-002', '46267'::DATE, 'A', m.id, p.id, '1A020926A', 'PART', , , 'PACKED', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A020926A-003', '46267'::DATE, 'A', m.id, p.id, '1A020926A', 'PART', , , 'OPEN', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A020926A-R01', '46267'::DATE, 'A', m.id, p.id, '1A020926A', 'RUNNER', , , 'OPEN', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A020926A-R02', '46267'::DATE, 'A', m.id, p.id, '1A020926A', 'RUNNER', , , 'OPEN', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A020926A-REJ-092002', '46267'::DATE, 'A', m.id, p.id, '1A020926A', 'PART', , , 'N/A', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1020926A-001', '46267'::DATE, 'A', m.id, p.id, '1020926A', 'PART', , , 'PACKED', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1020926A-R01', '46267'::DATE, 'A', m.id, p.id, '1020926A', 'RUNNER', , , 'OPEN', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1020926A-REJ-092645', '46267'::DATE, 'A', m.id, p.id, '1020926A', 'PART', , , 'N/A', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23020926A-001', '46267'::DATE, 'A', m.id, p.id, '23020926A', 'PART', , , 'OPEN', TRUE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23020926A-REJ-092906', '46267'::DATE, 'A', m.id, p.id, '23020926A', 'PART', , , 'N/A', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2020926A-001', '46267'::DATE, 'A', m.id, p.id, 'P2020926A', 'PART', , , 'PACKED', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2020926A-002', '46267'::DATE, 'A', m.id, p.id, 'P2020926A', 'PART', , , 'PACKED', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2020926A-R01', '46267'::DATE, 'A', m.id, p.id, 'P2020926A', 'RUNNER', , , 'OPEN', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2020926A-REJ-111815', '46267'::DATE, 'A', m.id, p.id, 'P2020926A', 'PART', , , 'N/A', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2020926B-001', '46267'::DATE, 'B', m.id, p.id, 'P2020926B', 'PART', , , 'PACKED', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2020926B-R01', '46267'::DATE, 'B', m.id, p.id, 'P2020926B', 'RUNNER', , , 'OPEN', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2020926B-REJ-111907', '46267'::DATE, 'B', m.id, p.id, 'P2020926B', 'PART', , , 'N/A', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926A-001', '46267'::DATE, 'A', m.id, p.id, '28020926A', 'PART', , , 'PACKED', TRUE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926A-002', '46267'::DATE, 'A', m.id, p.id, '28020926A', 'PART', , , 'PACKED', TRUE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926A-003', '46267'::DATE, 'A', m.id, p.id, '28020926A', 'PART', , , 'PACKED', TRUE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926A-004', '46267'::DATE, 'A', m.id, p.id, '28020926A', 'PART', , , 'PACKED', TRUE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926A-REJ-112158', '46267'::DATE, 'A', m.id, p.id, '28020926A', 'PART', , , 'N/A', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926A-LUMP-112158', '46267'::DATE, 'A', m.id, p.id, '28020926A', 'PART', , , 'N/A', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926B-001', '46267'::DATE, 'B', m.id, p.id, '28020926B', 'PART', , , 'PACKED', TRUE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926B-002', '46267'::DATE, 'B', m.id, p.id, '28020926B', 'PART', , , 'PACKED', TRUE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926B-REJ-112253', '46267'::DATE, 'B', m.id, p.id, '28020926B', 'PART', , , 'N/A', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3020926A-001', '46267'::DATE, 'A', m.id, p.id, '3020926A', 'PART', , , 'PACKED', TRUE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3020926A-REJ-113253', '46267'::DATE, 'A', m.id, p.id, '3020926A', 'PART', , , 'N/A', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3020926A-LUMP-113253', '46267'::DATE, 'A', m.id, p.id, '3020926A', 'PART', , , 'N/A', FALSE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926B-003', '46267'::DATE, 'B', m.id, p.id, '28020926B', 'PART', , , 'PACKED', TRUE, '46267 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A310826A-001', '46265'::DATE, 'A', m.id, p.id, '1A310826A', 'PART', , , 'PACKED', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A310826A-002', '46265'::DATE, 'A', m.id, p.id, '1A310826A', 'PART', , , 'PACKED', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A310826A-R01', '46265'::DATE, 'A', m.id, p.id, '1A310826A', 'RUNNER', , , 'OPEN', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A310826A-REJ-163721', '46265'::DATE, 'A', m.id, p.id, '1A310826A', 'PART', , , 'N/A', FALSE, '46265 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '18260826A-001', '46260'::DATE, 'A', m.id, p.id, '18260826A', 'PART', , , 'PACKED', TRUE, '46260 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'QQVBA W' OR p.shrp_part_code = 'QQVBA W')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '18270826A-001', '46261'::DATE, 'A', m.id, p.id, '18270826A', 'PART', , , 'PACKED', TRUE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'QQVBA W' OR p.shrp_part_code = 'QQVBA W')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '18270826A-002', '46261'::DATE, 'A', m.id, p.id, '18270826A', 'PART', , , 'PACKED', TRUE, '46261 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'QQVBA W' OR p.shrp_part_code = 'QQVBA W')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28280826A-001', '46262'::DATE, 'A', m.id, p.id, '28280826A', 'PART', , , 'PACKED', TRUE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28280826A-002', '46262'::DATE, 'A', m.id, p.id, '28280826A', 'PART', , , 'PACKED', TRUE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28280826A-003', '46262'::DATE, 'A', m.id, p.id, '28280826A', 'PART', , , 'PACKED', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8250826A-001', '46259'::DATE, 'A', m.id, p.id, '8250826A', 'PART', , , 'PACKED', TRUE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8250826A-002', '46259'::DATE, 'A', m.id, p.id, '8250826A', 'PART', , , 'PACKED', TRUE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8250826A-003', '46259'::DATE, 'A', m.id, p.id, '8250826A', 'PART', , , 'PACKED', TRUE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8250826A-004', '46259'::DATE, 'A', m.id, p.id, '8250826A', 'PART', , , 'PACKED', TRUE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8250826A-005', '46259'::DATE, 'A', m.id, p.id, '8250826A', 'PART', , , 'PACKED', TRUE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8250826A-REJ-171006', '46259'::DATE, 'A', m.id, p.id, '8250826A', 'PART', , , 'N/A', FALSE, '46259 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20030926A-001', '46268'::DATE, 'A', m.id, p.id, '20030926A', 'PART', , , 'OPEN', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20030926A-R01', '46268'::DATE, 'A', m.id, p.id, '20030926A', 'RUNNER', , , 'OPEN', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20030926A-REJ-174215', '46268'::DATE, 'A', m.id, p.id, '20030926A', 'PART', , , 'N/A', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-001', '46268'::DATE, 'A', m.id, p.id, '1030926A', 'PART', , , 'PACKED', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-002', '46268'::DATE, 'A', m.id, p.id, '1030926A', 'PART', , , 'PACKED', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-003', '46268'::DATE, 'A', m.id, p.id, '1030926A', 'PART', , , 'INSPECTED', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-R01', '46268'::DATE, 'A', m.id, p.id, '1030926A', 'RUNNER', , , 'OPEN', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-R02', '46268'::DATE, 'A', m.id, p.id, '1030926A', 'RUNNER', , , 'OPEN', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3030926A-001', '46268'::DATE, 'A', m.id, p.id, '3030926A', 'PART', , , 'PACKED', TRUE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3030926A-002', '46268'::DATE, 'A', m.id, p.id, '3030926A', 'PART', , , 'PACKED', TRUE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3030926A-003', '46268'::DATE, 'A', m.id, p.id, '3030926A', 'PART', , , 'TRIMMED', TRUE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28030926A-001', '46268'::DATE, 'A', m.id, p.id, '28030926A', 'PART', , , 'PACKED', TRUE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3030926A-004', '46268'::DATE, 'A', m.id, p.id, '3030926A', 'PART', , , 'TRIMMED', TRUE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3030926A-REJ-110858', '46268'::DATE, 'A', m.id, p.id, '3030926A', 'PART', , , 'N/A', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10030926A-001', '46268'::DATE, 'A', m.id, p.id, '10030926A', 'PART', , , 'PACKED', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10030926A-R01', '46268'::DATE, 'A', m.id, p.id, '10030926A', 'RUNNER', , , 'OPEN', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10030926A-REJ-111105', '46268'::DATE, 'A', m.id, p.id, '10030926A', 'PART', , , 'N/A', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10030926A-LUMP-111105', '46268'::DATE, 'A', m.id, p.id, '10030926A', 'PART', , , 'N/A', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9030926A-001', '46268'::DATE, 'A', m.id, p.id, '9030926A', 'PART', , , 'PACKED', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9030926A-R01', '46268'::DATE, 'A', m.id, p.id, '9030926A', 'RUNNER', , , 'OPEN', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9030926A-REJ-111239', '46268'::DATE, 'A', m.id, p.id, '9030926A', 'PART', , , 'N/A', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2030926A-001', '46268'::DATE, 'A', m.id, p.id, 'P2030926A', 'PART', , , 'PACKED', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2030926A-R01', '46268'::DATE, 'A', m.id, p.id, 'P2030926A', 'RUNNER', , , 'OPEN', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2030926A-REJ-111358', '46268'::DATE, 'A', m.id, p.id, 'P2030926A', 'PART', , , 'N/A', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2030926A-LUMP-111358', '46268'::DATE, 'A', m.id, p.id, 'P2030926A', 'PART', , , 'N/A', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-004', '46268'::DATE, 'A', m.id, p.id, '1030926A', 'PART', , , 'INSPECTED', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-R01', '46268'::DATE, 'A', m.id, p.id, '1030926A', 'RUNNER', , , 'OPEN', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-REJ-112309', '46268'::DATE, 'A', m.id, p.id, '1030926A', 'PART', , , 'N/A', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-LUMP-112309', '46268'::DATE, 'A', m.id, p.id, '1030926A', 'PART', , , 'N/A', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28030926A-002', '46268'::DATE, 'A', m.id, p.id, '28030926A', 'PART', , , 'INSPECTED', TRUE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28030926A-003', '46268'::DATE, 'A', m.id, p.id, '28030926A', 'PART', , , 'TRIMMED', TRUE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926A-001', '46268'::DATE, 'A', m.id, p.id, 'B1030926A', 'PART', , , 'PACKED', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926A-002', '46268'::DATE, 'A', m.id, p.id, 'B1030926A', 'PART', , , 'PACKED', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926A-R01', '46268'::DATE, 'A', m.id, p.id, 'B1030926A', 'RUNNER', , , 'OPEN', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926A-R02', '46268'::DATE, 'A', m.id, p.id, 'B1030926A', 'RUNNER', , , 'OPEN', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926A-REJ-114039', '46268'::DATE, 'A', m.id, p.id, 'B1030926A', 'PART', , , 'N/A', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28030926A-004', '46268'::DATE, 'A', m.id, p.id, '28030926A', 'PART', , , 'TRIMMED', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28030926A-REJ-115713', '46268'::DATE, 'A', m.id, p.id, '28030926A', 'PART', , , 'N/A', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926B-001', '46268'::DATE, 'B', m.id, p.id, 'B1030926B', 'PART', , , 'PACKED', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926B-002', '46268'::DATE, 'B', m.id, p.id, 'B1030926B', 'PART', , , 'PACKED', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926B-R01', '46268'::DATE, 'B', m.id, p.id, 'B1030926B', 'RUNNER', , , 'OPEN', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926B-R02', '46268'::DATE, 'B', m.id, p.id, 'B1030926B', 'RUNNER', , , 'OPEN', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926B-REJ-115930', '46268'::DATE, 'B', m.id, p.id, 'B1030926B', 'PART', , , 'N/A', FALSE, '46268 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10040926A-001', '46269'::DATE, 'A', m.id, p.id, '10040926A', 'PART', , , 'INSPECTED', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10040926A-002', '46269'::DATE, 'A', m.id, p.id, '10040926A', 'PART', , , 'INSPECTED', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10040926A-R01', '46269'::DATE, 'A', m.id, p.id, '10040926A', 'RUNNER', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10040926A-REJ-112228', '46269'::DATE, 'A', m.id, p.id, '10040926A', 'PART', , , 'N/A', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2040926A-001', '46269'::DATE, 'A', m.id, p.id, 'P2040926A', 'PART', , , 'PACKED', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2040926A-R01', '46269'::DATE, 'A', m.id, p.id, 'P2040926A', 'RUNNER', , , 'N/A', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2040926A-REJ-112703', '46269'::DATE, 'A', m.id, p.id, 'P2040926A', 'PART', , , 'N/A', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1040926A-001', '46269'::DATE, 'A', m.id, p.id, 'B1040926A', 'PART', , , 'PACKED', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1040926A-002', '46269'::DATE, 'A', m.id, p.id, 'B1040926A', 'PART', , , 'PACKED', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1040926A-003', '46269'::DATE, 'A', m.id, p.id, 'B1040926A', 'PART', , , 'PACKED', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1040926A-R01', '46269'::DATE, 'A', m.id, p.id, 'B1040926A', 'RUNNER', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1040926A-R02', '46269'::DATE, 'A', m.id, p.id, 'B1040926A', 'RUNNER', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1040926A-R03', '46269'::DATE, 'A', m.id, p.id, 'B1040926A', 'RUNNER', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1040926A-REJ-113235', '46269'::DATE, 'A', m.id, p.id, 'B1040926A', 'PART', , , 'N/A', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-001', '46269'::DATE, 'A', m.id, p.id, '1040926A', 'PART', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-002', '46269'::DATE, 'A', m.id, p.id, '1040926A', 'PART', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-003', '46269'::DATE, 'A', m.id, p.id, '1040926A', 'PART', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-004', '46269'::DATE, 'A', m.id, p.id, '1040926A', 'PART', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-005', '46269'::DATE, 'A', m.id, p.id, '1040926A', 'PART', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-006', '46269'::DATE, 'A', m.id, p.id, '1040926A', 'PART', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-R01', '46269'::DATE, 'A', m.id, p.id, '1040926A', 'RUNNER', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-R02', '46269'::DATE, 'A', m.id, p.id, '1040926A', 'RUNNER', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-R03', '46269'::DATE, 'A', m.id, p.id, '1040926A', 'RUNNER', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-R04', '46269'::DATE, 'A', m.id, p.id, '1040926A', 'RUNNER', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-REJ-121140', '46269'::DATE, 'A', m.id, p.id, '1040926A', 'PART', , , 'N/A', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-LUMP-121140', '46269'::DATE, 'A', m.id, p.id, '1040926A', 'PART', , , 'N/A', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926B-001', '46269'::DATE, 'B', m.id, p.id, '1040926B', 'PART', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926B-002', '46269'::DATE, 'B', m.id, p.id, '1040926B', 'PART', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926B-003', '46269'::DATE, 'B', m.id, p.id, '1040926B', 'PART', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926B-R01', '46269'::DATE, 'B', m.id, p.id, '1040926B', 'RUNNER', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926B-R02', '46269'::DATE, 'B', m.id, p.id, '1040926B', 'RUNNER', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926B-REJ-121302', '46269'::DATE, 'B', m.id, p.id, '1040926B', 'PART', , , 'N/A', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16040926A-001', '46269'::DATE, 'A', m.id, p.id, '16040926A', 'PART', , , 'PACKED', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16040926A-002', '46269'::DATE, 'A', m.id, p.id, '16040926A', 'PART', , , 'PACKED', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16040926A-R01', '46269'::DATE, 'A', m.id, p.id, '16040926A', 'RUNNER', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16040926A-REJ-121744', '46269'::DATE, 'A', m.id, p.id, '16040926A', 'PART', , , 'N/A', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28040926A-001', '46269'::DATE, 'A', m.id, p.id, '28040926A', 'PART', , , 'TRIMMED', TRUE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28040926A-002', '46269'::DATE, 'A', m.id, p.id, '28040926A', 'PART', , , 'TRIMMED', TRUE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28040926A-003', '46269'::DATE, 'A', m.id, p.id, '28040926A', 'PART', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28040926A-REJ-122219', '46269'::DATE, 'A', m.id, p.id, '28040926A', 'PART', , , 'N/A', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9040926B-001', '46269'::DATE, 'B', m.id, p.id, '9040926B', 'PART', , , 'PACKED', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9040926B-R01', '46269'::DATE, 'B', m.id, p.id, '9040926B', 'RUNNER', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9040926B-REJ-123133', '46269'::DATE, 'B', m.id, p.id, '9040926B', 'PART', , , 'N/A', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9040926A-001', '46269'::DATE, 'A', m.id, p.id, '9040926A', 'PART', , , 'PACKED', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9040926A-002', '46269'::DATE, 'A', m.id, p.id, '9040926A', 'PART', , , 'PACKED', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9040926A-R01', '46269'::DATE, 'A', m.id, p.id, '9040926A', 'RUNNER', , , 'OPEN', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9040926A-REJ-125639', '46269'::DATE, 'A', m.id, p.id, '9040926A', 'PART', , , 'N/A', FALSE, '46269 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16050926A-001', '46270'::DATE, 'A', m.id, p.id, '16050926A', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16050926A-002', '46270'::DATE, 'A', m.id, p.id, '16050926A', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16050926A-003', '46270'::DATE, 'A', m.id, p.id, '16050926A', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16050926A-R01', '46270'::DATE, 'A', m.id, p.id, '16050926A', 'RUNNER', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16050926A-REJ-114901', '46270'::DATE, 'A', m.id, p.id, '16050926A', 'PART', , , 'N/A', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16050926A-LUMP-114903', '46270'::DATE, 'A', m.id, p.id, '16050926A', 'PART', , , 'N/A', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10050926A-001', '46270'::DATE, 'A', m.id, p.id, '10050926A', 'PART', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10050926A-002', '46270'::DATE, 'A', m.id, p.id, '10050926A', 'PART', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10050926A-R01', '46270'::DATE, 'A', m.id, p.id, '10050926A', 'RUNNER', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10050926A-REJ-115923', '46270'::DATE, 'A', m.id, p.id, '10050926A', 'PART', , , 'N/A', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10050926B-001', '46270'::DATE, 'B', m.id, p.id, '10050926B', 'PART', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10050926B-002', '46270'::DATE, 'B', m.id, p.id, '10050926B', 'PART', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10050926B-R01', '46270'::DATE, 'B', m.id, p.id, '10050926B', 'RUNNER', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9050926A-001', '46270'::DATE, 'A', m.id, p.id, '9050926A', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9050926A-R01', '46270'::DATE, 'A', m.id, p.id, '9050926A', 'RUNNER', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9050926A-REJ-120342', '46270'::DATE, 'A', m.id, p.id, '9050926A', 'PART', , , 'N/A', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '12050926A-001', '46270'::DATE, 'A', m.id, p.id, '12050926A', 'PART', , , 'PACKED', TRUE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UGKCA' OR p.shrp_part_code = 'UGKCA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '12050926A-002', '46270'::DATE, 'A', m.id, p.id, '12050926A', 'PART', , , 'PACKED', TRUE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UGKCA' OR p.shrp_part_code = 'UGKCA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '12050926A-REJ-120451', '46270'::DATE, 'A', m.id, p.id, '12050926A', 'PART', , , 'N/A', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UGKCA' OR p.shrp_part_code = 'UGKCA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1050926A-001', '46270'::DATE, 'A', m.id, p.id, 'B1050926A', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1050926A-R01', '46270'::DATE, 'A', m.id, p.id, 'B1050926A', 'RUNNER', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1050926A-R02', '46270'::DATE, 'A', m.id, p.id, 'B1050926A', 'RUNNER', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926A-001', '46270'::DATE, 'A', m.id, p.id, '25050926A', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926A-002', '46270'::DATE, 'A', m.id, p.id, '25050926A', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926A-003', '46270'::DATE, 'A', m.id, p.id, '25050926A', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926A-004', '46270'::DATE, 'A', m.id, p.id, '25050926A', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926A-R01', '46270'::DATE, 'A', m.id, p.id, '25050926A', 'RUNNER', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926A-REJ-120819', '46270'::DATE, 'A', m.id, p.id, '25050926A', 'PART', , , 'N/A', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-001', '46270'::DATE, 'B', m.id, p.id, '25050926B', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-002', '46270'::DATE, 'B', m.id, p.id, '25050926B', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-003', '46270'::DATE, 'B', m.id, p.id, '25050926B', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-004', '46270'::DATE, 'B', m.id, p.id, '25050926B', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-005', '46270'::DATE, 'B', m.id, p.id, '25050926B', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-006', '46270'::DATE, 'B', m.id, p.id, '25050926B', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-007', '46270'::DATE, 'B', m.id, p.id, '25050926B', 'PART', , , 'PACKED', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-R01', '46270'::DATE, 'B', m.id, p.id, '25050926B', 'RUNNER', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2050926A-001', '46270'::DATE, 'A', m.id, p.id, 'P2050926A', 'PART', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2050926A-R01', '46270'::DATE, 'A', m.id, p.id, 'P2050926A', 'RUNNER', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28050926A-001', '46270'::DATE, 'A', m.id, p.id, '28050926A', 'PART', , , 'OPEN', TRUE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28050926A-002', '46270'::DATE, 'A', m.id, p.id, '28050926A', 'PART', , , 'OPEN', TRUE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28050926A-003', '46270'::DATE, 'A', m.id, p.id, '28050926A', 'PART', , , 'OPEN', TRUE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28050926A-REJ-124226', '46270'::DATE, 'A', m.id, p.id, '28050926A', 'PART', , , 'N/A', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-001', '46270'::DATE, 'A', m.id, p.id, '1050926A', 'PART', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-002', '46270'::DATE, 'A', m.id, p.id, '1050926A', 'PART', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-003', '46270'::DATE, 'A', m.id, p.id, '1050926A', 'PART', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-004', '46270'::DATE, 'A', m.id, p.id, '1050926A', 'PART', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10070926A-REJ-095920', '46272'::DATE, 'A', m.id, p.id, '10070926A', 'PART', , , 'N/A', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-R02', '46270'::DATE, 'A', m.id, p.id, '1050926A', 'RUNNER', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-R03', '46270'::DATE, 'A', m.id, p.id, '1050926A', 'RUNNER', , , 'OPEN', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-REJ-125429', '46270'::DATE, 'A', m.id, p.id, '1050926A', 'PART', , , 'N/A', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-LUMP-125429', '46270'::DATE, 'A', m.id, p.id, '1050926A', 'PART', , , 'N/A', FALSE, '46270 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10070926A-921', '46272'::DATE, 'A', m.id, p.id, '10070926A', 'PART', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10070926A-922', '46272'::DATE, 'A', m.id, p.id, '10070926A', 'PART', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10070926A-R01', '46272'::DATE, 'A', m.id, p.id, '10070926A', 'RUNNER', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28070926A-001', '46272'::DATE, 'A', m.id, p.id, '28070926A', 'PART', , , 'OPEN', TRUE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28070926A-002', '46272'::DATE, 'A', m.id, p.id, '28070926A', 'PART', , , 'OPEN', TRUE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28070926A-003', '46272'::DATE, 'A', m.id, p.id, '28070926A', 'PART', , , 'OPEN', TRUE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22280826A-001', '46262'::DATE, 'A', m.id, p.id, '22280826A', 'PART', , , 'PACKED', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22280826A-002', '46262'::DATE, 'A', m.id, p.id, '22280826A', 'PART', , , 'PACKED', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22280826A-R01', '46262'::DATE, 'A', m.id, p.id, '22280826A', 'RUNNER', , , 'OPEN', FALSE, '46262 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-001', '46272'::DATE, 'A', m.id, p.id, '25070926A', 'PART', , , 'PACKED', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-002', '46272'::DATE, 'A', m.id, p.id, '25070926A', 'PART', , , 'PACKED', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-003', '46272'::DATE, 'A', m.id, p.id, '25070926A', 'PART', , , 'PACKED', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-004', '46272'::DATE, 'A', m.id, p.id, '25070926A', 'PART', , , 'PACKED', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-005', '46272'::DATE, 'A', m.id, p.id, '25070926A', 'PART', , , 'PACKED', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-006', '46272'::DATE, 'A', m.id, p.id, '25070926A', 'PART', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-007', '46272'::DATE, 'A', m.id, p.id, '25070926A', 'PART', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-R01', '46272'::DATE, 'A', m.id, p.id, '25070926A', 'RUNNER', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-001', '46272'::DATE, 'B', m.id, p.id, '25070926B', 'PART', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-002', '46272'::DATE, 'B', m.id, p.id, '25070926B', 'PART', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-003', '46272'::DATE, 'B', m.id, p.id, '25070926B', 'PART', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-004', '46272'::DATE, 'B', m.id, p.id, '25070926B', 'PART', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-005', '46272'::DATE, 'B', m.id, p.id, '25070926B', 'PART', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-006', '46272'::DATE, 'B', m.id, p.id, '25070926B', 'PART', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-007', '46272'::DATE, 'B', m.id, p.id, '25070926B', 'PART', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-008', '46272'::DATE, 'B', m.id, p.id, '25070926B', 'PART', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-R01', '46272'::DATE, 'B', m.id, p.id, '25070926B', 'RUNNER', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-REJ-122415', '46272'::DATE, 'B', m.id, p.id, '25070926B', 'PART', , , 'N/A', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926B-001', '46272'::DATE, 'B', m.id, p.id, '2070926B', 'PART', , , 'PACKED', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926B-002', '46272'::DATE, 'B', m.id, p.id, '2070926B', 'PART', , , 'PACKED', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926B-003', '46272'::DATE, 'B', m.id, p.id, '2070926B', 'PART', , , 'PACKED', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926B-R01', '46272'::DATE, 'B', m.id, p.id, '2070926B', 'RUNNER', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926A-001', '46272'::DATE, 'A', m.id, p.id, '2070926A', 'PART', , , 'PACKED', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926A-002', '46272'::DATE, 'A', m.id, p.id, '2070926A', 'PART', , , 'PACKED', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926A-003', '46272'::DATE, 'A', m.id, p.id, '2070926A', 'PART', , , 'PACKED', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926A-R01', '46272'::DATE, 'A', m.id, p.id, '2070926A', 'RUNNER', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926A-R02', '46272'::DATE, 'A', m.id, p.id, '2070926A', 'RUNNER', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926A-REJ-141745', '46272'::DATE, 'A', m.id, p.id, '2070926A', 'PART', , , 'N/A', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16070926A-001', '46272'::DATE, 'A', m.id, p.id, '16070926A', 'PART', , , 'PACKED', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16070926A-002', '46272'::DATE, 'A', m.id, p.id, '16070926A', 'PART', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16070926A-003', '46272'::DATE, 'A', m.id, p.id, '16070926A', 'PART', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16070926A-R01', '46272'::DATE, 'A', m.id, p.id, '16070926A', 'RUNNER', , , 'OPEN', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16070926A-REJ-142511', '46272'::DATE, 'A', m.id, p.id, '16070926A', 'PART', , , 'N/A', FALSE, '46272 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18080926A-001', '46273'::DATE, 'A', m.id, p.id, 'W18080926A', 'PART', , , 'PACKED', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18080926A-R01', '46273'::DATE, 'A', m.id, p.id, 'W18080926A', 'RUNNER', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18080926A-REJ-111104', '46273'::DATE, 'A', m.id, p.id, 'W18080926A', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18080926A-LUMP-111104', '46273'::DATE, 'A', m.id, p.id, 'W18080926A', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28080926A-001', '46273'::DATE, 'A', m.id, p.id, '28080926A', 'PART', , , 'OPEN', TRUE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28080926A-002', '46273'::DATE, 'A', m.id, p.id, '28080926A', 'PART', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28080926A-REJ-113245', '46273'::DATE, 'A', m.id, p.id, '28080926A', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10080926A-001', '46273'::DATE, 'A', m.id, p.id, '10080926A', 'PART', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10080926A-R01', '46273'::DATE, 'A', m.id, p.id, '10080926A', 'RUNNER', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10080926A-REJ-113750', '46273'::DATE, 'A', m.id, p.id, '10080926A', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926A-001', '46273'::DATE, 'A', m.id, p.id, '16080926A', 'PART', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926A-002', '46273'::DATE, 'A', m.id, p.id, '16080926A', 'PART', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926A-003', '46273'::DATE, 'A', m.id, p.id, '16080926A', 'PART', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926A-R01', '46273'::DATE, 'A', m.id, p.id, '16080926A', 'RUNNER', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926A-REJ-114401', '46273'::DATE, 'A', m.id, p.id, '16080926A', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926B-001', '46273'::DATE, 'B', m.id, p.id, '16080926B', 'PART', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926B-R01', '46273'::DATE, 'B', m.id, p.id, '16080926B', 'RUNNER', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926B-REJ-114535', '46273'::DATE, 'B', m.id, p.id, '16080926B', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926B-LUMP-114535', '46273'::DATE, 'B', m.id, p.id, '16080926B', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926A-001', '46273'::DATE, 'A', m.id, p.id, '9080926A', 'PART', , , 'PACKED', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926A-R01', '46273'::DATE, 'A', m.id, p.id, '9080926A', 'RUNNER', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926A-REJ-132229', '46273'::DATE, 'A', m.id, p.id, '9080926A', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926A-LUMP-132229', '46273'::DATE, 'A', m.id, p.id, '9080926A', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926B-001', '46273'::DATE, 'B', m.id, p.id, '9080926B', 'PART', , , 'PACKED', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926B-002', '46273'::DATE, 'B', m.id, p.id, '9080926B', 'PART', , , 'PACKED', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926B-R01', '46273'::DATE, 'B', m.id, p.id, '9080926B', 'RUNNER', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926B-REJ-132739', '46273'::DATE, 'B', m.id, p.id, '9080926B', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-001', '46273'::DATE, 'A', m.id, p.id, '25080926A', 'PART', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-002', '46273'::DATE, 'A', m.id, p.id, '25080926A', 'PART', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-003', '46273'::DATE, 'A', m.id, p.id, '25080926A', 'PART', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-004', '46273'::DATE, 'A', m.id, p.id, '25080926A', 'PART', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-005', '46273'::DATE, 'A', m.id, p.id, '25080926A', 'PART', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-006', '46273'::DATE, 'A', m.id, p.id, '25080926A', 'PART', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-R01', '46273'::DATE, 'A', m.id, p.id, '25080926A', 'RUNNER', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-REJ-141633', '46273'::DATE, 'A', m.id, p.id, '25080926A', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-LUMP-141633', '46273'::DATE, 'A', m.id, p.id, '25080926A', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-001', '46273'::DATE, 'A', m.id, p.id, '2080926A', 'PART', , , 'PACKED', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-002', '46273'::DATE, 'A', m.id, p.id, '2080926A', 'PART', , , 'PACKED', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-003', '46273'::DATE, 'A', m.id, p.id, '2080926A', 'PART', , , 'PACKED', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-004', '46273'::DATE, 'A', m.id, p.id, '2080926A', 'PART', , , 'PACKED', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-005', '46273'::DATE, 'A', m.id, p.id, '2080926A', 'PART', , , 'ON_HOLD', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-006', '46273'::DATE, 'A', m.id, p.id, '2080926A', 'PART', , , 'ON_HOLD', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-R01', '46273'::DATE, 'A', m.id, p.id, '2080926A', 'RUNNER', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-R02', '46273'::DATE, 'A', m.id, p.id, '2080926A', 'RUNNER', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-R03', '46273'::DATE, 'A', m.id, p.id, '2080926A', 'RUNNER', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-REJ-160415', '46273'::DATE, 'A', m.id, p.id, '2080926A', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926B-001', '46273'::DATE, 'B', m.id, p.id, '2080926B', 'PART', , , 'PACKED', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926B-002', '46273'::DATE, 'B', m.id, p.id, '2080926B', 'PART', , , 'PACKED', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926B-003', '46273'::DATE, 'B', m.id, p.id, '2080926B', 'PART', , , 'PACKED', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926B-004', '46273'::DATE, 'B', m.id, p.id, '2080926B', 'PART', , , 'PACKED', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926B-R01', '46273'::DATE, 'B', m.id, p.id, '2080926B', 'RUNNER', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926B-R02', '46273'::DATE, 'B', m.id, p.id, '2080926B', 'RUNNER', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926B-REJ-162708', '46273'::DATE, 'B', m.id, p.id, '2080926B', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45080926A-001', '46273'::DATE, 'A', m.id, p.id, '45080926A', 'PART', , , 'PACKED', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45080926A-002', '46273'::DATE, 'A', m.id, p.id, '45080926A', 'PART', , , 'PACKED', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45080926A-R01', '46273'::DATE, 'A', m.id, p.id, '45080926A', 'RUNNER', , , 'OPEN', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45080926A-REJ-162821', '46273'::DATE, 'A', m.id, p.id, '45080926A', 'PART', , , 'N/A', FALSE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926A-001', '46274'::DATE, 'A', m.id, p.id, '24090926A', 'PART', , , 'PACKED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926A-002', '46274'::DATE, 'A', m.id, p.id, '24090926A', 'PART', , , 'PACKED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926A-003', '46274'::DATE, 'A', m.id, p.id, '24090926A', 'PART', , , 'PACKED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926A-R01', '46274'::DATE, 'A', m.id, p.id, '24090926A', 'RUNNER', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926A-REJ-102128', '46274'::DATE, 'A', m.id, p.id, '24090926A', 'PART', , , 'N/A', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18090926A-001', '46274'::DATE, 'A', m.id, p.id, 'W18090926A', 'PART', , , 'INSPECTED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18090926A-002', '46274'::DATE, 'A', m.id, p.id, 'W18090926A', 'PART', , , 'TRIMMED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18090926A-R01', '46274'::DATE, 'A', m.id, p.id, 'W18090926A', 'RUNNER', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18090926A-REJ-110637', '46274'::DATE, 'A', m.id, p.id, 'W18090926A', 'PART', , , 'N/A', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18090926A-LUMP-110637', '46274'::DATE, 'A', m.id, p.id, 'W18090926A', 'PART', , , 'N/A', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9090926A-001', '46274'::DATE, 'A', m.id, p.id, '9090926A', 'PART', , , 'PACKED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9090926A-002', '46274'::DATE, 'A', m.id, p.id, '9090926A', 'PART', , , 'PACKED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9090926A-R01', '46274'::DATE, 'A', m.id, p.id, '9090926A', 'RUNNER', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9090926A-REJ-110826', '46274'::DATE, 'A', m.id, p.id, '9090926A', 'PART', , , 'N/A', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45090926A-001', '46274'::DATE, 'A', m.id, p.id, '45090926A', 'PART', , , 'PACKED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45090926A-002', '46274'::DATE, 'A', m.id, p.id, '45090926A', 'PART', , , 'PACKED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45090926A-R01', '46274'::DATE, 'A', m.id, p.id, '45090926A', 'RUNNER', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45090926A-REJ-110935', '46274'::DATE, 'A', m.id, p.id, '45090926A', 'PART', , , 'N/A', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2090926A-001', '46274'::DATE, 'A', m.id, p.id, 'P2090926A', 'PART', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2090926A-R01', '46274'::DATE, 'A', m.id, p.id, 'P2090926A', 'RUNNER', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2090926A-REJ-111122', '46274'::DATE, 'A', m.id, p.id, 'P2090926A', 'PART', , , 'N/A', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926A-001', '46274'::DATE, 'A', m.id, p.id, '33090926A', 'PART', , , 'PACKED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926A-002', '46274'::DATE, 'A', m.id, p.id, '33090926A', 'PART', , , 'PACKED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926A-R01', '46274'::DATE, 'A', m.id, p.id, '33090926A', 'RUNNER', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926A-R02', '46274'::DATE, 'A', m.id, p.id, '33090926A', 'RUNNER', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926A-REJ-111945', '46274'::DATE, 'A', m.id, p.id, '33090926A', 'PART', , , 'N/A', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926B-001', '46274'::DATE, 'B', m.id, p.id, '33090926B', 'PART', , , 'INSPECTED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926B-002', '46274'::DATE, 'B', m.id, p.id, '33090926B', 'PART', , , 'INSPECTED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926B-003', '46274'::DATE, 'B', m.id, p.id, '33090926B', 'PART', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926B-004', '46274'::DATE, 'B', m.id, p.id, '33090926B', 'PART', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926B-R01', '46274'::DATE, 'B', m.id, p.id, '33090926B', 'RUNNER', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926B-R02', '46274'::DATE, 'B', m.id, p.id, '33090926B', 'RUNNER', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926B-REJ-112158', '46274'::DATE, 'B', m.id, p.id, '33090926B', 'PART', , , 'N/A', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-001', '46274'::DATE, 'B', m.id, p.id, '24090926B', 'PART', , , 'PACKED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-002', '46274'::DATE, 'B', m.id, p.id, '24090926B', 'PART', , , 'PACKED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-003', '46274'::DATE, 'B', m.id, p.id, '24090926B', 'PART', , , 'PACKED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-004', '46274'::DATE, 'B', m.id, p.id, '24090926B', 'PART', , , 'PACKED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-005', '46274'::DATE, 'B', m.id, p.id, '24090926B', 'PART', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-006', '46274'::DATE, 'B', m.id, p.id, '24090926B', 'PART', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-R01', '46274'::DATE, 'B', m.id, p.id, '24090926B', 'RUNNER', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-REJ-112843', '46274'::DATE, 'B', m.id, p.id, '24090926B', 'PART', , , 'N/A', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16090926A-001', '46274'::DATE, 'A', m.id, p.id, '16090926A', 'PART', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16090926A-002', '46274'::DATE, 'A', m.id, p.id, '16090926A', 'PART', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16090926A-R01', '46274'::DATE, 'A', m.id, p.id, '16090926A', 'RUNNER', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16090926A-REJ-113027', '46274'::DATE, 'A', m.id, p.id, '16090926A', 'PART', , , 'N/A', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16090926A-LUMP-113027', '46274'::DATE, 'A', m.id, p.id, '16090926A', 'PART', , , 'N/A', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16100926A-001', '46275'::DATE, 'A', m.id, p.id, '16100926A', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16100926A-R01', '46275'::DATE, 'A', m.id, p.id, '16100926A', 'RUNNER', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16100926A-REJ-121136', '46275'::DATE, 'A', m.id, p.id, '16100926A', 'PART', , , 'N/A', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '5080926A-001', '46273'::DATE, 'A', m.id, p.id, '5080926A', 'PART', , , 'PACKED', TRUE, '46273 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 03' AND (p.part_code = 'F442 WB' OR p.shrp_part_code = 'F442 WB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '5090926A-001', '46274'::DATE, 'A', m.id, p.id, '5090926A', 'PART', , , 'PACKED', TRUE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 03' AND (p.part_code = 'F442 WB' OR p.shrp_part_code = 'F442 WB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '5090926A-REJ-123959', '46274'::DATE, 'A', m.id, p.id, '5090926A', 'PART', , , 'N/A', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 03' AND (p.part_code = 'F442 WB' OR p.shrp_part_code = 'F442 WB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2090926A-001', '46274'::DATE, 'A', m.id, p.id, '2090926A', 'PART', , , 'PACKED', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2090926A-R01', '46274'::DATE, 'A', m.id, p.id, '2090926A', 'RUNNER', , , 'OPEN', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2090926A-REJ-153421', '46274'::DATE, 'A', m.id, p.id, '2090926A', 'PART', , , 'N/A', FALSE, '46274 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9100926A-001', '46275'::DATE, 'A', m.id, p.id, '9100926A', 'PART', , , 'PACKED', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9100926A-002', '46275'::DATE, 'A', m.id, p.id, '9100926A', 'PART', , , 'PACKED', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9100926A-R01', '46275'::DATE, 'A', m.id, p.id, '9100926A', 'RUNNER', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9100926A-REJ-105504', '46275'::DATE, 'A', m.id, p.id, '9100926A', 'PART', , , 'N/A', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '47100926A-001', '46275'::DATE, 'A', m.id, p.id, '47100926A', 'PART', , , 'REWORK_INSPECTION', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'NDGAA' OR p.shrp_part_code = 'NDGAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '47100926A-002', '46275'::DATE, 'A', m.id, p.id, '47100926A', 'PART', , , 'REWORK_INSPECTION', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'NDGAA' OR p.shrp_part_code = 'NDGAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '47100926A-R01', '46275'::DATE, 'A', m.id, p.id, '47100926A', 'RUNNER', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'NDGAA' OR p.shrp_part_code = 'NDGAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '47100926A-REJ-105744', '46275'::DATE, 'A', m.id, p.id, '47100926A', 'PART', , , 'N/A', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'NDGAA' OR p.shrp_part_code = 'NDGAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2100926A-001', '46275'::DATE, 'A', m.id, p.id, 'P2100926A', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2100926A-R01', '46275'::DATE, 'A', m.id, p.id, 'P2100926A', 'RUNNER', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2100926A-REJ-105858', '46275'::DATE, 'A', m.id, p.id, 'P2100926A', 'PART', , , 'N/A', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33100926A-001', '46275'::DATE, 'A', m.id, p.id, '33100926A', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33100926A-002', '46275'::DATE, 'A', m.id, p.id, '33100926A', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33100926A-003', '46275'::DATE, 'A', m.id, p.id, '33100926A', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33100926A-004', '46275'::DATE, 'A', m.id, p.id, '33100926A', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33100926A-R01', '46275'::DATE, 'A', m.id, p.id, '33100926A', 'RUNNER', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33100926A-R02', '46275'::DATE, 'A', m.id, p.id, '33100926A', 'RUNNER', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33100926A-REJ-110103', '46275'::DATE, 'A', m.id, p.id, '33100926A', 'PART', , , 'N/A', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-001', '46275'::DATE, 'A', m.id, p.id, '24100926A', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-002', '46275'::DATE, 'A', m.id, p.id, '24100926A', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-003', '46275'::DATE, 'A', m.id, p.id, '24100926A', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-004', '46275'::DATE, 'A', m.id, p.id, '24100926A', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-005', '46275'::DATE, 'A', m.id, p.id, '24100926A', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-006', '46275'::DATE, 'A', m.id, p.id, '24100926A', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-R01', '46275'::DATE, 'A', m.id, p.id, '24100926A', 'RUNNER', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-REJ-110307', '46275'::DATE, 'A', m.id, p.id, '24100926A', 'PART', , , 'N/A', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-001', '46275'::DATE, 'B', m.id, p.id, '24100926B', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-002', '46275'::DATE, 'B', m.id, p.id, '24100926B', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-003', '46275'::DATE, 'B', m.id, p.id, '24100926B', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-004', '46275'::DATE, 'B', m.id, p.id, '24100926B', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-005', '46275'::DATE, 'B', m.id, p.id, '24100926B', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-006', '46275'::DATE, 'B', m.id, p.id, '24100926B', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-R01', '46275'::DATE, 'B', m.id, p.id, '24100926B', 'RUNNER', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-REJ-111224', '46275'::DATE, 'B', m.id, p.id, '24100926B', 'PART', , , 'N/A', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18100926A-001', '46275'::DATE, 'A', m.id, p.id, 'W18100926A', 'PART', , , 'TRIMMED', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18100926A-R01', '46275'::DATE, 'A', m.id, p.id, 'W18100926A', 'RUNNER', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18100926A-REJ-111852', '46275'::DATE, 'A', m.id, p.id, 'W18100926A', 'PART', , , 'N/A', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18100926A-LUMP-111852', '46275'::DATE, 'A', m.id, p.id, 'W18100926A', 'PART', , , 'N/A', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926A-001', '46275'::DATE, 'A', m.id, p.id, '27100926A', 'PART', , , 'PACKED', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926A-002', '46275'::DATE, 'A', m.id, p.id, '27100926A', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926A-R01', '46275'::DATE, 'A', m.id, p.id, '27100926A', 'RUNNER', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926A-REJ-115916', '46275'::DATE, 'A', m.id, p.id, '27100926A', 'PART', , , 'N/A', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926A-LUMP-115916', '46275'::DATE, 'A', m.id, p.id, '27100926A', 'PART', , , 'N/A', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926B-001', '46275'::DATE, 'B', m.id, p.id, '27100926B', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926B-002', '46275'::DATE, 'B', m.id, p.id, '27100926B', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926B-003', '46275'::DATE, 'B', m.id, p.id, '27100926B', 'PART', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926B-R01', '46275'::DATE, 'B', m.id, p.id, '27100926B', 'RUNNER', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926B-REJ-120050', '46275'::DATE, 'B', m.id, p.id, '27100926B', 'PART', , , 'N/A', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33110926A-001', '46276'::DATE, 'A', m.id, p.id, '33110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33110926A-002', '46276'::DATE, 'A', m.id, p.id, '33110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33110926A-R01', '46276'::DATE, 'A', m.id, p.id, '33110926A', 'RUNNER', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33110926A-REJ-174254', '46276'::DATE, 'A', m.id, p.id, '33110926A', 'PART', , , 'N/A', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '5100926A-001', '46275'::DATE, 'A', m.id, p.id, '5100926A', 'PART', , , 'PACKED', TRUE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 03' AND (p.part_code = 'F442 WB' OR p.shrp_part_code = 'F442 WB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9100926A-001', '46275'::DATE, 'A', m.id, p.id, 'B9100926A', 'PART', , , 'PACKED', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9100926A-002', '46275'::DATE, 'A', m.id, p.id, 'B9100926A', 'PART', , , 'PACKED', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9100926A-R01', '46275'::DATE, 'A', m.id, p.id, 'B9100926A', 'RUNNER', , , 'OPEN', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9100926A-REJ-093423', '46275'::DATE, 'A', m.id, p.id, 'B9100926A', 'PART', , , 'N/A', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9100926A-LUMP-093423', '46275'::DATE, 'A', m.id, p.id, 'B9100926A', 'PART', , , 'N/A', FALSE, '46275 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '46110926A-001', '46276'::DATE, 'A', m.id, p.id, '46110926A', 'PART', , , 'INSPECTED', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '46110926A-002', '46276'::DATE, 'A', m.id, p.id, '46110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '46110926A-R01', '46276'::DATE, 'A', m.id, p.id, '46110926A', 'RUNNER', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '46110926A-REJ-112323', '46276'::DATE, 'A', m.id, p.id, '46110926A', 'PART', , , 'N/A', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1110926A-001', '46276'::DATE, 'A', m.id, p.id, 'P1110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1110926A-002', '46276'::DATE, 'A', m.id, p.id, 'P1110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1110926A-003', '46276'::DATE, 'A', m.id, p.id, 'P1110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1110926A-R01', '46276'::DATE, 'A', m.id, p.id, 'P1110926A', 'RUNNER', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1110926A-REJ-112531', '46276'::DATE, 'A', m.id, p.id, 'P1110926A', 'PART', , , 'N/A', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926A-001', '46276'::DATE, 'A', m.id, p.id, '21110926A', 'PART', , , 'PACKED', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926A-002', '46276'::DATE, 'A', m.id, p.id, '21110926A', 'PART', , , 'PACKED', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926A-R01', '46276'::DATE, 'A', m.id, p.id, '21110926A', 'RUNNER', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926A-REJ-114622', '46276'::DATE, 'A', m.id, p.id, '21110926A', 'PART', , , 'N/A', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926B-001', '46276'::DATE, 'B', m.id, p.id, '21110926B', 'PART', , , 'INSPECTED', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926B-002', '46276'::DATE, 'B', m.id, p.id, '21110926B', 'PART', , , 'TRIMMED', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926B-003', '46276'::DATE, 'B', m.id, p.id, '21110926B', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926B-004', '46276'::DATE, 'B', m.id, p.id, '21110926B', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926B-005', '46276'::DATE, 'B', m.id, p.id, '21110926B', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926B-R01', '46276'::DATE, 'B', m.id, p.id, '21110926B', 'RUNNER', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926B-REJ-114733', '46276'::DATE, 'B', m.id, p.id, '21110926B', 'PART', , , 'N/A', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-001', '46276'::DATE, 'A', m.id, p.id, '24110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-002', '46276'::DATE, 'A', m.id, p.id, '24110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-003', '46276'::DATE, 'A', m.id, p.id, '24110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-004', '46276'::DATE, 'A', m.id, p.id, '24110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-005', '46276'::DATE, 'A', m.id, p.id, '24110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-006', '46276'::DATE, 'A', m.id, p.id, '24110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-R01', '46276'::DATE, 'A', m.id, p.id, '24110926A', 'RUNNER', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-R02', '46276'::DATE, 'A', m.id, p.id, '24110926A', 'RUNNER', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-REJ-114957', '46276'::DATE, 'A', m.id, p.id, '24110926A', 'PART', , , 'N/A', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-001', '46276'::DATE, 'B', m.id, p.id, '24110926B', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-002', '46276'::DATE, 'B', m.id, p.id, '24110926B', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-003', '46276'::DATE, 'B', m.id, p.id, '24110926B', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-004', '46276'::DATE, 'B', m.id, p.id, '24110926B', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-005', '46276'::DATE, 'B', m.id, p.id, '24110926B', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-006', '46276'::DATE, 'B', m.id, p.id, '24110926B', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-R01', '46276'::DATE, 'B', m.id, p.id, '24110926B', 'RUNNER', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-REJ-115115', '46276'::DATE, 'B', m.id, p.id, '24110926B', 'PART', , , 'N/A', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27110926A-001', '46276'::DATE, 'A', m.id, p.id, '27110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27110926A-002', '46276'::DATE, 'A', m.id, p.id, '27110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27110926A-R01', '46276'::DATE, 'A', m.id, p.id, '27110926A', 'RUNNER', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27110926A-REJ-115347', '46276'::DATE, 'A', m.id, p.id, '27110926A', 'PART', , , 'N/A', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9110926A-001', '46276'::DATE, 'A', m.id, p.id, 'B9110926A', 'PART', , , 'PACKED', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9110926A-002', '46276'::DATE, 'A', m.id, p.id, 'B9110926A', 'PART', , , 'INSPECTED', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9110926A-003', '46276'::DATE, 'A', m.id, p.id, 'B9110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9110926A-R01', '46276'::DATE, 'A', m.id, p.id, 'B9110926A', 'RUNNER', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9110926A-REJ-160007', '46276'::DATE, 'A', m.id, p.id, 'B9110926A', 'PART', , , 'N/A', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9110926A-001', '46276'::DATE, 'A', m.id, p.id, '9110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9110926A-002', '46276'::DATE, 'A', m.id, p.id, '9110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9110926A-R01', '46276'::DATE, 'A', m.id, p.id, '9110926A', 'RUNNER', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9110926A-REJ-160156', '46276'::DATE, 'A', m.id, p.id, '9110926A', 'PART', , , 'N/A', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9110926B-001', '46276'::DATE, 'B', m.id, p.id, '9110926B', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9110926B-R01', '46276'::DATE, 'B', m.id, p.id, '9110926B', 'RUNNER', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9110926B-REJ-160235', '46276'::DATE, 'B', m.id, p.id, '9110926B', 'PART', , , 'N/A', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '110926A-001', '46276'::DATE, 'A', m.id, p.id, '110926A', 'PART', , , 'PACKED', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '110926A-002', '46276'::DATE, 'A', m.id, p.id, '110926A', 'PART', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '110926A-R01', '46276'::DATE, 'A', m.id, p.id, '110926A', 'RUNNER', , , 'OPEN', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '110926A-REJ-161143', '46276'::DATE, 'A', m.id, p.id, '110926A', 'PART', , , 'N/A', FALSE, '46276 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W14120926A-001', '46277'::DATE, 'A', m.id, p.id, 'W14120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W14120926A-R01', '46277'::DATE, 'A', m.id, p.id, 'W14120926A', 'RUNNER', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W14120926A-REJ-170640', '46277'::DATE, 'A', m.id, p.id, 'W14120926A', 'PART', , , 'N/A', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W15120926A-001', '46277'::DATE, 'A', m.id, p.id, 'W15120926A', 'PART', , , 'PACKED', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W15120926A-002', '46277'::DATE, 'A', m.id, p.id, 'W15120926A', 'PART', , , 'INSPECTED', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9120926A-001', '46277'::DATE, 'A', m.id, p.id, '9120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9120926A-002', '46277'::DATE, 'A', m.id, p.id, '9120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9120926A-R01', '46277'::DATE, 'A', m.id, p.id, '9120926A', 'RUNNER', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9120926A-REJ-105427', '46277'::DATE, 'A', m.id, p.id, '9120926A', 'PART', , , 'N/A', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926A-001', '46277'::DATE, 'A', m.id, p.id, '2120926A', 'PART', , , 'INSPECTED', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926A-R01', '46277'::DATE, 'A', m.id, p.id, '2120926A', 'RUNNER', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926A-REJ-105629', '46277'::DATE, 'A', m.id, p.id, '2120926A', 'PART', , , 'N/A', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-001', '46277'::DATE, 'B', m.id, p.id, '2120926B', 'PART', , , 'INSPECTED', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-002', '46277'::DATE, 'B', m.id, p.id, '2120926B', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-003', '46277'::DATE, 'B', m.id, p.id, '2120926B', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-004', '46277'::DATE, 'B', m.id, p.id, '2120926B', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-005', '46277'::DATE, 'B', m.id, p.id, '2120926B', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-006', '46277'::DATE, 'B', m.id, p.id, '2120926B', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-R01', '46277'::DATE, 'B', m.id, p.id, '2120926B', 'RUNNER', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-R02', '46277'::DATE, 'B', m.id, p.id, '2120926B', 'RUNNER', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-R03', '46277'::DATE, 'B', m.id, p.id, '2120926B', 'RUNNER', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-R04', '46277'::DATE, 'B', m.id, p.id, '2120926B', 'RUNNER', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926A-001', '46277'::DATE, 'A', m.id, p.id, '8120926A', 'PART', , , 'OPEN', TRUE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926A-002', '46277'::DATE, 'A', m.id, p.id, '8120926A', 'PART', , , 'OPEN', TRUE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926A-003', '46277'::DATE, 'A', m.id, p.id, '8120926A', 'PART', , , 'OPEN', TRUE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926A-REJ-110326', '46277'::DATE, 'A', m.id, p.id, '8120926A', 'PART', , , 'N/A', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-001', '46277'::DATE, 'B', m.id, p.id, '8120926B', 'PART', , , 'OPEN', TRUE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-002', '46277'::DATE, 'B', m.id, p.id, '8120926B', 'PART', , , 'OPEN', TRUE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-003', '46277'::DATE, 'B', m.id, p.id, '8120926B', 'PART', , , 'OPEN', TRUE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-004', '46277'::DATE, 'B', m.id, p.id, '8120926B', 'PART', , , 'OPEN', TRUE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-005', '46277'::DATE, 'B', m.id, p.id, '8120926B', 'PART', , , 'OPEN', TRUE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-006', '46277'::DATE, 'B', m.id, p.id, '8120926B', 'PART', , , 'OPEN', TRUE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-007', '46277'::DATE, 'B', m.id, p.id, '8120926B', 'PART', , , 'OPEN', TRUE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-008', '46277'::DATE, 'B', m.id, p.id, '8120926B', 'PART', , , 'OPEN', TRUE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-REJ-110947', '46277'::DATE, 'B', m.id, p.id, '8120926B', 'PART', , , 'N/A', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-LUMP-110947', '46277'::DATE, 'B', m.id, p.id, '8120926B', 'PART', , , 'N/A', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '46120926A-001', '46277'::DATE, 'A', m.id, p.id, '46120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '46120926A-R01', '46277'::DATE, 'A', m.id, p.id, '46120926A', 'RUNNER', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '46120926A-REJ-111500', '46277'::DATE, 'A', m.id, p.id, '46120926A', 'PART', , , 'N/A', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-001', '46277'::DATE, 'A', m.id, p.id, '21120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-002', '46277'::DATE, 'A', m.id, p.id, '21120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-003', '46277'::DATE, 'A', m.id, p.id, '21120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-004', '46277'::DATE, 'A', m.id, p.id, '21120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-005', '46277'::DATE, 'A', m.id, p.id, '21120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-006', '46277'::DATE, 'A', m.id, p.id, '21120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-R01', '46277'::DATE, 'A', m.id, p.id, '21120926A', 'RUNNER', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-REJ-112612', '46277'::DATE, 'A', m.id, p.id, '21120926A', 'PART', , , 'N/A', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-001', '46277'::DATE, 'A', m.id, p.id, '14120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-002', '46277'::DATE, 'A', m.id, p.id, '14120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-003', '46277'::DATE, 'A', m.id, p.id, '14120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-004', '46277'::DATE, 'A', m.id, p.id, '14120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-005', '46277'::DATE, 'A', m.id, p.id, '14120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-R01', '46277'::DATE, 'A', m.id, p.id, '14120926A', 'RUNNER', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-REJ-112741', '46277'::DATE, 'A', m.id, p.id, '14120926A', 'PART', , , 'N/A', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-LUMP-112741', '46277'::DATE, 'A', m.id, p.id, '14120926A', 'PART', , , 'N/A', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9120926A-001', '46277'::DATE, 'A', m.id, p.id, 'B9120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9120926A-002', '46277'::DATE, 'A', m.id, p.id, 'B9120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9120926A-003', '46277'::DATE, 'A', m.id, p.id, 'B9120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9120926A-R01', '46277'::DATE, 'A', m.id, p.id, 'B9120926A', 'RUNNER', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9120926A-REJ-112859', '46277'::DATE, 'A', m.id, p.id, 'B9120926A', 'PART', , , 'N/A', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W15120926A-003', '46277'::DATE, 'A', m.id, p.id, 'W15120926A', 'PART', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W15120926A-R01', '46277'::DATE, 'A', m.id, p.id, 'W15120926A', 'RUNNER', , , 'OPEN', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W15120926A-REJ-113216', '46277'::DATE, 'A', m.id, p.id, 'W15120926A', 'PART', , , 'N/A', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC')
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W15120926A-LUMP-113216', '46277'::DATE, 'A', m.id, p.id, 'W15120926A', 'PART', , , 'N/A', FALSE, '46277 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC')
ON CONFLICT (bag_code) DO NOTHING;
COMMIT;
