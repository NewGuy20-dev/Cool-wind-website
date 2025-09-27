-- Rollback: 002_insert_seed_data
-- Author: Database Admin
-- Date: 2025-01-26
-- Purpose: Remove seed data inserted by 002_insert_seed_data.sql
-- WARNING: This will delete the seed users and their data

-- BEGIN TRANSACTION
BEGIN;

-- Store count before deletion for verification
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users;
    RAISE NOTICE 'Users before deletion: %', user_count;
END $$;

-- Delete seed users by email (safer than deleting all)
DELETE FROM public.users 
WHERE email IN (
    'admin@coolwind.com',
    'test@coolwind.com',
    'john.doe@example.com',
    'jane.smith@example.com',
    'bob.wilson@example.com'
);

-- Get count of deleted rows
GET DIAGNOSTICS affected_rows = ROW_COUNT;
RAISE NOTICE 'Deleted % seed users', affected_rows;

-- Verify deletion
SELECT 
    COUNT(*) as remaining_users
FROM public.users;

-- Verify specific seed users are gone
SELECT 
    COUNT(*) as seed_users_remaining
FROM public.users 
WHERE email IN (
    'admin@coolwind.com',
    'test@coolwind.com',
    'john.doe@example.com',
    'jane.smith@example.com',
    'bob.wilson@example.com'
);

-- Should return 0 if rollback successful

COMMIT;

-- Rollback completed
-- All seed data has been removed from users table
-- To reapply: Execute 002_insert_seed_data.sql from up/ directory
