-- Contact Form Submissions Table
-- Stores all contact form submissions from the website

CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    service VARCHAR(50) NOT NULL CHECK (service IN ('spare_parts', 'ac_servicing', 'refrigerator_servicing', 'sales', 'other')),
    service_details TEXT,
    is_urgent BOOLEAN DEFAULT FALSE,
    preferred_time VARCHAR(20) CHECK (preferred_time IN ('morning', 'afternoon', 'evening') OR preferred_time IS NULL),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'in_progress', 'completed', 'cancelled')),
    source VARCHAR(20) DEFAULT 'website',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contacted_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    assigned_to UUID REFERENCES auth.users(id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_service ON contact_submissions(service);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_is_urgent ON contact_submissions(is_urgent);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_phone ON contact_submissions(phone);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_submissions_updated_at_trigger
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_submissions_updated_at();

-- Add RLS policies for contact submissions
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all submissions
CREATE POLICY "Authenticated users can read contact submissions" ON contact_submissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to insert new submissions (for API)
CREATE POLICY "Service role can insert contact submissions" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update submissions
CREATE POLICY "Authenticated users can update contact submissions" ON contact_submissions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a view for contact submission statistics
CREATE OR REPLACE VIEW contact_submission_stats AS
SELECT 
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'contacted') as contacted,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE is_urgent = true) as urgent,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as this_week,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as this_month
FROM contact_submissions;
