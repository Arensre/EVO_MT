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

// Helper function to calculate membership duration
function calculateDuration(entryDate) {
  if (!entryDate) return { years: 0, months: 0, days: 0 };
  
  const start = new Date(entryDate);
  const now = new Date();
  
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  
  if (days < 0) {
    months--;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  
  return { years, months, days };
}

// Helper to convert empty strings to null for date fields
function cleanDate(value) {
  if (!value || value === '' || value === 'undefined' || value === undefined) {
    return null;
  }
  return value;
}

// Helper to get module settings for validation
async function getModuleSettings(moduleName) {
  try {
    const result = await pool.query(
      'SELECT required_fields FROM module_settings WHERE module_name = $1',
      [moduleName]
    );
    return result.rows[0]?.required_fields || {};
  } catch (error) {
    console.error('Error fetching module settings:', error);
    return {};
  }
}

// Helper to validate required fields based on module settings
function validateRequiredFields(data, requiredFields, customRequired = []) {
  const errors = [];
  
  // Always require first_name and last_name
  if (!data.first_name || data.first_name.trim() === '') {
    errors.push('Vorname ist erforderlich');
  }
  if (!data.last_name || data.last_name.trim() === '') {
    errors.push('Nachname ist erforderlich');
  }
  
  // Check module-specific required fields
  for (const [field, isRequired] of Object.entries(requiredFields)) {
    if (isRequired && (!data[field] || data[field].toString().trim() === '')) {
      const fieldLabels = {
        email: 'E-Mail',
        phone: 'Telefon',
        mobile: 'Mobil',
        street: 'Straße',
        postal_code: 'PLZ',
        city: 'Ort',
        birth_date: 'Geburtsdatum',
        member_type_id: 'Mitgliedsart',
        entry_date: 'Eintrittsdatum',
        profession: 'Beruf',
        notes: 'Notizen'
      };
      errors.push(`${fieldLabels[field] || field} ist erforderlich`);
    }
  }
  
  return errors;
}

// GET /api/members - List all members with optional filters
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search, member_type_id, is_active } = req.query;
    
    let query = `
      SELECT m.*, m.street as address, mt.name as member_type_name
      FROM members m
      LEFT JOIN member_types mt ON m.member_type_id = mt.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (search) {
      query += ` AND (
        m.first_name ILIKE $${paramIndex} 
        OR m.last_name ILIKE $${paramIndex} 
        OR m.member_number ILIKE $${paramIndex}
        OR m.email ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (member_type_id) {
      query += ` AND m.member_type_id = $${paramIndex}`;
      params.push(member_type_id);
      paramIndex++;
    }
    
    if (is_active !== undefined) {
      query += ` AND m.is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }
    
    query += ` ORDER BY m.last_name, m.first_name`;
    
    const result = await pool.query(query, params);
    
    // Transform is_active to status for frontend compatibility
    const members = result.rows.map(m => ({
      ...m,
      status: m.is_active ? 'active' : 'inactive'
    }));
    
    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Mitglieder' });
  }
});

// GET /api/members/:id - Get single member
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get member with type info
    const memberResult = await pool.query(
      `SELECT m.*, m.street as address, mt.name as member_type_name, mf.name as member_function_name
       FROM members m
       LEFT JOIN member_types mt ON m.member_type_id = mt.id
       LEFT JOIN member_functions mf ON m.member_function_id = mf.id
       WHERE m.id = $1`,
      [id]
    );
    
    if (memberResult.rows.length === 0) {
      return res.status(404).json({ error: 'Mitglied nicht gefunden' });
    }
    
    const member = memberResult.rows[0];
    
    // Get member functions
    const functionsResult = await pool.query(
      `SELECT mfm.*, mf.name as function_name, mf.description as function_description
       FROM member_function_mappings mfm
       JOIN member_functions mf ON mfm.function_id = mf.id
       WHERE mfm.member_id = $1
       ORDER BY mf.sort_order, mf.name`,
      [id]
    );
    
    // Calculate membership duration
    const duration = calculateDuration(member.entry_date);
    
    res.json({
      ...member,
      status: member.is_active ? 'active' : 'inactive',
      functions: functionsResult.rows,
      membership_duration: duration
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Fehler beim Laden des Mitglieds' });
  }
});

// POST /api/members - Create new member
router.post('/', requireAuth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Destructure with address support
    const {
      salutation, title, first_name, last_name, birth_name,
      birth_date, birth_place, gender, marital_status, wedding_date,
      street, address, postal_code, city, country,
      email, phone, mobile,
      member_type_id, member_function_id, entry_date,
      profession, occupation,
      distribution_scope, letter_salutation,
      notes, is_active
    } = req.body;
    
    // Support both street and address (frontend uses address)
    const streetValue = address || street;
    console.log('DEBUG - address:', address, 'street:', street, 'streetValue:', streetValue);
    
    // Validate required fields with module settings
    const requiredFields = await getModuleSettings('members');
    const validationErrors = validateRequiredFields(
      { first_name, last_name, email, phone, mobile, street, postal_code, city, birth_date, member_type_id, entry_date, profession, notes },
      requiredFields
    );
    
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    }
    
    // Clean date fields
    const cleanBirthDate = cleanDate(birth_date);
    const cleanEntryDate = cleanDate(entry_date);
    const cleanWeddingDate = cleanDate(wedding_date);
    
    // Generate letter salutation if not provided
    let finalLetterSalutation = letter_salutation;
    if (!finalLetterSalutation) {
      const salutationMap = {
        'Herr': 'Sehr geehrter Herr',
        'Frau': 'Sehr geehrte Frau',
        'Dr.': 'Sehr geehrte/r Dr.',
        'Prof.': 'Sehr geehrte/r Prof.'
      };
      const baseSalutation = salutationMap[salutation] || 'Sehr geehrte/r';
      finalLetterSalutation = `${baseSalutation} ${title ? title + ' ' : ''}${last_name}`;
    }
    
    const result = await client.query(
      `INSERT INTO members (
        salutation, title, first_name, last_name, birth_name,
        birth_date, birth_place, gender, marital_status, wedding_date,
        street, postal_code, city, country,
        email, phone, mobile,
        member_type_id, member_function_id, entry_date,
        profession, occupation,
        distribution_scope, letter_salutation,
        notes, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING *`,
      [
        salutation, title, first_name, last_name, birth_name,
        cleanBirthDate, birth_place, gender, marital_status, cleanWeddingDate,
        streetValue, postal_code, city, country || 'Deutschland',
        email, phone, mobile,
        member_type_id, member_function_id || null, cleanEntryDate,
        profession, occupation,
        distribution_scope || 'gesamter Verband', finalLetterSalutation,
        notes, is_active !== false
      ]
    );
    
    await client.query('COMMIT');
    
    // Get member number (generated by trigger)
    const memberResult = await pool.query(
      'SELECT * FROM members WHERE id = $1',
      [result.rows[0].id]
    );
    
    res.status(201).json(memberResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating member:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Mitglieds' });
  } finally {
    client.release();
  }
});

// PUT /api/members/:id - Update member
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Destructure with address support
    const {
      salutation, title, first_name, last_name, birth_name,
      birth_date, birth_place, gender, marital_status, wedding_date,
      street, address, postal_code, city, country,
      email, phone, mobile,
      member_type_id, member_function_id, entry_date, exit_date,
      profession, occupation,
      distribution_scope, letter_salutation,
      notes, is_active, is_deceased
    } = req.body;
    
    // Support both street and address (frontend uses address)
    const streetValue = address || street;
    
    // Validate required fields with module settings
    const requiredFields = await getModuleSettings('members');
    const validationErrors = validateRequiredFields(
      { first_name, last_name, email, phone, mobile, street, postal_code, city, birth_date, member_type_id, entry_date, profession, notes },
      requiredFields
    );
    
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    }
    
    // Clean date fields - convert empty strings to null
    const cleanBirthDate = cleanDate(birth_date);
    const cleanEntryDate = cleanDate(entry_date);
    const cleanExitDate = cleanDate(exit_date);
    const cleanWeddingDate = cleanDate(wedding_date);
    
    const result = await pool.query(
      `UPDATE members SET
        salutation = $1, title = $2, first_name = $3, last_name = $4, birth_name = $5,
        birth_date = $6, birth_place = $7, gender = $8, marital_status = $9, wedding_date = $10,
        street = $11, postal_code = $12, city = $13, country = $14,
        email = $15, phone = $16, mobile = $17,
        member_type_id = $18, member_function_id = $19, entry_date = $20, exit_date = $21,
        profession = $22, occupation = $23,
        distribution_scope = $24, letter_salutation = $25,
        notes = $26, is_active = $27, is_deceased = $28
      WHERE id = $29
      RETURNING *`,
      [
        salutation, title, first_name, last_name, birth_name,
        cleanBirthDate, birth_place, gender, marital_status, cleanWeddingDate,
        streetValue, postal_code, city, country || 'Deutschland',
        email, phone, mobile,
        member_type_id, member_function_id || null, cleanEntryDate, cleanExitDate,
        profession, occupation,
        distribution_scope || 'gesamter Verband', letter_salutation,
        notes, is_active !== false, is_deceased === true, id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mitglied nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Mitglieds' });
  }
});

// DELETE /api/members/:id - Delete member
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM members WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mitglied nicht gefunden' });
    }
    
    res.json({ success: true, message: 'Mitglied erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Mitglieds' });
  }
});

// GET /api/members/:id/functions - Get member functions
router.get('/:id/functions', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT mfm.*, mf.name as function_name, mf.description as function_description
       FROM member_function_mappings mfm
       JOIN member_functions mf ON mfm.function_id = mf.id
       WHERE mfm.member_id = $1
       ORDER BY mf.sort_order, mf.name`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching member functions:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Mitgliedsfunktionen' });
  }
});

