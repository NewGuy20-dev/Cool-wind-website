-- ====================================================
-- 05_views_procedures.sql
-- Database Views and Stored Procedures for Task Management System
-- ====================================================
-- Purpose: Create views for dashboard, analytics, and complex queries
-- Dependencies: 01_core_schema.sql, 02_indexes_constraints.sql
-- Execution Time: ~45 seconds
-- Author: Migration Script
-- Created: 2024

-- ====================================================
-- DASHBOARD VIEWS
-- ====================================================

-- Main dashboard overview
CREATE OR REPLACE VIEW v_dashboard_overview AS
SELECT 
    -- Task counts by status
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
    
    -- Priority breakdown
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
    COUNT(*) FILTER (WHERE priority = 'high') as high_count,
    COUNT(*) FILTER (WHERE priority = 'medium') as medium_count,
    COUNT(*) FILTER (WHERE priority = 'low') as low_count,
    
    -- Today's activity
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today_created,
    COUNT(*) FILTER (WHERE DATE(completed_at) = CURRENT_DATE) as today_completed,
    
    -- Overdue tasks
    COUNT(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('completed', 'cancelled')) as overdue_count,
    
    -- Average completion time (in hours)
    EXTRACT(EPOCH FROM AVG(completed_at - created_at))/3600 as avg_completion_hours,
    
    -- Source breakdown
    COUNT(*) FILTER (WHERE source = 'chat-failed-call') as chat_failed_call_count,
    COUNT(*) FILTER (WHERE source = 'admin-manual') as admin_manual_count,
    
    -- Total tasks
    COUNT(*) as total_tasks,
    
    -- Last update time
    NOW() as last_updated
FROM tasks 
WHERE deleted_at IS NULL;

-- Recent tasks for dashboard
CREATE OR REPLACE VIEW v_recent_tasks AS
SELECT 
    id,
    task_number,
    customer_name,
    phone_number,
    title,
    problem_description,
    status,
    priority,
    location,
    source,
    created_at,
    updated_at,
    -- Calculate age
    NOW() - created_at as task_age,
    -- Status badge color
    CASE status
        WHEN 'pending' THEN 'blue'
        WHEN 'in_progress' THEN 'orange'
        WHEN 'completed' THEN 'green'
        WHEN 'cancelled' THEN 'gray'
    END as status_color,
    -- Priority badge color
    CASE priority
        WHEN 'urgent' THEN 'red'
        WHEN 'high' THEN 'orange'
        WHEN 'medium' THEN 'yellow'
        WHEN 'low' THEN 'gray'
    END as priority_color
FROM tasks 
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 50;

-- ====================================================
-- ANALYTICS VIEWS
-- ====================================================

-- Daily task statistics
CREATE OR REPLACE VIEW v_daily_task_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as tasks_created,
    COUNT(*) FILTER (WHERE status = 'completed') as tasks_completed,
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_tasks,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority_tasks,
    COUNT(*) FILTER (WHERE source = 'chat-failed-call') as failed_call_tasks,
    -- Completion rate for that day
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / 
         NULLIF(COUNT(*), 0)) * 100, 2
    ) as completion_rate_percent
FROM tasks 
WHERE deleted_at IS NULL
AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Weekly performance metrics
CREATE OR REPLACE VIEW v_weekly_performance AS
SELECT 
    DATE_TRUNC('week', created_at) as week_start,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) FILTER (WHERE status = 'completed') as avg_completion_hours,
    COUNT(*) FILTER (WHERE priority IN ('urgent', 'high')) as high_priority_tasks,
    COUNT(DISTINCT phone_number) as unique_customers,
    -- Performance score (0-100)
    ROUND(
        ((COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / NULLIF(COUNT(*), 0)) * 50) +
        ((COUNT(*) FILTER (WHERE completed_at <= created_at + INTERVAL '24 hours')::NUMERIC / 
          NULLIF(COUNT(*) FILTER (WHERE status = 'completed'), 0)) * 50)
    ) as performance_score
FROM tasks 
WHERE deleted_at IS NULL
AND created_at >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week_start DESC;

