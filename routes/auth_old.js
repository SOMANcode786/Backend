const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db"); // promise pool

// Create table if missing
const initializeUsersTable = async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL
      )
    `;
    try {
        await db.query(query);
        console.log("Users table ready");
    } catch (err) {
        console.error("Error creating users table:", err);
    }
};
initializeUsersTable();

// HOME
router.get("/", (req, res) => {
    if (req.session.user) {
        return res.render("home", { title: "Welcome Home", user: req.session.user });
    }
    res.redirect("/login");
});

// REGISTER GET
router.get('/', (req, res) => {
    if (req.session.user) {
        return res.render('home', { title: 'Welcome Home', user: req.session.user });
    }
    res.redirect('/login');
});

// REGISTER GET
router.get("/register", (req, res) => {
    res.render("register", { title: "Register" });
});

// REGISTER POST
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).send("Fill all fields");

    try {
        const hash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            [username, email, hash]
        );

        req.session.user = { id: result.insertId, username, email };
        res.redirect("/");
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(400).send("Email/Username exists");
        console.error(err);
        res.status(500).send("Server error");
    }
});

// LOGIN GET
router.get("/login", (req, res) => res.render("login", { title: "Login" }));

// LOGIN POST
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("Enter email & password");

    try {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
        if (!rows.length) return res.status(401).send("Invalid credentials");

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).send("Invalid credentials");

        req.session.user = { id: user.id, username: user.username, email: user.email };
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// LOGOUT
router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send("Could not log out");
        res.redirect("/login");
    });
});

module.exports = router;
