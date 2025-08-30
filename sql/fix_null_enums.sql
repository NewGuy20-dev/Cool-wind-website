-- Fix Null Enum Values in Tasks Table
-- This script updates existing tasks with null status/priority to valid enum values

BEGIN;

-- Check current null values
SELECT 
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status IS NULL THEN 1 END) as null_status_count,
    COUNT(CASE WHEN priority IS NULL THEN 1 END) as null_priority_count
FROM tasks 
WHERE deleted_at IS NULL;

-- Show tasks with null values before fix
SELECT 
    task_number,
    customer_name,
    status,
    priority,
    created_at
FROM tasks 
WHERE (status IS NULL OR priority IS NULL) 
AND deleted_at IS NULL
ORDER BY created_at;

-- Update null status to 'pending' (default from schema)
UPDATE tasks 
SET status = 'pending'
WHERE status IS NULL 
AND deleted_at IS NULL;

-- Update null priority to 'medium' (default from schema)  
UPDATE tasks
SET priority = 'medium'
WHERE priority IS NULL
AND deleted_at IS NULL;

-- Verify the fix
SELECT 
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status IS NULL THEN 1 END) as remaining_null_status,
    COUNT(CASE WHEN priority IS NULL THEN 1 END) as remaining_null_priority
FROM tasks 
WHERE deleted_at IS NULL;

-- Show updated tasks
SELECT 
    task_number,
    customer_name,
    status,
    priority,
    updated_at
FROM tasks 
WHERE deleted_at IS NULL
ORDER BY updated_at DESC
LIMIT 10;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Null enum values have been fixed!';
    RAISE NOTICE '📋 All tasks now have valid status and priority values';
END $$;
