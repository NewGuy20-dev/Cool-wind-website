-- Rollback: 010_create_tasks_schema
-- Author: Cascade Assistant
-- Date: 2025-09-26
-- Purpose: Drop task management tables, triggers, indexes, and supporting types

BEGIN;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_task_comments_updated_at ON task_comments;
DROP TRIGGER IF EXISTS trigger_tasks_updated_at ON tasks;

-- Drop indexes
DROP INDEX IF EXISTS idx_tasks_active;
DROP INDEX IF EXISTS idx_tasks_task_number;
DROP INDEX IF EXISTS idx_tasks_phone_number;
DROP INDEX IF EXISTS idx_tasks_created_at;
DROP INDEX IF EXISTS idx_tasks_priority;
DROP INDEX IF EXISTS idx_tasks_status;

-- Drop foreign key tables
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS task_audit_log CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- Drop helper functions
DROP FUNCTION IF EXISTS validate_phone_number(TEXT);
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS generate_task_id();

-- Drop enums
DROP TYPE IF EXISTS task_source;
DROP TYPE IF EXISTS task_priority;
DROP TYPE IF EXISTS task_status;

COMMIT;
