#!/usr/bin/env node

/**
 * E2E test script for the Admin Tasks API POST endpoint.
 * Run with: node scripts/test-admin-task-api.js
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const ADMIN_TOKEN = 'coolwind2024';

async function testAdminTaskApi() {
  console.log('🧪 Testing Admin Tasks API POST endpoint...\n');

  const taskData = {
    customer_name: 'Test Customer',
    phone_number: '9876543210',
    problem_description: 'Fixing a test issue',
    location: '123 Test St, Test City',
    priority: 'high',
    source: 'admin-manual',
    metadata: {
      test_run: 'true',
      timestamp: new Date().toISOString()
    }
  };

  try {
    console.log('Sending POST request to /api/admin/tasks with data:');
    console.log(JSON.stringify(taskData, null, 2));

    const response = await fetch(`${BASE_URL}/api/admin/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify(taskData)
    });

    console.log(`\nReceived response: ${response.status} ${response.statusText}`);

    const responseBody = await response.json();
    console.log('Response body:');
    console.log(JSON.stringify(responseBody, null, 2));

    if (response.ok && response.status === 201) {
      console.log('\n✅ PASSED: Task created successfully.');
      // Basic validation of the returned data
      if (responseBody.task && responseBody.task.id && responseBody.task.customer_name === taskData.customer_name) {
        console.log('   - Response contains a task ID and correct customer name.');
        process.exit(0);
      } else {
        console.log('   - ❌ FAILED: Response data is missing expected fields.');
        process.exit(1);
      }
    } else {
      console.log(`\n❌ FAILED: API returned an error.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ ERROR: An unexpected error occurred during the test.');
    console.error(error);
    process.exit(1);
  }
}

async function checkServer() {
    try {
        const response = await fetch(BASE_URL);
        // We just need to know if the server is responding, any status code is fine
        return true;
    } catch (error) {
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
            return false;
        }
        // Other errors might be network issues, but we'll assume the server is down
        return false;
    }
}


async function main() {
    console.log(`🌐 Testing against: ${BASE_URL}\n`);

    const serverRunning = await checkServer();
    if (!serverRunning) {
        console.log('❌ Server is not running. Please start the development server with `npm run dev` before running this test.');
        process.exit(1);
    }

    await testAdminTaskApi();
}

main().catch(console.error);
