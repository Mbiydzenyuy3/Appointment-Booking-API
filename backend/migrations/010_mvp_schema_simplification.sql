-- Migration: Simplify schema for MVP features
-- Drop non-MVP tables and columns to focus on core functionality

-- Drop non-MVP tables
DROP TABLE IF EXISTS provider_reviews;
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS provider_activity_log;
DROP TABLE IF EXISTS guest_sessions;

-- Drop non-MVP columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS google_id;
ALTER TABLE users DROP COLUMN IF EXISTS profile_picture;
ALTER TABLE users DROP COLUMN IF EXISTS email_verified;
ALTER TABLE users DROP COLUMN IF EXISTS phone;
ALTER TABLE users DROP COLUMN IF EXISTS address;
ALTER TABLE users DROP COLUMN IF EXISTS bio;
ALTER TABLE users DROP COLUMN IF EXISTS age;
ALTER TABLE users DROP COLUMN IF EXISTS accessibility_preferences;
ALTER TABLE users DROP COLUMN IF EXISTS ai_learning_data;
ALTER TABLE users DROP COLUMN IF EXISTS focus_time_preferences;
ALTER TABLE users DROP COLUMN IF EXISTS cognitive_load_profile;
ALTER TABLE users DROP COLUMN IF EXISTS accessibility_history;
ALTER TABLE users DROP COLUMN IF EXISTS reset_token;
ALTER TABLE users DROP COLUMN IF EXISTS reset_token_expiry;

-- Drop non-MVP columns from providers table (keep booking_slug for public booking link)
ALTER TABLE providers DROP COLUMN IF EXISTS rating;
ALTER TABLE providers DROP COLUMN IF EXISTS hourly_rate;
ALTER TABLE providers DROP COLUMN IF EXISTS service_types;
ALTER TABLE providers DROP COLUMN IF EXISTS certifications;
ALTER TABLE providers DROP COLUMN IF EXISTS business_photos;
ALTER TABLE providers DROP COLUMN IF EXISTS testimonials;
ALTER TABLE providers DROP COLUMN IF EXISTS years_of_experience;
ALTER TABLE providers DROP COLUMN IF EXISTS profile_views;
ALTER TABLE providers DROP COLUMN IF EXISTS last_profile_view;
ALTER TABLE providers DROP COLUMN IF EXISTS referral_code;
ALTER TABLE providers DROP COLUMN IF EXISTS last_active;
ALTER TABLE providers DROP COLUMN IF EXISTS response_time_avg;
ALTER TABLE providers DROP COLUMN IF EXISTS total_bookings;
ALTER TABLE providers DROP COLUMN IF EXISTS completed_bookings;
ALTER TABLE providers DROP COLUMN IF EXISTS cancellation_rate;
ALTER TABLE providers DROP COLUMN IF EXISTS average_rating;
ALTER TABLE providers DROP COLUMN IF EXISTS referral_count;
ALTER TABLE providers DROP COLUMN IF EXISTS is_online;
ALTER TABLE providers DROP COLUMN IF EXISTS is_verified;
ALTER TABLE providers DROP COLUMN IF EXISTS verification_status;
ALTER TABLE providers DROP COLUMN IF EXISTS verification_date;
ALTER TABLE providers DROP COLUMN IF EXISTS national_id_document;
ALTER TABLE providers DROP COLUMN IF EXISTS business_registration_document;
ALTER TABLE providers DROP COLUMN IF EXISTS verification_badge;
ALTER TABLE providers DROP COLUMN IF EXISTS is_featured;
ALTER TABLE providers DROP COLUMN IF EXISTS featured_until;

-- Drop non-MVP columns from services table
ALTER TABLE services DROP COLUMN IF EXISTS location;
ALTER TABLE services DROP COLUMN IF EXISTS additional_description;
ALTER TABLE services DROP COLUMN IF EXISTS image_url;

-- Drop non-MVP columns from time_slots table
ALTER TABLE time_slots DROP COLUMN IF EXISTS is_available;

-- Drop non-MVP columns from appointments table
ALTER TABLE appointments DROP COLUMN IF EXISTS status;
ALTER TABLE appointments DROP COLUMN IF EXISTS notes;

-- Drop related indexes that may no longer be needed
DROP INDEX IF EXISTS idx_users_google_id;
DROP INDEX IF EXISTS idx_providers_is_verified;
DROP INDEX IF EXISTS idx_provider_reviews_provider_id;
DROP INDEX IF EXISTS idx_provider_reviews_user_id;
DROP INDEX IF EXISTS idx_provider_reviews_rating;
DROP INDEX IF EXISTS idx_guest_sessions_email;
DROP INDEX IF EXISTS idx_guest_sessions_expires;
DROP INDEX IF EXISTS idx_providers_profile_views;
DROP INDEX IF EXISTS idx_providers_booking_slug;
DROP INDEX IF EXISTS idx_providers_referral_code;
DROP INDEX IF EXISTS idx_referrals_referrer_provider_id;
DROP INDEX IF EXISTS idx_referrals_referred_provider_id;
DROP INDEX IF EXISTS idx_provider_activity_log_provider_id;
DROP INDEX IF EXISTS idx_provider_activity_log_created_at;