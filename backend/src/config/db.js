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
let poolConfig;

if (DATABASE_URL) {
  poolConfig = {
    connectionString: DATABASE_URL,
    connectionTimeoutMillis: 5000,
    ssl: NODE_ENV === "production" ? { rejectUnauthorized: false } : false
  };
} else {
  const requiredVars = { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT };

  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      logError(`❌ Missing environment variable: ${key}`);
    }
  }

  poolConfig = {
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: Number(DB_PORT),
    connectionTimeoutMillis: 5000,
    ssl: NODE_ENV === "production" ? { rejectUnauthorized: false } : false
  };
}

/* ---------------------------------------
   CONNECTION POOL
---------------------------------------- */
const pool = new Pool(poolConfig);

pool.on("connect", () => {
  logInfo(`🔗 DB connected (${DB_NAME || "DATABASE_URL"})`);
});

pool.on("error", (err) => {
  logError("🚨 Unexpected DB pool error", err);
  process.exit(1);
});

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
    await client.query(`CREATE EXTENSION IF NOT EXISTS btree_gist`);

    /* ---------------------------------------
       ⚠️ DEV-ONLY RESET
    ---------------------------------------- */
    if (DB_RESET_ON_START === "true") {
      if (NODE_ENV === "production") {
        throw new Error("❌ DB_RESET_ON_START is not allowed in production");
      }

      logInfo("⚠️ DEV MODE: Dropping all tables");

      await client.query(`
        DROP TABLE IF EXISTS appointments CASCADE;
        DROP TABLE IF EXISTS time_slots CASCADE;
        DROP TABLE IF EXISTS services CASCADE;
        DROP TABLE IF EXISTS providers CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);
    }

    /* ---------------------------------------
       USERS
    ---------------------------------------- */
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255),
        user_type VARCHAR(20) CHECK (user_type IN ('client', 'provider')),
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ---------------------------------------
       PROVIDERS
    ---------------------------------------- */
    await client.query(`
      CREATE TABLE IF NOT EXISTS providers (
        provider_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        bio TEXT,
        phone VARCHAR(50),
        hourly_rate DECIMAL(10, 2),
        referral_code VARCHAR(50),
        booking_slug VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ---------------------------------------
       SERVICES
    ---------------------------------------- */
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

    /* ---------------------------------------
       TIME SLOTS
    ---------------------------------------- */
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

    /* Prevent duplicate / overlapping slot definitions */
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_provider_timeslot
      ON time_slots (provider_id, day, start_time, end_time);
    `);

    /* ---------------------------------------
       APPOINTMENTS
    ---------------------------------------- */
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
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT check_guest_or_user CHECK (
          (user_id IS NOT NULL AND is_guest_booking = FALSE) OR
          (user_id IS NULL AND is_guest_booking = TRUE
            AND guest_name IS NOT NULL
            AND guest_email IS NOT NULL)
        )
      );
    `);

    /* ---------------------------------------
       INDEXES
    ---------------------------------------- */
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
      CREATE INDEX IF NOT EXISTS idx_providers_booking_slug ON providers(booking_slug);
      CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
      CREATE INDEX IF NOT EXISTS idx_time_slots_provider_id ON time_slots(provider_id);
      CREATE INDEX IF NOT EXISTS idx_time_slots_start_time ON time_slots(start_time);
      CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON appointments(provider_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_timeslot_id ON appointments(timeslot_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_guest_email ON appointments(guest_email);
    `);

    /* ---------------------------------------
       UPDATED_AT TRIGGER
    ---------------------------------------- */
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
        ) THEN
          CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$;
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
};

/* ---------------------------------------
   QUERY HELPER
---------------------------------------- */
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);

  if (NODE_ENV !== "production") {
    logDebug(`🧪 Query (${Date.now() - start}ms): ${text.slice(0, 80)}...`);
  }

  return res;
};

export { pool, connectToDb, initializeDbSchema, query };
