const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Initialize machine parameter templates (admin only)
router.post('/init-machine-templates', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Template 1: HSIM & VSIM Machines (23 parameters)
      await client.query(`
        INSERT INTO machine_process_parameter_templates (machine_id, template_name, description, parameters)
        SELECT id, 'HSIM/VSIM - 4-Zone Injection',
          '4-Zone Temp, 3-Zone Injection (P/S/Pos), 2-Zone Holding (P/S/Pos), Cycle, Cooling + Charge/Suckback',
          jsonb_build_array(
            jsonb_build_object('name', 'Zone 1 Temperature', 'type', 'numeric', 'unit', '°C', 'field_key', 'zone_1_temp'),
            jsonb_build_object('name', 'Zone 2 Temperature', 'type', 'numeric', 'unit', '°C', 'field_key', 'zone_2_temp'),
            jsonb_build_object('name', 'Zone 3 Temperature', 'type', 'numeric', 'unit', '°C', 'field_key', 'zone_3_temp'),
            jsonb_build_object('name', 'Zone 4 Temperature', 'type', 'numeric', 'unit', '°C', 'field_key', 'zone_4_temp'),
            jsonb_build_object('name', 'Injection Zone 1 Pressure', 'type', 'numeric', 'unit', 'bar', 'field_key', 'inj_z1_pressure'),
            jsonb_build_object('name', 'Injection Zone 1 Speed', 'type', 'numeric', 'unit', 'mm/s', 'field_key', 'inj_z1_speed'),
            jsonb_build_object('name', 'Injection Zone 1 Position/Time', 'type', 'numeric', 'unit', 'mm/s', 'field_key', 'inj_z1_position_time'),
            jsonb_build_object('name', 'Injection Zone 2 Pressure', 'type', 'numeric', 'unit', 'bar', 'field_key', 'inj_z2_pressure'),
            jsonb_build_object('name', 'Injection Zone 2 Speed', 'type', 'numeric', 'unit', 'mm/s', 'field_key', 'inj_z2_speed'),
            jsonb_build_object('name', 'Injection Zone 2 Position/Time', 'type', 'numeric', 'unit', 'mm/s', 'field_key', 'inj_z2_position_time'),
            jsonb_build_object('name', 'Injection Zone 3 Pressure', 'type', 'numeric', 'unit', 'bar', 'field_key', 'inj_z3_pressure'),
            jsonb_build_object('name', 'Injection Zone 3 Speed', 'type', 'numeric', 'unit', 'mm/s', 'field_key', 'inj_z3_speed'),
            jsonb_build_object('name', 'Injection Zone 3 Position/Time', 'type', 'numeric', 'unit', 'mm/s', 'field_key', 'inj_z3_position_time'),
            jsonb_build_object('name', 'Holding Zone 1 Pressure', 'type', 'numeric', 'unit', 'bar', 'field_key', 'hold_z1_pressure'),
            jsonb_build_object('name', 'Holding Zone 1 Speed', 'type', 'numeric', 'unit', 'mm/s', 'field_key', 'hold_z1_speed'),
            jsonb_build_object('name', 'Holding Zone 1 Position/Time', 'type', 'numeric', 'unit', 'mm/s', 'field_key', 'hold_z1_position_time'),
            jsonb_build_object('name', 'Holding Zone 2 Pressure', 'type', 'numeric', 'unit', 'bar', 'field_key', 'hold_z2_pressure'),
            jsonb_build_object('name', 'Holding Zone 2 Speed', 'type', 'numeric', 'unit', 'mm/s', 'field_key', 'hold_z2_speed'),
            jsonb_build_object('name', 'Holding Zone 2 Position/Time', 'type', 'numeric', 'unit', 'mm/s', 'field_key', 'hold_z2_position_time'),
            jsonb_build_object('name', 'Cycle Time', 'type', 'numeric', 'unit', 's', 'field_key', 'cycle_time'),
            jsonb_build_object('name', 'Cooling Time', 'type', 'numeric', 'unit', 's', 'field_key', 'cooling_time'),
            jsonb_build_object('name', 'Charge Position 1', 'type', 'numeric', 'unit', 'mm', 'field_key', 'charge_position_1'),
            jsonb_build_object('name', 'Suckback 1', 'type', 'numeric', 'unit', 'mm', 'field_key', 'suckback_1')
          )
        FROM machines
        WHERE machine_code IN ('HSIM-01', 'HSIM-02', 'HSIM-03', 'HSIM-04', 'VSIM-01')
        AND NOT EXISTS (
          SELECT 1 FROM machine_process_parameter_templates WHERE machine_id = machines.id
        )
      `);

      // Template 2: VIM Machines
      await client.query(`
        INSERT INTO machine_process_parameter_templates (machine_id, template_name, description, parameters)
        SELECT id, 'VIM - Single Zone',
          'Single Zone Temperature, Pressure, Holding/Injection Times, Cycle Time',
          jsonb_build_array(
            jsonb_build_object('name', 'Zone 1 Temperature', 'type', 'numeric', 'unit', '°C', 'field_key', 'zone_1_temp'),
            jsonb_build_object('name', 'Pressure', 'type', 'numeric', 'unit', 'bar', 'field_key', 'pressure'),
            jsonb_build_object('name', 'Holding Time', 'type', 'numeric', 'unit', 's', 'field_key', 'holding_time'),
            jsonb_build_object('name', 'Injection Time', 'type', 'numeric', 'unit', 's', 'field_key', 'injection_time'),
            jsonb_build_object('name', 'Cycle Time', 'type', 'numeric', 'unit', 's', 'field_key', 'cycle_time')
          )
        FROM machines
        WHERE machine_code LIKE 'VIM-%'
        AND NOT EXISTS (
          SELECT 1 FROM machine_process_parameter_templates WHERE machine_id = machines.id
        )
      `);

      // Template 3: RUB Machines
      await client.query(`
        INSERT INTO machine_process_parameter_templates (machine_id, template_name, description, parameters)
        SELECT id, 'RUB - 2-Zone Basic',
          '2-Zone Temperature, 1-Zone Pressure, Cycle Time',
          jsonb_build_array(
            jsonb_build_object('name', 'Zone 1 Temperature', 'type', 'numeric', 'unit', '°C', 'field_key', 'zone_1_temp'),
            jsonb_build_object('name', 'Zone 2 Temperature', 'type', 'numeric', 'unit', '°C', 'field_key', 'zone_2_temp'),
            jsonb_build_object('name', 'Pressure', 'type', 'numeric', 'unit', 'bar', 'field_key', 'pressure'),
            jsonb_build_object('name', 'Cycle Time', 'type', 'numeric', 'unit', 's', 'field_key', 'cycle_time')
          )
        FROM machines
        WHERE machine_code LIKE 'RUB-%'
        AND NOT EXISTS (
          SELECT 1 FROM machine_process_parameter_templates WHERE machine_id = machines.id
        )
      `);

      // Verify
      const result = await client.query(`
        SELECT machine_id, template_name, jsonb_array_length(parameters) as param_count
        FROM machine_process_parameter_templates
        ORDER BY machine_id
      `);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `✓ Initialized ${result.rows.length} machine parameter templates`,
        templates: result.rows
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Setup error:', err);
    res.status(500).json({ error: 'Failed to initialize templates: ' + err.message });
  }
});

module.exports = router;
