-- ====================================================
-- 99_future_migrations.sql
-- Template and Guide for Future Database Migrations
-- ====================================================
-- Purpose: Provide templates and best practices for future schema changes
-- Dependencies: None (reference and template file)
-- Execution Time: N/A (reference only)
-- Author: Migration Script
-- Created: 2024
-- NOTE: This file is for reference only - do not execute in production

-- ====================================================
-- MIGRATION BEST PRACTICES
-- ====================================================

/*
IMPORTANT MIGRATION PRINCIPLES:

1. ALWAYS BACKUP BEFORE MIGRATIONS
   - Full database backup before any schema changes
   - Test migrations on staging environment first
   - Have rollback plan ready

2. INCREMENTAL CHANGES
   - Break large migrations into smaller steps
   - Each migration should be atomic (all or nothing)
   - Version your migrations with timestamps

3. ZERO-DOWNTIME MIGRATIONS
   - Use CREATE INDEX CONCURRENTLY for new indexes
   - Add columns with DEFAULT values
   - Drop constraints before dropping columns
   - Use views to maintain API compatibility during transitions

4. ROLLBACK SAFETY
   - Every migration should have a rollback script
   - Test rollback procedures
   - Consider forward-compatible changes when possible

5. DATA SAFETY
   - Never drop columns immediately - use soft deprecation
   - Migrate data before changing constraints
   - Validate data integrity after migrations
*/

-- ====================================================
-- MIGRATION TEMPLATE
-- ====================================================

/*
-- ====================================================
-- Migration: YYYY-MM-DD-description
-- Version: X.X.X
-- Description: Brief description of what this migration does
-- ====================================================
-- Dependencies: List any required previous migrations
-- Execution Time: Estimated time
-- Impact: Description of potential downtime or performance impact
-- Rollback: Reference to rollback procedure

-- Pre-migration checks
DO $$
BEGIN
    -- Check prerequisites
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'required_table') THEN
        RAISE EXCEPTION 'Prerequisites not met: required_table does not exist';
    END IF;
    
    -- Check for conflicting data
    IF EXISTS (SELECT 1 FROM tasks WHERE some_condition) THEN
        RAISE EXCEPTION 'Data conflict detected: resolve before migration';
    END IF;
    
    RAISE NOTICE 'Pre-migration checks passed';
END $$;

-- Begin transaction for atomic migration
BEGIN;

-- Migration steps
-- Step 1: Add new column with default
ALTER TABLE tasks ADD COLUMN new_column VARCHAR(100) DEFAULT 'default_value';

-- Step 2: Create new index concurrently (run outside transaction)
-- CREATE INDEX CONCURRENTLY idx_tasks_new_column ON tasks(new_column);

-- Step 3: Update existing data
UPDATE tasks SET new_column = 'updated_value' WHERE some_condition;

-- Step 4: Add constraints
ALTER TABLE tasks ADD CONSTRAINT check_new_column CHECK (new_column IS NOT NULL);

-- Post-migration verification
DO $$
DECLARE
    affected_rows INTEGER;
BEGIN
    SELECT COUNT(*) INTO affected_rows FROM tasks WHERE new_column = 'updated_value';
    
    IF affected_rows < expected_count THEN
        RAISE EXCEPTION 'Migration verification failed: expected % rows, got %', expected_count, affected_rows;
    END IF;
    
    RAISE NOTICE 'Migration verification passed: % rows affected', affected_rows;
END $$;

-- Commit transaction
COMMIT;

-- Success message
RAISE NOTICE 'Migration YYYY-MM-DD-description completed successfully';

-- ====================================================
-- ROLLBACK SCRIPT
-- ====================================================

/*
-- Rollback for Migration: YYYY-MM-DD-description
BEGIN;

-- Reverse migration steps in opposite order
-- Step 4 rollback: Remove constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS check_new_column;

-- Step 3 rollback: Revert data (if applicable)
-- UPDATE tasks SET new_column = NULL WHERE some_condition;

-- Step 2 rollback: Drop index
-- DROP INDEX IF EXISTS idx_tasks_new_column;

-- Step 1 rollback: Remove column
ALTER TABLE tasks DROP COLUMN IF EXISTS new_column;

COMMIT;

RAISE NOTICE 'Rollback for YYYY-MM-DD-description completed';
*/

