-- Migration: 010_create_tasks_schema
-- Author: Cascade Assistant
-- Date: 2025-09-26
-- Purpose: Create core task management tables, types, and supporting functions
-- Note: Do not wrap in explicit BEGIN/COMMIT so extensions can be created successfully

-- Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create enums if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM (
            'pending',
            'in_progress',
            'completed',
            'cancelled'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM (
            'low',
            'medium',
            'high',
            'urgent'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_source') THEN
        CREATE TYPE task_source AS ENUM (
            'chat-failed-call',
            'admin-manual',
            'api-direct',
            'webhook',
            'email',
            'phone'
        );
    END IF;
END $$;

-- Utility functions
CREATE OR REPLACE FUNCTION generate_task_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'TASK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
           UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_phone_number(phone_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    phone_input := regexp_replace(phone_input, '[^0-9]', '', 'g');
    RETURN phone_input ~ '^[6-9][0-9]{9}$';
END;
$$ LANGUAGE plpgsql;

-- Main tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_number TEXT UNIQUE NOT NULL DEFAULT generate_task_id(),
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    location VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    problem_description TEXT NOT NULL,
    status task_status NOT NULL DEFAULT 'pending',
    priority task_priority NOT NULL DEFAULT 'medium',
    category VARCHAR(100),
    source task_source NOT NULL DEFAULT 'chat-failed-call',
    estimated_duration INTERVAL,
    actual_duration INTERVAL,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    assigned_to UUID,
    assigned_at TIMESTAMPTZ,
    ai_priority_reason TEXT,
    urgency_keywords TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}',
    chat_context JSONB,
    CONSTRAINT valid_phone_number CHECK (validate_phone_number(phone_number)),
    CONSTRAINT title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT customer_name_not_empty CHECK (LENGTH(TRIM(customer_name)) > 0),
    CONSTRAINT problem_description_not_empty CHECK (LENGTH(TRIM(problem_description)) > 0),
    CONSTRAINT completed_at_valid CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR
        (status <> 'completed' AND completed_at IS NULL)
    ),
    CONSTRAINT due_date_future CHECK (due_date IS NULL OR due_date > created_at),
    CONSTRAINT estimated_duration_positive CHECK (
        estimated_duration IS NULL OR estimated_duration > INTERVAL '0 seconds'
    ),
    CONSTRAINT actual_duration_positive CHECK (
        actual_duration IS NULL OR actual_duration > INTERVAL '0 seconds'
    )
);

-- Audit log table
CREATE TABLE IF NOT EXISTS task_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    changed_by UUID,
    change_source VARCHAR(100),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'
);

-- Comments table
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    comment TEXT NOT NULL,
    comment_type VARCHAR(50) NOT NULL DEFAULT 'general',
    author_id UUID,
    author_name VARCHAR(255),
    author_type VARCHAR(50) NOT NULL DEFAULT 'admin',
    is_internal BOOLEAN NOT NULL DEFAULT false,
    is_customer_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}',
    CONSTRAINT comment_not_empty CHECK (LENGTH(TRIM(comment)) > 0),
    CONSTRAINT author_info_present CHECK (author_id IS NOT NULL OR author_name IS NOT NULL)
);

-- Attachments table
CREATE TABLE IF NOT EXISTS task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    storage_provider VARCHAR(50) NOT NULL DEFAULT 'supabase',
    file_hash VARCHAR(128),
    is_image BOOLEAN NOT NULL DEFAULT false,
    image_dimensions VARCHAR(20),
    is_public BOOLEAN NOT NULL DEFAULT false,
    uploaded_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}',
    CONSTRAINT file_size_positive CHECK (file_size > 0),
    CONSTRAINT filename_not_empty CHECK (LENGTH(TRIM(filename)) > 0)
);

-- Foreign keys (use DO blocks because ADD CONSTRAINT ... IF NOT EXISTS is unsupported)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_constraint
        WHERE  conname = 'fk_task_audit_log_task_id'
    ) THEN
        ALTER TABLE task_audit_log
            ADD CONSTRAINT fk_task_audit_log_task_id
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_constraint
        WHERE  conname = 'fk_task_comments_task_id'
    ) THEN
        ALTER TABLE task_comments
            ADD CONSTRAINT fk_task_comments_task_id
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_constraint
        WHERE  conname = 'fk_task_attachments_task_id'
    ) THEN
        ALTER TABLE task_attachments
            ADD CONSTRAINT fk_task_attachments_task_id
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_phone_number ON tasks(phone_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_task_number ON tasks(task_number);
CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks(id) WHERE deleted_at IS NULL;

-- Triggers to maintain updated_at fields (IF NOT EXISTS not available until PG 14)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_tasks_updated_at'
    ) THEN
        CREATE TRIGGER trigger_tasks_updated_at
            BEFORE UPDATE ON tasks
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_task_comments_updated_at'
    ) THEN
        CREATE TRIGGER trigger_task_comments_updated_at
            BEFORE UPDATE ON task_comments
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
