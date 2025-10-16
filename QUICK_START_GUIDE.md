# Quick Start Guide 🚀

Get your Cool Wind Services system up and running in minutes!

---

## 1. Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## 2. Test the Chat System

### Open the Chat Widget
1. Navigate to http://localhost:3000
2. Click the blue chat button (bottom-right corner)
3. Chat widget opens with welcome message

### Send Test Messages
Try these test scenarios:

#### General Inquiry
```
"I need AC repair service"
```
Expected: Bot provides service information and options

#### Bulk Order (Spare Parts)
```
"I need 15 compressors for LG refrigerators. My name is Rajesh, phone 9876543210, email rajesh@example.com"
```
Expected: 
- Detects bulk order (15 items)
- Extracts contact info
- Validates stock
- Sends confirmation email
- Creates order in database

#### Failed Call Detection
```
"I called but no one answered"
```
Expected:
- Logs failed call
- Apologizes
- Offers alternative contact methods

### Test Clear Chat
1. Send a few messages
2. Click the refresh icon (🔄) in chat header
3. Chat clears and shows welcome message
4. New session starts

---

## 3. Verify Email System

### Run Email Test
```bash
node scripts/test-email-simple.js
```

Expected output:
```
✅ Email sent successfully
Message ID: <...>
```

### Check Email Delivery
- Customer email: Check inbox for order confirmation
- Admin email: Check info@coolwindservices.com for notification

---

## 4. Check Database

### View Orders
1. Open Supabase dashboard
2. Navigate to `spare_parts_orders` table
3. See test orders created

### View Chat States
1. Navigate to `chat_states` table
2. See active sessions

### View Stock Levels
1. Navigate to `spare_parts` table
2. Check `stock_quantity` after orders

---

## 5. Test API Endpoints

### Chat API
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "sessionId": null}'
```

### Clear Chat API
```bash
curl -X DELETE http://localhost:3000/api/chat/clear \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "your-session-id"}'
```

### Bulk Order API
```bash
curl -X POST http://localhost:3000/api/chat/bulk-order \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"name": "Compressor", "quantity": 15}],
    "contactInfo": {
      "name": "Test User",
      "phone": "9876543210",
      "email": "test@example.com"
    }
  }'
```

---

## 6. Run Full Test Suite

### All Tests
```bash
node scripts/test-full-system.js
```

### Individual Tests
```bash
# Chat system
node scripts/test-chat.js

# Clear chat
node scripts/test-clear-chat.js

# Failed call detection
node scripts/test-failed-call-detection.js

# Email system
node scripts/test-email.ts
```

---

## 7. Common Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
npm run type-check   # Check TypeScript
```

### Database
```bash
# Seed data
npx ts-node scripts/seed-chat-failed-calls.ts
npx ts-node scripts/seed-failed-calls.js

# Run migrations (if needed)
# Apply SQL files in /sql folder via Supabase dashboard
```

### Testing
```bash
npm test             # Run tests
node scripts/test-*.js  # Run specific test
```

---

## 8. Troubleshooting

### Chat Not Working
1. Check console for errors (F12)
2. Verify API keys in `.env.local`
3. Check Supabase connection
4. Restart dev server

### Session Not Persisting
1. Check browser cookies are enabled
2. Clear browser cache
3. Check console logs for session ID
4. Verify database connection

### Email Not Sending
1. Check Brevo API key
2. Verify sender email is verified
3. Check DNS records (SPF, DKIM, DMARC)
4. Run `node scripts/test-email-simple.js`

### Stock Not Updating
1. Check database functions in SQL
2. Verify RLS policies
3. Check console logs for errors
4. Query database directly

### API Rate Limits
1. Check Gemini API quota
2. Verify key rotation is working
3. Add more API keys if needed
4. Monitor usage in Google AI Studio

---

## 9. Environment Variables Checklist

Make sure these are set in `.env.local`:

```bash
# Required
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ GOOGLE_AI_API_KEY
✅ BREVO_API_KEY
✅ BREVO_SENDER_EMAIL

# Optional (for rotation)
⚪ GOOGLE_AI_API_KEY_2
⚪ GOOGLE_AI_API_KEY_3

# Business Info
✅ NEXT_PUBLIC_BUSINESS_PHONE
✅ NEXT_PUBLIC_WHATSAPP_NUMBER
✅ NEXT_PUBLIC_BUSINESS_EMAIL
```

---

## 10. Quick Feature Test

### 5-Minute Smoke Test
1. ✅ Open http://localhost:3000
2. ✅ Click chat button
3. ✅ Send "Hello"
4. ✅ Get bot response
5. ✅ Click refresh icon
6. ✅ Chat clears
7. ✅ Send bulk order message
8. ✅ Check email inbox
9. ✅ Verify order in database
10. ✅ All working? Ready to deploy! 🚀

---

## 11. Deploy to Production

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Post-Deployment
1. Test production URL
2. Verify chat works
3. Send test order
4. Check email delivery
5. Monitor logs

---

## 12. Getting Help

### Check Documentation
- `SYSTEM_STATUS_COMPLETE.md` - Full system overview
- `CLEAR_CHAT_IMPLEMENTATION.md` - Clear chat details
- `SPARE_PARTS_SYSTEM_COMPLETE.md` - Spare parts feature
- `tech.md` - Technology stack
- `structure.md` - Project structure

### Debug Mode
Enable verbose logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true')
```

### Common Issues
- **Port 3000 in use**: Kill process or use different port
- **Module not found**: Run `npm install`
- **TypeScript errors**: Run `npm run type-check`
- **Build fails**: Check for syntax errors

---

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Chat widget opens and responds
- ✅ Messages persist after page reload
- ✅ Clear chat button resets conversation
- ✅ Bulk orders create database entries
- ✅ Emails arrive in inbox
- ✅ Stock quantities update
- ✅ No console errors
- ✅ Mobile view works

---

**You're all set! Start testing and enjoy your AI-powered business platform! 🎉**
