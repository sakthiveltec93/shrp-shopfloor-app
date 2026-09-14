-- Tooling Extensions (IATF 16949 Tool Management)
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS tool_maker TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS funded_by TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS tool_type TEXT DEFAULT 'Cold Runner';
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS suitable_machines TEXT;
ALTER TABLE moulds ADD COLUMN IF NOT EXISTS total_rated_life_shots INTEGER DEFAULT 500000;

CREATE TABLE IF NOT EXISTS mould_files (
  id SERIAL PRIMARY KEY,
  mould_id INTEGER NOT NULL REFERENCES moulds(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('drawing_3d', 'drawing_2d', 'photo_top', 'photo_op_side', 'photo_non_op_side', 'photo_parting_line', 'photo_shot', 'photo_general')),
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  data BYTEA NOT NULL,
  uploaded_by_user_id INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mould_files_mould ON mould_files(mould_id, file_type);

-- Machine Engineering & Capacity Specifications
ALTER TABLE machines ADD COLUMN IF NOT EXISTS tie_bar_distance_mm TEXT DEFAULT '410 x 410';
ALTER TABLE machines ADD COLUMN IF NOT EXISTS platen_size_mm TEXT DEFAULT '600 x 600';
ALTER TABLE machines ADD COLUMN IF NOT EXISTS min_mould_height_mm NUMERIC DEFAULT 150;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS max_mould_height_mm NUMERIC DEFAULT 450;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS clamping_stroke_mm NUMERIC DEFAULT 350;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS max_daylight_mm NUMERIC DEFAULT 800;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS ejector_stroke_mm NUMERIC DEFAULT 100;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS ejector_force_kn NUMERIC DEFAULT 35;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS max_shot_weight_g NUMERIC DEFAULT 180;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS motor_type TEXT DEFAULT 'Servo Hydraulic';
ALTER TABLE machines ADD COLUMN IF NOT EXISTS connected_load_kw NUMERIC DEFAULT 22;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS hourly_rate_inr NUMERIC DEFAULT 450;

-- Backfill authentic plant specs for SHRP 10 Machines
UPDATE machines SET
  tie_bar_distance_mm = '370 x 370', platen_size_mm = '550 x 550',
  min_mould_height_mm = 150, max_mould_height_mm = 400, clamping_stroke_mm = 320, max_daylight_mm = 720,
  ejector_stroke_mm = 90, ejector_force_kn = 30, max_shot_weight_g = 140,
  motor_type = 'Servo Hydraulic', connected_load_kw = 18.5, hourly_rate_inr = 400
WHERE machine_code = 'HSIM - 01';

UPDATE machines SET
  tie_bar_distance_mm = '410 x 410', platen_size_mm = '600 x 600',
  min_mould_height_mm = 150, max_mould_height_mm = 450, clamping_stroke_mm = 350, max_daylight_mm = 800,
  ejector_stroke_mm = 100, ejector_force_kn = 35, max_shot_weight_g = 180,
  motor_type = 'Servo Hydraulic', connected_load_kw = 22.0, hourly_rate_inr = 450
WHERE machine_code = 'HSIM - 02';

UPDATE machines SET
  tie_bar_distance_mm = '420 x 420', platen_size_mm = '610 x 610',
  min_mould_height_mm = 180, max_mould_height_mm = 480, clamping_stroke_mm = 360, max_daylight_mm = 840,
  ejector_stroke_mm = 100, ejector_force_kn = 35, max_shot_weight_g = 170,
  motor_type = 'All-Electric Servo', connected_load_kw = 16.0, hourly_rate_inr = 500
WHERE machine_code = 'HSIM - 03';

UPDATE machines SET
  tie_bar_distance_mm = '460 x 460', platen_size_mm = '660 x 660',
  min_mould_height_mm = 200, max_mould_height_mm = 500, clamping_stroke_mm = 400, max_daylight_mm = 900,
  ejector_stroke_mm = 120, ejector_force_kn = 42, max_shot_weight_g = 210,
  motor_type = 'All-Electric Servo', connected_load_kw = 19.5, hourly_rate_inr = 550
WHERE machine_code = 'HSIM - 04';

UPDATE machines SET
  tie_bar_distance_mm = '510 x 510', platen_size_mm = '720 x 720',
  min_mould_height_mm = 200, max_mould_height_mm = 550, clamping_stroke_mm = 450, max_daylight_mm = 1000,
  ejector_stroke_mm = 140, ejector_force_kn = 50, max_shot_weight_g = 280,
  motor_type = 'Servo Hydraulic', connected_load_kw = 30.0, hourly_rate_inr = 650
WHERE machine_code = 'HSIM - 05';

UPDATE machines SET
  tie_bar_distance_mm = '350 x 350', platen_size_mm = '500 x 500',
  min_mould_height_mm = 120, max_mould_height_mm = 350, clamping_stroke_mm = 300, max_daylight_mm = 650,
  ejector_stroke_mm = 80, ejector_force_kn = 25, max_shot_weight_g = 120,
  motor_type = 'Servo Hydraulic', connected_load_kw = 15.0, hourly_rate_inr = 380
WHERE machine_code = 'VSIM - 01';

UPDATE machines SET
  tie_bar_distance_mm = '280 x 280', platen_size_mm = '400 x 400',
  min_mould_height_mm = 100, max_mould_height_mm = 300, clamping_stroke_mm = 250, max_daylight_mm = 550,
  ejector_stroke_mm = 60, ejector_force_kn = 20, max_shot_weight_g = 80,
  motor_type = 'Hydraulic Standard', connected_load_kw = 11.0, hourly_rate_inr = 320
WHERE machine_code = 'VIM - 01';

UPDATE machines SET
  tie_bar_distance_mm = '310 x 310', platen_size_mm = '450 x 450',
  min_mould_height_mm = 120, max_mould_height_mm = 320, clamping_stroke_mm = 280, max_daylight_mm = 600,
  ejector_stroke_mm = 70, ejector_force_kn = 22, max_shot_weight_g = 95,
  motor_type = 'Hydraulic Standard', connected_load_kw = 13.0, hourly_rate_inr = 340
WHERE machine_code = 'VIM - 02';

UPDATE machines SET
  tie_bar_distance_mm = '310 x 310', platen_size_mm = '450 x 450',
  min_mould_height_mm = 120, max_mould_height_mm = 320, clamping_stroke_mm = 280, max_daylight_mm = 600,
  ejector_stroke_mm = 70, ejector_force_kn = 22, max_shot_weight_g = 95,
  motor_type = 'Hydraulic Standard', connected_load_kw = 13.0, hourly_rate_inr = 340
WHERE machine_code = 'VIM - 03';

UPDATE machines SET
  tie_bar_distance_mm = 'Platen Opening', platen_size_mm = '450 x 450',
  min_mould_height_mm = 80, max_mould_height_mm = 250, clamping_stroke_mm = 200, max_daylight_mm = 450,
  ejector_stroke_mm = 50, ejector_force_kn = 20, max_shot_weight_g = 200,
  motor_type = 'Hydraulic Compression', connected_load_kw = 15.0, hourly_rate_inr = 350
WHERE machine_code = 'RUB - 01';

-- Backfill suitable_machines for existing moulds
UPDATE moulds
SET suitable_machines = TRIM(SUBSTRING(notes FROM 'Suitable:\s*([^;]+)'))
WHERE suitable_machines IS NULL AND notes LIKE '%Suitable:%';

UPDATE moulds
SET funded_by = customer_name
WHERE funded_by IS NULL AND customer_name IS NOT NULL;