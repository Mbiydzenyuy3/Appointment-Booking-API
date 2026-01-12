-- Migration: Add provider verification system
-- Supports vetting and trust building for providers

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'is_verified') THEN
        ALTER TABLE providers ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'verification_status') THEN
        ALTER TABLE providers ADD COLUMN verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'verification_date') THEN
        ALTER TABLE providers ADD COLUMN verification_date TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'national_id_document') THEN
        ALTER TABLE providers ADD COLUMN national_id_document TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'business_registration_document') THEN
        ALTER TABLE providers ADD COLUMN business_registration_document TEXT;
    END IF;
END $$;

-- Add index for verified providers
CREATE INDEX IF NOT EXISTS idx_providers_is_verified ON providers(is_verified);

-- Add verification_badge column for different verification levels
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'verification_badge') THEN
        ALTER TABLE providers ADD COLUMN verification_badge VARCHAR(50) DEFAULT 'none' CHECK (verification_badge IN ('none', 'verified', 'premium', 'top_rated'));
    END IF;
END $$;

-- Add featured provider support for marquee providers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'is_featured') THEN
        ALTER TABLE providers ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'featured_until') THEN
        ALTER TABLE providers ADD COLUMN featured_until TIMESTAMP;
    END IF;
END $$;