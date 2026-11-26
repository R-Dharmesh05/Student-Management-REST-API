// Creates the database and table from sql/schema.sql (no mysql CLI needed).
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });
  const sql = fs.readFileSync(path.join(__dirname, "../sql/schema.sql"), "utf8");
  await conn.query(sql);
  console.log("Database and students table are ready.");
  await conn.end();
})().catch((e) => { console.error("DB init failed:", e.message); process.exit(1); });
