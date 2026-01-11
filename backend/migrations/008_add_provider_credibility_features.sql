-- Migration: Add credibility features to providers
-- Adds certifications, business photos, testimonials, years of experience, and reviews table

ALTER TABLE providers
ADD COLUMN certifications JSONB DEFAULT '[]',
ADD COLUMN business_photos TEXT[] DEFAULT '{}',
ADD COLUMN testimonials JSONB DEFAULT '[]',
ADD COLUMN years_of_experience INTEGER DEFAULT 0;

-- Create reviews table for detailed reviews and ratings
CREATE TABLE provider_reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(provider_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    rating DECIMAL(3,2) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_provider_reviews_provider_id ON provider_reviews(provider_id);
CREATE INDEX idx_provider_reviews_user_id ON provider_reviews(user_id);
CREATE INDEX idx_provider_reviews_rating ON provider_reviews(rating);