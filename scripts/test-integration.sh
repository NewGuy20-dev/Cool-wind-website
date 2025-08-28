#!/bin/bash

# Integration test script for Cool Wind Services Admin Tasks

echo "🧪 Running Admin Tasks Integration Tests"
echo "========================================"

# Test 1: GET admin tasks (should return camelCase tasks)
echo -e "\n1. Testing GET /api/admin/tasks"
echo "curl -s -H \"Authorization: Bearer coolwind2024\" http://localhost:3000/api/admin/tasks"
curl -s -H "Authorization: Bearer coolwind2024" http://localhost:3000/api/admin/tasks | jq '.'

# Test 2: POST failed-calls (create a task via API endpoint — uses idempotency via externalId)
echo -e "\n2. Testing POST /api/failed-calls (first time)"
echo "curl -X POST http://localhost:3000/api/failed-calls -H \"Content-Type: application/json\" -d '{\"title\":\"test failed call\",\"description\":\"test\",\"source\":\"chat-failed-call\",\"externalId\":\"test-ext-123\"}'"
curl -X POST http://localhost:3000/api/failed-calls \
  -H "Content-Type: application/json" \
  -d '{"title":"test failed call","description":"test","source":"chat-failed-call","externalId":"test-ext-123"}' | jq '.'

# Test 3: Attempt duplicate POST (should return existing task, not create a second)
echo -e "\n3. Testing POST /api/failed-calls (duplicate - should be idempotent)"
echo "curl -X POST http://localhost:3000/api/failed-calls -H \"Content-Type: application/json\" -d '{\"title\":\"test failed call\",\"description\":\"test\",\"source\":\"chat-failed-call\",\"externalId\":\"test-ext-123\"}'"
curl -X POST http://localhost:3000/api/failed-calls \
  -H "Content-Type: application/json" \
  -d '{"title":"test failed call","description":"test","source":"chat-failed-call","externalId":"test-ext-123"}' | jq '.'

echo -e "\n✅ Integration tests completed!"