-- ====================================================
-- 06_seed_data.sql
-- Sample Data for Development and Testing
-- ====================================================
-- Purpose: Insert sample data for development and testing purposes
-- Dependencies: All previous SQL files (complete schema setup)
-- Execution Time: ~15 seconds
-- Author: Migration Script
-- Created: 2024
-- WARNING: FOR DEVELOPMENT/TESTING ONLY - DO NOT RUN IN PRODUCTION

-- ====================================================
-- CLEAR EXISTING TEST DATA (if any)
-- ====================================================

-- Clear in dependency order
DELETE FROM task_attachments WHERE task_id IN (SELECT id FROM tasks WHERE customer_name LIKE 'Test%' OR customer_name LIKE 'Sample%');
DELETE FROM task_comments WHERE task_id IN (SELECT id FROM tasks WHERE customer_name LIKE 'Test%' OR customer_name LIKE 'Sample%');
DELETE FROM task_audit_log WHERE task_id IN (SELECT id FROM tasks WHERE customer_name LIKE 'Test%' OR customer_name LIKE 'Sample%');
DELETE FROM tasks WHERE customer_name LIKE 'Test%' OR customer_name LIKE 'Sample%';

-- ====================================================
-- SAMPLE TASKS DATA
-- ====================================================

-- Set change source for audit trail
SELECT set_config('app.change_source', 'seed_data_script', true);

-- Insert comprehensive test tasks covering all scenarios
INSERT INTO tasks (
    id,
    customer_name,
    phone_number,
    location,
    title,
    description,
    problem_description,
    status,
    priority,
    category,
    source,
    estimated_duration,
    due_date,
    completed_at,
    ai_priority_reason,
    urgency_keywords,
    metadata,
    chat_context,
    created_at,
    updated_at
) VALUES

-- Urgent tasks (should appear in urgent attention view)
(
    gen_random_uuid(),
    'Rajesh Kumar',
    '9876543210',
    'Thiruvalla',
    'AC completely stopped working in extreme heat',
    'Customer reports AC unit completely non-functional during 45°C heat wave',
    'AC not cooling at all, compressor making loud noise, customer has elderly parents at home',
    'pending',
    'urgent',
    'Air Conditioning',
    'chat-failed-call',
    INTERVAL '2 hours',
    NOW() + INTERVAL '4 hours',
    NULL,
    'Emergency situation detected: extreme weather, health risk',
    ARRAY['emergency', 'health risk', 'extreme weather'],
    '{"weather_temp": "45C", "elderly_occupants": true, "compressor_noise": "loud"}',
    '[{"role": "user", "content": "AC stopped working completely"}, {"role": "assistant", "content": "I understand this is urgent"}]',
    NOW() - INTERVAL '3 hours',  -- 3 hours old, should trigger urgent attention
    NOW() - INTERVAL '3 hours'
),

-- High priority task
(
    gen_random_uuid(),
    'Priya Menon',
    '9876543211',
    'Pathanamthitta',
    'Refrigerator not cooling properly',
    'Customer reports refrigerator temperature issues affecting food storage',
    'Refrigerator not maintaining proper temperature, vegetables spoiling, freezer partially working',
    'in_progress',
    'high',
    'Refrigerator',
    'chat-failed-call',
    INTERVAL '3 hours',
    NOW() + INTERVAL '1 day',
    NULL,
    'Food spoiling, requires urgent attention',
    ARRAY['food spoiling', 'temperature issue'],
    '{"food_spoilage": true, "partial_freezer_function": true}',
    '[{"role": "user", "content": "Fridge not cooling, vegetables getting spoiled"}, {"role": "assistant", "content": "I will arrange immediate service"}]',
    NOW() - INTERVAL '8 hours',  -- 8 hours old, should trigger high attention
    NOW() - INTERVAL '1 hour'
),

-- Completed task (for analytics)
(
    gen_random_uuid(),
    'Mohammed Ali',
    '9876543212',
    'Kottayam',
    'AC maintenance and filter cleaning',
    'Regular maintenance service completed successfully',
    'AC making slight noise, requested routine maintenance and filter replacement',
    'completed',
    'medium',
    'Air Conditioning',
    'admin-manual',
    INTERVAL '1.5 hours',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day',
    'Routine maintenance request',
    ARRAY['maintenance', 'filter replacement'],
    '{"service_type": "routine_maintenance", "parts_replaced": ["filter"], "follow_up_needed": false}',
    NULL,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day'
),