-- ====================================================
-- COMMON MIGRATION SCENARIOS
-- ====================================================

-- SCENARIO 1: Adding a new column
/*
-- Add column with default value
ALTER TABLE tasks ADD COLUMN priority_score INTEGER DEFAULT 0;

-- Update existing records
UPDATE tasks SET priority_score = 
    CASE priority
        WHEN 'urgent' THEN 4
        WHEN 'high' THEN 3
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 1
    END;

-- Add constraint after data is populated
ALTER TABLE tasks ADD CONSTRAINT check_priority_score 
CHECK (priority_score BETWEEN 1 AND 4);

-- Create index
CREATE INDEX CONCURRENTLY idx_tasks_priority_score ON tasks(priority_score);
*/

-- SCENARIO 2: Modifying existing column
/*
-- Step 1: Add new column
ALTER TABLE tasks ADD COLUMN customer_name_new VARCHAR(500);

-- Step 2: Copy data with transformation
UPDATE tasks SET customer_name_new = UPPER(TRIM(customer_name));

-- Step 3: Add constraint
ALTER TABLE tasks ADD CONSTRAINT check_customer_name_new_length 
CHECK (LENGTH(customer_name_new) >= 2);

-- Step 4: Update views and functions to use new column
-- (Update application code to use customer_name_new)

-- Step 5: After verification, drop old column and rename
-- ALTER TABLE tasks DROP COLUMN customer_name;
-- ALTER TABLE tasks RENAME COLUMN customer_name_new TO customer_name;
*/

-- SCENARIO 3: Adding new table with relationships
/*
-- Create new table
CREATE TABLE task_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color_code VARCHAR(7), -- hex color
    icon_name VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_task_categories_active ON task_categories(is_active, name);

-- Add foreign key to existing table
ALTER TABLE tasks ADD COLUMN category_id UUID;
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_category_id 
FOREIGN KEY (category_id) REFERENCES task_categories(id);

-- Create index on foreign key
CREATE INDEX idx_tasks_category_id ON tasks(category_id);

-- Insert default categories
INSERT INTO task_categories (name, description, color_code) VALUES
('Air Conditioning', 'AC related services', '#3B82F6'),
('Refrigerator', 'Refrigerator repairs and maintenance', '#10B981'),
('Washing Machine', 'Washing machine services', '#8B5CF6'),
('General Appliance', 'Other home appliances', '#6B7280');

-- Update existing tasks with categories
UPDATE tasks SET category_id = (
    SELECT id FROM task_categories 
    WHERE name = 'Air Conditioning'
) WHERE problem_description ILIKE '%ac%' OR problem_description ILIKE '%air cond%';

-- Add trigger for updated_at
CREATE TRIGGER trigger_task_categories_updated_at
    BEFORE UPDATE ON task_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
*/

-- SCENARIO 4: Splitting table (normalization)
/*
-- Create new normalized table
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    preferred_contact_method VARCHAR(20) DEFAULT 'phone',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_customer_profiles_phone ON customer_profiles(phone_number);
CREATE INDEX idx_customer_profiles_location ON customer_profiles(location);

-- Migrate data from tasks table
INSERT INTO customer_profiles (phone_number, name, location)
SELECT DISTINCT phone_number, customer_name, location
FROM tasks 
WHERE phone_number IS NOT NULL AND customer_name IS NOT NULL
ON CONFLICT (phone_number) DO NOTHING;

-- Add foreign key to tasks table
ALTER TABLE tasks ADD COLUMN customer_profile_id UUID;

-- Update tasks with customer profile references
UPDATE tasks SET customer_profile_id = cp.id
FROM customer_profiles cp
WHERE tasks.phone_number = cp.phone_number;

-- Add foreign key constraint
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_customer_profile_id 
FOREIGN KEY (customer_profile_id) REFERENCES customer_profiles(id);

-- Create view to maintain backwards compatibility
CREATE VIEW v_tasks_with_customer AS
SELECT 
    t.*,
    cp.name as customer_name,
    cp.location as customer_location,
    cp.preferred_contact_method
FROM tasks t
LEFT JOIN customer_profiles cp ON t.customer_profile_id = cp.id;
*/

