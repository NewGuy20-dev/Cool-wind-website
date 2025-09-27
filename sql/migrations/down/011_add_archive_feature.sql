-- ====================================================
-- ROLLBACK: 011_add_archive_feature.sql
-- Remove archive functionality from tasks
-- ====================================================
-- Purpose: Rollback archive feature migration
-- Author: Migration Script
-- Created: 2025-09-27

-- ====================================================
-- DROP ARCHIVE HELPER FUNCTIONS
-- ====================================================

DROP FUNCTION IF EXISTS archive_task(UUID);
DROP FUNCTION IF EXISTS unarchive_task(UUID);

-- ====================================================
-- DROP ARCHIVE VIEWS
-- ====================================================

DROP VIEW IF EXISTS active_tasks;
DROP VIEW IF EXISTS archived_tasks;

-- ====================================================
-- DROP ARCHIVE INDEXES
-- ====================================================

DROP INDEX IF EXISTS idx_tasks_archived;
DROP INDEX IF EXISTS idx_tasks_archived_status;
DROP INDEX IF EXISTS idx_tasks_archived_created;

-- ====================================================
-- DROP ARCHIVE CONSTRAINTS
-- ====================================================

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS check_archived_status;

-- ====================================================
-- REMOVE ARCHIVE COLUMN
-- ====================================================

ALTER TABLE tasks DROP COLUMN IF EXISTS archived;

-- ====================================================
-- SUCCESS MESSAGE
-- ====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Archive feature rollback completed successfully!';
    RAISE NOTICE '❌ Archive column removed from tasks table';
    RAISE NOTICE '❌ Archive indexes dropped';
    RAISE NOTICE '❌ Archive functions dropped';
    RAISE NOTICE '❌ Archive views dropped';
    RAISE NOTICE '❌ Archive constraints removed';
    RAISE NOTICE '⚠️ All archive data has been permanently lost!';
END $$;
