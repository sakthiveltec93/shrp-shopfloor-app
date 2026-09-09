-- Seed SHRP's real machine list (10 machines)
INSERT INTO machines (machine_code) VALUES
  ('VIM - 01'), ('VIM - 02'), ('VIM - 03'),
  ('RUB - 01'),
  ('HSIM - 01'), ('HSIM - 02'), ('HSIM - 03'), ('HSIM - 04'), ('HSIM - 05'),
  ('VSIM - 01')
ON CONFLICT (machine_code) DO NOTHING;

-- Default admin user - PIN is '0000', CHANGE THIS after first login
-- pin_hash below is bcrypt hash of '0000'
INSERT INTO users (username, pin_hash, full_name, role) VALUES
  ('admin', '$2a$10$CYFec7XoshX6gdF.BNOKaO3KrW3OB29KzhybN5r3deZ8A1y1UUxmq', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;
