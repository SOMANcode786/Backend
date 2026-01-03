const sql = require("mssql");

const config = {
  user: "soman",
  password: "Soman@123",
  server: "localhost",
  database: "juice_db",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: "SQLEXPRESS"
  },
  port: 1433
};

// Create pool promise
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ Connected to SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("❌ Database Connection Failed:", err);
  });

module.exports = {
  sql,
  poolPromise
};
