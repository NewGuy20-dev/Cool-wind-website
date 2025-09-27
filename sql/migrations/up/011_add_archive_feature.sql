-- ====================================================
-- 011_add_archive_feature.sql
-- Add archive functionality to tasks
-- ====================================================
-- Purpose: Add archive field and related functionality to tasks table
-- Dependencies: 010_create_tasks_schema.sql
-- Author: Migration Script  
-- Created: 2025-09-27

-- ====================================================
-- ADD ARCHIVE COLUMN TO TASKS TABLE
-- ====================================================

-- Add archived column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false NOT NULL;

-- ====================================================
-- CREATE INDEX FOR ARCHIVED TASKS
-- ====================================================

-- Index for filtering archived/active tasks
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(archived);

-- Composite index for archived status filtering
CREATE INDEX IF NOT EXISTS idx_tasks_archived_status ON tasks(archived, status);

-- Index for archived tasks by creation date (for archive views)
CREATE INDEX IF NOT EXISTS idx_tasks_archived_created ON tasks(archived, created_at DESC);

-- ====================================================
-- ADD ARCHIVE-RELATED AUDIT ACTIONS
-- ====================================================

-- Update task_audit_log table to support archive actions
-- (The existing structure already supports this via the 'action' field)

-- ====================================================
-- ADD ARCHIVE-RELATED CONSTRAINTS
-- ====================================================

-- Add constraint: archived tasks should not be in 'new' or 'in_progress' status
-- This prevents inconsistent states
ALTER TABLE tasks 
ADD CONSTRAINT check_archived_status 
CHECK (
    (archived = false) OR 
    (archived = true AND status NOT IN ('new', 'in_progress'))
);

-- ====================================================
-- CREATE ARCHIVE HELPER FUNCTIONS
-- ====================================================

-- Function to archive a task
CREATE OR REPLACE FUNCTION archive_task(task_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    task_exists BOOLEAN;
    current_status task_status;
BEGIN
    -- Check if task exists and get current status
    SELECT EXISTS(SELECT 1 FROM tasks WHERE id = task_id AND deleted_at IS NULL), status
    INTO task_exists, current_status
    FROM tasks 
    WHERE id = task_id AND deleted_at IS NULL;
    
    IF NOT task_exists THEN
        RAISE EXCEPTION 'Task not found or already deleted: %', task_id;
    END IF;
    
    -- Don't allow archiving of new or in_progress tasks
    IF current_status IN ('new', 'in_progress') THEN
        RAISE EXCEPTION 'Cannot archive task with status: %. Complete or cancel the task first.', current_status;
    END IF;
    
    -- Archive the task
    UPDATE tasks 
    SET archived = true, updated_at = NOW()
    WHERE id = task_id AND deleted_at IS NULL;
    
    -- Log the archive action
    INSERT INTO task_audit_log (task_id, action, new_values, changed_fields, change_source, reason)
    VALUES (
        task_id,
        'archived',
        jsonb_build_object('archived', true),
        ARRAY['archived'],
        'system',
        'Task archived via archive_task function'
    );
    
    RETURN true;
END;
$$;

-- Function to unarchive a task
CREATE OR REPLACE FUNCTION unarchive_task(task_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    task_exists BOOLEAN;
BEGIN
    -- Check if task exists
    SELECT EXISTS(SELECT 1 FROM tasks WHERE id = task_id AND deleted_at IS NULL AND archived = true)
    INTO task_exists;
    
    IF NOT task_exists THEN
        RAISE EXCEPTION 'Archived task not found: %', task_id;
    END IF;
    
    -- Unarchive the task
    UPDATE tasks 
    SET archived = false, updated_at = NOW()
    WHERE id = task_id AND deleted_at IS NULL;
    
    -- Log the unarchive action
    INSERT INTO task_audit_log (task_id, action, new_values, changed_fields, change_source, reason)
    VALUES (
        task_id,
        'unarchived',
        jsonb_build_object('archived', false),
        ARRAY['archived'],
        'system',
        'Task unarchived via unarchive_task function'
    );
    
    RETURN true;
END;
$$;

-- ====================================================
-- UPDATE EXISTING VIEWS AND FUNCTIONS
-- ====================================================

-- Create view for active (non-archived, non-deleted) tasks
CREATE OR REPLACE VIEW active_tasks AS
SELECT * FROM tasks 
WHERE deleted_at IS NULL AND archived = false
ORDER BY created_at DESC;

-- Create view for archived tasks
CREATE OR REPLACE VIEW archived_tasks AS
SELECT * FROM tasks 
WHERE deleted_at IS NULL AND archived = true
ORDER BY updated_at DESC;

-- ====================================================
-- DATA MIGRATION
-- ====================================================

-- Set all existing tasks as non-archived (default value handles this)
-- This is already handled by the DEFAULT false in the column definition

-- ====================================================
-- VERIFICATION QUERIES
-- ====================================================

-- Verify archive column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'tasks' 
AND column_name = 'archived';

-- Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
AND tablename = 'tasks'
AND indexname LIKE '%archived%';

-- Verify functions were created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('archive_task', 'unarchive_task');

-- Verify views were created
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('active_tasks', 'archived_tasks');

-- ====================================================
-- SUCCESS MESSAGE
-- ====================================================

DO $$
DECLARE
    archive_column_exists BOOLEAN;
    archive_indexes INTEGER;
    archive_functions INTEGER;
    archive_views INTEGER;
BEGIN
    -- Check if archive column exists
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'archived'
    ) INTO archive_column_exists;
    
    -- Count archive-related indexes
    SELECT COUNT(*) INTO archive_indexes
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'tasks' AND indexname LIKE '%archived%';
    
    -- Count archive functions
    SELECT COUNT(*) INTO archive_functions
    FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name IN ('archive_task', 'unarchive_task');
    
    -- Count archive views
    SELECT COUNT(*) INTO archive_views
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('active_tasks', 'archived_tasks');
    
    RAISE NOTICE '✅ Archive feature migration completed successfully!';
    RAISE NOTICE '📁 Archive column added: %', archive_column_exists;
    RAISE NOTICE '🔍 Archive indexes created: %', archive_indexes;
    RAISE NOTICE '⚙️ Archive functions created: %', archive_functions;
    RAISE NOTICE '👁️ Archive views created: %', archive_views;
    RAISE NOTICE '🛡️ Archive constraints added for data integrity';
    RAISE NOTICE '📝 Archive audit logging enabled';
    RAISE NOTICE '🎯 Ready to use archive functionality!';
END $$;
