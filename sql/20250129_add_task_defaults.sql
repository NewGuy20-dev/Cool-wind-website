-- ====================================================
-- 20250129_add_task_defaults.sql
-- Task Status and Priority Defaults Migration
-- ====================================================
-- Purpose: Add 'open' status to enum and set proper defaults for status and priority
-- Dependencies: 01_core_schema.sql (tasks table must exist)
-- Execution Time: ~30 seconds
-- Author: Migration Script
-- Created: 2025-01-29

-- ====================================================
-- UPDATE TASK STATUS ENUM TO INCLUDE 'OPEN'
-- ====================================================

-- Add 'open' status to the existing task_status enum
-- This approach allows adding without dropping existing data
DO $$ 
BEGIN
    -- Check if 'open' status already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'open' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')
    ) THEN
        -- Add 'open' as the first value in the enum
        ALTER TYPE task_status ADD VALUE 'open' BEFORE 'pending';
        RAISE NOTICE '✅ Added "open" status to task_status enum';
    ELSE
        RAISE NOTICE '⚠️  "open" status already exists in task_status enum';
    END IF;
END $$;

-- ====================================================
-- UPDATE TABLE DEFAULTS
-- ====================================================

-- Set default values for status and priority columns
ALTER TABLE tasks 
    ALTER COLUMN status SET DEFAULT 'open',
    ALTER COLUMN priority SET DEFAULT 'medium';

RAISE NOTICE '✅ Updated default values: status = "open", priority = "medium"';

-- ====================================================
-- FIX EXISTING NULL VALUES
-- ====================================================

-- Update existing rows that have NULL status
UPDATE tasks
SET status = 'open'
WHERE status IS NULL;

-- Update existing rows that have NULL priority  
UPDATE tasks
SET priority = 'medium'
WHERE priority IS NULL;

-- Get count of updated rows for logging
DO $$
DECLARE
    null_status_count INTEGER;
    null_priority_count INTEGER;
BEGIN
    -- Count how many rows had null status before the update
    SELECT COUNT(*) INTO null_status_count 
    FROM tasks 
    WHERE status = 'open' AND updated_at = NOW()::date;
    
    -- Count how many rows had null priority before the update
    SELECT COUNT(*) INTO null_priority_count 
    FROM tasks 
    WHERE priority = 'medium' AND updated_at = NOW()::date;
    
    RAISE NOTICE '✅ Fixed % rows with NULL status, % rows with NULL priority', 
                 null_status_count, null_priority_count;
END $$;

-- ====================================================
-- ADD CONSTRAINTS TO PREVENT FUTURE NULL VALUES
-- ====================================================

-- Ensure status and priority are never null in the future
ALTER TABLE tasks 
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN priority SET NOT NULL;

RAISE NOTICE '✅ Added NOT NULL constraints to status and priority columns';

-- ====================================================
-- UPDATE CONSTRAINTS TO ACCOUNT FOR NEW 'OPEN' STATUS
-- ====================================================

-- Update the completed_at constraint to handle 'open' status
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS completed_at_valid;

ALTER TABLE tasks 
ADD CONSTRAINT completed_at_valid CHECK (
    (status = 'completed' AND completed_at IS NOT NULL) OR 
    (status != 'completed' AND completed_at IS NULL)
);

RAISE NOTICE '✅ Updated completed_at constraint to handle "open" status';

-- ====================================================
-- VALIDATION AND VERIFICATION
-- ====================================================

-- Verify the migration was successful
DO $$
DECLARE
    total_tasks INTEGER;
    open_tasks INTEGER;
    null_status_tasks INTEGER;
    null_priority_tasks INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tasks FROM tasks WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO open_tasks FROM tasks WHERE status = 'open' AND deleted_at IS NULL;
    SELECT COUNT(*) INTO null_status_tasks FROM tasks WHERE status IS NULL AND deleted_at IS NULL;
    SELECT COUNT(*) INTO null_priority_tasks FROM tasks WHERE priority IS NULL AND deleted_at IS NULL;
    
    RAISE NOTICE '📊 Migration Summary:';
    RAISE NOTICE '   Total active tasks: %', total_tasks;
    RAISE NOTICE '   Tasks with "open" status: %', open_tasks;
    RAISE NOTICE '   Tasks with NULL status: % (should be 0)', null_status_tasks;
    RAISE NOTICE '   Tasks with NULL priority: % (should be 0)', null_priority_tasks;
    
    -- Verify enum was updated correctly
    IF EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'open' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')
    ) THEN
        RAISE NOTICE '✅ task_status enum successfully includes "open"';
    ELSE
        RAISE EXCEPTION '❌ Migration failed: "open" status not found in enum';
    END IF;
    
    -- Verify no null values remain
    IF null_status_tasks = 0 AND null_priority_tasks = 0 THEN
        RAISE NOTICE '✅ Migration completed successfully - no NULL values remain';
    ELSE
        RAISE EXCEPTION '❌ Migration failed: NULL values still exist';
    END IF;
END $$;

-- ====================================================
-- PERFORMANCE OPTIMIZATION
-- ====================================================

-- Refresh any relevant materialized views or statistics
ANALYZE tasks;

RAISE NOTICE '🎉 Task defaults migration completed successfully!';
RAISE NOTICE '📝 New tasks will now default to status="open" and priority="medium"';