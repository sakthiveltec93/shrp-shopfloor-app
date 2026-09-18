-- Migration 006: Customer Master Consolidation
-- Strategy: Keep all SHRP/CUS- (authoritative masters), delete all CUST- (legacy), migrate parts
-- Renames SHRP/CUS-001 through SHRP/CUS-010 to sequential SHRP/C-01 through SHRP/C-10

BEGIN;

-- Step 1: Migrate active parts from all CUST- to matching SHRP/CUS- masters
UPDATE parts SET customer_id = 3 WHERE customer_id = 1 AND active = TRUE;   -- CUST-001 Hanon → SHRP/CUS-001
UPDATE parts SET customer_id = 8 WHERE customer_id = 2 AND active = TRUE;   -- CUST-002 Avadh → SHRP/CUS-006
UPDATE parts SET customer_id = 3 WHERE customer_id = 3 AND active = TRUE;   -- CUST-003 → SHRP/CUS-001 (Hanon master)
UPDATE parts SET customer_id = 3 WHERE customer_id = 4 AND active = TRUE;   -- CUST-004 Hanon Chennai → SHRP/CUS-001
UPDATE parts SET customer_id = 3 WHERE customer_id = 5 AND active = TRUE;   -- CUST-005 Hanon Climate → SHRP/CUS-001
UPDATE parts SET customer_id = 3 WHERE customer_id = 6 AND active = TRUE;   -- CUST-006 Hanon Pune → SHRP/CUS-001
UPDATE parts SET customer_id = 10 WHERE customer_id = 10 AND active = TRUE; -- CUST-010 Wonjin → SHRP/CUS-004

-- Step 2: Migrate dispatch_entries references (same mapping)
UPDATE dispatch_entries SET customer_id = 3 WHERE customer_id IN (1, 3, 4, 5, 6);
UPDATE dispatch_entries SET customer_id = 8 WHERE customer_id = 2;
UPDATE dispatch_entries SET customer_id = 10 WHERE customer_id = 10;

-- Step 3: Soft-delete all CUST- customers (preserve audit trail)
UPDATE customers
SET active = FALSE,
    deleted_at = NOW(),
    deleted_by = 1
WHERE customer_code LIKE 'CUST-%';

-- Step 4: Renumber all SHRP/CUS- to sequential SHRP/C- format (01-10)
UPDATE customers SET customer_code = 'SHRP/C-01' WHERE customer_code = 'SHRP/CUS-001';
UPDATE customers SET customer_code = 'SHRP/C-02' WHERE customer_code = 'SHRP/CUS-002';
UPDATE customers SET customer_code = 'SHRP/C-03' WHERE customer_code = 'SHRP/CUS-003';
UPDATE customers SET customer_code = 'SHRP/C-04' WHERE customer_code = 'SHRP/CUS-004';
UPDATE customers SET customer_code = 'SHRP/C-05' WHERE customer_code = 'SHRP/CUS-005';
UPDATE customers SET customer_code = 'SHRP/C-06' WHERE customer_code = 'SHRP/CUS-006';
UPDATE customers SET customer_code = 'SHRP/C-07' WHERE customer_code = 'SHRP/CUS-007';
UPDATE customers SET customer_code = 'SHRP/C-08' WHERE customer_code = 'SHRP/CUS-008';
UPDATE customers SET customer_code = 'SHRP/C-09' WHERE customer_code = 'SHRP/CUS-009';
UPDATE customers SET customer_code = 'SHRP/C-10' WHERE customer_code = 'SHRP/CUS-010';

-- Step 5: Log audit trail for all deleted CUST- records
INSERT INTO deletion_audit_log (entity_type, entity_id, entity_code, reason, deleted_by_name, created_at)
SELECT id, 'customer', customer_code, 'Legacy customer removal - consolidated into SHRP/C- master (GST-authoritative)', 'SYSTEM', NOW()
FROM customers
WHERE customer_code LIKE 'CUST-%' AND deleted_at IS NOT NULL;

COMMIT;
