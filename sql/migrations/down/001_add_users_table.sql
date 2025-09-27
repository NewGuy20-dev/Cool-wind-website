-- Rollback: 001_add_users_table
-- Author: Database Admin
-- Date: 2025-01-26
-- Purpose: Rollback creation of users table and related objects
-- WARNING: This will permanently delete the users table and all data

-- BEGIN TRANSACTION
BEGIN;

-- Drop RLS policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Drop indexes (they will be dropped automatically with the table, but explicit for clarity)
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_users_username;
DROP INDEX IF EXISTS public.idx_users_created_at;
DROP INDEX IF EXISTS public.idx_users_active;

-- Drop the users table
-- WARNING: This will delete all user data
DROP TABLE IF EXISTS public.users CASCADE;

-- Verify rollback - table should not exist
SELECT 
    schemaname, 
    tablename 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Should return no rows if rollback successful

COMMIT;

-- Rollback completed
-- The users table and all related objects have been removed
-- To reapply: Execute 001_add_users_table.sql from up/ directory