-- Customer satisfaction proxy view
CREATE OR REPLACE VIEW v_customer_satisfaction AS
SELECT 
    phone_number,
    customer_name,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_tasks,
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) FILTER (WHERE status = 'completed') as avg_resolution_hours,
    MAX(created_at) as last_service_date,
    -- Satisfaction score based on completion rate and resolution time
    CASE 
        WHEN COUNT(*) FILTER (WHERE status = 'completed') = 0 THEN 0
        WHEN AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) FILTER (WHERE status = 'completed') <= 24 THEN 100
        WHEN AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) FILTER (WHERE status = 'completed') <= 48 THEN 80
        WHEN AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) FILTER (WHERE status = 'completed') <= 72 THEN 60
        ELSE 40
    END as satisfaction_score
FROM tasks 
WHERE deleted_at IS NULL
GROUP BY phone_number, customer_name
HAVING COUNT(*) > 0
ORDER BY satisfaction_score ASC, total_tasks DESC;

-- ====================================================
-- OPERATIONAL VIEWS
-- ====================================================

-- Tasks requiring immediate attention
CREATE OR REPLACE VIEW v_urgent_attention AS
SELECT 
    t.*,
    NOW() - t.created_at as age,
    CASE 
        WHEN t.priority = 'urgent' AND t.created_at < NOW() - INTERVAL '2 hours' THEN 'CRITICAL DELAY'
        WHEN t.priority = 'high' AND t.created_at < NOW() - INTERVAL '6 hours' THEN 'HIGH DELAY'
        WHEN t.priority = 'medium' AND t.created_at < NOW() - INTERVAL '24 hours' THEN 'MEDIUM DELAY'
        WHEN t.due_date < NOW() THEN 'OVERDUE'
        ELSE 'ON TIME'
    END as attention_status,
    -- Calculate escalation timeline
    CASE t.priority
        WHEN 'urgent' THEN t.created_at + INTERVAL '2 hours'
        WHEN 'high' THEN t.created_at + INTERVAL '6 hours'
        WHEN 'medium' THEN t.created_at + INTERVAL '24 hours'
        WHEN 'low' THEN t.created_at + INTERVAL '48 hours'
    END as escalation_deadline
FROM tasks t
WHERE t.deleted_at IS NULL 
AND t.status IN ('pending', 'in_progress')
AND (
    (t.priority = 'urgent' AND t.created_at < NOW() - INTERVAL '2 hours') OR
    (t.priority = 'high' AND t.created_at < NOW() - INTERVAL '6 hours') OR
    (t.priority = 'medium' AND t.created_at < NOW() - INTERVAL '24 hours') OR
    (t.due_date < NOW() AND t.due_date IS NOT NULL)
)
ORDER BY 
    CASE t.priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    t.created_at ASC;

-- Workload distribution view
CREATE OR REPLACE VIEW v_workload_distribution AS
SELECT 
    DATE(created_at) as date,
    EXTRACT(hour FROM created_at) as hour,
    COUNT(*) as task_count,
    COUNT(*) FILTER (WHERE priority IN ('urgent', 'high')) as priority_count,
    COUNT(*) FILTER (WHERE source = 'chat-failed-call') as failed_call_count
FROM tasks 
WHERE deleted_at IS NULL
AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at), EXTRACT(hour FROM created_at)
ORDER BY date DESC, hour;

-- ====================================================
-- CUSTOMER MANAGEMENT VIEWS
-- ====================================================

-- Customer task history
CREATE OR REPLACE VIEW v_customer_history AS
SELECT 
    phone_number,
    customer_name,
    location,
    COUNT(*) as total_tasks,
    MIN(created_at) as first_service_date,
    MAX(created_at) as last_service_date,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_tasks,
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_tasks,
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) FILTER (WHERE status = 'completed') as avg_resolution_hours,
    STRING_AGG(DISTINCT problem_description, '; ' ORDER BY created_at DESC) as recent_problems,
    -- Customer status
    CASE 
        WHEN MAX(created_at) > NOW() - INTERVAL '30 days' THEN 'Active'
        WHEN MAX(created_at) > NOW() - INTERVAL '90 days' THEN 'Recent'
        ELSE 'Inactive'
    END as customer_status,
    -- Risk score
    CASE 
        WHEN COUNT(*) FILTER (WHERE status = 'cancelled') > COUNT(*) * 0.3 THEN 'High Risk'
        WHEN COUNT(*) FILTER (WHERE status = 'cancelled') > COUNT(*) * 0.1 THEN 'Medium Risk'
        ELSE 'Low Risk'
    END as risk_level
