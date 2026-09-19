-- 006_mould_campaign_history.sql
-- Table to store finalized mould campaign performance metrics (loaded -> unloaded run)

CREATE TABLE IF NOT EXISTS mould_campaign_history (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    mould_id INTEGER REFERENCES moulds(id) ON DELETE SET NULL,
    assignment_id INTEGER REFERENCES machine_assignments(id) ON DELETE SET NULL,
    loaded_at TIMESTAMPTZ NOT NULL,
    unloaded_at TIMESTAMPTZ,
    total_shots INTEGER DEFAULT 0,
    total_prod_qty INTEGER DEFAULT 0,
    total_reject_qty INTEGER DEFAULT 0,
    total_net_qty INTEGER DEFAULT 0,
    gross_run_hours NUMERIC(10, 2) DEFAULT 0,
    total_idle_min INTEGER DEFAULT 0,
    net_run_hours NUMERIC(10, 2) DEFAULT 0,
    overall_efficiency_pct NUMERIC(6, 2) DEFAULT 0,
    reason TEXT,
    is_historical BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mould_campaign_history_machine ON mould_campaign_history(machine_id);
CREATE INDEX IF NOT EXISTS idx_mould_campaign_history_part ON mould_campaign_history(part_id);
CREATE INDEX IF NOT EXISTS idx_mould_campaign_history_loaded_at ON mould_campaign_history(loaded_at DESC);
