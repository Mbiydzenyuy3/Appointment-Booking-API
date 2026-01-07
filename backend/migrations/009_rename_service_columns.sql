-- Migration: Rename services table columns to match code expectations
-- Rename 'name' to 'service_name' and 'duration' to 'duration_minutes'

ALTER TABLE services RENAME COLUMN name TO service_name;
ALTER TABLE services RENAME COLUMN duration TO duration_minutes;