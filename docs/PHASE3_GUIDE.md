# Phase 3: Streaming, History, Safety Dashboard & Analytics

Complete guide for Phase 3 features: real-time streaming responses, conversation history, admin safety monitoring, and analytics.

---

## What's New in Phase 3

### 1. Streaming Responses (SSE)
Real-time token streaming for faster, more engaging conversations.

### 2. Conversation History
Full conversation management with history viewing and deletion.

### 3. Admin Safety Dashboard
Monitoring interface for safety escalations with filtering and conversation linking.

### 4. Analytics & Monitoring
Privacy-focused PostHog analytics and Sentry error tracking.

---

## Features Overview

### A) Streaming Responses

**Frontend:**
- Toggle in chat UI to enable/disable streaming
- Real-time token display with typing animation
- 30-second timeout with friendly error messages
- "Copy last response" helper
- Retry on network failure

**Backend:**
- `POST /api/chat/send-stream` - SSE endpoint
- Graceful client disconnect handling
- Falls back to mock streaming if OpenAI unavailable
- Persists complete message to database on finish

**How it works:**
1. User enables "Stream mode" toggle
2. Messages stream token-by-token via Server-Sent Events
3. Frontend updates UI in real-time
4. On completion, full message saved to database

### B) Conversation History

**Pages:**
- `/history` - List all conversations (sorted by last updated)
- `/history/[conversationId]` - View complete conversation (read-only)

**Features:**
- Display first message as conversation title
- Delete conversations with confirmation modal
- Link from chat page to history
- "New Chat" button to start fresh conversation

### C) Admin Safety Dashboard

**Access:**
- Visit `/admin/safety`
- Enter admin email (must be in `ALLOWED_ADMIN_EMAILS`)
- View safety logs with filtering

**Features:**
- Filter by 7/30/90 days
- View trigger phrase, message preview, user ID
- Link to conversation for context
- Refresh data on demand

**Backend:**
- `GET /api/admin/safety?days=7&email=admin@example.com`
- Returns safety logs with joined message data
- Access controlled by middleware checking email

### D) Analytics & Monitoring

**PostHog (Frontend):**
- Page views
- `message_sent` (with streaming flag)
- `safety_triggered`
- `sign_in` / `sign_out`
- `conversation_deleted` / `conversation_viewed`
- **Privacy**: Never tracks message content, only events

**Sentry (Frontend + Backend):**
- Error capture with stack traces
- Performance monitoring (10% sample rate)
- Filters out sensitive headers/cookies
- Only enabled in production

---

## Setup Instructions

### 1. Install Dependencies

```bash
# Frontend dependencies (PostHog, Sentry)
cd packages/frontend
npm install posthog-js @sentry/react @sentry/nextjs

# Backend dependencies (Sentry)
cd packages/backend
npm install @sentry/node
```

### 2. Environment Variables

**Frontend (packages/frontend/.env.local):**
```bash
# Existing variables...
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_API_URL=http://localhost:4000

# NEW: Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# NEW: Error tracking (optional)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**Backend (packages/backend/.env):**
```bash
# Existing variables...
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
OPENAI_API_KEY=sk-...
PORT=4000

# NEW: Admin access (comma-separated emails)
ALLOWED_ADMIN_EMAILS=admin@example.com,safety@example.com

# NEW: Error tracking (optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 3. Get API Keys (Optional)

**PostHog:**
1. Sign up at https://posthog.com
2. Create a new project
3. Copy the Project API Key
4. Set `NEXT_PUBLIC_POSTHOG_KEY`

**Sentry:**
1. Sign up at https://sentry.io
2. Create a new project (React for frontend, Node.js for backend)
3. Copy the DSN
4. Set `NEXT_PUBLIC_SENTRY_DSN` (frontend) and `SENTRY_DSN` (backend)

---

## Testing Streaming

### Test with curl

```bash
# Test streaming endpoint
curl -X POST http://localhost:4000/api/chat/send-stream \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how are you today?",
    "userId": "test-user-123"
  }' \
  -N

# Expected output: SSE stream
# data: {"type":"delta","content":"That"}
# data: {"type":"delta","content":" sounds"}
# ...
# data: {"type":"done","meta":{...}}
```

### Test in Browser

1. Go to `/chat`
2. Enable "Stream mode" toggle
3. Send a message
4. Watch tokens appear in real-time
5. Verify complete message saved (check `/history`)

---

## Testing History

1. **Create conversations:**
   - Send multiple messages in `/chat`
   - Start a new conversation (messages create new conversation)

2. **View history:**
   - Click "History" in header
   - See list of all conversations
   - Click a conversation to view details

3. **Delete conversation:**
   - Click trash icon
   - Confirm deletion
   - Verify it's removed from list

---

## Testing Admin Dashboard

1. **Configure admin access:**
   ```bash
   # In backend .env
   ALLOWED_ADMIN_EMAILS=your-email@example.com
   ```

2. **Access dashboard:**
   - Visit `/admin/safety`
   - Enter your admin email
   - Click "Access Dashboard"

3. **View safety logs:**
   - Send messages with trigger phrases (e.g., "I want to die")
   - Refresh admin dashboard
   - See safety events logged
   - Click "View Conversation" to see context

4. **Filter logs:**
   - Change time range (7/30/90 days)
   - Click "Refresh" to reload

