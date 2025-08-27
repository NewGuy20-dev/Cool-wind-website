-- ====================================================
-- 03_rls_policies.sql
-- Row Level Security (RLS) Setup for Task Management System
-- ====================================================
-- Purpose: Configure security policies for data access control
-- Dependencies: 01_core_schema.sql (tables must exist)
-- Execution Time: ~30 seconds
-- Author: Migration Script
-- Created: 2024

-- ====================================================
-- ENABLE ROW LEVEL SECURITY
-- ====================================================

-- Enable RLS on all main tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- ====================================================
-- ADMIN ACCESS POLICIES (Full Access)
-- ====================================================

-- Admin users can read all tasks
CREATE POLICY "Admin users can view all tasks" ON tasks
    FOR SELECT
    TO authenticated
    USING (
        -- Check if user has admin role in auth.users metadata
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin' OR
        -- Check if user email is in admin list (configure in Supabase dashboard)
        auth.jwt() ->> 'email' IN (
            'admin@coolwindservices.com',
            'support@coolwindservices.com',
            'manager@coolwindservices.com'
        )
    );

-- Admin users can insert new tasks
CREATE POLICY "Admin users can create tasks" ON tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            'admin@coolwindservices.com',
            'support@coolwindservices.com',
            'manager@coolwindservices.com'
        )
    );

-- Admin users can update tasks
CREATE POLICY "Admin users can update tasks" ON tasks
    FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            'admin@coolwindservices.com',
            'support@coolwindservices.com',
            'manager@coolwindservices.com'
        )
    )
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            'admin@coolwindservices.com',
            'support@coolwindservices.com',
            'manager@coolwindservices.com'
        )
    );

-- Admin users can soft delete tasks (not hard delete for audit)
CREATE POLICY "Admin users can soft delete tasks" ON tasks
    FOR UPDATE
    TO authenticated
    USING (
        (auth.jwt() ->> 'role' = 'admin' OR
         auth.jwt() ->> 'user_role' = 'admin' OR
         auth.jwt() ->> 'email' IN (
             'admin@coolwindservices.com',
             'support@coolwindservices.com',
             'manager@coolwindservices.com'
         )) AND
        deleted_at IS NULL  -- Can only soft delete non-deleted tasks
    );

-- ====================================================
-- API ACCESS POLICIES (Service Account)
-- ====================================================

-- Service role (for API calls) can read all tasks
CREATE POLICY "Service role can read tasks" ON tasks
    FOR SELECT
    TO service_role
    USING (true);

-- Service role can create tasks (for automated task creation)
CREATE POLICY "Service role can create tasks" ON tasks
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Service role can update tasks
CREATE POLICY "Service role can update tasks" ON tasks
    FOR UPDATE
    TO service_role
    USING (true);

-- ====================================================
-- ANONYMOUS ACCESS POLICIES (Public API)
-- ====================================================

-- Allow anonymous task creation (for chat bot integration)
-- But only for specific sources and with limited data
CREATE POLICY "Anonymous users can create chat tasks" ON tasks
    FOR INSERT
    TO anon
    WITH CHECK (
        source = 'chat-failed-call' AND
        -- Ensure required fields are present
        customer_name IS NOT NULL AND
        phone_number IS NOT NULL AND
        problem_description IS NOT NULL AND
        -- Limit to safe statuses
        status IN ('pending') AND
        -- No admin-only fields
        assigned_to IS NULL AND
        ai_priority_reason IS NULL
    );

-- ====================================================
-- TECHNICIAN ACCESS POLICIES (Future Use)
-- ====================================================

-- Technicians can view assigned tasks
CREATE POLICY "Technicians can view assigned tasks" ON tasks
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'technician' AND
        assigned_to = auth.uid()::uuid
    );

-- Technicians can update status of assigned tasks
CREATE POLICY "Technicians can update assigned tasks" ON tasks
    FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'technician' AND
        assigned_to = auth.uid()::uuid
    )
    WITH CHECK (
        auth.jwt() ->> 'role' = 'technician' AND
        assigned_to = auth.uid()::uuid AND
        -- Technicians can only update certain fields
        OLD.customer_name = NEW.customer_name AND
        OLD.phone_number = NEW.phone_number AND
        OLD.problem_description = NEW.problem_description
    );

