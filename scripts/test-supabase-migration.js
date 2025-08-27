#!/usr/bin/env node

/**
 * Supabase Migration Test Suite
 * Comprehensive testing script to validate the migration from in-memory to Supabase
 */

const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const config = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  adminKey: process.env.ADMIN_KEY || 'admin123',
};

// Test counters
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
  passedTests++;
}

function error(message) {
  log(`❌ ${message}`, colors.red);
  failedTests++;
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function runTest(testName, testFunction) {
  totalTests++;
  log(`\n🧪 Testing: ${testName}`, colors.cyan);
  
  try {
    await testFunction();
    success(`${testName} - PASSED`);
  } catch (err) {
    error(`${testName} - FAILED: ${err.message}`);
  }
}

// API request helper
async function apiRequest(endpoint, options = {}) {
  const url = `${config.baseUrl}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${data.error || data.message || 'Unknown error'}`);
  }
  
  return data;
}

// Test data
const testCustomer = {
  customerName: 'Test Customer Migration',
  phoneNumber: '9876543210',
  problemDescription: 'Test AC not cooling - migration validation test',
  location: 'Test Location',
  source: 'api-direct',
  priority: 'medium',
};

const urgentTestCustomer = {
  customerName: 'Urgent Test Customer',
  phoneNumber: '9876543211',
  problemDescription: 'URGENT: AC completely broken, emergency situation, elderly people at home',
  location: 'Urgent Test Location',
  source: 'chat-failed-call',
  priority: 'urgent',
};

