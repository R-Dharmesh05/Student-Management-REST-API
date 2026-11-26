const { pool, checkConnection } = require("./db");
const { createApp } = require("./app");

const PORT = Number(process.env.PORT) || 3000;

(async () => {
  try {
    await checkConnection(pool);
    console.log("MySQL connected.");
  } catch (e) {
    console.error(`Cannot connect to MySQL (${e.code || e.message}). Check .env and that MySQL is running, then run: npm run db:init`);
    process.exit(1);
  }
  createApp(pool, checkConnection).listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
})();
