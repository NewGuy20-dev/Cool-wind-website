# Chatbot JSON Parse Error - Diagnosis & Fix

## Problem Summary

**Error Message:**
```
Chat API Error: SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

**Root Cause:**
The `/api/chat/route.ts` was calling `response.json()` on fetch responses without validating:
- Response status (response.ok)
- Content-Type headers
- Whether the response is actually JSON

When the `/api/chat/bulk-order` API returned an HTML error page (404/500), the `.json()` call failed with the "Unexpected token '<'" error.

---

## Issues Identified

### 1. **Bulk Order Detection API Call (Line 283-291)**
```typescript
// ❌ BEFORE - No validation
const bulkOrderCheck = await fetch(`${request.nextUrl.origin}/api/chat/bulk-order`, {...});
const { isBulkOrder } = await bulkOrderCheck.json(); // Fails if HTML returned
```

**Problems:**
- No check for `response.ok`
- No validation of content-type
- No try-catch block
- No error logging

### 2. **Bulk Order Response Generation (Line 400-410)**
```typescript
// ❌ BEFORE - No validation
const bulkOrderResponse = await fetch(`${request.nextUrl.origin}/api/chat/bulk-order`, {...});
const bulkOrderData = await bulkOrderResponse.json(); // Fails if HTML returned
```

**Same problems as above**

### 3. **Missing Environment Variables**
Missing from `.env` file:
- `GOOGLE_AI_API_KEY` - Required for Gemini AI
- `GOOGLE_AI_API_KEY_2` - Optional backup key for rotation

---

## Fixes Implemented

### ✅ Added Comprehensive Error Handling

**For Bulk Order Detection (Lines 283-333):**
```typescript
try {
  console.log('🔍 Calling bulk order detection API:', `${request.nextUrl.origin}/api/chat/bulk-order`);
  
  const bulkOrderCheck = await fetch(...);
  
  // Log response details
  console.log('📊 Response status:', bulkOrderCheck.status);
  console.log('📊 Response headers:', Object.fromEntries(bulkOrderCheck.headers.entries()));
  
  // ✅ Validate response status
  if (!bulkOrderCheck.ok) {
    console.error('❌ API error:', {
      status: bulkOrderCheck.status,
      statusText: bulkOrderCheck.statusText
    });
    const errorText = await bulkOrderCheck.text();
    console.error('❌ Error body:', errorText.substring(0, 500));
    isBulkOrderDetected = false;
  } else {
    // ✅ Validate content-type
    const contentType = bulkOrderCheck.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Non-JSON response:', { contentType });
      const responseText = await bulkOrderCheck.text();
      console.error('❌ Response text:', responseText.substring(0, 500));
      isBulkOrderDetected = false;
    } else {
      // ✅ Safe to parse JSON
      const data = await bulkOrderCheck.json();
      console.log('✅ Detection result:', data);
      isBulkOrderDetected = data.isBulkOrder || false;
    }
  }
} catch (bulkOrderError: any) {
  // ✅ Catch any exceptions
  console.error('❌ Exception:', {
    message: bulkOrderError.message,
    stack: bulkOrderError.stack
  });
  isBulkOrderDetected = false;
}
```

**For Bulk Order Response (Lines 441-538):**
- Same comprehensive error handling
- Added fallback responses for user experience
- Graceful degradation when API fails

---

## Debugging Features Added

### 1. **Request Logging**
```typescript
console.log('🔍 Calling API:', url);
console.log('📤 Request payload:', { action, messageLength, stateStep });
```

### 2. **Response Logging**
```typescript
console.log('📊 Response status:', response.status);
console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
```

### 3. **Error Logging**
```typescript
console.error('❌ API error:', { status, statusText, url });
console.error('❌ Error body:', errorText.substring(0, 500));
```

### 4. **Content-Type Validation**
```typescript
const contentType = response.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) {
  console.error('❌ Non-JSON response:', { contentType });
  // Log actual response text
}
```

### 5. **Exception Handling**
```typescript
catch (error: any) {
  console.error('❌ Exception:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
}
```

---

## User-Friendly Fallbacks

When API calls fail, users now see helpful messages instead of errors:

```typescript
// Fallback response for bulk order failures
response = {
  text: "I'm having trouble processing your bulk order right now. Please contact us directly at +91 85472 29991 for assistance.",
  quickReplies: [
    { text: "📞 Call Now", action: "tel:+918547229991" },
    { text: "💬 WhatsApp", action: "https://wa.me/918547229991" }
  ]
};
```

---

## Environment Variables to Add

Add these to your `.env` file (local) and Vercel environment variables (production):

```bash
# Google AI API Keys for Gemini
GOOGLE_AI_API_KEY=your_primary_api_key_here
GOOGLE_AI_API_KEY_2=your_backup_api_key_here  # Optional but recommended

# Optional: Gemini Model Override
GEMINI_MODEL=gemini-2.0-flash-exp
```

### How to Get Google AI API Key:
1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add to your environment variables
4. For production: Add to Vercel → Project Settings → Environment Variables

---

## Testing Checklist

### Local Testing
- [ ] Add `GOOGLE_AI_API_KEY` to `.env` file
- [ ] Run `npm run dev`
- [ ] Open chatbot and send a message
- [ ] Check console logs for debugging output
- [ ] Verify no JSON parse errors appear

### Production Testing (Vercel)
- [ ] Add environment variables in Vercel dashboard
- [ ] Redeploy the application
- [ ] Test chatbot on live site
- [ ] Monitor Vercel logs for any errors
- [ ] Check Google Cloud Console for API usage

### Error Scenarios to Test
- [ ] Send normal chat messages
- [ ] Try bulk order flow
- [ ] Test with missing API keys (should show fallback)
- [ ] Test with network errors (should show fallback)
- [ ] Verify all error messages are user-friendly

---

## Monitoring & Debugging

### View Logs in Production (Vercel)
1. Go to Vercel Dashboard → Your Project
2. Click "Deployments" → Select latest deployment
3. Click "Functions" → Select the chat API function
4. View real-time logs

### Look for These Log Patterns:

**✅ Successful Request:**
```
🔍 Calling bulk order detection API: https://coolwind.co.in/api/chat/bulk-order
📊 Response status: 200
✅ Detection result: { isBulkOrder: false }
```

**❌ Failed Request (HTML Response):**
```
🔍 Calling bulk order detection API: https://coolwind.co.in/api/chat/bulk-order
📊 Response status: 404
❌ Non-JSON response: { contentType: 'text/html' }
❌ Response text: <!doctype html><html>...
```

**❌ Network/Exception:**
```
❌ Exception: {
  message: 'fetch failed',
  stack: '...',
  name: 'TypeError'
}
```

---

## Prevention Best Practices

### Always Validate API Responses:
```typescript
// ✅ CORRECT Pattern
const response = await fetch(url);

if (!response.ok) {
  const errorText = await response.text();
  console.error('API Error:', errorText);
  return fallbackResponse;
}

const contentType = response.headers.get('content-type');
if (!contentType?.includes('application/json')) {
  console.error('Non-JSON response');
  return fallbackResponse;
}

const data = await response.json();
return data;
```

### Use Try-Catch for External APIs:
```typescript
try {
  const response = await fetch(externalAPI);
  // ... validation and parsing
} catch (error) {
  console.error('Exception:', error);
  return fallbackResponse;
}
```

---

## Summary

**What Was Fixed:**
1. ✅ Added response.ok validation before JSON parsing
2. ✅ Added content-type checking
3. ✅ Wrapped all fetch calls in try-catch blocks
4. ✅ Added comprehensive error logging
5. ✅ Implemented user-friendly fallback responses
6. ✅ Identified missing GOOGLE_AI_API_KEY environment variables

**What to Do Next:**
1. Add `GOOGLE_AI_API_KEY` to environment variables
2. Deploy the updated code
3. Test the chatbot thoroughly
4. Monitor logs for any remaining issues

**Expected Outcome:**
- No more JSON parse errors
- Clear error logging when APIs fail
- Users see helpful fallback messages instead of crashes
- Easy debugging with detailed console logs

---

## Files Modified

- ✅ `/app/api/chat/route.ts` - Added comprehensive error handling (Lines 283-333, 441-538)

## Files to Update

- 📝 `.env` - Add GOOGLE_AI_API_KEY
- 📝 Vercel Environment Variables - Add GOOGLE_AI_API_KEY in production

---

*Last Updated: October 19, 2025*
