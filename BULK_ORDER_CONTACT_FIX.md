# Bulk Order Contact Info Fix

## Problem
When users provided contact information during the bulk order flow, the chat was not continuing properly. Instead of showing the pickup location and confirmation, it was reverting to the general greeting.

## Root Cause
The `generateBulkOrderResponse()` function was modifying the `state` object (adding `customerName`, `customerPhone`, `customerEmail`), but these changes weren't being persisted back to the `ChatStateManager`. 

The function only returned:
```typescript
{
  message: string;
  quickReplies?: string[];
  nextStep: BulkOrderState['step'];
}
```

But the updated state properties were lost.

## Solution

### 1. Updated Return Type
Modified `generateBulkOrderResponse()` to include `updatedState`:

```typescript
export function generateBulkOrderResponse(...): {
  message: string;
  quickReplies?: string[];
  nextStep: BulkOrderState['step'];
  needsCatalogSearch?: boolean;
  searchQuery?: string;
  updatedState?: Partial<BulkOrderState>; // NEW!
}
```

### 2. Return Updated State in `collecting_contact` Case
```typescript
case 'collecting_contact':
  // Extract contact info
  const extractedInfo = extractContactInfo(userMessage);
  
  // Update state
  if (extractedInfo.name) state.customerName = extractedInfo.name;
  if (extractedInfo.phone) state.customerPhone = extractedInfo.phone;
  if (extractedInfo.email) state.customerEmail = extractedInfo.email;
  
  // Check if all info collected
  if (all collected) {
    return {
      message: "Perfect! ✅ ...",
      nextStep: 'confirming',
      updatedState: {  // NEW!
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        customerEmail: state.customerEmail,
        deliveryLocation: state.deliveryLocation,
      },
    };
  }
```

### 3. Merge Updated State in API Route
```typescript
// app/api/chat/route.ts
ChatStateManager.setChatState(session.sessionId, 'bulk_order', {
  ...bulkOrderState,
  step: bulkOrderData.nextStep,
  ...(bulkOrderData.updatedState || {}), // NEW! Merge updated state
});
```

### 4. Fixed Database Query Issue
Changed `searchPartsForChat()` from using `fetch()` (which requires absolute URLs) to direct Supabase query:

```typescript
// Before (BROKEN in server-side)
const response = await fetch('/api/spare-parts/search', { ... });

// After (WORKS in server-side)
const { data } = await supabase
  .from('spare_parts')
  .select('id, name, price, bulk_price')
  .eq('is_available', true)
  .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
  .limit(5);
```

## Expected Flow Now

### Test Case: "I want to order 10 remote controls"

**Step 1: User sends initial message**
```
User: "I want to order 10 remote controls"
```

**Step 2: System detects intent, searches catalog, shows pricing**
```
AI: "Great! 10 × AC Remote Control Universal
💰 Price: 10 × ₹450 = ₹4,500
📍 Pickup from our shop (ready in 2-4 hours)
To confirm your order, please provide:
📝 Name, Phone Number, and Email"

State: { step: 'collecting_contact', parts: [...] }
```

**Step 3: User provides contact info**
```
User: "John Doe, 9876543210, john@example.com"
```

**Step 4: System extracts info, shows pickup location**
```
AI: "Perfect! ✅
📍 Pickup Location:
Cool Wind Services
Pushpagiri Hospitals Rd
Thiruvalla, Kerala 689101

⏱️ Your order will be ready in 2-4 hours

Confirm this order?"

State: {
  step: 'confirming',
  customerName: 'John Doe',
  customerPhone: '9876543210',
  customerEmail: 'john@example.com',
  deliveryLocation: 'Thiruvalla, Kerala'
}
```

**Step 5: User confirms**
```
User: Clicks "Yes, Place Order"
```

**Step 6: Order created, emails sent**
```
AI: "✅ Order placed successfully! You'll receive a confirmation email shortly..."

State: { step: 'complete' }
```

## Files Modified

1. **lib/chat/bulk-order-handler.ts**
   - Updated return type to include `updatedState`
   - Modified `collecting_contact` case to return updated state
   - Fixed `searchPartsForChat()` to use direct database query

2. **app/api/chat/route.ts**
   - Updated state persistence to merge `updatedState`

## Testing

To test the fix:

1. Start dev server: `npm run dev`
2. Open chat widget
3. Type: "I want to order 10 remote controls"
4. Verify: Shows pricing and asks for contact info
5. Type: "John Doe, 9876543210, john@example.com"
6. Verify: Shows pickup location and confirmation buttons (NOT general greeting)
7. Click: "Yes, Place Order"
8. Verify: Shows success message and sends emails

## Status

✅ **FIXED** - Contact information is now properly extracted and persisted through the conversation flow.

---

**Date:** January 14, 2025  
**Issue:** Contact info not persisting in bulk order flow  
**Resolution:** Added `updatedState` to response and merged in state manager
