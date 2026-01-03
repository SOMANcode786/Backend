const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// 🔹 GET all products (List page)
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT p.*, c.Category_Name
      FROM Product p
      LEFT JOIN Category c ON p.Category_ID = c.Category_ID
    `);

    res.render('products/list', {
      title: 'Products',
      products: result.recordset
    });

  } catch (err) {
    console.error('PRODUCT LIST ERROR:', err);
    res.status(500).send('Error loading products');
  }
});

// 🔹 GET Add Product page
router.get('/add', async (req, res) => {
  try {
    const pool = await poolPromise;
    const categoriesResult = await pool.request().query('SELECT * FROM Category');

    res.render('products/add', {
      title: 'Add Product',
      categories: categoriesResult.recordset,
      error: null
    });

  } catch (err) {
    console.error('ADD PRODUCT PAGE ERROR:', err);
    res.status(500).send('Error loading add product page');
  }
});

// 🔹 POST Add Product
router.post('/add', async (req, res) => {
  try {
    const { Name, Description, Price, Image_URL, Category_ID } = req.body;

    // Validation
    if (!Name || !Price) {
      const pool = await poolPromise;
      const categoriesResult = await pool.request().query('SELECT * FROM Category');
      return res.render('products/add', {
        title: 'Add Product',
        categories: categoriesResult.recordset,
        error: 'Name and Price are required'
      });
    }

    // FIX: Convert types explicitly to prevent EPARAM errors
    const cleanCategoryID = (Category_ID && Category_ID !== "") ? parseInt(Category_ID) : null;
    const cleanPrice = parseFloat(Price);

    const pool = await poolPromise;
    await pool.request()
      .input('Name', sql.NVarChar(100), Name)
      .input('Description', sql.NVarChar(500), Description || null)
      .input('Price', sql.Decimal(10, 2), cleanPrice)
      .input('Image_URL', sql.NVarChar(sql.MAX), Image_URL || null)
      .input('Category_ID', sql.Int, cleanCategoryID)
      .query(`
        INSERT INTO Product (Name, Description, Price, Image_URL, Category_ID)
        VALUES (@Name, @Description, @Price, @Image_URL, @Category_ID)
      `);

    res.redirect('/products');

  } catch (err) {
    console.error('ADD PRODUCT ERROR:', err);
    const pool = await poolPromise;
    const categoriesResult = await pool.request().query('SELECT * FROM Category');

    res.render('products/add', {
      title: 'Add Product',
      categories: categoriesResult.recordset,
      error: 'Failed to add product: ' + err.message
    });
  }
});

// 🔹 GET Edit Product page
router.get('/edit/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const pool = await poolPromise;

    const productResult = await pool.request()
      .input('Product_ID', sql.Int, productId)
      .query('SELECT * FROM Product WHERE Product_ID = @Product_ID');

    if (!productResult.recordset[0]) {
      return res.status(404).send('Product not found');
    }

    const categoriesResult = await pool.request().query('SELECT * FROM Category');

    res.render('products/edit', {
      title: 'Edit Product',
      product: productResult.recordset[0],
      categories: categoriesResult.recordset,
      error: null
    });

  } catch (err) {
    console.error('EDIT PRODUCT PAGE ERROR:', err);
    res.status(500).send('Error loading edit product page');
  }
});

// 🔹 POST Update Product
router.post('/edit/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { Name, Description, Price, Image_URL, Category_ID } = req.body;

    if (!Name || !Price) {
      const pool = await poolPromise;
      const categoriesResult = await pool.request().query('SELECT * FROM Category');
      const productResult = await pool.request()
        .input('Product_ID', sql.Int, productId)
        .query('SELECT * FROM Product WHERE Product_ID = @Product_ID');

      return res.render('products/edit', {
        title: 'Edit Product',
        product: productResult.recordset[0],
        categories: categoriesResult.recordset,
        error: 'Name and Price are required'
      });
    }

    // FIX: Convert types explicitly to prevent EPARAM errors
    const cleanCategoryID = (Category_ID && Category_ID !== "") ? parseInt(Category_ID) : null;
    const cleanPrice = parseFloat(Price);

    const pool = await poolPromise;
    await pool.request()
      .input('Product_ID', sql.Int, productId)
      .input('Name', sql.NVarChar(100), Name)
      .input('Description', sql.NVarChar(500), Description || null)
      .input('Price', sql.Decimal(10, 2), cleanPrice)
      .input('Image_URL', sql.NVarChar(sql.MAX), Image_URL || null)
      .input('Category_ID', sql.Int, cleanCategoryID)
      .query(`
        UPDATE Product
        SET Name = @Name, Description = @Description, Price = @Price, Image_URL = @Image_URL, Category_ID = @Category_ID
        WHERE Product_ID = @Product_ID
      `);

    res.redirect('/products');

  } catch (err) {
    console.error('UPDATE PRODUCT ERROR:', err);
    res.status(500).send('Error updating product: ' + err.message);
  }
});

// 🔹 DELETE Product
router.delete('/delete/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const pool = await poolPromise;

    await pool.request()
      .input('Product_ID', sql.Int, productId)
      .query('DELETE FROM Product WHERE Product_ID = @Product_ID');

    res.status(200).json({ message: 'Product deleted successfully' });

  } catch (err) {
    console.error('DELETE PRODUCT ERROR:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;