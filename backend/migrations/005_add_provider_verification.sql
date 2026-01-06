-- Migration: Add provider verification system
-- Supports vetting and trust building for providers

ALTER TABLE providers
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
ADD COLUMN verification_date TIMESTAMP,
ADD COLUMN national_id_document TEXT,
ADD COLUMN business_registration_document TEXT;

-- Add index for verified providers
CREATE INDEX idx_providers_is_verified ON providers(is_verified);

-- Add verification_badge column for different verification levels
ALTER TABLE providers
ADD COLUMN verification_badge VARCHAR(50) DEFAULT 'none' CHECK (verification_badge IN ('none', 'verified', 'premium', 'top_rated'));

-- Add featured provider support for marquee providers
ALTER TABLE providers
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN featured_until TIMESTAMP;