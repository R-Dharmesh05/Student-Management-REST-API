// Integration tests against a real MySQL server. Uses a separate database (student_db_test).
// Run: npm test   (needs MySQL running and DB_* values in .env)
require("dotenv").config();
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mysql = require("mysql2/promise");
const { createApp } = require("../src/app");
const { checkConnection } = require("../src/db");

const cfg = { host: process.env.DB_HOST || "localhost", port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "" };
let pool, server, base;
const good = { name: "Asha Rao", email: "asha@example.com", phone: "9876543210", course: "Computer Science", year: 2, address: "12 Lake Road" };
const call = (path, method = "GET", body) => fetch(base + path, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) });

before(async () => {
  const admin = await mysql.createConnection(cfg);
  await admin.query("DROP DATABASE IF EXISTS student_db_test");
  await admin.query("CREATE DATABASE student_db_test");
  await admin.end();
  pool = mysql.createPool({ ...cfg, database: "student_db_test" });
  await pool.query(`CREATE TABLE students (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE, phone CHAR(10) NOT NULL, course VARCHAR(80) NOT NULL, year TINYINT UNSIGNED NOT NULL,
    address VARCHAR(255) NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
  server = createApp(pool, checkConnection).listen(0);
  base = `http://localhost:${server.address().port}`;
});
after(async () => { server.close(); await pool.end(); });

test("health reports database connected", async () => {
  const r = await call("/health");
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { status: "ok", database: "connected" });
});

test("full CRUD lifecycle", async () => {
  let r = await call("/api/students", "POST", good);
  assert.equal(r.status, 201);
  const created = await r.json();
  assert.ok(created.id);

  r = await call(`/api/students/${created.id}`);
  assert.equal((await r.json()).email, good.email);

  r = await call(`/api/students/${created.id}`, "PUT", { ...good, course: "Electronics", year: 3 });
  const updated = await r.json();
  assert.equal(r.status, 200);
  assert.equal(updated.course, "Electronics");

  r = await call("/api/students?search=asha&course=Electronics");
  const list = await r.json();
  assert.equal(list.total, 1);

  r = await call(`/api/students/${created.id}`, "DELETE");
  assert.equal(r.status, 200);
  assert.equal((await call(`/api/students/${created.id}`)).status, 404);
});

test("validation errors return 400 with details", async () => {
  const r = await call("/api/students", "POST", { name: "", email: "bad", phone: "12", course: "", year: 9 });
  assert.equal(r.status, 400);
  assert.equal(Object.keys((await r.json()).details).length, 5);
});

test("duplicate email returns 409", async () => {
  await call("/api/students", "POST", { ...good, email: "dup@example.com" });
  assert.equal((await call("/api/students", "POST", { ...good, email: "DUP@example.com" })).status, 409);
});

test("bad id, unknown id and bad JSON are handled", async () => {
  assert.equal((await call("/api/students/abc")).status, 400);
  assert.equal((await call("/api/students/99999", "PUT", good)).status, 404);
  assert.equal((await call("/api/students/99999", "DELETE")).status, 404);
  const r = await fetch(base + "/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{oops" });
  assert.equal(r.status, 400);
});

test("pagination works", async () => {
  for (let i = 0; i < 4; i++) await call("/api/students", "POST", { ...good, email: `p${i}@example.com` });
  const r = await (await call("/api/students?limit=2&page=2")).json();
  assert.equal(r.data.length, 2);
  assert.ok(r.totalPages >= 3);
});
