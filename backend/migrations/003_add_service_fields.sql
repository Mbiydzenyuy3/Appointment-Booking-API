-- Add new fields to services table: location, additional_description, image_url
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'location') THEN
        ALTER TABLE services ADD COLUMN location TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'additional_description') THEN
        ALTER TABLE services ADD COLUMN additional_description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'image_url') THEN
        ALTER TABLE services ADD COLUMN image_url TEXT;
    END IF;
END $$;