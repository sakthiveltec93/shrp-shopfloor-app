-- Migration 007: Machine process parameter templates
-- Adds flexible parameter template system for different machine types

BEGIN;

CREATE TABLE IF NOT EXISTS machine_process_parameter_templates (
  id SERIAL PRIMARY KEY,
  machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  description TEXT,
  parameters JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS part_machine_process_specs (
  id SERIAL PRIMARY KEY,
  part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  parameter_specs JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(part_id, machine_id)
);

CREATE INDEX IF NOT EXISTS idx_machine_templates ON machine_process_parameter_templates(machine_id);
CREATE INDEX IF NOT EXISTS idx_part_machine_specs ON part_machine_process_specs(part_id, machine_id);

COMMIT;
