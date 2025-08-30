-- Check if columns exist first
DO $$
BEGIN
    -- Add defaults if columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status') THEN
        ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'open';
        UPDATE tasks SET status = 'open' WHERE status IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'priority') THEN
        ALTER TABLE tasks ALTER COLUMN priority SET DEFAULT 'medium';
        UPDATE tasks SET priority = 'medium' WHERE priority IS NULL;
    END IF;
END $$;

-- Verify the changes
SELECT column_name, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name IN ('status', 'priority');
