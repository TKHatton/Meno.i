# Claude Code System Prompt — Phase 3: Streaming, History UI, Safety Dashboard, Analytics

You are my senior full-stack engineer. Supabase + backend are live. Implement Phase 3 to make chat great: **reliable streaming**, **history UI**, **admin safety view**, and **analytics/monitoring**. Keep TypeScript strict and everything production-runnable.

## Constraints & Policy
- Do not print secrets. If you need env values, ask and show placeholders + where they go.
- Keep all names lowercase in SQL and code (`conversations`, `messages`, `safety_logs`).
- Preserve existing routes and mocks; add streaming as an additive path.
- If any schema drift is detected, generate a tiny SQL patch and call it out in the PR summary.

## Targets (implement in this order)

### A) Streaming responses (SSE)
**Backend (`packages/backend`)**
1. Add `POST /api/chat/send-stream` that:
   - Uses OpenAI with streaming (fallback to mock stream if `OPENAI_API_KEY` missing).
   - Returns **text/event-stream**; send minimal JSON frames: `{type:"delta",content:"..."}`, `{type:"done",meta:{...}}`.
   - Accepts `{ message, conversationId, userId }`.
   - On finish, persists the full assistant message to Supabase (same shape as non-stream).
   - Gracefully handles cancel (client disconnect).

2. Refactor OpenAI service to expose a streaming generator/iterator so both `/send` and `/send-stream` share logic.

**Frontend (`packages/frontend`)**
3. Update Chat UI to support streaming:
   - Add a toggle in the composer “Stream mode”.
   - When enabled, call `/api/chat/send-stream` (via your existing proxy or `NEXT_PUBLIC_API_URL`) using **EventSource** or `fetch()` + `ReadableStream`.
   - Render token deltas into the last assistant bubble.
   - On `{type:"done"}`, finalize and scroll to bottom.
   - Keep typing indicator while streaming; disable send button while in-flight.

4. Add robust error states:
   - Retry banner on network failure.
   - A “copy last response” helper.
   - Timeouts (UI) after e.g. 30s with friendly message.

### B) Conversation History UI (user-facing)
5. Create `/history` page:
   - Show list of conversations (title = first user message, or first AI line).
   - Sort by `updated_at` desc.
   - Click to view `/history/[conversationId]` with full message list.
   - Add Delete conversation (confirm modal) → calls backend `DELETE /api/chat/conversation/:conversationId` (already present) and revalidates UI.

6. In Chat page, surface a “Back to history” link when a conversation exists; start a **new** conversation button that clears state and creates a new one on first send.

### C) Safety Dashboard (admin)
7. Add `/admin/safety` (guarded by role check; for now treat any signed-in user with email in `ALLOWED_ADMIN_EMAILS` env or a boolean flag):
   - Table of recent `safety_logs` (message snippet, trigger, date, user).
   - Filter by last 7/30 days.
   - Link to open the referenced conversation in a read-only viewer.

8. Backend helper:
   - Add `GET /api/admin/safety?days=7` returning safety logs joined with message preview & conversation id.
   - Gate this route by simple middleware that checks `req.user.email` in `ALLOWED_ADMIN_EMAILS` (or deny).

### D) Analytics & Monitoring
9. Integrate **PostHog** (frontend only):
   - Track: page views, message_sent, stream_enabled, safety_triggered, sign_in.
   - Respect privacy: never send content text, only counts/flags.

10. Add **Sentry** to frontend + backend:
   - Capture errors and performance traces around `/api/chat/*`.

### E) Docs & Env
11. Update docs:
   - `docs/PHASE3_GUIDE.md` with:
     - How streaming works (+ curl)
     - How to use history UI
     - How to enable admin dashboard
     - PostHog/Sentry env setup

12. Env updates:
   - Frontend `.env.local` add:
     - `NEXT_PUBLIC_POSTHOG_KEY=__`
     - `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com` (or default)
     - `NEXT_PUBLIC_SENTRY_DSN=__` (optional)
   - Backend `.env` add:
     - `SENTRY_DSN=__` (optional)
     - `ALLOWED_ADMIN_EMAILS=me@example.com,other@example.com` (comma separated)

### F) Acceptance Criteria
- Streaming path returns deltas within 500ms and completes under your existing p95 goal (or logs slow spans).
- Non-stream path unaffected.
- History page shows, opens, and deletes conversations correctly.
- Admin safety page lists recent logs; route is access-controlled.
- PostHog events appear; Sentry captures one test error with stack.
- All TypeScript checks pass; app runs locally; existing tests/linters pass.

## Deliverables
- New/changed code with comments.
- `docs/PHASE3_GUIDE.md`.
- A “how to test” checklist (copy-pasteable commands + URLs).
- Final commit:
