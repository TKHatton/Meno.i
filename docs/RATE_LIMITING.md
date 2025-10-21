# Rate Limiting Documentation

MenoAI implements comprehensive rate limiting to protect the API from abuse, ensure fair usage, and maintain service quality for all users.

---

## Overview

Rate limiting is applied at multiple levels with different limits for different types of endpoints based on their resource intensity and security sensitivity.

All rate limits are **per IP address** by default. Future enhancements will track authenticated users by user ID.

---

## Rate Limit Configuration

### 1. General API Endpoints

**Applied to**: All API routes (baseline protection)

| Parameter | Value |
|-----------|-------|
| Window | 15 minutes |
| Max Requests | 100 |
| Applies To | All endpoints except health checks |

**Example Response Headers**:
```
RateLimit-Limit: 100
RateLimit-Remaining: 98
RateLimit-Reset: 895
```

**Error Response** (when limit exceeded):
```json
{
  "error": "Too many requests",
  "message": "You have exceeded the rate limit. Please try again later.",
  "retryAfter": "15 minutes"
}
```

---

### 2. Chat Endpoints (Strict)

**Applied to**: `/api/chat/send`, `/api/chat/send-stream`

| Parameter | Value |
|-----------|-------|
| Window | 10 minutes |
| Max Requests | 30 messages |
| Reason | Resource-intensive OpenAI API calls |

**Why Strict?**
- Each chat message requires an OpenAI API call ($0.002-0.03 per request)
- Prevents abuse and excessive costs
- Ensures service availability for all users

**Error Response**:
```json
{
  "error": "Chat rate limit exceeded",
  "message": "You are sending messages too quickly. Please wait a moment before sending another message.",
  "retryAfter": "10 minutes",
  "tip": "This limit helps us provide quality service to all users."
}
```

---

### 3. Health Check Endpoint (Lenient)

**Applied to**: `/api/health`

| Parameter | Value |
|-----------|-------|
| Window | 5 minutes |
| Max Requests | 120 |
| Reason | Frequent monitoring by deployment systems |

**Why Lenient?**
- Monitoring systems need frequent health checks
- Lightweight endpoint (no database or API calls)
- Critical for uptime monitoring

---

### 4. Admin Dashboard (Moderate)

**Applied to**: `/api/admin/*`

| Parameter | Value |
|-----------|-------|
| Window | 10 minutes |
| Max Requests | 60 |
| Reason | Protect admin operations |

**Security Note**: Admin endpoints also require email-based authorization (see `packages/backend/src/routes/admin.ts`).

---

### 5. Authentication Endpoints (Very Strict)

**Applied to**: Authentication routes (future implementation)

| Parameter | Value |
|-----------|-------|
| Window | 15 minutes |
| Max Requests | 10 |
| Reason | Prevent brute force attacks |

**Security Features**:
- Very strict to prevent credential stuffing
- Counts all attempts (not just failed ones)
- Protects against automated attacks

---

### 6. Expensive Operations (Ultra Strict)

**Applied to**: Resource-intensive operations (future use)

| Parameter | Value |
|-----------|-------|
| Window | 30 minutes |
| Max Requests | 5 |
| Reason | Extremely resource-intensive |

**Use Cases** (future):
- Bulk data exports
- Report generation
- Large file processing

---

## Response Headers

All rate-limited endpoints return standard rate limit headers:

### Success Response Headers

```
RateLimit-Policy: 30;w=600        # 30 requests per 600 seconds (10 min)
RateLimit-Limit: 30               # Maximum requests allowed
RateLimit-Remaining: 27           # Requests remaining in current window
RateLimit-Reset: 542              # Seconds until limit resets
```

### Rate Limit Exceeded Response

**HTTP Status**: `429 Too Many Requests`

**Headers**:
```
Retry-After: 600                  # Seconds to wait before retrying
RateLimit-Limit: 30
RateLimit-Remaining: 0
RateLimit-Reset: 542
```

**Body**:
```json
{
  "error": "Chat rate limit exceeded",
  "message": "You are sending messages too quickly. Please wait a moment...",
  "retryAfter": "10 minutes",
  "tip": "This limit helps us provide quality service to all users."
}
```

---

## Implementation Details

### File: `packages/backend/src/middleware/rateLimiter.ts`

Rate limiting is implemented using the `express-rate-limit` package with the following features:

- **IP-based tracking**: Default rate limiting by client IP address
- **Standard headers**: Uses RFCdraft-ietf-httpapi-ratelimit-headers
- **Configurable windows**: Different time windows for different endpoints
- **Custom messages**: User-friendly error messages for each limiter
- **Health check exemption**: Health checks exempt from general limiter

### Applied in Routes

```typescript
// Main application (index.ts)
app.use(generalLimiter);  // Applied to all routes

// Chat routes (routes/chat.ts)
router.use(chatLimiter);  // Additional strict limit for chat

// Health routes (routes/health.ts)
router.use(healthCheckLimiter);  // Lenient limit for health

// Admin routes (routes/admin.ts)
router.use(adminLimiter);  // Moderate limit for admin
```

---

## Testing Rate Limits

### Test Health Check Limit

```bash
# Send 125 requests in 5 minutes (exceeds limit of 120)
for i in {1..125}; do
  curl -I http://localhost:4000/api/health
  echo "Request $i"
done
```

