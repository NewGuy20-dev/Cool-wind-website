-- Migration: 002_insert_seed_data
-- Author: Database Admin
-- Date: 2025-01-26
-- Purpose: Insert initial seed data for users table and system configuration
-- Dependencies: 001_add_users_table.sql must be applied first

-- BEGIN TRANSACTION
BEGIN;

-- Verify users table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public') THEN
        RAISE EXCEPTION 'Users table does not exist. Please run 001_add_users_table.sql first.';
    END IF;
END $$;

-- Insert system admin user (placeholder data)
INSERT INTO public.users (
    id,
    email,
    username,
    first_name,
    last_name,
    phone,
    is_active,
    email_verified,
    created_at
) VALUES (
    gen_random_uuid(),
    'admin@coolwind.com',
    'admin',
    'System',
    'Administrator',
    '+1-555-0100',
    true,
    true,
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert test user for development
INSERT INTO public.users (
    id,
    email,
    username,
    first_name,
    last_name,
    phone,
    is_active,
    email_verified,
    created_at
) VALUES (
    gen_random_uuid(),
    'test@coolwind.com',
    'testuser',
    'Test',
    'User',
    '+1-555-0101',
    true,
    true,
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert sample users for demo purposes
INSERT INTO public.users (
    id,
    email,
    username,
    first_name,
    last_name,
    phone,
    is_active,
    email_verified,
    created_at
) VALUES 
(
    gen_random_uuid(),
    'john.doe@example.com',
    'johndoe',
    'John',
    'Doe',
    '+1-555-0102',
    true,
    true,
    NOW()
),
(
    gen_random_uuid(),
    'jane.smith@example.com',
    'janesmith',
    'Jane',
    'Smith',
    '+1-555-0103',
    true,
    false,
    NOW()
),
(
    gen_random_uuid(),
    'bob.wilson@example.com',
    'bobwilson',
    'Bob',
    'Wilson',
    '+1-555-0104',
    false,
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify seed data insertion
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE email_verified = true) as verified_users
FROM public.users;

-- Verify specific seed users exist
SELECT 
    email,
    username,
    first_name,
    last_name,
    is_active,
    email_verified
FROM public.users 
WHERE email IN ('admin@coolwind.com', 'test@coolwind.com')
ORDER BY email;

COMMIT;

-- Migration completed successfully
-- Seed data has been inserted into users table
-- Rollback: Execute 002_insert_seed_data.sql from down/ directory
