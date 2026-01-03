const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// SEND contact message
router.post('/', async (req, res) => {
  const { contact_name, contact_email, message } = req.body;
  const pool = await poolPromise;

  await pool.request()
    .input('contact_name', sql.VarChar, contact_name)
    .input('contact_email', sql.VarChar, contact_email)
    .input('message', sql.VarChar, message)
    .query(`
      INSERT INTO Contact (contact_name, contact_email, message)
      VALUES (@contact_name, @contact_email, @message)
    `);

  res.json({ message: 'Message sent' });
});


router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    
    // ✅ Fetch ALL Contacts (admin dashboard)
    const contactsResult = await pool.request().query(`
      SELECT contanct_id, contact_name, contact_email, message, date
      FROM Contact 
      ORDER BY date DESC
    `);

    res.render('contact', { 
      contacts: contactsResult.recordset, 
      title: 'Contacts Dashboard' 
    });
    
  } catch (err) {
    console.error('Contacts error:', err);
    res.status(500).render('error', { message: 'Failed to load contacts' });
  }
});

module.exports = router;
