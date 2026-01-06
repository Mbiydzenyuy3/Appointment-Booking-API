-- Migration: Add guest sessions and provider profile views for lazy registration
-- Supports guest browsing and conversion to registered users

-- Guest sessions table for tracking guest interactions
CREATE TABLE guest_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Provider profile views tracking
ALTER TABLE providers
ADD COLUMN profile_views INTEGER DEFAULT 0,
ADD COLUMN last_profile_view TIMESTAMP;

-- Indexes for performance
CREATE INDEX idx_guest_sessions_email ON guest_sessions(guest_email);
CREATE INDEX idx_guest_sessions_expires ON guest_sessions(expires_at);
CREATE INDEX idx_providers_profile_views ON providers(profile_views DESC);