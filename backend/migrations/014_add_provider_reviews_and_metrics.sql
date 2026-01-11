-- Drop existing provider_reviews if exists
DROP TABLE IF EXISTS provider_reviews CASCADE;

-- Add provider_reviews table
CREATE TABLE provider_reviews (
  review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(provider_id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES appointments(appointment_id) ON DELETE CASCADE,
  reviewer_user_id UUID NOT NULL REFERENCES users(user_id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (booking_id) -- one review per booking
);

-- Add provider metrics fields to providers table
ALTER TABLE providers ADD COLUMN rating_avg NUMERIC(3,2) DEFAULT 0;
ALTER TABLE providers ADD COLUMN rating_count INT DEFAULT 0;
ALTER TABLE providers ADD COLUMN credibility_score INT DEFAULT 0;

-- Add provider_activity_logs table
CREATE TABLE provider_activity_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(provider_id),
  activity_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);