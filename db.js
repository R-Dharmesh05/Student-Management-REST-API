require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "student_db",
  waitForConnections: true,
  connectionLimit: 10,
});

// Verifies connectivity; used at startup and by GET /health.
async function checkConnection(p = pool) {
  const [rows] = await p.query("SELECT 1 AS ok");
  return rows[0].ok === 1;
}

module.exports = { pool, checkConnection };
