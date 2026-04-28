const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'postgres',
  port: 5432,
  database: 'evo_mt',
  user: 'postgres',
  password: 'postgres'
});

async function createAdmin() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    console.log('Generated hash:', hash);
    
    await pool.query(
      'INSERT INTO users (username, email, password_hash, role, first_name, last_name, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      ['admin', 'admin@evomt.local', hash, 'admin', 'System', 'Administrator', true]
    );
    
    console.log('Admin user created successfully');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

createAdmin();
