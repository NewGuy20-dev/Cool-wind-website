-- ====================================================
-- 08_testimonials_schema.sql  
-- Testimonials and Reviews Database Schema
-- ====================================================
-- Purpose: Create tables for customer testimonials and reviews
-- Dependencies: 00_database_setup.sql
-- Author: Migration Script
-- Created: 2025

-- ====================================================
-- TESTIMONIALS TABLE
-- ====================================================

CREATE TABLE IF NOT EXISTS testimonials (
    -- Primary identifiers
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Customer information
    customer_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    phone_number VARCHAR(15),
    email VARCHAR(255),
    
    -- Review content
    review_text TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    -- Service details
    service_type VARCHAR(100),
    service_details TEXT,
    
    -- Status and moderation
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    display_on_homepage BOOLEAN DEFAULT false,
    
    -- Metadata
    service_date DATE,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    
    -- Additional context
    metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT customer_name_not_empty CHECK (LENGTH(TRIM(customer_name)) > 0),
    CONSTRAINT review_text_not_empty CHECK (LENGTH(TRIM(review_text)) > 0),
    CONSTRAINT review_text_min_length CHECK (LENGTH(TRIM(review_text)) >= 10)
);

-- ====================================================
-- INDEXES
-- ====================================================

CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_homepage ON testimonials(display_on_homepage) WHERE display_on_homepage = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(status, approved_at DESC) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at DESC);

-- ====================================================
-- TRIGGERS
-- ====================================================

-- Auto-update timestamps (create function if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_testimonials_updated_at
    BEFORE UPDATE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================
-- RLS POLICIES
-- ====================================================

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read approved testimonials
CREATE POLICY "Public can view approved testimonials"
    ON testimonials FOR SELECT
    USING (status = 'approved');

-- Public can insert testimonials (for submission form)
CREATE POLICY "Public can submit testimonials"
    ON testimonials FOR INSERT
    WITH CHECK (status = 'pending');

-- Authenticated users can manage all testimonials
CREATE POLICY "Authenticated users can manage testimonials"
    ON testimonials FOR ALL
    USING (auth.role() = 'authenticated');

-- ====================================================
-- HELPER FUNCTIONS
-- ====================================================

-- Function to approve testimonial
CREATE OR REPLACE FUNCTION approve_testimonial(
    testimonial_id UUID,
    approver_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE testimonials
    SET 
        status = 'approved',
        approved_at = NOW(),
        approved_by = approver_id,
        updated_at = NOW()
    WHERE id = testimonial_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get featured testimonials
CREATE OR REPLACE FUNCTION get_featured_testimonials(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    id UUID,
    customer_name VARCHAR,
    location VARCHAR,
    review_text TEXT,
    rating INTEGER,
    service_type VARCHAR,
    service_details TEXT,
    service_date DATE,
    approved_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.customer_name,
        t.location,
        t.review_text,
        t.rating,
        t.service_type,
        t.service_details,
        t.service_date,
        t.approved_at
    FROM testimonials t
    WHERE t.status = 'approved' 
        AND (t.is_featured = true OR t.display_on_homepage = true)
    ORDER BY t.approved_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================
-- SEED DATA (Optional - migrate existing testimonials)
-- ====================================================

-- Insert existing testimonials from code
INSERT INTO testimonials (
    customer_name, location, service_type, rating, review_text, 
    service_details, service_date, status, approved_at, display_on_homepage
) VALUES
    ('Priya M.', 'Thiruvalla', 'AC Repair', 5, 
     'Quick response and fixed our AC same day! Very professional service. The technician was knowledgeable and explained everything clearly. Our AC is working better than ever.',
     '1.5 ton split AC gas charging', '2024-01-15', 'approved', '2024-01-15', true),
    
    ('Ravi K.', 'Pathanamthitta', 'Refrigerator Service', 5,
     'Honest pricing and quality work on our fridge. Highly recommend! They diagnosed the compressor issue quickly and provided genuine Samsung parts.',
     'Samsung double door compressor replacement', '2024-01-12', 'approved', '2024-01-12', true),
    
    ('Sarah J.', 'Thiruvalla', 'Spare Parts', 5,
     'Best service in Thiruvalla, got genuine parts delivered same day. The door seal was exactly what we needed and installation guidance was very helpful.',
     'LG refrigerator door seal delivery', '2024-01-10', 'approved', '2024-01-10', true),
    
    ('Anil R.', 'Kozhencherry', 'AC Repair', 5,
     'Excellent service! Our office AC was making noise for weeks. They fixed it in 2 hours and gave 6-month warranty. Very satisfied with their work.',
     '2 ton split AC fan motor replacement', '2024-01-08', 'approved', '2024-01-08', true),
    
    ('Meera S.', 'Mallappally', 'Electronics', 5,
     'Bought a refurbished Samsung fridge from them. Quality is excellent and comes with warranty. Great value for money and professional delivery.',
     'Samsung 192L refurbished refrigerator', '2024-01-05', 'approved', '2024-01-05', true),
    
    ('Thomas V.', 'Chengannur', 'Installation', 5,
     'Professional AC installation service. They handled everything from electrical work to copper piping. Clean work and reasonable pricing.',
     'Voltas 1.5 ton split AC installation', '2024-01-03', 'approved', '2024-01-03', true),
    
    ('Lakshmi P.', 'Thiruvalla', 'Refrigerator Service', 5,
     'Our Whirlpool fridge stopped cooling suddenly. They came within 3 hours and fixed the thermostat issue. Very reliable service.',
     'Whirlpool double door thermostat repair', '2023-12-28', 'approved', '2023-12-28', true),
    
    ('Rajesh M.', 'Adoor', 'AC Repair', 4,
     'Good service for our window AC. Took a bit longer than expected but the repair quality is good. Fair pricing and genuine parts used.',
     'Window AC gas leak repair', '2023-12-25', 'approved', '2023-12-25', false)
ON CONFLICT DO NOTHING;

-- ====================================================
-- VERIFICATION
-- ====================================================

DO $$
DECLARE
    testimonial_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO testimonial_count FROM testimonials;
    
    RAISE NOTICE '✅ Testimonials schema created successfully!';
    RAISE NOTICE '📊 Testimonials table created with RLS policies';
    RAISE NOTICE '🔍 Indexes and triggers active';
    RAISE NOTICE '📝 % testimonials seeded', testimonial_count;
END $$;
