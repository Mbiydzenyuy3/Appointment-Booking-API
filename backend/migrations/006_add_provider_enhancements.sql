-- Migration: Add provider enhancements for booking links, referrals, and credibility
-- Adds personal booking slug, referral system, and activity tracking

ALTER TABLE providers
ADD COLUMN booking_slug VARCHAR(255) UNIQUE,
ADD COLUMN referral_code VARCHAR(255) UNIQUE,
ADD COLUMN last_active TIMESTAMP,
ADD COLUMN response_time_avg INTEGER DEFAULT 0, -- in minutes
ADD COLUMN total_bookings INTEGER DEFAULT 0,
ADD COLUMN completed_bookings INTEGER DEFAULT 0,
ADD COLUMN cancellation_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN profile_views INTEGER DEFAULT 0,
ADD COLUMN referral_count INTEGER DEFAULT 0,
ADD COLUMN is_online BOOLEAN DEFAULT FALSE;

-- Create referrals table
CREATE TABLE referrals (
    referral_id SERIAL PRIMARY KEY,
    referrer_provider_id INTEGER REFERENCES providers(provider_id) ON DELETE CASCADE,
    referred_provider_id INTEGER REFERENCES providers(provider_id) ON DELETE CASCADE,
    referral_code_used VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create provider_activity_log table for activity signals
CREATE TABLE provider_activity_log (
    activity_id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES providers(provider_id) ON DELETE CASCADE,
    activity_type VARCHAR(100), -- 'login', 'profile_update', 'booking_confirmed', etc.
    activity_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_providers_booking_slug ON providers(booking_slug);
CREATE INDEX idx_providers_referral_code ON providers(referral_code);
CREATE INDEX idx_referrals_referrer_provider_id ON referrals(referrer_provider_id);
CREATE INDEX idx_referrals_referred_provider_id ON referrals(referred_provider_id);
CREATE INDEX idx_provider_activity_log_provider_id ON provider_activity_log(provider_id);
CREATE INDEX idx_provider_activity_log_created_at ON provider_activity_log(created_at);