-- Migration 006: Customer Duplicate Consolidation & Sequential Renumbering
-- Consolidates duplicate customers (CUST- duplicates with SHRP/CUS-)
-- Migrates parts & dispatch references, renames to SHRP/C-01 format

BEGIN;

-- Step 1: Migrate active parts from duplicates to masters
UPDATE parts SET customer_id = 3 WHERE customer_id = 1 AND active = TRUE;  -- CUST-001 → SHRP/CUS-001 (Hanon Automotive)
UPDATE parts SET customer_id = 8 WHERE customer_id = 2 AND active = TRUE;  -- CUST-002 → SHRP/CUS-006 (Avadh Rail Infra)
UPDATE parts SET customer_id = 9 WHERE customer_id = 5 AND active = TRUE;  -- CUST-005 → SHRP/CUS-003 (Hanon Climate)
UPDATE parts SET customer_id = 10 WHERE customer_id = 10 AND active = TRUE; -- CUST-010 → SHRP/CUS-004 (Wonjin)

-- Step 2: Migrate dispatch_entries references
UPDATE dispatch_entries SET customer_id = 3 WHERE customer_id IN (1, 4);   -- Both Hanon → SHRP/CUS-001
UPDATE dispatch_entries SET customer_id = 8 WHERE customer_id = 2;        -- CUST-002 → SHRP/CUS-006
UPDATE dispatch_entries SET customer_id = 9 WHERE customer_id = 5;        -- CUST-005 → SHRP/CUS-003
UPDATE dispatch_entries SET customer_id = 10 WHERE customer_id = 10;      -- CUST-010 → SHRP/CUS-004

-- Step 3: Soft-delete duplicate customers (preserve audit trail)
UPDATE customers
SET active = FALSE,
    deleted_at = NOW(),
    deleted_by = 1  -- System admin
WHERE id IN (1, 2, 4, 5, 10);

-- Step 4: Renumber SHRP/CUS- to sequential SHRP/C- format
UPDATE customers SET customer_code = 'SHRP/C-01' WHERE id = 3;   -- SHRP/CUS-001 → SHRP/C-01 (Hanon Automotive)
UPDATE customers SET customer_code = 'SHRP/C-02' WHERE id = 9;   -- SHRP/CUS-003 → SHRP/C-02 (Hanon Climate)
UPDATE customers SET customer_code = 'SHRP/C-03' WHERE id = 10;  -- SHRP/CUS-004 → SHRP/C-03 (Wonjin)
UPDATE customers SET customer_code = 'SHRP/C-04' WHERE id = 8;   -- SHRP/CUS-006 → SHRP/C-04 (Avadh Rail Infra)
UPDATE customers SET customer_code = 'SHRP/C-05' WHERE id = 11;  -- SHRP/CUS-007 → SHRP/C-05 (Necco Tools)
UPDATE customers SET customer_code = 'SHRP/C-06' WHERE id = 12;  -- SHRP/CUS-008 → SHRP/C-06 (Sona BLW)
UPDATE customers SET customer_code = 'SHRP/C-07' WHERE id = 13;  -- SHRP/CUS-009 → SHRP/C-07 (Precise Lapping)
UPDATE customers SET customer_code = 'SHRP/C-08' WHERE id = 14;  -- SHRP/CUS-010 → SHRP/C-08 (Ponnmore)

-- Step 5: Log deletion audit trail
INSERT INTO deletion_audit_log (entity_type, entity_id, entity_code, reason, deleted_by_name, created_at)
VALUES
  ('customer', 1, 'CUST-001', 'Duplicate consolidation - merged into SHRP/C-01 (Hanon Automotive)', 'SYSTEM', NOW()),
  ('customer', 2, 'CUST-002', 'Duplicate consolidation - merged into SHRP/C-04 (Avadh Rail Infra)', 'SYSTEM', NOW()),
  ('customer', 4, 'SHRP/CUS-002', 'Duplicate consolidation - merged into SHRP/C-01 (Hanon Automotive)', 'SYSTEM', NOW()),
  ('customer', 5, 'CUST-005', 'Duplicate consolidation - merged into SHRP/C-02 (Hanon Climate)', 'SYSTEM', NOW()),
  ('customer', 10, 'CUST-010', 'Duplicate consolidation - merged into SHRP/C-03 (Wonjin)', 'SYSTEM', NOW());

COMMIT;
