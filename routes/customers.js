const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// LIST
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT c_id, c_name, Email, Address, phone_no FROM Customers ORDER BY c_id DESC');
    res.render('customers/list', { customers: result.recordset, title: 'Customers' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

// ADD FORM
router.get('/add', (req, res) => {
  res.render('customers/form', { title: 'Add Customer', customer: null, error: null });
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT ISNULL(MAX(c_id), 0) + 1 AS id FROM Customers');
    const id = result.recordset[0].id;
    
    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.VarChar, req.body.c_name)
      .input('email', sql.VarChar, req.body.Email)
      .input('address', sql.NVarChar, req.body.Address)
      .input('phone', sql.BigInt, parseInt(req.body.phone_no))
      .query('INSERT INTO Customers (c_id, c_name, Email, Address, phone_no) VALUES (@id, @name, @email, @address, @phone)');
    
    res.redirect('/customers');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// EDIT FORM
router.get('/edit/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Customers WHERE c_id = @id');
    
    res.render('customers/form', { 
      title: 'Edit Customer', 
      customer: result.recordset[0] || null, 
      error: null 
    });
  } catch (err) {
    res.status(500).send('Customer not found');
  }
});

// UPDATE
router.post('/edit/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('name', sql.VarChar, req.body.c_name)
      .input('email', sql.VarChar, req.body.Email)
      .input('address', sql.NVarChar, req.body.Address)
      .input('phone', sql.BigInt, parseInt(req.body.phone_no))
      .query('UPDATE Customers SET c_name=@name, Email=@email, Address=@address, phone_no=@phone WHERE c_id=@id');
    
    res.redirect('/customers');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM Customers WHERE c_id = @id');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
