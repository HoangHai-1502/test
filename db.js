const sql = require("mssql");

// cấu hình SQL Server
const config = {
  user: "nhitt",              // username SQL Server
  password: "123456",  // password
  server: "localhost",
  port: 50744,     // tên server SQL
  database: "myweb",// tên database
  options: {
    encrypt: false,        // dùng true nếu Azure
    trustServerCertificate: true // bỏ check SSL khi local
  }
};

async function getConnection() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error("SQL connection error:", err);
    throw err;
  }
}

module.exports = { sql, getConnection };
