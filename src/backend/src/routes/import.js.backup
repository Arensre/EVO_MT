const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'evo_mt',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Generate next member number
async function generateMemberNumber() {
  const result = await pool.query(
    "SELECT member_number FROM members WHERE member_number LIKE 'M%' ORDER BY member_number DESC LIMIT 1"
  );
  
  if (result.rows.length === 0 || !result.rows[0].member_number) {
    return 'M00001';
  }
  
  const lastNumber = result.rows[0].member_number;
  const numericPart = parseInt(lastNumber.substring(1), 10);
  const nextNumber = numericPart + 1;
  return 'M' + String(nextNumber).padStart(5, '0');
}

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

// Field definitions for templates and validation
const fieldDefinitions = {
  members: {
    required: ['first_name', 'last_name'],
    optional: ['email', 'phone', 'address', 'postal_code', 'city', 'country', 'notes'],
    all: ['first_name', 'last_name', 'email', 'phone', 'address', 'postal_code', 'city', 'country', 'notes']
  },
  customers: {
    required: ['name', 'type'],
    optional: ['email', 'phone', 'address', 'postal_code', 'city', 'country', 'status', 'notes'],
    all: ['name', 'type', 'email', 'phone', 'address', 'postal_code', 'city', 'country', 'status', 'notes']
  },
  suppliers: {
    required: ['name', 'type'],
    optional: ['email', 'phone', 'address', 'postal_code', 'city', 'country', 'status', 'notes'],
    all: ['name', 'type', 'email', 'phone', 'address', 'postal_code', 'city', 'country', 'status', 'notes']
  }
};

// Parse CSV with semicolon delimiter
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 1) return { headers: [], data: [] };
  
  const headers = lines[0].split(';').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : '';
    });
    data.push(row);
  }
  
  return { headers, data };
}

// Validate data against module schema
function validateData(module, data) {
  const def = fieldDefinitions[module];
  const errors = [];
  const validData = [];
  
  data.forEach((row, index) => {
    const rowErrors = [];
    const validatedRow = {};
    
    // Check required fields
    def.required.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        rowErrors.push(`Feld "${field}" ist erforderlich`);
      }
    });
    
    // Copy all defined fields
    def.all.forEach(field => {
      validatedRow[field] = row[field] || '';
    });
    
    // Validate email format if provided
    if (row.email && row.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        rowErrors.push('Ungültige E-Mail-Adresse');
      }
    }
    
    if (rowErrors.length > 0) {
      errors.push({ row: index + 2, errors: rowErrors, data: row });
    } else {
      validData.push(validatedRow);
    }
  });
  
  return { validData, errors };
}

// Download template
router.get('/template/:module', requireAuth, async (req, res) => {
  try {
    const { module } = req.params;
    
    if (!fieldDefinitions[module]) {
      return res.status(400).json({ error: 'Ungültiges Modul' });
    }
    
    const def = fieldDefinitions[module];
    
    // Create CSV header
    const header = def.all.join(';') + '\n';
    
    // Add sample data row
    let sampleData = '';
    if (module === 'members') {
      sampleData = 'Max;Mustermann;max@example.com;0123-4567890;Musterstraße 1;12345;Musterstadt;Deutschland;Beispielnotiz\n';
    } else if (module === 'customers') {
      sampleData = 'Musterfirma GmbH;company;kontakt@musterfirma.de;0123-4567890;Industriestr. 1;12345;Musterstadt;Deutschland;active;Kunde seit 2024\n';
    } else if (module === 'suppliers') {
      sampleData = 'Muster Lieferant GmbH;company;info@musterlieferant.de;0123-4567890;Lieferantenweg 1;12345;Musterstadt;Deutschland;active;Lieferant für Material\n';
    }
    
    const csvContent = header + sampleData;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${module}_template.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({ error: 'Download fehlgeschlagen' });
  }
});

