# Google Gemini AI - API Key Rotation Setup

## Overview

Implemented automatic API key rotation to handle rate limits and distribute load across multiple Google AI API keys.

## Configuration

### Environment Variables

```bash
# Primary API Key
GOOGLE_AI_API_KEY=AIzaSyB26x441b78TzVgY3XCf5H7lvelr3xmt3g

# Secondary API Key (NEW!)
GOOGLE_AI_API_KEY_2=AIzaSyBvXeUly3la1J3SMjC_7qCvxlLDPrUT1RY

# Model Configuration
GEMINI_MODEL=gemini-2.0-flash-exp
```

## How It Works

### 1. **Automatic Rotation**
- System rotates between available API keys
- Rotation happens after **50 requests per key**
- Distributes load evenly across all keys

### 2. **Rate Limit Handling**
- If a key hits rate limit (429 error), system automatically switches to next key
- Immediate failover ensures minimal disruption
- Logs rotation events for monitoring

### 3. **Key Management**
```typescript
const API_KEYS = [
  process.env.GOOGLE_AI_API_KEY,
  process.env.GOOGLE_AI_API_KEY_2,
].filter(key => key.length > 0);

// Rotation logic
if (requestCount >= REQUESTS_PER_KEY && API_KEYS.length > 1) {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  requestCount = 0;
  console.log(`🔄 Rotated to API key ${currentKeyIndex + 1}/${API_KEYS.length}`);
}
```

## Benefits

### 1. **Higher Throughput**
- 2x API quota (2 keys = 2x requests per minute)
- Reduced rate limit errors
- Better handling of traffic spikes

### 2. **Automatic Failover**
- If one key hits limit, automatically use another
- No manual intervention needed
- Seamless user experience

### 3. **Load Distribution**
- Evenly distributes requests across keys
- Prevents single key from being overused
- Optimizes quota usage

## Monitoring

### Console Logs

**Normal Rotation:**
```
🔄 Rotated to API key 2/2
```

**Rate Limit Failover:**
```
⚠️ Rate limit hit, rotating to next API key...
🔄 Switched to API key 2/2
```

**Performance Tracking:**
```json
{
  "timestamp": "2025-01-14T14:30:00.000Z",
  "responseTime": 1234,
  "tokensUsed": 456,
  "success": true,
  "model": "gemini-2.0-flash-exp"
}
```

## Adding More Keys

To add additional API keys:

1. **Add to `.env.local`:**
```bash
GOOGLE_AI_API_KEY_3=your-third-key-here
GOOGLE_AI_API_KEY_4=your-fourth-key-here
```

2. **Update `lib/gemini/client.ts`:**
```typescript
const API_KEYS = [
  process.env.GOOGLE_AI_API_KEY || '',
  process.env.GOOGLE_AI_API_KEY_2 || '',
  process.env.GOOGLE_AI_API_KEY_3 || '',
  process.env.GOOGLE_AI_API_KEY_4 || '',
].filter(key => key.length > 0);
```

3. **Restart the application**

## Configuration Options

### Adjust Rotation Frequency

Change the number of requests before rotation:

```typescript
const REQUESTS_PER_KEY = 50; // Default: 50 requests

// Options:
// - 25: More frequent rotation (better distribution)
// - 50: Balanced (recommended)
// - 100: Less frequent rotation (fewer switches)
```

### Disable Rotation

To use only one key (no rotation):

```bash
# Remove or comment out secondary keys
# GOOGLE_AI_API_KEY_2=...
```

System will automatically detect single key and skip rotation logic.

## Rate Limits

### Google AI Free Tier
- **Requests per minute:** 15 RPM per key
- **Requests per day:** 1,500 RPD per key
- **Tokens per minute:** 1M TPM per key

### With 2 Keys
- **Effective RPM:** 30 RPM (2x)
- **Effective RPD:** 3,000 RPD (2x)
- **Effective TPM:** 2M TPM (2x)

## Testing

### Test Rotation

```bash
# Make multiple requests to trigger rotation
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "sessionId": "test"}'

# Repeat 50+ times to see rotation in logs
```

### Test Rate Limit Handling

```bash
# Simulate rate limit by making rapid requests
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Test $i\", \"sessionId\": \"test-$i\"}" &
done
```

## Troubleshooting

### Issue: Keys Not Rotating

**Check:**
1. Both keys are set in `.env.local`
2. Application restarted after adding keys
3. Request count reaching threshold (50 requests)

**Solution:**
```bash
# Verify keys are loaded
console.log('API Keys configured:', API_KEYS.length);
```

### Issue: Rate Limits Still Occurring

**Possible Causes:**
1. Both keys hitting limits simultaneously
2. Traffic exceeding combined quota
3. Keys not properly configured

**Solutions:**
- Add more API keys
- Reduce REQUESTS_PER_KEY for faster rotation
- Implement request queuing/throttling

### Issue: One Key Failing

**Behavior:**
- System automatically skips failed key
- Uses only working keys
- Logs errors for monitoring

**Action:**
- Check key validity in Google AI Studio
- Replace failed key with new one
- Monitor error logs

## Best Practices

1. **Monitor Usage**
   - Track requests per key
   - Watch for rate limit patterns
   - Adjust rotation frequency as needed

2. **Key Security**
   - Never commit keys to git
   - Use environment variables
   - Rotate keys periodically

3. **Quota Management**
   - Distribute load evenly
   - Plan for peak traffic
   - Have backup keys ready

4. **Error Handling**
   - Log all rotation events
   - Alert on repeated failures
   - Implement graceful degradation

## Status

✅ **ACTIVE** - API key rotation is now enabled with 2 keys

### Current Configuration:
- **Primary Key:** AIzaSyB26x441b78TzVgY3XCf5H7lvelr3xmt3g
- **Secondary Key:** AIzaSyBvXeUly3la1J3SMjC_7qCvxlLDPrUT1RY
- **Rotation Frequency:** Every 50 requests
- **Auto-Failover:** Enabled

---

**Date:** January 14, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
