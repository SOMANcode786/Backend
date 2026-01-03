const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// ADD feedback
router.post('/', async (req, res) => {
  const { Customer_ID, Product_ID, Rating, Comment } = req.body;

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('Customer_ID', sql.Int, Customer_ID)
      .input('Product_ID', sql.Int, Product_ID)
      .input('Rating', sql.Int, Rating)
      .input('Comment', sql.NVarChar, Comment)
      .query(`
        INSERT INTO Feedback (Customer_ID, Product_ID, Rating, Comment)
        VALUES (@Customer_ID, @Product_ID, @Rating, @Comment)
      `);

    res.json({ message: 'Feedback added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save feedback', error: err });
  }
});

router.get('/', async (req, res) => {
  const { Product_ID } = req.query; // optional filter
  const pool = await poolPromise;

  let query = `SELECT * FROM Feedback`;
  if(Product_ID) query += ` WHERE Product_ID = @Product_ID`;

  const request = pool.request();
  if(Product_ID) request.input('Product_ID', sql.Int, Product_ID);

  const result = await request.query(query);
  res.json(result.recordset);
});

module.exports = router;
