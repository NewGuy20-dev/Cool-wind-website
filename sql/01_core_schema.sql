-- ====================================================
-- 01_core_schema.sql  
-- Core Database Schema for Task Management System
-- ====================================================
-- Purpose: Create main tables and relationships for task management
-- Dependencies: 00_database_setup.sql (custom types and functions)
-- Execution Time: ~1 minute
-- Author: Migration Script
-- Created: 2024

-- ====================================================
-- MAIN TASKS TABLE
-- ====================================================

CREATE TABLE IF NOT EXISTS tasks (
    -- Primary identifiers
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_number TEXT UNIQUE NOT NULL DEFAULT generate_task_id(),
    
    -- Customer information
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    location VARCHAR(255),
    
    -- Task details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    problem_description TEXT NOT NULL,
    
    -- Classification
    status task_status DEFAULT 'pending' NOT NULL,
    priority task_priority DEFAULT 'medium' NOT NULL,
    category VARCHAR(100),
    source task_source DEFAULT 'chat-failed-call' NOT NULL,
    
    -- Time tracking
    estimated_duration INTERVAL,
    actual_duration INTERVAL,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Assignment (for future user system)
    assigned_to UUID,
    assigned_at TIMESTAMPTZ,
    
    -- AI and automation
    ai_priority_reason TEXT,
    urgency_keywords TEXT[],
    
    -- Audit and metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ, -- Soft delete
    
    -- Additional context (flexible JSON storage)
    metadata JSONB DEFAULT '{}',
    chat_context JSONB,
    
    -- Constraints
    CONSTRAINT valid_phone_number CHECK (validate_phone_number(phone_number)),
    CONSTRAINT title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT customer_name_not_empty CHECK (LENGTH(TRIM(customer_name)) > 0),
    CONSTRAINT problem_description_not_empty CHECK (LENGTH(TRIM(problem_description)) > 0),
    CONSTRAINT completed_at_valid CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR 
        (status != 'completed' AND completed_at IS NULL)
    ),
    CONSTRAINT due_date_future CHECK (due_date IS NULL OR due_date > created_at),
    CONSTRAINT duration_positive CHECK (
        estimated_duration IS NULL OR estimated_duration > INTERVAL '0 seconds'
    ),
    CONSTRAINT actual_duration_positive CHECK (
        actual_duration IS NULL OR actual_duration > INTERVAL '0 seconds'
    )
);

-- ====================================================
-- TASK AUDIT LOG TABLE (Change Tracking)
-- ====================================================

CREATE TABLE IF NOT EXISTS task_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'status_changed'
    
    -- What changed
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Who made the change
    changed_by UUID,
    change_source VARCHAR(100), -- 'admin_dashboard', 'api', 'system', 'webhook'
    
    -- When
    changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Additional context
    reason TEXT,
    metadata JSONB DEFAULT '{}'
);

-- ====================================================
-- TASK COMMENTS/NOTES TABLE
-- ====================================================

CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    
    -- Comment content
    comment TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'general', -- 'general', 'status_update', 'internal', 'customer_communication'
    
    -- Author info
    author_id UUID,
    author_name VARCHAR(255),
    author_type VARCHAR(50) DEFAULT 'admin', -- 'admin', 'system', 'customer', 'technician'
    
    -- Visibility
    is_internal BOOLEAN DEFAULT false,
    is_customer_visible BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT comment_not_empty CHECK (LENGTH(TRIM(comment)) > 0),
    CONSTRAINT author_info_present CHECK (author_id IS NOT NULL OR author_name IS NOT NULL)
);

-- ====================================================
-- TASK ATTACHMENTS TABLE (for future file uploads)
-- ====================================================

CREATE TABLE IF NOT EXISTS task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    
    -- File information
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Storage information
    storage_path TEXT NOT NULL,
    storage_provider VARCHAR(50) DEFAULT 'supabase', -- 'supabase', 's3', 'local'
    
    -- File metadata
    file_hash VARCHAR(128), -- For deduplication
    is_image BOOLEAN DEFAULT false,
    image_dimensions VARCHAR(20), -- '1920x1080'
    
    -- Access control
    is_public BOOLEAN DEFAULT false,
    uploaded_by UUID,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT file_size_positive CHECK (file_size > 0),
    CONSTRAINT filename_not_empty CHECK (LENGTH(TRIM(filename)) > 0)
);

-- ====================================================
-- FOREIGN KEY RELATIONSHIPS
-- ====================================================

-- Task audit log references tasks
ALTER TABLE task_audit_log 
ADD CONSTRAINT fk_task_audit_log_task_id 
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- Task comments reference tasks
ALTER TABLE task_comments 
ADD CONSTRAINT fk_task_comments_task_id 
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- Task attachments reference tasks  
ALTER TABLE task_attachments 
ADD CONSTRAINT fk_task_attachments_task_id 
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- ====================================================
-- BASIC INDEXES (more comprehensive indexes in 02_indexes_constraints.sql)
-- ====================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_phone_number ON tasks(phone_number);

-- Soft delete index
CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks(id) WHERE deleted_at IS NULL;

-- Task numbers for quick lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_task_number ON tasks(task_number);

-- ====================================================
-- AUTOMATIC TRIGGERS
-- ====================================================

-- Auto-update timestamps on tasks table
CREATE TRIGGER trigger_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update timestamps on task_comments table
CREATE TRIGGER trigger_task_comments_updated_at
    BEFORE UPDATE ON task_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================
-- VERIFICATION QUERIES
-- ====================================================

-- Verify all tables are created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tasks', 'task_audit_log', 'task_comments', 'task_attachments')
ORDER BY table_name;

-- Verify constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public' 
AND tc.table_name IN ('tasks', 'task_audit_log', 'task_comments', 'task_attachments')
ORDER BY tc.table_name, tc.constraint_type;

-- Verify indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('tasks', 'task_audit_log', 'task_comments', 'task_attachments')
ORDER BY tablename, indexname;

-- Count columns in main tasks table
SELECT COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'tasks';

-- ====================================================
-- SUCCESS MESSAGE
-- ====================================================

DO $$
DECLARE
    task_columns INTEGER;
    audit_columns INTEGER;
    comment_columns INTEGER;
    attachment_columns INTEGER;
BEGIN
    SELECT COUNT(*) INTO task_columns FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tasks';
    
    SELECT COUNT(*) INTO audit_columns FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'task_audit_log';
    
    SELECT COUNT(*) INTO comment_columns FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'task_comments';
    
    SELECT COUNT(*) INTO attachment_columns FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'task_attachments';
    
    RAISE NOTICE '✅ Core schema created successfully!';
    RAISE NOTICE '📊 Tasks table: % columns created', task_columns;
    RAISE NOTICE '🔍 Task audit log: % columns created', audit_columns;
    RAISE NOTICE '💬 Task comments: % columns created', comment_columns;
    RAISE NOTICE '📎 Task attachments: % columns created', attachment_columns;
    RAISE NOTICE '🔗 Foreign key relationships established';
    RAISE NOTICE '⚡ Basic indexes and triggers active';
    RAISE NOTICE '🎯 Ready for indexes and constraints (02_indexes_constraints.sql)';
END $$;

-- ====================================================
-- ROLLBACK PROCEDURES (for development/testing)
-- ====================================================

/*
-- Uncomment and run these commands to rollback this schema:

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS trigger_task_comments_updated_at ON task_comments;

-- Drop tables (cascade will drop foreign keys)
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS task_audit_log CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- Note: This will delete ALL task data. Use with extreme caution!
*/