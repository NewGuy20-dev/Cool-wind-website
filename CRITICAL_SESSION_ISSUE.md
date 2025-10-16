# CRITICAL: Session ID Not Persisting

## The Core Problem

The bulk order system is **technically working correctly**, but the **sessionId changes between messages**, causing the state to be lost.

## Evidence from Logs

```
Message 1: sessionId: '0c3cc8da-...'  → Bulk order state saved ✅
Message 2: sessionId: '28ecafcb-...'  → Different session! State not found ❌
Message 3: sessionId: '28ecafcb-...'  → Still different session ❌
```

## Why This Happens

The chat widget is creating a **new session on every page load or component re-render**.

Even though we implemented:
- ✅ sessionStorage persistence
- ✅ useRef for immediate updates
- ✅ Database storage for state

The sessionId itself is not being maintained properly.

## The Real Issue

Looking at the chat widget initialization:

```typescript
const [sessionId, setSessionId] = useState<string | null>(() => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('chat_session_id');
  }
  return null;
});
```

This SHOULD work, but something is clearing the sessionStorage or the component is being completely unmounted and remounted.

## Possible Causes

1. **Page refresh** - User refreshing the page
2. **Component unmount** - Chat widget being unmounted/remounted
3. **sessionStorage cleared** - Browser clearing storage
4. **React strict mode** - Double rendering in development
5. **Hot reload** - Next.js dev server hot reloading

## The Ultimate Solution

We need to use **cookies** instead of sessionStorage because:
- Cookies persist across page reloads
- Cookies are sent with every request
- Server can set and read cookies
- More reliable than client-side storage

### Implementation

```typescript
// Set cookie on server response
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  let sessionId = request.cookies.get('chat_session_id')?.value;
  
  if (!sessionId) {
    sessionId = uuidv4();
  }
  
  // ... handle request ...
  
  const response = NextResponse.json(responseData);
  response.cookies.set('chat_session_id', sessionId, {
    httpOnly: false, // Allow client to read
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 30, // 30 minutes
  });
  
  return response;
}
```

## Temporary Workaround

For now, users must:
1. **Not refresh the page** during bulk order flow
2. **Complete the order quickly** (within 5 minutes)
3. **Keep the chat widget open** throughout the process

## Status

🔴 **CRITICAL** - System is not production-ready until session persistence is fixed

The bulk order logic is perfect, but the session management is broken.

---

**Date:** January 15, 2025  
**Priority:** CRITICAL  
**Blocker:** Yes - prevents bulk orders from working
**Solution:** Implement cookie-based session management
