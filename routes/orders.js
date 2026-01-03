const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

router.post('/', async (req, res) => {
    console.log('📦 Body:', req.body);
    
    const { customerName, customerEmail, customerPhone, customerAddress, total_amount } = req.body;
    
    try {
        const pool = await poolPromise;
        
        // 🔥 STEP 1: SAFE CUSTOMER CREATION
        let c_id = 1; // Default fallback
        
        // Check if customer exists by email
        const checkCustomer = await pool.request()
            .input('email', sql.VarChar(255), customerEmail)
            .query('SELECT c_id FROM Customers WHERE Email = @email');
        
        if (checkCustomer.recordset.length === 0) {
            // Create NEW customer - YOUR EXACT SCHEMA
            const maxCustomerId = await pool.request()
                .query("SELECT ISNULL(MAX(c_id), 0) + 1 AS nextId FROM Customers");
            c_id = maxCustomerId.recordset[0].nextId;
            
            await pool.request()
                .input('c_id', sql.Int, c_id)
                .input('c_name', sql.VarChar(30), customerName.substring(0, 30))
                .input('email', sql.VarChar(255), customerEmail)
                .input('address', sql.NVarChar(500), customerAddress)
                .input('phone_no', sql.BigInt, parseInt(customerPhone))
                .query(`
                    INSERT INTO Customers (c_id, c_name, Email, Address, phone_no)
                    VALUES (@c_id, @c_name, @email, @address, @phone_no)
                `);
            console.log('✅ NEW CUSTOMER CREATED:', c_id);
        } else {
            c_id = checkCustomer.recordset[0].c_id;
            console.log('✅ USING EXISTING CUSTOMER:', c_id);
        }
        
        // STEP 2: Create order (ALREADY WORKS)
        const orderResult = await pool.request().query('SELECT ISNULL(MAX(Order_id), 0) + 1 AS new_id FROM orders');
        const order_id = orderResult.recordset[0].new_id;
        
        await pool.request()
            .input('order_id', sql.Int, order_id)
            .input('status', sql.VarChar(20), 'Pending')
            .input('total', sql.Decimal(10,2), parseFloat(total_amount))
            .input('c_id', sql.Int, c_id)
            .query(`
                INSERT INTO orders (Order_id, Order_Status, total_amount, Order_Date, c_id)
                VALUES (@order_id, @status, @total, GETDATE(), @c_id)
            `);
        
        console.log(`🎉 FULL ORDER #${order_id} SUCCESS with Customer #${c_id}`);
        res.json({ success: true, Order_ID: order_id });
        
    } catch (error) {
        console.error('ERROR:', error.message);
        // FALLBACK: Create order anyway with customer 1
        try {
            const pool = await poolPromise;
            const orderResult = await pool.request().query('SELECT ISNULL(MAX(Order_id), 0) + 1 AS new_id FROM orders');
            const order_id = orderResult.recordset[0].new_id;
            
            await pool.request()
                .input('order_id', sql.Int, order_id)
                .input('status', sql.VarChar(20), 'Pending')
                .input('total', sql.Decimal(10,2), parseFloat(req.body.total_amount))
                .input('c_id', sql.Int, 1)
                .query('INSERT INTO orders (Order_id, Order_Status, total_amount, Order_Date, c_id) VALUES (@order_id, @status, @total, GETDATE(), @c_id)');
            
            res.json({ success: true, Order_ID: order_id, note: 'Customer creation failed, used fallback' });
        } catch (fallbackError) {
            res.status(500).json({ success: false, error: fallbackError.message });
        }
    }
});
// ✅ ADMIN VIEW - Add this route
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const ordersResult = await pool.request().query(`
      SELECT o.*, c.c_name, c.Email, c.phone_no 
      FROM orders o 
      LEFT JOIN Customers c ON o.c_id = c.c_id 
      ORDER BY o.Order_Date DESC
    `);
    res.render('orders/list', { orders: ordersResult.recordset });
  } catch (err) {
    res.status(500).send('Error loading orders');
  }
});


module.exports = router;
