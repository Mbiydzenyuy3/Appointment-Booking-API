-- Add missing columns to providers table for MVP
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'phone') THEN
        ALTER TABLE providers ADD COLUMN phone VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'hourly_rate') THEN
        ALTER TABLE providers ADD COLUMN hourly_rate NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'referral_code') THEN
        ALTER TABLE providers ADD COLUMN referral_code VARCHAR(20);
    END IF;
END $$;