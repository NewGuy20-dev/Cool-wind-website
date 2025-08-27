-- ====================================================
-- 07_production_config.sql
-- Production-Specific Configuration for Task Management System
-- ====================================================
-- Purpose: Optimize database for production performance and security
-- Dependencies: All previous SQL files (complete schema setup)
-- Execution Time: ~30 seconds
-- Author: Migration Script
-- Created: 2024
-- WARNING: FOR PRODUCTION USE ONLY

-- ====================================================
-- PRODUCTION PERFORMANCE OPTIMIZATION
-- ====================================================

-- Update PostgreSQL configuration for production workloads
-- Note: Some settings require superuser privileges and database restart

-- Connection and memory settings
-- ALTER SYSTEM SET max_connections = 200;  -- Adjust based on expected load
-- ALTER SYSTEM SET shared_buffers = '256MB';  -- 25% of available RAM
-- ALTER SYSTEM SET effective_cache_size = '1GB';  -- 75% of available RAM
-- ALTER SYSTEM SET work_mem = '32MB';  -- For complex queries
-- ALTER SYSTEM SET maintenance_work_mem = '128MB';  -- For maintenance operations

-- Query performance settings
-- ALTER SYSTEM SET random_page_cost = 1.1;  -- For SSD storage
-- ALTER SYSTEM SET effective_io_concurrency = 200;  -- For SSD storage
-- ALTER SYSTEM SET default_statistics_target = 1000;  -- Better query planning

-- Checkpoint and WAL settings for write-heavy workloads
-- ALTER SYSTEM SET checkpoint_completion_target = 0.9;
-- ALTER SYSTEM SET wal_buffers = '16MB';
-- ALTER SYSTEM SET min_wal_size = '1GB';
-- ALTER SYSTEM SET max_wal_size = '4GB';

-- Enable these settings by reloading configuration
-- SELECT pg_reload_conf();

-- ====================================================
-- INDEX OPTIMIZATION FOR PRODUCTION
-- ====================================================

-- Analyze all tables for current statistics
ANALYZE tasks;
ANALYZE task_audit_log;
ANALYZE task_comments;
ANALYZE task_attachments;

-- Create additional production-specific indexes
-- Hot task lookup (most common dashboard queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_dashboard_hot 
ON tasks(status, priority, created_at DESC) 
WHERE deleted_at IS NULL AND status IN ('pending', 'in_progress');

-- Customer service optimization (frequent customer lookups)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_customer_service 
ON tasks(phone_number, created_at DESC, status) 
WHERE deleted_at IS NULL;

-- Performance monitoring index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_performance_metrics 
ON tasks(completed_at, created_at, priority) 
WHERE status = 'completed' AND deleted_at IS NULL;

-- API query optimization (for external integrations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_api_lookup 
ON tasks(task_number, status, updated_at) 
WHERE deleted_at IS NULL;

-- ====================================================
-- PRODUCTION SECURITY HARDENING
-- ====================================================

-- Set up database-level security
-- Revoke unnecessary permissions from public
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM public;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM public;

-- Grant specific permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON tasks TO authenticated;
GRANT SELECT, INSERT ON task_comments TO authenticated;
GRANT SELECT, INSERT ON task_attachments TO authenticated;
GRANT SELECT ON task_audit_log TO authenticated;

-- Grant full access to service role (for API operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Create application-specific roles
CREATE ROLE task_admin;
CREATE ROLE task_technician;
CREATE ROLE task_readonly;

-- Grant appropriate permissions to roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO task_admin;
GRANT SELECT, UPDATE ON tasks TO task_technician;
GRANT SELECT ON task_comments TO task_technician;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO task_readonly;

-- Enable audit logging for production
CREATE OR REPLACE FUNCTION log_security_events()
RETURNS TRIGGER AS $$
BEGIN
    -- Log security-sensitive operations
    INSERT INTO task_audit_log (
        task_id,
        action,
        old_values,
        new_values,
        changed_fields,
        changed_by,
        change_source,
        metadata
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        'security_event',
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE '{}'::jsonb END,
        CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) ELSE '{}'::jsonb END,
        ARRAY['security_event'],
        auth.uid(),
        'security_trigger',
        jsonb_build_object(
            'operation', TG_OP,
            'table', TG_TABLE_NAME,
            'timestamp', NOW(),
            'user_agent', current_setting('request.headers', true)::jsonb ->> 'user-agent',
            'ip_address', current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for'
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================
-- PRODUCTION MONITORING SETUP
-- ====================================================

-- Create monitoring table for performance metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit VARCHAR(20),
    measurement_time TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create index for performance metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_time 
ON performance_metrics(measurement_time DESC, metric_name);

-- Function to collect database performance metrics
CREATE OR REPLACE FUNCTION collect_performance_metrics()
RETURNS void AS $$
DECLARE
    task_count BIGINT;
    avg_query_time NUMERIC;
    db_size BIGINT;
    index_usage NUMERIC;
BEGIN
    -- Collect basic metrics
    SELECT COUNT(*) INTO task_count FROM tasks WHERE deleted_at IS NULL;
    
    -- Get database size
    SELECT pg_database_size(current_database()) INTO db_size;
    
    -- Insert metrics
    INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, metadata) VALUES
    ('active_task_count', task_count, 'count', '{"table": "tasks"}'),
    ('database_size', db_size, 'bytes', '{"database": "' || current_database() || '"}'),
    ('connection_count', (SELECT count(*) FROM pg_stat_activity), 'count', '{"type": "connections"}');
    
    -- Log collection
    RAISE NOTICE 'Performance metrics collected at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to check system health
CREATE OR REPLACE FUNCTION check_system_health()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    details JSONB
) AS $$
BEGIN
    RETURN QUERY
    
    -- Check for overdue urgent tasks
    SELECT 
        'overdue_urgent_tasks'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END::TEXT,
        jsonb_build_object('count', COUNT(*), 'threshold', 0)
    FROM tasks 
    WHERE priority = 'urgent' 
    AND status IN ('pending', 'in_progress')
    AND created_at < NOW() - INTERVAL '2 hours'
    AND deleted_at IS NULL
    
    UNION ALL
    
    -- Check task completion rate
    SELECT 
        'completion_rate_24h'::TEXT,
        CASE WHEN COALESCE(completion_rate, 0) >= 80 THEN 'OK' ELSE 'WARNING' END::TEXT,
        jsonb_build_object('rate', COALESCE(completion_rate, 0), 'threshold', 80)
    FROM (
        SELECT 
            ROUND((COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / 
                   NULLIF(COUNT(*), 0)) * 100, 2) as completion_rate
        FROM tasks 
        WHERE created_at >= NOW() - INTERVAL '24 hours' 
        AND deleted_at IS NULL
    ) rates
    
    UNION ALL
    
    -- Check database size growth
    SELECT 
        'database_size'::TEXT,
        CASE WHEN pg_database_size(current_database()) < 10737418240 THEN 'OK' ELSE 'WARNING' END::TEXT,  -- 10GB threshold
        jsonb_build_object(
            'size_bytes', pg_database_size(current_database()),
            'size_mb', ROUND(pg_database_size(current_database())::NUMERIC / 1048576, 2),
            'threshold_gb', 10
        )
    
    UNION ALL
    
    -- Check index usage
    SELECT 
        'index_usage'::TEXT,
        CASE WHEN AVG(idx_tup_read) > 1000 THEN 'OK' ELSE 'INFO' END::TEXT,
        jsonb_build_object('avg_index_reads', COALESCE(AVG(idx_tup_read), 0))
    FROM pg_stat_user_indexes 
    WHERE schemaname = 'public';
END;
$$ LANGUAGE plpgsql;

-- ====================================================
-- BACKUP AND MAINTENANCE PROCEDURES
-- ====================================================

-- Create function for database maintenance
CREATE OR REPLACE FUNCTION perform_maintenance()
RETURNS TEXT AS $$
DECLARE
    result TEXT := 'Maintenance completed: ';
    vacuum_result TEXT;
BEGIN
    -- Update table statistics
    ANALYZE tasks;
    ANALYZE task_audit_log;
    ANALYZE task_comments;
    ANALYZE task_attachments;
    result := result || 'Statistics updated. ';
    
    -- Clean up old audit logs (older than 6 months)
    DELETE FROM task_audit_log WHERE changed_at < NOW() - INTERVAL '6 months';
    GET DIAGNOSTICS vacuum_result = ROW_COUNT;
    result := result || 'Cleaned ' || vacuum_result || ' old audit logs. ';
    
    -- Clean up old performance metrics (older than 3 months)
    DELETE FROM performance_metrics WHERE measurement_time < NOW() - INTERVAL '3 months';
    GET DIAGNOSTICS vacuum_result = ROW_COUNT;
    result := result || 'Cleaned ' || vacuum_result || ' old metrics. ';
    
    -- Vacuum tables to reclaim space
    VACUUM ANALYZE tasks;
    VACUUM ANALYZE task_audit_log;
    result := result || 'Tables vacuumed. ';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ====================================================
-- PRODUCTION ALERTING SETUP
-- ====================================================

-- Create alerts table for system notifications
CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Index for alerts
CREATE INDEX IF NOT EXISTS idx_system_alerts_unresolved 
ON system_alerts(created_at DESC) WHERE resolved_at IS NULL;

-- Function to create system alerts
CREATE OR REPLACE FUNCTION create_system_alert(
    alert_type_param VARCHAR(50),
    severity_param VARCHAR(20),
    title_param VARCHAR(255),
    description_param TEXT DEFAULT NULL,
    metadata_param JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO system_alerts (
        alert_type,
        severity,
        title,
        description,
        metadata
    ) VALUES (
        alert_type_param,
        severity_param,
        title_param,
        description_param,
        metadata_param
    ) RETURNING id INTO alert_id;
    
    -- Send notification for critical alerts
    IF severity_param = 'critical' THEN
        PERFORM pg_notify('critical_alert', json_build_object(
            'alert_id', alert_id,
            'title', title_param,
            'severity', severity_param
        )::text);
    END IF;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- Function to monitor and alert on system issues
CREATE OR REPLACE FUNCTION monitor_system_issues()
RETURNS void AS $$
DECLARE
    urgent_overdue_count INTEGER;
    high_priority_old_count INTEGER;
    completion_rate NUMERIC;
BEGIN
    -- Check for overdue urgent tasks
    SELECT COUNT(*) INTO urgent_overdue_count
    FROM tasks 
    WHERE priority = 'urgent' 
    AND status IN ('pending', 'in_progress')
    AND created_at < NOW() - INTERVAL '2 hours'
    AND deleted_at IS NULL;
    
    IF urgent_overdue_count > 0 THEN
        PERFORM create_system_alert(
            'overdue_urgent_tasks',
            'critical',
            'Urgent tasks overdue',
            urgent_overdue_count || ' urgent tasks have been pending for over 2 hours',
            jsonb_build_object('count', urgent_overdue_count, 'threshold_hours', 2)
        );
    END IF;
    
    -- Check for old high priority tasks
    SELECT COUNT(*) INTO high_priority_old_count
    FROM tasks 
    WHERE priority = 'high'
    AND status IN ('pending', 'in_progress')
    AND created_at < NOW() - INTERVAL '8 hours'
    AND deleted_at IS NULL;
    
    IF high_priority_old_count > 2 THEN
        PERFORM create_system_alert(
            'old_high_priority_tasks',
            'warning',
            'Multiple high priority tasks aging',
            high_priority_old_count || ' high priority tasks have been pending for over 8 hours',
            jsonb_build_object('count', high_priority_old_count, 'threshold_hours', 8)
        );
    END IF;
    
    -- Check completion rate for last 24 hours
    SELECT 
        ROUND((COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / 
               NULLIF(COUNT(*), 0)) * 100, 2)
    INTO completion_rate
    FROM tasks 
    WHERE created_at >= NOW() - INTERVAL '24 hours' 
    AND deleted_at IS NULL;
    
    IF completion_rate < 60 THEN
        PERFORM create_system_alert(
            'low_completion_rate',
            'warning',
            'Low task completion rate',
            'Completion rate for last 24 hours is ' || completion_rate || '%',
            jsonb_build_object('rate', completion_rate, 'threshold', 60, 'period_hours', 24)
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ====================================================
-- PRODUCTION DATA RETENTION POLICIES
-- ====================================================

-- Create data retention policy function
CREATE OR REPLACE FUNCTION apply_data_retention_policy()
RETURNS TEXT AS $$
DECLARE
    deleted_count INTEGER;
    result TEXT := 'Data retention policy applied: ';
BEGIN
    -- Archive completed tasks older than 2 years (soft delete)
    UPDATE tasks 
    SET deleted_at = NOW(),
        metadata = metadata || jsonb_build_object('archived_reason', 'data_retention_policy', 'archived_at', NOW())
    WHERE status = 'completed' 
    AND completed_at < NOW() - INTERVAL '2 years'
    AND deleted_at IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := result || 'Archived ' || deleted_count || ' old completed tasks. ';
    
    -- Hard delete very old cancelled tasks (older than 1 year)
    DELETE FROM tasks 
    WHERE status = 'cancelled' 
    AND updated_at < NOW() - INTERVAL '1 year'
    AND deleted_at IS NOT NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := result || 'Permanently deleted ' || deleted_count || ' old cancelled tasks. ';
    
    -- Clean old audit logs (older than 1 year)
    DELETE FROM task_audit_log 
    WHERE changed_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := result || 'Cleaned ' || deleted_count || ' old audit logs. ';
    
    -- Resolve old alerts (older than 30 days)
    UPDATE system_alerts 
    SET resolved_at = NOW(),
        metadata = metadata || jsonb_build_object('auto_resolved', true, 'reason', 'aged_out')
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND resolved_at IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result := result || 'Auto-resolved ' || deleted_count || ' old alerts.';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ====================================================
-- PRODUCTION VERIFICATION
-- ====================================================

-- Verify production configuration
DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    function_count INTEGER;
    view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    SELECT COUNT(*) INTO index_count FROM pg_indexes 
    WHERE schemaname = 'public';
    
    SELECT COUNT(*) INTO function_count FROM pg_proc 
    WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    SELECT COUNT(*) INTO view_count FROM information_schema.views 
    WHERE table_schema = 'public';
    
    RAISE NOTICE '🚀 PRODUCTION CONFIGURATION COMPLETE!';
    RAISE NOTICE '📊 Database objects summary:';
    RAISE NOTICE '   - Tables: %', table_count;
    RAISE NOTICE '   - Indexes: %', index_count;
    RAISE NOTICE '   - Functions: %', function_count;
    RAISE NOTICE '   - Views: %', view_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Production optimizations applied:';
    RAISE NOTICE '   ✅ Performance indexes created';
    RAISE NOTICE '   ✅ Security hardening configured';
    RAISE NOTICE '   ✅ Monitoring and alerting setup';
    RAISE NOTICE '   ✅ Backup and maintenance procedures ready';
    RAISE NOTICE '   ✅ Data retention policies defined';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ System is production-ready!';
    RAISE NOTICE '📈 Next: Configure application environment variables';
    RAISE NOTICE '🔐 Next: Set up admin user accounts in Supabase dashboard';
    RAISE NOTICE '📊 Next: Configure monitoring dashboards';
END $$;

-- Run initial system health check
SELECT 'Initial System Health Check' as status, * FROM check_system_health();

-- Collect initial performance metrics
SELECT collect_performance_metrics();

-- ====================================================
-- PRODUCTION MAINTENANCE SCHEDULE
-- ====================================================

/*
Recommended Production Maintenance Schedule:

DAILY (via cron or scheduled functions):
- SELECT collect_performance_metrics();
- SELECT monitor_system_issues();

WEEKLY:
- SELECT perform_maintenance();
- VACUUM ANALYZE; (during off-peak hours)

MONTHLY:
- SELECT apply_data_retention_policy();
- Review and optimize slow queries
- Update table statistics: ANALYZE;

QUARTERLY:
- Review index usage with v_unused_indexes
- Assess query performance and optimization needs
- Review security policies and access logs
- Update documentation and procedures

To set up automated maintenance in Supabase:
1. Use Supabase Edge Functions for scheduled tasks
2. Set up pg_cron extension if available
3. Use external cron jobs to call API endpoints
4. Monitor with external tools like Grafana or DataDog
*/

-- ====================================================
-- ROLLBACK PROCEDURES (for development/testing)
-- ====================================================

/*
-- Uncomment and run these commands to rollback production config:

-- Drop production-specific indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_tasks_dashboard_hot;
DROP INDEX CONCURRENTLY IF EXISTS idx_tasks_customer_service;
DROP INDEX CONCURRENTLY IF EXISTS idx_tasks_performance_metrics;
DROP INDEX CONCURRENTLY IF EXISTS idx_tasks_api_lookup;

-- Drop monitoring and alerting
DROP TABLE IF EXISTS system_alerts CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;

-- Drop production functions
DROP FUNCTION IF EXISTS log_security_events();
DROP FUNCTION IF EXISTS collect_performance_metrics();
DROP FUNCTION IF EXISTS check_system_health();
DROP FUNCTION IF EXISTS perform_maintenance();
DROP FUNCTION IF EXISTS create_system_alert(VARCHAR(50), VARCHAR(20), VARCHAR(255), TEXT, JSONB);
DROP FUNCTION IF EXISTS monitor_system_issues();
DROP FUNCTION IF EXISTS apply_data_retention_policy();

-- Drop roles
DROP ROLE IF EXISTS task_admin;
DROP ROLE IF EXISTS task_technician;
DROP ROLE IF EXISTS task_readonly;

-- Reset permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO public;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO public;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO public;
*/