// POST /api/members/:id/functions - Add function to member
router.post('/:id/functions', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { function_id, start_date, end_date } = req.body;
    
    if (!function_id) {
      return res.status(400).json({ error: 'Funktion ist erforderlich' });
    }
    
    const result = await pool.query(
      `INSERT INTO member_function_mappings (member_id, function_id, start_date, end_date, is_current)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, function_id, cleanDate(start_date), cleanDate(end_date), !end_date]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding member function:', error);
    res.status(500).json({ error: 'Fehler beim Hinzufügen der Funktion' });
  }
});

// DELETE /api/members/:id/functions/:mappingId - Remove function from member
router.delete('/:id/functions/:mappingId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { mappingId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM member_function_mappings WHERE id = $1 RETURNING *',
      [mappingId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funktionszuordnung nicht gefunden' });
    }
    
    res.json({ success: true, message: 'Funktion erfolgreich entfernt' });
  } catch (error) {
    console.error('Error removing member function:', error);
    res.status(500).json({ error: 'Fehler beim Entfernen der Funktion' });
  }
});

// GET /api/members/stats/:id - Get membership statistics
router.get('/stats/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT entry_date FROM members WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mitglied nicht gefunden' });
    }
    
    const duration = calculateDuration(result.rows[0].entry_date);
    
    res.json({
      years: duration.years,
      months: duration.months,
      days: duration.days,
      total_days: Math.floor((new Date() - new Date(result.rows[0].entry_date)) / (1000 * 60 * 60 * 24))
    });
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({ error: 'Fehler beim Berechnen der Statistiken' });
  }
});

module.exports = router;
