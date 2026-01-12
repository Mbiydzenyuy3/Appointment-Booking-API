-- Migration: Add provider enhancements for booking links, referrals, and credibility
-- Adds personal booking slug, referral system, and activity tracking

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'booking_slug') THEN
        ALTER TABLE providers ADD COLUMN booking_slug VARCHAR(255) UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'referral_code') THEN
        ALTER TABLE providers ADD COLUMN referral_code VARCHAR(255) UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'last_active') THEN
        ALTER TABLE providers ADD COLUMN last_active TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'response_time_avg') THEN
        ALTER TABLE providers ADD COLUMN response_time_avg INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'total_bookings') THEN
        ALTER TABLE providers ADD COLUMN total_bookings INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'completed_bookings') THEN
        ALTER TABLE providers ADD COLUMN completed_bookings INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'cancellation_rate') THEN
        ALTER TABLE providers ADD COLUMN cancellation_rate DECIMAL(5,2) DEFAULT 0.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'average_rating') THEN
        ALTER TABLE providers ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'profile_views') THEN
        ALTER TABLE providers ADD COLUMN profile_views INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'referral_count') THEN
        ALTER TABLE providers ADD COLUMN referral_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'is_online') THEN
        ALTER TABLE providers ADD COLUMN is_online BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
    referral_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_provider_id UUID REFERENCES providers(provider_id) ON DELETE CASCADE,
    referred_provider_id UUID REFERENCES providers(provider_id) ON DELETE CASCADE,
    referral_code_used VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create provider_activity_log table for activity signals
CREATE TABLE IF NOT EXISTS provider_activity_log (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(provider_id) ON DELETE CASCADE,
    activity_type VARCHAR(100), -- 'login', 'profile_update', 'booking_confirmed', etc.
    activity_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_providers_booking_slug ON providers(booking_slug);
CREATE INDEX IF NOT EXISTS idx_providers_referral_code ON providers(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_provider_id ON referrals(referrer_provider_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_provider_id ON referrals(referred_provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_activity_log_provider_id ON provider_activity_log(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_activity_log_created_at ON provider_activity_log(created_at);