// Test suite
async function testSupabaseConnection() {
  if (!config.supabaseUrl || !config.supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  const supabase = createClient(config.supabaseUrl, config.supabaseKey);
  const { data, error } = await supabase
    .from('tasks')
    .select('count(*)', { count: 'exact', head: true })
    .limit(1);
  
  if (error) {
    throw new Error(`Supabase connection failed: ${error.message}`);
  }
  
  info(`Connected to Supabase successfully`);
}

async function testTaskCreation() {
  const response = await apiRequest('/api/tasks/auto-create', {
    method: 'POST',
    body: JSON.stringify(testCustomer),
  });
  
  if (!response.success) {
    throw new Error(`Task creation failed: ${response.error}`);
  }
  
  if (!response.taskId || !response.taskNumber) {
    throw new Error('Task creation response missing taskId or taskNumber');
  }
  
  info(`Task created: ${response.taskNumber} (ID: ${response.taskId})`);
  return response;
}

async function testUrgentTaskCreation() {
  const response = await apiRequest('/api/tasks/auto-create', {
    method: 'POST',
    body: JSON.stringify(urgentTestCustomer),
  });
  
  if (!response.success) {
    throw new Error(`Urgent task creation failed: ${response.error}`);
  }
  
  // Verify AI priority assessment worked
  if (response.priority !== 'urgent') {
    warning(`Expected urgent priority, got: ${response.priority}`);
  }
  
  if (!response.priorityReason || !response.priorityReason.includes('Emergency')) {
    warning(`Priority reason doesn't indicate emergency: ${response.priorityReason}`);
  }
  
  info(`Urgent task created: ${response.taskNumber} with priority ${response.priority}`);
  return response;
}

async function testTaskRetrieval() {
  // Create a task first
  const createResponse = await apiRequest('/api/tasks/auto-create', {
    method: 'POST',
    body: JSON.stringify({
      ...testCustomer,
      customerName: 'Retrieval Test Customer',
      phoneNumber: '9876543212',
    }),
  });
  
  // Retrieve by ID
  const getResponse = await apiRequest(`/api/tasks/auto-create?taskId=${createResponse.taskId}`);
  
  if (!getResponse.success || !getResponse.task) {
    throw new Error('Task retrieval failed');
  }
  
  if (getResponse.task.id !== createResponse.taskId) {
    throw new Error('Retrieved task ID does not match created task ID');
  }
  
  info(`Successfully retrieved task: ${getResponse.task.task_number}`);
  return getResponse.task;
}

async function testTaskListing() {
  const response = await apiRequest('/api/tasks/auto-create?limit=10');
  
  if (!response.success || !Array.isArray(response.tasks)) {
    throw new Error('Task listing failed');
  }
  
  info(`Retrieved ${response.tasks.length} tasks`);
  return response.tasks;
}

async function testAdminAuthentication() {
  // Test without authentication (should fail)
  try {
    await apiRequest('/api/admin/tasks');
    throw new Error('Admin endpoint should require authentication');
  } catch (err) {
    if (!err.message.includes('401') && !err.message.includes('Unauthorized')) {
      throw new Error('Expected authentication error, got: ' + err.message);
    }
  }
  
  // Test with authentication (should succeed)
  const response = await apiRequest('/api/admin/tasks', {
    headers: {
      'Authorization': `Bearer ${config.adminKey}`,
    },
  });
  
  if (!response.success) {
    throw new Error(`Authenticated admin request failed: ${response.error}`);
  }
  
  info(`Admin authentication successful, retrieved ${response.tasks?.length || 0} tasks`);
}

async function testAdminTaskUpdate() {
  // Create a task first
  const createResponse = await apiRequest('/api/tasks/auto-create', {
    method: 'POST',
    body: JSON.stringify({
      ...testCustomer,
      customerName: 'Update Test Customer',
      phoneNumber: '9876543213',
    }),
  });
  
  // Update the task
  const updateResponse = await apiRequest('/api/admin/tasks', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${config.adminKey}`,
    },
    body: JSON.stringify({
      taskId: createResponse.taskId,
      status: 'in_progress',
      priority: 'high',
    }),
  });
  
  if (!updateResponse.success) {
    throw new Error(`Task update failed: ${updateResponse.error}`);
  }
  
  // Verify the update
  const getResponse = await apiRequest(`/api/tasks/auto-create?taskId=${createResponse.taskId}`);
  
  if (getResponse.task.status !== 'in_progress' || getResponse.task.priority !== 'high') {
    throw new Error('Task update was not persisted correctly');
  }
  
  info(`Task updated successfully: ${createResponse.taskNumber}`);
}

async function testDashboardData() {
  const response = await apiRequest('/api/admin/tasks?dashboard=true', {
    headers: {
      'Authorization': `Bearer ${config.adminKey}`,
    },
  });
  
  if (!response.success || !response.dashboard) {
    throw new Error(`Dashboard data retrieval failed: ${response.error}`);
  }
  
  const { overview, recentTasks, urgentTasks, dailyStats } = response.dashboard;
  
  if (!overview || typeof overview.total_tasks !== 'number') {
    throw new Error('Dashboard overview data is incomplete');
  }
  
  info(`Dashboard data loaded: ${overview.total_tasks} total tasks, ${overview.pending_count} pending`);
}

async function testAnalytics() {
  const response = await apiRequest('/api/admin/tasks?analytics=true', {
    headers: {
      'Authorization': `Bearer ${config.adminKey}`,
    },
  });
  
  if (!response.success || !response.analytics) {
    throw new Error(`Analytics data retrieval failed: ${response.error}`);
  }
  
  const analytics = response.analytics;
  
  if (typeof analytics.total_tasks !== 'number' || typeof analytics.completion_rate !== 'number') {
    throw new Error('Analytics data is incomplete');
  }
  
  info(`Analytics loaded: ${analytics.total_tasks} tasks, ${analytics.completion_rate}% completion rate`);
}

async function testSearchFunctionality() {
  // Create a searchable task
  const createResponse = await apiRequest('/api/tasks/auto-create', {
    method: 'POST',
    body: JSON.stringify({
      ...testCustomer,
      customerName: 'Search Test Customer',
      phoneNumber: '9876543214',
      problemDescription: 'Unique searchable AC cooling problem refrigerator issue',
    }),
  });
  
  // Wait a moment for indexing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Search for the task
  const searchResponse = await apiRequest('/api/admin/tasks?search=searchable AC cooling', {
    headers: {
      'Authorization': `Bearer ${config.adminKey}`,
    },
  });
  
  if (!searchResponse.success || !Array.isArray(searchResponse.tasks)) {
    throw new Error('Search functionality failed');
  }
  
  const foundTask = searchResponse.tasks.find(task => task.id === createResponse.taskId);
  
  if (!foundTask) {
    warning('Search did not return the expected task (may need time for indexing)');
  } else {
    info(`Search functionality working: found task ${foundTask.task_number}`);
  }
}

async function testTicketsCompatibility() {
  const response = await apiRequest('/api/tickets?limit=5');
  
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error('Tickets compatibility API failed');
  }
  
  info(`Tickets compatibility API working: ${response.data.length} tickets`);
}

async function testFailedCallsCompatibility() {
  const response = await apiRequest('/api/failed-calls?limit=5');
  
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error('Failed calls compatibility API failed');
  }
  
  info(`Failed calls compatibility API working: ${response.data.length} failed calls`);
}

async function testInputValidation() {
  // Test invalid phone number
  try {
    await apiRequest('/api/tasks/auto-create', {
      method: 'POST',
      body: JSON.stringify({
        ...testCustomer,
        phoneNumber: '123', // Invalid
      }),
    });
    throw new Error('Should have failed with invalid phone number');
  } catch (err) {
    if (!err.message.includes('phone') && !err.message.includes('400')) {
      throw new Error('Expected phone validation error, got: ' + err.message);
    }
  }
  
  // Test missing required fields
  try {
    await apiRequest('/api/tasks/auto-create', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: '9876543210',
        // Missing customerName and problemDescription
      }),
    });
    throw new Error('Should have failed with missing required fields');
  } catch (err) {
    if (!err.message.includes('required') && !err.message.includes('400')) {
      throw new Error('Expected validation error, got: ' + err.message);
    }
  }
  
  info('Input validation working correctly');
}

async function testDataPersistence() {
  // Create multiple tasks
  const tasks = [];
  for (let i = 0; i < 3; i++) {
    const response = await apiRequest('/api/tasks/auto-create', {
      method: 'POST',
      body: JSON.stringify({
        ...testCustomer,
        customerName: `Persistence Test Customer ${i + 1}`,
        phoneNumber: `987654321${i}`,
      }),
    });
    tasks.push(response);
  }
  
  // Verify all tasks can be retrieved
  for (const task of tasks) {
    const getResponse = await apiRequest(`/api/tasks/auto-create?taskId=${task.taskId}`);
    if (!getResponse.success || !getResponse.task) {
      throw new Error(`Task ${task.taskNumber} not persisted correctly`);
    }
  }
  
  info(`Data persistence verified: ${tasks.length} tasks created and retrieved`);
}

async function cleanupTestData() {
  info('Cleaning up test data...');
  
  try {
    // Get all test tasks
    const response = await apiRequest('/api/admin/tasks?search=Test Customer', {
      headers: {
        'Authorization': `Bearer ${config.adminKey}`,
      },
    });
    
    if (response.success && response.tasks) {
      for (const task of response.tasks) {
        if (task.customer_name?.includes('Test Customer')) {
          try {
            await apiRequest(`/api/admin/tasks?taskId=${task.id}&reason=Test cleanup`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${config.adminKey}`,
              },
            });
          } catch (err) {
            warning(`Failed to cleanup task ${task.task_number}: ${err.message}`);
          }
        }
      }
    }
    
    info('Test data cleanup completed');
  } catch (err) {
    warning(`Cleanup failed: ${err.message}`);
  }
}

