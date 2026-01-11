-- Add missing columns to providers table for MVP
ALTER TABLE providers
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20);