const { pool } = require('../config/database');

const customersTable = `
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Germany',
  tax_id VARCHAR(50),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const personsTable = `
CREATE TABLE IF NOT EXISTS persons (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  position VARCHAR(100),
  department VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const updateTrigger = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql'
`;

async function runMigrations() {
  try {
    console.log('Starting migrations...');
    
    await pool.query(customersTable);
    console.log('✓ customers table created');
    
    await pool.query(personsTable);
    console.log('✓ persons table created');
    
    await pool.query(updateTrigger);
    console.log('✓ update trigger function created');
    
    // Create triggers for updated_at
    await pool.query('DROP TRIGGER IF EXISTS update_customers_updated_at ON customers');
    await pool.query('CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');
    console.log('✓ customers updated_at trigger created');
    
    await pool.query('DROP TRIGGER IF EXISTS update_persons_updated_at ON persons');
    await pool.query('CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');
    console.log('✓ persons updated_at trigger created');
    
    console.log('\nAll migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
