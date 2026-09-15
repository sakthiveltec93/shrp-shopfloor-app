-- ===========================================================
-- Incremental Sync of Newly Added Logs from FORM ENTRY 26-271.xlsm
-- Idempotent: Only inserts new log records without altering masters
-- ===========================================================
BEGIN;

-- 1. Bags Sync (765 total in sheet)
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34240826A-001', '2026-08-24'::DATE, 'A', m.id, p.id, '34240826A', 'PART', 7.1, 993, 'OPEN', FALSE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC' OR p.customer_part_no = 'LBC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34240826A-002', '2026-08-24'::DATE, 'A', m.id, p.id, '34240826A', 'PART', 8.5, 1189, 'OPEN', FALSE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC' OR p.customer_part_no = 'LBC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34240826A-003', '2026-08-24'::DATE, 'A', m.id, p.id, '34240826A', 'PART', 5.87, 821, 'OPEN', FALSE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC' OR p.customer_part_no = 'LBC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34240826A-R01', '2026-08-24'::DATE, 'A', m.id, p.id, '34240826A', 'RUNNER', 3.88, 0, 'OPEN', FALSE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC' OR p.customer_part_no = 'LBC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34240826A-R02', '2026-08-24'::DATE, 'A', m.id, p.id, '34240826A', 'RUNNER', 2.43, 0, 'OPEN', FALSE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC' OR p.customer_part_no = 'LBC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '4240826A-001', '2026-08-24'::DATE, 'A', m.id, p.id, '4240826A', 'PART', 6.25, 1443, 'INSPECTED', FALSE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F442 KQ' OR p.shrp_part_code = 'F442 KQ' OR p.customer_part_no = 'F442 KQ')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '4240826A-002', '2026-08-24'::DATE, 'A', m.id, p.id, '4240826A', 'PART', 5.93, 1370, 'OPEN', FALSE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F442 KQ' OR p.shrp_part_code = 'F442 KQ' OR p.customer_part_no = 'F442 KQ')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '4240826A-003', '2026-08-24'::DATE, 'A', m.id, p.id, '4240826A', 'PART', 5.17, 1194, 'TRIMMED', FALSE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F442 KQ' OR p.shrp_part_code = 'F442 KQ' OR p.customer_part_no = 'F442 KQ')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '4240826A-R01', '2026-08-24'::DATE, 'A', m.id, p.id, '4240826A', 'RUNNER', 3.11, 0, 'OPEN', FALSE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F442 KQ' OR p.shrp_part_code = 'F442 KQ' OR p.customer_part_no = 'F442 KQ')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29240826A-001', '2026-08-24'::DATE, 'A', m.id, p.id, '29240826A', 'PART', 4.87, 2155, 'PACKED', TRUE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800' OR p.customer_part_no = '2800')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29240826A-002', '2026-08-24'::DATE, 'A', m.id, p.id, '29240826A', 'PART', 4.27, 1889, 'PACKED', TRUE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800' OR p.customer_part_no = '2800')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29240826A-003', '2026-08-24'::DATE, 'A', m.id, p.id, '29240826A', 'PART', 4.89, 2164, 'PACKED', TRUE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800' OR p.customer_part_no = '2800')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29240826B-001', '2026-08-24'::DATE, 'B', m.id, p.id, '29240826B', 'PART', 4.35, 1582, 'PACKED', TRUE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800' OR p.customer_part_no = '2800')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29240826B-002', '2026-08-24'::DATE, 'B', m.id, p.id, '29240826B', 'PART', 4.59, 1669, 'OPEN', TRUE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800' OR p.customer_part_no = '2800')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29240826B-003', '2026-08-24'::DATE, 'B', m.id, p.id, '29240826B', 'PART', 4.73, 1720, 'OPEN', TRUE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800' OR p.customer_part_no = '2800')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29240826B-004', '2026-08-24'::DATE, 'B', m.id, p.id, '29240826B', 'PART', 5.3, 1927, 'OPEN', TRUE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800' OR p.customer_part_no = '2800')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '18240826B-001', '2026-08-24'::DATE, 'B', m.id, p.id, '18240826B', 'PART', 4.79, 2083, 'PACKED', TRUE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'QQVBA W' OR p.shrp_part_code = 'QQVBA W' OR p.customer_part_no = 'QQVBA W')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '18240826B-002', '2026-08-24'::DATE, 'B', m.id, p.id, '18240826B', 'PART', 1.48, 643, 'PACKED', TRUE, '2026-08-24 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'QQVBA W' OR p.shrp_part_code = 'QQVBA W' OR p.customer_part_no = 'QQVBA W')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30250826A-001', '2026-08-25'::DATE, 'A', m.id, p.id, '30250826A', 'PART', 1.67, 668, 'PACKED', TRUE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826A-001', '2026-08-25'::DATE, 'A', m.id, p.id, '35250826A', 'PART', 10.33, 2327, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826A-002', '2026-08-25'::DATE, 'A', m.id, p.id, '35250826A', 'PART', 10, 2252, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826A-003', '2026-08-25'::DATE, 'A', m.id, p.id, '35250826A', 'PART', 9.61, 2164, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826A-R01', '2026-08-25'::DATE, 'A', m.id, p.id, '35250826A', 'RUNNER', 9.69, 0, 'OPEN', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '7250826A-001', '2026-08-25'::DATE, 'A', m.id, p.id, '7250826A', 'PART', 8.5, 2471, 'OPEN', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'F710' OR p.shrp_part_code = 'F710' OR p.customer_part_no = 'F710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '7250826A-002', '2026-08-25'::DATE, 'A', m.id, p.id, '7250826A', 'PART', 2.66, 773, 'OPEN', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'F710' OR p.shrp_part_code = 'F710' OR p.customer_part_no = 'F710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '7250826A-R01', '2026-08-25'::DATE, 'A', m.id, p.id, '7250826A', 'RUNNER', 1.3, 0, 'OPEN', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'F710' OR p.shrp_part_code = 'F710' OR p.customer_part_no = 'F710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-001', '2026-08-25'::DATE, 'B', m.id, p.id, '35250826B', 'PART', 9.95, 2241, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-002', '2026-08-25'::DATE, 'B', m.id, p.id, '35250826B', 'PART', 10.44, 2351, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-003', '2026-08-25'::DATE, 'B', m.id, p.id, '35250826B', 'PART', 11.38, 2563, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-004', '2026-08-25'::DATE, 'B', m.id, p.id, '35250826B', 'PART', 13.53, 3047, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-005', '2026-08-25'::DATE, 'B', m.id, p.id, '35250826B', 'PART', 13.06, 2941, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-006', '2026-08-25'::DATE, 'B', m.id, p.id, '35250826B', 'PART', 10.92, 2459, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-R01', '2026-08-25'::DATE, 'B', m.id, p.id, '35250826B', 'RUNNER', 4.8, 0, 'OPEN', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35250826B-R02', '2026-08-25'::DATE, 'B', m.id, p.id, '35250826B', 'RUNNER', 15.7, 0, 'OPEN', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34250826A-001', '2026-08-25'::DATE, 'A', m.id, p.id, '34250826A', 'PART', 7.25, 1014, 'OPEN', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC' OR p.customer_part_no = 'LBC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34250826A-002', '2026-08-25'::DATE, 'A', m.id, p.id, '34250826A', 'PART', 6.38, 892, 'OPEN', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC' OR p.customer_part_no = 'LBC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34250826A-003', '2026-08-25'::DATE, 'A', m.id, p.id, '34250826A', 'PART', 6.62, 926, 'OPEN', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC' OR p.customer_part_no = 'LBC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34250826A-R01', '2026-08-25'::DATE, 'A', m.id, p.id, '34250826A', 'RUNNER', 4.33, 0, 'OPEN', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC' OR p.customer_part_no = 'LBC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '34250826A-R02', '2026-08-25'::DATE, 'A', m.id, p.id, '34250826A', 'RUNNER', 1.76, 0, 'OPEN', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC' OR p.customer_part_no = 'LBC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '29250826A-001', '2026-08-25'::DATE, 'A', m.id, p.id, '29250826A', 'PART', 1.26, 462, 'OPEN', TRUE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800' OR p.customer_part_no = '2800')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826A-001', '2026-08-25'::DATE, 'A', m.id, p.id, '28250826A', 'PART', 4.02, 2481, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826A-002', '2026-08-25'::DATE, 'A', m.id, p.id, '28250826A', 'PART', 1.08, 667, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826A-003', '2026-08-25'::DATE, 'A', m.id, p.id, '28250826A', 'PART', 1.09, 673, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826A-004', '2026-08-25'::DATE, 'A', m.id, p.id, '28250826A', 'PART', 0.99, 611, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826A-R01', '2026-08-25'::DATE, 'A', m.id, p.id, '28250826A', 'RUNNER', 0.93, 0, 'OPEN', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826B-001', '2026-08-25'::DATE, 'B', m.id, p.id, '28250826B', 'PART', 6.9, 4259, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826B-002', '2026-08-25'::DATE, 'B', m.id, p.id, '28250826B', 'PART', 2.96, 1827, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826B-003', '2026-08-25'::DATE, 'B', m.id, p.id, '28250826B', 'PART', 2.13, 1315, 'PACKED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28250826B-R01', '2026-08-25'::DATE, 'B', m.id, p.id, '28250826B', 'RUNNER', 2, 0, 'OPEN', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8260826A-001', '2026-08-26'::DATE, 'A', m.id, p.id, '8260826A', 'PART', 5.43, 1398, 'PACKED', TRUE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8260826A-002', '2026-08-26'::DATE, 'A', m.id, p.id, '8260826A', 'PART', 4.77, 1228, 'PACKED', TRUE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8260826A-003', '2026-08-26'::DATE, 'A', m.id, p.id, '8260826A', 'PART', 5.18, 1334, 'PACKED', TRUE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8260826A-004', '2026-08-26'::DATE, 'A', m.id, p.id, '8260826A', 'PART', 5.82, 1499, 'PACKED', TRUE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8260826A-005', '2026-08-26'::DATE, 'A', m.id, p.id, '8260826A', 'PART', 1.87, 482, 'PACKED', TRUE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30260826A-001', '2026-08-26'::DATE, 'A', m.id, p.id, '30260826A', 'PART', 4.3, 1755, 'PACKED', TRUE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30260826A-002', '2026-08-26'::DATE, 'A', m.id, p.id, '30260826A', 'PART', 4.8, 1959, 'PACKED', TRUE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30260826A-003', '2026-08-26'::DATE, 'A', m.id, p.id, '30260826A', 'PART', 5.14, 2098, 'PACKED', TRUE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30260826A-004', '2026-08-26'::DATE, 'A', m.id, p.id, '30260826A', 'PART', 3.21, 1310, 'PACKED', TRUE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-001', '2026-08-26'::DATE, 'A', m.id, p.id, '35260826A', 'PART', 9.76, 2198, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-002', '2026-08-26'::DATE, 'A', m.id, p.id, '35260826A', 'PART', 9.61, 2164, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-003', '2026-08-26'::DATE, 'A', m.id, p.id, '35260826A', 'PART', 9.57, 2155, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-004', '2026-08-26'::DATE, 'A', m.id, p.id, '35260826A', 'PART', 9.24, 2081, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-005', '2026-08-26'::DATE, 'A', m.id, p.id, '35260826A', 'PART', 10.02, 2257, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-006', '2026-08-26'::DATE, 'A', m.id, p.id, '35260826A', 'PART', 8.97, 2020, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-007', '2026-08-26'::DATE, 'A', m.id, p.id, '35260826A', 'PART', 7.09, 1597, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-008', '2026-08-26'::DATE, 'A', m.id, p.id, '35260826A', 'PART', 5.34, 1203, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-R01', '2026-08-26'::DATE, 'A', m.id, p.id, '35260826A', 'RUNNER', 9.66, 0, 'OPEN', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826A-R02', '2026-08-26'::DATE, 'A', m.id, p.id, '35260826A', 'RUNNER', 10.8, 0, 'OPEN', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28260826A-001', '2026-08-26'::DATE, 'A', m.id, p.id, '28260826A', 'PART', 2.91, 1796, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28260826A-002', '2026-08-26'::DATE, 'A', m.id, p.id, '28260826A', 'PART', 0.6, 370, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28260826A-R01', '2026-08-26'::DATE, 'A', m.id, p.id, '28260826A', 'RUNNER', 0.57, 0, 'OPEN', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22260826A-001', '2026-08-26'::DATE, 'A', m.id, p.id, '22260826A', 'PART', 6.03, 5025, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22260826A-R01', '2026-08-26'::DATE, 'A', m.id, p.id, '22260826A', 'RUNNER', 1.97, 0, 'OPEN', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-001', '2026-08-26'::DATE, 'B', m.id, p.id, '35260826B', 'PART', 10.16, 2288, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-002', '2026-08-26'::DATE, 'B', m.id, p.id, '35260826B', 'PART', 9.88, 2225, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-003', '2026-08-26'::DATE, 'B', m.id, p.id, '35260826B', 'PART', 9.68, 2180, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-004', '2026-08-26'::DATE, 'B', m.id, p.id, '35260826B', 'PART', 9.85, 2218, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-005', '2026-08-26'::DATE, 'B', m.id, p.id, '35260826B', 'PART', 9.53, 2146, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-006', '2026-08-26'::DATE, 'B', m.id, p.id, '35260826B', 'PART', 9.84, 2216, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-007', '2026-08-26'::DATE, 'B', m.id, p.id, '35260826B', 'PART', 9.54, 2149, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-008', '2026-08-26'::DATE, 'B', m.id, p.id, '35260826B', 'PART', 5.72, 1288, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-R01', '2026-08-26'::DATE, 'B', m.id, p.id, '35260826B', 'RUNNER', 11.1, 0, 'OPEN', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35260826B-R02', '2026-08-26'::DATE, 'B', m.id, p.id, '35260826B', 'RUNNER', 10.97, 0, 'OPEN', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22260826B-001', '2026-08-26'::DATE, 'B', m.id, p.id, '22260826B', 'PART', 7.95, 6625, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22260826B-002', '2026-08-26'::DATE, 'B', m.id, p.id, '22260826B', 'PART', 4.86, 4050, 'PACKED', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22260826B-R01', '2026-08-26'::DATE, 'B', m.id, p.id, '22260826B', 'RUNNER', 4.23, 0, 'OPEN', FALSE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8270826A-001', '2026-08-27'::DATE, 'A', m.id, p.id, '8270826A', 'PART', 4.9, 1262, 'PACKED', TRUE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8270826A-002', '2026-08-27'::DATE, 'A', m.id, p.id, '8270826A', 'PART', 4.61, 1187, 'PACKED', TRUE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8270826A-003', '2026-08-27'::DATE, 'A', m.id, p.id, '8270826A', 'PART', 5.87, 1512, 'PACKED', TRUE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8270826A-004', '2026-08-27'::DATE, 'A', m.id, p.id, '8270826A', 'PART', 5.64, 1452, 'PACKED', TRUE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8270826A-005', '2026-08-27'::DATE, 'A', m.id, p.id, '8270826A', 'PART', 4.65, 1197, 'PACKED', TRUE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30270826A-001', '2026-08-27'::DATE, 'A', m.id, p.id, '30270826A', 'PART', 5.45, 2224, 'PACKED', TRUE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30270826A-002', '2026-08-27'::DATE, 'A', m.id, p.id, '30270826A', 'PART', 5.69, 2322, 'PACKED', TRUE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30270826A-003', '2026-08-27'::DATE, 'A', m.id, p.id, '30270826A', 'PART', 4.45, 1816, 'PACKED', TRUE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30270826A-004', '2026-08-27'::DATE, 'A', m.id, p.id, '30270826A', 'PART', 2.61, 1065, 'PACKED', TRUE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-001', '2026-08-27'::DATE, 'A', m.id, p.id, '35270826A', 'PART', 9.24, 2081, 'PACKED', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-002', '2026-08-27'::DATE, 'A', m.id, p.id, '35270826A', 'PART', 9.53, 2146, 'PACKED', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-003', '2026-08-27'::DATE, 'A', m.id, p.id, '35270826A', 'PART', 9.37, 2110, 'INSPECTED', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-004', '2026-08-27'::DATE, 'A', m.id, p.id, '35270826A', 'PART', 10.28, 2315, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-005', '2026-08-27'::DATE, 'A', m.id, p.id, '35270826A', 'PART', 11.09, 2498, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-006', '2026-08-27'::DATE, 'A', m.id, p.id, '35270826A', 'PART', 11.27, 2538, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-007', '2026-08-27'::DATE, 'A', m.id, p.id, '35270826A', 'PART', 10.94, 2464, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826A-R01', '2026-08-27'::DATE, 'A', m.id, p.id, '35270826A', 'RUNNER', 10.13, 0, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-001', '2026-08-27'::DATE, 'B', m.id, p.id, '35270826B', 'PART', 10.12, 2279, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-002', '2026-08-27'::DATE, 'B', m.id, p.id, '35270826B', 'PART', 10.18, 2293, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-003', '2026-08-27'::DATE, 'B', m.id, p.id, '35270826B', 'PART', 10.03, 2259, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-004', '2026-08-27'::DATE, 'B', m.id, p.id, '35270826B', 'PART', 9.21, 2074, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-005', '2026-08-27'::DATE, 'B', m.id, p.id, '35270826B', 'PART', 9.86, 2221, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-006', '2026-08-27'::DATE, 'B', m.id, p.id, '35270826B', 'PART', 9.87, 2223, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-007', '2026-08-27'::DATE, 'B', m.id, p.id, '35270826B', 'PART', 8.94, 2014, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-008', '2026-08-27'::DATE, 'B', m.id, p.id, '35270826B', 'PART', 7.68, 1730, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-R01', '2026-08-27'::DATE, 'B', m.id, p.id, '35270826B', 'RUNNER', 17.58, 0, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35270826B-R02', '2026-08-27'::DATE, 'B', m.id, p.id, '35270826B', 'RUNNER', 17.36, 0, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22270826A-001', '2026-08-27'::DATE, 'A', m.id, p.id, '22270826A', 'PART', 7.74, 6450, 'PACKED', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22270826A-002', '2026-08-27'::DATE, 'A', m.id, p.id, '22270826A', 'PART', 4.17, 3475, 'PACKED', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22270826A-R01', '2026-08-27'::DATE, 'A', m.id, p.id, '22270826A', 'RUNNER', 3.81, 0, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22270826B-001', '2026-08-27'::DATE, 'B', m.id, p.id, '22270826B', 'PART', 8.04, 6700, 'PACKED', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22270826B-002', '2026-08-27'::DATE, 'B', m.id, p.id, '22270826B', 'PART', 4.48, 3733, 'PACKED', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22270826B-R01', '2026-08-27'::DATE, 'B', m.id, p.id, '22270826B', 'RUNNER', 4.04, 0, 'OPEN', FALSE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8280826A-001', '2026-08-28'::DATE, 'A', m.id, p.id, '8280826A', 'PART', 4.5, 1159, 'TRIMMED', TRUE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30280826A-001', '2026-08-28'::DATE, 'A', m.id, p.id, '30280826A', 'PART', 4.59, 1873, 'PACKED', TRUE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30280826A-002', '2026-08-28'::DATE, 'A', m.id, p.id, '30280826A', 'PART', 4.72, 1927, 'PACKED', TRUE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30280826A-003', '2026-08-28'::DATE, 'A', m.id, p.id, '30280826A', 'PART', 4.1, 1673, 'OPEN', TRUE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30280826A-004', '2026-08-28'::DATE, 'A', m.id, p.id, '30280826A', 'PART', 4.42, 1804, 'OPEN', TRUE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35280826A-001', '2026-08-28'::DATE, 'A', m.id, p.id, '35280826A', 'PART', 11.8, 2658, 'OPEN', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35280826A-R01', '2026-08-28'::DATE, 'A', m.id, p.id, '35280826A', 'RUNNER', 17.57, 0, 'OPEN', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '35280826A-R02', '2026-08-28'::DATE, 'A', m.id, p.id, '35280826A', 'RUNNER', 3.56, 0, 'OPEN', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1280826A-001', '2026-08-28'::DATE, 'A', m.id, p.id, 'P1280826A', 'PART', 4.88, 2068, 'PACKED', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1280826A-R01', '2026-08-28'::DATE, 'A', m.id, p.id, 'P1280826A', 'RUNNER', 1.95, 0, 'OPEN', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1280826B-001', '2026-08-28'::DATE, 'B', m.id, p.id, 'P1280826B', 'PART', 5.21, 2208, 'PACKED', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1280826B-002', '2026-08-28'::DATE, 'B', m.id, p.id, 'P1280826B', 'PART', 4.74, 2008, 'PACKED', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1280826B-003', '2026-08-28'::DATE, 'B', m.id, p.id, 'P1280826B', 'PART', 4.29, 1818, 'PACKED', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1280826B-004', '2026-08-28'::DATE, 'B', m.id, p.id, 'P1280826B', 'PART', 1.62, 686, 'PACKED', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1280826B-R01', '2026-08-28'::DATE, 'B', m.id, p.id, 'P1280826B', 'RUNNER', 5.83, 0, 'OPEN', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22280826B-001', '2026-08-28'::DATE, 'B', m.id, p.id, '22280826B', 'PART', 7.43, 6192, 'PACKED', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22280826B-002', '2026-08-28'::DATE, 'B', m.id, p.id, '22280826B', 'PART', 6.5, 5417, 'OPEN', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22280826B-R01', '2026-08-28'::DATE, 'B', m.id, p.id, '22280826B', 'RUNNER', 4.49, 0, 'OPEN', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10290826A-001', '2026-08-29'::DATE, 'A', m.id, p.id, '10290826A', 'PART', 6.11, 3491, 'PACKED', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10290826A-002', '2026-08-29'::DATE, 'A', m.id, p.id, '10290826A', 'PART', 2.41, 1377, 'PACKED', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10290826A-R01', '2026-08-29'::DATE, 'A', m.id, p.id, '10290826A', 'RUNNER', 3.31, 0, 'OPEN', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30290826A-001', '2026-08-29'::DATE, 'A', m.id, p.id, '30290826A', 'PART', 5.11, 2086, 'OPEN', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30290826A-002', '2026-08-29'::DATE, 'A', m.id, p.id, '30290826A', 'PART', 4.51, 1841, 'OPEN', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '30290826A-003', '2026-08-29'::DATE, 'A', m.id, p.id, '30290826A', 'PART', 1.9, 776, 'OPEN', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1290826A-001', '2026-08-29'::DATE, 'A', m.id, p.id, 'P1290826A', 'PART', 5.27, 2233, 'PACKED', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1290826A-002', '2026-08-29'::DATE, 'A', m.id, p.id, 'P1290826A', 'PART', 5.72, 2424, 'PACKED', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1290826A-003', '2026-08-29'::DATE, 'A', m.id, p.id, 'P1290826A', 'PART', 6.69, 2835, 'PACKED', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1290826A-R01', '2026-08-29'::DATE, 'A', m.id, p.id, 'P1290826A', 'RUNNER', 4.7, 0, 'OPEN', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1290826A-R02', '2026-08-29'::DATE, 'A', m.id, p.id, 'P1290826A', 'RUNNER', 1.8, 0, 'OPEN', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2290826B-001', '2026-08-29'::DATE, 'B', m.id, p.id, 'P2290826B', 'PART', 5.39, 2284, 'PACKED', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2290826B-002', '2026-08-29'::DATE, 'B', m.id, p.id, 'P2290826B', 'PART', 6.28, 2661, 'PACKED', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2290826B-003', '2026-08-29'::DATE, 'B', m.id, p.id, 'P2290826B', 'PART', 1.12, 475, 'PACKED', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2290826B-R01', '2026-08-29'::DATE, 'B', m.id, p.id, 'P2290826B', 'RUNNER', 4.64, 0, 'OPEN', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20290826A-001', '2026-08-29'::DATE, 'A', m.id, p.id, '20290826A', 'PART', 6.18, 662, 'PACKED', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20290826A-002', '2026-08-29'::DATE, 'A', m.id, p.id, '20290826A', 'PART', 6.46, 692, 'PACKED', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20290826A-003', '2026-08-29'::DATE, 'A', m.id, p.id, '20290826A', 'PART', 3.05, 327, 'PACKED', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20290826A-004', '2026-08-29'::DATE, 'A', m.id, p.id, '20290826A', 'PART', 1.34, 143, 'PACKED', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20290826A-R01', '2026-08-29'::DATE, 'A', m.id, p.id, '20290826A', 'RUNNER', 0.87, 0, 'OPEN', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22290826A-001', '2026-08-29'::DATE, 'A', m.id, p.id, '22290826A', 'PART', 0.44, 367, 'OPEN', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22290826A-R01', '2026-08-29'::DATE, 'A', m.id, p.id, '22290826A', 'RUNNER', 0.15, 0, 'OPEN', FALSE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23290826A-001', '2026-08-29'::DATE, 'A', m.id, p.id, '23290826A', 'PART', 4.93, 7995, 'PACKED', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23290826A-002', '2026-08-29'::DATE, 'A', m.id, p.id, '23290826A', 'PART', 2.61, 4210, 'PACKED', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23290826B-001', '2026-08-29'::DATE, 'B', m.id, p.id, '23290826B', 'PART', 6.82, 11000, 'PACKED', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23290826B-002', '2026-08-29'::DATE, 'B', m.id, p.id, '23290826B', 'PART', 2.1, 3387, 'PACKED', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23290826B-REJ-143005', '2026-08-29'::DATE, 'B', m.id, p.id, '23290826B', 'REJECTION', 0.012, 0, 'SCRAPPED', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23290826B-LUMP-143005', '2026-08-29'::DATE, 'B', m.id, p.id, '23290826B', 'LUMP', 0.039, 0, 'SCRAPPED', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28290826A-001', '2026-08-29'::DATE, 'A', m.id, p.id, '28290826A', 'PART', 3.55, 1914, 'PACKED', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28290826A-002', '2026-08-29'::DATE, 'A', m.id, p.id, '28290826A', 'PART', 1.7, 916, 'PACKED', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28290826A-003', '2026-08-29'::DATE, 'A', m.id, p.id, '28290826A', 'PART', 5.56, 2997, 'PACKED', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28290826A-REJ-194609', '2026-08-29'::DATE, 'A', m.id, p.id, '28290826A', 'REJECTION', 0.047, 0, 'SCRAPPED', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28290826B-001', '2026-08-29'::DATE, 'B', m.id, p.id, '28290826B', 'PART', 3.07, 1655, 'PACKED', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28290826B-002', '2026-08-29'::DATE, 'B', m.id, p.id, '28290826B', 'PART', 0.56, 301, 'PACKED', TRUE, '2026-08-29 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '39310826A-001', '2026-08-31'::DATE, 'A', m.id, p.id, '39310826A', 'PART', 9.09, 7512, 'PACKED', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC' OR p.customer_part_no = 'QVEAC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '39310826A-R01', '2026-08-31'::DATE, 'A', m.id, p.id, '39310826A', 'RUNNER', 4.91, 0, 'OPEN', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC' OR p.customer_part_no = 'QVEAC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '39310826A-R02', '2026-08-31'::DATE, 'A', m.id, p.id, '39310826A', 'RUNNER', 0.4, 0, 'OPEN', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC' OR p.customer_part_no = 'QVEAC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '39310826A-REJ-200921', '2026-08-31'::DATE, 'A', m.id, p.id, '39310826A', 'REJECTION', 0.0012, 0, 'SCRAPPED', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC' OR p.customer_part_no = 'QVEAC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826A-001', '2026-08-31'::DATE, 'A', m.id, p.id, 'P1310826A', 'PART', 5.6, 2373, 'PACKED', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826A-002', '2026-08-31'::DATE, 'A', m.id, p.id, 'P1310826A', 'PART', 5.03, 2131, 'PACKED', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826A-003', '2026-08-31'::DATE, 'A', m.id, p.id, 'P1310826A', 'PART', 4.61, 1953, 'PACKED', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826A-004', '2026-08-31'::DATE, 'A', m.id, p.id, 'P1310826A', 'PART', 2.29, 970, 'PACKED', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826A-R01', '2026-08-31'::DATE, 'A', m.id, p.id, 'P1310826A', 'RUNNER', 6.38, 0, 'OPEN', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826A-REJ-115342', '2026-08-31'::DATE, 'A', m.id, p.id, 'P1310826A', 'REJECTION', 0.016, 0, 'SCRAPPED', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826B-001', '2026-08-31'::DATE, 'B', m.id, p.id, 'P1310826B', 'PART', 5.14, 2178, 'PACKED', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826B-002', '2026-08-31'::DATE, 'B', m.id, p.id, 'P1310826B', 'PART', 5.27, 2233, 'PACKED', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826B-003', '2026-08-31'::DATE, 'B', m.id, p.id, 'P1310826B', 'PART', 5.24, 2220, 'PACKED', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826B-R01', '2026-08-31'::DATE, 'B', m.id, p.id, 'P1310826B', 'RUNNER', 1.1, 0, 'OPEN', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826B-R02', '2026-08-31'::DATE, 'B', m.id, p.id, 'P1310826B', 'RUNNER', 4.66, 0, 'OPEN', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1310826B-REJ-123654', '2026-08-31'::DATE, 'B', m.id, p.id, 'P1310826B', 'REJECTION', 0.063, 0, 'SCRAPPED', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23310826A-001', '2026-08-31'::DATE, 'A', m.id, p.id, '23310826A', 'PART', 7.17, 11565, 'OPEN', TRUE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23310826A-REJ-123827', '2026-08-31'::DATE, 'A', m.id, p.id, '23310826A', 'REJECTION', 0.046, 0, 'SCRAPPED', TRUE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23310826A-LUMP-123827', '2026-08-31'::DATE, 'A', m.id, p.id, '23310826A', 'LUMP', 0.06, 0, 'SCRAPPED', TRUE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23310826B-001', '2026-08-31'::DATE, 'B', m.id, p.id, '23310826B', 'PART', 6.71, 10823, 'OPEN', TRUE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23310826B-002', '2026-08-31'::DATE, 'B', m.id, p.id, '23310826B', 'PART', 2.2, 3548, 'OPEN', TRUE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23310826B-REJ-124003', '2026-08-31'::DATE, 'B', m.id, p.id, '23310826B', 'REJECTION', 0.013, 0, 'SCRAPPED', TRUE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28310826A-001', '2026-08-31'::DATE, 'A', m.id, p.id, '28310826A', 'PART', 6.01, 3237, 'PACKED', TRUE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28310826A-002', '2026-08-31'::DATE, 'A', m.id, p.id, '28310826A', 'PART', 1.67, 899, 'PACKED', TRUE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28310826A-003', '2026-08-31'::DATE, 'A', m.id, p.id, '28310826A', 'PART', 3.04, 1637, 'PACKED', TRUE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10010926A-001', '2026-09-01'::DATE, 'A', m.id, p.id, '10010926A', 'PART', 3.11, 1777, 'PACKED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10010926A-R01', '2026-09-01'::DATE, 'A', m.id, p.id, '10010926A', 'RUNNER', 1.2, 0, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10010926A-REJ-162204', '2026-09-01'::DATE, 'A', m.id, p.id, '10010926A', 'REJECTION', 0.025, 0, 'SCRAPPED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '39010926A-001', '2026-09-01'::DATE, 'A', m.id, p.id, '39010926A', 'PART', 8.99, 7430, 'PACKED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC' OR p.customer_part_no = 'QVEAC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '39010926A-R01', '2026-09-01'::DATE, 'A', m.id, p.id, '39010926A', 'RUNNER', 5.57, 0, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC' OR p.customer_part_no = 'QVEAC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1010926A-001', '2026-09-01'::DATE, 'A', m.id, p.id, 'P1010926A', 'PART', 4.56, 1932, 'PACKED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1010926A-002', '2026-09-01'::DATE, 'A', m.id, p.id, 'P1010926A', 'PART', 1.93, 818, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1010926A-R01', '2026-09-01'::DATE, 'A', m.id, p.id, 'P1010926A', 'RUNNER', 2.43, 0, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1010926A-R02', '2026-09-01'::DATE, 'A', m.id, p.id, 'P1010926A', 'RUNNER', 4.68, 0, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2010926A-001', '2026-09-01'::DATE, 'A', m.id, p.id, 'P2010926A', 'PART', 3.3, 3173, 'PACKED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2010926A-R01', '2026-09-01'::DATE, 'A', m.id, p.id, 'P2010926A', 'RUNNER', 3.08, 0, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2010926A-REJ-165338', '2026-09-01'::DATE, 'A', m.id, p.id, 'P2010926A', 'REJECTION', 0.1, 0, 'SCRAPPED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2010926B-001', '2026-09-01'::DATE, 'B', m.id, p.id, 'P2010926B', 'PART', 2.31, 2221, 'PACKED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2010926B-R01', '2026-09-01'::DATE, 'B', m.id, p.id, 'P2010926B', 'RUNNER', 2.22, 0, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20010926A-001', '2026-09-01'::DATE, 'A', m.id, p.id, '20010926A', 'PART', 5.11, 547, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20010926A-002', '2026-09-01'::DATE, 'A', m.id, p.id, '20010926A', 'PART', 4.67, 500, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20010926A-003', '2026-09-01'::DATE, 'A', m.id, p.id, '20010926A', 'PART', 5.2, 557, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20010926A-004', '2026-09-01'::DATE, 'A', m.id, p.id, '20010926A', 'PART', 4.71, 504, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20010926A-005', '2026-09-01'::DATE, 'A', m.id, p.id, '20010926A', 'PART', 2.97, 318, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20010926A-R01', '2026-09-01'::DATE, 'A', m.id, p.id, '20010926A', 'RUNNER', 1.21, 0, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20010926A-REJ-170629', '2026-09-01'::DATE, 'A', m.id, p.id, '20010926A', 'REJECTION', 0.096, 0, 'SCRAPPED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23010926A-001', '2026-09-01'::DATE, 'A', m.id, p.id, '23010926A', 'PART', 6.01, 9720, 'OPEN', TRUE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23010926A-002', '2026-09-01'::DATE, 'A', m.id, p.id, '23010926A', 'PART', 2.15, 3477, 'OPEN', TRUE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23010926A-REJ-171315', '2026-09-01'::DATE, 'A', m.id, p.id, '23010926A', 'REJECTION', 0.017, 0, 'SCRAPPED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23010926A-LUMP-171315', '2026-09-01'::DATE, 'A', m.id, p.id, '23010926A', 'LUMP', 0.025, 0, 'SCRAPPED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23010926B-001', '2026-09-01'::DATE, 'B', m.id, p.id, '23010926B', 'PART', 5.77, 9332, 'OPEN', TRUE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23010926B-002', '2026-09-01'::DATE, 'B', m.id, p.id, '23010926B', 'PART', 2.38, 3849, 'OPEN', TRUE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23010926B-REJ-171426', '2026-09-01'::DATE, 'B', m.id, p.id, '23010926B', 'REJECTION', 0.021, 0, 'SCRAPPED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28010926A-001', '2026-09-01'::DATE, 'A', m.id, p.id, '28010926A', 'PART', 5.4, 2895, 'PACKED', TRUE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28010926A-002', '2026-09-01'::DATE, 'A', m.id, p.id, '28010926A', 'PART', 0.99, 531, 'PACKED', TRUE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28010926A-REJ-171818', '2026-09-01'::DATE, 'A', m.id, p.id, '28010926A', 'REJECTION', 0.057, 0, 'SCRAPPED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28010926A-LUMP-171819', '2026-09-01'::DATE, 'A', m.id, p.id, '28010926A', 'LUMP', 0.008, 0, 'SCRAPPED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-001', '2026-09-01'::DATE, 'A', m.id, p.id, '1A010926A', 'PART', 8.57, 1490, 'PACKED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-002', '2026-09-01'::DATE, 'A', m.id, p.id, '1A010926A', 'PART', 2.41, 419, 'PACKED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-003', '2026-09-01'::DATE, 'A', m.id, p.id, '1A010926A', 'PART', 10.21, 1776, 'PACKED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-004', '2026-09-01'::DATE, 'A', m.id, p.id, '1A010926A', 'PART', 4.96, 863, 'PACKED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-R01', '2026-09-01'::DATE, 'A', m.id, p.id, '1A010926A', 'RUNNER', 3.9, 0, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-R02', '2026-09-01'::DATE, 'A', m.id, p.id, '1A010926A', 'RUNNER', 1.18, 0, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-R03', '2026-09-01'::DATE, 'A', m.id, p.id, '1A010926A', 'RUNNER', 4.39, 0, 'OPEN', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A010926A-REJ-172540', '2026-09-01'::DATE, 'A', m.id, p.id, '1A010926A', 'REJECTION', 0.122, 0, 'SCRAPPED', FALSE, '2026-09-01 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-001', '2026-09-02'::DATE, 'A', m.id, p.id, '20020926A', 'PART', 5.42, 580, 'OPEN', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-002', '2026-09-02'::DATE, 'A', m.id, p.id, '20020926A', 'PART', 5.84, 625, 'OPEN', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-003', '2026-09-02'::DATE, 'A', m.id, p.id, '20020926A', 'PART', 5.42, 580, 'OPEN', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-004', '2026-09-02'::DATE, 'A', m.id, p.id, '20020926A', 'PART', 4.9, 525, 'OPEN', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-005', '2026-09-02'::DATE, 'A', m.id, p.id, '20020926A', 'PART', 5.58, 597, 'OPEN', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-006', '2026-09-02'::DATE, 'A', m.id, p.id, '20020926A', 'PART', 5.83, 624, 'OPEN', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-R01', '2026-09-02'::DATE, 'A', m.id, p.id, '20020926A', 'RUNNER', 1.73, 0, 'OPEN', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20020926A-REJ-091746', '2026-09-02'::DATE, 'A', m.id, p.id, '20020926A', 'REJECTION', 0.118, 0, 'SCRAPPED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A020926A-001', '2026-09-02'::DATE, 'A', m.id, p.id, '1A020926A', 'PART', 8.68, 1510, 'PACKED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A020926A-002', '2026-09-02'::DATE, 'A', m.id, p.id, '1A020926A', 'PART', 9.05, 1574, 'PACKED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A020926A-003', '2026-09-02'::DATE, 'A', m.id, p.id, '1A020926A', 'PART', 7.72, 1343, 'OPEN', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A020926A-R01', '2026-09-02'::DATE, 'A', m.id, p.id, '1A020926A', 'RUNNER', 4.56, 0, 'OPEN', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A020926A-R02', '2026-09-02'::DATE, 'A', m.id, p.id, '1A020926A', 'RUNNER', 4.31, 0, 'OPEN', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A020926A-REJ-092002', '2026-09-02'::DATE, 'A', m.id, p.id, '1A020926A', 'REJECTION', 0.555, 0, 'SCRAPPED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1020926A-001', '2026-09-02'::DATE, 'A', m.id, p.id, '1020926A', 'PART', 5.53, 961, 'PACKED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1020926A-R01', '2026-09-02'::DATE, 'A', m.id, p.id, '1020926A', 'RUNNER', 1.85, 0, 'OPEN', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1020926A-REJ-092645', '2026-09-02'::DATE, 'A', m.id, p.id, '1020926A', 'REJECTION', 0.462, 0, 'SCRAPPED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23020926A-001', '2026-09-02'::DATE, 'A', m.id, p.id, '23020926A', 'PART', 3.05, 4919, 'OPEN', TRUE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '23020926A-REJ-092906', '2026-09-02'::DATE, 'A', m.id, p.id, '23020926A', 'REJECTION', 0.039, 0, 'SCRAPPED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2020926A-001', '2026-09-02'::DATE, 'A', m.id, p.id, 'P2020926A', 'PART', 4.34, 4173, 'PACKED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2020926A-002', '2026-09-02'::DATE, 'A', m.id, p.id, 'P2020926A', 'PART', 1.42, 1365, 'PACKED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2020926A-R01', '2026-09-02'::DATE, 'A', m.id, p.id, 'P2020926A', 'RUNNER', 5.29, 0, 'OPEN', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2020926A-REJ-111815', '2026-09-02'::DATE, 'A', m.id, p.id, 'P2020926A', 'REJECTION', 0.296, 0, 'SCRAPPED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2020926B-001', '2026-09-02'::DATE, 'B', m.id, p.id, 'P2020926B', 'PART', 1.28, 1231, 'PACKED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2020926B-R01', '2026-09-02'::DATE, 'B', m.id, p.id, 'P2020926B', 'RUNNER', 1.27, 0, 'OPEN', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2020926B-REJ-111907', '2026-09-02'::DATE, 'B', m.id, p.id, 'P2020926B', 'REJECTION', 0.18, 0, 'SCRAPPED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926A-001', '2026-09-02'::DATE, 'A', m.id, p.id, '28020926A', 'PART', 3.94, 2109, 'PACKED', TRUE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926A-002', '2026-09-02'::DATE, 'A', m.id, p.id, '28020926A', 'PART', 5.5, 2944, 'PACKED', TRUE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926A-003', '2026-09-02'::DATE, 'A', m.id, p.id, '28020926A', 'PART', 4.16, 2227, 'PACKED', TRUE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926A-004', '2026-09-02'::DATE, 'A', m.id, p.id, '28020926A', 'PART', 2.51, 1343, 'PACKED', TRUE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926A-REJ-112158', '2026-09-02'::DATE, 'A', m.id, p.id, '28020926A', 'REJECTION', 0.087, 0, 'SCRAPPED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926A-LUMP-112158', '2026-09-02'::DATE, 'A', m.id, p.id, '28020926A', 'LUMP', 0.038, 0, 'SCRAPPED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926B-001', '2026-09-02'::DATE, 'B', m.id, p.id, '28020926B', 'PART', 4.7, 2513, 'PACKED', TRUE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926B-002', '2026-09-02'::DATE, 'B', m.id, p.id, '28020926B', 'PART', 1.52, 813, 'PACKED', TRUE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926B-REJ-112253', '2026-09-02'::DATE, 'B', m.id, p.id, '28020926B', 'REJECTION', 0.136, 0, 'SCRAPPED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3020926A-001', '2026-09-02'::DATE, 'A', m.id, p.id, '3020926A', 'PART', 0.86, 180, 'PACKED', TRUE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ' OR p.customer_part_no = 'F442 QQ')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3020926A-REJ-113253', '2026-09-02'::DATE, 'A', m.id, p.id, '3020926A', 'REJECTION', 0.384, 0, 'SCRAPPED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ' OR p.customer_part_no = 'F442 QQ')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3020926A-LUMP-113253', '2026-09-02'::DATE, 'A', m.id, p.id, '3020926A', 'LUMP', 0.238, 0, 'SCRAPPED', FALSE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ' OR p.customer_part_no = 'F442 QQ')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28020926B-003', '2026-09-02'::DATE, 'B', m.id, p.id, '28020926B', 'PART', 3.45, 1845, 'PACKED', TRUE, '2026-09-02 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A310826A-001', '2026-08-31'::DATE, 'A', m.id, p.id, '1A310826A', 'PART', 1.23, 214, 'PACKED', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A310826A-002', '2026-08-31'::DATE, 'A', m.id, p.id, '1A310826A', 'PART', 0.66, 115, 'PACKED', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A310826A-R01', '2026-08-31'::DATE, 'A', m.id, p.id, '1A310826A', 'RUNNER', 0.7, 0, 'OPEN', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1A310826A-REJ-163721', '2026-08-31'::DATE, 'A', m.id, p.id, '1A310826A', 'REJECTION', 0.133, 0, 'SCRAPPED', FALSE, '2026-08-31 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '18260826A-001', '2026-08-26'::DATE, 'A', m.id, p.id, '18260826A', 'PART', 5.35, 2326, 'PACKED', TRUE, '2026-08-26 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'QQVBA W' OR p.shrp_part_code = 'QQVBA W' OR p.customer_part_no = 'QQVBA W')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '18270826A-001', '2026-08-27'::DATE, 'A', m.id, p.id, '18270826A', 'PART', 4.74, 2022, 'PACKED', TRUE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'QQVBA W' OR p.shrp_part_code = 'QQVBA W' OR p.customer_part_no = 'QQVBA W')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '18270826A-002', '2026-08-27'::DATE, 'A', m.id, p.id, '18270826A', 'PART', 2.42, 1032, 'PACKED', TRUE, '2026-08-27 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'QQVBA W' OR p.shrp_part_code = 'QQVBA W' OR p.customer_part_no = 'QQVBA W')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28280826A-001', '2026-08-28'::DATE, 'A', m.id, p.id, '28280826A', 'PART', 5.34, 2856, 'PACKED', TRUE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28280826A-002', '2026-08-28'::DATE, 'A', m.id, p.id, '28280826A', 'PART', 3.09, 1652, 'PACKED', TRUE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28280826A-003', '2026-08-28'::DATE, 'A', m.id, p.id, '28280826A', 'PART', 1.67, 1031, 'PACKED', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8250826A-001', '2026-08-25'::DATE, 'A', m.id, p.id, '8250826A', 'PART', 5.23, 1347, 'PACKED', TRUE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8250826A-002', '2026-08-25'::DATE, 'A', m.id, p.id, '8250826A', 'PART', 4.72, 1215, 'PACKED', TRUE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8250826A-003', '2026-08-25'::DATE, 'A', m.id, p.id, '8250826A', 'PART', 5.35, 1378, 'PACKED', TRUE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8250826A-004', '2026-08-25'::DATE, 'A', m.id, p.id, '8250826A', 'PART', 5.48, 1411, 'PACKED', TRUE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8250826A-005', '2026-08-25'::DATE, 'A', m.id, p.id, '8250826A', 'PART', 3.89, 1002, 'PACKED', TRUE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8250826A-REJ-171006', '2026-08-25'::DATE, 'A', m.id, p.id, '8250826A', 'REJECTION', 0.199, 0, 'SCRAPPED', FALSE, '2026-08-25 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20030926A-001', '2026-09-03'::DATE, 'A', m.id, p.id, '20030926A', 'PART', 0.97, 104, 'OPEN', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20030926A-R01', '2026-09-03'::DATE, 'A', m.id, p.id, '20030926A', 'RUNNER', 0.05, 0, 'OPEN', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '20030926A-REJ-174215', '2026-09-03'::DATE, 'A', m.id, p.id, '20030926A', 'REJECTION', 0.178, 0, 'SCRAPPED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-001', '2026-09-03'::DATE, 'A', m.id, p.id, '1030926A', 'PART', 9.45, 1643, 'PACKED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-002', '2026-09-03'::DATE, 'A', m.id, p.id, '1030926A', 'PART', 9.29, 1616, 'PACKED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-003', '2026-09-03'::DATE, 'A', m.id, p.id, '1030926A', 'PART', 6.79, 1181, 'INSPECTED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-R01', '2026-09-03'::DATE, 'A', m.id, p.id, '1030926A', 'RUNNER', 4.45, 0, 'OPEN', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-R02', '2026-09-03'::DATE, 'A', m.id, p.id, '1030926A', 'RUNNER', 4.3, 0, 'OPEN', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3030926A-001', '2026-09-03'::DATE, 'A', m.id, p.id, '3030926A', 'PART', 4.06, 871, 'PACKED', TRUE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ' OR p.customer_part_no = 'F442 QQ')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3030926A-002', '2026-09-03'::DATE, 'A', m.id, p.id, '3030926A', 'PART', 3.97, 851, 'PACKED', TRUE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ' OR p.customer_part_no = 'F442 QQ')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3030926A-003', '2026-09-03'::DATE, 'A', m.id, p.id, '3030926A', 'PART', 3.6, 772, 'TRIMMED', TRUE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ' OR p.customer_part_no = 'F442 QQ')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28030926A-001', '2026-09-03'::DATE, 'A', m.id, p.id, '28030926A', 'PART', 5.84, 3120, 'PACKED', TRUE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3030926A-004', '2026-09-03'::DATE, 'A', m.id, p.id, '3030926A', 'PART', 3.83, 821, 'TRIMMED', TRUE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ' OR p.customer_part_no = 'F442 QQ')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '3030926A-REJ-110858', '2026-09-03'::DATE, 'A', m.id, p.id, '3030926A', 'REJECTION', 0.322, 0, 'SCRAPPED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ' OR p.customer_part_no = 'F442 QQ')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10030926A-001', '2026-09-03'::DATE, 'A', m.id, p.id, '10030926A', 'PART', 9.15, 5229, 'PACKED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10030926A-R01', '2026-09-03'::DATE, 'A', m.id, p.id, '10030926A', 'RUNNER', 3.6, 0, 'OPEN', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10030926A-REJ-111105', '2026-09-03'::DATE, 'A', m.id, p.id, '10030926A', 'REJECTION', 0.051, 0, 'SCRAPPED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10030926A-LUMP-111105', '2026-09-03'::DATE, 'A', m.id, p.id, '10030926A', 'LUMP', 0.018, 0, 'SCRAPPED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9030926A-001', '2026-09-03'::DATE, 'A', m.id, p.id, '9030926A', 'PART', 2.18, 920, 'PACKED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9030926A-R01', '2026-09-03'::DATE, 'A', m.id, p.id, '9030926A', 'RUNNER', 0.8, 0, 'OPEN', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9030926A-REJ-111239', '2026-09-03'::DATE, 'A', m.id, p.id, '9030926A', 'REJECTION', 0.086, 0, 'SCRAPPED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2030926A-001', '2026-09-03'::DATE, 'A', m.id, p.id, 'P2030926A', 'PART', 4.01, 3856, 'PACKED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2030926A-R01', '2026-09-03'::DATE, 'A', m.id, p.id, 'P2030926A', 'RUNNER', 3.76, 0, 'OPEN', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2030926A-REJ-111358', '2026-09-03'::DATE, 'A', m.id, p.id, 'P2030926A', 'REJECTION', 0.097, 0, 'SCRAPPED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2030926A-LUMP-111358', '2026-09-03'::DATE, 'A', m.id, p.id, 'P2030926A', 'LUMP', 0.078, 0, 'SCRAPPED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-004', '2026-09-03'::DATE, 'A', m.id, p.id, '1030926A', 'PART', 6.32, 1099, 'INSPECTED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-R01', '2026-09-03'::DATE, 'A', m.id, p.id, '1030926A', 'RUNNER', 2.21, 0, 'OPEN', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-REJ-112309', '2026-09-03'::DATE, 'A', m.id, p.id, '1030926A', 'REJECTION', 0.081, 0, 'SCRAPPED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1030926A-LUMP-112309', '2026-09-03'::DATE, 'A', m.id, p.id, '1030926A', 'LUMP', 0.018, 0, 'SCRAPPED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28030926A-002', '2026-09-03'::DATE, 'A', m.id, p.id, '28030926A', 'PART', 4.86, 2597, 'INSPECTED', TRUE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28030926A-003', '2026-09-03'::DATE, 'A', m.id, p.id, '28030926A', 'PART', 3.43, 1833, 'TRIMMED', TRUE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926A-001', '2026-09-03'::DATE, 'A', m.id, p.id, 'B1030926A', 'PART', 6.09, 4911, 'PACKED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926A-002', '2026-09-03'::DATE, 'A', m.id, p.id, 'B1030926A', 'PART', 5.72, 4613, 'PACKED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926A-R01', '2026-09-03'::DATE, 'A', m.id, p.id, 'B1030926A', 'RUNNER', 5.78, 0, 'OPEN', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926A-R02', '2026-09-03'::DATE, 'A', m.id, p.id, 'B1030926A', 'RUNNER', 3.39, 0, 'OPEN', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926A-REJ-114039', '2026-09-03'::DATE, 'A', m.id, p.id, 'B1030926A', 'REJECTION', 0.054, 0, 'SCRAPPED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28030926A-004', '2026-09-03'::DATE, 'A', m.id, p.id, '28030926A', 'PART', 2.56, 1580, 'TRIMMED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28030926A-REJ-115713', '2026-09-03'::DATE, 'A', m.id, p.id, '28030926A', 'REJECTION', 0.36, 0, 'SCRAPPED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926B-001', '2026-09-03'::DATE, 'B', m.id, p.id, 'B1030926B', 'PART', 7.01, 5653, 'PACKED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926B-002', '2026-09-03'::DATE, 'B', m.id, p.id, 'B1030926B', 'PART', 4.58, 3694, 'PACKED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926B-R01', '2026-09-03'::DATE, 'B', m.id, p.id, 'B1030926B', 'RUNNER', 6.42, 0, 'OPEN', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926B-R02', '2026-09-03'::DATE, 'B', m.id, p.id, 'B1030926B', 'RUNNER', 2.51, 0, 'OPEN', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1030926B-REJ-115930', '2026-09-03'::DATE, 'B', m.id, p.id, 'B1030926B', 'REJECTION', 0.004, 0, 'SCRAPPED', FALSE, '2026-09-03 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10040926A-001', '2026-09-04'::DATE, 'A', m.id, p.id, '10040926A', 'PART', 6.18, 3531, 'INSPECTED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10040926A-002', '2026-09-04'::DATE, 'A', m.id, p.id, '10040926A', 'PART', 1.67, 954, 'INSPECTED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10040926A-R01', '2026-09-04'::DATE, 'A', m.id, p.id, '10040926A', 'RUNNER', 3.11, 0, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10040926A-REJ-112228', '2026-09-04'::DATE, 'A', m.id, p.id, '10040926A', 'REJECTION', 0.087, 0, 'SCRAPPED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2040926A-001', '2026-09-04'::DATE, 'A', m.id, p.id, 'P2040926A', 'PART', 4.45, 4279, 'PACKED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2040926A-R01', '2026-09-04'::DATE, 'A', m.id, p.id, 'P2040926A', 'PART', 4.07, 0, 'SCRAPPED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2040926A-REJ-112703', '2026-09-04'::DATE, 'A', m.id, p.id, 'P2040926A', 'REJECTION', 0.176, 0, 'SCRAPPED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1040926A-001', '2026-09-04'::DATE, 'A', m.id, p.id, 'B1040926A', 'PART', 6.6, 5323, 'PACKED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1040926A-002', '2026-09-04'::DATE, 'A', m.id, p.id, 'B1040926A', 'PART', 5.38, 4339, 'PACKED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1040926A-003', '2026-09-04'::DATE, 'A', m.id, p.id, 'B1040926A', 'PART', 4.64, 3742, 'PACKED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1040926A-R01', '2026-09-04'::DATE, 'A', m.id, p.id, 'B1040926A', 'RUNNER', 5.17, 0, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1040926A-R02', '2026-09-04'::DATE, 'A', m.id, p.id, 'B1040926A', 'RUNNER', 4.15, 0, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1040926A-R03', '2026-09-04'::DATE, 'A', m.id, p.id, 'B1040926A', 'RUNNER', 3.59, 0, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1040926A-REJ-113235', '2026-09-04'::DATE, 'A', m.id, p.id, 'B1040926A', 'REJECTION', 0.002, 0, 'SCRAPPED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-001', '2026-09-04'::DATE, 'A', m.id, p.id, '1040926A', 'PART', 9.32, 1621, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-002', '2026-09-04'::DATE, 'A', m.id, p.id, '1040926A', 'PART', 9.28, 1614, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-003', '2026-09-04'::DATE, 'A', m.id, p.id, '1040926A', 'PART', 7.82, 1360, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-004', '2026-09-04'::DATE, 'A', m.id, p.id, '1040926A', 'PART', 8.92, 1551, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-005', '2026-09-04'::DATE, 'A', m.id, p.id, '1040926A', 'PART', 8.08, 1405, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-006', '2026-09-04'::DATE, 'A', m.id, p.id, '1040926A', 'PART', 4.66, 810, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-R01', '2026-09-04'::DATE, 'A', m.id, p.id, '1040926A', 'RUNNER', 5.19, 0, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-R02', '2026-09-04'::DATE, 'A', m.id, p.id, '1040926A', 'RUNNER', 2.94, 0, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-R03', '2026-09-04'::DATE, 'A', m.id, p.id, '1040926A', 'RUNNER', 3.84, 0, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-R04', '2026-09-04'::DATE, 'A', m.id, p.id, '1040926A', 'RUNNER', 4.3, 0, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-REJ-121140', '2026-09-04'::DATE, 'A', m.id, p.id, '1040926A', 'REJECTION', 0.046, 0, 'SCRAPPED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926A-LUMP-121140', '2026-09-04'::DATE, 'A', m.id, p.id, '1040926A', 'LUMP', 0.036, 0, 'SCRAPPED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926B-001', '2026-09-04'::DATE, 'B', m.id, p.id, '1040926B', 'PART', 8.6, 1496, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926B-002', '2026-09-04'::DATE, 'B', m.id, p.id, '1040926B', 'PART', 7.58, 1318, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926B-003', '2026-09-04'::DATE, 'B', m.id, p.id, '1040926B', 'PART', 2.74, 477, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926B-R01', '2026-09-04'::DATE, 'B', m.id, p.id, '1040926B', 'RUNNER', 5.47, 0, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926B-R02', '2026-09-04'::DATE, 'B', m.id, p.id, '1040926B', 'RUNNER', 1.07, 0, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1040926B-REJ-121302', '2026-09-04'::DATE, 'B', m.id, p.id, '1040926B', 'REJECTION', 0.379, 0, 'SCRAPPED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16040926A-001', '2026-09-04'::DATE, 'A', m.id, p.id, '16040926A', 'PART', 5.12, 1410, 'PACKED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16040926A-002', '2026-09-04'::DATE, 'A', m.id, p.id, '16040926A', 'PART', 2.16, 595, 'PACKED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16040926A-R01', '2026-09-04'::DATE, 'A', m.id, p.id, '16040926A', 'RUNNER', 1.95, 0, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16040926A-REJ-121744', '2026-09-04'::DATE, 'A', m.id, p.id, '16040926A', 'REJECTION', 0.065, 0, 'SCRAPPED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28040926A-001', '2026-09-04'::DATE, 'A', m.id, p.id, '28040926A', 'PART', 5.32, 2902, 'TRIMMED', TRUE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28040926A-002', '2026-09-04'::DATE, 'A', m.id, p.id, '28040926A', 'PART', 4.15, 2264, 'TRIMMED', TRUE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28040926A-003', '2026-09-04'::DATE, 'A', m.id, p.id, '28040926A', 'PART', 1.72, 1062, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28040926A-REJ-122219', '2026-09-04'::DATE, 'A', m.id, p.id, '28040926A', 'REJECTION', 0.179, 0, 'SCRAPPED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9040926B-001', '2026-09-04'::DATE, 'B', m.id, p.id, '9040926B', 'PART', 4.37, 1844, 'PACKED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9040926B-R01', '2026-09-04'::DATE, 'B', m.id, p.id, '9040926B', 'RUNNER', 1.69, 0, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9040926B-REJ-123133', '2026-09-04'::DATE, 'B', m.id, p.id, '9040926B', 'REJECTION', 0.176, 0, 'SCRAPPED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9040926A-001', '2026-09-04'::DATE, 'A', m.id, p.id, '9040926A', 'PART', 8.28, 3494, 'PACKED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9040926A-002', '2026-09-04'::DATE, 'A', m.id, p.id, '9040926A', 'PART', 2.59, 1093, 'PACKED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9040926A-R01', '2026-09-04'::DATE, 'A', m.id, p.id, '9040926A', 'RUNNER', 3.92, 0, 'OPEN', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9040926A-REJ-125639', '2026-09-04'::DATE, 'A', m.id, p.id, '9040926A', 'REJECTION', 0.288, 0, 'SCRAPPED', FALSE, '2026-09-04 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16050926A-001', '2026-09-05'::DATE, 'A', m.id, p.id, '16050926A', 'PART', 5.62, 1548, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16050926A-002', '2026-09-05'::DATE, 'A', m.id, p.id, '16050926A', 'PART', 6.22, 1713, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16050926A-003', '2026-09-05'::DATE, 'A', m.id, p.id, '16050926A', 'PART', 2.32, 639, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16050926A-R01', '2026-09-05'::DATE, 'A', m.id, p.id, '16050926A', 'RUNNER', 3.65, 0, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16050926A-REJ-114901', '2026-09-05'::DATE, 'A', m.id, p.id, '16050926A', 'REJECTION', 0.04, 0, 'SCRAPPED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16050926A-LUMP-114903', '2026-09-05'::DATE, 'A', m.id, p.id, '16050926A', 'LUMP', 0.004, 0, 'SCRAPPED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10050926A-001', '2026-09-05'::DATE, 'A', m.id, p.id, '10050926A', 'PART', 8.01, 4577, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10050926A-002', '2026-09-05'::DATE, 'A', m.id, p.id, '10050926A', 'PART', 5.7, 3257, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10050926A-R01', '2026-09-05'::DATE, 'A', m.id, p.id, '10050926A', 'RUNNER', 5.47, 0, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10050926A-REJ-115923', '2026-09-05'::DATE, 'A', m.id, p.id, '10050926A', 'REJECTION', 0.012, 0, 'SCRAPPED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10050926B-001', '2026-09-05'::DATE, 'B', m.id, p.id, '10050926B', 'PART', 8.74, 4994, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10050926B-002', '2026-09-05'::DATE, 'B', m.id, p.id, '10050926B', 'PART', 1.82, 1040, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10050926B-R01', '2026-09-05'::DATE, 'B', m.id, p.id, '10050926B', 'RUNNER', 4.11, 0, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9050926A-001', '2026-09-05'::DATE, 'A', m.id, p.id, '9050926A', 'PART', 1.15, 485, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9050926A-R01', '2026-09-05'::DATE, 'A', m.id, p.id, '9050926A', 'RUNNER', 0.43, 0, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9050926A-REJ-120342', '2026-09-05'::DATE, 'A', m.id, p.id, '9050926A', 'REJECTION', 0.004, 0, 'SCRAPPED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '12050926A-001', '2026-09-05'::DATE, 'A', m.id, p.id, '12050926A', 'PART', 5.27, 3373, 'PACKED', TRUE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UGKCA' OR p.shrp_part_code = 'UGKCA' OR p.customer_part_no = 'UGKCA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '12050926A-002', '2026-09-05'::DATE, 'A', m.id, p.id, '12050926A', 'PART', 6.38, 4083, 'PACKED', TRUE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UGKCA' OR p.shrp_part_code = 'UGKCA' OR p.customer_part_no = 'UGKCA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '12050926A-REJ-120451', '2026-09-05'::DATE, 'A', m.id, p.id, '12050926A', 'REJECTION', 0.025, 0, 'SCRAPPED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UGKCA' OR p.shrp_part_code = 'UGKCA' OR p.customer_part_no = 'UGKCA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1050926A-001', '2026-09-05'::DATE, 'A', m.id, p.id, 'B1050926A', 'PART', 6.9, 5565, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1050926A-R01', '2026-09-05'::DATE, 'A', m.id, p.id, 'B1050926A', 'RUNNER', 4.51, 0, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B1050926A-R02', '2026-09-05'::DATE, 'A', m.id, p.id, 'B1050926A', 'RUNNER', 0.84, 0, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926A-001', '2026-09-05'::DATE, 'A', m.id, p.id, '25050926A', 'PART', 3.88, 653, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926A-002', '2026-09-05'::DATE, 'A', m.id, p.id, '25050926A', 'PART', 4.41, 742, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926A-003', '2026-09-05'::DATE, 'A', m.id, p.id, '25050926A', 'PART', 4.3, 724, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926A-004', '2026-09-05'::DATE, 'A', m.id, p.id, '25050926A', 'PART', 4.56, 768, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926A-R01', '2026-09-05'::DATE, 'A', m.id, p.id, '25050926A', 'RUNNER', 2.01, 0, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926A-REJ-120819', '2026-09-05'::DATE, 'A', m.id, p.id, '25050926A', 'REJECTION', 0.015, 0, 'SCRAPPED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-001', '2026-09-05'::DATE, 'B', m.id, p.id, '25050926B', 'PART', 4.12, 694, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-002', '2026-09-05'::DATE, 'B', m.id, p.id, '25050926B', 'PART', 4.57, 769, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-003', '2026-09-05'::DATE, 'B', m.id, p.id, '25050926B', 'PART', 3.93, 662, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-004', '2026-09-05'::DATE, 'B', m.id, p.id, '25050926B', 'PART', 4.12, 694, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-005', '2026-09-05'::DATE, 'B', m.id, p.id, '25050926B', 'PART', 4.24, 714, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-006', '2026-09-05'::DATE, 'B', m.id, p.id, '25050926B', 'PART', 4.79, 806, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-007', '2026-09-05'::DATE, 'B', m.id, p.id, '25050926B', 'PART', 4.71, 793, 'PACKED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25050926B-R01', '2026-09-05'::DATE, 'B', m.id, p.id, '25050926B', 'RUNNER', 3.56, 0, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2050926A-001', '2026-09-05'::DATE, 'A', m.id, p.id, 'P2050926A', 'PART', 3.7, 3775, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2050926A-R01', '2026-09-05'::DATE, 'A', m.id, p.id, 'P2050926A', 'RUNNER', 3.3, 0, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28050926A-001', '2026-09-05'::DATE, 'A', m.id, p.id, '28050926A', 'PART', 5.12, 2731, 'OPEN', TRUE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28050926A-002', '2026-09-05'::DATE, 'A', m.id, p.id, '28050926A', 'PART', 4.36, 2325, 'OPEN', TRUE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28050926A-003', '2026-09-05'::DATE, 'A', m.id, p.id, '28050926A', 'PART', 1.75, 933, 'OPEN', TRUE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28050926A-REJ-124226', '2026-09-05'::DATE, 'A', m.id, p.id, '28050926A', 'REJECTION', 0.197, 0, 'SCRAPPED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-001', '2026-09-05'::DATE, 'A', m.id, p.id, '1050926A', 'PART', 8.79, 1529, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-002', '2026-09-05'::DATE, 'A', m.id, p.id, '1050926A', 'PART', 9.46, 1645, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-003', '2026-09-05'::DATE, 'A', m.id, p.id, '1050926A', 'PART', 8.65, 1504, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-004', '2026-09-05'::DATE, 'A', m.id, p.id, '1050926A', 'PART', 5.08, 883, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10070926A-REJ-095920', '2026-09-07'::DATE, 'A', m.id, p.id, '10070926A', 'REJECTION', 0.07, 0, 'SCRAPPED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-R02', '2026-09-05'::DATE, 'A', m.id, p.id, '1050926A', 'RUNNER', 4.65, 0, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-R03', '2026-09-05'::DATE, 'A', m.id, p.id, '1050926A', 'RUNNER', 2.36, 0, 'OPEN', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-REJ-125429', '2026-09-05'::DATE, 'A', m.id, p.id, '1050926A', 'REJECTION', 0.0167, 0, 'SCRAPPED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '1050926A-LUMP-125429', '2026-09-05'::DATE, 'A', m.id, p.id, '1050926A', 'LUMP', 0.091, 0, 'SCRAPPED', FALSE, '2026-09-05 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10070926A-921', '2026-09-07'::DATE, 'A', m.id, p.id, '10070926A', 'PART', 7.07, 4040, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10070926A-922', '2026-09-07'::DATE, 'A', m.id, p.id, '10070926A', 'PART', 1.22, 697, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10070926A-R01', '2026-09-07'::DATE, 'A', m.id, p.id, '10070926A', 'RUNNER', 3.36, 0, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28070926A-001', '2026-09-07'::DATE, 'A', m.id, p.id, '28070926A', 'PART', 5.26, 2805, 'OPEN', TRUE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28070926A-002', '2026-09-07'::DATE, 'A', m.id, p.id, '28070926A', 'PART', 3.17, 1691, 'OPEN', TRUE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28070926A-003', '2026-09-07'::DATE, 'A', m.id, p.id, '28070926A', 'PART', 1.72, 917, 'OPEN', TRUE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22280826A-001', '2026-08-28'::DATE, 'A', m.id, p.id, '22280826A', 'PART', 7.57, 6308, 'PACKED', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22280826A-002', '2026-08-28'::DATE, 'A', m.id, p.id, '22280826A', 'PART', 4.42, 3683, 'PACKED', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '22280826A-R01', '2026-08-28'::DATE, 'A', m.id, p.id, '22280826A', 'RUNNER', 3.84, 0, 'OPEN', FALSE, '2026-08-28 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-001', '2026-09-07'::DATE, 'A', m.id, p.id, '25070926A', 'PART', 3.81, 615, 'PACKED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-002', '2026-09-07'::DATE, 'A', m.id, p.id, '25070926A', 'PART', 4.07, 656, 'PACKED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-003', '2026-09-07'::DATE, 'A', m.id, p.id, '25070926A', 'PART', 3.56, 574, 'PACKED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-004', '2026-09-07'::DATE, 'A', m.id, p.id, '25070926A', 'PART', 4.28, 690, 'PACKED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-005', '2026-09-07'::DATE, 'A', m.id, p.id, '25070926A', 'PART', 4.546, 733, 'PACKED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-006', '2026-09-07'::DATE, 'A', m.id, p.id, '25070926A', 'PART', 4.48, 723, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-007', '2026-09-07'::DATE, 'A', m.id, p.id, '25070926A', 'PART', 2.05, 331, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926A-R01', '2026-09-07'::DATE, 'A', m.id, p.id, '25070926A', 'RUNNER', 2.95, 0, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-001', '2026-09-07'::DATE, 'B', m.id, p.id, '25070926B', 'PART', 3.55, 573, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-002', '2026-09-07'::DATE, 'B', m.id, p.id, '25070926B', 'PART', 3.97, 640, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-003', '2026-09-07'::DATE, 'B', m.id, p.id, '25070926B', 'PART', 3.85, 621, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-004', '2026-09-07'::DATE, 'B', m.id, p.id, '25070926B', 'PART', 3.67, 592, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-005', '2026-09-07'::DATE, 'B', m.id, p.id, '25070926B', 'PART', 3.91, 631, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-006', '2026-09-07'::DATE, 'B', m.id, p.id, '25070926B', 'PART', 3.88, 626, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-007', '2026-09-07'::DATE, 'B', m.id, p.id, '25070926B', 'PART', 3.4, 548, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-008', '2026-09-07'::DATE, 'B', m.id, p.id, '25070926B', 'PART', 3.19, 515, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-R01', '2026-09-07'::DATE, 'B', m.id, p.id, '25070926B', 'RUNNER', 3.62, 0, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25070926B-REJ-122415', '2026-09-07'::DATE, 'B', m.id, p.id, '25070926B', 'REJECTION', 0.074, 0, 'SCRAPPED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926B-001', '2026-09-07'::DATE, 'B', m.id, p.id, '2070926B', 'PART', 7, 2389, 'PACKED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926B-002', '2026-09-07'::DATE, 'B', m.id, p.id, '2070926B', 'PART', 7.42, 2532, 'PACKED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926B-003', '2026-09-07'::DATE, 'B', m.id, p.id, '2070926B', 'PART', 2.52, 860, 'PACKED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926B-R01', '2026-09-07'::DATE, 'B', m.id, p.id, '2070926B', 'RUNNER', 4.92, 0, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926A-001', '2026-09-07'::DATE, 'A', m.id, p.id, '2070926A', 'PART', 8.95, 2983, 'PACKED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926A-002', '2026-09-07'::DATE, 'A', m.id, p.id, '2070926A', 'PART', 7.39, 2463, 'PACKED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926A-003', '2026-09-07'::DATE, 'A', m.id, p.id, '2070926A', 'PART', 7.59, 2530, 'PACKED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926A-R01', '2026-09-07'::DATE, 'A', m.id, p.id, '2070926A', 'RUNNER', 2.51, 0, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926A-R02', '2026-09-07'::DATE, 'A', m.id, p.id, '2070926A', 'RUNNER', 4.3, 0, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2070926A-REJ-141745', '2026-09-07'::DATE, 'A', m.id, p.id, '2070926A', 'REJECTION', 0.036, 0, 'SCRAPPED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16070926A-001', '2026-09-07'::DATE, 'A', m.id, p.id, '16070926A', 'PART', 6.76, 1862, 'PACKED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16070926A-002', '2026-09-07'::DATE, 'A', m.id, p.id, '16070926A', 'PART', 5.94, 1636, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16070926A-003', '2026-09-07'::DATE, 'A', m.id, p.id, '16070926A', 'PART', 4.81, 1325, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16070926A-R01', '2026-09-07'::DATE, 'A', m.id, p.id, '16070926A', 'RUNNER', 4.55, 0, 'OPEN', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16070926A-REJ-142511', '2026-09-07'::DATE, 'A', m.id, p.id, '16070926A', 'REJECTION', 0.119, 0, 'SCRAPPED', FALSE, '2026-09-07 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18080926A-001', '2026-09-08'::DATE, 'A', m.id, p.id, 'W18080926A', 'PART', 2.85, 785, 'PACKED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18080926A-R01', '2026-09-08'::DATE, 'A', m.id, p.id, 'W18080926A', 'RUNNER', 0.31, 0, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18080926A-REJ-111104', '2026-09-08'::DATE, 'A', m.id, p.id, 'W18080926A', 'REJECTION', 0.202, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18080926A-LUMP-111104', '2026-09-08'::DATE, 'A', m.id, p.id, 'W18080926A', 'LUMP', 0.013, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28080926A-001', '2026-09-08'::DATE, 'A', m.id, p.id, '28080926A', 'PART', 2.8, 1493, 'OPEN', TRUE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28080926A-002', '2026-09-08'::DATE, 'A', m.id, p.id, '28080926A', 'PART', 0.48, 296, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '28080926A-REJ-113245', '2026-09-08'::DATE, 'A', m.id, p.id, '28080926A', 'REJECTION', 0.077, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10080926A-001', '2026-09-08'::DATE, 'A', m.id, p.id, '10080926A', 'PART', 2.2, 1257, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10080926A-R01', '2026-09-08'::DATE, 'A', m.id, p.id, '10080926A', 'RUNNER', 0.9, 0, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '10080926A-REJ-113750', '2026-09-08'::DATE, 'A', m.id, p.id, '10080926A', 'REJECTION', 0.145, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926A-001', '2026-09-08'::DATE, 'A', m.id, p.id, '16080926A', 'PART', 5.47, 1507, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926A-002', '2026-09-08'::DATE, 'A', m.id, p.id, '16080926A', 'PART', 5.44, 1499, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926A-003', '2026-09-08'::DATE, 'A', m.id, p.id, '16080926A', 'PART', 3.31, 912, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926A-R01', '2026-09-08'::DATE, 'A', m.id, p.id, '16080926A', 'RUNNER', 3.72, 0, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926A-REJ-114401', '2026-09-08'::DATE, 'A', m.id, p.id, '16080926A', 'REJECTION', 0.185, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926B-001', '2026-09-08'::DATE, 'B', m.id, p.id, '16080926B', 'PART', 5.58, 1537, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926B-R01', '2026-09-08'::DATE, 'B', m.id, p.id, '16080926B', 'RUNNER', 1.49, 0, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926B-REJ-114535', '2026-09-08'::DATE, 'B', m.id, p.id, '16080926B', 'REJECTION', 0.027, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16080926B-LUMP-114535', '2026-09-08'::DATE, 'B', m.id, p.id, '16080926B', 'LUMP', 0.032, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926A-001', '2026-09-08'::DATE, 'A', m.id, p.id, '9080926A', 'PART', 7.93, 3346, 'PACKED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926A-R01', '2026-09-08'::DATE, 'A', m.id, p.id, '9080926A', 'RUNNER', 3, 0, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926A-REJ-132229', '2026-09-08'::DATE, 'A', m.id, p.id, '9080926A', 'REJECTION', 0.397, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926A-LUMP-132229', '2026-09-08'::DATE, 'A', m.id, p.id, '9080926A', 'LUMP', 0.107, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926B-001', '2026-09-08'::DATE, 'B', m.id, p.id, '9080926B', 'PART', 7.46, 3148, 'PACKED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926B-002', '2026-09-08'::DATE, 'B', m.id, p.id, '9080926B', 'PART', 6.15, 2595, 'PACKED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926B-R01', '2026-09-08'::DATE, 'B', m.id, p.id, '9080926B', 'RUNNER', 5.08, 0, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9080926B-REJ-132739', '2026-09-08'::DATE, 'B', m.id, p.id, '9080926B', 'REJECTION', 0.124, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-001', '2026-09-08'::DATE, 'A', m.id, p.id, '25080926A', 'PART', 4.05, 653, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-002', '2026-09-08'::DATE, 'A', m.id, p.id, '25080926A', 'PART', 4.16, 671, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-003', '2026-09-08'::DATE, 'A', m.id, p.id, '25080926A', 'PART', 4.11, 663, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-004', '2026-09-08'::DATE, 'A', m.id, p.id, '25080926A', 'PART', 4.01, 647, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-005', '2026-09-08'::DATE, 'A', m.id, p.id, '25080926A', 'PART', 4.04, 652, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-006', '2026-09-08'::DATE, 'A', m.id, p.id, '25080926A', 'PART', 1.61, 260, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-R01', '2026-09-08'::DATE, 'A', m.id, p.id, '25080926A', 'RUNNER', 2.6, 0, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-REJ-141633', '2026-09-08'::DATE, 'A', m.id, p.id, '25080926A', 'REJECTION', 0.298, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '25080926A-LUMP-141633', '2026-09-08'::DATE, 'A', m.id, p.id, '25080926A', 'LUMP', 0.065, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-001', '2026-09-08'::DATE, 'A', m.id, p.id, '2080926A', 'PART', 7.66, 2553, 'PACKED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-002', '2026-09-08'::DATE, 'A', m.id, p.id, '2080926A', 'PART', 8.32, 2773, 'PACKED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-003', '2026-09-08'::DATE, 'A', m.id, p.id, '2080926A', 'PART', 7.58, 2527, 'PACKED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-004', '2026-09-08'::DATE, 'A', m.id, p.id, '2080926A', 'PART', 7.93, 2643, 'PACKED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-005', '2026-09-08'::DATE, 'A', m.id, p.id, '2080926A', 'PART', 7.44, 2480, 'HOLD', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-006', '2026-09-08'::DATE, 'A', m.id, p.id, '2080926A', 'PART', 7.11, 2370, 'HOLD', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-R01', '2026-09-08'::DATE, 'A', m.id, p.id, '2080926A', 'RUNNER', 4.43, 0, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-R02', '2026-09-08'::DATE, 'A', m.id, p.id, '2080926A', 'RUNNER', 4.21, 0, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-R03', '2026-09-08'::DATE, 'A', m.id, p.id, '2080926A', 'RUNNER', 4.9, 0, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926A-REJ-160415', '2026-09-08'::DATE, 'A', m.id, p.id, '2080926A', 'REJECTION', 0.717, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926B-001', '2026-09-08'::DATE, 'B', m.id, p.id, '2080926B', 'PART', 5.97, 1990, 'PACKED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926B-002', '2026-09-08'::DATE, 'B', m.id, p.id, '2080926B', 'PART', 7.5, 2500, 'PACKED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926B-003', '2026-09-08'::DATE, 'B', m.id, p.id, '2080926B', 'PART', 7.98, 2660, 'PACKED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926B-004', '2026-09-08'::DATE, 'B', m.id, p.id, '2080926B', 'PART', 7.79, 2597, 'PACKED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926B-R01', '2026-09-08'::DATE, 'B', m.id, p.id, '2080926B', 'RUNNER', 4.57, 0, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926B-R02', '2026-09-08'::DATE, 'B', m.id, p.id, '2080926B', 'RUNNER', 3.81, 0, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2080926B-REJ-162708', '2026-09-08'::DATE, 'B', m.id, p.id, '2080926B', 'REJECTION', 0.297, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45080926A-001', '2026-09-08'::DATE, 'A', m.id, p.id, '45080926A', 'PART', 5.15, 1447, 'PACKED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA' OR p.customer_part_no = 'UMNAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45080926A-002', '2026-09-08'::DATE, 'A', m.id, p.id, '45080926A', 'PART', 2.91, 817, 'PACKED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA' OR p.customer_part_no = 'UMNAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45080926A-R01', '2026-09-08'::DATE, 'A', m.id, p.id, '45080926A', 'RUNNER', 2.76, 0, 'OPEN', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA' OR p.customer_part_no = 'UMNAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45080926A-REJ-162821', '2026-09-08'::DATE, 'A', m.id, p.id, '45080926A', 'REJECTION', 0.893, 0, 'SCRAPPED', FALSE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA' OR p.customer_part_no = 'UMNAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926A-001', '2026-09-09'::DATE, 'A', m.id, p.id, '24090926A', 'PART', 4.49, 750, 'PACKED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926A-002', '2026-09-09'::DATE, 'A', m.id, p.id, '24090926A', 'PART', 4.94, 825, 'PACKED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926A-003', '2026-09-09'::DATE, 'A', m.id, p.id, '24090926A', 'PART', 1.94, 324, 'PACKED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926A-R01', '2026-09-09'::DATE, 'A', m.id, p.id, '24090926A', 'RUNNER', 1.46, 0, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926A-REJ-102128', '2026-09-09'::DATE, 'A', m.id, p.id, '24090926A', 'REJECTION', 0.213, 0, 'SCRAPPED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18090926A-001', '2026-09-09'::DATE, 'A', m.id, p.id, 'W18090926A', 'PART', 6.32, 1741, 'INSPECTED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18090926A-002', '2026-09-09'::DATE, 'A', m.id, p.id, 'W18090926A', 'PART', 2.01, 554, 'TRIMMED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18090926A-R01', '2026-09-09'::DATE, 'A', m.id, p.id, 'W18090926A', 'RUNNER', 0.84, 0, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18090926A-REJ-110637', '2026-09-09'::DATE, 'A', m.id, p.id, 'W18090926A', 'REJECTION', 0.138, 0, 'SCRAPPED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18090926A-LUMP-110637', '2026-09-09'::DATE, 'A', m.id, p.id, 'W18090926A', 'LUMP', 0.167, 0, 'SCRAPPED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9090926A-001', '2026-09-09'::DATE, 'A', m.id, p.id, '9090926A', 'PART', 7.05, 2975, 'PACKED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9090926A-002', '2026-09-09'::DATE, 'A', m.id, p.id, '9090926A', 'PART', 4.22, 1781, 'PACKED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9090926A-R01', '2026-09-09'::DATE, 'A', m.id, p.id, '9090926A', 'RUNNER', 4.2, 0, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9090926A-REJ-110826', '2026-09-09'::DATE, 'A', m.id, p.id, '9090926A', 'REJECTION', 0.179, 0, 'SCRAPPED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45090926A-001', '2026-09-09'::DATE, 'A', m.id, p.id, '45090926A', 'PART', 5.56, 1562, 'PACKED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA' OR p.customer_part_no = 'UMNAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45090926A-002', '2026-09-09'::DATE, 'A', m.id, p.id, '45090926A', 'PART', 4.03, 1132, 'PACKED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA' OR p.customer_part_no = 'UMNAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45090926A-R01', '2026-09-09'::DATE, 'A', m.id, p.id, '45090926A', 'RUNNER', 3.18, 0, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA' OR p.customer_part_no = 'UMNAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '45090926A-REJ-110935', '2026-09-09'::DATE, 'A', m.id, p.id, '45090926A', 'REJECTION', 0.134, 0, 'SCRAPPED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA' OR p.customer_part_no = 'UMNAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2090926A-001', '2026-09-09'::DATE, 'A', m.id, p.id, 'P2090926A', 'PART', 3.73, 3730, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2090926A-R01', '2026-09-09'::DATE, 'A', m.id, p.id, 'P2090926A', 'RUNNER', 3.29, 0, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2090926A-REJ-111122', '2026-09-09'::DATE, 'A', m.id, p.id, 'P2090926A', 'REJECTION', 0.041, 0, 'SCRAPPED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926A-001', '2026-09-09'::DATE, 'A', m.id, p.id, '33090926A', 'PART', 11.11, 1830, 'PACKED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926A-002', '2026-09-09'::DATE, 'A', m.id, p.id, '33090926A', 'PART', 7.03, 1158, 'PACKED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926A-R01', '2026-09-09'::DATE, 'A', m.id, p.id, '33090926A', 'RUNNER', 4.31, 0, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926A-R02', '2026-09-09'::DATE, 'A', m.id, p.id, '33090926A', 'RUNNER', 0.68, 0, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926A-REJ-111945', '2026-09-09'::DATE, 'A', m.id, p.id, '33090926A', 'REJECTION', 0.112, 0, 'SCRAPPED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926B-001', '2026-09-09'::DATE, 'B', m.id, p.id, '33090926B', 'PART', 8.47, 1395, 'INSPECTED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926B-002', '2026-09-09'::DATE, 'B', m.id, p.id, '33090926B', 'PART', 7.8, 1285, 'INSPECTED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926B-003', '2026-09-09'::DATE, 'B', m.id, p.id, '33090926B', 'PART', 8.55, 1409, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926B-004', '2026-09-09'::DATE, 'B', m.id, p.id, '33090926B', 'PART', 7.78, 1282, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926B-R01', '2026-09-09'::DATE, 'B', m.id, p.id, '33090926B', 'RUNNER', 5.03, 0, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926B-R02', '2026-09-09'::DATE, 'B', m.id, p.id, '33090926B', 'RUNNER', 3.85, 0, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33090926B-REJ-112158', '2026-09-09'::DATE, 'B', m.id, p.id, '33090926B', 'REJECTION', 0.062, 0, 'SCRAPPED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-001', '2026-09-09'::DATE, 'B', m.id, p.id, '24090926B', 'PART', 4.27, 713, 'PACKED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-002', '2026-09-09'::DATE, 'B', m.id, p.id, '24090926B', 'PART', 4.39, 733, 'PACKED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-003', '2026-09-09'::DATE, 'B', m.id, p.id, '24090926B', 'PART', 5.07, 846, 'PACKED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-004', '2026-09-09'::DATE, 'B', m.id, p.id, '24090926B', 'PART', 4.75, 793, 'PACKED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-005', '2026-09-09'::DATE, 'B', m.id, p.id, '24090926B', 'PART', 4.78, 798, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-006', '2026-09-09'::DATE, 'B', m.id, p.id, '24090926B', 'PART', 4.5, 751, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-R01', '2026-09-09'::DATE, 'B', m.id, p.id, '24090926B', 'RUNNER', 3.59, 0, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24090926B-REJ-112843', '2026-09-09'::DATE, 'B', m.id, p.id, '24090926B', 'REJECTION', 0.079, 0, 'SCRAPPED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16090926A-001', '2026-09-09'::DATE, 'A', m.id, p.id, '16090926A', 'PART', 6.25, 1722, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16090926A-002', '2026-09-09'::DATE, 'A', m.id, p.id, '16090926A', 'PART', 6.67, 1837, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16090926A-R01', '2026-09-09'::DATE, 'A', m.id, p.id, '16090926A', 'RUNNER', 3.37, 0, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16090926A-REJ-113027', '2026-09-09'::DATE, 'A', m.id, p.id, '16090926A', 'REJECTION', 0.09, 0, 'SCRAPPED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16090926A-LUMP-113027', '2026-09-09'::DATE, 'A', m.id, p.id, '16090926A', 'LUMP', 0.167, 0, 'SCRAPPED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16100926A-001', '2026-09-10'::DATE, 'A', m.id, p.id, '16100926A', 'PART', 2.69, 741, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16100926A-R01', '2026-09-10'::DATE, 'A', m.id, p.id, '16100926A', 'RUNNER', 0.74, 0, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '16100926A-REJ-121136', '2026-09-10'::DATE, 'A', m.id, p.id, '16100926A', 'REJECTION', 0.116, 0, 'SCRAPPED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '5080926A-001', '2026-09-08'::DATE, 'A', m.id, p.id, '5080926A', 'PART', 0.52, 133, 'PACKED', TRUE, '2026-09-08 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 03' AND (p.part_code = 'F442 WB' OR p.shrp_part_code = 'F442 WB' OR p.customer_part_no = 'F442 WB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '5090926A-001', '2026-09-09'::DATE, 'A', m.id, p.id, '5090926A', 'PART', 1.38, 353, 'PACKED', TRUE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 03' AND (p.part_code = 'F442 WB' OR p.shrp_part_code = 'F442 WB' OR p.customer_part_no = 'F442 WB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '5090926A-REJ-123959', '2026-09-09'::DATE, 'A', m.id, p.id, '5090926A', 'REJECTION', 0.059, 0, 'SCRAPPED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 03' AND (p.part_code = 'F442 WB' OR p.shrp_part_code = 'F442 WB' OR p.customer_part_no = 'F442 WB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2090926A-001', '2026-09-09'::DATE, 'A', m.id, p.id, '2090926A', 'PART', 8.54, 2847, 'PACKED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2090926A-R01', '2026-09-09'::DATE, 'A', m.id, p.id, '2090926A', 'RUNNER', 2.42, 0, 'OPEN', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2090926A-REJ-153421', '2026-09-09'::DATE, 'A', m.id, p.id, '2090926A', 'REJECTION', 0.061, 0, 'SCRAPPED', FALSE, '2026-09-09 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9100926A-001', '2026-09-10'::DATE, 'A', m.id, p.id, '9100926A', 'PART', 5.95, 2511, 'PACKED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9100926A-002', '2026-09-10'::DATE, 'A', m.id, p.id, '9100926A', 'PART', 5.19, 2190, 'PACKED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9100926A-R01', '2026-09-10'::DATE, 'A', m.id, p.id, '9100926A', 'RUNNER', 4.07, 0, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9100926A-REJ-105504', '2026-09-10'::DATE, 'A', m.id, p.id, '9100926A', 'REJECTION', 0.113, 0, 'SCRAPPED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '47100926A-001', '2026-09-10'::DATE, 'A', m.id, p.id, '47100926A', 'PART', 6.7, 3350, 'PARTIAL_INSPECT', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'NDGAA' OR p.shrp_part_code = 'NDGAA' OR p.customer_part_no = 'NDGAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '47100926A-002', '2026-09-10'::DATE, 'A', m.id, p.id, '47100926A', 'PART', 3.84, 1920, 'PARTIAL_INSPECT', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'NDGAA' OR p.shrp_part_code = 'NDGAA' OR p.customer_part_no = 'NDGAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '47100926A-R01', '2026-09-10'::DATE, 'A', m.id, p.id, '47100926A', 'RUNNER', 4.94, 0, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'NDGAA' OR p.shrp_part_code = 'NDGAA' OR p.customer_part_no = 'NDGAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '47100926A-REJ-105744', '2026-09-10'::DATE, 'A', m.id, p.id, '47100926A', 'REJECTION', 0.179, 0, 'SCRAPPED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'NDGAA' OR p.shrp_part_code = 'NDGAA' OR p.customer_part_no = 'NDGAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2100926A-001', '2026-09-10'::DATE, 'A', m.id, p.id, 'P2100926A', 'PART', 4.84, 4840, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2100926A-R01', '2026-09-10'::DATE, 'A', m.id, p.id, 'P2100926A', 'RUNNER', 4.16, 0, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P2100926A-REJ-105858', '2026-09-10'::DATE, 'A', m.id, p.id, 'P2100926A', 'REJECTION', 0.038, 0, 'SCRAPPED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33100926A-001', '2026-09-10'::DATE, 'A', m.id, p.id, '33100926A', 'PART', 8.07, 1329, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33100926A-002', '2026-09-10'::DATE, 'A', m.id, p.id, '33100926A', 'PART', 8.29, 1366, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33100926A-003', '2026-09-10'::DATE, 'A', m.id, p.id, '33100926A', 'PART', 8.34, 1374, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33100926A-004', '2026-09-10'::DATE, 'A', m.id, p.id, '33100926A', 'PART', 6.35, 1046, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33100926A-R01', '2026-09-10'::DATE, 'A', m.id, p.id, '33100926A', 'RUNNER', 6.09, 0, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33100926A-R02', '2026-09-10'::DATE, 'A', m.id, p.id, '33100926A', 'RUNNER', 2.36, 0, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33100926A-REJ-110103', '2026-09-10'::DATE, 'A', m.id, p.id, '33100926A', 'REJECTION', 0.038, 0, 'SCRAPPED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-001', '2026-09-10'::DATE, 'A', m.id, p.id, '24100926A', 'PART', 4.34, 725, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-002', '2026-09-10'::DATE, 'A', m.id, p.id, '24100926A', 'PART', 4.33, 723, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-003', '2026-09-10'::DATE, 'A', m.id, p.id, '24100926A', 'PART', 4.35, 726, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-004', '2026-09-10'::DATE, 'A', m.id, p.id, '24100926A', 'PART', 4.46, 745, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-005', '2026-09-10'::DATE, 'A', m.id, p.id, '24100926A', 'PART', 5.5, 918, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-006', '2026-09-10'::DATE, 'A', m.id, p.id, '24100926A', 'PART', 4.91, 820, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-R01', '2026-09-10'::DATE, 'A', m.id, p.id, '24100926A', 'RUNNER', 3.49, 0, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926A-REJ-110307', '2026-09-10'::DATE, 'A', m.id, p.id, '24100926A', 'REJECTION', 0.046, 0, 'SCRAPPED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-001', '2026-09-10'::DATE, 'B', m.id, p.id, '24100926B', 'PART', 4.77, 796, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-002', '2026-09-10'::DATE, 'B', m.id, p.id, '24100926B', 'PART', 4.37, 730, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-003', '2026-09-10'::DATE, 'B', m.id, p.id, '24100926B', 'PART', 4.6, 768, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-004', '2026-09-10'::DATE, 'B', m.id, p.id, '24100926B', 'PART', 4.56, 761, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-005', '2026-09-10'::DATE, 'B', m.id, p.id, '24100926B', 'PART', 4.56, 761, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-006', '2026-09-10'::DATE, 'B', m.id, p.id, '24100926B', 'PART', 4.69, 783, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-R01', '2026-09-10'::DATE, 'B', m.id, p.id, '24100926B', 'RUNNER', 3.58, 0, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24100926B-REJ-111224', '2026-09-10'::DATE, 'B', m.id, p.id, '24100926B', 'REJECTION', 0.006, 0, 'SCRAPPED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18100926A-001', '2026-09-10'::DATE, 'A', m.id, p.id, 'W18100926A', 'PART', 2.34, 645, 'TRIMMED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18100926A-R01', '2026-09-10'::DATE, 'A', m.id, p.id, 'W18100926A', 'RUNNER', 0.24, 0, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18100926A-REJ-111852', '2026-09-10'::DATE, 'A', m.id, p.id, 'W18100926A', 'REJECTION', 0.056, 0, 'SCRAPPED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W18100926A-LUMP-111852', '2026-09-10'::DATE, 'A', m.id, p.id, 'W18100926A', 'LUMP', 0.034, 0, 'SCRAPPED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926A-001', '2026-09-10'::DATE, 'A', m.id, p.id, '27100926A', 'PART', 6.23, 3314, 'PACKED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926A-002', '2026-09-10'::DATE, 'A', m.id, p.id, '27100926A', 'PART', 4.05, 2154, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926A-R01', '2026-09-10'::DATE, 'A', m.id, p.id, '27100926A', 'RUNNER', 4.33, 0, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926A-REJ-115916', '2026-09-10'::DATE, 'A', m.id, p.id, '27100926A', 'REJECTION', 0.545, 0, 'SCRAPPED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926A-LUMP-115916', '2026-09-10'::DATE, 'A', m.id, p.id, '27100926A', 'LUMP', 0.089, 0, 'SCRAPPED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926B-001', '2026-09-10'::DATE, 'B', m.id, p.id, '27100926B', 'PART', 7.26, 3862, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926B-002', '2026-09-10'::DATE, 'B', m.id, p.id, '27100926B', 'PART', 7.29, 3878, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926B-003', '2026-09-10'::DATE, 'B', m.id, p.id, '27100926B', 'PART', 2.78, 1479, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926B-R01', '2026-09-10'::DATE, 'B', m.id, p.id, '27100926B', 'RUNNER', 7, 0, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27100926B-REJ-120050', '2026-09-10'::DATE, 'B', m.id, p.id, '27100926B', 'REJECTION', 0.119, 0, 'SCRAPPED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33110926A-001', '2026-09-11'::DATE, 'A', m.id, p.id, '33110926A', 'PART', 8.98, 1479, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33110926A-002', '2026-09-11'::DATE, 'A', m.id, p.id, '33110926A', 'PART', 8.64, 1423, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33110926A-R01', '2026-09-11'::DATE, 'A', m.id, p.id, '33110926A', 'RUNNER', 4.81, 0, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '33110926A-REJ-174254', '2026-09-11'::DATE, 'A', m.id, p.id, '33110926A', 'REJECTION', 0.047, 0, 'SCRAPPED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '5100926A-001', '2026-09-10'::DATE, 'A', m.id, p.id, '5100926A', 'PART', 2.38, 601, 'PACKED', TRUE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 03' AND (p.part_code = 'F442 WB' OR p.shrp_part_code = 'F442 WB' OR p.customer_part_no = 'F442 WB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9100926A-001', '2026-09-10'::DATE, 'A', m.id, p.id, 'B9100926A', 'PART', 0.95, 306, 'PACKED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9100926A-002', '2026-09-10'::DATE, 'A', m.id, p.id, 'B9100926A', 'PART', 0.3, 97, 'PACKED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9100926A-R01', '2026-09-10'::DATE, 'A', m.id, p.id, 'B9100926A', 'RUNNER', 0.15, 0, 'OPEN', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9100926A-REJ-093423', '2026-09-10'::DATE, 'A', m.id, p.id, 'B9100926A', 'REJECTION', 0.056, 0, 'SCRAPPED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9100926A-LUMP-093423', '2026-09-10'::DATE, 'A', m.id, p.id, 'B9100926A', 'LUMP', 0.034, 0, 'SCRAPPED', FALSE, '2026-09-10 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '46110926A-001', '2026-09-11'::DATE, 'A', m.id, p.id, '46110926A', 'PART', 5.73, 2230, 'INSPECTED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA' OR p.customer_part_no = 'UMEAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '46110926A-002', '2026-09-11'::DATE, 'A', m.id, p.id, '46110926A', 'PART', 1.5, 584, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA' OR p.customer_part_no = 'UMEAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '46110926A-R01', '2026-09-11'::DATE, 'A', m.id, p.id, '46110926A', 'RUNNER', 1.54, 0, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA' OR p.customer_part_no = 'UMEAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '46110926A-REJ-112323', '2026-09-11'::DATE, 'A', m.id, p.id, '46110926A', 'REJECTION', 0.105, 0, 'SCRAPPED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA' OR p.customer_part_no = 'UMEAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1110926A-001', '2026-09-11'::DATE, 'A', m.id, p.id, 'P1110926A', 'PART', 5.51, 2335, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1110926A-002', '2026-09-11'::DATE, 'A', m.id, p.id, 'P1110926A', 'PART', 4.44, 1881, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1110926A-003', '2026-09-11'::DATE, 'A', m.id, p.id, 'P1110926A', 'PART', 1.47, 623, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1110926A-R01', '2026-09-11'::DATE, 'A', m.id, p.id, 'P1110926A', 'RUNNER', 4.21, 0, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'P1110926A-REJ-112531', '2026-09-11'::DATE, 'A', m.id, p.id, 'P1110926A', 'REJECTION', 0.092, 0, 'SCRAPPED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926A-001', '2026-09-11'::DATE, 'A', m.id, p.id, '21110926A', 'PART', 4.51, 628, 'PACKED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926A-002', '2026-09-11'::DATE, 'A', m.id, p.id, '21110926A', 'PART', 2.96, 412, 'PACKED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926A-R01', '2026-09-11'::DATE, 'A', m.id, p.id, '21110926A', 'RUNNER', 0.76, 0, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926A-REJ-114622', '2026-09-11'::DATE, 'A', m.id, p.id, '21110926A', 'REJECTION', 0.865, 0, 'SCRAPPED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926B-001', '2026-09-11'::DATE, 'B', m.id, p.id, '21110926B', 'PART', 4.24, 591, 'INSPECTED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926B-002', '2026-09-11'::DATE, 'B', m.id, p.id, '21110926B', 'PART', 4.37, 609, 'TRIMMED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926B-003', '2026-09-11'::DATE, 'B', m.id, p.id, '21110926B', 'PART', 4.04, 563, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926B-004', '2026-09-11'::DATE, 'B', m.id, p.id, '21110926B', 'PART', 4.25, 592, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926B-005', '2026-09-11'::DATE, 'B', m.id, p.id, '21110926B', 'PART', 1.84, 256, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926B-R01', '2026-09-11'::DATE, 'B', m.id, p.id, '21110926B', 'RUNNER', 1.73, 0, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21110926B-REJ-114733', '2026-09-11'::DATE, 'B', m.id, p.id, '21110926B', 'REJECTION', 0.221, 0, 'SCRAPPED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-001', '2026-09-11'::DATE, 'A', m.id, p.id, '24110926A', 'PART', 4.94, 825, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-002', '2026-09-11'::DATE, 'A', m.id, p.id, '24110926A', 'PART', 4.79, 800, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-003', '2026-09-11'::DATE, 'A', m.id, p.id, '24110926A', 'PART', 4.81, 803, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-004', '2026-09-11'::DATE, 'A', m.id, p.id, '24110926A', 'PART', 3.47, 579, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-005', '2026-09-11'::DATE, 'A', m.id, p.id, '24110926A', 'PART', 4.76, 795, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-006', '2026-09-11'::DATE, 'A', m.id, p.id, '24110926A', 'PART', 3.13, 523, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-R01', '2026-09-11'::DATE, 'A', m.id, p.id, '24110926A', 'RUNNER', 2.33, 0, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-R02', '2026-09-11'::DATE, 'A', m.id, p.id, '24110926A', 'RUNNER', 0.96, 0, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926A-REJ-114957', '2026-09-11'::DATE, 'A', m.id, p.id, '24110926A', 'REJECTION', 0.029, 0, 'SCRAPPED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-001', '2026-09-11'::DATE, 'B', m.id, p.id, '24110926B', 'PART', 4.63, 773, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-002', '2026-09-11'::DATE, 'B', m.id, p.id, '24110926B', 'PART', 4.65, 776, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-003', '2026-09-11'::DATE, 'B', m.id, p.id, '24110926B', 'PART', 4.68, 781, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-004', '2026-09-11'::DATE, 'B', m.id, p.id, '24110926B', 'PART', 4.87, 813, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-005', '2026-09-11'::DATE, 'B', m.id, p.id, '24110926B', 'PART', 4.61, 770, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-006', '2026-09-11'::DATE, 'B', m.id, p.id, '24110926B', 'PART', 4.1, 684, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-R01', '2026-09-11'::DATE, 'B', m.id, p.id, '24110926B', 'RUNNER', 3.6, 0, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '24110926B-REJ-115115', '2026-09-11'::DATE, 'B', m.id, p.id, '24110926B', 'REJECTION', 0.064, 0, 'SCRAPPED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27110926A-001', '2026-09-11'::DATE, 'A', m.id, p.id, '27110926A', 'PART', 6.53, 3473, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27110926A-002', '2026-09-11'::DATE, 'A', m.id, p.id, '27110926A', 'PART', 2.25, 1197, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27110926A-R01', '2026-09-11'::DATE, 'A', m.id, p.id, '27110926A', 'RUNNER', 3.48, 0, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '27110926A-REJ-115347', '2026-09-11'::DATE, 'A', m.id, p.id, '27110926A', 'REJECTION', 0.036, 0, 'SCRAPPED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9110926A-001', '2026-09-11'::DATE, 'A', m.id, p.id, 'B9110926A', 'PART', 5.58, 1800, 'PACKED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9110926A-002', '2026-09-11'::DATE, 'A', m.id, p.id, 'B9110926A', 'PART', 3.48, 1123, 'INSPECTED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9110926A-003', '2026-09-11'::DATE, 'A', m.id, p.id, 'B9110926A', 'PART', 3.4, 1097, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9110926A-R01', '2026-09-11'::DATE, 'A', m.id, p.id, 'B9110926A', 'RUNNER', 1.04, 0, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9110926A-REJ-160007', '2026-09-11'::DATE, 'A', m.id, p.id, 'B9110926A', 'REJECTION', 0.354, 0, 'SCRAPPED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9110926A-001', '2026-09-11'::DATE, 'A', m.id, p.id, '9110926A', 'PART', 6.87, 2899, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9110926A-002', '2026-09-11'::DATE, 'A', m.id, p.id, '9110926A', 'PART', 4.66, 1966, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9110926A-R01', '2026-09-11'::DATE, 'A', m.id, p.id, '9110926A', 'RUNNER', 4.18, 0, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9110926A-REJ-160156', '2026-09-11'::DATE, 'A', m.id, p.id, '9110926A', 'REJECTION', 0.083, 0, 'SCRAPPED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9110926B-001', '2026-09-11'::DATE, 'B', m.id, p.id, '9110926B', 'PART', 7.12, 3004, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9110926B-R01', '2026-09-11'::DATE, 'B', m.id, p.id, '9110926B', 'RUNNER', 2.62, 0, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9110926B-REJ-160235', '2026-09-11'::DATE, 'B', m.id, p.id, '9110926B', 'REJECTION', 0.054, 0, 'SCRAPPED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '110926A-001', '2026-09-11'::DATE, 'A', m.id, p.id, '110926A', 'PART', 5.93, 2213, 'PACKED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB' OR p.customer_part_no = 'NA-DB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '110926A-002', '2026-09-11'::DATE, 'A', m.id, p.id, '110926A', 'PART', 1.41, 526, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB' OR p.customer_part_no = 'NA-DB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '110926A-R01', '2026-09-11'::DATE, 'A', m.id, p.id, '110926A', 'RUNNER', 1.32, 0, 'OPEN', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB' OR p.customer_part_no = 'NA-DB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '110926A-REJ-161143', '2026-09-11'::DATE, 'A', m.id, p.id, '110926A', 'REJECTION', 0.315, 0, 'SCRAPPED', FALSE, '2026-09-11 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB' OR p.customer_part_no = 'NA-DB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W14120926A-001', '2026-09-12'::DATE, 'A', m.id, p.id, 'W14120926A', 'PART', 2.53, 944, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB' OR p.customer_part_no = 'NA-DB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W14120926A-R01', '2026-09-12'::DATE, 'A', m.id, p.id, 'W14120926A', 'RUNNER', 0.59, 0, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB' OR p.customer_part_no = 'NA-DB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W14120926A-REJ-170640', '2026-09-12'::DATE, 'A', m.id, p.id, 'W14120926A', 'REJECTION', 0.096, 0, 'SCRAPPED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB' OR p.customer_part_no = 'NA-DB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W15120926A-001', '2026-09-12'::DATE, 'A', m.id, p.id, 'W15120926A', 'PART', 1.28, 895, 'PACKED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC' OR p.customer_part_no = 'NA-LC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W15120926A-002', '2026-09-12'::DATE, 'A', m.id, p.id, 'W15120926A', 'PART', 0.34, 238, 'INSPECTED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC' OR p.customer_part_no = 'NA-LC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9120926A-001', '2026-09-12'::DATE, 'A', m.id, p.id, '9120926A', 'PART', 6.88, 2903, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9120926A-002', '2026-09-12'::DATE, 'A', m.id, p.id, '9120926A', 'PART', 1.16, 489, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9120926A-R01', '2026-09-12'::DATE, 'A', m.id, p.id, '9120926A', 'RUNNER', 2.88, 0, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '9120926A-REJ-105427', '2026-09-12'::DATE, 'A', m.id, p.id, '9120926A', 'REJECTION', 0.031, 0, 'SCRAPPED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926A-001', '2026-09-12'::DATE, 'A', m.id, p.id, '2120926A', 'PART', 9.33, 3110, 'INSPECTED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926A-R01', '2026-09-12'::DATE, 'A', m.id, p.id, '2120926A', 'RUNNER', 3.84, 0, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926A-REJ-105629', '2026-09-12'::DATE, 'A', m.id, p.id, '2120926A', 'REJECTION', 0.164, 0, 'SCRAPPED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-001', '2026-09-12'::DATE, 'B', m.id, p.id, '2120926B', 'PART', 8.74, 2913, 'INSPECTED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-002', '2026-09-12'::DATE, 'B', m.id, p.id, '2120926B', 'PART', 7.17, 2390, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-003', '2026-09-12'::DATE, 'B', m.id, p.id, '2120926B', 'PART', 7.76, 2587, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-004', '2026-09-12'::DATE, 'B', m.id, p.id, '2120926B', 'PART', 8.05, 2683, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-005', '2026-09-12'::DATE, 'B', m.id, p.id, '2120926B', 'PART', 7.72, 2573, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-006', '2026-09-12'::DATE, 'B', m.id, p.id, '2120926B', 'PART', 5.97, 1990, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-R01', '2026-09-12'::DATE, 'B', m.id, p.id, '2120926B', 'RUNNER', 4.68, 0, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-R02', '2026-09-12'::DATE, 'B', m.id, p.id, '2120926B', 'RUNNER', 3.77, 0, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-R03', '2026-09-12'::DATE, 'B', m.id, p.id, '2120926B', 'RUNNER', 0.62, 0, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '2120926B-R04', '2026-09-12'::DATE, 'B', m.id, p.id, '2120926B', 'RUNNER', 3.77, 0, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926A-001', '2026-09-12'::DATE, 'A', m.id, p.id, '8120926A', 'PART', 3.78, 967, 'OPEN', TRUE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926A-002', '2026-09-12'::DATE, 'A', m.id, p.id, '8120926A', 'PART', 5.02, 1284, 'OPEN', TRUE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926A-003', '2026-09-12'::DATE, 'A', m.id, p.id, '8120926A', 'PART', 4.22, 1079, 'OPEN', TRUE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926A-REJ-110326', '2026-09-12'::DATE, 'A', m.id, p.id, '8120926A', 'REJECTION', 0.003, 0, 'SCRAPPED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-001', '2026-09-12'::DATE, 'B', m.id, p.id, '8120926B', 'PART', 4.71, 1152, 'OPEN', TRUE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-002', '2026-09-12'::DATE, 'B', m.id, p.id, '8120926B', 'PART', 4.57, 1117, 'OPEN', TRUE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-003', '2026-09-12'::DATE, 'B', m.id, p.id, '8120926B', 'PART', 5.17, 1264, 'OPEN', TRUE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-004', '2026-09-12'::DATE, 'B', m.id, p.id, '8120926B', 'PART', 4.84, 1183, 'OPEN', TRUE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-005', '2026-09-12'::DATE, 'B', m.id, p.id, '8120926B', 'PART', 4.64, 1134, 'OPEN', TRUE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-006', '2026-09-12'::DATE, 'B', m.id, p.id, '8120926B', 'PART', 5.42, 1325, 'OPEN', TRUE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-007', '2026-09-12'::DATE, 'B', m.id, p.id, '8120926B', 'PART', 4.13, 1010, 'OPEN', TRUE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-008', '2026-09-12'::DATE, 'B', m.id, p.id, '8120926B', 'PART', 4.44, 1086, 'OPEN', TRUE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-REJ-110947', '2026-09-12'::DATE, 'B', m.id, p.id, '8120926B', 'REJECTION', 0.235, 0, 'SCRAPPED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '8120926B-LUMP-110947', '2026-09-12'::DATE, 'B', m.id, p.id, '8120926B', 'LUMP', 0.097, 0, 'SCRAPPED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '46120926A-001', '2026-09-12'::DATE, 'A', m.id, p.id, '46120926A', 'PART', 2.85, 1109, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA' OR p.customer_part_no = 'UMEAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '46120926A-R01', '2026-09-12'::DATE, 'A', m.id, p.id, '46120926A', 'RUNNER', 0.61, 0, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA' OR p.customer_part_no = 'UMEAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '46120926A-REJ-111500', '2026-09-12'::DATE, 'A', m.id, p.id, '46120926A', 'REJECTION', 0.054, 0, 'SCRAPPED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA' OR p.customer_part_no = 'UMEAA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-001', '2026-09-12'::DATE, 'A', m.id, p.id, '21120926A', 'PART', 4.73, 659, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-002', '2026-09-12'::DATE, 'A', m.id, p.id, '21120926A', 'PART', 4.19, 584, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-003', '2026-09-12'::DATE, 'A', m.id, p.id, '21120926A', 'PART', 2.58, 359, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-004', '2026-09-12'::DATE, 'A', m.id, p.id, '21120926A', 'PART', 4.21, 586, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-005', '2026-09-12'::DATE, 'A', m.id, p.id, '21120926A', 'PART', 4.29, 597, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-006', '2026-09-12'::DATE, 'A', m.id, p.id, '21120926A', 'PART', 4.67, 650, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-R01', '2026-09-12'::DATE, 'A', m.id, p.id, '21120926A', 'RUNNER', 2.2, 0, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '21120926A-REJ-112612', '2026-09-12'::DATE, 'A', m.id, p.id, '21120926A', 'REJECTION', 0.14, 0, 'SCRAPPED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-001', '2026-09-12'::DATE, 'A', m.id, p.id, '14120926A', 'PART', 5.54, 1215, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501' OR p.customer_part_no = 'HA715 - W501')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-002', '2026-09-12'::DATE, 'A', m.id, p.id, '14120926A', 'PART', 5.25, 1151, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501' OR p.customer_part_no = 'HA715 - W501')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-003', '2026-09-12'::DATE, 'A', m.id, p.id, '14120926A', 'PART', 5.05, 1107, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501' OR p.customer_part_no = 'HA715 - W501')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-004', '2026-09-12'::DATE, 'A', m.id, p.id, '14120926A', 'PART', 5.8, 1272, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501' OR p.customer_part_no = 'HA715 - W501')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-005', '2026-09-12'::DATE, 'A', m.id, p.id, '14120926A', 'PART', 1.27, 279, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501' OR p.customer_part_no = 'HA715 - W501')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-R01', '2026-09-12'::DATE, 'A', m.id, p.id, '14120926A', 'RUNNER', 2.84, 0, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501' OR p.customer_part_no = 'HA715 - W501')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-REJ-112741', '2026-09-12'::DATE, 'A', m.id, p.id, '14120926A', 'REJECTION', 0.022, 0, 'SCRAPPED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501' OR p.customer_part_no = 'HA715 - W501')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT '14120926A-LUMP-112741', '2026-09-12'::DATE, 'A', m.id, p.id, '14120926A', 'LUMP', 0.043, 0, 'SCRAPPED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501' OR p.customer_part_no = 'HA715 - W501')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9120926A-001', '2026-09-12'::DATE, 'A', m.id, p.id, 'B9120926A', 'PART', 5.56, 1794, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9120926A-002', '2026-09-12'::DATE, 'A', m.id, p.id, 'B9120926A', 'PART', 1.95, 629, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9120926A-003', '2026-09-12'::DATE, 'A', m.id, p.id, 'B9120926A', 'PART', 2.53, 816, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9120926A-R01', '2026-09-12'::DATE, 'A', m.id, p.id, 'B9120926A', 'RUNNER', 0.8, 0, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'B9120926A-REJ-112859', '2026-09-12'::DATE, 'A', m.id, p.id, 'B9120926A', 'REJECTION', 0.136, 0, 'SCRAPPED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W15120926A-003', '2026-09-12'::DATE, 'A', m.id, p.id, 'W15120926A', 'PART', 2.86, 2000, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC' OR p.customer_part_no = 'NA-LC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W15120926A-R01', '2026-09-12'::DATE, 'A', m.id, p.id, 'W15120926A', 'RUNNER', 1.04, 0, 'OPEN', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC' OR p.customer_part_no = 'NA-LC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W15120926A-REJ-113216', '2026-09-12'::DATE, 'A', m.id, p.id, 'W15120926A', 'REJECTION', 0.031, 0, 'SCRAPPED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC' OR p.customer_part_no = 'NA-LC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;
INSERT INTO bags (bag_code, entry_date, shift, machine_id, part_id, batch_no, bag_type, base_weight_kg, qty, status, weighed_with_runner, created_at)
SELECT 'W15120926A-LUMP-113216', '2026-09-12'::DATE, 'A', m.id, p.id, 'W15120926A', 'LUMP', 0.025, 0, 'SCRAPPED', FALSE, '2026-09-12 09:30:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC' OR p.customer_part_no = 'NA-LC')
LIMIT 1
ON CONFLICT (bag_code) DO NOTHING;

