// src/config/db.js
import dotenv from "dotenv";
dotenv.config();
import pg from "pg";
import { logInfo, logError, logDebug } from "../utils/logger.js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const { Pool } = pg;

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT, NODE_ENV } =
  process.env;

// Validate required env variables
const requiredVars = { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT };
for (const [key, value] of Object.entries(requiredVars)) {
  if (!value) {
    logError(`❌ Environment variable ${key} is missing!`);
    // process.exit(1); // Commented out to prevent crash in production
  }
}
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  connectionTimeoutMillis: 2000
});

logInfo(`📦 Database is configured for: ${DB_NAME}`);
logInfo(
  `DB_HOST: ${DB_HOST}, DB_USER: ${DB_USER}, DB_PASSWORD: ${
    DB_PASSWORD ? "DEFINED" : "UNDEFINED"
  }`
);

pool.on("connect", () => {
  logInfo(`🔗 Client connected (Pool size: ${pool.totalCount})`);
});
pool.on("error", (err) => {
  logError("🚨 Unexpected error on idle client", err);
  process.exit(-1);
});

const connectToDb = async () => {
  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      logInfo("✅ Database connection pool established");
      client.release();
      return;
    } catch (error) {
      logError(`❌ DB connection failed (attempt ${attempt})`, error);
      if (attempt === maxRetries) process.exit(1);
      await new Promise((res) => setTimeout(res, 3000)); // Wait 3s before retrying
    }
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

    // Drop all existing tables to ensure clean slate (for development/migration)
    logInfo("Dropping existing tables for clean schema initialization...");
    await client.query(`
      DROP TABLE IF EXISTS appointments CASCADE;
      DROP TABLE IF EXISTS time_slots CASCADE;
      DROP TABLE IF EXISTS services CASCADE;
      DROP TABLE IF EXISTS provider_reviews CASCADE;
      DROP TABLE IF EXISTS providers CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // USERS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255),
        user_type VARCHAR(50) CHECK(user_type IN ('client', 'provider')),
        google_id VARCHAR(255) UNIQUE,
        profile_picture TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        phone VARCHAR(20),
        address TEXT,
        bio TEXT,
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        age INTEGER,
        accessibility_preferences JSONB DEFAULT '{}',
        ai_learning_data JSONB DEFAULT '[]',
        focus_time_preferences JSONB DEFAULT '{}',
        cognitive_load_profile JSONB DEFAULT '{}',
        accessibility_history JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add new columns to existing users table
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS profile_picture TEXT,
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS age INTEGER,
      ADD COLUMN IF NOT EXISTS accessibility_preferences JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS ai_learning_data JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS focus_time_preferences JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS cognitive_load_profile JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS accessibility_history JSONB DEFAULT '[]';
    `);

    // Make password nullable for OAuth users
    await client.query(`
      ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
    `);

    // SERVICE PROVIDER TABLE - Handle potential type mismatch
    await client.query(`
      DO $$
      BEGIN
        -- Drop table if it exists with wrong column types
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'user_id' AND data_type = 'integer') THEN
          DROP TABLE providers CASCADE;
        END IF;
        -- Also drop if the table exists but doesn't have the right structure
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providers') THEN
          -- Check if user_id is not UUID
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'providers' AND column_name = 'user_id' AND data_type = 'uuid') THEN
            DROP TABLE providers CASCADE;
          END IF;
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS providers (
        provider_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
        bio TEXT,
        hourly_rate DECIMAL(10, 2),
        service_types TEXT,
        rating DECIMAL CHECK (rating >= 0 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add new columns to existing providers table
    await client.query(`
      ALTER TABLE providers
      ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS service_types TEXT,
      ADD COLUMN IF NOT EXISTS booking_slug VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS referral_code VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS last_active TIMESTAMP,
      ADD COLUMN IF NOT EXISTS response_time_avg INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS completed_bookings INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS cancellation_rate DECIMAL(5,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_profile_view TIMESTAMP,
      ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS business_photos TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0;
    `);

    // PROVIDER REVIEWS TABLE - Handle potential type mismatch
    await client.query(`
      DO $$
      BEGIN
        -- Drop table if it exists with wrong column types
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_reviews' AND column_name = 'provider_id' AND data_type = 'integer') THEN
          DROP TABLE provider_reviews;
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS provider_reviews (
        review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID REFERENCES providers(provider_id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        rating DECIMAL(3,2) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
        review_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES providers(provider_id) ON DELETE CASCADE,
        service_name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
        location TEXT,
        additional_description TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add new columns to existing services table
    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS additional_description TEXT,
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);

    // Rename columns if they exist with old names
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'name') THEN
          ALTER TABLE services RENAME COLUMN name TO service_name;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'duration') THEN
          ALTER TABLE services RENAME COLUMN duration TO duration_minutes;
        END IF;
      END $$;
    `);

    // TIME SLOT TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        timeslot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES providers(provider_id) ON DELETE CASCADE,
        service_id UUID NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
        day DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_booked BOOLEAN DEFAULT FALSE,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT time_slot_duration CHECK (start_time < end_time)
      );
    `);

    // Rename slot_id to timeslot_id if it exists (for existing tables)
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_slots' AND column_name = 'slot_id') THEN
          ALTER TABLE time_slots RENAME COLUMN slot_id TO timeslot_id;
        END IF;
      END $$;
    `);

    // Add missing columns to time_slots if they don't exist (for existing tables)
    await client.query(`
      ALTER TABLE time_slots
      ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(service_id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS day DATE NOT NULL DEFAULT CURRENT_DATE,
      ADD COLUMN IF NOT EXISTS is_booked BOOLEAN DEFAULT FALSE;
    `);

    // APPOINTMENTS TABLE
    await client.query(`
       CREATE TABLE IF NOT EXISTS appointments (
        appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        provider_id UUID NOT NULL REFERENCES providers(provider_id) ON DELETE CASCADE,
        service_id UUID NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
        timeslot_id UUID NOT NULL REFERENCES time_slots(timeslot_id) ON DELETE CASCADE,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status VARCHAR(20) CHECK (status IN ('booked', 'canceled', 'completed', 'no-show')) DEFAULT 'booked',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Rename slot_id to timeslot_id in appointments if it exists (for existing tables)
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'slot_id') THEN
          ALTER TABLE appointments RENAME COLUMN slot_id TO timeslot_id;
        END IF;
      END $$;
    `);

    // Add missing columns to appointments if they don't exist (for existing tables)
    await client.query(`
      ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS appointment_date DATE,
      ADD COLUMN IF NOT EXISTS appointment_time TIME;
    `);

    // INDEXES
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)"
    );

    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)"
    );

    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);"
    );

    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);"
    );

    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_time_slots_provider_day ON time_slots(provider_id, day);"
    );

    // Split the index creation queries for appointments table into two separate queries (fixed multi-query issue)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_user_status ON appointments(user_id, status);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_provider_status ON appointments(provider_id, status);
    `);

    // TRIGGER FUNCTION ONLY FOR TABLES WITH Updated_at_column
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // TRIGGERS
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
          CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_providers_updated_at') THEN
          CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_services_updated_at') THEN  -- Added trigger for services table
          CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_time_slots_updated_at') THEN
          CREATE TRIGGER update_time_slots_updated_at BEFORE UPDATE ON time_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_appointments_updated_at') THEN
          CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$;
    `);

    logDebug("All Triggers checked and created");

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