---

## Testing Analytics

### PostHog Events

1. **Setup:**
   - Add `NEXT_PUBLIC_POSTHOG_KEY` to `.env.local`
   - Restart frontend dev server

2. **Verify events:**
   - Visit https://app.posthog.com
   - Go to "Events" or "Live Events"
   - Perform actions in app:
     - Navigate pages → `page_visit`
     - Send message → `message_sent`
     - Enable streaming → `message_sent` with `streaming_enabled: true`
     - Trigger safety → `safety_triggered`
   - Check PostHog dashboard for events

### Sentry Errors

1. **Setup:**
   - Add `NEXT_PUBLIC_SENTRY_DSN` (frontend) and `SENTRY_DSN` (backend) to `.env`
   - Set `NODE_ENV=production` to enable

2. **Test error capture:**
   ```javascript
   // In browser console on /chat
   throw new Error("Test error for Sentry");
   ```

3. **Verify in Sentry:**
   - Visit https://sentry.io
   - Check "Issues" tab
   - See error with stack trace

---

## API Reference

### POST /api/chat/send-stream

**Request:**
```json
{
  "message": "User message here",
  "conversationId": "optional-conversation-id",
  "userId": "optional-user-id"
}
```

**Response:** SSE stream
```
data: {"type":"delta","content":"token"}
data: {"type":"delta","content":" here"}
data: {"type":"done","meta":{"full_response":"...","conversationId":"...","safetyTriggered":false}}
```

### GET /api/admin/safety

**Query params:**
- `days` (optional): Number of days to look back (default: 7, max: 365)
- `email` (required): Admin email for authorization

**Response:**
```json
{
  "logs": [
    {
      "id": "log-id",
      "userId": "user-id",
      "triggerPhrase": "want to die",
      "messagePreview": "I want to die, I can't handle...",
      "conversationId": "conv-id",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "count": 1,
  "days": 7
}
```

### GET /api/chat/conversations/:userId

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv-id",
      "user_id": "user-id",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:30:00Z",
      "archived": false,
      "first_message": "First message preview..."
    }
  ]
}
```

### DELETE /api/chat/conversation/:conversationId

**Request:**
```json
{
  "userId": "user-id"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Troubleshooting

### Streaming not working

**Issue:** Messages not streaming in real-time

**Solutions:**
1. Check browser console for errors
2. Verify backend running on correct port
3. Check CORS settings allow streaming
4. Try disabling browser extensions (ad blockers)

### Analytics not tracking

**Issue:** PostHog not showing events

**Solutions:**
1. Verify `NEXT_PUBLIC_POSTHOG_KEY` is set correctly
2. Check browser console for "PostHog analytics initialized"
3. Ensure not running in incognito/private mode
4. Check ad blockers aren't blocking PostHog

### Admin dashboard access denied

**Issue:** "Unauthorized" when accessing `/admin/safety`

**Solutions:**
1. Check `ALLOWED_ADMIN_EMAILS` in backend `.env`
2. Verify email matches exactly (case-sensitive)
3. Restart backend server after changing `.env`
4. Check backend logs for auth errors

### Sentry not capturing errors

**Issue:** Errors not appearing in Sentry dashboard

**Solutions:**
1. Verify `NODE_ENV=production` (Sentry only enabled in production)
2. Check DSN is correct
3. Ensure Sentry project is active
4. Test with manual error: `throw new Error("Test")`

---

## Performance Notes

### Streaming Performance
- First token typically arrives within 500ms
- Complete response usually under 3 seconds
- 30-second timeout prevents hanging connections
- Graceful fallback to non-streaming on error

### Database Queries
- History page: Single query with pagination potential
- Admin dashboard: Joined query with date filtering
- Indexes on `created_at` and `user_id` recommended

### Analytics Overhead
- PostHog: < 1KB per event, async
- Sentry: Only 10% of transactions sampled
- No noticeable impact on user experience

---

## Privacy & Security

### Data Protection
- **Analytics**: Never tracks message content, only event counts and flags
- **Sentry**: Filters out cookies and sensitive headers before sending
- **Admin Access**: Email-based access control (enhance with proper auth in production)

### Safety Logs
- Message previews truncated to 100 chars
- User IDs displayed as shortened hashes in UI
- Full conversation access requires admin authentication

### Production Recommendations
1. Replace email-based admin auth with proper JWT/session auth
2. Enable HTTPS for all endpoints
3. Add rate limiting to streaming endpoint
4. Implement user-level RLS in Supabase
5. Review and minimize data collected by analytics

---

## Next Steps

1. **Install packages:**
   ```bash
   npm install posthog-js @sentry/react @sentry/node
   ```

2. **Update environment variables** (see Setup section)

3. **Test each feature** (see Testing sections)

4. **Deploy to production:**
   - Set production environment variables
   - Enable Sentry error tracking
   - Configure PostHog project
   - Test streaming with production traffic

5. **Monitor:**
   - Check Sentry for errors
   - Review PostHog analytics weekly
   - Monitor safety dashboard for escalations

---

## Support

- Issues: https://github.com/anthropics/claude-code/issues
- Supabase docs: https://supabase.com/docs
- PostHog docs: https://posthog.com/docs
- Sentry docs: https://docs.sentry.io
