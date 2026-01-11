ALTER TABLE providers
ADD CONSTRAINT unique_provider_user UNIQUE (user_id);