-- Migration to update time_slots and appointments tables to match current code
-- Rename slot_id to timeslot_id in time_slots
-- Add missing columns to time_slots: service_id, day, is_booked
-- Rename slot_id to timeslot_id in appointments
-- Add missing columns to appointments: appointment_date, appointment_time

DO $$
BEGIN
    -- Handle time_slots table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_slots' AND column_name = 'slot_id') THEN
        ALTER TABLE time_slots RENAME COLUMN slot_id TO timeslot_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_slots' AND column_name = 'service_id') THEN
        ALTER TABLE time_slots ADD COLUMN service_id UUID REFERENCES services(service_id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_slots' AND column_name = 'day') THEN
        ALTER TABLE time_slots ADD COLUMN day DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_slots' AND column_name = 'is_booked') THEN
        ALTER TABLE time_slots ADD COLUMN is_booked BOOLEAN DEFAULT FALSE;
    END IF;

    -- Handle appointments table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'slot_id') THEN
        ALTER TABLE appointments RENAME COLUMN slot_id TO timeslot_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'appointment_date') THEN
        ALTER TABLE appointments ADD COLUMN appointment_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'appointment_time') THEN
        ALTER TABLE appointments ADD COLUMN appointment_time TIME;
    END IF;
END $$;

-- Update indexes
DROP INDEX IF EXISTS idx_time_slots_slot_id;
CREATE INDEX IF NOT EXISTS idx_time_slots_timeslot_id ON time_slots(timeslot_id);

DROP INDEX IF EXISTS idx_appointments_slot_id;
CREATE INDEX IF NOT EXISTS idx_appointments_timeslot_id ON appointments(timeslot_id);