-- ====================================================
-- AUDIT LOG POLICIES
-- ====================================================

-- Admin can read all audit logs
CREATE POLICY "Admin can view audit logs" ON task_audit_log
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            'admin@coolwindservices.com',
            'support@coolwindservices.com',
            'manager@coolwindservices.com'
        )
    );

-- System can insert audit logs
CREATE POLICY "System can create audit logs" ON task_audit_log
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Authenticated users can insert audit logs for their actions
CREATE POLICY "Users can create their audit logs" ON task_audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (
        changed_by = auth.uid()::uuid OR
        changed_by IS NULL
    );

-- ====================================================
-- COMMENT POLICIES
-- ====================================================

-- Admin can read all comments
CREATE POLICY "Admin can view all comments" ON task_comments
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            'admin@coolwindservices.com',
            'support@coolwindservices.com',
            'manager@coolwindservices.com'
        )
    );

-- Admin can create comments
CREATE POLICY "Admin can create comments" ON task_comments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            'admin@coolwindservices.com',
            'support@coolwindservices.com',
            'manager@coolwindservices.com'
        )
    );

-- Users can view their own comments
CREATE POLICY "Users can view their comments" ON task_comments
    FOR SELECT
    TO authenticated
    USING (author_id = auth.uid()::uuid);

-- Service role can create system comments
CREATE POLICY "Service can create system comments" ON task_comments
    FOR INSERT
    TO service_role
    WITH CHECK (author_type = 'system');

-- ====================================================
-- ATTACHMENT POLICIES  
-- ====================================================

-- Admin can view all attachments
CREATE POLICY "Admin can view all attachments" ON task_attachments
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            'admin@coolwindservices.com',
            'support@coolwindservices.com',
            'manager@coolwindservices.com'
        )
    );

-- Admin can upload attachments
CREATE POLICY "Admin can upload attachments" ON task_attachments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            'admin@coolwindservices.com',
            'support@coolwindservices.com',
            'manager@coolwindservices.com'
        )
    );

-- Public attachments can be viewed by anyone
CREATE POLICY "Public attachments are viewable" ON task_attachments
    FOR SELECT
    TO anon, authenticated
    USING (is_public = true);

-- ====================================================
-- HELPER FUNCTIONS FOR POLICIES
-- ====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            'admin@coolwindservices.com',
            'support@coolwindservices.com',
            'manager@coolwindservices.com'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access task
CREATE OR REPLACE FUNCTION can_access_task(task_row tasks)
RETURNS BOOLEAN AS $$
BEGIN
    -- Admin can access all tasks
    IF is_admin_user() THEN
        RETURN true;
    END IF;
    
    -- Technician can access assigned tasks
    IF auth.jwt() ->> 'role' = 'technician' AND task_row.assigned_to = auth.uid()::uuid THEN
        RETURN true;
    END IF;
    
    -- Default deny
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================
-- SECURITY POLICIES FOR DATA EXPORT
-- ====================================================

-- Create view for safe data export (excludes sensitive info)
CREATE OR REPLACE VIEW v_tasks_export AS
SELECT 
    task_number,
    customer_name,
    LEFT(phone_number, 3) || 'XXXXX' || RIGHT(phone_number, 2) as phone_masked,
    location,
    title,
    problem_description,
    status,
    priority,
    created_at,
    completed_at
FROM tasks
WHERE deleted_at IS NULL;

-- Admin can access export view
CREATE POLICY "Admin can access export view" ON v_tasks_export
    FOR SELECT
    TO authenticated
    USING (is_admin_user());

-- ====================================================
-- VERIFICATION QUERIES
-- ====================================================

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tasks', 'task_audit_log', 'task_comments', 'task_attachments');

-- Count policies created
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ====================================================
-- SUCCESS MESSAGE
-- ====================================================

