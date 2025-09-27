-- Migration: 009_add_users_table
-- Author: Database Admin  
-- Date: 2025-01-26
-- Purpose: Add users table to support authentication and task assignment
-- Dependencies: Existing tasks table with assigned_to column
-- This migration will link to the existing task assignment system

-- BEGIN TRANSACTION
BEGIN;

-- Create users table to support the existing assigned_to field in tasks
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'technician' NOT NULL,
    department VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    can_be_assigned BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_active_assignable ON public.users(is_active, can_be_assigned) 
    WHERE is_active = true AND can_be_assigned = true;

-- Add foreign key constraint to link existing tasks.assigned_to to users.id
-- Note: This will only work if existing assigned_to values are NULL or match user IDs
ALTER TABLE public.tasks 
ADD CONSTRAINT fk_tasks_assigned_to_users 
FOREIGN KEY (assigned_to) REFERENCES public.users(id)
ON DELETE SET NULL;

-- Add foreign key constraint for contact_submissions.assigned_to
ALTER TABLE public.contact_submissions
ADD CONSTRAINT fk_contact_submissions_assigned_to_users
FOREIGN KEY (assigned_to) REFERENCES public.users(id)
ON DELETE SET NULL;

-- Add RLS (Row Level Security) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile and active colleagues
CREATE POLICY "Users can view own profile and colleagues" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR 
        (is_active = true AND can_be_assigned = true)
    );

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Only admin role can insert/delete users
CREATE POLICY "Admin can manage users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert default admin user
INSERT INTO public.users (
    id,
    email,
    username,
    first_name,
    last_name,
    role,
    department,
    is_active,
    can_be_assigned,
    email_verified,
    created_at
) VALUES (
    gen_random_uuid(),
    'admin@coolwind.com',
    'admin',
    'System',
    'Administrator',
    'admin',
    'Management',
    true,
    false, -- Admin doesn't get assigned regular tasks
    true,
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert sample technicians
INSERT INTO public.users (
    id,
    email,
    username, 
    first_name,
    last_name,
    role,
    department,
    phone,
    is_active,
    can_be_assigned,
    email_verified,
    created_at
) VALUES 
(
    gen_random_uuid(),
    'john.tech@coolwind.com',
    'john_tech',
    'John',
    'Technician',
    'technician',
    'Field Services',
    '+1-555-0201',
    true,
    true,
    true,
    NOW()
),
(
    gen_random_uuid(),
    'sarah.lead@coolwind.com',
    'sarah_lead',
    'Sarah',
    'Leader',
    'lead_technician', 
    'Field Services',
    '+1-555-0202',
    true,
    true,
    true,
    NOW()
),
(
    gen_random_uuid(),
    'mike.support@coolwind.com',
    'mike_support',
    'Mike',
    'Support',
    'support',
    'Customer Support',
    '+1-555-0203',
    true,
    true,
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create view for assignable users (commonly used in dropdowns)
CREATE OR REPLACE VIEW public.assignable_users AS
SELECT 
    id,
    email,
    username,
    first_name || ' ' || last_name AS full_name,
    role,
    department,
    phone
FROM public.users
WHERE is_active = true AND can_be_assigned = true
ORDER BY role, first_name, last_name;

-- Add comments for documentation
COMMENT ON TABLE public.users IS 'User accounts for authentication and task assignment';
COMMENT ON COLUMN public.users.role IS 'User role: admin, lead_technician, technician, support, manager';
COMMENT ON COLUMN public.users.can_be_assigned IS 'Whether user can be assigned to tasks and submissions';
COMMENT ON VIEW public.assignable_users IS 'View of users available for task assignment';

-- Verify migration
SELECT 'Users table created' AS status;

SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE can_be_assigned = true) as assignable_users
FROM public.users;

-- Verify foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND (tc.table_name = 'tasks' OR tc.table_name = 'contact_submissions')
    AND ccu.table_name = 'users';

COMMIT;

-- Migration completed successfully
-- Next steps: 
-- 1. Test in staging environment
-- 2. Verify task assignment functionality 
-- 3. Update application code to use new users table
-- Rollback: Execute 009_add_users_table.sql from down/ directory
