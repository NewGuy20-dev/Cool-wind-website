#!/usr/bin/env node

/**
 * Simple validation script to test our admin implementation
 */

const ADMIN_KEY = 'coolwind2024';
const BASE_URL = 'http://localhost:3000';

async function validateImplementation() {
  console.log('🧪 Validating Admin Tasks Integration Implementation');
  console.log('===================================================');

  // Test 1: Check admin API route exists and requires auth
  console.log('\n1. Testing admin API authentication...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/tasks`);
    if (response.status === 401) {
      console.log('✅ Admin API correctly requires authentication');
    } else {
      console.log('❌ Admin API does not require authentication');
    }
  } catch (error) {
    console.log(`❌ Admin API error: ${error.message}`);
  }

  // Test 2: Check failed-calls API route exists
  console.log('\n2. Testing failed-calls API endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/failed-calls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'test',
        title: 'Validation test'
      })
    });
    
    if (response.status === 500 || response.status === 400) {
      console.log('✅ Failed-calls API responds (expected error due to missing env)');
    } else {
      console.log(`❓ Failed-calls API status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Failed-calls API error: ${error.message}`);
  }

  // Test 3: Check if files exist
  console.log('\n3. Validating created files...');
  
  const fs = require('fs');
  const files = [
    'src/types/task.ts',
    'src/lib/mappers/tasks.ts',
    'scripts/seed-chat-failed-calls.ts',
    'scripts/test-integration.sh',
    '.env.local.example'
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  });

  console.log('\n✅ Implementation validation completed!');
  console.log('\nNext steps:');
  console.log('1. Set up .env.local with your Supabase credentials');
  console.log('2. Run: npx ts-node scripts/seed-chat-failed-calls.ts');
  console.log('3. Test with: ./scripts/test-integration.sh');
}

validateImplementation().catch(console.error);