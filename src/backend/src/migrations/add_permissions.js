const { pool } = require('../config/database');

const addPermissionsColumn = `
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{
  "customers": {"read": true, "write": true, "delete": false},
  "suppliers": {"read": true, "write": false, "delete": false},
  "materials": {"read": false, "write": false, "delete": false}
}'::jsonb`;

const setAdminPermissions = `
UPDATE users 
SET permissions = '{
  "customers": {"read": true, "write": true, "delete": true},
  "suppliers": {"read": true, "write": true, "delete": true},
  "materials": {"read": true, "write": true, "delete": true}
}'::jsonb 
WHERE role = 'admin'`;

const setUserPermissions = `
UPDATE users 
SET permissions = '{
  "customers": {"read": true, "write": true, "delete": false},
  "suppliers": {"read": true, "write": false, "delete": false},
  "materials": {"read": false, "write": false, "delete": false}
}'::jsonb 
WHERE role = 'user' OR role IS NULL`;

async function runMigration() {
  try {
    console.log('Starting permissions migration...');
    
    // 1. Add permissions column
    await pool.query(addPermissionsColumn);
    console.log('✓ permissions column added to users table');
    
    // 2. Set default permissions for admin users
    await pool.query(setAdminPermissions);
    console.log('✓ admin users have full permissions');
    
    // 3. Set default permissions for regular users
    await pool.query(setUserPermissions);
    console.log('✓ regular users have limited permissions');
    
    console.log('\n✅ Permissions migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
