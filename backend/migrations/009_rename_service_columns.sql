-- Migration: Rename services table columns to match code expectations
-- Rename 'name' to 'service_name' and 'duration' to 'duration_minutes'

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'name') THEN
        ALTER TABLE services RENAME COLUMN name TO service_name;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'duration') THEN
        ALTER TABLE services RENAME COLUMN duration TO duration_minutes;
    END IF;
END $$;