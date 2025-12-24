-- Database schema for appointment booking app

-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    user_type VARCHAR(50) CHECK (user_type IN ('client', 'provider')),
    google_id VARCHAR(255) UNIQUE,
    profile_picture TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(50),
    address TEXT,
    bio TEXT,
    age INTEGER,
    accessibility_preferences JSONB DEFAULT '{}',
    ai_learning_data JSONB DEFAULT '[]',
    focus_time_preferences JSONB DEFAULT '{}',
    cognitive_load_profile JSONB DEFAULT '{}',
    accessibility_history JSONB DEFAULT '[]',
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Providers table
CREATE TABLE providers (
    provider_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    bio TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    hourly_rate DECIMAL(10,2),
    service_types TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES providers(provider_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in minutes
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time slots table
CREATE TABLE time_slots (
     timeslot_id SERIAL PRIMARY KEY,
     provider_id INTEGER REFERENCES providers(provider_id) ON DELETE CASCADE,
     service_id INTEGER REFERENCES services(service_id) ON DELETE CASCADE,
     day DATE,
     start_time TIME NOT NULL,
     end_time TIME NOT NULL,
     is_booked BOOLEAN DEFAULT FALSE,
     is_available BOOLEAN DEFAULT TRUE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

-- Appointments table
CREATE TABLE appointments (
     appointment_id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
     provider_id INTEGER REFERENCES providers(provider_id) ON DELETE CASCADE,
     service_id INTEGER REFERENCES services(service_id) ON DELETE SET NULL,
     timeslot_id INTEGER REFERENCES time_slots(timeslot_id) ON DELETE SET NULL,
     appointment_date DATE,
     appointment_time TIME,
     status VARCHAR(50) DEFAULT 'booked' CHECK (status IN ('booked', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
     notes TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_services_provider_id ON services(provider_id);
CREATE INDEX idx_time_slots_provider_id ON time_slots(provider_id);
CREATE INDEX idx_time_slots_timeslot_id ON time_slots(timeslot_id);
CREATE INDEX idx_time_slots_start_time ON time_slots(start_time);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX idx_appointments_timeslot_id ON appointments(timeslot_id);
CREATE INDEX idx_appointments_status ON appointments(status);