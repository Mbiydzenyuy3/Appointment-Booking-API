DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_provider_user') THEN
        ALTER TABLE providers ADD CONSTRAINT unique_provider_user UNIQUE (user_id);
    END IF;
END $$;