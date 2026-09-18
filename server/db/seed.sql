-- Sample reject/downtime reasons and check items
INSERT INTO check_items (item_name, category) VALUES
  ('Short shot', 'reject_reason'), ('Flash', 'reject_reason'), ('Black spot', 'reject_reason'),
  ('Mould change', 'downtime_reason'), ('Power outage', 'downtime_reason'), ('Material shortage', 'downtime_reason')
ON CONFLICT (item_name, category) DO NOTHING;

-- Seed SHRP real machine list (10 machines initial baseline)
INSERT INTO machines (machine_code) VALUES
  ('VIM-01'), ('VIM-02'), ('VIM-03'),
  ('RUB-01'),
  ('HSIM-01'), ('HSIM-02'), ('HSIM-03'), ('HSIM-04'), ('HSIM-05'),
  ('VSIM-01')
ON CONFLICT (machine_code) DO NOTHING;

-- Default admin user - PIN is '0000', CHANGE THIS after first login
INSERT INTO users (username, pin_hash, full_name, role) VALUES
  ('admin', '$2a$10$CYFec7XoshX6gdF.BNOKaO3KrW3OB29KzhybN5r3deZ8A1y1UUxmq', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Process parameters and critical dimensions for sample parts
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Zone-1', '135-145', 'C' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, COALESCE(machine_id, -1), parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Zone-2', '165-175', 'C' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, COALESCE(machine_id, -1), parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Zone-3', '155-165', 'C' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, COALESCE(machine_id, -1), parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Zone-4', '140-150', 'C' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, COALESCE(machine_id, -1), parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;
INSERT INTO part_process_parameters (part_id, parameter_name, value, unit) SELECT id, 'Zone-5', '135-145', 'C' FROM parts WHERE part_code = 'F364-CB5AA-01' ON CONFLICT (part_id, COALESCE(machine_id, -1), parameter_name) DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit;

-- Daily machine check sheet items
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

-- Give default admin account full page access
INSERT INTO user_page_access (user_id, page_key)
SELECT u.id, p.page_key
FROM users u, (VALUES
  ('mould_setup'), ('entry'), ('bag_entry'), ('trimming'), ('inspection'),
  ('packing'), ('log'), ('approvals'), ('parts'), ('users')
) AS p(page_key)
WHERE u.username = 'admin'
ON CONFLICT (user_id, page_key) DO NOTHING;
