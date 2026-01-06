-- Add new fields to services table: location, additional_description, image_url
ALTER TABLE services ADD COLUMN location TEXT;
ALTER TABLE services ADD COLUMN additional_description TEXT;
ALTER TABLE services ADD COLUMN image_url TEXT;