-- SCENARIO 5: Index optimization migration
/*
-- Drop unused indexes
DROP INDEX IF EXISTS idx_old_unused_index;

-- Create new optimized indexes
CREATE INDEX CONCURRENTLY idx_tasks_compound_optimized 
ON tasks(status, priority, created_at DESC) 
WHERE deleted_at IS NULL;

-- Create partial indexes for common queries
CREATE INDEX CONCURRENTLY idx_tasks_urgent_active 
ON tasks(created_at DESC) 
WHERE status IN ('pending', 'in_progress') AND priority = 'urgent' AND deleted_at IS NULL;

-- Update statistics
ANALYZE tasks;
*/

-- ====================================================
-- DATA MIGRATION TEMPLATES
-- ====================================================

-- TEMPLATE: Bulk data update with progress tracking
/*
DO $$
DECLARE
    batch_size INTEGER := 1000;
    total_records INTEGER;
    processed INTEGER := 0;
    batch_start INTEGER := 0;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO total_records FROM tasks WHERE condition_to_update;
    
    RAISE NOTICE 'Starting bulk update of % records', total_records;
    
    -- Process in batches
    WHILE batch_start < total_records LOOP
        UPDATE tasks 
        SET some_column = new_value
        WHERE id IN (
            SELECT id FROM tasks 
            WHERE condition_to_update
            ORDER BY id 
            LIMIT batch_size 
            OFFSET batch_start
        );
        
        GET DIAGNOSTICS processed = ROW_COUNT;
        batch_start := batch_start + batch_size;
        
        RAISE NOTICE 'Processed % of % records (%.1f%%)', 
            LEAST(batch_start, total_records), 
            total_records, 
            (LEAST(batch_start, total_records)::NUMERIC / total_records) * 100;
        
        -- Small delay to reduce load
        PERFORM pg_sleep(0.1);
    END LOOP;
    
    RAISE NOTICE 'Bulk update completed';
END $$;
*/

-- ====================================================
-- PERFORMANCE IMPACT ASSESSMENT
-- ====================================================

-- Function to estimate migration impact
/*
CREATE OR REPLACE FUNCTION estimate_migration_impact(
    table_name TEXT,
    operation TEXT
)
RETURNS TABLE(
    estimated_time INTERVAL,
    estimated_size BIGINT,
    recommended_maintenance_window BOOLEAN
) AS $$
DECLARE
    table_size BIGINT;
    row_count BIGINT;
BEGIN
    -- Get table statistics
    SELECT 
        pg_total_relation_size(table_name::regclass),
        n_tup_ins + n_tup_upd + n_tup_del
    INTO table_size, row_count
    FROM pg_stat_user_tables 
    WHERE relname = table_name;
    
    RETURN QUERY
    SELECT 
        CASE operation
            WHEN 'ADD_COLUMN' THEN INTERVAL '1 second' * (row_count / 10000)
            WHEN 'CREATE_INDEX' THEN INTERVAL '1 minute' * (row_count / 100000)
            WHEN 'UPDATE_ALL' THEN INTERVAL '1 minute' * (row_count / 10000)
            ELSE INTERVAL '0'
        END as estimated_time,
        table_size,
        CASE 
            WHEN row_count > 1000000 OR table_size > 1073741824 THEN true  -- > 1M rows or 1GB
            ELSE false
        END as recommended_maintenance_window;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT * FROM estimate_migration_impact('tasks', 'CREATE_INDEX');
*/

-- ====================================================
-- MIGRATION TESTING TEMPLATE
-- ====================================================

/*
-- Create test environment for migration validation
CREATE SCHEMA IF NOT EXISTS migration_test;

-- Copy production structure to test schema
CREATE TABLE migration_test.tasks (LIKE tasks INCLUDING ALL);
CREATE TABLE migration_test.task_comments (LIKE task_comments INCLUDING ALL);

-- Copy sample data for testing
INSERT INTO migration_test.tasks 
SELECT * FROM tasks LIMIT 1000;

-- Run migration on test data
-- ... migration steps ...

-- Validate results
DO $$
DECLARE
    original_count INTEGER;
    migrated_count INTEGER;
    integrity_check BOOLEAN;
BEGIN
    -- Compare counts
    SELECT COUNT(*) INTO original_count FROM tasks LIMIT 1000;
    SELECT COUNT(*) INTO migrated_count FROM migration_test.tasks;
    
    IF original_count != migrated_count THEN
        RAISE EXCEPTION 'Data count mismatch: original %, migrated %', original_count, migrated_count;
    END IF;
    
    -- Check data integrity
    SELECT bool_and(validation_condition) INTO integrity_check 
    FROM migration_test.tasks;
    
    IF NOT integrity_check THEN
        RAISE EXCEPTION 'Data integrity check failed';
    END IF;
    
    RAISE NOTICE 'Migration test passed: % records validated', migrated_count;
END $$;

-- Clean up test schema
DROP SCHEMA migration_test CASCADE;
*/