FROM tasks 
WHERE deleted_at IS NULL
GROUP BY phone_number, customer_name, location
ORDER BY last_service_date DESC;

-- Frequent customers view
CREATE OR REPLACE VIEW v_frequent_customers AS
SELECT 
    phone_number,
    customer_name,
    location,
    COUNT(*) as task_count,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recent_count,
    MAX(created_at) as last_service,
    STRING_AGG(DISTINCT problem_description, '; ') as common_problems
FROM tasks 
WHERE deleted_at IS NULL
GROUP BY phone_number, customer_name, location
HAVING COUNT(*) >= 3
ORDER BY task_count DESC, last_service DESC;

-- ====================================================
-- REPORTING VIEWS
-- ====================================================

-- Monthly summary report
CREATE OR REPLACE VIEW v_monthly_summary AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_tasks,
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_tasks,
    COUNT(*) FILTER (WHERE source = 'chat-failed-call') as failed_call_tasks,
    COUNT(DISTINCT phone_number) as unique_customers,
    ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) FILTER (WHERE status = 'completed'), 2) as avg_resolution_hours,
    ROUND((COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2) as completion_rate
FROM tasks 
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Service quality metrics
CREATE OR REPLACE VIEW v_service_quality AS
SELECT 
    'Last 24 Hours' as period,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE completed_at <= created_at + INTERVAL '24 hours') as on_time_completion,
    ROUND((COUNT(*) FILTER (WHERE completed_at <= created_at + INTERVAL '24 hours')::NUMERIC / 
           NULLIF(COUNT(*) FILTER (WHERE status = 'completed'), 0)) * 100, 2) as on_time_rate
FROM tasks 
WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
    'Last 7 Days' as period,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE completed_at <= created_at + INTERVAL '24 hours') as on_time_completion,
    ROUND((COUNT(*) FILTER (WHERE completed_at <= created_at + INTERVAL '24 hours')::NUMERIC / 
           NULLIF(COUNT(*) FILTER (WHERE status = 'completed'), 0)) * 100, 2) as on_time_rate
FROM tasks 
WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
    'Last 30 Days' as period,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE completed_at <= created_at + INTERVAL '24 hours') as on_time_completion,
    ROUND((COUNT(*) FILTER (WHERE completed_at <= created_at + INTERVAL '24 hours')::NUMERIC / 
           NULLIF(COUNT(*) FILTER (WHERE status = 'completed'), 0)) * 100, 2) as on_time_rate
FROM tasks 
WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '30 days';

-- ====================================================
-- SEARCH AND FILTERING VIEWS
-- ====================================================

-- Advanced task search view
CREATE OR REPLACE VIEW v_task_search AS
SELECT 
    t.*,
    -- Search text combining all searchable fields
    t.task_number || ' ' || 
    t.customer_name || ' ' || 
    t.phone_number || ' ' || 
    COALESCE(t.title, '') || ' ' || 
    COALESCE(t.problem_description, '') || ' ' ||
    COALESCE(t.location, '') as search_text,
    -- Full-text search vector
    to_tsvector('english', 
        t.task_number || ' ' || 
        t.customer_name || ' ' || 
        COALESCE(t.title, '') || ' ' || 
        COALESCE(t.problem_description, '') || ' ' ||
        COALESCE(t.location, '')
    ) as search_vector,
    -- Comment count
    (SELECT COUNT(*) FROM task_comments tc WHERE tc.task_id = t.id) as comment_count,
    -- Attachment count
    (SELECT COUNT(*) FROM task_attachments ta WHERE ta.task_id = t.id) as attachment_count
FROM tasks t
WHERE t.deleted_at IS NULL;

-- ====================================================
-- STORED PROCEDURES
-- ====================================================

