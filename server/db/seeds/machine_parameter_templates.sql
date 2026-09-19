-- Seed: Machine Process Parameter Templates
-- Defines parameter structure for different machine types

-- Example 1: 4-Zone Injection Machine (e.g., VSIM-01, CR-01)
INSERT INTO machine_process_parameter_templates (machine_id, template_name, description, parameters)
SELECT m.id,
  '4-Zone Injection Molding',
  'Standard 4-zone temperature injection molding machine',
  jsonb_build_array(
    jsonb_build_object(
      'name', 'Zone 1 Temperature',
      'type', 'numeric',
      'unit', '°C',
      'min_value', 150,
      'max_value', 280,
      'field_key', 'zone_1_temp'
    ),
    jsonb_build_object(
      'name', 'Zone 2 Temperature',
      'type', 'numeric',
      'unit', '°C',
      'min_value', 150,
      'max_value', 280,
      'field_key', 'zone_2_temp'
    ),
    jsonb_build_object(
      'name', 'Zone 3 Temperature',
      'type', 'numeric',
      'unit', '°C',
      'min_value', 150,
      'max_value', 280,
      'field_key', 'zone_3_temp'
    ),
    jsonb_build_object(
      'name', 'Zone 4 Temperature',
      'type', 'numeric',
      'unit', '°C',
      'min_value', 150,
      'max_value', 280,
      'field_key', 'zone_4_temp'
    ),
    jsonb_build_object(
      'name', 'Nozzle Temperature',
      'type', 'numeric',
      'unit', '°C',
      'min_value', 150,
      'max_value', 280,
      'field_key', 'nozzle_temp'
    ),
    jsonb_build_object(
      'name', 'Injection Pressure',
      'type', 'numeric',
      'unit', 'bar',
      'min_value', 300,
      'max_value', 1500,
      'field_key', 'injection_pressure'
    ),
    jsonb_build_object(
      'name', 'Holding Pressure',
      'type', 'numeric',
      'unit', 'bar',
      'min_value', 100,
      'max_value', 800,
      'field_key', 'holding_pressure'
    ),
    jsonb_build_object(
      'name', 'Cooling Time',
      'type', 'numeric',
      'unit', 's',
      'min_value', 5,
      'max_value', 60,
      'field_key', 'cooling_time'
    ),
    jsonb_build_object(
      'name', 'Cycle Time',
      'type', 'numeric',
      'unit', 's',
      'min_value', 10,
      'max_value', 120,
      'field_key', 'cycle_time'
    )
  )
FROM machines m
WHERE m.machine_code IN ('VSIM-01', 'CR-01', 'CR-02', 'CR-03', 'CR-04')
AND NOT EXISTS (
  SELECT 1 FROM machine_process_parameter_templates t
  WHERE t.machine_id = m.id AND t.template_name = '4-Zone Injection Molding'
);

-- Example 2: Single Zone Machine (e.g., AC-01, HG-01)
INSERT INTO machine_process_parameter_templates (machine_id, template_name, description, parameters)
SELECT m.id,
  'Single Zone Molding',
  'Simple single-zone injection molding machine',
  jsonb_build_array(
    jsonb_build_object(
      'name', 'Barrel Temperature',
      'type', 'numeric',
      'unit', '°C',
      'min_value', 150,
      'max_value', 280,
      'field_key', 'barrel_temp'
    ),
    jsonb_build_object(
      'name', 'Injection Pressure',
      'type', 'numeric',
      'unit', 'bar',
      'min_value', 300,
      'max_value', 1500,
      'field_key', 'injection_pressure'
    ),
    jsonb_build_object(
      'name', 'Cooling Time',
      'type', 'numeric',
      'unit', 's',
      'min_value', 5,
      'max_value', 60,
      'field_key', 'cooling_time'
    )
  )
FROM machines m
WHERE m.machine_code IN ('AC-01', 'HG-01', 'HSIM-02', 'HSIM-04')
AND NOT EXISTS (
  SELECT 1 FROM machine_process_parameter_templates t
  WHERE t.machine_id = m.id AND t.template_name = 'Single Zone Molding'
);

-- Example 3: Advanced Machine with Speed/Position (e.g., DG-01, HD-01)
INSERT INTO machine_process_parameter_templates (machine_id, template_name, description, parameters)
SELECT m.id,
  'Advanced Injection with Speed Control',
  'Machine with multi-parameter control including speed and position',
  jsonb_build_array(
    jsonb_build_object(
      'name', 'Zone 1 Temperature',
      'type', 'numeric',
      'unit', '°C',
      'min_value', 150,
      'max_value', 280,
      'field_key', 'zone_1_temp'
    ),
    jsonb_build_object(
      'name', 'Zone 2 Temperature',
      'type', 'numeric',
      'unit', '°C',
      'min_value', 150,
      'max_value', 280,
      'field_key', 'zone_2_temp'
    ),
    jsonb_build_object(
      'name', 'Zone 3 Temperature',
      'type', 'numeric',
      'unit', '°C',
      'min_value', 150,
      'max_value', 280,
      'field_key', 'zone_3_temp'
    ),
    jsonb_build_object(
      'name', 'Injection Pressure',
      'type', 'numeric',
      'unit', 'bar',
      'min_value', 300,
      'max_value', 1500,
      'field_key', 'injection_pressure'
    ),
    jsonb_build_object(
      'name', 'Holding Pressure',
      'type', 'numeric',
      'unit', 'bar',
      'min_value', 100,
      'max_value', 800,
      'field_key', 'holding_pressure'
    ),
    jsonb_build_object(
      'name', 'Injection Speed',
      'type', 'numeric',
      'unit', 'mm/s',
      'min_value', 10,
      'max_value', 200,
      'field_key', 'injection_speed'
    ),
    jsonb_build_object(
      'name', 'Screw Position',
      'type', 'numeric',
      'unit', 'mm',
      'min_value', 0,
      'max_value', 100,
      'field_key', 'screw_position'
    ),
    jsonb_build_object(
      'name', 'Cooling Time',
      'type', 'numeric',
      'unit', 's',
      'min_value', 5,
      'max_value', 60,
      'field_key', 'cooling_time'
    )
  )
FROM machines m
WHERE m.machine_code IN ('DG-01', 'HD-01', 'CT-01')
AND NOT EXISTS (
  SELECT 1 FROM machine_process_parameter_templates t
  WHERE t.machine_id = m.id AND t.template_name = 'Advanced Injection with Speed Control'
);
