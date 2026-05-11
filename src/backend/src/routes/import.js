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

// Field definitions for templates
const fieldDefinitions = {
  members: ['first_name', 'last_name', 'email', 'phone', 'address', 'postal_code', 'city', 'country', 'notes'],
  customers: ['name', 'type', 'email', 'phone', 'address', 'postal_code', 'city', 'country', 'status', 'notes'],
  suppliers: ['name', 'type', 'email', 'phone', 'address', 'postal_code', 'city', 'country', 'status', 'notes']
};

// Download template
router.get('/template/:module', requireAuth, async (req, res) => {
  try {
    const { module } = req.params;
    
    if (!fieldDefinitions[module]) {
      return res.status(400).json({ error: 'Ungültiges Modul' });
    }
    
    const fields = fieldDefinitions[module];
    
    // Create CSV header
    const header = fields.join(';') + '\n';
    
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

// Parse CSV helper
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
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
  
  return data;
}

// Preview import (no database changes)
router.post('/preview', requireAuth, requirePermission('members', 'write'), async (req, res) => {
  try {
    // This would parse the uploaded file and return preview data
    // For now, return a placeholder
    res.json({ 
      preview: [],
      message: 'Preview not yet implemented - file upload needed'
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Vorschau fehlgeschlagen' });
  }
});

// Execute import
router.post('/execute', requireAuth, requirePermission('members', 'write'), async (req, res) => {
  try {
    // This would process the uploaded file and import to database
    // For now, return a placeholder
    res.json({ 
      success: 0, 
      errors: 0,
      message: 'Import not yet implemented - file upload needed'
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Import fehlgeschlagen' });
  }
});

module.exports = router;
