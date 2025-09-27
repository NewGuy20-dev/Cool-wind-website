-- Rollback: 009_add_users_table
-- Author: Database Admin
-- Date: 2025-01-26
-- Purpose: Rollback creation of users table and related constraints
-- WARNING: This will remove user authentication system and break task assignments

-- BEGIN TRANSACTION
BEGIN;

-- Drop the assignable_users view first
DROP VIEW IF EXISTS public.assignable_users;

-- Drop foreign key constraints first (they depend on the users table)
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS fk_tasks_assigned_to_users;
ALTER TABLE public.contact_submissions DROP CONSTRAINT IF EXISTS fk_contact_submissions_assigned_to_users;

-- Note: After removing foreign keys, assigned_to fields will become orphaned UUIDs
-- You may want to set them to NULL or handle them appropriately:
UPDATE public.tasks SET assigned_to = NULL WHERE assigned_to IS NOT NULL;
UPDATE public.contact_submissions SET assigned_to = NULL WHERE assigned_to IS NOT NULL;

-- Drop RLS policies
DROP POLICY IF EXISTS "Users can view own profile and colleagues" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users; 
DROP POLICY IF EXISTS "Admin can manage users" ON public.users;

-- Drop indexes (they will be dropped automatically with the table, but explicit for clarity)
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_users_username;
DROP INDEX IF EXISTS public.idx_users_role;
DROP INDEX IF EXISTS public.idx_users_active_assignable;

-- Drop the users table
-- WARNING: This will delete all user data and authentication records
DROP TABLE IF EXISTS public.users CASCADE;

-- Verify rollback
SELECT 'Users table removal verification' AS status;

-- Verify table is gone
SELECT 
    COUNT(*) as users_tables_remaining
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';
-- Should return 0

-- Verify foreign key constraints are removed
SELECT 
    COUNT(*) as remaining_user_fk_constraints
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'users';
-- Should return 0

-- Verify assigned_to fields are cleared
SELECT 
    'tasks' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE assigned_to IS NOT NULL) as records_with_assignments
FROM public.tasks
UNION ALL
SELECT 
    'contact_submissions' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE assigned_to IS NOT NULL) as records_with_assignments  
FROM public.contact_submissions;

COMMIT;

-- Rollback completed
-- WARNING: User authentication system has been removed
-- - All user accounts deleted
-- - Task assignments cleared 
-- - Contact submission assignments cleared
-- - Authentication will not work until users table is recreated
-- To reapply: Execute 009_add_users_table.sql from up/ directory