-- Procedure to get comprehensive dashboard data
CREATE OR REPLACE FUNCTION get_dashboard_data()
RETURNS TABLE(
    overview JSONB,
    recent_tasks JSONB,
    urgent_tasks JSONB,
    daily_stats JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT row_to_json(v_dashboard_overview)::jsonb FROM v_dashboard_overview) as overview,
        (SELECT jsonb_agg(row_to_json(vrt)) FROM (SELECT * FROM v_recent_tasks LIMIT 10) vrt) as recent_tasks,
        (SELECT jsonb_agg(row_to_json(vua)) FROM (SELECT * FROM v_urgent_attention LIMIT 5) vua) as urgent_tasks,
        (SELECT jsonb_agg(row_to_json(vds)) FROM (SELECT * FROM v_daily_task_stats LIMIT 7) vds) as daily_stats;
END;
$$ LANGUAGE plpgsql;

-- Procedure for task search with filters
CREATE OR REPLACE FUNCTION search_tasks(
    search_term TEXT DEFAULT NULL,
    filter_status task_status DEFAULT NULL,
    filter_priority task_priority DEFAULT NULL,
    filter_source task_source DEFAULT NULL,
    date_from TIMESTAMPTZ DEFAULT NULL,
    date_to TIMESTAMPTZ DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    task_number TEXT,
    customer_name VARCHAR(255),
    phone_number VARCHAR(15),
    title VARCHAR(255),
    problem_description TEXT,
    status task_status,
    priority task_priority,
    location VARCHAR(255),
    source task_source,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    comment_count BIGINT,
    attachment_count BIGINT,
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vts.id,
        vts.task_number,
        vts.customer_name,
        vts.phone_number,
        vts.title,
        vts.problem_description,
        vts.status,
        vts.priority,
        vts.location,
        vts.source,
        vts.created_at,
        vts.updated_at,
        vts.comment_count,
        vts.attachment_count,
        CASE 
            WHEN search_term IS NOT NULL THEN 
                ts_rank(vts.search_vector, plainto_tsquery('english', search_term))
            ELSE 0
        END as relevance_score
    FROM v_task_search vts
    WHERE 
        (search_term IS NULL OR vts.search_vector @@ plainto_tsquery('english', search_term)) AND
        (filter_status IS NULL OR vts.status = filter_status) AND
        (filter_priority IS NULL OR vts.priority = filter_priority) AND
        (filter_source IS NULL OR vts.source = filter_source) AND
        (date_from IS NULL OR vts.created_at >= date_from) AND
        (date_to IS NULL OR vts.created_at <= date_to)
    ORDER BY 
        CASE WHEN search_term IS NOT NULL THEN relevance_score ELSE 0 END DESC,
        vts.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Procedure to get customer insights
CREATE OR REPLACE FUNCTION get_customer_insights(customer_phone VARCHAR(15))
RETURNS TABLE(
    customer_info JSONB,
    task_history JSONB,
    satisfaction_metrics JSONB,
    recommendations JSONB
) AS $$
DECLARE
    customer_data RECORD;
    task_data JSONB;
    satisfaction_data JSONB;
    recommendations_data JSONB;
BEGIN
    -- Get customer basic info
    SELECT INTO customer_data
        phone_number,
        customer_name,
        location,
        total_tasks,
        first_service_date,
        last_service_date,
        customer_status,
        risk_level
    FROM v_customer_history 
    WHERE phone_number = customer_phone;
    
    -- Get task history
    SELECT INTO task_data
        jsonb_agg(
            jsonb_build_object(
                'task_number', task_number,
                'title', title,
                'status', status,
                'priority', priority,
                'created_at', created_at,
                'completed_at', completed_at
            ) ORDER BY created_at DESC
        )
    FROM tasks 
    WHERE phone_number = customer_phone AND deleted_at IS NULL;
    
    -- Get satisfaction metrics
    SELECT INTO satisfaction_data
        to_jsonb(vcs)
    FROM v_customer_satisfaction vcs
    WHERE vcs.phone_number = customer_phone;
    
    -- Generate recommendations
    recommendations_data := jsonb_build_object(
        'priority_level', 
        CASE 
            WHEN customer_data.risk_level = 'High Risk' THEN 'high'
            WHEN customer_data.total_tasks > 5 THEN 'medium'
            ELSE 'standard'
        END,
        'suggested_actions',
        CASE 
            WHEN customer_data.risk_level = 'High Risk' THEN 
                jsonb_build_array('Follow up personally', 'Offer discount', 'Assign senior technician')
            WHEN customer_data.total_tasks > 5 THEN 
                jsonb_build_array('Consider maintenance package', 'VIP customer service')
            ELSE 
                jsonb_build_array('Standard service protocol')
        END
    );
    
    RETURN QUERY
    SELECT 
        to_jsonb(customer_data) as customer_info,
        COALESCE(task_data, '[]'::jsonb) as task_history,
        COALESCE(satisfaction_data, '{}'::jsonb) as satisfaction_metrics,
        recommendations_data as recommendations;
END;
$$ LANGUAGE plpgsql;

-- ====================================================
-- VERIFICATION QUERIES
-- ====================================================

-- List all views created
SELECT 
    table_name as view_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'VIEW'
AND table_name LIKE 'v_%'
ORDER BY table_name;

-- List all stored procedures
SELECT 
    proname as procedure_name,
    pronargs as argument_count,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('get_dashboard_data', 'search_tasks', 'get_customer_insights')
ORDER BY proname;

-- Test basic view functionality
SELECT 'Dashboard Overview' as test, * FROM v_dashboard_overview
UNION ALL
SELECT 'Service Quality', period, total_tasks::text, completed_tasks::text, on_time_rate::text, '' FROM v_service_quality;

-- ====================================================
-- SUCCESS MESSAGE
-- ====================================================

DO $$
DECLARE
    view_count INTEGER;
    procedure_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO view_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'VIEW' AND table_name LIKE 'v_%';
    
    SELECT COUNT(*) INTO procedure_count FROM pg_proc 
    WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND proname IN ('get_dashboard_data', 'search_tasks', 'get_customer_insights');
    
    RAISE NOTICE '✅ Views and procedures created successfully!';
    RAISE NOTICE '📊 Dashboard views: % created', view_count;
    RAISE NOTICE '🔧 Stored procedures: % created', procedure_count;
    RAISE NOTICE '📈 Analytics: Daily, weekly, monthly reports available';
    RAISE NOTICE '👥 Customer management: History, satisfaction, insights ready';
    RAISE NOTICE '🔍 Search: Advanced filtering and full-text search enabled';
    RAISE NOTICE '📋 Reporting: Quality metrics and performance tracking active';
    RAISE NOTICE '🎯 Ready for seed data (06_seed_data.sql)';
END $$;

-- ====================================================
-- VIEW USAGE EXAMPLES
-- ====================================================

/*
Usage Examples:

1. DASHBOARD DATA:
   SELECT * FROM get_dashboard_data();

2. SEARCH TASKS:
   SELECT * FROM search_tasks('AC not cooling', 'pending', 'high');

3. CUSTOMER INSIGHTS:
   SELECT * FROM get_customer_insights('9876543210');

4. URGENT TASKS:
   SELECT * FROM v_urgent_attention;

5. PERFORMANCE METRICS:
   SELECT * FROM v_service_quality;

6. CUSTOMER HISTORY:
   SELECT * FROM v_customer_history WHERE customer_status = 'Active';
*/

-- ====================================================
-- ROLLBACK PROCEDURES (for development/testing)
-- ====================================================

/*
-- Uncomment and run these commands to rollback views and procedures:

-- Drop all stored procedures
DROP FUNCTION IF EXISTS get_dashboard_data();
DROP FUNCTION IF EXISTS search_tasks(TEXT, task_status, task_priority, task_source, TIMESTAMPTZ, TIMESTAMPTZ, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_customer_insights(VARCHAR(15));

-- Drop all views
DROP VIEW IF EXISTS v_dashboard_overview;
DROP VIEW IF EXISTS v_recent_tasks;
DROP VIEW IF EXISTS v_daily_task_stats;
DROP VIEW IF EXISTS v_weekly_performance;
DROP VIEW IF EXISTS v_customer_satisfaction;
DROP VIEW IF EXISTS v_urgent_attention;
DROP VIEW IF EXISTS v_workload_distribution;
DROP VIEW IF EXISTS v_customer_history;
DROP VIEW IF EXISTS v_frequent_customers;
DROP VIEW IF EXISTS v_monthly_summary;
DROP VIEW IF EXISTS v_service_quality;
DROP VIEW IF EXISTS v_task_search;
*/