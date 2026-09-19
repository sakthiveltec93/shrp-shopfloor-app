-- Migration 008: Machine parameter tolerances table
-- Stores standard tolerance ranges for process parameters per machine

BEGIN;

CREATE TABLE IF NOT EXISTS machine_parameter_tolerances (
  id SERIAL PRIMARY KEY,
  machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  parameter_name TEXT NOT NULL,
  unit TEXT,
  tolerance_min NUMERIC,
  tolerance_max NUMERIC,
  tolerance_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(machine_id, parameter_name)
);

CREATE INDEX IF NOT EXISTS idx_machine_param_tolerances ON machine_parameter_tolerances(machine_id, parameter_name);

-- Seed default tolerances for all machines
INSERT INTO machine_parameter_tolerances (machine_id, parameter_name, unit, tolerance_min, tolerance_max, tolerance_description)
SELECT m.id, param->>'name', param->>'unit', -5, 5, 'Temperature tolerance'
FROM machines m
CROSS JOIN jsonb_array_elements(
  jsonb_build_array(
    jsonb_build_object('name', 'Zone 1 Temperature', 'unit', '°C'),
    jsonb_build_object('name', 'Zone 2 Temperature', 'unit', '°C'),
    jsonb_build_object('name', 'Zone 3 Temperature', 'unit', '°C'),
    jsonb_build_object('name', 'Zone 4 Temperature', 'unit', '°C')
  )
) AS param
WHERE param->>'unit' = '°C'
AND NOT EXISTS (
  SELECT 1 FROM machine_parameter_tolerances mpt
  WHERE mpt.machine_id = m.id AND mpt.parameter_name = param->>'name'
)
ON CONFLICT DO NOTHING;

COMMIT;
