const express = require('express');
const { pool } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Helper to check for overlapping date ranges
function rangesOverlap(start1, end1, start2, end2) {
  // Convert to Date objects
  const s1 = new Date(start1);
  const e1 = end1 ? new Date(end1) : new Date('9999-12-31');
  const s2 = new Date(start2);
  const e2 = end2 ? new Date(end2) : new Date('9999-12-31');
  
  return s1 <= e2 && s2 <= e1;
}

// GET /api/members/:id/type-history - Get member type history
router.get('/:id/type-history', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT mth.*, mt.name as type_name
       FROM member_type_history mth
       JOIN member_types mt ON mth.member_type_id = mt.id
       WHERE mth.member_id = $1
       ORDER BY mth.start_date DESC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching type history:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Mitgliedsarten-Historie' });
  }
});

// POST /api/members/:id/type-history - Add new type history entry
router.post('/:id/type-history', requireAuth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { member_type_id, start_date, end_date, notes } = req.body;
    
    // Validate required fields
    if (!member_type_id || !start_date) {
      return res.status(400).json({ error: 'Mitgliedsart und Startdatum sind erforderlich' });
    }
    
    // Check module settings for multiple entries
    const settingsResult = await pool.query(
      'SELECT allow_multiple_types FROM module_settings WHERE module_name = $1',
      ['members']
    );
    const allowMultiple = settingsResult.rows[0]?.allow_multiple_types || false;
    
    if (!allowMultiple) {
      // Check for overlapping entries
      const overlapCheck = await pool.query(
        `SELECT * FROM member_type_history 
         WHERE member_id = $1 
         AND ($2::date, COALESCE($3::date, '9999-12-31'::date)) OVERLAPS (start_date, COALESCE(end_date, '9999-12-31'::date))`,
        [id, start_date, end_date]
      );
      
      if (overlapCheck.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Zeitraum überschneidet sich mit bestehendem Eintrag. Mehrfacheinträge sind in den Moduleinstellungen deaktiviert.' 
        });
      }
    }
    
    await client.query('BEGIN');
    
    // If this is the current entry (no end date), update member table
    if (!end_date) {
      await client.query(
        'UPDATE members SET member_type_id = $1 WHERE id = $2',
        [member_type_id, id]
      );
    }
    
    const result = await client.query(
      `INSERT INTO member_type_history (member_id, member_type_id, start_date, end_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, member_type_id, start_date, end_date, notes]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding type history:', error);
    res.status(500).json({ error: 'Fehler beim Hinzufügen der Mitgliedsart' });
  } finally {
    client.release();
  }
});

// PUT /api/members/:id/type-history/:entryId - Update type history entry
router.put('/:id/type-history/:entryId', requireAuth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id, entryId } = req.params;
    const { member_type_id, start_date, end_date, notes } = req.body;
    
    if (!member_type_id || !start_date) {
      return res.status(400).json({ error: 'Mitgliedsart und Startdatum sind erforderlich' });
    }
    
    // Check module settings
    const settingsResult = await pool.query(
      'SELECT allow_multiple_types FROM module_settings WHERE module_name = $1',
      ['members']
    );
    const allowMultiple = settingsResult.rows[0]?.allow_multiple_types || false;
    
    if (!allowMultiple) {
      // Check for overlapping entries (excluding current entry)
      const overlapCheck = await pool.query(
        `SELECT * FROM member_type_history 
         WHERE member_id = $1 
         AND id != $2
         AND ($3::date, COALESCE($4::date, '9999-12-31'::date)) OVERLAPS (start_date, COALESCE(end_date, '9999-12-31'::date))`,
        [id, entryId, start_date, end_date]
      );
      
      if (overlapCheck.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Zeitraum überschneidet sich mit bestehendem Eintrag.' 
        });
      }
    }
    
    await client.query('BEGIN');
    
    const result = await client.query(
      `UPDATE member_type_history 
       SET member_type_id = $1, start_date = $2, end_date = $3, notes = $4
       WHERE id = $5 AND member_id = $6
       RETURNING *`,
      [member_type_id, start_date, end_date, notes, entryId, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }
    
    await client.query('COMMIT');
    
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating type history:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Mitgliedsart' });
  } finally {
    client.release();
  }
});

// DELETE /api/members/:id/type-history/:entryId - Delete type history entry
router.delete('/:id/type-history/:entryId', requireAuth, async (req, res) => {
  try {
    const { id, entryId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM member_type_history WHERE id = $1 AND member_id = $2 RETURNING *',
      [entryId, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }
    
    res.json({ message: 'Eintrag gelöscht' });
  } catch (error) {
    console.error('Error deleting type history:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Mitgliedsart' });
  }
});

// GET /api/members/:id/function-history - Get member function history
router.get('/:id/function-history', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT mfh.*, mf.name as function_name
       FROM member_function_history mfh
       JOIN member_functions mf ON mfh.member_function_id = mf.id
       WHERE mfh.member_id = $1
       ORDER BY mfh.start_date DESC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching function history:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Funktions-Historie' });
  }
});

// POST /api/members/:id/function-history - Add new function history entry
router.post('/:id/function-history', requireAuth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { member_function_id, start_date, end_date, notes } = req.body;
    
    if (!member_function_id || !start_date) {
      return res.status(400).json({ error: 'Funktion und Startdatum sind erforderlich' });
    }
    
    // Check module settings
    const settingsResult = await pool.query(
      'SELECT allow_multiple_functions FROM module_settings WHERE module_name = $1',
      ['members']
    );
    const allowMultiple = settingsResult.rows[0]?.allow_multiple_functions || false;
    
    if (!allowMultiple) {
      // Check for overlapping entries
      const overlapCheck = await pool.query(
        `SELECT * FROM member_function_history 
         WHERE member_id = $1 
         AND ($2::date, COALESCE($3::date, '9999-12-31'::date)) OVERLAPS (start_date, COALESCE(end_date, '9999-12-31'::date))`,
        [id, start_date, end_date]
      );
      
      if (overlapCheck.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Zeitraum überschneidet sich mit bestehendem Eintrag. Mehrfacheinträge sind in den Moduleinstellungen deaktiviert.' 
        });
      }
    }
    
    await client.query('BEGIN');
    
    // If this is the current entry (no end date), update member table
    if (!end_date) {
      await client.query(
        'UPDATE members SET member_function_id = $1 WHERE id = $2',
        [member_function_id, id]
      );
    }
    
    const result = await client.query(
      `INSERT INTO member_function_history (member_id, member_function_id, start_date, end_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, member_function_id, start_date, end_date, notes]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding function history:', error);
    res.status(500).json({ error: 'Fehler beim Hinzufügen der Funktion' });
  } finally {
    client.release();
  }
});

