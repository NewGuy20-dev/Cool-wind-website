#!/usr/bin/env node

/**
 * Simple test script for the Chat API
 * Run with: node scripts/test-chat.js
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function testChatAPI() {
  console.log('🧪 Testing Cool Wind Services Chat API...\n');

  const testCases = [
    {
      name: 'Basic Chat Flow',
      message: 'Hello, I need help with my AC',
      expectedKeywords: ['thermostat', 'filter', 'vents']
    },
    {
      name: 'Emergency Request',
      message: 'My refrigerator is not working and I need emergency repair',
      expectedKeywords: ['technician', 'schedule', 'service']
    },
    {
      name: 'Parts Inquiry',
      message: 'I need a compressor for my Samsung AC',
      expectedKeywords: ['compressor', 'parts', 'AC']
    },
    {
      name: 'Business Info',
      message: 'What are your contact details?',
      expectedKeywords: ['Cool Wind Services', 'phone', 'location']
    }
  ];

  let sessionId = null;
  let passedTests = 0;

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      console.log(`Message: "${testCase.message}"`);

      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testCase.message,
          sessionId: sessionId,
          userId: 'test-user'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update session ID for next test
      if (data.sessionId && !sessionId) {
        sessionId = data.sessionId;
      }

      // Validate response
      const responseText = data.response?.text?.toLowerCase() || '';
      const hasValidResponse = responseText.length > 0;
      const keywordsMatch = testCase.expectedKeywords.every(kw => responseText.includes(kw));

      if (hasValidResponse && keywordsMatch) {
        console.log(`✅ PASSED`);
        console.log(`   Response: ${data.response.text.substring(0, 100)}...`);
        passedTests++;
      } else {
        console.log(`❌ FAILED`);
        console.log(`   Expected keywords: ${testCase.expectedKeywords.join(', ')}`);
        console.log(`   Actual response: ${data.response?.text || 'None'}`);
      }

      console.log('');

    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      console.log('');
    }
  }

  console.log(`\n📊 Test Results: ${passedTests}/${testCases.length} tests passed`);
  
  if (passedTests === testCases.length) {
    console.log('🎉 All tests passed! Chat system is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the configuration.');
    process.exit(1);
  }
}

// Test chat endpoint availability
async function testEndpoint() {
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test' })
    });
    
    return response.status !== 404;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log(`🌐 Testing against: ${BASE_URL}\n`);

  // Check if endpoint exists
  const endpointExists = await testEndpoint();
  if (!endpointExists) {
    console.log('❌ Chat API endpoint not found. Make sure the server is running.');
    process.exit(1);
  }

  await testChatAPI();
}

main().catch(console.error);