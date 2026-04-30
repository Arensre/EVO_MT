const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const sharp = require('sharp');

const router = express.Router();

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'evo_mt',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Ensure uploads directory exists
const UPLOAD_DIR = process.env.AVATAR_UPLOAD_DIR || '/app/uploads/avatars';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for memory storage (we'll process with sharp)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Nur JPEG und PNG Bilder sind erlaubt'), false);
    }
  }
});

// POST /api/users/:id/avatar - Upload avatar
router.post('/:id/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user is uploading own avatar or is admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Zugriff verweigert' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Kein Bild hochgeladen' });
    }

    // Process image with sharp
    const processedBuffer = await sharp(req.file.buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer();

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `avatar_${userId}_${timestamp}.jpg`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Save processed image
    fs.writeFileSync(filepath, processedBuffer);

    // Get old avatar to delete it
    const oldUserResult = await pool.query(
      'SELECT avatar_url FROM users WHERE id = $1',
      [userId]
    );

    // Delete old avatar file if exists
    if (oldUserResult.rows.length > 0 && oldUserResult.rows[0].avatar_url) {
      const oldFilename = path.basename(oldUserResult.rows[0].avatar_url);
      const oldFilepath = path.join(UPLOAD_DIR, oldFilename);
      if (fs.existsSync(oldFilepath)) {
        fs.unlinkSync(oldFilepath);
      }
    }

    // Update database with new avatar URL
    const avatarUrl = `/uploads/avatars/${filename}`;
    await pool.query(
      'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2',
      [avatarUrl, userId]
    );

    res.json({
      success: true,
      avatarUrl: avatarUrl,
      message: 'Avatar erfolgreich hochgeladen'
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    if (error.message.includes('Nur JPEG und PNG')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Fehler beim Hochladen des Avatars' });
    }
  }
});

// GET /api/users/:id/avatar - Get avatar URL for a user
router.get('/:id/avatar', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const result = await pool.query(
      'SELECT avatar_url FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }
    
    res.json({
      avatarUrl: result.rows[0].avatar_url || null
    });
  } catch (error) {
    console.error('Get avatar error:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Avatars' });
  }
});

// DELETE /api/users/:id/avatar - Delete avatar
router.delete('/:id/avatar', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user is deleting own avatar or is admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Zugriff verweigert' });
    }

    // Get current avatar
    const result = await pool.query(
      'SELECT avatar_url FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    const avatarUrl = result.rows[0].avatar_url;
    
    // Delete file if exists
    if (avatarUrl) {
      const filename = path.basename(avatarUrl);
      const filepath = path.join(UPLOAD_DIR, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    // Update database
    await pool.query(
      'UPDATE users SET avatar_url = NULL, updated_at = NOW() WHERE id = $1',
      [userId]
    );

    res.json({ success: true, message: 'Avatar erfolgreich entfernt' });

  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Avatars' });
  }
});

// Serve avatar files statically (in production, this should be served by nginx)
router.get('/uploads/avatars/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Avatar nicht gefunden' });
    }
    
    res.sendFile(filepath);
  } catch (error) {
    console.error('Serve avatar error:', error);
    res.status(500).json({ error: 'Fehler beim Laden des Avatars' });
  }
});

module.exports = router;