// PUT /api/members/:id/function-history/:entryId - Update function history entry
router.put('/:id/function-history/:entryId', requireAuth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id, entryId } = req.params;
    const { member_function_id, start_date, end_date, notes } = req.body;
    
    if (!member_function_id || !start_date) {
      return res.status(400).json({ error: 'Funktion und Startdatum sind erforderlich' });
    }
    
    // Check module settings
    const settingsResult = await pool.query(
      'SELECT allow_multiple_functions FROM module_settings WHERE module_name = $1',
      ['members']
    );
    const allowMultiple = settingsResult.rows[0]?.allow_multiple_functions || false;
    
    if (!allowMultiple) {
      // Check for overlapping entries (excluding current entry)
      const overlapCheck = await pool.query(
        `SELECT * FROM member_function_history 
         WHERE member_id = $1 
         AND id != $2
         AND ($3::date, COALESCE($4::date, '9999-12-31'::date)) OVERLAPS (start_date, COALESCE(end_date, '9999-12-31'::date))`,
        [id, entryId, start_date, end_date]
      );
      
      if (overlapCheck.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Zeitraum überschneidet sich mit bestehendem Eintrag.' 
        });
      }
    }
    
    await client.query('BEGIN');
    
    const result = await client.query(
      `UPDATE member_function_history 
       SET member_function_id = $1, start_date = $2, end_date = $3, notes = $4
       WHERE id = $5 AND member_id = $6
       RETURNING *`,
      [member_function_id, start_date, end_date, notes, entryId, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }
    
    await client.query('COMMIT');
    
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating function history:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Funktion' });
  } finally {
    client.release();
  }
});

// DELETE /api/members/:id/function-history/:entryId - Delete function history entry
router.delete('/:id/function-history/:entryId', requireAuth, async (req, res) => {
  try {
    const { id, entryId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM member_function_history WHERE id = $1 AND member_id = $2 RETURNING *',
      [entryId, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }
    
    res.json({ message: 'Eintrag gelöscht' });
  } catch (error) {
    console.error('Error deleting function history:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Funktion' });
  }
});

module.exports = router;
