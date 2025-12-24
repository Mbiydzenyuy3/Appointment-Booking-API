-- Migration to update time_slots and appointments tables to match current code
-- Rename slot_id to timeslot_id in time_slots
-- Add missing columns to time_slots: service_id, day, is_booked
-- Rename slot_id to timeslot_id in appointments
-- Add missing columns to appointments: appointment_date, appointment_time

-- First, rename slot_id to timeslot_id in time_slots
ALTER TABLE time_slots RENAME COLUMN slot_id TO timeslot_id;

-- Add missing columns to time_slots
ALTER TABLE time_slots ADD COLUMN service_id INTEGER REFERENCES services(service_id) ON DELETE CASCADE;
ALTER TABLE time_slots ADD COLUMN day DATE;
ALTER TABLE time_slots ADD COLUMN is_booked BOOLEAN DEFAULT FALSE;

-- Rename slot_id to timeslot_id in appointments
ALTER TABLE appointments RENAME COLUMN slot_id TO timeslot_id;

-- Add missing columns to appointments
ALTER TABLE appointments ADD COLUMN appointment_date DATE;
ALTER TABLE appointments ADD COLUMN appointment_time TIME;

-- Update indexes if needed
-- Drop old index
DROP INDEX IF EXISTS idx_time_slots_slot_id;
-- Add new index
CREATE INDEX idx_time_slots_timeslot_id ON time_slots(timeslot_id);

-- For appointments
DROP INDEX IF EXISTS idx_appointments_slot_id;
CREATE INDEX idx_appointments_timeslot_id ON appointments(timeslot_id);