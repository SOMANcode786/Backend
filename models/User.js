// models/User.js
const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../db');

async function createUser({ username, email, passwordHash, role = 'user' }) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('username', sql.NVarChar(255), username)
    .input('email', sql.NVarChar(255), email)
    .input('passwordHash', sql.NVarChar(255), passwordHash)
    .input('role', sql.NVarChar(50), role)
    .query(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (@username, @email, @passwordHash, @role);
      SELECT SCOPE_IDENTITY() AS id;
    `);
  const userId = result.recordset[0].id;
  return findById(userId);
}

async function findByUsername(username) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('username', sql.NVarChar(255), username)
    .query(`SELECT id AS _id, username, email, password_hash AS passwordHash, role FROM users WHERE username = @username`);
  return result.recordset[0] || null;
}

async function findByEmail(email) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('email', sql.NVarChar(255), email)
    .query(`SELECT id AS _id, username, email, role, password_hash AS passwordHash FROM users WHERE email = @email`);
  return result.recordset[0] || null;
}

async function findById(id) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`SELECT id AS _id, username, email, role FROM users WHERE id = @id`);
  return result.recordset[0] || null;
}

async function verifyPassword(userRow, plainPassword) {
  if (!userRow) return false;

  if (!userRow.passwordHash) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, userRow._id)
      .query(`SELECT password_hash AS passwordHash FROM users WHERE id = @id`);
    if (!result.recordset[0]) return false;
    userRow.passwordHash = result.recordset[0].passwordHash;
  }

  return bcrypt.compare(plainPassword, userRow.passwordHash);
}

module.exports = { createUser, findByUsername, findByEmail, findById, verifyPassword };
