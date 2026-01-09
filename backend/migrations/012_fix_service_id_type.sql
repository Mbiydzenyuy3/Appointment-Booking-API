-- Fix service_id type in time_slots table to UUID
ALTER TABLE time_slots ALTER COLUMN service_id TYPE UUID USING service_id::UUID;