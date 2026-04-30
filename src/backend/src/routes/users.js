const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'evo_mt',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const SALT_ROUNDS = 10;

// Default permissions for new users
const DEFAULT_USER_PERMISSIONS = {
  customers: { read: true, write: true, delete: false },
  suppliers: { read: true, write: false, delete: false },
  materials: { read: false, write: false, delete: false }
};

// Default permissions for new admin
const DEFAULT_ADMIN_PERMISSIONS = {
  customers: { read: true, write: true, delete: true },
  suppliers: { read: true, write: true, delete: true },
  materials: { read: true, write: true, delete: true }
};

// GET /api/users/me - Get own profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, username, email, role, first_name, last_name, is_active, last_login, created_at, permissions, avatar_url FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      isActive: user.is_active,
      avatarUrl: user.avatar_url,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      permissions: user.permissions,
        avatarUrl: user.avatar_url,
      avatarUrl: user.avatar_url || DEFAULT_USER_PERMISSIONS
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// GET /api/users/me/permissions - Get own permissions
router.get('/me/permissions', requireAuth, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT permissions, role FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Admins have full permissions
    if (user.role === 'admin') {
      return res.json({
        role: 'admin',
        permissions: DEFAULT_ADMIN_PERMISSIONS
      });
    }
    
    res.json({
      role: user.role,
      permissions: user.permissions,
        avatarUrl: user.avatar_url,
      avatarUrl: user.avatar_url || DEFAULT_USER_PERMISSIONS
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to get permissions' });
  }
});

// PUT /api/users/me - Update own profile
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    
    const userResult = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2, email = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [firstName, lastName, email, req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      isActive: user.is_active,
      avatarUrl: user.avatar_url,
      avatarUrl: user.avatar_url
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/users/me/password - Change own password
router.put('/me/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    // Verify current password
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const validPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, req.user.id]
    );
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// GET /api/users - List all users (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const usersResult = await pool.query(
      'SELECT id, username, email, role, first_name, last_name, is_active, last_login, created_at, permissions, avatar_url FROM users ORDER BY username ASC'
    );
    
    const users = usersResult.rows.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      isActive: user.is_active,
      avatarUrl: user.avatar_url,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      permissions: user.permissions,
        avatarUrl: user.avatar_url,
      avatarUrl: user.avatar_url || (user.role === 'admin' ? DEFAULT_ADMIN_PERMISSIONS : DEFAULT_USER_PERMISSIONS)
    }));
    
    res.json(users);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// GET /api/users/:id - Get specific user (admin or own user)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user is admin or requesting own data
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const userResult = await pool.query(
      'SELECT id, username, email, role, first_name, last_name, is_active, last_login, created_at, permissions, avatar_url FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      isActive: user.is_active,
      avatarUrl: user.avatar_url,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      permissions: user.permissions,
        avatarUrl: user.avatar_url,
      avatarUrl: user.avatar_url || (user.role === 'admin' ? DEFAULT_ADMIN_PERMISSIONS : DEFAULT_USER_PERMISSIONS)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// GET /api/users/:id/permissions - Get user permissions (admin only)
router.get('/:id/permissions', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const userResult = await pool.query(
      'SELECT id, username, role, permissions FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Admins always have full permissions
    if (user.role === 'admin') {
      return res.json({
        userId: user.id,
        username: user.username,
        role: 'admin',
        permissions: DEFAULT_ADMIN_PERMISSIONS
      });
    }
    
    res.json({
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
        avatarUrl: user.avatar_url,
      avatarUrl: user.avatar_url || DEFAULT_USER_PERMISSIONS
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({ error: 'Failed to get user permissions' });
  }
});

// PUT /api/users/:id/permissions - Update user permissions (admin only)
router.put('/:id/permissions', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { permissions } = req.body;
    
    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({ error: 'Permissions object is required' });
    }
    
    // Get user to check role
    const userResult = await pool.query(
      'SELECT id, username, role FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Cannot change permissions of admins (they always have full permissions)
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot modify admin permissions. Admins always have full access.' });
    }
    
    // Validate permissions structure
    const validModules = ['customers', 'suppliers', 'materials'];
    const validActions = ['read', 'write', 'delete'];
    
    const validatedPermissions = {};
    for (const module of validModules) {
      validatedPermissions[module] = {};
      for (const action of validActions) {
        validatedPermissions[module][action] = permissions[module]?.[action] === true;
      }
    }
    
    // Update permissions
    const updateResult = await pool.query(
      'UPDATE users SET permissions = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, role, permissions',
      [JSON.stringify(validatedPermissions), userId]
    );
    
    const updatedUser = updateResult.rows[0];
    
    res.json({
      userId: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      permissions: updatedUser.permissions
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ error: 'Failed to update permissions' });
  }
});

