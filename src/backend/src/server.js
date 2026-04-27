const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Database
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'evo_mt',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Generate next customer number
async function generateCustomerNumber() {
  const result = await pool.query(
    "SELECT customer_number FROM customers WHERE customer_number LIKE 'K%' ORDER BY customer_number DESC LIMIT 1"
  );
  
  if (result.rows.length === 0 || !result.rows[0].customer_number) {
    return 'K00001';
  }
  
  const lastNumber = result.rows[0].customer_number;
  const numericPart = parseInt(lastNumber.substring(1), 10);
  const nextNumber = numericPart + 1;
  return 'K' + String(nextNumber).padStart(5, '0');
}

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/customers - Mit optionaler Personen-Suche
app.get('/api/customers', async (req, res) => {
  try {
    const { search, personSearch } = req.query;
    
    let query = 'SELECT * FROM customers';
    let params = [];
    let whereConditions = [];
    
    // Allgemeine Suche (Name, Kundennummer)
    if (search) {
      whereConditions.push('(name ILIKE $1 OR customer_number ILIKE $1)');
      params.push(`%${search}%`);
    }
    
    // Ansprechpartner-Suche
    if (personSearch) {
      const personQuery = `
        SELECT DISTINCT customer_id FROM persons 
        WHERE first_name ILIKE $${params.length + 1} 
        OR last_name ILIKE $${params.length + 1}
        OR email ILIKE $${params.length + 1}
      `;
      const personResult = await pool.query(personQuery, [`%${personSearch}%`]);
      const customerIds = personResult.rows.map(r => r.customer_id);
      
      if (customerIds.length > 0) {
        whereConditions.push(`id IN (${customerIds.join(',')})`);
      } else {
        // Wenn keine Ansprechpartner gefunden, leeres Ergebnis
        return res.json([]);
      }
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY customer_number ASC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/customers/:id
app.get('/api/customers/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/customers
app.post('/api/customers', async (req, res) => {
  try {
    const { name, type, address, postal_code, city, country, email, phone, status, notes } = req.body;
    
    const customerNumber = await generateCustomerNumber();
    
    const result = await pool.query(
      `INSERT INTO customers (customer_number, name, type, address, postal_code, city, country, email, phone, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [customerNumber, name, type || 'company', address, postal_code, city, country || 'Germany', email, phone, status || 'active', notes || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/customers/:id
app.put('/api/customers/:id', async (req, res) => {
  try {
    const { name, type, address, postal_code, city, country, email, phone, status, notes } = req.body;
    const result = await pool.query(
      `UPDATE customers SET name=$1, type=$2, address=$3, postal_code=$4, city=$5, country=$6, email=$7, phone=$8, status=$9, notes=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [name, type, address, postal_code, city, country, email, phone, status, notes || '', req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/customers/:id
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// === PERSONS API ===

// GET /api/customers/:id/persons
app.get('/api/customers/:id/persons', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM persons WHERE customer_id = $1 ORDER BY is_primary DESC, last_name ASC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/persons
app.post('/api/persons', async (req, res) => {
  try {
    const { customer_id, first_name, last_name, email, phone, mobile, position, department, is_primary, notes } = req.body;
    
    if (is_primary) {
      await pool.query(
        'UPDATE persons SET is_primary = false WHERE customer_id = $1',
        [customer_id]
      );
    }
    
    const result = await pool.query(
      `INSERT INTO persons (customer_id, first_name, last_name, email, phone, mobile, position, department, is_primary, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [customer_id, first_name, last_name, email, phone, mobile, position, department, is_primary || false, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/persons/:id
app.put('/api/persons/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, mobile, position, department, is_primary, notes } = req.body;
    
    const personResult = await pool.query('SELECT customer_id FROM persons WHERE id = $1', [req.params.id]);
    if (personResult.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    const customer_id = personResult.rows[0].customer_id;
    
    if (is_primary) {
      await pool.query(
        'UPDATE persons SET is_primary = false WHERE customer_id = $1 AND id != $2',
        [customer_id, req.params.id]
      );
    }
    
    const result = await pool.query(
      `UPDATE persons SET first_name=$1, last_name=$2, email=$3, phone=$4, mobile=$5, position=$6, department=$7, is_primary=$8, notes=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [first_name, last_name, email, phone, mobile, position, department, is_primary, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/persons/:id
app.delete('/api/persons/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM persons WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Person deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
