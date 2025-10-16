# Chat State Persistence Issue

## Problem

The bulk order flow is losing state between messages because `ChatStateManager` uses **in-memory storage** (JavaScript `Map`), which is cleared when:

1. **Next.js hot reload** (development)
2. **Server restart** (production)
3. **Application redeploy** (production)
4. **Serverless function cold start** (Vercel/Netlify)

## Evidence

From logs:
```
Message 1: Chat state set for session 83a7550f-...: bulk_order
Message 2: hasExistingState: false ← State lost!
```

## Root Cause

```typescript
// lib/chat/chat-state.ts
export class ChatStateManager {
  private static states = new Map<string, ChatState>(); // ← IN-MEMORY!
}
```

## Solutions

### Option 1: Redis (Recommended for Production)
**Pros:**
- Fast (in-memory database)
- Persistent across restarts
- Scalable
- TTL support for automatic cleanup

**Cons:**
- Requires Redis server
- Additional infrastructure cost

**Implementation:**
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

static async setChatState(sessionId: string, stateKey: string, stateData: any): Promise<void> {
  const key = `chat:${sessionId}`;
  const state = await redis.hget(key, 'state') || '{}';
  const parsed = JSON.parse(state);
  parsed[stateKey] = stateData;
  await redis.hset(key, 'state', JSON.stringify(parsed));
  await redis.expire(key, 1800); // 30 minutes TTL
}
```

### Option 2: Database (Supabase)
**Pros:**
- Already have Supabase
- Persistent
- Can query/analyze states

**Cons:**
- Slower than Redis
- More database load

**Implementation:**
```sql
CREATE TABLE chat_states (
  session_id TEXT PRIMARY KEY,
  state JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_states_updated ON chat_states(updated_at);
```

### Option 3: Session Cookies (Quick Fix)
**Pros:**
- No additional infrastructure
- Works immediately
- Client-side storage

**Cons:**
- Limited size (4KB)
- Sent with every request
- Client can manipulate

**Implementation:**
```typescript
// Store in encrypted cookie
import { serialize, parse } from 'cookie';

static setChatState(sessionId: string, stateKey: string, stateData: any, res: Response): void {
  const state = { [stateKey]: stateData };
  const cookie = serialize('chat_state', JSON.stringify(state), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1800, // 30 minutes
    path: '/',
  });
  res.headers.set('Set-Cookie', cookie);
}
```

### Option 4: Vercel KV (Easiest for Vercel)
**Pros:**
- Built-in to Vercel
- Redis-compatible
- Easy setup

**Cons:**
- Vercel-specific
- Costs money

**Implementation:**
```typescript
import { kv } from '@vercel/kv';

static async setChatState(sessionId: string, stateKey: string, stateData: any): Promise<void> {
  const key = `chat:${sessionId}`;
  await kv.hset(key, { [stateKey]: JSON.stringify(stateData) });
  await kv.expire(key, 1800);
}
```

## Recommended Solution

For **immediate fix** (development): Use session cookies
For **production**: Use Vercel KV or Redis

## Implementation Plan

### Phase 1: Quick Fix (Session Cookies)
1. Store bulk order state in encrypted cookie
2. Restore state from cookie on each request
3. Clear cookie when order complete

### Phase 2: Production Solution (Vercel KV)
1. Set up Vercel KV
2. Migrate ChatStateManager to use KV
3. Add TTL for automatic cleanup
4. Monitor performance

## Current Workaround

Until we implement persistent storage, users need to complete the bulk order flow **without refreshing the page** and **within a few minutes** to avoid hot reload clearing the state.

## Status

🔴 **CRITICAL** - State persistence is broken, bulk orders cannot be completed reliably

---

**Date:** January 15, 2025  
**Priority:** CRITICAL  
**Impact:** Users cannot complete bulk orders via chat
