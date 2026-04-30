const express = require('express');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');
const { requireAuth } = require('./middleware/auth');
const { requirePermission } = require('./middleware/permissions');

const app = express();
const PORT = process.env.PORT || 3001;

// Check JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set! Using default key. Set JWT_SECRET in production!');
}

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
// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const avatarRoutes = require('./routes/avatar');
// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/users', avatarRoutes);
app.use('/uploads/avatars', express.static(path.join(__dirname, '../../uploads/avatars')));
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

// Generate next supplier number
async function generateSupplierNumber() {
  const result = await pool.query(
    "SELECT supplier_number FROM suppliers WHERE supplier_number LIKE 'L%' ORDER BY supplier_number DESC LIMIT 1"
  );
  
  if (result.rows.length === 0 || !result.rows[0].supplier_number) {
    return 'L00001';
  }
  
  const lastNumber = result.rows[0].supplier_number;
  const numericPart = parseInt(lastNumber.substring(1), 10);
  const nextNumber = numericPart + 1;
  return 'L' + String(nextNumber).padStart(5, '0');
}

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/modules - Liste aller Module mit verfügbaren Actions
app.get('/api/modules', requireAuth, (req, res) => {
  res.json({
    modules: [
      { id: 'customers', name: 'Kunden', actions: ['read', 'write', 'delete'] },
      { id: 'suppliers', name: 'Lieferanten', actions: ['read', 'write', 'delete'] },
      { id: 'materials', name: 'Materialien', actions: ['read', 'write', 'delete'] }
    ]
  });
});

// === CUSTOMERS API ===

