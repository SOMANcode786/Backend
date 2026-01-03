app.use('/', authRoutes);
const express = require('express');
const session = require('express-session');
const MSSQLStore = require('connect-mssql-v2');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();
const { poolPromise } = require('./db');
const authRoutes = require('./routes/auth');


const app = express();
const PORT = process.env.PORT || 3000;

// VIEW ENGINE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


