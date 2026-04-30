/**
 * Migration: Add avatar_url column to users table
 * Run with: node src/migrations/run.js
 */
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'evo_mt',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: add avatar_url to users...');
    
    await client.query('BEGIN');
    
    // Check if avatar_url column exists
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'avatar_url'
    `);
    
    if (checkResult.rows.length === 0) {
      // Add avatar_url column
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN avatar_url TEXT DEFAULT NULL
      `);
      console.log('✅ Added avatar_url column to users table');
    } else {
      console.log('ℹ️ avatar_url column already exists');
    }
    
    await client.query('COMMIT');
    console.log('Migration completed successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  migrate().catch(console.error);
}

module.exports = { migrate };
