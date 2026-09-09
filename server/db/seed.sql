-- Sample reject/downtime reasons and one example part with full routing flags,
-- so Bag Entry / Trimming / Inspection / Packing have something to work with
-- out of the box. Replace/extend via the admin API once real master data is in.
INSERT INTO check_items (item_name, category) VALUES
  ('Short shot', 'reject_reason'), ('Flash', 'reject_reason'), ('Black spot', 'reject_reason'),
  ('Mould change', 'downtime_reason'), ('Power outage', 'downtime_reason'), ('Material shortage', 'downtime_reason')
ON CONFLICT (item_name, category) DO NOTHING;

-- Seed SHRP's real machine list (10 machines)
INSERT INTO machines (machine_code) VALUES
  ('VIM - 01'), ('VIM - 02'), ('VIM - 03'),
  ('RUB - 01'),
  ('HSIM - 01'), ('HSIM - 02'), ('HSIM - 03'), ('HSIM - 04'), ('HSIM - 05'),
  ('VSIM - 01')
ON CONFLICT (machine_code) DO NOTHING;

-- One example part with full routing (trim + inspection required) so the
-- Bag Entry -> Trimming -> Inspection -> Packing pipeline has something to
-- run through immediately. Replace with real PART_MASTER data via the
-- admin API once available.
INSERT INTO parts (part_code, part_name, cavity_count, standard_cycle_time_sec, unit_weight_g,
                    trim_required, inspection_required, packing_required, dispatch_required, standard_pack_qty)
VALUES ('DEMO-100', 'Demo Bracket', 4, 18.5, 22.5, TRUE, TRUE, TRUE, TRUE, 500)
ON CONFLICT (part_code) DO NOTHING;

-- Default admin user - PIN is '0000', CHANGE THIS after first login
-- pin_hash below is bcrypt hash of '0000'
INSERT INTO users (username, pin_hash, full_name, role) VALUES
  ('admin', '$2a$10$CYFec7XoshX6gdF.BNOKaO3KrW3OB29KzhybN5r3deZ8A1y1UUxmq', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;
