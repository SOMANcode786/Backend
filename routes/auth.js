const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../db');

/* =========================
    GET Register Page
========================= */
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register', error: null });
});

/* =========================
    POST Register
========================= */
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.render('register', { title: 'Register', error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;

    const result = await pool.request()
      .input('Name', sql.NVarChar, username)
      .input('Email', sql.NVarChar, email)
      .input('Password_Hash', sql.NVarChar, hashedPassword)
      .query(`INSERT INTO Users (Name, Email, Password_Hash) OUTPUT INSERTED.User_ID VALUES (@Name, @Email, @Password_Hash)`);

    // Log them in immediately
    req.session.user = { id: result.recordset[0].User_ID, name: username };
    
    // REDIRECT
    return res.redirect('/product.html');
  } catch (err) {
    console.error("Signup Error:", err);
    res.render('register', { title: 'Register', error: 'Database error' });
  }
});

/* =========================
    GET Login Page
========================= */
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', error: null });
});

/* =========================
    POST Login
========================= */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @Email');

    if (result.recordset.length === 0) {
      return res.render('login', { title: 'Login', error: 'Invalid User' });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.Password_Hash);

    if (isMatch) {
      req.session.user = { id: user.User_ID, name: user.Name };
      // SUCCESSFUL REDIRECT
      return res.redirect('/product.html');
    } else {
      return res.render('login', { title: 'Login', error: 'Wrong Password' });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.render('login', { title: 'Login', error: 'Server Error' });
  }
});

/* =========================
    API for Frontend Check
========================= */
router.get('/api/check-auth', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;