// GET /api/customers - Mit optionaler Personen-Suche (requires read permission)
app.get('/api/customers', requireAuth, requirePermission('customers', 'read'), async (req, res) => {
  try {
    const { search, personSearch } = req.query;
    
    let query = 'SELECT * FROM customers';
    let params = [];
    let whereConditions = [];
    
    // Allgemeine Suche (Name, Kundennummer)
    if (search) {
      whereConditions.push('(name ILIKE $1 OR customer_number ILIKE $1)');
      params.push('%' + search + '%');
    }
    
    // Ansprechpartner-Suche
    if (personSearch) {
      const personQuery = 'SELECT DISTINCT customer_id FROM persons WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1';
      const personResult = await pool.query(personQuery, ['%' + personSearch + '%']);
      const customerIds = personResult.rows.map(r => r.customer_id).filter(id => id !== null);
      
      if (customerIds.length > 0) {
        whereConditions.push('id IN (' + customerIds.join(',') + ')');
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

// GET /api/customers/:id (requires read permission)
app.get('/api/customers/:id', requireAuth, requirePermission('customers', 'read'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/customers (requires write permission)
app.post('/api/customers', requireAuth, requirePermission('customers', 'write'), async (req, res) => {
  try {
    const { name, type, address, postal_code, city, country, email, phone, status, notes } = req.body;
    
    const customerNumber = await generateCustomerNumber();
    
    const result = await pool.query(
      'INSERT INTO customers (customer_number, name, type, address, postal_code, city, country, email, phone, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [customerNumber, name, type || 'company', address, postal_code, city, country || 'Germany', email, phone, status || 'active', notes || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/customers/:id (requires write permission)
app.put('/api/customers/:id', requireAuth, requirePermission('customers', 'write'), async (req, res) => {
  try {
    const { name, type, address, postal_code, city, country, email, phone, status, notes } = req.body;
    const result = await pool.query(
      'UPDATE customers SET name=$1, type=$2, address=$3, postal_code=$4, city=$5, country=$6, email=$7, phone=$8, status=$9, notes=$10, updated_at=NOW() WHERE id=$11 RETURNING *',
      [name, type, address, postal_code, city, country, email, phone, status, notes || '', req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/customers/:id (requires delete permission)
app.delete('/api/customers/:id', requireAuth, requirePermission('customers', 'delete'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/customers/:id/persons (requires read permission)
app.get('/api/customers/:id/persons', requireAuth, requirePermission('customers', 'read'), async (req, res) => {
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

// === SUPPLIERS API ===

// GET /api/suppliers - Mit optionaler Personen-Suche (requires read permission)
app.get('/api/suppliers', requireAuth, requirePermission('suppliers', 'read'), async (req, res) => {
  try {
    const { search, personSearch } = req.query;
    
    let query = 'SELECT * FROM suppliers';
    let params = [];
    let whereConditions = [];
    
    // Allgemeine Suche (Name, Lieferantennummer)
    if (search) {
      whereConditions.push('(name ILIKE $1 OR supplier_number ILIKE $1)');
      params.push('%' + search + '%');
    }
    
    // Ansprechpartner-Suche
    if (personSearch) {
      const personQuery = 'SELECT DISTINCT supplier_id FROM persons WHERE supplier_id IS NOT NULL AND (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)';
      const personResult = await pool.query(personQuery, ['%' + personSearch + '%']);
      const supplierIds = personResult.rows.map(r => r.supplier_id).filter(id => id !== null);
      
      if (supplierIds.length > 0) {
        whereConditions.push('id IN (' + supplierIds.join(',') + ')');
      } else {
        // Wenn keine Ansprechpartner gefunden, leeres Ergebnis
        return res.json([]);
      }
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY supplier_number ASC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/suppliers/:id (requires read permission)
app.get('/api/suppliers/:id', requireAuth, requirePermission('suppliers', 'read'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/suppliers (requires write permission)
app.post('/api/suppliers', requireAuth, requirePermission('suppliers', 'write'), async (req, res) => {
  try {
    const { name, type, address, postal_code, city, country, email, phone, status, notes } = req.body;
    
    const supplierNumber = await generateSupplierNumber();
    
    const result = await pool.query(
      'INSERT INTO suppliers (supplier_number, name, type, address, postal_code, city, country, email, phone, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [supplierNumber, name, type || 'company', address, postal_code, city, country || 'Germany', email, phone, status || 'active', notes || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/suppliers/:id (requires write permission)
app.put('/api/suppliers/:id', requireAuth, requirePermission('suppliers', 'write'), async (req, res) => {
  try {
    const { name, type, address, postal_code, city, country, email, phone, status, notes } = req.body;
    const result = await pool.query(
      'UPDATE suppliers SET name=$1, type=$2, address=$3, postal_code=$4, city=$5, country=$6, email=$7, phone=$8, status=$9, notes=$10, updated_at=NOW() WHERE id=$11 RETURNING *',
      [name, type, address, postal_code, city, country, email, phone, status, notes || '', req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/suppliers/:id (requires delete permission)
app.delete('/api/suppliers/:id', requireAuth, requirePermission('suppliers', 'delete'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/suppliers/:id/persons (requires read permission)
app.get('/api/suppliers/:id/persons', requireAuth, requirePermission('suppliers', 'read'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM persons WHERE supplier_id = $1 ORDER BY is_primary DESC, last_name ASC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// === PERSONS API (Extended for both customers and suppliers) ===

// POST /api/persons
app.post('/api/persons', requireAuth, async (req, res) => {
  try {
    const { customer_id, supplier_id, first_name, last_name, email, phone, mobile, position, department, is_primary, notes } = req.body;
    
    // Validate that person belongs to either customer or supplier
    if (!customer_id && !supplier_id) {
      return res.status(400).json({ error: 'Person must belong to either a customer or supplier' });
    }
    if (customer_id && supplier_id) {
      return res.status(400).json({ error: 'Person cannot belong to both customer and supplier' });
    }
    
    // Check permissions based on parent type
    const parentType = customer_id ? 'customers' : 'suppliers';
    const hasPermission = req.userPermissions?.[parentType]?.write === true || req.user.role === 'admin';
    
    if (!hasPermission) {
      return res.status(403).json({ error: `Permission denied: write access to ${parentType} required` });
    }
    
    if (is_primary) {
      if (customer_id) {
        await pool.query(
          'UPDATE persons SET is_primary = false WHERE customer_id = $1',
          [customer_id]
        );
      } else if (supplier_id) {
        await pool.query(
          'UPDATE persons SET is_primary = false WHERE supplier_id = $1',
          [supplier_id]
        );
      }
    }
    
    const result = await pool.query(
      'INSERT INTO persons (customer_id, supplier_id, first_name, last_name, email, phone, mobile, position, department, is_primary, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [customer_id || null, supplier_id || null, first_name, last_name, email, phone, mobile, position, department, is_primary || false, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/persons/:id
app.put('/api/persons/:id', requireAuth, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, mobile, position, department, is_primary, notes } = req.body;
    
    const personResult = await pool.query('SELECT customer_id, supplier_id FROM persons WHERE id = $1', [req.params.id]);
    if (personResult.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    const { customer_id, supplier_id } = personResult.rows[0];
    
    // Check permissions based on parent type
    const parentType = customer_id ? 'customers' : 'suppliers';
    const hasPermission = req.userPermissions?.[parentType]?.write === true || req.user.role === 'admin';
    
    if (!hasPermission) {
      return res.status(403).json({ error: `Permission denied: write access to ${parentType} required` });
    }
    
    if (is_primary) {
      if (customer_id) {
        await pool.query(
          'UPDATE persons SET is_primary = false WHERE customer_id = $1 AND id != $2',
          [customer_id, req.params.id]
        );
      } else if (supplier_id) {
        await pool.query(
          'UPDATE persons SET is_primary = false WHERE supplier_id = $1 AND id != $2',
          [supplier_id, req.params.id]
        );
      }
    }
    
    const result = await pool.query(
      'UPDATE persons SET first_name=$1, last_name=$2, email=$3, phone=$4, mobile=$5, position=$6, department=$7, is_primary=$8, notes=$9, updated_at=NOW() WHERE id=$10 RETURNING *',
      [first_name, last_name, email, phone, mobile, position, department, is_primary, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/persons/:id
app.delete('/api/persons/:id', requireAuth, async (req, res) => {
  try {
    const personResult = await pool.query('SELECT customer_id, supplier_id FROM persons WHERE id = $1', [req.params.id]);
    if (personResult.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    const { customer_id, supplier_id } = personResult.rows[0];
    
    // Check permissions based on parent type
    const parentType = customer_id ? 'customers' : 'suppliers';
    const hasPermission = req.userPermissions?.[parentType]?.delete === true || req.user.role === 'admin';
    
    if (!hasPermission) {
      return res.status(403).json({ error: `Permission denied: delete access to ${parentType} required` });
    }
    
    const result = await pool.query('DELETE FROM persons WHERE id = $1 RETURNING *', [req.params.id]);
    res.json({ message: 'Person deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});
