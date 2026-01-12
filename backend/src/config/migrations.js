import { query } from "./db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logInfo, logError } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  logInfo("Checking for pending migrations...");

  // Create migrations table if not exists
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get applied migrations
  const applied = await query("SELECT version FROM schema_migrations");
  const appliedVersions = new Set(applied.rows.map((r) => r.version));

  // Get migration files
  // Path resolves to backend/migrations relative to src/config/
  const migrationDir = path.resolve(__dirname, "../../migrations");

  if (!fs.existsSync(migrationDir)) {
    logInfo("No migrations directory found, skipping migrations.");
    return;
  }

  const files = fs.readdirSync(migrationDir).sort();
  let migrationCount = 0;

  for (const file of files) {
    if (!appliedVersions.has(file) && file.endsWith(".sql")) {
      logInfo(`Applying migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationDir, file), "utf8");

      // Simple transaction for each migration
      await query("BEGIN");
      try {
        await query(sql);
        await query("INSERT INTO schema_migrations (version) VALUES ($1)", [
          file
        ]);
        await query("COMMIT");
        migrationCount++;
        logInfo(`Successfully applied migration: ${file}`);
      } catch (err) {
        await query("ROLLBACK");
        logError(`Failed to apply migration ${file}`, err);
        throw err;
      }
    }
  }

  if (migrationCount === 0) {
    logInfo("Database is up to date.");
  } else {
    logInfo(`Applied ${migrationCount} migrations.`);
  }
}
