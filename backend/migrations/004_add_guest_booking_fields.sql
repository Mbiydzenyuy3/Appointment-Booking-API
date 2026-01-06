-- Migration: Add guest booking support to appointments table
-- Allows bookings without requiring user registration

ALTER TABLE appointments
ADD COLUMN guest_name VARCHAR(255),
ADD COLUMN guest_email VARCHAR(255),
ADD COLUMN guest_phone VARCHAR(50),
ADD COLUMN is_guest_booking BOOLEAN DEFAULT FALSE;

-- Make user_id nullable for guest bookings
ALTER TABLE appointments
ALTER COLUMN user_id DROP NOT NULL;

-- Add index for guest email lookups
CREATE INDEX idx_appointments_guest_email ON appointments(guest_email);

-- Add constraint to ensure either user_id is set or guest fields are filled
ALTER TABLE appointments
ADD CONSTRAINT check_guest_or_user
CHECK (
  (user_id IS NOT NULL AND is_guest_booking = FALSE) OR
  (user_id IS NULL AND is_guest_booking = TRUE AND guest_name IS NOT NULL AND guest_email IS NOT NULL)
);