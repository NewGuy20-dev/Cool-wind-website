-- ====================================================
-- 02_indexes_constraints.sql
-- Performance Optimization Indexes and Advanced Constraints
-- ====================================================
-- Purpose: Create comprehensive indexes for optimal query performance
-- Dependencies: 01_core_schema.sql (main tables must exist)
-- Execution Time: ~45 seconds
-- Author: Migration Script
-- Created: 2024

-- ====================================================
-- FULL-TEXT SEARCH INDEXES
-- ====================================================

-- Full-text search on task title and description
CREATE INDEX IF NOT EXISTS idx_tasks_fulltext_search 
ON tasks USING gin(to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(problem_description, '') || ' ' ||
    COALESCE(customer_name, '')
));

-- Trigram indexes for fuzzy matching (customer names, phone numbers)
CREATE INDEX IF NOT EXISTS idx_tasks_customer_name_trgm 
ON tasks USING gin(customer_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_tasks_phone_trgm 
ON tasks USING gin(phone_number gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_tasks_location_trgm 
ON tasks USING gin(location gin_trgm_ops);

-- ====================================================
-- PERFORMANCE INDEXES FOR COMMON QUERIES
-- ====================================================

-- Dashboard queries (status + priority combinations)
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority 
ON tasks(status, priority) WHERE deleted_at IS NULL;

-- Date range queries (created_at with status)
CREATE INDEX IF NOT EXISTS idx_tasks_created_status 
ON tasks(created_at DESC, status) WHERE deleted_at IS NULL;

-- Due date tracking
CREATE INDEX IF NOT EXISTS idx_tasks_due_date 
ON tasks(due_date ASC) WHERE due_date IS NOT NULL AND status != 'completed' AND deleted_at IS NULL;

-- Assignment tracking (for future use)
CREATE INDEX IF NOT EXISTS idx_tasks_assigned 
ON tasks(assigned_to, status) WHERE assigned_to IS NOT NULL AND deleted_at IS NULL;

-- Source-based queries
CREATE INDEX IF NOT EXISTS idx_tasks_source_created 
ON tasks(source, created_at DESC) WHERE deleted_at IS NULL;

-- Location-based service routing
CREATE INDEX IF NOT EXISTS idx_tasks_location_status 
ON tasks(location, status) WHERE deleted_at IS NULL;

-- ====================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ====================================================

-- Admin dashboard filtering (multiple criteria)
CREATE INDEX IF NOT EXISTS idx_tasks_dashboard_filter 
ON tasks(status, priority, source, created_at DESC) WHERE deleted_at IS NULL;

-- Customer history lookup
CREATE INDEX IF NOT EXISTS idx_tasks_customer_history 
ON tasks(phone_number, created_at DESC) WHERE deleted_at IS NULL;

-- Performance analytics
CREATE INDEX IF NOT EXISTS idx_tasks_analytics 
ON tasks(status, priority, created_at, completed_at) WHERE deleted_at IS NULL;

-- Urgent task identification
CREATE INDEX IF NOT EXISTS idx_tasks_urgent 
ON tasks(priority, due_date, status) WHERE priority IN ('high', 'urgent') AND deleted_at IS NULL;

-- ====================================================
-- JSONB INDEXES FOR METADATA QUERIES
-- ====================================================

-- General metadata search
CREATE INDEX IF NOT EXISTS idx_tasks_metadata 
ON tasks USING gin(metadata);

-- Chat context search
CREATE INDEX IF NOT EXISTS idx_tasks_chat_context 
ON tasks USING gin(chat_context);

-- Urgency keywords array search
CREATE INDEX IF NOT EXISTS idx_tasks_urgency_keywords 
ON tasks USING gin(urgency_keywords);

-- ====================================================
-- AUDIT LOG INDEXES
-- ====================================================

-- Task audit history
CREATE INDEX IF NOT EXISTS idx_audit_log_task_id_date 
ON task_audit_log(task_id, changed_at DESC);

-- Action-based audit queries
CREATE INDEX IF NOT EXISTS idx_audit_log_action_date 
ON task_audit_log(action, changed_at DESC);

-- User activity tracking
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by 
ON task_audit_log(changed_by, changed_at DESC) WHERE changed_by IS NOT NULL;

-- ====================================================
-- COMMENT INDEXES
-- ====================================================

-- Task comments lookup
CREATE INDEX IF NOT EXISTS idx_comments_task_created 
ON task_comments(task_id, created_at DESC);

-- Public comments only
CREATE INDEX IF NOT EXISTS idx_comments_public 
ON task_comments(task_id, created_at DESC) WHERE is_customer_visible = true;

-- Comment search
CREATE INDEX IF NOT EXISTS idx_comments_fulltext 
ON task_comments USING gin(to_tsvector('english', comment));

-- ====================================================
-- ATTACHMENT INDEXES
-- ====================================================

-- Task attachments lookup
CREATE INDEX IF NOT EXISTS idx_attachments_task_created 
ON task_attachments(task_id, created_at DESC);

-- File type queries
CREATE INDEX IF NOT EXISTS idx_attachments_mime_type 
ON task_attachments(mime_type);

-- Image attachments
CREATE INDEX IF NOT EXISTS idx_attachments_images 
ON task_attachments(task_id, created_at DESC) WHERE is_image = true;

-- Public attachments
CREATE INDEX IF NOT EXISTS idx_attachments_public 
ON task_attachments(task_id, created_at DESC) WHERE is_public = true;

-- ====================================================
-- PARTIAL INDEXES FOR SPECIFIC USE CASES
-- ====================================================

-- Active high-priority tasks only
CREATE INDEX IF NOT EXISTS idx_tasks_active_high_priority 
ON tasks(created_at DESC) 
WHERE status IN ('pending', 'in_progress') AND priority IN ('high', 'urgent') AND deleted_at IS NULL;

-- Overdue tasks
CREATE INDEX IF NOT EXISTS idx_tasks_overdue 
ON tasks(due_date ASC) 
WHERE due_date < NOW() AND status NOT IN ('completed', 'cancelled') AND deleted_at IS NULL;

-- Today's tasks
CREATE INDEX IF NOT EXISTS idx_tasks_today 
ON tasks(created_at DESC) 
WHERE DATE(created_at) = CURRENT_DATE AND deleted_at IS NULL;

-- Failed call tasks specifically  
CREATE INDEX IF NOT EXISTS idx_tasks_failed_calls 
ON tasks(created_at DESC) 
WHERE source = 'chat-failed-call' AND deleted_at IS NULL;

-- ====================================================
-- ADVANCED CONSTRAINTS
-- ====================================================

-- Ensure completed tasks have completion timestamp
ALTER TABLE tasks ADD CONSTRAINT check_completed_timestamp 
CHECK (
    (status = 'completed' AND completed_at IS NOT NULL) OR 
    (status != 'completed')
);

-- Prevent future completion dates
ALTER TABLE tasks ADD CONSTRAINT check_completion_not_future 
CHECK (completed_at IS NULL OR completed_at <= NOW());

-- Ensure assigned tasks have assignment timestamp
ALTER TABLE tasks ADD CONSTRAINT check_assignment_timestamp 
CHECK (
    (assigned_to IS NOT NULL AND assigned_at IS NOT NULL) OR 
    (assigned_to IS NULL)
);

-- Phone number format validation (enhanced)
ALTER TABLE tasks ADD CONSTRAINT check_phone_format 
CHECK (phone_number ~ '^[6-9][0-9]{9}$');

-- Priority escalation rules
ALTER TABLE tasks ADD CONSTRAINT check_urgent_has_due_date 
CHECK (
    priority != 'urgent' OR 
    (priority = 'urgent' AND due_date IS NOT NULL)
);

-- ====================================================
-- STATISTICS UPDATE
-- ====================================================

-- Update table statistics for query planner
ANALYZE tasks;
ANALYZE task_audit_log;
ANALYZE task_comments;
ANALYZE task_attachments;

-- ====================================================
-- INDEX MONITORING VIEWS
-- ====================================================

-- View to monitor index usage
CREATE OR REPLACE VIEW v_index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_blks_read,
    idx_blks_hit
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC;

-- View to identify unused indexes
CREATE OR REPLACE VIEW v_unused_indexes AS
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
AND idx_scan = 0
AND idx_tup_read = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- ====================================================
-- VERIFICATION QUERIES
-- ====================================================

-- Count all indexes created
SELECT 
    COUNT(*) as total_indexes,
    COUNT(*) FILTER (WHERE indexname LIKE 'idx_tasks_%') as task_indexes,
    COUNT(*) FILTER (WHERE indexname LIKE 'idx_audit_%') as audit_indexes,
    COUNT(*) FILTER (WHERE indexname LIKE 'idx_comments_%') as comment_indexes,
    COUNT(*) FILTER (WHERE indexname LIKE 'idx_attachments_%') as attachment_indexes
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('tasks', 'task_audit_log', 'task_comments', 'task_attachments');

-- Check index sizes
SELECT 
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'tasks'
ORDER BY pg_relation_size(indexname::regclass) DESC;

-- Verify constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'tasks'
AND tc.constraint_type = 'CHECK'
ORDER BY tc.constraint_name;

-- ====================================================
-- SUCCESS MESSAGE
-- ====================================================

DO $$
DECLARE
    index_count INTEGER;
    constraint_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename IN ('tasks', 'task_audit_log', 'task_comments', 'task_attachments');
    
    SELECT COUNT(*) INTO constraint_count FROM information_schema.table_constraints 
    WHERE table_schema = 'public' AND table_name = 'tasks' AND constraint_type = 'CHECK';
    
    RAISE NOTICE '✅ Performance optimization completed!';
    RAISE NOTICE '🚀 Total indexes created: %', index_count;
    RAISE NOTICE '🔍 Full-text search enabled on title, description, customer names';
    RAISE NOTICE '🎯 Trigram fuzzy matching enabled for names and phone numbers';
    RAISE NOTICE '📊 Dashboard and analytics queries optimized';
    RAISE NOTICE '🔒 Advanced constraints added: %', constraint_count;
    RAISE NOTICE '📈 Table statistics updated for query planner';
    RAISE NOTICE '🎯 Ready for Row Level Security (03_rls_policies.sql)';
END $$;

-- ====================================================
-- PERFORMANCE TIPS
-- ====================================================

/*
Performance Tips for Developers:

1. USE THESE INDEXES IN QUERIES:
   - Filter by status: WHERE deleted_at IS NULL AND status = 'pending'
   - Full-text search: WHERE to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('search term')
   - Fuzzy search: WHERE customer_name % 'search term'
   - Date ranges: WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'

2. AVOID THESE PATTERNS:
   - Leading wildcards: WHERE title LIKE '%something'
   - OR conditions on different columns: WHERE title = 'x' OR description = 'y'
   - Functions on indexed columns: WHERE UPPER(status) = 'PENDING'

3. MONITOR INDEX USAGE:
   - SELECT * FROM v_index_usage;
   - SELECT * FROM v_unused_indexes;
*/

-- ====================================================
-- ROLLBACK PROCEDURES (for development/testing)
-- ====================================================

/*
-- Uncomment and run these commands to rollback indexes:

-- Drop monitoring views
DROP VIEW IF EXISTS v_index_usage;
DROP VIEW IF EXISTS v_unused_indexes;

-- Drop all custom indexes (keep primary keys and unique constraints)
DROP INDEX IF EXISTS idx_tasks_fulltext_search;
DROP INDEX IF EXISTS idx_tasks_customer_name_trgm;
DROP INDEX IF EXISTS idx_tasks_phone_trgm;
DROP INDEX IF EXISTS idx_tasks_location_trgm;
DROP INDEX IF EXISTS idx_tasks_status_priority;
DROP INDEX IF EXISTS idx_tasks_created_status;
DROP INDEX IF EXISTS idx_tasks_due_date;
DROP INDEX IF EXISTS idx_tasks_assigned;
DROP INDEX IF EXISTS idx_tasks_source_created;
DROP INDEX IF EXISTS idx_tasks_location_status;
DROP INDEX IF EXISTS idx_tasks_dashboard_filter;
DROP INDEX IF EXISTS idx_tasks_customer_history;
DROP INDEX IF EXISTS idx_tasks_analytics;
DROP INDEX IF EXISTS idx_tasks_urgent;
DROP INDEX IF EXISTS idx_tasks_metadata;
DROP INDEX IF EXISTS idx_tasks_chat_context;
DROP INDEX IF EXISTS idx_tasks_urgency_keywords;
DROP INDEX IF EXISTS idx_audit_log_task_id_date;
DROP INDEX IF EXISTS idx_audit_log_action_date;
DROP INDEX IF EXISTS idx_audit_log_changed_by;
DROP INDEX IF EXISTS idx_comments_task_created;
DROP INDEX IF EXISTS idx_comments_public;
DROP INDEX IF EXISTS idx_comments_fulltext;
DROP INDEX IF EXISTS idx_attachments_task_created;
DROP INDEX IF EXISTS idx_attachments_mime_type;
DROP INDEX IF EXISTS idx_attachments_images;
DROP INDEX IF EXISTS idx_attachments_public;
DROP INDEX IF EXISTS idx_tasks_active_high_priority;
DROP INDEX IF EXISTS idx_tasks_overdue;
DROP INDEX IF EXISTS idx_tasks_today;
DROP INDEX IF EXISTS idx_tasks_failed_calls;

-- Drop constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS check_completed_timestamp;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS check_completion_not_future;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS check_assignment_timestamp;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS check_phone_format;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS check_urgent_has_due_date;
*/