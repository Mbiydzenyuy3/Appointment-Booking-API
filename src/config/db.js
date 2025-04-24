import pg from "pg";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
  DB_PORT,
  NODE_ENV,
  DB_NAME_TEST,
} = process.env;

if (
  !DB_HOST ||
  !DB_PASSWORD ||
  !DB_NAME ||
  !DB_USER ||
  !DB_PORT ||
  !DB_NAME_TEST
) {
  logger.error(
    "Database environment variables are missing! Check your .env file."
  );
  process.exit(1);
}

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_PASSWORD,
  port: parseInt(DB_PORT, 10),
  connectionTimeoutMillis: 2000,
});

logger.info(`Database is configured for: ${DB_NAME}`);

pool.on("connect", (client) => {
  logger.info(`Client connected from Pool (Total count: ${pool.totalCount})`);
});

pool.on("error", (err, client) => {
  logger.error("Unexpected error on idle client in pool", err);
  process.exit(-1);
});

const initializeDbSchema = async () => {
  const client = await pool.connect();
  try {
    logger.info("Initializing database schema...");
    await client.query("CREATE EXTENSION IF NOT EXISTS pg crypto");

    await client.query(` 
    CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `);
    logger.info("Users table has been created");

    await client.query(`
      CREATE TABLE IF NOT EXISTS service_provider (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name VARCHAR(50) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       service VARCHAR(255) NOT NULL,
       service_provider_id UUID NOT NULL
       REFERENCES service_provider(id)
       ON DELETE CASCADE,
      )
      `);
    logger.info("Provider table has been created ");

    await client.query(`
      CREATE TABLE IF NOT EXISTS appointment (
       client_id UUID NOT NULL ,
       service_provider_id UUID NOT NULL,
        PRIMARY KEY (client_id, service_provider_id)
      )
    `);
    logger.info("Appointment table has been created ");

    await client.query(`
      CREATE TABLE IF NOT EXISTS time_slot (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       day DATE NOT NULL,
       start_time TIME NOT NULL,
       end_time TIME NOT NULL,
       service_provider_id UUID NOT NULL,
       is_available BOOLEAN NOT NULL DEFAULT TRUE,
       created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP

       CHECK (start_time < end_time),
       UNIQUE (service_provider_id, day, start_time, end_time )
      )
    `);
    logger.info("Time slot table has been created ");

    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)"
    );
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_service_provider_user_id ON service_provider(owner_id)"
    );

    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_appointment_user_id ON appointment (owner_id)"
    );

    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_time_slot_user_id ON time_slot(owner_id)"
    );

    logger.info("Indexes have been ensured");

    await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
               NEW.updated_at = NOW();
               RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
    logger.debug("update_updated_at_column function ensured.");

    await client.query(`
        DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tagname = 'update_appointments_updated_at'
  ) THEN
    CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- For time_slot
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tagname = 'update_time_slots_updated_at'
  ) THEN
    CREATE TRIGGER update_time_slots_updated_at
    BEFORE UPDATE ON time_slot
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
      `);
    logger.debug("Tasks update_at Trigger is checked and created");
  } catch (error) {
    logger.error(`Error while initializing the schema`, error);
    process.exit(1);
  } finally {
    client.release();
  }
};

const connectToDb = async () => {
  try {
    const client = await pool.connect();
    logger.info(
      `Database connection pool establish database connection pool established successfully`
    );
    client.release();
  } catch (error) {
    logger.error("Unable to establish database connection pool", error);
    process.exit(1);
  }
};

const query = async (text, params) => {
  const start = Date.now();
  try {
    const response = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info(
      `Executed query: {text: ${text.substring(
        0,
        100
      )}..., params: ${JSON.stringify(
        params
      )}, duration: ${duration}ms, rows: ${response.rowCount}}`
    );
    return response;
  } catch (error) {
    logger.error(
      `Error executing query: {text: ${text.substring(
        0,
        100
      )}..., params: ${JSON.stringify(params)}, error: ${error.message}}`
    );
    throw error;
  }
};

export { pool, connectToDb, query, initializeDbSchema };