**Expected**: First 120 succeed, then receive 429 errors

### Test Chat Limit

```bash
# Send 35 messages in 10 minutes (exceeds limit of 30)
for i in {1..35}; do
  curl -X POST http://localhost:4000/api/chat/send \
    -H "Content-Type: application/json" \
    -d '{"message": "Test message '"$i"'", "streaming": false}'
  echo "Message $i sent"
  sleep 1
done
```

**Expected**: First 30 succeed, then receive 429 errors with retry guidance

### Check Rate Limit Status

```bash
# Check current rate limit status
curl -I http://localhost:4000/api/health | grep RateLimit

# Output:
# RateLimit-Limit: 120
# RateLimit-Remaining: 98
# RateLimit-Reset: 285
```

---

## Production Considerations

### Scaling Considerations

**Current Setup** (single server):
- Rate limits stored in-memory
- Resets when server restarts
- Separate limits per server instance

**Future Enhancement** (multiple servers):
- Use Redis or similar for distributed rate limiting
- Shared rate limit state across all servers
- Install `rate-limit-redis` package

```typescript
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL });

export const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  store: new RedisStore({
    client,
    prefix: 'rl:chat:',
  })
});
```

### Monitoring Rate Limits

**Recommended**:
1. **Log 429 errors**: Track which IPs are hitting limits
2. **Alert on patterns**: Unusual spike in rate limit hits
3. **Dashboard metrics**: Track rate limit hit rate
4. **Adjust limits**: Based on usage patterns and abuse

**Example Logging**:
```typescript
export const chatLimiter = rateLimit({
  // ... config
  handler: (req, res) => {
    console.warn(`⚠️  Rate limit exceeded: ${req.ip} on ${req.path}`);
    res.status(429).json({ error: 'Too many requests' });
  }
});
```

### Cost Protection

**Chat endpoint limits protect against**:
- **API abuse**: Prevents excessive OpenAI costs
- **DoS attacks**: Limits impact of automated attacks
- **Budget overruns**: Caps maximum API usage per IP

**Estimated Costs** (at maximum rate):
- 30 messages/10 min = 180 messages/hour
- 180 messages × 1000 tokens avg = 180k tokens/hour
- 180k tokens × $0.002/1k = **$0.36/hour per IP**
- With 100 concurrent users: **$36/hour maximum**

---

## Bypassing Rate Limits (Admin/Testing)

### Development Mode

Rate limits are **always active** to ensure they work in production. To test without limits:

**Option 1**: Increase limits in development
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

export const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isDevelopment ? 1000 : 30,  // Higher limit in dev
  // ...
});
```

**Option 2**: Skip rate limiting for specific IPs
```typescript
export const chatLimiter = rateLimit({
  // ...
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return process.env.NODE_ENV === 'development' &&
           req.ip === '::1' || req.ip === '127.0.0.1';
  }
});
```

### Production Admin Bypass

**NOT RECOMMENDED**: Bypassing production rate limits creates security risks.

If absolutely necessary:
- Use API keys for authenticated admin access
- Apply separate, higher limits for authenticated admins
- Log all admin activities

---

## Troubleshooting

### Issue: Getting rate limited too quickly

**Check**:
1. Are you behind a proxy/NAT? Multiple users may share the same IP
2. Check current limit status in response headers
3. Verify the endpoint you're calling (different limits per endpoint)

**Solution**:
- Wait for the window to reset (`RateLimit-Reset` header)
- Implement exponential backoff in your client
- Contact support if limits are too restrictive for legitimate use

### Issue: Rate limits not working

**Check**:
1. Verify middleware is applied in correct order
2. Check for errors in server logs
3. Ensure `express-rate-limit` package is installed
4. Test with curl and check response headers

**Debug**:
```bash
# Should see RateLimit headers
curl -I http://localhost:4000/api/health | grep RateLimit
```

### Issue: Different limits on different servers

**Cause**: In-memory rate limiting doesn't sync across servers

**Solution**: Implement Redis-based distributed rate limiting (see Production Considerations above)

---

## Summary

| Endpoint Type | Window | Max Requests | Purpose |
|--------------|--------|--------------|---------|
| General API | 15 min | 100 | Baseline protection |
| Chat | 10 min | 30 | Protect OpenAI costs |
| Health Check | 5 min | 120 | Allow monitoring |
| Admin | 10 min | 60 | Moderate protection |
| Auth | 15 min | 10 | Prevent brute force |
| Expensive Ops | 30 min | 5 | Ultra protection |

**All limits are per IP address unless otherwise specified.**

---

## Future Enhancements

1. **User-based tracking**: Rate limit by authenticated user ID instead of IP
2. **Redis integration**: Distributed rate limiting across multiple servers
3. **Dynamic limits**: Adjust limits based on user tier (free vs paid)
4. **Whitelist**: Bypass limits for trusted IPs
5. **Analytics**: Dashboard showing rate limit hit rates
6. **Custom handlers**: Different responses for different limit types
7. **Gradual limiting**: Slow down instead of hard block (e.g., add delay)

---

**Rate limiting is active and protecting your API!** 🛡️

Monitor rate limit headers in responses to ensure limits are appropriate for your use case.
