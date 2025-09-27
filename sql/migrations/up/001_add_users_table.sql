-- Migration: 001_add_users_table
-- Author: Database Admin
-- Date: 2025-01-26
-- Purpose: Create users table with authentication and profile information
-- Environment: To be applied to staging first, then production

-- BEGIN TRANSACTION
BEGIN;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active) WHERE is_active = true;

-- Add RLS (Row Level Security) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Add comments for documentation
COMMENT ON TABLE public.users IS 'User profiles and authentication information';
COMMENT ON COLUMN public.users.id IS 'Unique identifier, synced with auth.users';
COMMENT ON COLUMN public.users.email IS 'User email address, must be unique';
COMMENT ON COLUMN public.users.username IS 'Display username, must be unique';
COMMENT ON COLUMN public.users.is_active IS 'Whether user account is active';
COMMENT ON COLUMN public.users.email_verified IS 'Whether email has been verified';

-- Verify migration
SELECT 
    schemaname, 
    tablename, 
    tableowner 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Verify indexes
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'users' AND schemaname = 'public';

-- Verify RLS is enabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

COMMIT;

-- Migration completed successfully
-- Next steps: Test in staging environment
-- Rollback: Execute 001_add_users_table.sql from down/ directory
