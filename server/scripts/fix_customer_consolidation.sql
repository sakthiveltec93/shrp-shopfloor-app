-- MANUAL CUSTOMER CONSOLIDATION FIX
-- Execute this on Railway PostgreSQL to complete the failed migration
-- This migrates parts from CUST- duplicates to SHRP/CUS- masters and soft-deletes old entries

BEGIN;

-- Step 1: Migrate active parts from CUST- to SHRP/CUS- masters
UPDATE parts SET customer_id = (SELECT id FROM customers WHERE customer_code = 'SHRP/CUS-006')
WHERE customer_id IN (SELECT id FROM customers WHERE customer_code = 'CUST-002') AND active = TRUE;

UPDATE parts SET customer_id = (SELECT id FROM customers WHERE customer_code = 'SHRP/CUS-001')
WHERE customer_id IN (SELECT id FROM customers WHERE customer_code IN ('CUST-001', 'CUST-003', 'CUST-004', 'CUST-006')) AND active = TRUE;

UPDATE parts SET customer_id = (SELECT id FROM customers WHERE customer_code = 'SHRP/CUS-003')
WHERE customer_id IN (SELECT id FROM customers WHERE customer_code = 'CUST-005') AND active = TRUE;

UPDATE parts SET customer_id = (SELECT id FROM customers WHERE customer_code = 'SHRP/CUS-004')
WHERE customer_id IN (SELECT id FROM customers WHERE customer_code = 'CUST-010') AND active = TRUE;

-- Step 2: Soft-delete all CUST- records (preserve audit trail)
UPDATE customers
SET active = FALSE, deleted_at = NOW()
WHERE customer_code LIKE 'CUST-%';

-- Step 3: Log deletion audit trail
INSERT INTO deletion_audit_log (entity_type, entity_id, entity_code, reason, deleted_by_name, created_at)
SELECT 'customer', id, customer_code, 'Customer consolidation - merged into SHRP/C- master', 'SYSTEM', NOW()
FROM customers
WHERE customer_code LIKE 'CUST-%' AND deleted_at IS NOT NULL;

-- Verification: Show migrated parts count
SELECT
  'SHRP/CUS-001' as master, COUNT(*) as parts_count
FROM parts WHERE customer_id = (SELECT id FROM customers WHERE customer_code = 'SHRP/CUS-001')
UNION ALL
SELECT 'SHRP/CUS-003', COUNT(*)
FROM parts WHERE customer_id = (SELECT id FROM customers WHERE customer_code = 'SHRP/CUS-003')
UNION ALL
SELECT 'SHRP/CUS-004', COUNT(*)
FROM parts WHERE customer_id = (SELECT id FROM customers WHERE customer_code = 'SHRP/CUS-004')
UNION ALL
SELECT 'SHRP/CUS-006', COUNT(*)
FROM parts WHERE customer_id = (SELECT id FROM customers WHERE customer_code = 'SHRP/CUS-006');

COMMIT;
