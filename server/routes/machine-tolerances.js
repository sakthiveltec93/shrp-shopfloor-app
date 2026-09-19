const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Get tolerances for a machine
router.get('/machine/:machineId', async (req, res) => {
  try {
    const { machineId } = req.params;
    const result = await pool.query(
      `SELECT id, machine_id, parameter_name, unit, tolerance_min, tolerance_max, tolerance_description
       FROM machine_parameter_tolerances
       WHERE machine_id = $1
       ORDER BY parameter_name`,
      [machineId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tolerances:', err);
    res.status(500).json({ error: 'Failed to fetch tolerances' });
  }
});

// Set tolerance for a parameter
router.post('/', async (req, res) => {
  try {
    const { machine_id, parameter_name, unit, tolerance_min, tolerance_max, tolerance_description } = req.body;

    if (!machine_id || !parameter_name) {
      return res.status(400).json({ error: 'machine_id and parameter_name required' });
    }

    const result = await pool.query(
      `INSERT INTO machine_parameter_tolerances (machine_id, parameter_name, unit, tolerance_min, tolerance_max, tolerance_description)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (machine_id, parameter_name) DO UPDATE
       SET unit = EXCLUDED.unit, tolerance_min = EXCLUDED.tolerance_min, tolerance_max = EXCLUDED.tolerance_max,
           tolerance_description = EXCLUDED.tolerance_description, updated_at = now()
       RETURNING *`,
      [machine_id, parameter_name, unit, tolerance_min, tolerance_max, tolerance_description]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Tolerance saved successfully'
    });
  } catch (err) {
    console.error('Error saving tolerance:', err);
    res.status(500).json({ error: 'Failed to save tolerance' });
  }
});

// Delete tolerance
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM machine_parameter_tolerances WHERE id = $1', [id]);
    res.json({ success: true, message: 'Tolerance deleted' });
  } catch (err) {
    console.error('Error deleting tolerance:', err);
    res.status(500).json({ error: 'Failed to delete tolerance' });
  }
});

// Get tolerance with parameter spec
router.get('/spec/:machineId/:parameterName', async (req, res) => {
  try {
    const { machineId, parameterName } = req.params;
    const result = await pool.query(
      `SELECT * FROM machine_parameter_tolerances
       WHERE machine_id = $1 AND parameter_name = $2`,
      [machineId, parameterName]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('Error fetching tolerance spec:', err);
    res.status(500).json({ error: 'Failed to fetch tolerance spec' });
  }
});

module.exports = router;