-- 2. Trim Log Sync (95 total)

-- 3. Inspection Log Sync (204 total)

-- 4. Packing Log Sync (181 total)

-- 5. Production Entries Sync (312 total)
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-08-24'::DATE, 1, 2060, 2825, 3016, 44, 0, '34240826A', NULL, '2026-08-24 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC' OR p.customer_part_no = 'LBC')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-24'::DATE AND pe.shift = 'A' AND pe.start_count = 2060 AND pe.end_count = 2825
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-24'::DATE, 1, 440, 1115, 3961, 89, 25, '4240826A', NULL, '2026-08-24 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F442 KQ' OR p.shrp_part_code = 'F442 KQ' OR p.customer_part_no = 'F442 KQ')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-24'::DATE AND pe.shift = 'A' AND pe.start_count = 440 AND pe.end_count = 1115
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-08-24'::DATE, 1, 4943, 6192, 4987, 9, 0, '29240826A', NULL, '2026-08-24 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800' OR p.customer_part_no = '2800')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-24'::DATE AND pe.shift = 'A' AND pe.start_count = 4943 AND pe.end_count = 6192
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'B', '2026-08-24'::DATE, 1, 6192, 7909, 6830, 38, 210, '29240826B', NULL, '2026-08-24 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800' OR p.customer_part_no = '2800')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-24'::DATE AND pe.shift = 'B' AND pe.start_count = 6192 AND pe.end_count = 7909
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-08-24'::DATE, 1, 0, 559, 3274, 80, 0, '18240826B', NULL, '2026-08-24 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'QQVBA W' OR p.shrp_part_code = 'QQVBA W' OR p.customer_part_no = 'QQVBA W')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-24'::DATE AND pe.shift = 'B' AND pe.start_count = 0 AND pe.end_count = 559
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 6283, 6381, 560, 28, 0, '8250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 6283 AND pe.end_count = 6381
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 6381, 6490, 654, 0, 0, '8250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 6381 AND pe.end_count = 6490
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 6490, 6612, 732, 0, 0, '8250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 6490 AND pe.end_count = 6612
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 6612, 7127, 3080, 10, 0, '8250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 6612 AND pe.end_count = 7127
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 0, 66, 1056, 0, 360, '35250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 66
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 7909, 8020, 444, 0, 0, '29250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2800' OR p.shrp_part_code = '2800' OR p.customer_part_no = '2800')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 7909 AND pe.end_count = 8020
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 0, 90, 455, 85, 85, '28250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 90
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 66, 203, 2192, 0, 0, '35250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 66 AND pe.end_count = 203
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 203, 429, 3616, 0, 0, '35250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 203 AND pe.end_count = 429
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'B', '2026-08-25'::DATE, 1, 429, 1410, 15696, 0, 0, '35250826B', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'B' AND pe.start_count = 429 AND pe.end_count = 1410
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 7127, 7324, 1182, 0, 0, '8250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 7127 AND pe.end_count = 7324
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 1183, 1650, 3230, 39, 0, '7250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'F710' OR p.shrp_part_code = 'F710' OR p.customer_part_no = 'F710')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 1183 AND pe.end_count = 1650
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 1650, 1650, 0, 0, 0, '7250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'F710' OR p.shrp_part_code = 'F710' OR p.customer_part_no = 'F710')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 1650 AND pe.end_count = 1650
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 0, 113, 657, 21, 60, '30250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 113
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 2825, 3553, 2882, 30, 0, '34250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC' OR p.customer_part_no = 'LBC')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 2825 AND pe.end_count = 3553
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-08-25'::DATE, 1, 90, 792, 3868, 344, 0, '28250826A', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'A' AND pe.start_count = 90 AND pe.end_count = 792
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-08-25'::DATE, 1, 792, 2155, 8052, 126, 15, '28250826B', NULL, '2026-08-25 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-25'::DATE AND pe.shift = 'B' AND pe.start_count = 792 AND pe.end_count = 2155
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 7324, 7572, 1472, 16, 0, '8260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 7324 AND pe.end_count = 7572
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 113, 1130, 6102, 0, 0, '30260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 113 AND pe.end_count = 1130
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 1410, 1548, 2204, 4, 15, '35260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 1410 AND pe.end_count = 1548
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 2155, 2380, 1256, 94, 0, '28260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 2155 AND pe.end_count = 2380
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 7572, 8018, 2670, 6, 0, '8260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 7572 AND pe.end_count = 8018
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 390, 970, 3479, 1, 0, '30260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 390 AND pe.end_count = 970
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 1548, 1888, 5440, 0, 0, '35260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 1548 AND pe.end_count = 1888
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 2380, 2515, 791, 19, 0, '28260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 2380 AND pe.end_count = 2515
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 0, 250, 1489, 11, 0, '22260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 250
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 8018, 8305, 1722, 0, 0, '8260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 8018 AND pe.end_count = 8305
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 970, 1295, 1950, 0, 0, '30260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 970 AND pe.end_count = 1295
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 1888, 2150, 4186, 6, 0, '35260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 1888 AND pe.end_count = 2150
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 2150, 2392, 3872, 0, 0, '35260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 2150 AND pe.end_count = 2392
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'B', '2026-08-26'::DATE, 1, 2392, 3444, 16800, 32, 0, '35260826B', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'B' AND pe.start_count = 2392 AND pe.end_count = 3444
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 250, 663, 2394, 84, 0, '22260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 250 AND pe.end_count = 663
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 663, 850, 1122, 0, 0, '22260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 663 AND pe.end_count = 850
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-08-26'::DATE, 1, 850, 2704, 11105, 19, 0, '22260826B', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'B' AND pe.start_count = 850 AND pe.end_count = 2704
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-08-27'::DATE, 1, 8305, 9200, 5308, 62, 0, '8270826A', NULL, '2026-08-27 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-27'::DATE AND pe.shift = 'A' AND pe.start_count = 8305 AND pe.end_count = 9200
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-08-27'::DATE, 1, 1295, 2298, 6016, 2, 0, '30270826A', NULL, '2026-08-27 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-27'::DATE AND pe.shift = 'A' AND pe.start_count = 1295 AND pe.end_count = 2298
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-08-27'::DATE, 1, 3444, 4060, 9850, 6, 0, '35270826A', NULL, '2026-08-27 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-27'::DATE AND pe.shift = 'A' AND pe.start_count = 3444 AND pe.end_count = 4060
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-08-27'::DATE, 1, 2704, 3025, 1921, 5, 0, '22270826A', NULL, '2026-08-27 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-27'::DATE AND pe.shift = 'A' AND pe.start_count = 2704 AND pe.end_count = 3025
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'MOHANRAJ' OR full_name ILIKE '%MOHANRAJ%' LIMIT 1), 1), 'A', '2026-08-27'::DATE, 1, 3025, 3810, 4710, 0, 0, '22270826A', NULL, '2026-08-27 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-27'::DATE AND pe.shift = 'A' AND pe.start_count = 3025 AND pe.end_count = 3810
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-08-27'::DATE, 1, 9200, 9403, 1194, 24, 0, '8270826A', NULL, '2026-08-27 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-27'::DATE AND pe.shift = 'A' AND pe.start_count = 9200 AND pe.end_count = 9403
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-08-27'::DATE, 1, 2298, 2523, 1350, 0, 0, '30270826A', NULL, '2026-08-27 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-27'::DATE AND pe.shift = 'A' AND pe.start_count = 2298 AND pe.end_count = 2523
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-08-27'::DATE, 1, 4060, 4235, 2797, 3, 0, '35270826A', NULL, '2026-08-27 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-27'::DATE AND pe.shift = 'A' AND pe.start_count = 4060 AND pe.end_count = 4235
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-08-27'::DATE, 1, 4235, 4492, 4109, 3, 0, '35270826A', NULL, '2026-08-27 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-27'::DATE AND pe.shift = 'A' AND pe.start_count = 4235 AND pe.end_count = 4492
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-08-27'::DATE, 1, 4492, 5579, 17392, 0, 0, '35270826B', NULL, '2026-08-27 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-27'::DATE AND pe.shift = 'B' AND pe.start_count = 4492 AND pe.end_count = 5579
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'MOHANRAJ' OR full_name ILIKE '%MOHANRAJ%' LIMIT 1), 1), 'A', '2026-08-27'::DATE, 1, 3810, 4077, 1597, 5, 0, '22270826A', NULL, '2026-08-27 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-27'::DATE AND pe.shift = 'A' AND pe.start_count = 3810 AND pe.end_count = 4077
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-08-27'::DATE, 1, 4077, 4407, 1980, 0, 40, '22270826A', NULL, '2026-08-27 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-27'::DATE AND pe.shift = 'A' AND pe.start_count = 4077 AND pe.end_count = 4407
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'B', '2026-08-27'::DATE, 1, 4407, 6194, 10698, 24, 0, '22270826B', NULL, '2026-08-27 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-27'::DATE AND pe.shift = 'B' AND pe.start_count = 4407 AND pe.end_count = 6194
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-28'::DATE, 1, 9403, 9590, 1100, 22, 0, '8280826A', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'A' AND pe.start_count = 9403 AND pe.end_count = 9590
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-28'::DATE, 1, 0, 150, 551, 49, 110, '10280826A', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 150
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-28'::DATE, 1, 150, 525, 1468, 32, 0, '10280826A', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'A' AND pe.start_count = 150 AND pe.end_count = 525
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-08-28'::DATE, 1, 2523, 3250, 4354, 8, 0, '30280826A', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'A' AND pe.start_count = 2523 AND pe.end_count = 3250
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-08-28'::DATE, 1, 5579, 5742, 2593, 15, 0, '35280826A', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'LAC Blue' OR p.shrp_part_code = 'LAC Blue' OR p.customer_part_no = 'LAC Blue')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'A' AND pe.start_count = 5579 AND pe.end_count = 5742
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-08-28'::DATE, 1, 3250, 3730, 2880, 0, 0, '30280826A', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'A' AND pe.start_count = 3250 AND pe.end_count = 3730
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-08-28'::DATE, 1, 0, 21, 1, 125, 360, 'P1280826A', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 21
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-08-28'::DATE, 1, 21, 380, 2154, 0, 30, 'P1280826A', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'A' AND pe.start_count = 21 AND pe.end_count = 380
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-08-28'::DATE, 1, 380, 1521, 6737, 109, 30, 'P1280826B', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'B' AND pe.start_count = 380 AND pe.end_count = 1521
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-08-28'::DATE, 1, 6194, 6858, 3971, 13, 0, '22280826A', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'A' AND pe.start_count = 6194 AND pe.end_count = 6858
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-08-28'::DATE, 1, 6858, 7443, 3497, 13, 0, '22280826A', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'A' AND pe.start_count = 6858 AND pe.end_count = 7443
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-08-28'::DATE, 1, 7443, 7885, 2652, 0, 0, '22280826A', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'A' AND pe.start_count = 7443 AND pe.end_count = 7885
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'B', '2026-08-28'::DATE, 1, 7885, 9854, 11814, 0, 0, '22280826B', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'B' AND pe.start_count = 7885 AND pe.end_count = 9854
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-29'::DATE, 1, 525, 1516, 3951, 13, 20, '10290826A', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'A' AND pe.start_count = 525 AND pe.end_count = 1516
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-08-29'::DATE, 1, 3730, 4502, 4632, 0, 75, '30290826A', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'VPAA' OR p.shrp_part_code = 'VPAA' OR p.customer_part_no = 'VPAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'A' AND pe.start_count = 3730 AND pe.end_count = 4502
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-08-29'::DATE, 1, 0, 91, 727, 1, 20, '39290826A', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC' OR p.customer_part_no = 'QVEAC')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 91
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE '' OR full_name ILIKE '%%' LIMIT 1), 1), 'A', '2026-08-29'::DATE, 1, 1521, 2236, 4203, 87, 0, 'P1290826A', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'A' AND pe.start_count = 1521 AND pe.end_count = 2236
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-29'::DATE, 1, 1516, 1720, 808, 8, 40, '10290826A', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'A' AND pe.start_count = 1516 AND pe.end_count = 1720
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-08-29'::DATE, 1, 91, 267, 1408, 0, 0, '39290826A', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC' OR p.customer_part_no = 'QVEAC')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'A' AND pe.start_count = 91 AND pe.end_count = 267
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-08-29'::DATE, 1, 2236, 2465, 1366, 8, 0, 'P1290826A', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'A' AND pe.start_count = 2236 AND pe.end_count = 2465
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-08-29'::DATE, 1, 2465, 2757, 1752, 0, 0, 'P1290826A', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'A' AND pe.start_count = 2465 AND pe.end_count = 2757
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'B', '2026-08-29'::DATE, 1, 2757, 3645, 5310, 18, 0, 'P2290826B', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'B' AND pe.start_count = 2757 AND pe.end_count = 3645
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-08-29'::DATE, 1, 3553, 3553, 0, 0, 145, '34290826A', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBC' OR p.shrp_part_code = 'LBC' OR p.customer_part_no = 'LBC')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'A' AND pe.start_count = 3553 AND pe.end_count = 3553
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-08-29'::DATE, 1, 0, 413, 1648, 4, 0, '20290826A', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 413
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-08-29'::DATE, 1, 9854, 9917, 378, 0, 0, '22290826A', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 16 - HW773A' OR p.shrp_part_code = 'VW DIA 16 - HW773A' OR p.customer_part_no = 'VW DIA 16 - HW773A')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'A' AND pe.start_count = 9854 AND pe.end_count = 9917
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-08-29'::DATE, 1, 0, 1384, 8275, 29, 60, '23290826A', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 1384
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-08-29'::DATE, 1, 1384, 1978, 3564, 0, 0, '23290826A', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'A' AND pe.start_count = 1384 AND pe.end_count = 1978
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-08-31'::DATE, 1, 267, 667, 3200, 0, 0, '39310826A', NULL, '2026-08-31 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC' OR p.customer_part_no = 'QVEAC')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-31'::DATE AND pe.shift = 'A' AND pe.start_count = 267 AND pe.end_count = 667
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'A', '2026-08-31'::DATE, 1, 3645, 4045, 2397, 3, 0, 'P1310826A', NULL, '2026-08-31 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-31'::DATE AND pe.shift = 'A' AND pe.start_count = 3645 AND pe.end_count = 4045
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-08-29'::DATE, 1, 1978, 4357, 14274, 0, 0, '23290826B', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'B' AND pe.start_count = 1978 AND pe.end_count = 4357
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-08-31'::DATE, 1, 4357, 4900, 3186, 72, 45, '23310826A', NULL, '2026-08-31 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-31'::DATE AND pe.shift = 'A' AND pe.start_count = 4357 AND pe.end_count = 4900
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-08-26'::DATE, 1, 559, 1037, 2282, 108, 0, '18260826A', NULL, '2026-08-26 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'QQVBA W' OR p.shrp_part_code = 'QQVBA W' OR p.customer_part_no = 'QQVBA W')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-26'::DATE AND pe.shift = 'A' AND pe.start_count = 559 AND pe.end_count = 1037
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-08-27'::DATE, 1, 1037, 1676, 3079, 116, 10, '18270826A', NULL, '2026-08-27 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'QQVBA W' OR p.shrp_part_code = 'QQVBA W' OR p.customer_part_no = 'QQVBA W')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-27'::DATE AND pe.shift = 'A' AND pe.start_count = 1037 AND pe.end_count = 1676
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-08-28'::DATE, 1, 1676, 1676, 0, 0, 15, '18280826A', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'QQVBA W' OR p.shrp_part_code = 'QQVBA W' OR p.customer_part_no = 'QQVBA W')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'A' AND pe.start_count = 1676 AND pe.end_count = 1676
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-08-28'::DATE, 1, 0, 853, 5025, 93, 50, '28280826A', NULL, '2026-08-28 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-28'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 853
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-08-29'::DATE, 1, 853, 1814, 5735, 31, 0, '28290826A', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'A' AND pe.start_count = 853 AND pe.end_count = 1814
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'Jithen' OR full_name ILIKE '%Jithen%' LIMIT 1), 1), 'B', '2026-08-29'::DATE, 1, 1814, 2135, 1926, 0, 0, '28290826B', NULL, '2026-08-29 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-29'::DATE AND pe.shift = 'B' AND pe.start_count = 1814 AND pe.end_count = 2135
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-08-31'::DATE, 1, 667, 1187, 4159, 1, 0, '39310826A', NULL, '2026-08-31 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC' OR p.customer_part_no = 'QVEAC')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-31'::DATE AND pe.shift = 'A' AND pe.start_count = 667 AND pe.end_count = 1187
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'A', '2026-08-31'::DATE, 1, 4045, 4880, 5007, 3, 0, 'P1310826A', NULL, '2026-08-31 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-31'::DATE AND pe.shift = 'A' AND pe.start_count = 4045 AND pe.end_count = 4880
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'B', '2026-08-31'::DATE, 1, 4880, 5982, 6585, 27, 0, 'P1310826B', NULL, '2026-08-31 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-31'::DATE AND pe.shift = 'B' AND pe.start_count = 4880 AND pe.end_count = 5982
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-08-31'::DATE, 1, 4900, 5663, 4576, 2, 0, '23310826A', NULL, '2026-08-31 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-31'::DATE AND pe.shift = 'A' AND pe.start_count = 4900 AND pe.end_count = 5663
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'A', '2026-08-31'::DATE, 1, 5663, 6284, 3726, 0, 0, '23310826A', NULL, '2026-08-31 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-31'::DATE AND pe.shift = 'A' AND pe.start_count = 5663 AND pe.end_count = 6284
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'B', '2026-08-31'::DATE, 1, 6284, 8662, 14248, 20, 0, '23310826B', NULL, '2026-08-31 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-31'::DATE AND pe.shift = 'B' AND pe.start_count = 6284 AND pe.end_count = 8662
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-08-31'::DATE, 1, 2135, 3092, 5660, 82, 20, '28310826A', NULL, '2026-08-31 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-31'::DATE AND pe.shift = 'A' AND pe.start_count = 2135 AND pe.end_count = 3092
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-01'::DATE, 1, 1720, 2157, 1733, 15, 45, '10010926A', NULL, '2026-09-01 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-01'::DATE AND pe.shift = 'A' AND pe.start_count = 1720 AND pe.end_count = 2157
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-01'::DATE, 1, 1187, 2100, 7304, 0, 45, '39010926A', NULL, '2026-09-01 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC' OR p.customer_part_no = 'QVEAC')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-01'::DATE AND pe.shift = 'A' AND pe.start_count = 1187 AND pe.end_count = 2100
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'A', '2026-09-01'::DATE, 1, 5982, 6449, 2700, 102, 130, 'P1010926A', NULL, '2026-09-01 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-01'::DATE AND pe.shift = 'A' AND pe.start_count = 5982 AND pe.end_count = 6449
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'A', '2026-09-01'::DATE, 1, 0, 424, 2544, 0, 120, 'P2010926A', NULL, '2026-09-01 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-01'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 424
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-01'::DATE, 1, 413, 1011, 2382, 10, 130, '20010926A', NULL, '2026-09-01 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-01'::DATE AND pe.shift = 'A' AND pe.start_count = 413 AND pe.end_count = 1011
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-01'::DATE, 1, 8662, 10355, 10122, 36, 0, '23010926A', NULL, '2026-09-01 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-01'::DATE AND pe.shift = 'A' AND pe.start_count = 8662 AND pe.end_count = 10355
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'A', '2026-09-01'::DATE, 1, 10355, 10845, 2940, 0, 0, '23010926A', NULL, '2026-09-01 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-01'::DATE AND pe.shift = 'A' AND pe.start_count = 10355 AND pe.end_count = 10845
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'B', '2026-09-01'::DATE, 1, 10845, 13020, 13000, 50, 0, '23010926B', NULL, '2026-09-01 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-01'::DATE AND pe.shift = 'B' AND pe.start_count = 10845 AND pe.end_count = 13020
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-01'::DATE, 1, 3092, 3668, 3423, 33, 180, '28010926A', NULL, '2026-09-01 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-01'::DATE AND pe.shift = 'A' AND pe.start_count = 3092 AND pe.end_count = 3668
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'B', '2026-09-01'::DATE, 1, 424, 1020, 3576, 0, 0, 'P2010926B', NULL, '2026-09-01 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-01'::DATE AND pe.shift = 'B' AND pe.start_count = 424 AND pe.end_count = 1020
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-08-31'::DATE, 1, 1115, 1115, 0, 0, 0, '4310826A', NULL, '2026-08-31 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F442 KQ' OR p.shrp_part_code = 'F442 KQ' OR p.customer_part_no = 'F442 KQ')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-31'::DATE AND pe.shift = 'A' AND pe.start_count = 1115 AND pe.end_count = 1115
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'A', '2026-08-31'::DATE, 1, 0, 65, 366, 24, 450, '1A310826A', NULL, '2026-08-31 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-08-31'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 65
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'A', '2026-09-01'::DATE, 1, 65, 819, 4515, 9, 50, '1A010926A', NULL, '2026-09-01 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-01'::DATE AND pe.shift = 'A' AND pe.start_count = 65 AND pe.end_count = 819
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'A', '2026-09-02'::DATE, 1, 1020, 1555, 2968, 242, 60, 'P2020926A', NULL, '2026-09-02 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-02'::DATE AND pe.shift = 'A' AND pe.start_count = 1020 AND pe.end_count = 1555
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-02'::DATE, 1, 1011, 1625, 2443, 13, 15, '20020926A', NULL, '2026-09-02 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-02'::DATE AND pe.shift = 'A' AND pe.start_count = 1011 AND pe.end_count = 1625
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-02'::DATE, 1, 819, 1470, 3818, 88, 15, '1A020926A', NULL, '2026-09-02 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-02'::DATE AND pe.shift = 'A' AND pe.start_count = 819 AND pe.end_count = 1470
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-02'::DATE, 1, 13020, 13846, 4899, 57, 15, '23020926A', NULL, '2026-09-02 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'VW DIA 8 - HW773B' OR p.shrp_part_code = 'VW DIA 8 - HW773B' OR p.customer_part_no = 'VW DIA 8 - HW773B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-02'::DATE AND pe.shift = 'A' AND pe.start_count = 13020 AND pe.end_count = 13846
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-02'::DATE, 1, 3668, 4493, 4917, 33, 20, '28020926A', NULL, '2026-09-02 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-02'::DATE AND pe.shift = 'A' AND pe.start_count = 3668 AND pe.end_count = 4493
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-02'::DATE, 1, 1625, 1880, 1020, 0, 5, '20020926A', NULL, '2026-09-02 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-02'::DATE AND pe.shift = 'A' AND pe.start_count = 1625 AND pe.end_count = 1880
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-02'::DATE, 1, 1470, 1551, 486, 0, 5, '1A020926A', NULL, '2026-09-02 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'CEEAA-ORANGE' OR p.shrp_part_code = 'CEEAA-ORANGE' OR p.customer_part_no = 'CEEAA-ORANGE')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-02'::DATE AND pe.shift = 'A' AND pe.start_count = 1470 AND pe.end_count = 1551
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-02'::DATE, 1, 0, 162, 904, 68, 0, '1020926A', NULL, '2026-09-02 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-02'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 162
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-02'::DATE, 1, 0, 54, 176, 40, 0, '3020926A', NULL, '2026-09-02 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ' OR p.customer_part_no = 'F442 QQ')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-02'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 54
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'A', '2026-09-02'::DATE, 1, 1555, 2039, 2856, 48, 70, 'P2020926A', NULL, '2026-09-02 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-02'::DATE AND pe.shift = 'A' AND pe.start_count = 1555 AND pe.end_count = 2039
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-02'::DATE, 1, 4493, 4668, 1050, 46, 0, '28020926A', NULL, '2026-09-02 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-02'::DATE AND pe.shift = 'A' AND pe.start_count = 4493 AND pe.end_count = 4668
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'A', '2026-09-02'::DATE, 1, 4668, 5116, 2688, 0, 0, '28020926A', NULL, '2026-09-02 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-02'::DATE AND pe.shift = 'A' AND pe.start_count = 4668 AND pe.end_count = 5116
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-09-02'::DATE, 1, 5116, 5999, 5208, 90, 0, '28020926B', NULL, '2026-09-02 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-02'::DATE AND pe.shift = 'B' AND pe.start_count = 5116 AND pe.end_count = 5999
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'B', '2026-09-02'::DATE, 1, 2039, 2277, 1246, 182, 0, 'P2020926B', NULL, '2026-09-02 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-02'::DATE AND pe.shift = 'B' AND pe.start_count = 2039 AND pe.end_count = 2277
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 2157, 2725, 2256, 16, 20, '10030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 2157 AND pe.end_count = 2725
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 2277, 2578, 1757, 49, 75, 'P2030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 2277 AND pe.end_count = 2578
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 1880, 1907, 101, 7, 30, '20030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'PDPKA' OR p.shrp_part_code = 'PDPKA' OR p.customer_part_no = 'PDPKA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 1880 AND pe.end_count = 1907
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 162, 560, 2374, 14, 25, '1030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 162 AND pe.end_count = 560
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 5999, 6537, 3198, 30, 20, '28030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 5999 AND pe.end_count = 6537
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 0, 430, 2533, 47, 85, 'B1030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 430
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'Jithen' OR full_name ILIKE '%Jithen%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 54, 439, 1495, 45, 30, '3030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ' OR p.customer_part_no = 'F442 QQ')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 54 AND pe.end_count = 439
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 2725, 3200, 1900, 0, 0, '10030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 2725 AND pe.end_count = 3200
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 2578, 2850, 1590, 42, 30, 'P2030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 2578 AND pe.end_count = 2850
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 430, 760, 1980, 0, 0, 'B1030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 430 AND pe.end_count = 760
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 560, 900, 2040, 0, 0, '1030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 560 AND pe.end_count = 900
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 439, 760, 1268, 16, 0, '3030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ' OR p.customer_part_no = 'F442 QQ')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 439 AND pe.end_count = 760
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 6537, 6960, 2471, 67, 0, '28030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 6537 AND pe.end_count = 6960
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 760, 920, 618, 22, 0, '3030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'F442 QQ' OR p.shrp_part_code = 'F442 QQ' OR p.customer_part_no = 'F442 QQ')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 760 AND pe.end_count = 920
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 3200, 3457, 1014, 14, 0, '10030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 3200 AND pe.end_count = 3457
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 2850, 3000, 900, 0, 0, 'P2030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 2850 AND pe.end_count = 3000
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 2100, 2100, 0, 0, 0, '39030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEAC' OR p.shrp_part_code = 'QVEAC' OR p.customer_part_no = 'QVEAC')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 2100 AND pe.end_count = 2100
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'MOHANRAJ' OR full_name ILIKE '%MOHANRAJ%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 0, 230, 886, 34, 390, '9030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 230
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 760, 1106, 2076, 0, 0, 'B1030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 760 AND pe.end_count = 1106
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 1106, 1630, 3144, 0, 0, 'B1030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 1106 AND pe.end_count = 1630
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'B', '2026-09-03'::DATE, 1, 1630, 3180, 9253, 47, 120, 'B1030926B', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'B' AND pe.start_count = 1630 AND pe.end_count = 3180
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 900, 1070, 1020, 0, 0, '1030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 900 AND pe.end_count = 1070
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 6960, 7184, 1292, 52, 0, '28030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 6960 AND pe.end_count = 7184
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'A', '2026-09-03'::DATE, 1, 7184, 7519, 1946, 64, 0, '28030926A', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'A' AND pe.start_count = 7184 AND pe.end_count = 7519
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'B', '2026-09-03'::DATE, 1, 7519, 7595, 456, 0, 20, '28030926B', NULL, '2026-09-03 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-03'::DATE AND pe.shift = 'B' AND pe.start_count = 7519 AND pe.end_count = 7595
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 3457, 4015, 2191, 41, 30, '10040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 3457 AND pe.end_count = 4015
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 230, 733, 1941, 71, 30, '9040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 230 AND pe.end_count = 733
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 3180, 3925, 4468, 2, 30, 'B1040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 3180 AND pe.end_count = 3925
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE '' OR full_name ILIKE '%%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 1070, 1485, 2486, 4, 30, '1040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 1070 AND pe.end_count = 1485
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 7595, 8059, 2732, 52, 30, '28040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 7595 AND pe.end_count = 8059
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 3000, 3350, 2077, 23, 45, 'P2040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 3000 AND pe.end_count = 3350
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PANDIYAN' OR full_name ILIKE '%PANDIYAN%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 4015, 4324, 1222, 14, 0, '10040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 4015 AND pe.end_count = 4324
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 733, 970, 926, 22, 0, '9040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 733 AND pe.end_count = 970
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 3350, 3660, 1829, 31, 20, 'P2040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 3350 AND pe.end_count = 3660
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 3925, 4530, 3630, 0, 0, 'B1040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 3925 AND pe.end_count = 4530
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 1485, 1850, 2190, 0, 0, '1040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 1485 AND pe.end_count = 1850
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 8059, 8417, 2113, 35, 0, '28040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 8059 AND pe.end_count = 8417
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PANDIYAN' OR full_name ILIKE '%PANDIYAN%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 4324, 4577, 1006, 6, 0, '10040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 4324 AND pe.end_count = 4577
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 970, 1145, 691, 9, 0, '9040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 970 AND pe.end_count = 1145
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 4530, 4890, 2160, 0, 0, 'B1040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 4530 AND pe.end_count = 4890
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 4890, 5459, 3414, 0, 0, 'B1040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 4890 AND pe.end_count = 5459
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 1850, 2440, 3532, 8, 0, '1040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 1850 AND pe.end_count = 2440
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 8417, 8602, 1074, 36, 0, '28040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 8417 AND pe.end_count = 8602
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 3660, 3778, 558, 150, 30, 'P2040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 3660 AND pe.end_count = 3778
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 1145, 1345, 781, 19, 90, '9040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 1145 AND pe.end_count = 1345
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'B', '2026-09-04'::DATE, 1, 1345, 1827, 1851, 77, 0, '9040926B', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'B' AND pe.start_count = 1345 AND pe.end_count = 1827
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-04'::DATE, 1, 0, 518, 2056, 16, 250, '16040926A', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 518
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'B', '2026-09-04'::DATE, 1, 2440, 2988, 3223, 65, 0, '1040926B', NULL, '2026-09-04 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-04'::DATE AND pe.shift = 'B' AND pe.start_count = 2440 AND pe.end_count = 2988
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-05'::DATE, 1, 4577, 5340, 3052, 0, 30, '10050926A', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'A' AND pe.start_count = 4577 AND pe.end_count = 5340
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-05'::DATE, 1, 5459, 6400, 5639, 7, 20, 'B1050926A', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'BH-DIA 16 - MAA' OR p.shrp_part_code = 'BH-DIA 16 - MAA' OR p.customer_part_no = 'BH-DIA 16 - MAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'A' AND pe.start_count = 5459 AND pe.end_count = 6400
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'A', '2026-09-05'::DATE, 1, 3778, 4435, 3886, 56, 91, 'P2050926A', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'A' AND pe.start_count = 3778 AND pe.end_count = 4435
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-05'::DATE, 1, 8602, 9542, 5519, 121, 20, '28050926A', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'A' AND pe.start_count = 8602 AND pe.end_count = 9542
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'A', '2026-09-05'::DATE, 1, 2988, 3376, 2300, 28, 20, '1050926A', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'A' AND pe.start_count = 2988 AND pe.end_count = 3376
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'A', '2026-09-05'::DATE, 1, 3376, 3902, 3154, 2, 0, '1050926A', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'A' AND pe.start_count = 3376 AND pe.end_count = 3902
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-05'::DATE, 1, 518, 1500, 3917, 11, 20, '16050926A', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'A' AND pe.start_count = 518 AND pe.end_count = 1500
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-05'::DATE, 1, 1827, 1945, 470, 2, 20, '9050926A', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'A' AND pe.start_count = 1827 AND pe.end_count = 1945
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-05'::DATE, 1, 1945, 1945, 0, 0, 0, '9050926A', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'A' AND pe.start_count = 1945 AND pe.end_count = 1945
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'A', '2026-09-05'::DATE, 1, 0, 955, 7613, 27, 120, '12050926A', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UGKCA' OR p.shrp_part_code = 'UGKCA' OR p.customer_part_no = 'UGKCA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 955
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-05'::DATE, 1, 0, 696, 2776, 8, 60, '25050926A', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 696
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'B', '2026-09-05'::DATE, 1, 696, 1920, 4896, 0, 20, '25050926B', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'B' AND pe.start_count = 696 AND pe.end_count = 1920
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-05'::DATE, 1, 5340, 5880, 2160, 0, 0, '10050926A', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'A' AND pe.start_count = 5340 AND pe.end_count = 5880
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-05'::DATE, 1, 5880, 6540, 2640, 0, 0, '10050926A', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'A' AND pe.start_count = 5880 AND pe.end_count = 6540
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'B', '2026-09-05'::DATE, 1, 6540, 8032, 5968, 0, 0, '10050926B', NULL, '2026-09-05 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-05'::DATE AND pe.shift = 'B' AND pe.start_count = 6540 AND pe.end_count = 8032
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 8032, 8463, 1696, 28, 30, '10070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 8032 AND pe.end_count = 8463
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 9542, 9970, 2536, 32, 20, '28070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 9542 AND pe.end_count = 9970
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 1500, 1970, 1863, 17, 0, '16070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 1500 AND pe.end_count = 1970
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 1920, 2258, 1335, 17, 20, '25070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 1920 AND pe.end_count = 2258
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 2258, 2640, 1528, 0, 0, '25070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 2258 AND pe.end_count = 2640
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 3902, 4270, 2208, 0, 0, '1070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'A710' OR p.shrp_part_code = 'A710' OR p.customer_part_no = 'A710')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 3902 AND pe.end_count = 4270
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 4270, 4350, 1216, 64, 150, '2070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 4270 AND pe.end_count = 4350
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 0, 90, 1440, 0, 0, '2070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 90
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 9970, 10425, 2689, 41, 0, '28070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 9970 AND pe.end_count = 10425
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 1970, 2483, 2041, 11, 0, '16070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 1970 AND pe.end_count = 2483
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 8463, 9127, 2624, 32, 0, '10070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 8463 AND pe.end_count = 9127
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 9127, 9200, 285, 7, 0, '10070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 9127 AND pe.end_count = 9200
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 2640, 3020, 1520, 0, 0, '25070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 2640 AND pe.end_count = 3020
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 10425, 10472, 259, 23, 0, '28070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 10425 AND pe.end_count = 10472
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-09-07'::DATE, 1, 3020, 4102, 4316, 12, 0, '25070926B', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'B' AND pe.start_count = 3020 AND pe.end_count = 4102
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 90, 416, 5216, 0, 0, '2070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 90 AND pe.end_count = 416
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'B', '2026-09-07'::DATE, 1, 416, 768, 5632, 0, 0, '2070926B', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'B' AND pe.start_count = 416 AND pe.end_count = 768
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-09-07'::DATE, 1, 2483, 2720, 948, 0, 110, '16070926A', NULL, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'A' AND pe.start_count = 2483 AND pe.end_count = 2720
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-09-07'::DATE, 1, 4102, 4190, 352, 0, 0, '25070926B', 0.81, '2026-09-07 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-07'::DATE AND pe.shift = 'B' AND pe.start_count = 4102 AND pe.end_count = 4190
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 9200, 9550, 1339, 61, 0, 'MOULD CHANGEOVER TO AN6B DUE TO PLAN COMPLETED FOR AA02Y', 1.01, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AA02 Y' OR p.shrp_part_code = 'AA02 Y' OR p.customer_part_no = 'AA02 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 9200 AND pe.end_count = 9550
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 0, 101, 278, 126, 75, 'the mould changed an6b not run properly due to paramter not met the spec', 0.67, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 101
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 4190, 4710, 2032, 48, 0, '25080926A', 0.95, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 4190 AND pe.end_count = 4710
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 768, 1170, 6334, 98, 0, '2080926A', 0.89, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 768 AND pe.end_count = 1170
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 955, 955, 0, 0, 0, 'mold change', NULL, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UGKCA' OR p.shrp_part_code = 'UGKCA' OR p.customer_part_no = 'UGKCA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 955 AND pe.end_count = 955
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 2720, 3306, 2320, 24, 0, '16080926A', 1.17, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 2720 AND pe.end_count = 3306
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 10472, 10750, 1620, 48, 0, 'Plan completed and mould changes to ATBAB', 0.9, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '2200' OR p.shrp_part_code = '2200' OR p.customer_part_no = '2200')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 10472 AND pe.end_count = 10750
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 0, 142, 266, 18, 20, 'HAND MOLDING MACHINE OPERATING', 0.55, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 142
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 101, 485, 1490, 46, 0, '9080926A', 0.8, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 101 AND pe.end_count = 485
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 485, 835, 1383, 17, 0, '9080926A', 0.97, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 485 AND pe.end_count = 835
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 142, 396, 464, 44, 20, 'MANUVAL MOULD', 0.67, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 142 AND pe.end_count = 396
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 4710, 5090, 1520, 0, 0, '25080926A', 1, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 4710 AND pe.end_count = 5090
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 1170, 1715, 8414, 306, 20, '2080926A', 0.91, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 1170 AND pe.end_count = 1715
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-09-08'::DATE, 1, 1715, 2310, 9387, 133, 20, 'machine off at 05:15 due to stripper plate not opening issue', 0.89, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'B' AND pe.start_count = 1715 AND pe.end_count = 2310
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'B', '2026-09-08'::DATE, 1, 835, 2237, 5496, 112, 25, '9080926B', 1.01, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'B' AND pe.start_count = 835 AND pe.end_count = 2237
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 4710, 5090, 1472, 48, 0, '25080926A', 1, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 4710 AND pe.end_count = 5090
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 3306, 3720, 1633, 23, 0, '16080926A', 1.18, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 3306 AND pe.end_count = 3720
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-09-08'::DATE, 1, 3720, 4120, 1561, 39, 510, 'MACHINE ON DUE TO ISSUE IN HSIM 05', 1.14, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'B' AND pe.start_count = 3720 AND pe.end_count = 4120
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 0, 399, 2268, 126, 145, 'mold change', NULL, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA' OR p.customer_part_no = 'UMNAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 399
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 2237, 3175, 3681, 71, 15, '9090926A', 1.16, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 2237 AND pe.end_count = 3175
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 399, 845, 2637, 39, 30, 'plan complete and the changes to ndgaa. umnaa mould ejector moving forward slowly so the output is low', 0.68, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMNAA' OR p.shrp_part_code = 'UMNAA' OR p.customer_part_no = 'UMNAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 399 AND pe.end_count = 845
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 4435, 4940, 2999, 31, 95, 'runner stucks in the material so the efficiency low', 0.75, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 4435 AND pe.end_count = 4940
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PANDIYAN' OR full_name ILIKE '%PANDIYAN%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 5090, 5090, 0, 0, 125, 'plan completed and machines changes LBB', NULL, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'NCBB' OR p.shrp_part_code = 'NCBB' OR p.customer_part_no = 'NCBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 5090 AND pe.end_count = 5090
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 0, 250, 982, 18, 135, '33090926A', 0.89, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 250
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 3175, 3405, 920, 0, 0, '9090926A', 1.28, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 3175 AND pe.end_count = 3405
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 250, 433, 732, 0, 0, '33090926A', 0.86, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 250 AND pe.end_count = 433
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 433, 742, 1235, 1, 0, '33090926A', 0.97, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 433 AND pe.end_count = 742
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 4940, 5060, 720, 0, 15, 'P2090926A', 0.77, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 4940 AND pe.end_count = 5060
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 2310, 2485, 2780, 20, 15, 'NCBA nill stock hence changed', 0.8, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 2310 AND pe.end_count = 2485
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 0, 490, 1940, 20, 240, '24090926A', 0.84, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 490
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'B', '2026-09-09'::DATE, 1, 490, 1683, 4758, 14, 20, '24090926B', 0.94, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'B' AND pe.start_count = 490 AND pe.end_count = 1683
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-09-09'::DATE, 1, 742, 2080, 5352, 0, 20, '33090926B', 1.08, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'B' AND pe.start_count = 742 AND pe.end_count = 2080
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 396, 1230, 1634, 34, 40, 'W18090926A', 0.89, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 396 AND pe.end_count = 1230
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 4120, 5022, 3585, 23, 0, '16090926A', 1.06, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 4120 AND pe.end_count = 5022
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 1230, 1486, 488, 24, 45, 'W18090926A', 0.78, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 1230 AND pe.end_count = 1486
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 5022, 5224, 774, 34, 15, 'Plan Completed Machine off mould change < AA03> TO <2100>', 0.97, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'AA03' OR p.shrp_part_code = 'AA03' OR p.customer_part_no = 'AA03')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 5022 AND pe.end_count = 5224
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'MOHANRAJ' OR full_name ILIKE '%MOHANRAJ%' LIMIT 1), 1), 'A', '2026-09-08'::DATE, 1, 0, 132, 132, 0, 330, '5080926A', NULL, '2026-09-08 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 03' AND (p.part_code = 'F442 WB' OR p.shrp_part_code = 'F442 WB' OR p.customer_part_no = 'F442 WB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-08'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 132
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-09'::DATE, 1, 132, 484, 336, 16, 0, '5090926A', NULL, '2026-09-09 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 03' AND (p.part_code = 'F442 WB' OR p.shrp_part_code = 'F442 WB' OR p.customer_part_no = 'F442 WB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-09'::DATE AND pe.shift = 'A' AND pe.start_count = 132 AND pe.end_count = 484
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 2080, 2518, 1752, 0, 0, '33100926A', 1.03, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 2080 AND pe.end_count = 2518
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 1683, 2106, 1692, 0, 0, '24100926A', 0.97, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 1683 AND pe.end_count = 2106
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 3405, 3910, 1972, 48, 15, '9100926A', 1.12, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 3405 AND pe.end_count = 3910
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 0, 91, 388, 158, 55, '27100926A', 1.11, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 91
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 1486, 1781, 590, 0, 15, 'plan completed machine off mould change <ATBAB> TO <9AB>', 0.78, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = 'ATBAB' OR p.shrp_part_code = 'ATBAB' OR p.customer_part_no = 'ATBAB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 1486 AND pe.end_count = 1781
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 5060, 5406, 2048, 28, 30, 'P2100926A', 0.8, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 5060 AND pe.end_count = 5406
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 3910, 4327, 1668, 0, 0, '9100926A', 1.16, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 3910 AND pe.end_count = 4327
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 5406, 5710, 1819, 5, 0, 'P2100926A', 0.82, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 5406 AND pe.end_count = 5710
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 2518, 2846, 1312, 0, 0, '33100926A', 1.03, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 2518 AND pe.end_count = 2846
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 2106, 2423, 1260, 8, 0, '24100926A', 0.97, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 2106 AND pe.end_count = 2423
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 91, 437, 2056, 20, 0, '27100926A', 1.06, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 91 AND pe.end_count = 437
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 4327, 4545, 871, 1, 0, '9100926A', 1.21, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 4327 AND pe.end_count = 4545
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 0, 906, 5337, 99, 45, '47100926A', 1.04, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'NDGAA' OR p.shrp_part_code = 'NDGAA' OR p.customer_part_no = 'NDGAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 906
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 5710, 5855, 861, 9, 0, 'P2100926A', 0.78, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 5710 AND pe.end_count = 5855
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 2846, 3364, 2072, 0, 0, '33100926A', 0.98, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 2846 AND pe.end_count = 3364
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 2423, 2590, 668, 0, 0, '24100926A', 0.77, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 2423 AND pe.end_count = 2590
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 2590, 2890, 1200, 0, 0, '24100926A', 0.92, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 2590 AND pe.end_count = 2890
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 437, 610, 990, 48, 0, '27100926A', 0.79, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 437 AND pe.end_count = 610
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 610, 954, 2003, 61, 0, '27100926A', 1.05, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 610 AND pe.end_count = 954
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 0, 125, 479, 21, 0, 'B9100926A', NULL, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 125
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-09-10'::DATE, 1, 954, 2469, 9045, 45, 30, '27100926B', 1.21, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'B' AND pe.start_count = 954 AND pe.end_count = 2469
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'B', '2026-09-10'::DATE, 1, 2890, 4074, 4735, 1, 25, '24100926B', 0.94, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'B' AND pe.start_count = 2890 AND pe.end_count = 4074
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 4545, 5175, 2485, 35, 20, '9110926A', 2.2, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 4545 AND pe.end_count = 5175
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 906, 906, 0, 0, 0, 'PLAN COMPLETED MACHINE OFF MOULD CHANGE < NDGAA> TO <UMEAA>', NULL, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'NDGAA' OR p.shrp_part_code = 'NDGAA' OR p.customer_part_no = 'NDGAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 906 AND pe.end_count = 906
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 3364, 3795, 1715, 9, 60, '33110926A', 1.02, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 3364 AND pe.end_count = 3795
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 4074, 4525, 1803, 1, 20, '24110926A', 0.89, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 4074 AND pe.end_count = 4525
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 2469, 3178, 4235, 19, 0, '27110926A', 1.3, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 2469 AND pe.end_count = 3178
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 125, 705, 2264, 56, 0, 'B9110926A', NULL, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 125 AND pe.end_count = 705
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 3178, 3250, 432, 0, 0, 'Plan Completed MACHINE OFF MOULD CHANGE <2100> TO <NADB>', 1.32, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = '2100' OR p.shrp_part_code = '2100' OR p.customer_part_no = '2100')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 3178 AND pe.end_count = 3250
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 5855, 5855, 0, 0, 0, 'Plan Completed MACHINE OFF MOULD CHANGE <PUNE S> TO <PUNE b>', NULL, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE S' OR p.shrp_part_code = 'PUNE S' OR p.customer_part_no = 'PUNE S')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 5855 AND pe.end_count = 5855
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 0, 330, 1938, 42, 145, 'P1110926A', 1.03, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 330
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'THILAKA' OR full_name ILIKE '%THILAKA%' LIMIT 1), 1), 'A', '2026-09-10'::DATE, 1, 484, 1059, 567, 8, 40, '5100926A', NULL, '2026-09-10 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 03' AND (p.part_code = 'F442 WB' OR p.shrp_part_code = 'F442 WB' OR p.customer_part_no = 'F442 WB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-10'::DATE AND pe.shift = 'A' AND pe.start_count = 484 AND pe.end_count = 1059
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 705, 960, 975, 45, 0, 'B9110926A', NULL, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 705 AND pe.end_count = 960
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 330, 600, 1619, 1, 0, 'P1110926A', 1.09, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 330 AND pe.end_count = 600
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 4525, 4710, 740, 0, 0, '24110926A', 0.85, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 4525 AND pe.end_count = 4710
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 3795, 4000, 820, 0, 0, '33110926A', 0.97, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 3795 AND pe.end_count = 4000
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 5175, 5480, 1218, 2, 0, '9110926A', 1.27, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 5175 AND pe.end_count = 5480
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 4000, 4088, 352, 0, 0, '33110926A', 0.83, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 4000 AND pe.end_count = 4088
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUJATHA' OR full_name ILIKE '%SUJATHA%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 0, 724, 2853, 43, 90, '46110926A', NULL, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA' OR p.customer_part_no = 'UMEAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 724
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 600, 809, 1254, 0, 0, 'P1110926A', 1.12, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 03' AND (p.part_code = 'PUNE B' OR p.shrp_part_code = 'PUNE B' OR p.customer_part_no = 'PUNE B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 600 AND pe.end_count = 809
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 0, 755, 2912, 108, 60, '110926A', NULL, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB' OR p.customer_part_no = 'NA-DB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 755
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 960, 1150, 738, 22, 0, 'B9110926A', NULL, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 960 AND pe.end_count = 1150
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 5480, 5720, 960, 0, 0, '9110926A', 1.33, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 5480 AND pe.end_count = 5720
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 4710, 4880, 676, 4, 0, '24110926A', 0.78, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 4710 AND pe.end_count = 4880
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 4880, 5190, 1240, 0, 0, '24110926A', 0.95, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 4880 AND pe.end_count = 5190
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 4088, 4088, 0, 0, 0, 'MOLD CHANGE', NULL, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'LBB' OR p.shrp_part_code = 'LBB' OR p.customer_part_no = 'LBB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 4088 AND pe.end_count = 4088
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-11'::DATE, 1, 0, 280, 1006, 114, 90, '21110926A', 0.91, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 280
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-09-11'::DATE, 1, 5720, 6455, 2918, 22, 360, '9110926B', 1.02, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'B' AND pe.start_count = 5720 AND pe.end_count = 6455
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-09-11'::DATE, 1, 280, 895, 2429, 31, 0, '21110926B', 0.87, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'B' AND pe.start_count = 280 AND pe.end_count = 895
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'B', '2026-09-11'::DATE, 1, 5190, 6370, 4709, 11, 25, '24110926B', 0.93, '2026-09-11 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-11'::DATE AND pe.shift = 'B' AND pe.start_count = 5190 AND pe.end_count = 6370
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 895, 1600, 2801, 19, 15, '21120926A', 0.99, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 895 AND pe.end_count = 1600
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 6370, 6370, 0, 0, 0, 'Plan Completed machine off mould change <NCBA> TO <HA715>', NULL, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'NCBA' OR p.shrp_part_code = 'NCBA' OR p.customer_part_no = 'NCBA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 6370 AND pe.end_count = 6370
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 0, 505, 2976, 54, 105, '14120926A', 0.99, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501' OR p.customer_part_no = 'HA715 - W501')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 505
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 1150, 1815, 2601, 59, 15, 'B9120926A', NULL, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 1150 AND pe.end_count = 1815
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 6455, 7271, 3252, 12, 15, 'Plan Completed MACHINE OFF mould change < AN6B> TO < F885 Y>', 1.17, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'AN6B' OR p.shrp_part_code = 'AN6B' OR p.customer_part_no = 'AN6B')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 6455 AND pe.end_count = 7271
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 1600, 1720, 479, 1, 0, 'Plan Completed Machine off Mould change <DH7AA> TO <F364 16>', 0.97, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'DH7AA' OR p.shrp_part_code = 'DH7AA' OR p.customer_part_no = 'DH7AA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 1600 AND pe.end_count = 1720
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 755, 1001, 948, 36, 30, 'Plan Completed MACHINE OFF MOULD CHANGE <NA-DB> TO <NA-LC>', NULL, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-DB' OR p.shrp_part_code = 'NA-DB' OR p.customer_part_no = 'NA-DB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 755 AND pe.end_count = 1001
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 0, 525, 1929, 171, 75, 'W15120926A', NULL, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC' OR p.customer_part_no = 'NA-LC')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 525
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'AMBIKA' OR full_name ILIKE '%AMBIKA%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 0, 205, 1230, 0, 75, '8120926A', 1.07, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 205
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 205, 570, 2189, 1, 0, '8120926A', 1.08, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 205 AND pe.end_count = 570
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'BIJOY' OR full_name ILIKE '%BIJOY%' LIMIT 1), 1), 'B', '2026-09-12'::DATE, 1, 570, 2210, 9840, 0, 0, '8120926B', 1.21, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 01' AND (p.part_code = 'F885 Y' OR p.shrp_part_code = 'F885 Y' OR p.customer_part_no = 'F885 Y')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'B' AND pe.start_count = 570 AND pe.end_count = 2210
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 724, 1010, 1123, 21, 15, 'Plan Completed MACHINE OFF MOULD CHANGE < UMEAA> TO < QVEBC>', NULL, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'UMEAA' OR p.shrp_part_code = 'UMEAA' OR p.customer_part_no = 'UMEAA')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 724 AND pe.end_count = 1010
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'VIJAYA' OR full_name ILIKE '%VIJAYA%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 0, 557, 4398, 58, 50, '40120926A', 0.99, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 02' AND (p.part_code = 'QVEBC' OR p.shrp_part_code = 'QVEBC' OR p.customer_part_no = 'QVEBC')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 557
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JIBAN' OR full_name ILIKE '%JIBAN%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 0, 280, 4420, 60, 105, '2120926A', 0.91, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 0 AND pe.end_count = 280
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'JITAN BISWAL' OR full_name ILIKE '%JITAN BISWAL%' LIMIT 1), 1), 'B', '2026-09-12'::DATE, 1, 280, 1240, 15286, 74, 30, '2120926B', 1.13, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 04' AND (p.part_code = 'F364 16C' OR p.shrp_part_code = 'F364 16C' OR p.customer_part_no = 'F364 16C')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'B' AND pe.start_count = 280 AND pe.end_count = 1240
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'SUBHANKAR BISWAL' OR full_name ILIKE '%SUBHANKAR BISWAL%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 505, 829, 1942, 2, 0, '14120926A', 1.08, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'HSIM - 05' AND (p.part_code = 'HA715 - W501' OR p.shrp_part_code = 'HA715 - W501' OR p.customer_part_no = 'HA715 - W501')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 505 AND pe.end_count = 829
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 525, 751, 898, 6, 0, 'W15120926A', NULL, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC' OR p.customer_part_no = 'NA-LC')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 525 AND pe.end_count = 751
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'DHATCHAYANI' OR full_name ILIKE '%DHATCHAYANI%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 1815, 1968, 606, 6, 0, 'B9120926A', NULL, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VIM - 02' AND (p.part_code = '9AB' OR p.shrp_part_code = '9AB' OR p.customer_part_no = '9AB')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 1815 AND pe.end_count = 1968
)
LIMIT 1;
INSERT INTO production_entries (machine_id, part_id, operator_user_id, shift, entry_date, hour_slot, start_count, end_count, good_qty, reject_qty, downtime_minutes, remarks, efficiency_pct, created_at)
SELECT m.id, p.id, COALESCE((SELECT id FROM users WHERE username ILIKE 'PARAMESHWAR' OR full_name ILIKE '%PARAMESHWAR%' LIMIT 1), 1), 'A', '2026-09-12'::DATE, 1, 751, 843, 368, 0, 120, 'W15120926A', NULL, '2026-09-12 08:00:00'::TIMESTAMPTZ
FROM machines m, parts p
WHERE m.machine_code = 'VSIM - 01' AND (p.part_code = 'NA-LC' OR p.shrp_part_code = 'NA-LC' OR p.customer_part_no = 'NA-LC')
AND NOT EXISTS (
  SELECT 1 FROM production_entries pe
  WHERE pe.machine_id = m.id AND pe.entry_date = '2026-09-12'::DATE AND pe.shift = 'A' AND pe.start_count = 751 AND pe.end_count = 843
)
LIMIT 1;

COMMIT;