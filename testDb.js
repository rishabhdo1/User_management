const db = require("./config/database");

(async () => {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log("Database connected:", rows);
    process.exit(0);
  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
})();
