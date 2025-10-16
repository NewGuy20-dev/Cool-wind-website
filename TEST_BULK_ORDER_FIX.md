# Test Guide: Bulk Order Session Fix

## Quick Test (2 minutes)

### Setup
```bash
# Make sure dev server is running
npm run dev
```

### Test Steps

1. **Open browser** to http://localhost:3000
2. **Open DevTools** (F12) and go to Console tab
3. **Click chat button** (bottom-right)

### Test Case: Bulk Order with Contact Info

**Message 1**: 
```
Hi so i need to buy 11 remote controls
```

**Expected Response**:
```
Great! 11 × AC Remote Control Universal

💰 Price: 11 × ₹350 = ₹3,850
🎉 Bulk discount applied! You save ₹1,100
✅ In stock (25 available)

📍 Pickup from our shop (ready in 2-4 hours)

To confirm your order, please provide:
📝 Name, Phone Number, and Email
```

**Expected Console Logs**:
```
🔐 Session management: { fromCookie: undefined, fromClient: null, using: null }
🔍 Bulk order state check: { sessionId: '...', hasExistingState: false, ... }
🛒 Bulk order flow active or detected!
📦 Bulk order response: { message: '...', nextStep: 'collecting_contact', ... }
🍪 Set session cookie: [sessionId]
```

---

**Message 2**:
```
Name is Hari and phone number is 8848850922 and email is techuse730@gmail.com
```

**Expected Response**:
```
Perfect! ✅

📍 Pickup Location:
Cool Wind Services
Pushpagiri Hospitals Rd
Thiruvalla, Kerala 689101

⏱️ Your order will be ready in 2-4 hours

Confirm this order?
```

**Expected Console Logs** (CRITICAL):
```
🔐 Session management: { 
  fromCookie: '[same-sessionId]', 
  fromClient: '[same-sessionId]', 
  using: '[same-sessionId]' 
}
♻️ Restoring session from database: [sessionId]  ← THIS IS THE FIX!
🔍 Bulk order state check: { 
  sessionId: '[same-sessionId]', 
  hasExistingState: true,  ← MUST BE TRUE!
  stateStep: 'collecting_contact',
  isBulkOrderActive: true
}
🛒 Bulk order flow active or detected!
📦 Bulk order response: { message: '...', nextStep: 'confirming', ... }
```

**What Should NOT Happen**:
```
❌ New session ID created (should be same as first message)
❌ "⚠️ No state found in database for session"
❌ "💬 Generating normal Gemini response..."
❌ Asking for "delivery location"
❌ "🔍 Checking for failed call triggers" for the contact info message
```

---

## Success Criteria

### ✅ Pass Conditions
1. Same sessionId used for both messages
2. Console shows "♻️ Restoring session from database"
3. Console shows "hasExistingState: true" for second message
4. Response asks for order confirmation (not location)
5. Response shows pickup location (not delivery)
6. No failed call detection triggered on contact info

### ❌ Fail Conditions
1. Different sessionId for second message
2. "No state found in database" warning
3. Asks for delivery location
4. Goes to regular Gemini AI
5. Failed call detection triggered

---

## Detailed Console Log Analysis

### First Message Logs
```
🔐 Session management: { fromCookie: undefined, fromClient: null, using: null }
  ↳ Normal - first message, no session yet

🔍 Bulk order state check: { hasExistingState: false, ... }
  ↳ Normal - new bulk order

🛒 Bulk order flow active or detected!
  ↳ Good - bulk order detected

POST /api/chat/bulk-order 200 in 2889ms
  ↳ Good - bulk order API called

📦 Bulk order response: { nextStep: 'collecting_contact', ... }
  ↳ Good - asking for contact info

🍪 Set session cookie: b840918e-9665-48be-9533-a000bfceb596
  ↳ Good - session saved
```

### Second Message Logs (FIXED)
```
🔐 Session management: { 
  fromCookie: 'b840918e-9665-48be-9533-a000bfceb596',  ← Cookie sent!
  fromClient: 'b840918e-9665-48be-9533-a000bfceb596',  ← Client sent same ID!
  using: 'b840918e-9665-48be-9533-a000bfceb596'        ← Using same session!
}
  ↳ CRITICAL - must be same sessionId

♻️ Restoring session from database: b840918e-9665-48be-9533-a000bfceb596
  ↳ THIS IS THE FIX! Session restored from DB

🔍 Bulk order state check: { 
  sessionId: 'b840918e-9665-48be-9533-a000bfceb596',
  hasExistingState: true,  ← MUST BE TRUE!
  stateStep: 'collecting_contact',
  isBulkOrderActive: true
}
  ↳ CRITICAL - state found and active

🛒 Bulk order flow active or detected!
  ↳ Good - continuing bulk order

📦 Bulk order response: { nextStep: 'confirming', ... }
  ↳ Good - moving to confirmation step
```

---

## Troubleshooting

### Problem: Different sessionId on second message
**Cause**: Cookie not being sent or read correctly
**Fix**: 
- Check browser cookies (DevTools → Application → Cookies)
- Verify `chat_session_id` cookie exists
- Check cookie domain and path settings

### Problem: "No state found in database"
**Cause**: State not being saved to database
**Fix**:
- Check Supabase connection
- Verify `chat_states` table exists
- Check database logs for errors

### Problem: Still asks for location
**Cause**: Not entering bulk order flow
**Fix**:
- Check if session restoration is working
- Verify bulk order state is being saved
- Check `isBulkOrderActive` flag in logs

### Problem: Failed call detection triggered
**Cause**: Bulk order not detected, falls through to failed call check
**Fix**:
- Ensure session is restored
- Check bulk order state exists
- Verify priority check order in code

---

## Additional Test Cases

### Test 2: Page Refresh During Bulk Order
1. Send first message (bulk order)
2. **Refresh page** (F5)
3. Send second message (contact info)
4. Should continue from where you left off

### Test 3: Multiple Tabs
1. Open chat in Tab 1
2. Send bulk order message
3. Open same site in Tab 2
4. Open chat in Tab 2
5. Should see same session (if cookies shared)

### Test 4: Clear Chat
1. Start bulk order
2. Click refresh icon (clear chat)
3. Send new message
4. Should start fresh conversation

---

## Expected vs Actual

### Before Fix
```
Message 1: Session A created ✅
Message 2: Session B created ❌ (WRONG!)
Result: Context lost, asks for location ❌
```

### After Fix
```
Message 1: Session A created ✅
Message 2: Session A restored ✅ (CORRECT!)
Result: Context maintained, asks for confirmation ✅
```

---

## Performance Impact

### Session Restoration Cost
- Database query: ~10-50ms
- In-memory lookup: ~1ms
- Trade-off: Slightly slower but correct behavior

### When Restoration Happens
- Only when session not in memory
- Typically after server restart or timeout
- Most requests use fast in-memory path

---

## Verification Checklist

- [ ] Dev server running
- [ ] Browser DevTools open
- [ ] Console tab visible
- [ ] Chat widget opens
- [ ] First message sends successfully
- [ ] Session cookie set
- [ ] Second message uses same session
- [ ] "Restoring session" log appears
- [ ] Bulk order state found
- [ ] Correct response (confirmation, not location)
- [ ] No failed call detection
- [ ] No errors in console

---

## Success! 🎉

If all checks pass, the fix is working correctly. The session persistence issue is resolved and bulk orders will complete successfully.

**Next**: Test in production after deployment!
