import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
import { logInfo, logError, logDebug } from "../utils/logger.js";

const { Pool } = pg;

/* ---------------------------------------
   ENV
---------------------------------------- */
const {
  DATABASE_URL,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
  DB_PORT,
  NODE_ENV = "production",
  DB_RESET_ON_START = "false"
} = process.env;

/* ---------------------------------------
   POOL CONFIG
---------------------------------------- */
const poolConfig = DATABASE_URL
  ? {
      connectionString: DATABASE_URL,
      ssl: NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000
    }
  : {
      user: DB_USER,
      host: DB_HOST,
      database: DB_NAME,
      password: DB_PASSWORD,
      port: Number(DB_PORT),
      ssl: NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000
    };

const pool = new Pool(poolConfig);

/* ---------------------------------------
   POOL EVENTS
---------------------------------------- */
pool.on("connect", () => {
  logInfo("🔗 Database connection established");
});

pool.on("error", (err) => {
  logError("🚨 Unexpected DB pool error", err);
  process.exit(1);
});

/* ---------------------------------------
   BASIC QUERY HELPER
---------------------------------------- */
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);

  if (NODE_ENV !== "production") {
    logDebug(`🧪 Query (${Date.now() - start}ms): ${text.slice(0, 100)}...`);
  }

  return res;
};

/* ---------------------------------------
   TRANSACTION HELPER (CRITICAL)
---------------------------------------- */
const withTransaction = async (callback) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/* ---------------------------------------
   CONNECTION CHECK
---------------------------------------- */
const connectToDb = async () => {
  const client = await pool.connect();
  client.release();
  logInfo("✅ Database connection verified");
};

/* ---------------------------------------
   SCHEMA INITIALIZATION
---------------------------------------- */
const initializeDbSchema = async () => {
  const client = await pool.connect();

  try {
    logInfo("⚙️ Initializing database schema...");
    await client.query("SELECT pg_advisory_lock(20250424)");
    await client.query("BEGIN");

    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    if (DB_RESET_ON_START === "true") {
      if (NODE_ENV === "production") {
        throw new Error("DB_RESET_ON_START is not allowed in production");
      }

      logInfo("⚠️ DEV RESET ENABLED");

      await client.query(`
        DROP TABLE IF EXISTS appointments CASCADE;
        DROP TABLE IF EXISTS time_slots CASCADE;
        DROP TABLE IF EXISTS services CASCADE;
        DROP TABLE IF EXISTS providers CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255),
        user_type VARCHAR(20) CHECK (user_type IN ('client','provider')),
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP,
        google_access_token TEXT,
        google_refresh_token TEXT,
        google_token_expiry TIMESTAMP,
        calendar_sync_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add Google Calendar columns if they don't exist
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS google_access_token TEXT,
      ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
      ADD COLUMN IF NOT EXISTS google_token_expiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS calendar_sync_enabled BOOLEAN DEFAULT FALSE;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS providers (
        provider_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        bio TEXT,
        phone VARCHAR(50),
        hourly_rate DECIMAL(10,2),
        referral_code VARCHAR(50),
        booking_slug VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Idempotent migrations for providers columns added after initial table creation.
    // ALTER TABLE ... ADD COLUMN IF NOT EXISTS is safe to run on every startup.
    await client.query(`
      ALTER TABLE providers
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50);
    `);
    // booking_slug must be added separately because of the UNIQUE constraint.
    await client.query(`
      ALTER TABLE providers
      ADD COLUMN IF NOT EXISTS booking_slug VARCHAR(255);
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS providers_booking_slug_key ON providers (booking_slug);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES providers(provider_id) ON DELETE CASCADE,
        service_name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        duration_minutes INTEGER NOT NULL,
        location TEXT,
        additional_description TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Idempotent migrations for services columns added after initial deployment
    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS additional_description TEXT,
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS category VARCHAR(100);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        timeslot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES providers(provider_id) ON DELETE CASCADE,
        service_id UUID REFERENCES services(service_id) ON DELETE CASCADE,
        day DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_booked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT check_end_after_start CHECK (end_time > start_time)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        provider_id UUID NOT NULL REFERENCES providers(provider_id) ON DELETE CASCADE,
        service_id UUID REFERENCES services(service_id) ON DELETE SET NULL,
        timeslot_id UUID REFERENCES time_slots(timeslot_id) ON DELETE SET NULL,
        appointment_date DATE,
        appointment_time TIME,
        guest_name VARCHAR(255),
        guest_email VARCHAR(255),
        guest_phone VARCHAR(50),
        is_guest_booking BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'pending'
          CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS provider_reviews (
        review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES providers(provider_id) ON DELETE CASCADE,
        booking_id UUID REFERENCES appointments(appointment_id) ON DELETE CASCADE,
        reviewer_user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query("COMMIT");
    logInfo("🎉 Database schema ready");
  } catch (err) {
    await client.query("ROLLBACK");
    logError("❌ Schema initialization failed", err);
    throw err;
  } finally {
    await client.query("SELECT pg_advisory_unlock(20250424)");
    client.release();
  }

  // Post-transaction idempotent migrations — run OUTSIDE the main transaction
  // so a failure in one doesn't roll back the entire schema.
  // Each ALTER is already atomic in PostgreSQL without explicit BEGIN/COMMIT.
  await _runPostMigrations();
};

async function _runPostMigrations() {
  const safeAlter = async (sql, description) => {
    try {
      const c = await pool.connect();
      try { await c.query(sql); }
      finally { c.release(); }
    } catch (err) {
      // Log but don't throw — the migration either already ran or is a no-op
      logInfo(`Post-migration skipped (${description}): ${err.message}`);
    }
  };

  // Make appointments.user_id nullable to support guest bookings
  await safeAlter(
    `ALTER TABLE appointments ALTER COLUMN user_id DROP NOT NULL`,
    "appointments.user_id DROP NOT NULL"
  );

  // Add guest booking columns if they don't exist
  await safeAlter(
    `ALTER TABLE appointments
       ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255),
       ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255),
       ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50),
       ADD COLUMN IF NOT EXISTS is_guest_booking BOOLEAN DEFAULT FALSE`,
    "appointments guest columns"
  );

  // Widen status constraint to include all values used in code
  await safeAlter(
    `ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check`,
    "drop old status check"
  );
  await safeAlter(
    `ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
       CHECK (status IN ('booked','canceled','cancelled','completed',
                         'no-show','no_show','pending','confirmed'))`,
    "add new status check"
  );
}

export { pool, query, withTransaction, connectToDb, initializeDbSchema };