-- Medium priority task
(
    gen_random_uuid(),
    'Deepa Nair',
    '9876543213',
    'Alappuzha',
    'AC remote control not working',
    'Customer unable to control AC unit with remote, manual operation works',
    'AC remote control buttons not responding, AC works fine with manual controls',
    'pending',
    'medium',
    'Air Conditioning',
    'chat-failed-call',
    INTERVAL '1 hour',
    NOW() + INTERVAL '2 days',
    NULL,
    'Non-critical issue, AC functional with manual controls',
    ARRAY['remote control', 'buttons not responding'],
    '{"manual_operation": "working", "remote_batteries": "checked"}',
    '[{"role": "user", "content": "Remote not working but AC runs manually"}, {"role": "assistant", "content": "We can help with remote replacement"}]',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
),

-- Low priority task
(
    gen_random_uuid(),
    'Suresh Pillai',
    '9876543214',
    'Kollam',
    'Annual AC service check',
    'Customer requesting annual preventive maintenance service',
    'Annual maintenance check for AC unit, no current issues reported',
    'pending',
    'low',
    'Air Conditioning',
    'admin-manual',
    INTERVAL '2 hours',
    NOW() + INTERVAL '1 week',
    NULL,
    'Routine maintenance request, no urgency',
    ARRAY['annual maintenance', 'preventive service'],
    '{"service_type": "annual_maintenance", "last_service": "2023-01-15", "warranty_status": "valid"}',
    NULL,
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '12 hours'
),

-- Cancelled task (for analytics)
(
    gen_random_uuid(),
    'Lakshmi Devi',
    '9876543215',
    'Thiruvalla',
    'Washing machine repair',
    'Customer cancelled service request due to warranty coverage',
    'Washing machine making noise during spin cycle',
    'cancelled',
    'medium',
    'Washing Machine',
    'chat-failed-call',
    INTERVAL '2 hours',
    NOW() + INTERVAL '1 day',
    NULL,
    'Standard repair request',
    ARRAY['noise', 'spin cycle'],
    '{"cancellation_reason": "warranty_coverage", "warranty_provider": "manufacturer"}',
    '[{"role": "user", "content": "Washing machine making noise"}, {"role": "assistant", "content": "We can help repair this"}, {"role": "user", "content": "Actually found its under warranty"}]',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
),

-- Recent task (today)
(
    gen_random_uuid(),
    'Anil Thomas',
    '9876543216',
    'Kochi',
    'New AC installation inquiry',
    'Customer interested in new AC installation for bedroom',
    'Need new 1.5 ton AC installation for 12x10 bedroom, looking for energy efficient model',
    'pending',
    'medium',
    'Air Conditioning',
    'chat-failed-call',
    INTERVAL '4 hours',
    NOW() + INTERVAL '3 days',
    NULL,
    'New installation request, standard timeline',
    ARRAY['new installation', 'energy efficient'],
    '{"room_size": "12x10", "ac_capacity": "1.5_ton", "energy_rating": "5_star_preferred"}',
    '[{"role": "user", "content": "Want to install new AC in bedroom"}, {"role": "assistant", "content": "I can help you with AC installation"}]',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
),

-- Customer with multiple tasks (for customer history)
(
    gen_random_uuid(),
    'Rajesh Kumar',  -- Same customer as first task
    '9876543210',
    'Thiruvalla',
    'Previous AC repair service',
    'Previous service call for same customer',
    'AC filter was dirty, cleaned and replaced filter, checked gas levels',
    'completed',
    'low',
    'Air Conditioning',
    'admin-manual',
    INTERVAL '1 hour',
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '1 month' + INTERVAL '2 hours',
    'Routine maintenance completed',
    ARRAY['filter cleaning', 'gas check'],
    '{"parts_replaced": ["filter"], "gas_level": "adequate", "customer_satisfaction": "high"}',
    NULL,
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '1 month' + INTERVAL '2 hours'
),

-- Overdue task (for testing overdue logic)
(
    gen_random_uuid(),
    'Rita Jose',
    '9876543217',
    'Thrissur',
    'Refrigerator door seal replacement',
    'Customer reports refrigerator door not sealing properly',
    'Refrigerator door seal worn out, cold air escaping, increased electricity consumption',
    'in_progress',
    'medium',
    'Refrigerator',
    'chat-failed-call',
    INTERVAL '1.5 hours',
    NOW() - INTERVAL '1 day',  -- Due date was yesterday (overdue)
    NULL,
    'Door seal issue affecting efficiency',
    ARRAY['door seal', 'energy efficiency'],
    '{"energy_consumption": "increased", "seal_condition": "worn_out"}',
    '[{"role": "user", "content": "Fridge door not sealing properly"}, {"role": "assistant", "content": "We will replace the door seal"}]',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '8 hours'
),

-- API-created task (different source)
(
    gen_random_uuid(),
    'Vineeth Kumar',
    '9876543218',
    'Palakkad',
    'Smart AC connectivity issues',
    'Customer unable to connect AC to WiFi network',
    'New smart AC unit cannot connect to home WiFi, tried multiple networks',
    'pending',
    'low',
    'Air Conditioning',
    'api-direct',
    INTERVAL '1 hour',
    NOW() + INTERVAL '2 days',
    NULL,
    'Connectivity issue, not affecting cooling function',
    ARRAY['wifi connectivity', 'smart features'],
    '{"ac_model": "smart_inverter", "wifi_networks_tried": 3, "cooling_functional": true}',
    NULL,
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '4 hours'
);

-- ====================================================
-- SAMPLE COMMENTS DATA
-- ====================================================

-- Get some task IDs for adding comments
DO $$
DECLARE
    task_id_1 UUID;
    task_id_2 UUID;
    task_id_3 UUID;
BEGIN
    -- Get task IDs for adding sample comments
    SELECT id INTO task_id_1 FROM tasks WHERE customer_name = 'Rajesh Kumar' AND status = 'pending' LIMIT 1;
    SELECT id INTO task_id_2 FROM tasks WHERE customer_name = 'Priya Menon' LIMIT 1;
    SELECT id INTO task_id_3 FROM tasks WHERE customer_name = 'Rita Jose' LIMIT 1;
    
    -- Insert sample comments
    INSERT INTO task_comments (
        task_id,
        comment,
        comment_type,
        author_name,
        author_type,
        is_internal,
        is_customer_visible,
        created_at
    ) VALUES
    (
        task_id_1,
        'Customer called again, situation is urgent due to elderly family members',
        'status_update',
        'Admin User',
        'admin',
        false,
        true,
        NOW() - INTERVAL '30 minutes'
    ),
    (
        task_id_1,
        'Technician assigned, ETA 1 hour',
        'status_update',
        'System',
        'system',
        true,
        false,
        NOW() - INTERVAL '15 minutes'
    ),
    (
        task_id_2,
        'Service in progress, checking compressor and gas levels',
        'general',
        'Technician Kumar',
        'technician',
        false,
        true,
        NOW() - INTERVAL '2 hours'
    ),
    (
        task_id_3,
        'Parts ordered for door seal replacement, will arrive tomorrow',
        'status_update',
        'Admin User',
        'admin',
        false,
        true,
        NOW() - INTERVAL '1 day'
    );
END $$;

-- ====================================================
-- SAMPLE ATTACHMENTS DATA (Simulated)
-- ====================================================

-- Add sample attachment records (files would be uploaded separately)
DO $$
DECLARE
    task_id_urgent UUID;
    task_id_completed UUID;
BEGIN
    SELECT id INTO task_id_urgent FROM tasks WHERE customer_name = 'Rajesh Kumar' AND status = 'pending' LIMIT 1;
    SELECT id INTO task_id_completed FROM tasks WHERE customer_name = 'Mohammed Ali' LIMIT 1;
    
    INSERT INTO task_attachments (
        task_id,
        filename,
        original_filename,
        file_size,
        mime_type,
        storage_path,
        is_image,
        image_dimensions,
        is_public,
        created_at
    ) VALUES
    (
        task_id_urgent,
        'ac_unit_photo_001.jpg',
        'Customer AC Unit Photo.jpg',
        245760,
        'image/jpeg',
        '/uploads/tasks/' || task_id_urgent::text || '/ac_unit_photo_001.jpg',
        true,
        '1920x1080',
        false,
        NOW() - INTERVAL '2 hours'
    ),
    (
        task_id_completed,
        'service_completion_receipt.pdf',
        'Service Completion Receipt.pdf',
        51200,
        'application/pdf',
        '/uploads/tasks/' || task_id_completed::text || '/service_completion_receipt.pdf',
        false,
        NULL,
        true,
        NOW() - INTERVAL '1 day'
    );
END $$;

