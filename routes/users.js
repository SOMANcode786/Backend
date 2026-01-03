const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// ✅ RENDER EJS VIEW - Users Dashboard
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT User_ID, Name, Email, Created_At 
      FROM Users 
      ORDER BY Created_At DESC
    `);
    
    res.render('user/user', { 
      users: result.recordset, 
      title: 'Users Dashboard' 
    });
  } catch (err) {
    console.error('Users error:', err);
    res.status(500).send('Error loading users');
  }
});

// ✅ API endpoint (keep JSON if needed)
router.get('/api', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT User_ID, Name, Email FROM Users');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
