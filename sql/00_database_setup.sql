-- ====================================================
-- 00_database_setup.sql
-- Initial Database Configuration for Task Management System
-- ====================================================
-- Purpose: Set up essential extensions and basic database configuration
-- Dependencies: None (run first)
-- Execution Time: ~30 seconds
-- Author: Migration Script
-- Created: 2024

-- ====================================================
-- EXTENSIONS SETUP
-- ====================================================

-- UUID generation for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search capabilities
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Advanced indexing (if available)
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- JSON operations enhancement
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ====================================================
-- BASIC SECURITY CONFIGURATION
-- ====================================================

-- Enable Row Level Security by default for new tables
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Set timezone to UTC for consistency
SET timezone = 'UTC';

-- ====================================================
-- CUSTOM TYPES AND ENUMS
-- ====================================================

-- Task Status Enum
CREATE TYPE task_status AS ENUM (
    'pending',
    'in_progress', 
    'completed',
    'cancelled'
);

-- Task Priority Enum  
CREATE TYPE task_priority AS ENUM (
    'low',
    'medium', 
    'high',
    'urgent'
);

-- Task Source Enum (where task originated)
CREATE TYPE task_source AS ENUM (
    'chat-failed-call',
    'admin-manual',
    'api-direct',
    'webhook',
    'email',
    'phone'
);

-- ====================================================
-- UTILITY FUNCTIONS
-- ====================================================

-- Function to generate readable task IDs
CREATE OR REPLACE FUNCTION generate_task_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'TASK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
           UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate phone numbers (Indian format)
CREATE OR REPLACE FUNCTION validate_phone_number(phone_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Remove all non-digits
    phone_input := regexp_replace(phone_input, '[^0-9]', '', 'g');
    
    -- Check if it's a valid 10-digit Indian mobile number
    RETURN phone_input ~ '^[6-9][0-9]{9}$';
END;
$$ LANGUAGE plpgsql;

-- ====================================================
-- DATABASE CONFIGURATION
-- ====================================================

-- Set default search path
SET search_path TO public;

-- Configure statement timeout (5 minutes)
SET statement_timeout = '5min';

-- Configure lock timeout (30 seconds)  
SET lock_timeout = '30s';

-- ====================================================
-- PERFORMANCE CONFIGURATION
-- ====================================================

-- Increase work memory for complex queries
SET work_mem = '64MB';

-- Set effective cache size
SET effective_cache_size = '1GB';

-- Random page cost for SSD
SET random_page_cost = 1.1;

-- ====================================================
-- LOGGING CONFIGURATION
-- ====================================================

-- Log slow queries (anything over 1 second)
SET log_min_duration_statement = 1000;

-- Log statement statistics
SET log_statement_stats = on;

-- ====================================================
-- VERIFICATION QUERIES
-- ====================================================

-- Verify extensions are installed
SELECT 
    extname as "Extension Name",
    extversion as "Version"
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pg_trgm', 'btree_gin', 'pg_stat_statements')
ORDER BY extname;

-- Verify custom types are created
SELECT 
    typname as "Custom Type",
    typtype as "Type Category"
FROM pg_type 
WHERE typname IN ('task_status', 'task_priority', 'task_source')
ORDER BY typname;

-- Verify utility functions are created
SELECT 
    proname as "Function Name",
    pronargs as "Argument Count"
FROM pg_proc 
WHERE proname IN ('generate_task_id', 'update_updated_at_column', 'validate_phone_number')
ORDER BY proname;

-- ====================================================
-- SUCCESS MESSAGE
-- ====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database setup completed successfully!';
    RAISE NOTICE '📋 Extensions installed: uuid-ossp, pg_trgm, btree_gin, pg_stat_statements';
    RAISE NOTICE '🔧 Custom types created: task_status, task_priority, task_source';  
    RAISE NOTICE '⚡ Utility functions ready: generate_task_id(), update_updated_at_column(), validate_phone_number()';
    RAISE NOTICE '🎯 Ready for core schema creation (01_core_schema.sql)';
END $$;

-- ====================================================
-- ROLLBACK PROCEDURES (for development/testing)
-- ====================================================

/*
-- Uncomment and run these commands to rollback this setup:

-- Drop custom functions
DROP FUNCTION IF EXISTS generate_task_id();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS validate_phone_number();

-- Drop custom types
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE; 
DROP TYPE IF EXISTS task_source CASCADE;

-- Drop extensions (be careful in shared environments)
-- DROP EXTENSION IF EXISTS "pg_stat_statements";
-- DROP EXTENSION IF EXISTS "btree_gin";
-- DROP EXTENSION IF EXISTS "pg_trgm";
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- Reset configuration
RESET ALL;
*/