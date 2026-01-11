-- Database schema for appointment booking app (MVP simplified)

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    user_type VARCHAR(50) CHECK (user_type IN ('client', 'provider')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Providers table
CREATE TABLE providers (
    provider_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    bio TEXT,
    phone VARCHAR(50),
    booking_slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE services (
    service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(provider_id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL, -- in minutes
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time slots table
CREATE TABLE time_slots (
     timeslot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     provider_id UUID REFERENCES providers(provider_id) ON DELETE CASCADE,
     service_id UUID REFERENCES services(service_id) ON DELETE CASCADE,
     day DATE,
     start_time TIME NOT NULL,
     end_time TIME NOT NULL,
     is_booked BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

-- Appointments table
CREATE TABLE appointments (
     appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
     provider_id UUID REFERENCES providers(provider_id) ON DELETE CASCADE,
     service_id UUID REFERENCES services(service_id) ON DELETE SET NULL,
     timeslot_id UUID REFERENCES time_slots(timeslot_id) ON DELETE SET NULL,
     appointment_date DATE,
     appointment_time TIME,
     guest_name VARCHAR(255),
     guest_email VARCHAR(255),
     guest_phone VARCHAR(50),
     is_guest_booking BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT check_guest_or_user CHECK (
       (user_id IS NOT NULL AND is_guest_booking = FALSE) OR
       (user_id IS NULL AND is_guest_booking = TRUE AND guest_name IS NOT NULL AND guest_email IS NOT NULL)
     )
 );

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_booking_slug ON providers(booking_slug);
CREATE INDEX idx_services_provider_id ON services(provider_id);
CREATE INDEX idx_time_slots_provider_id ON time_slots(provider_id);
CREATE INDEX idx_time_slots_timeslot_id ON time_slots(timeslot_id);
CREATE INDEX idx_time_slots_start_time ON time_slots(start_time);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX idx_appointments_timeslot_id ON appointments(timeslot_id);
CREATE INDEX idx_appointments_guest_email ON appointments(guest_email);