-- ====================================================
-- VERIFICATION QUERIES
-- ====================================================

-- Count inserted data
SELECT 
    'Tasks' as data_type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
FROM tasks
WHERE customer_name NOT LIKE 'Test%' -- Exclude any previous test data

UNION ALL

SELECT 
    'Comments' as data_type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE author_type = 'admin') as admin,
    COUNT(*) FILTER (WHERE author_type = 'system') as system,
    COUNT(*) FILTER (WHERE author_type = 'technician') as technician,
    NULL as cancelled
FROM task_comments

UNION ALL

SELECT 
    'Attachments' as data_type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_image = true) as images,
    COUNT(*) FILTER (WHERE is_public = true) as public_files,
    NULL as in_progress,
    NULL as cancelled
FROM task_attachments

UNION ALL

SELECT 
    'Audit Log' as data_type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE action = 'created') as created_actions,
    COUNT(*) FILTER (WHERE action = 'updated') as updated_actions,
    COUNT(*) FILTER (WHERE action = 'status_changed') as status_changes,
    NULL as cancelled
FROM task_audit_log;

-- Test some views with sample data
SELECT 'Dashboard Overview Test' as test_name, * FROM v_dashboard_overview;

SELECT 'Recent Tasks Test' as test_name, task_number, customer_name, status, priority 
FROM v_recent_tasks LIMIT 5;

SELECT 'Urgent Attention Test' as test_name, task_number, customer_name, attention_status
FROM v_urgent_attention LIMIT 3;

-- ====================================================
-- SUCCESS MESSAGE
-- ====================================================

DO $$
DECLARE
    task_count INTEGER;
    comment_count INTEGER;
    attachment_count INTEGER;
    audit_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO task_count FROM tasks;
    SELECT COUNT(*) INTO comment_count FROM task_comments;
    SELECT COUNT(*) INTO attachment_count FROM task_attachments;
    SELECT COUNT(*) INTO audit_count FROM task_audit_log;
    
    RAISE NOTICE '✅ Sample data inserted successfully!';
    RAISE NOTICE '📋 Tasks created: %', task_count;
    RAISE NOTICE '💬 Comments added: %', comment_count;
    RAISE NOTICE '📎 Attachments simulated: %', attachment_count;
    RAISE NOTICE '🔍 Audit entries generated: %', audit_count;
    RAISE NOTICE '🎯 Data covers all priority levels and statuses';
    RAISE NOTICE '⏰ Includes overdue, urgent, and recent tasks for testing';
    RAISE NOTICE '👥 Multiple customers with history for analytics testing';
    RAISE NOTICE '🔄 Triggers and functions tested with real data';
    RAISE NOTICE '📊 Views now populated with sample data for testing';
    RAISE NOTICE '🚀 Ready for production configuration (07_production_config.sql)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: This is SAMPLE DATA for development/testing only!';
    RAISE NOTICE '⚠️  DO NOT run this script in production environment!';
END $$;

-- ====================================================
-- SAMPLE DATA TESTING GUIDE
-- ====================================================

/*
Test Scenarios Available with Sample Data:

1. URGENT TASKS:
   - Rajesh Kumar's AC task is 3 hours old with urgent priority
   - Should appear in v_urgent_attention view

2. OVERDUE TASKS:
   - Rita Jose's refrigerator task has due_date in past
   - Should appear in overdue queries

3. CUSTOMER HISTORY:
   - Rajesh Kumar has 2 tasks (one old completed, one current urgent)
   - Test customer history and satisfaction scoring

4. ANALYTICS:
   - Tasks from last month, week, and today
   - Different priorities and statuses for testing charts

5. SEARCH FUNCTIONALITY:
   - Various keywords: "AC", "refrigerator", "cooling", etc.
   - Different locations: Thiruvalla, Kochi, etc.

6. DASHBOARD VIEWS:
   - All views now have data to display
   - Test real-time updates and filtering

7. API TESTING:
   - Different source types: chat-failed-call, admin-manual, api-direct
   - Test task creation workflows

8. AUDIT TRAIL:
   - All tasks have audit entries from triggers
   - Test change tracking and history

To Remove Sample Data (development only):
DELETE FROM task_attachments WHERE task_id IN (SELECT id FROM tasks);
DELETE FROM task_comments WHERE task_id IN (SELECT id FROM tasks);
DELETE FROM task_audit_log WHERE task_id IN (SELECT id FROM tasks);
DELETE FROM tasks;
*/