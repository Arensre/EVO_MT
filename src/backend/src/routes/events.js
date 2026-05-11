const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'evo_mt',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Get all events with optional date range filter
router.get('/', requireAuth, async (req, res) => {
  try {
    const { start, end } = req.query;
    
    let query = `
      SELECT e.*, c.name as category_name, c.color as category_color
      FROM events e
      LEFT JOIN event_categories c ON e.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (start) {
      query += ` AND (e.end_date >= $${paramIndex} OR e.start_date >= $${paramIndex})`;
      params.push(start);
      paramIndex++;
    }
    
    if (end) {
      query += ` AND e.start_date <= $${paramIndex}`;
      params.push(end);
      paramIndex++;
    }
    
    query += ` ORDER BY e.start_date, e.start_time`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Termine' });
  }
});

// Get single event
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT e.*, c.name as category_name, c.color as category_color
       FROM events e
       LEFT JOIN event_categories c ON e.category_id = c.id
       WHERE e.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Termin nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Fehler beim Laden des Termins' });
  }
});

// Create event
router.post('/', requireAuth, requirePermission('events', 'write'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      title, description, location, start_date, end_date,
      start_time, end_time, is_all_day, category_id
    } = req.body;
    
    if (!title || !start_date) {
      return res.status(400).json({ error: 'Titel und Startdatum sind erforderlich' });
    }
    
    // Get category color if category_id is provided
    let color = null;
    if (category_id) {
      const catResult = await client.query('SELECT color FROM event_categories WHERE id = $1', [category_id]);
      if (catResult.rows.length > 0) {
        color = catResult.rows[0].color;
      }
    }
    
    const result = await client.query(
      `INSERT INTO events (title, description, location, start_date, end_date, 
       start_time, end_time, is_all_day, category_id, color, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, description || null, location || null, start_date, 
       end_date || start_date, start_time || null, end_time || null,
       is_all_day || false, category_id || null, color, req.user?.id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Termins' });
  } finally {
    client.release();
  }
});

// Update event
router.put('/:id', requireAuth, requirePermission('events', 'write'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const {
      title, description, location, start_date, end_date,
      start_time, end_time, is_all_day, category_id
    } = req.body;
    
    // Get category color if category_id is provided
    let color = null;
    if (category_id) {
      const catResult = await client.query('SELECT color FROM event_categories WHERE id = $1', [category_id]);
      if (catResult.rows.length > 0) {
        color = catResult.rows[0].color;
      }
    }
    
    const result = await client.query(
      `UPDATE events SET
       title = $1, description = $2, location = $3, start_date = $4, 
       end_date = $5, start_time = $6, end_time = $7, is_all_day = $8,
       category_id = $9, color = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [title, description || null, location || null, start_date, 
       end_date || start_date, start_time || null, end_time || null,
       is_all_day || false, category_id || null, color, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Termin nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Termins' });
  } finally {
    client.release();
  }
});

// Delete event
router.delete('/:id', requireAuth, requirePermission('events', 'delete'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    const result = await client.query(
      'DELETE FROM events WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Termin nicht gefunden' });
    }
    
    res.json({ message: 'Termin gelöscht' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Termins' });
  } finally {
    client.release();
  }
});

// Get categories
router.get('/categories/list', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM event_categories WHERE is_active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Kategorien' });
  }
});

module.exports = router;
