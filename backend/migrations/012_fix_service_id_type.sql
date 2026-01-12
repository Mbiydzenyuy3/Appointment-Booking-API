-- Fix service_id type in time_slots table to UUID
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_slots' AND column_name = 'service_id' AND data_type != 'uuid') THEN
        ALTER TABLE time_slots ALTER COLUMN service_id TYPE UUID USING service_id::UUID;
    END IF;
END $$;