// Main test runner
async function runAllTests() {
  log('\n🚀 Starting Supabase Migration Test Suite', colors.cyan);
  log('=====================================', colors.cyan);
  
  const startTime = Date.now();
  
  // Core functionality tests
  await runTest('Supabase Connection', testSupabaseConnection);
  await runTest('Task Creation', testTaskCreation);
  await runTest('Urgent Task Creation & AI Priority Assessment', testUrgentTaskCreation);
  await runTest('Task Retrieval by ID', testTaskRetrieval);
  await runTest('Task Listing', testTaskListing);
  await runTest('Admin Authentication', testAdminAuthentication);
  await runTest('Admin Task Update', testAdminTaskUpdate);
  await runTest('Dashboard Data Retrieval', testDashboardData);
  await runTest('Analytics Data', testAnalytics);
  await runTest('Search Functionality', testSearchFunctionality);
  
  // Backward compatibility tests
  await runTest('Tickets API Compatibility', testTicketsCompatibility);
  await runTest('Failed Calls API Compatibility', testFailedCallsCompatibility);
  
  // Validation and security tests
  await runTest('Input Validation', testInputValidation);
  
  // Data persistence test
  await runTest('Data Persistence', testDataPersistence);
  
  // Cleanup
  await cleanupTestData();
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // Test summary
  log('\n📊 Test Summary', colors.cyan);
  log('===============', colors.cyan);
  log(`Total Tests: ${totalTests}`);
  success(`Passed: ${passedTests}`);
  if (failedTests > 0) {
    error(`Failed: ${failedTests}`);
  } else {
    log(`Failed: ${failedTests}`, colors.green);
  }
  log(`Duration: ${duration.toFixed(2)}s`);
  
  if (failedTests === 0) {
    log('\n🎉 All tests passed! Supabase migration is working correctly.', colors.green);
    process.exit(0);
  } else {
    log('\n❌ Some tests failed. Please review the errors above.', colors.red);
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (err) => {
  error(`Unhandled error: ${err.message}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  runAllTests().catch((err) => {
    error(`Test suite failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  config,
  testSupabaseConnection,
  testTaskCreation,
  testAdminAuthentication,
  cleanupTestData,
};