-- ====================================================
-- EMERGENCY ROLLBACK PROCEDURES
-- ====================================================

/*
-- Emergency rollback template for critical situations

-- 1. IMMEDIATE ROLLBACK (if migration is still in progress)
ROLLBACK;  -- If within transaction

-- 2. POINT-IN-TIME RECOVERY (if data corruption occurred)
-- This requires database-level restore from backup
-- Contact database administrator immediately

-- 3. SCHEMA-LEVEL ROLLBACK (if schema changes need reversal)
BEGIN;

-- Disable triggers to prevent cascading issues
SET session_replication_role = replica;

-- Restore previous schema (run rollback commands)
-- ... specific rollback steps ...

-- Re-enable triggers
SET session_replication_role = DEFAULT;

COMMIT;

-- 4. DATA-LEVEL ROLLBACK (if data needs correction)
BEGIN;

-- Create backup of current state
CREATE TABLE rollback_backup_YYYYMMDD AS 
SELECT * FROM affected_table;

-- Restore from backup or reverse data changes
-- ... data restoration steps ...

COMMIT;

-- 5. VERIFICATION AFTER ROLLBACK
SELECT 'Rollback verification' as status, COUNT(*) as record_count 
FROM tasks WHERE validation_condition;
*/

-- ====================================================
-- DOCUMENTATION TEMPLATE
-- ====================================================

/*
MIGRATION DOCUMENTATION TEMPLATE:

Migration ID: YYYY-MM-DD-HH-MM-description
Date: YYYY-MM-DD
Author: [Name]
Reviewer: [Name]
Environment: [Development/Staging/Production]

PURPOSE:
Brief description of why this migration is needed.

CHANGES:
- List of schema changes
- List of data changes
- List of index changes

DEPENDENCIES:
- Previous migrations required
- Application code changes required
- External system dependencies

TESTING:
- Test cases executed
- Performance testing results
- Rollback testing results

DEPLOYMENT:
- Deployment steps
- Maintenance window required: [Yes/No]
- Expected downtime: [Duration]

ROLLBACK:
- Rollback procedure documented
- Rollback tested: [Yes/No]
- Recovery time objective: [Duration]

RISKS:
- Identified risks
- Mitigation strategies
- Contingency plans

POST-DEPLOYMENT:
- Verification steps
- Monitoring requirements
- Performance benchmarks
*/

-- ====================================================
-- VERSION CONTROL INTEGRATION
-- ====================================================

/*
Recommended file naming convention for migrations:
migrations/
├── v001_2024-01-15_initial_schema.sql
├── v002_2024-01-20_add_priority_scoring.sql
├── v003_2024-01-25_customer_normalization.sql
└── rollbacks/
    ├── v001_rollback.sql
    ├── v002_rollback.sql
    └── v003_rollback.sql

Each migration file should include:
1. Version number
2. Date
3. Descriptive name
4. Complete migration steps
5. Rollback instructions
6. Verification queries

Track applied migrations in database:
CREATE TABLE schema_migrations (
    version VARCHAR(10) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    applied_by VARCHAR(100),
    rollback_instructions TEXT
);
*/

-- ====================================================
-- FINAL NOTES
-- ====================================================

/*
REMEMBER:
1. Test migrations thoroughly in development
2. Have rollback plan ready before execution
3. Monitor system performance during and after migration
4. Document all changes and decisions
5. Communicate with stakeholders about maintenance windows
6. Keep backups for at least 30 days after migration
7. Review and optimize queries after schema changes
8. Update application documentation after successful migration

TOOLS FOR MIGRATION ASSISTANCE:
- pgbench for performance testing
- pg_stat_statements for query analysis
- pg_stat_user_tables for table statistics
- EXPLAIN ANALYZE for query planning
- Supabase Dashboard for monitoring
*/

-- This file serves as a reference for future migrations
-- Do not execute this file directly in any environment