-- Migration: Add guest booking support to appointments table
-- Allows bookings without requiring user registration

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'guest_name') THEN
        ALTER TABLE appointments ADD COLUMN guest_name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'guest_email') THEN
        ALTER TABLE appointments ADD COLUMN guest_email VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'guest_phone') THEN
        ALTER TABLE appointments ADD COLUMN guest_phone VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'is_guest_booking') THEN
        ALTER TABLE appointments ADD COLUMN is_guest_booking BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Make user_id nullable for guest bookings
ALTER TABLE appointments
ALTER COLUMN user_id DROP NOT NULL;

-- Add index for guest email lookups
CREATE INDEX IF NOT EXISTS idx_appointments_guest_email ON appointments(guest_email);

-- Add constraint to ensure either user_id is set or guest fields are filled
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_guest_or_user') THEN
        ALTER TABLE appointments ADD CONSTRAINT check_guest_or_user CHECK ((user_id IS NOT NULL AND is_guest_booking = FALSE) OR (user_id IS NULL AND is_guest_booking = TRUE AND guest_name IS NOT NULL AND guest_email IS NOT NULL));
    END IF;
END $$;