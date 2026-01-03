const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// POST add to cart / order
router.post('/add', async (req, res) => {
  try {
    const { User_ID, Product_ID, Quantity } = req.body;
    if (!User_ID || !Product_ID || !Quantity) return res.status(400).json({ error: 'Missing data' });

    const pool = await poolPromise;

    // 1️⃣ Get customer ID linked to this user
    const customerResult = await pool.request()
      .input('User_ID', sql.Int, User_ID)
      .query('SELECT c_id FROM Customers WHERE User_ID = @User_ID');

    if (customerResult.recordset.length === 0) {
      return res.status(400).json({ error: 'Customer not found' });
    }
    const Customer_ID = customerResult.recordset[0].c_id;

    // 2️⃣ Create a new order (Pending)
    const orderResult = await pool.request()
      .input('c_id', sql.Int, Customer_ID)
      .input('total_amount', sql.Decimal(10, 2), 0) // initial 0, will update
      .query(`
        INSERT INTO Orders (c_id, Order_Status, total_amount)
        OUTPUT INSERTED.Order_ID
        VALUES (@c_id, 'Pending', @total_amount)
      `);

    const Order_ID = orderResult.recordset[0].Order_ID;

    // 3️⃣ Get product price
    const productResult = await pool.request()
      .input('Product_ID', sql.Int, Product_ID)
      .query('SELECT Price FROM Product WHERE Product_ID = @Product_ID');

    const price = productResult.recordset[0].Price;

    // 4️⃣ Insert into Order_Details
    await pool.request()
      .input('Order_ID', sql.Int, Order_ID)
      .input('Product_ID', sql.Int, Product_ID)
      .input('Quantity', sql.Int, Quantity)
      .input('Price', sql.Decimal(10, 2), price)
      .query(`
        INSERT INTO Order_Details (Order_ID, Product_ID, Quantity, Price)
        VALUES (@Order_ID, @Product_ID, @Quantity, @Price)
      `);

    // 5️⃣ Update total_amount in Orders
    await pool.request()
      .input('Order_ID', sql.Int, Order_ID)
      .input('total_amount', sql.Decimal(10, 2), price * Quantity)
      .query('UPDATE Orders SET total_amount = @total_amount WHERE Order_ID = @Order_ID');

    res.json({ message: 'Order placed successfully' });

  } catch (err) {
    console.error('ADD TO CART ERROR:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

module.exports = router;
