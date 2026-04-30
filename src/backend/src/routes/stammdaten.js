const express = require('express');
const { Pool } = require('pg');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'evo_mt',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// ============================================
// MEMBER TYPES (Mitgliedsarten)
// ============================================

// GET /api/stammdaten/member-types - List all member types
router.get('/member-types', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM member_types ORDER BY name',
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching member types:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Mitgliedsarten' });
  }
});

// GET /api/stammdaten/member-types/:id - Get single member type
router.get('/member-types/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM member_types WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mitgliedsart nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching member type:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Mitgliedsart' });
  }
});

// POST /api/stammdaten/member-types - Create new member type (admin only)
router.post('/member-types', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, is_active } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name ist erforderlich' });
    }
    
    const result = await pool.query(
      `INSERT INTO member_types (name, description, is_active) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, description || '', is_active !== false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating member type:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Eine Mitgliedsart mit diesem Namen existiert bereits' });
    }
    res.status(500).json({ error: 'Fehler beim Erstellen der Mitgliedsart' });
  }
});

// PUT /api/stammdaten/member-types/:id - Update member type (admin only)
router.put('/member-types/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name ist erforderlich' });
    }
    
    const result = await pool.query(
      `UPDATE member_types 
       SET name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 
       RETURNING *`,
      [name, description || '', is_active !== false, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mitgliedsart nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating member type:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Eine Mitgliedsart mit diesem Namen existiert bereits' });
    }
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Mitgliedsart' });
  }
});

// DELETE /api/stammdaten/member-types/:id - Delete member type (admin only)
router.delete('/member-types/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if member type is in use (optional, depends on your requirements)
    // For now, we allow deletion even if in use
    
    const result = await pool.query(
      'DELETE FROM member_types WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mitgliedsart nicht gefunden' });
    }
    
    res.json({ success: true, message: 'Mitgliedsart erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting member type:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Mitgliedsart' });
  }
});

// ============================================
// MEMBER FUNCTIONS (Funktionen)
// ============================================

// GET /api/stammdaten/member-functions - List all member functions
router.get('/member-functions', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM member_functions ORDER BY sort_order, name',
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching member functions:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Funktionen' });
  }
});

// GET /api/stammdaten/member-functions/:id - Get single member function
router.get('/member-functions/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM member_functions WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funktion nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching member function:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Funktion' });
  }
});

// POST /api/stammdaten/member-functions - Create new member function (admin only)
router.post('/member-functions', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, sort_order, is_active } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name ist erforderlich' });
    }
    
    const result = await pool.query(
      `INSERT INTO member_functions (name, description, sort_order, is_active) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, description || '', sort_order || 0, is_active !== false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating member function:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Eine Funktion mit diesem Namen existiert bereits' });
    }
    res.status(500).json({ error: 'Fehler beim Erstellen der Funktion' });
  }
});

// PUT /api/stammdaten/member-functions/:id - Update member function (admin only)
router.put('/member-functions/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sort_order, is_active } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name ist erforderlich' });
    }
    
    const result = await pool.query(
      `UPDATE member_functions 
       SET name = $1, description = $2, sort_order = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [name, description || '', sort_order || 0, is_active !== false, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funktion nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating member function:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Eine Funktion mit diesem Namen existiert bereits' });
    }
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Funktion' });
  }
});

// DELETE /api/stammdaten/member-functions/:id - Delete member function (admin only)
router.delete('/member-functions/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM member_functions WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funktion nicht gefunden' });
    }
    
    res.json({ success: true, message: 'Funktion erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting member function:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Funktion' });
  }
});

module.exports = router;