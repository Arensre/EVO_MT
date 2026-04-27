const { pool } = require('../config/database');

// POST /api/persons - Create person (linked to customer)
async function createPerson(req, res) {
  try {
    const {
      customer_id,
      first_name,
      last_name,
      email,
      phone,
      mobile,
      position,
      department,
      is_primary,
      notes
    } = req.body;

    if (!customer_id || !first_name || !last_name) {
      return res.status(400).json({ error: 'customer_id, first_name, and last_name are required' });
    }

    // Check if customer exists
    const customerCheck = await pool.query(
      'SELECT id FROM customers WHERE id = $1',
      [customer_id]
    );

    if (customerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const result = await pool.query(
      `INSERT INTO persons (customer_id, first_name, last_name, email, phone, mobile, position, department, is_primary, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [customer_id, first_name, last_name, email, phone, mobile, position, department, is_primary || false, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ error: 'Failed to create person' });
  }
}

// PUT /api/persons/:id - Update person
async function updatePerson(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = ['customer_id', 'first_name', 'last_name', 'email', 'phone', 'mobile', 'position', 'department', 'is_primary', 'notes'];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE persons SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating person:', error);
    res.status(500).json({ error: 'Failed to update person' });
  }
}

// DELETE /api/persons/:id - Delete person
async function deletePerson(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM persons WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json({ message: 'Person deleted successfully', person: result.rows[0] });
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ error: 'Failed to delete person' });
  }
}

module.exports = {
  createPerson,
  updatePerson,
  deletePerson
};