DO $$
DECLARE
    rls_tables INTEGER;
    total_policies INTEGER;
BEGIN
    SELECT COUNT(*) INTO rls_tables FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('tasks', 'task_audit_log', 'task_comments', 'task_attachments')
    AND rowsecurity = true;
    
    SELECT COUNT(*) INTO total_policies FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '✅ Row Level Security configured successfully!';
    RAISE NOTICE '🔒 RLS enabled on % tables', rls_tables;
    RAISE NOTICE '🛡️ Total security policies created: %', total_policies;
    RAISE NOTICE '👥 Admin access: Full CRUD operations';
    RAISE NOTICE '🤖 Service role: API integration access';
    RAISE NOTICE '🌐 Anonymous: Limited task creation for chat bot';
    RAISE NOTICE '🔧 Technician: View and update assigned tasks';
    RAISE NOTICE '📋 Audit trail: Comprehensive change tracking';
    RAISE NOTICE '🎯 Ready for triggers and functions (04_triggers_functions.sql)';
END $$;

-- ====================================================
-- SECURITY NOTES
-- ====================================================

/*
Security Configuration Notes:

1. ADMIN USERS:
   - Configure admin emails in Supabase Dashboard > Authentication > Users
   - Set user metadata: { "role": "admin" } or { "user_role": "admin" }
   - Or add email to the admin list in policies above

2. SERVICE ROLE:
   - Use for server-side API calls
   - Never expose service role key to client-side code
   - Rotate keys regularly in production

3. ANONYMOUS ACCESS:
   - Limited to task creation from chat bot
   - Only allows 'pending' status and 'chat-failed-call' source
   - No access to sensitive fields

4. API INTEGRATION:
   - Use service role for backend API calls
   - Use authenticated role for admin dashboard
   - Always validate permissions in application code too

5. AUDIT TRAIL:
   - All changes are tracked in task_audit_log
   - Use trigger functions to automatically log changes
   - Consider data retention policies for audit logs

6. DATA PRIVACY:
   - Phone numbers are masked in export views
   - Soft delete preserves audit trail
   - Consider GDPR compliance for EU users
*/

-- ====================================================
-- ROLLBACK PROCEDURES (for development/testing)
-- ====================================================

/*
-- Uncomment and run these commands to rollback RLS:

-- Drop helper functions
DROP FUNCTION IF EXISTS is_admin_user();
DROP FUNCTION IF EXISTS can_access_task(tasks);

-- Drop export view
DROP VIEW IF EXISTS v_tasks_export;

-- Drop all policies
DROP POLICY IF EXISTS "Admin users can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Admin users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Admin users can update tasks" ON tasks;
DROP POLICY IF EXISTS "Admin users can soft delete tasks" ON tasks;
DROP POLICY IF EXISTS "Service role can read tasks" ON tasks;
DROP POLICY IF EXISTS "Service role can create tasks" ON tasks;
DROP POLICY IF EXISTS "Service role can update tasks" ON tasks;
DROP POLICY IF EXISTS "Anonymous users can create chat tasks" ON tasks;
DROP POLICY IF EXISTS "Technicians can view assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Technicians can update assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Admin can view audit logs" ON task_audit_log;
DROP POLICY IF EXISTS "System can create audit logs" ON task_audit_log;
DROP POLICY IF EXISTS "Users can create their audit logs" ON task_audit_log;
DROP POLICY IF EXISTS "Admin can view all comments" ON task_comments;
DROP POLICY IF EXISTS "Admin can create comments" ON task_comments;
DROP POLICY IF EXISTS "Users can view their comments" ON task_comments;
DROP POLICY IF EXISTS "Service can create system comments" ON task_comments;
DROP POLICY IF EXISTS "Admin can view all attachments" ON task_attachments;
DROP POLICY IF EXISTS "Admin can upload attachments" ON task_attachments;
DROP POLICY IF EXISTS "Public attachments are viewable" ON task_attachments;

-- Disable RLS
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments DISABLE ROW LEVEL SECURITY;
*/