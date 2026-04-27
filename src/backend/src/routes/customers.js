const { pool } = require('../config/database');

// GET /api/customers - List with search, filter, pagination
async function getCustomers(req, res) {
  try {
    const {
      search,
      status,
      country,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Status filter
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Country filter
    if (country) {
      query += ` AND country = $${paramIndex}`;
      params.push(country);
      paramIndex++;
    }

    // Count total
    const countResult = await pool.query(
      query.replace('SELECT *', 'SELECT COUNT(*)'),
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Sorting
    const allowedSortColumns = ['name', 'email', 'city', 'created_at', 'updated_at'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

    // Pagination
    const safePage = Math.max(1, parseInt(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (safePage - 1) * safeLimit;

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(safeLimit, offset);

    const result = await pool.query(query, params);

    res.json({
      data: result.rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
}

// GET /api/customers/:id - Get single customer
async function getCustomerById(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
}

// POST /api/customers - Create customer
async function createCustomer(req, res) {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      postal_code,
      country,
      tax_id,
      notes,
      status
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await pool.query(
      `INSERT INTO customers (name, email, phone, address, city, postal_code, country, tax_id, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, email, phone, address, city, postal_code, country || 'Germany', tax_id, notes, status || 'active']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
}

// PUT /api/customers/:id - Update customer
async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = ['name', 'email', 'phone', 'address', 'city', 'postal_code', 'country', 'tax_id', 'notes', 'status'];
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
      `UPDATE customers SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
}

// DELETE /api/customers/:id - Delete customer
async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM customers WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully', customer: result.rows[0] });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
}

// GET /api/customers/:id/persons - Get persons for customer
async function getCustomerPersons(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM persons WHERE customer_id = $1 ORDER BY is_primary DESC, last_name ASC',
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customer persons:', error);
    res.status(500).json({ error: 'Failed to fetch persons' });
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerPersons
};
