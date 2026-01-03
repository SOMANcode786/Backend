const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// 🔹 GET all categories (List page)
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Category');

    res.render('categories/list', {
      title: 'Categories',
      categories: result.recordset
    });
  } catch (err) {
    console.error('CATEGORY LIST ERROR:', err);
    res.status(500).send('Error loading categories');
  }
});

// 🔹 GET Add Category page
router.get('/add', (req, res) => {
  res.render('categories/add', { title: 'Add Category', error: null });
});

// 🔹 POST Add Category
router.post('/add', async (req, res) => {
  try {
    const { Category_Name, Description } = req.body;

    if (!Category_Name) {
      return res.render('categories/add', { 
        title: 'Add Category', 
        error: 'Category Name is required' 
      });
    }

    const pool = await poolPromise;
    await pool.request()
      .input('Category_Name', sql.NVarChar(100), Category_Name)
      .input('Description', sql.NVarChar(500), Description || null)
      .query('INSERT INTO Category (Category_Name, Description) VALUES (@Category_Name, @Description)');

    res.redirect('/categories');
  } catch (err) {
    console.error('ADD CATEGORY ERROR:', err);
    res.status(500).send('Error saving category');
  }
});


// 🔹 GET Edit Category page
router.get('/edit/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('Category_ID', sql.Int, categoryId)
      .query('SELECT * FROM Category WHERE Category_ID = @Category_ID');

    if (!result.recordset[0]) {
      return res.status(404).send('Category not found');
    }

    res.render('categories/edit', {
      title: 'Edit Category',
      category: result.recordset[0],
      error: null
    });
  } catch (err) {
    console.error('EDIT CATEGORY PAGE ERROR:', err);
    res.status(500).send('Error loading edit page');
  }
});

// 🔹 POST Update Category
router.post('/edit/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { Category_Name, Description } = req.body;

    if (!Category_Name) {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('Category_ID', sql.Int, categoryId)
        .query('SELECT * FROM Category WHERE Category_ID = @Category_ID');

      return res.render('categories/edit', {
        title: 'Edit Category',
        category: result.recordset[0],
        error: 'Category Name is required'
      });
    }

    const pool = await poolPromise;
    await pool.request()
      .input('Category_ID', sql.Int, categoryId)
      .input('Category_Name', sql.NVarChar(100), Category_Name)
      .input('Description', sql.NVarChar(500), Description || null)
      .query(`
        UPDATE Category 
        SET Category_Name = @Category_Name, Description = @Description 
        WHERE Category_ID = @Category_ID
      `);

    res.redirect('/categories');
  } catch (err) {
    console.error('UPDATE CATEGORY ERROR:', err);
    res.status(500).send('Error updating category: ' + err.message);
  }
});
module.exports = router;