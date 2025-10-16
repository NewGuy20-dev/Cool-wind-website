# Chat Bulk Order Integration Guide

## Overview

The bulk order feature is now integrated with the chat widget. When users mention bulk orders or spare parts, the chat will guide them through the ordering process.

## How It Works

### 1. Intent Detection
When a user sends a message, the chat checks if it's about bulk ordering:
- Keywords: "bulk order", "spare parts", "compressor", "wholesale", etc.
- If detected, starts the bulk order flow

### 2. Order Flow Steps

**Step 1: Collect Part Information**
```
User: "I need AC compressors"
Bot: "Great! I can help you with bulk orders. What spare parts do you need?"
```

**Step 2: Collect Quantity**
```
User: "AC Compressor LG 1.5 Ton"
Bot: "Got it! How many units do you need?"
User: "10"
Bot: "Perfect! 10 units noted. 🎉 Bulk discount will be applied!"
```

**Step 3: Collect Contact Details**
```
Bot: "Now, I need your contact details:"
Bot: "1️⃣ What's your name?"
User: "John Doe"
Bot: "2️⃣ What's your phone number?"
User: "+919876543210"
Bot: "3️⃣ What's your email?"
User: "john@example.com"
Bot: "4️⃣ Where should we prepare the order for pickup?"
User: "Thiruvalla"
```

**Step 4: Confirm Order**
```
Bot: "📋 Order Summary
Items: AC Compressor LG 1.5 Ton x 10
Customer: John Doe
Phone: +919876543210
Email: john@example.com
Pickup: Thiruvalla

✅ Confirm this order?"
User: "Yes, Place Order"
```

**Step 5: Order Placed**
```
Bot: "✅ Order placed successfully! You'll receive a confirmation email shortly.

📍 Pickup Location:
Cool Wind Services
Pushpagiri Hospitals Rd
Thiruvalla, Kerala 689101

Ready in 2-4 hours!"
```

### 3. Email Confirmation

After order is placed:
- ✅ Customer receives confirmation email
- ✅ Email includes pickup address with Google Maps link
- ✅ Plus code (9HMH+J3) links to Google Maps
- ✅ Admin receives order notification

### 4. Admin Dashboard

Order appears in admin dashboard:
- `/dashboard-wind-ops/orders`
- Shows all order details
- Customer contact info
- Order status management

## API Endpoints

### POST /api/chat/bulk-order

**Detect Intent:**
```json
{
  "action": "detect_intent",
  "message": "I need bulk AC parts"
}
```

**Response:**
```json
{
  "isBulkOrder": true
}
```

**Search Parts:**
```json
{
  "action": "search_parts",
  "message": "compressor"
}
```

**Response:**
```json
{
  "parts": [
    {
      "id": "uuid",
      "name": "AC Compressor LG 1.5 Ton",
      "price": 8500,
      "bulkPrice": 7500
    }
  ]
}
```

**Generate Response:**
```json
{
  "action": "generate_response",
  "message": "10",
  "state": {
    "step": "collecting_quantity",
    "parts": [...]
  }
}
```

**Response:**
```json
{
  "message": "Perfect! 10 units noted...",
  "nextStep": "collecting_contact",
  "quickReplies": ["Continue"]
}
```

**Create Order:**
```json
{
  "action": "create_order",
  "state": {
    "step": "confirming",
    "parts": [...],
    "customerName": "John Doe",
    "customerPhone": "+919876543210",
    "customerEmail": "john@example.com",
    "deliveryLocation": "Thiruvalla"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderNumber": "CW-20250114-0001"
}
```

## Integration with Existing Chat

### Option 1: Add to Chat API Route

In your existing `app/api/chat/route.ts`, add:

```typescript
import { detectBulkOrderIntent } from '@/lib/chat/bulk-order-handler';

// In your chat handler
const isBulkOrder = detectBulkOrderIntent(userMessage);

if (isBulkOrder) {
  // Redirect to bulk order flow
  return NextResponse.json({
    message: "I can help you with bulk orders! Let me guide you through the process.",
    action: 'start_bulk_order'
  });
}
```

### Option 2: Add to Chat Widget

In `components/chat/ChatWidget.tsx`, add:

```typescript
import { detectBulkOrderIntent } from '@/lib/chat/bulk-order-handler';

// When user sends message
const handleSendMessage = async (message: string) => {
  // Check if it's a bulk order
  const response = await fetch('/api/chat/bulk-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'detect_intent',
      message
    })
  });
  
  const { isBulkOrder } = await response.json();
  
  if (isBulkOrder) {
    // Start bulk order flow
    setBulkOrderMode(true);
  }
};
```

## Files Created

1. **lib/chat/bulk-order-handler.ts** - Core bulk order logic
2. **app/api/chat/bulk-order/route.ts** - API endpoint
3. **lib/email/templates.ts** - Updated with pickup address
4. **lib/spare-parts/constants.ts** - Added shop address

## Shop Address

```
Cool Wind Services
Pushpagiri Hospitals Rd
Thiruvalla, Kerala 689101

Plus Code: 9HMH+J3 Thiruvalla, Kerala
Google Maps: https://maps.google.com/?q=9HMH+J3+Thiruvalla,+Kerala
```

## Testing

### Test Bulk Order Flow:

1. Open chat widget
2. Type: "I need bulk AC parts"
3. Follow the prompts
4. Complete the order
5. Check email for confirmation
6. Check admin dashboard for order

### Test Keywords:
- "bulk order"
- "spare parts"
- "I need 10 compressors"
- "wholesale price"
- "dealer price"

## Next Steps

1. **Integrate with existing chat** - Add bulk order detection to your chat API
2. **Test the flow** - Complete a test order end-to-end
3. **Customize responses** - Adjust messages to match your brand voice
4. **Add more features**:
   - Part recommendations
   - Price calculations in chat
   - Order tracking via chat
   - Payment links

## Notes

- Orders are saved with `source: 'chat'`
- Chat conversation ID is linked to order
- Email includes Google Maps link for pickup
- Plus code (9HMH+J3) is clickable
- Admin can see all orders in dashboard
- Stock is NOT automatically deducted (admin confirms first)

---

**Ready to use!** Just integrate with your existing chat widget and test! 🚀
