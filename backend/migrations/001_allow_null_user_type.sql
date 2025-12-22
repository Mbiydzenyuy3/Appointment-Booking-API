-- Migration to allow null user_type for new Google OAuth users
-- This allows first-time Google signups to choose their user type later

-- First, check if user_type column exists and modify it to allow NULL
ALTER TABLE users 
ALTER COLUMN user_type DROP NOT NULL;

-- Add a comment to document the change
COMMENT ON COLUMN users.user_type IS 'Can be NULL for new Google OAuth users who need to select their account type';

-- Also update the check constraint to allow NULL values
-- Note: This will only work if the constraint doesn't already exist with NOT NULL
DO $
BEGIN
  -- Drop existing constraint if it exists with NOT NULL
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_user_type_check') THEN
    ALTER TABLE users DROP CONSTRAINT users_user_type_check;
  END IF;
  
  -- Add new constraint that allows NULL
  ALTER TABLE users ADD CONSTRAINT users_user_type_check 
    CHECK (user_type IS NULL OR user_type IN ('client', 'provider'));
END $;