// POST /api/users - Create new user (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role, permissions } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    // Validate username
    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ error: 'Username must be between 3 and 50 characters' });
    }
    
    // Validate password
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check if username exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    // Check if email exists
    const existingEmail = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingEmail.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Determine user role and permissions
    const userRole = role || 'user';
    const userPermissions = userRole === 'admin' 
      ? DEFAULT_ADMIN_PERMISSIONS 
      : (permissions || DEFAULT_USER_PERMISSIONS);
    
    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, role, permissions) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [username, email, hashedPassword, firstName || null, lastName || null, userRole, JSON.stringify(userPermissions)]
    );
    
    const user = userResult.rows[0];
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      isActive: user.is_active,
      avatarUrl: user.avatar_url,
      permissions: user.permissions,
        avatarUrl: user.avatar_url,
      avatarUrl: user.avatar_url
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id - Update user (admin or own user)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    console.log('PUT /api/users/:id - Request body:', req.body);
    const userId = parseInt(req.params.id);
    const { username, email, firstName, lastName, first_name, last_name, role, isActive, password, permissions } = req.body;
    
    // Check if user is admin or updating own profile
    const isAdmin = req.user.role === 'admin';
    const isOwnUser = req.user.id === userId;
    
    if (!isAdmin && !isOwnUser) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Non-admin users cannot change role or isActive
    if (!isAdmin && (role !== undefined || isActive !== undefined)) {
      return res.status(403).json({ error: 'Only admins can change role or active status' });
    }
    
    // Build update query
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (username !== undefined) {
      if (username.length < 3 || username.length > 50) {
        return res.status(400).json({ error: 'Username must be between 3 and 50 characters' });
      }
      // Check if username is taken by another user
      const existing = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, userId]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      updates.push('username = $' + paramIndex++);
      params.push(username);
    }
    
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      // Check if email is taken by another user
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      updates.push('email = $' + paramIndex++);
      params.push(email);
    }
    
    if (firstName !== undefined || first_name !== undefined) {
      updates.push('first_name = $' + paramIndex++);
      params.push(firstName !== undefined ? firstName : first_name);
    }
    
    if (lastName !== undefined || last_name !== undefined) {
      updates.push('last_name = $' + paramIndex++);
      params.push(lastName !== undefined ? lastName : last_name);
    }
    
    if (isAdmin && role !== undefined) {
      updates.push('role = $' + paramIndex++);
      params.push(role);
    }
    
    if (isAdmin && isActive !== undefined) {
      updates.push('is_active = $' + paramIndex++);
      params.push(isActive);
    }
    
    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      updates.push('password_hash = $' + paramIndex++);
      params.push(hashedPassword);
    }
    
    if (isAdmin && permissions !== undefined) {
      updates.push('permissions = $' + paramIndex++);
      params.push(JSON.stringify(permissions));
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push('updated_at = NOW()');
    params.push(userId);
    
    const userResult = await pool.query(
      'UPDATE users SET ' + updates.join(', ') + ' WHERE id = $' + paramIndex + ' RETURNING *',
      params
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      isActive: user.is_active,
      avatarUrl: user.avatar_url,
      permissions: user.permissions,
        avatarUrl: user.avatar_url,
      avatarUrl: user.avatar_url
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent deleting own account
    if (req.user.id === userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});



module.exports = router;
