// src/config/db.js

import pg from "pg";
import { logInfo, logError, logDebug } from "../utils/logger.js";

const { Pool } = pg;

// Destructure env vars
const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
  DB_PORT,
  NODE_ENV,
  DB_NAME_TEST,
} = process.env;

// 🔒 Validate DB config
if (
  !DB_HOST ||
  !DB_PASSWORD ||
  !DB_NAME ||
  !DB_USER ||
  !DB_PORT ||
  !DB_NAME_TEST
) {
  logError(
    "❌ Database environment variables are missing! Check your .env file."
  );
  process.exit(1);
}

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: NODE_ENV === "test" ? DB_NAME_TEST : DB_NAME,
  password: DB_PASSWORD,
  port: parseInt(DB_PORT, 10),
  connectionTimeoutMillis: 2000,
});

logInfo(
  `📦 Database is configured for: ${
    NODE_ENV === "test" ? DB_NAME_TEST : DB_NAME
  }`
);

// 🌱 Connection events
pool.on("connect", () => {
  logInfo(`🔗 Client connected (Pool size: ${pool.totalCount})`);
});
pool.on("error", (err) => {
  logError("🚨 Unexpected error on idle client", err);
  process.exit(-1);
});

// 🔌 Connect to the DB pool (used in app startup)
const connectToDb = async () => {
  try {
    const client = await pool.connect();
    logInfo("✅ Database connection pool established");
    client.release();
  } catch (error) {
    logError("❌ Unable to establish DB connection", error);
    process.exit(1);
  }
};

// ✅ Ensures DB schema creation is safe, consistent, and non-concurrent
const initializeDbSchema = async () => {
  const client = await pool.connect();
  try {
    logInfo("⚙️  Initializing database schema...");

    // 🔐 Prevent concurrent schema initialization
    await client.query("SELECT pg_advisory_lock(20250424)");
    await client.query("BEGIN");

    // Enable pgcrypto
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

    // USERS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL,
        email VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // SERVICE PROVIDER TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_provider (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        service VARCHAR(255) NOT NULL
      )
    `);

    // APPOINTMENTS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointment (
        client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        service_provider_id UUID NOT NULL REFERENCES service_provider(id) ON DELETE CASCADE,
        PRIMARY KEY (client_id, service_provider_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // TIME SLOT TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS time_slot (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        day DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        service_provider_id UUID NOT NULL REFERENCES service_provider(id) ON DELETE CASCADE,
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (start_time < end_time),
        UNIQUE (service_provider_id, day, start_time, end_time)
      )
    `);

    // INDEXES
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)"
    );
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_service_provider_user_id ON service_provider(user_id)"
    );
    // await client.query(
    //   "CREATE INDEX IF NOT EXISTS idx_appointment_user_id ON appointment(client_id)"
    // );
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_time_slot_user_id ON time_slot(service_provider_id)"
    );

    // TRIGGER FUNCTION ONLY FOR TABLES WITH Updated_at_column
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // TRIGGERS
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'update_time_slots_updated_at'
        ) THEN
          CREATE TRIGGER update_time_slots_updated_at
          BEFORE UPDATE ON time_slot
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'update_appointments_updated_at'
        ) THEN
          CREATE TRIGGER update_appointments_updated_at
          BEFORE UPDATE ON appointment
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END$$;
    `);

    await client.query("COMMIT");
    logInfo("🎉 DB schema initialized successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    logError("❌ Error while initializing the schema", error);
    throw error;
  } finally {
    await client.query("SELECT pg_advisory_unlock(20250424)");
    client.release();
  }
};

// 🛠️ Utility to run arbitrary SQL queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (NODE_ENV !== "production") {
      logDebug(`🧪 Query: ${text.slice(0, 80)}... | ${duration}ms`);
    }
    return result;
  } catch (err) {
    logError(`❌ Query failed: ${text.slice(0, 80)}...`, err);
    throw err;
  }
};

export { pool, connectToDb, query, initializeDbSchema };
