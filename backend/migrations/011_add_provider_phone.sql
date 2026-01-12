-- Add phone field to providers table for trust signals
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'phone') THEN
        ALTER TABLE providers ADD COLUMN phone VARCHAR(50);
    END IF;
END $$;