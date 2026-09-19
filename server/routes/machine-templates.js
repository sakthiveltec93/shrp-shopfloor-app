const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Get template for a machine
router.get('/template/:machineId', async (req, res) => {
  try {
    const { machineId } = req.params;
    const result = await pool.query(
      `SELECT id, machine_id, template_name, description, parameters
       FROM machine_process_parameter_templates
       WHERE machine_id = $1
       LIMIT 1`,
      [machineId]
    );

    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('Error fetching machine template:', err);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Get process specs for a part-machine combination
router.get('/part-specs/:partId/:machineId', async (req, res) => {
  try {
    const { partId, machineId } = req.params;
    const result = await pool.query(
      `SELECT id, part_id, machine_id, parameter_specs, updated_at
       FROM part_machine_process_specs
       WHERE part_id = $1 AND machine_id = $2`,
      [partId, machineId]
    );

    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('Error fetching part specs:', err);
    res.status(500).json({ error: 'Failed to fetch specs' });
  }
});

// Save/update process specs for a part-machine combination
router.post('/part-specs', async (req, res) => {
  try {
    const { part_id, machine_id, parameter_specs } = req.body;

    if (!part_id || !machine_id || !parameter_specs) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO part_machine_process_specs (part_id, machine_id, parameter_specs)
       VALUES ($1, $2, $3)
       ON CONFLICT (part_id, machine_id) DO UPDATE
       SET parameter_specs = EXCLUDED.parameter_specs, updated_at = now()
       RETURNING id, part_id, machine_id, parameter_specs, updated_at`,
      [part_id, machine_id, parameter_specs]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Process parameters saved successfully'
    });
  } catch (err) {
    console.error('Error saving part specs:', err);
    res.status(500).json({ error: 'Failed to save specs: ' + err.message });
  }
});

// Update machine template
router.post('/template', async (req, res) => {
  try {
    const { machine_id, template_name, description, parameters } = req.body;

    if (!machine_id || !template_name || !parameters) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO machine_process_parameter_templates (machine_id, template_name, description, parameters)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET template_name = EXCLUDED.template_name
       RETURNING id, machine_id, template_name, description, parameters`,
      [machine_id, template_name, description, JSON.stringify(parameters)]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Template updated successfully'
    });
  } catch (err) {
    console.error('Error updating template:', err);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

module.exports = router;
