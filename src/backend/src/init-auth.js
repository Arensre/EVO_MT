const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'evo_mt',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const SALT_ROUNDS = 10;

async function initAuth() {
  try {
    console.log('Initializing authentication system...');
    
    // Check if admin user already exists
    const adminCheck = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );
    
    if (adminCheck.rows.length > 0) {
      console.log('Admin user already exists, skipping initialization');
      return;
    }
    
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
    
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, first_name, last_name, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      ['admin', 'admin@evomt.local', hashedPassword, 'admin', 'System', 'Administrator', true]
    );
    
    console.log('Default admin user created:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  Email: admin@evomt.local');
    console.log('  Role: admin');
    
  } catch (error) {
    console.error('Error initializing auth:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initAuth();
