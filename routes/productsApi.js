const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT * FROM Product
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load products' });
  }
});

module.exports = router;
