const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'evo_mt',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Module configuration
const MODULES = ['customers', 'suppliers', 'materials'];
const ACTIONS = ['read', 'write', 'delete'];

/**
 * Get user permissions from database
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - Permissions object
 */
async function getUserPermissions(userId) {
  try {
    const result = await pool.query(
      'SELECT permissions FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const permissions = result.rows[0].permissions;
    
    // Ensure all modules exist with default values
    const defaultPermissions = {
      customers: { read: true, write: true, delete: false },
      suppliers: { read: true, write: false, delete: false },
      materials: { read: false, write: false, delete: false }
    };
    
    // Merge with defaults to ensure all modules exist
    return { ...defaultPermissions, ...permissions };
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return null;
  }
}

/**
 * Check if user has specific permission
 * @param {Object} permissions - User permissions object
 * @param {string} module - Module name (customers, suppliers, materials)
 * @param {string} action - Action (read, write, delete)
 * @returns {boolean}
 */
function checkPermission(permissions, module, action) {
  if (!permissions || !permissions[module]) {
    return false;
  }
  return permissions[module][action] === true;
}

/**
 * Middleware factory to require specific permission
 * @param {string} module - Module name
 * @param {string} action - Action name
 * @returns {Function} - Express middleware
 */
function requirePermission(module, action) {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Admin bypass - admins have all permissions
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Get fresh permissions from database
      const permissions = await getUserPermissions(req.user.id);
      
      if (!permissions) {
        return res.status(500).json({ error: 'Failed to load permissions' });
      }
      
      // Check permission
      if (!checkPermission(permissions, module, action)) {
        return res.status(403).json({ 
          error: `Permission denied: ${action} access to ${module} required` 
        });
      }
      
      // Attach permissions to request for later use
      req.userPermissions = permissions;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Middleware to load user permissions without checking
 * Attaches permissions to req.userPermissions
 */
async function loadPermissions(req, res, next) {
  try {
    if (!req.user) {
      req.userPermissions = null;
      return next();
    }
    
    const permissions = await getUserPermissions(req.user.id);
    req.userPermissions = permissions;
    next();
  } catch (error) {
    console.error('Error loading permissions:', error);
    req.userPermissions = null;
    next();
  }
}

/**
 * Helper to check permission for use in routes
 * @param {number} userId - User ID
 * @param {string} module - Module name
 * @param {string} action - Action name
 * @returns {Promise<boolean>}
 */
async function hasPermission(userId, module, action) {
  const permissions = await getUserPermissions(userId);
  return checkPermission(permissions, module, action);
}

module.exports = {
  MODULES,
  ACTIONS,
  getUserPermissions,
  checkPermission,
  requirePermission,
  loadPermissions,
  hasPermission
};