// Preview import - store file temporarily and return preview
router.post('/preview', requireAuth, requirePermission('members', 'write'), async (req, res) => {
  try {
    const { module } = req.body;
    const fileContent = req.body.fileContent; // Base64 encoded
    
    if (!module || !fieldDefinitions[module]) {
      return res.status(400).json({ error: 'Ungültiges Modul' });
    }
    
    if (!fileContent) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }
    
    // Decode base64
    const csvText = Buffer.from(fileContent, 'base64').toString('utf-8');
    
    // Parse CSV
    const { headers, data } = parseCSV(csvText);
    
    // Validate headers
    const def = fieldDefinitions[module];
    const missingRequired = def.required.filter(f => !headers.includes(f));
    
    if (missingRequired.length > 0) {
      return res.status(400).json({
        error: 'Fehlende Pflichtfelder im CSV',
        missingFields: missingRequired
      });
    }
    
    // Validate data
    const { validData, errors } = validateData(module, data);
    
    res.json({
      preview: validData.slice(0, 10), // First 10 rows for preview
      totalRows: data.length,
      validRows: validData.length,
      errorRows: errors.length,
      errors: errors.slice(0, 5), // Show first 5 errors
      headers
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Vorschau fehlgeschlagen: ' + error.message });
  }
});

// Execute import
router.post('/execute', requireAuth, requirePermission('members', 'write'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { module } = req.body;
    const fileContent = req.body.fileContent;
    const userId = req.user?.id;
    
    if (!module || !fieldDefinitions[module]) {
      return res.status(400).json({ error: 'Ungültiges Modul' });
    }
    
    if (!fileContent) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }
    
    // Decode and parse
    const csvText = Buffer.from(fileContent, 'base64').toString('utf-8');
    const { data } = parseCSV(csvText);
    
    // Validate
    const { validData, errors } = validateData(module, data);
    
    if (validData.length === 0) {
      return res.status(400).json({
        error: 'Keine gültigen Daten zum Importieren',
        errors
      });
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    let insertedCount = 0;
    const insertErrors = [];
    
    // Get starting number for the batch
    let currentNumber = null;
    if (module === 'members') {
      const result = await client.query(
        "SELECT COALESCE(MAX(NULLIF(regexp_replace(member_number, '[^0-9]', '', 'g'), '')), '0')::int as max_num FROM members WHERE member_number LIKE 'M%'"
      );
      currentNumber = parseInt(result.rows[0].max_num) || 0;
    } else if (module === 'customers') {
      const result = await client.query(
        "SELECT COALESCE(MAX(NULLIF(regexp_replace(customer_number, '[^0-9]', '', 'g'), '')), '0')::int as max_num FROM customers WHERE customer_number LIKE 'K%'"
      );
      currentNumber = parseInt(result.rows[0].max_num) || 0;
    } else if (module === 'suppliers') {
      const result = await client.query(
        "SELECT COALESCE(MAX(NULLIF(regexp_replace(supplier_number, '[^0-9]', '', 'g'), '')), '0')::int as max_num FROM suppliers WHERE supplier_number LIKE 'L%'"
      );
      currentNumber = parseInt(result.rows[0].max_num) || 0;
    }
    
    for (const row of validData) {
      try {
        currentNumber++; // Increment for each row
        
        if (module === 'members') {
          const memberNumber = 'M' + String(currentNumber).padStart(5, '0');
          await client.query(
            `INSERT INTO members (member_number, first_name, last_name, email, phone, 
             street, postal_code, city, country, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [memberNumber, row.first_name, row.last_name, row.email || null,
             row.phone || null, row.address || null, row.postal_code || null,
             row.city || null, row.country || 'Deutschland', row.notes || null]
          );
        } else if (module === 'customers') {
          const customerNumber = 'K' + String(currentNumber).padStart(5, '0');
          await client.query(
            `INSERT INTO customers (customer_number, name, type, email, phone, 
             address, postal_code, city, country, status, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [customerNumber, row.name, row.type, row.email || null,
             row.phone || null, row.address || null, row.postal_code || null,
             row.city || null, row.country || 'Deutschland', 
             row.status || 'active', row.notes || null]
          );
        } else if (module === 'suppliers') {
          const supplierNumber = 'L' + String(currentNumber).padStart(5, '0');
          await client.query(
            `INSERT INTO suppliers (supplier_number, name, type, email, phone, 
             address, postal_code, city, country, status, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [supplierNumber, row.name, row.type, row.email || null,
             row.phone || null, row.address || null, row.postal_code || null,
             row.city || null, row.country || 'Deutschland', 
             row.status || 'active', row.notes || null]
          );
        }
        insertedCount++;
      } catch (err) {
        insertErrors.push({ row: row, error: err.message });
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: insertedCount,
      errors: errors.length + insertErrors.length,
      importErrors: insertErrors.slice(0, 5),
      message: `${insertedCount} von ${data.length} Einträgen importiert`
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Import error:', error);
    res.status(500).json({ error: 'Import fehlgeschlagen: ' + error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
