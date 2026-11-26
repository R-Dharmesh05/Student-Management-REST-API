const express = require("express");
const cors = require("cors");
const studentRoutes = require("./routes/students");

function createApp(pool, checkConnection) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "100kb" }));

  app.get("/", (req, res) => res.json({ name: "Student Management API", endpoints: "/api/students", health: "/health" }));

  // Database connectivity check
  app.get("/health", async (req, res) => {
    try { await checkConnection(pool); res.json({ status: "ok", database: "connected" }); }
    catch (e) { res.status(503).json({ status: "error", database: "unreachable", message: e.code || e.message }); }
  });

  app.use("/api/students", studentRoutes(pool));

  app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` }));

  // Central error handler
  app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Request body is not valid JSON" });
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "A student with this email already exists" });
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });
  return app;
}

module.exports = { createApp };
