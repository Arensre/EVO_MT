const express = require('express');
const { pool } = require('../config/database');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/module-settings/enabled - Get enabled modules for sidebar
router.get('/enabled', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT module_name, is_enabled FROM module_settings WHERE is_enabled = true'
    );
    const enabledModules = result.rows.map(row => row.module_name);
    res.json(enabledModules);
  } catch (error) {
    console.error('Error fetching enabled modules:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Module' });
  }
});

// GET /api/module-settings - Get all module settings
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM module_settings ORDER BY module_name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching module settings:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Moduleinstellungen' });
  }
});

// GET /api/module-settings/:moduleName - Get single module setting
router.get('/:moduleName', requireAuth, async (req, res) => {
  try {
    const { moduleName } = req.params;
    const result = await pool.query(
      'SELECT * FROM module_settings WHERE module_name = $1',
      [moduleName]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Modul nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching module setting:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Moduleinstellungen' });
  }
});

// PUT /api/module-settings/:moduleName - Update module setting (admin only)
router.put('/:moduleName', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { moduleName } = req.params;
    const { is_enabled, required_fields, allow_multiple_types, allow_multiple_functions } = req.body;
    
    const result = await pool.query(
      `UPDATE module_settings 
       SET is_enabled = $1, required_fields = $2, allow_multiple_types = $3, allow_multiple_functions = $4
       WHERE module_name = $5
       RETURNING *`,
      [is_enabled, JSON.stringify(required_fields), allow_multiple_types, allow_multiple_functions, moduleName]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Modul nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating module setting:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Moduleinstellungen' });
  }
});

module.exports = router;
