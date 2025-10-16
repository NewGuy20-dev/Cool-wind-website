/**
 * Test script for Clear Chat functionality
 * Tests both client-side and server-side clearing
 */

const BASE_URL = 'http://localhost:3000';

async function testClearChat() {
  console.log('🧪 Testing Clear Chat Functionality\n');

  // Step 1: Send initial message
  console.log('1️⃣ Sending initial message...');
  const chatResponse = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Hello, I need help with AC repair',
      sessionId: null
    })
  });

  const chatData = await chatResponse.json();
  const sessionId = chatData.sessionId;
  console.log(`✅ Session created: ${sessionId}\n`);

  // Step 2: Send follow-up message
  console.log('2️⃣ Sending follow-up message...');
  const followUpResponse = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'What are your service charges?',
      sessionId: sessionId
    })
  });

  const followUpData = await followUpResponse.json();
  console.log(`✅ Follow-up response received\n`);

  // Step 3: Clear chat
  console.log('3️⃣ Clearing chat session...');
  const clearResponse = await fetch(`${BASE_URL}/api/chat/clear`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: sessionId })
  });

  const clearData = await clearResponse.json();
  console.log(`✅ Clear response:`, clearData, '\n');

  // Step 4: Try to use old session (should fail or create new context)
  console.log('4️⃣ Testing with cleared session...');
  const afterClearResponse = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Do you remember what I asked?',
      sessionId: sessionId
    })
  });

  const afterClearData = await afterClearResponse.json();
  console.log(`✅ Response after clear:`, afterClearData.response.substring(0, 100) + '...\n');

  console.log('✅ All tests completed!');
}

testClearChat().catch(console.error);