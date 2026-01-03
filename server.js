const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");


const authRoutes = require("./routes/auth");


const app = express();


// Tell express where your static frontend files are
app.use(express.static(path.join(__dirname, '../JuiceB5')));


// If you want a specific route for the product page
app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, '../JuiceB5'));
});
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Session middleware
app.use(session({
  secret: "secretkey123",
  resave: false,
  saveUninitialized: false
}));


// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Routes
app.use("/", authRoutes);
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/customers', require('./routes/customers'));
app.use('/products', require('./routes/products'));
app.use('/categories', require('./routes/categories'));
app.use('/orders', require('./routes/orders'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/contact', require('./routes/contact'));
const cartRoutes = require('./routes/cart');
app.use('/api/products', require('./routes/productsApi'));



app.use('/cart', cartRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});


// Start server
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});