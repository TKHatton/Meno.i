# Phase 3: 10-Minute Testing Checklist

Quick verification checklist for all Phase 3 features.

---

## Prerequisites (1 min)

- [ ] Backend running on port 4000
- [ ] Frontend running on port 3000
- [ ] Supabase configured (or mock mode active)
- [ ] Environment variables set (at minimum: OPENAI_API_KEY)

---

## 1. Streaming Test (2 min)

### Test Normal Mode
- [ ] Visit http://localhost:3000/chat
- [ ] Send message: "Hello, how are you?"
- [ ] Verify complete response appears
- [ ] Check response time < 3 seconds

### Test Streaming Mode
- [ ] Enable "Stream mode" toggle
- [ ] Send message: "Tell me about menopause"
- [ ] Verify tokens appear one by one in real-time
- [ ] Check response feels faster/more engaging
- [ ] Verify final message saved (check network tab)

### Test Error Handling
- [ ] With streaming enabled, send message with network disconnected
- [ ] Verify error banner appears
- [ ] Click "Retry" button
- [ ] Verify message resends successfully
- [ ] Test "Copy Last Response" button

**curl test:**
```bash
curl -X POST http://localhost:4000/api/chat/send-stream \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}' -N
```
- [ ] Verify SSE stream output

---

## 2. History Test (2 min)

### View History
- [ ] Click "History" link in header
- [ ] Verify conversation list appears
- [ ] Check conversations sorted by most recent first
- [ ] Verify first message preview shown

### View Conversation Detail
- [ ] Click on any conversation
- [ ] Verify all messages display
- [ ] Check "Back" button works
- [ ] Verify "New Chat" button works

### Delete Conversation
- [ ] In history list, click trash icon
- [ ] Verify confirmation modal appears
- [ ] Click "Delete"
- [ ] Verify conversation removed from list
- [ ] Go back to chat and start new conversation

**API test:**
```bash
# Get conversations for a user
curl http://localhost:4000/api/chat/conversations/test-user-123

# Get specific conversation history
curl http://localhost:4000/api/chat/history/CONVERSATION_ID
```

---

## 3. Admin Safety Dashboard (2 min)

### Access Dashboard
- [ ] Visit http://localhost:3000/admin/safety
- [ ] Enter admin email (from ALLOWED_ADMIN_EMAILS)
- [ ] Click "Access Dashboard"
- [ ] Verify dashboard loads

### Trigger Safety Event
- [ ] Go back to /chat
- [ ] Send message: "I want to die"
- [ ] Verify safety modal appears
- [ ] Go back to /admin/safety
- [ ] Click "Refresh"
- [ ] Verify new safety log appears

### Test Filtering
- [ ] Change time range to "30 days"
- [ ] Click "Refresh"
- [ ] Verify events reload
- [ ] Click "View Conversation" link
- [ ] Verify redirects to conversation detail

**API test:**
```bash
# Get safety logs (replace email)
curl "http://localhost:4000/api/admin/safety?days=7&email=admin@example.com"
```

---

## 4. Analytics Test (2 min)

### PostHog Setup (if configured)
- [ ] Add NEXT_PUBLIC_POSTHOG_KEY to .env.local
- [ ] Restart frontend
- [ ] Open browser console
- [ ] Verify "PostHog analytics initialized" message
- [ ] Send a message
- [ ] Check PostHog dashboard for events:
  - `page_visit`
  - `message_sent`

### Sentry Setup (if configured)
- [ ] Add NEXT_PUBLIC_SENTRY_DSN to .env.local
- [ ] Add SENTRY_DSN to backend .env
- [ ] Set NODE_ENV=production
- [ ] Restart both servers
- [ ] Verify "Sentry error tracking initialized" in console
- [ ] Trigger test error in browser console:
  ```javascript
  throw new Error("Test error for Sentry");
  ```
- [ ] Check Sentry dashboard for error

---

## 5. Integration Test (1 min)

### End-to-End Flow
- [ ] Visit /chat
- [ ] Enable streaming mode
- [ ] Send 3 messages
- [ ] Click "History"
- [ ] Verify conversation appears with all 3 messages
- [ ] Click conversation to view
- [ ] Verify all messages display correctly
- [ ] Go back and delete conversation
- [ ] Start new conversation
- [ ] Verify new conversation ID created

---

## Quick Troubleshooting

### Streaming not working?
```bash
# Check backend logs for errors
# Verify CORS allows streaming
# Try in different browser
```

### History empty?
```bash
# Check Supabase is configured
# Verify userId being sent with messages
# Check browser console for API errors
```

### Admin dashboard unauthorized?
```bash
# Check ALLOWED_ADMIN_EMAILS in backend .env
# Verify email matches exactly (case-sensitive)
# Restart backend after .env changes
```

### Analytics not tracking?
```bash
# Verify API keys are set (not "__")
# Check browser console for initialization messages
# Disable ad blockers
# Check PostHog/Sentry project is active
```

---

## Success Criteria

✅ **All features working if:**
- Streaming shows tokens in real-time
- History displays all conversations
- Admin dashboard shows safety events
- Analytics initializes without errors
- Error handling shows retry options
- All API endpoints respond < 500ms

---

## Performance Benchmarks

- **Streaming first token:** < 500ms
- **Streaming complete:** < 3s
- **History page load:** < 200ms
- **Admin dashboard load:** < 300ms
- **Analytics overhead:** < 50ms

---

## Next Steps

1. ✅ Complete 10-minute checklist
2. Fix any failing tests
3. Deploy to staging
4. Run checklist on staging
5. Deploy to production
6. Monitor Sentry for errors
7. Review PostHog analytics weekly

---

**Timestamp:** Phase 3 implemented on 2025-01-15
**Version:** v1.0.0-phase3
