# Next Steps After MVP Skeleton

This document outlines the implementation steps for Phase 2 and beyond.

---

## ✅ What's Complete (Phase 1)

- [x] Monorepo structure with shared TypeScript types
- [x] Next.js 14 frontend with Tailwind CSS
- [x] Express backend with TypeScript
- [x] Mock chat endpoint with 4-step response structure
- [x] Safety detection keywords
- [x] Safety escalation modal UI
- [x] Supabase client setup (frontend + backend)
- [x] Deployment configurations (Netlify + Render)

---

## 🚀 Phase 2: AI Integration (Week 2)

### Priority 1: OpenAI Integration

**File:** `packages/backend/src/services/ai.ts`

1. **Implement `generateAIResponse()` function**
   ```typescript
   import OpenAI from 'openai';
   import { MAIN_SYSTEM_PROMPT } from '@menoai/shared';

   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY
   });

   export async function generateAIResponse(
     message: string,
     conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
   ): Promise<AIResponse> {
     const response = await openai.chat.completions.create({
       model: 'gpt-4',
       messages: [
         { role: 'system', content: MAIN_SYSTEM_PROMPT },
         ...conversationHistory.slice(-6), // Last 3 turns
         { role: 'user', content: message }
       ],
       temperature: 0.7,
       max_tokens: 300
     });

     // Parse response into 4-step structure
     // Extract emotion and need tags
     // Return structured AIResponse
   }
   ```

2. **Update `/api/chat/send` endpoint**
   - Replace `generateMockResponse()` with `generateAIResponse()`
   - Fetch conversation history from database
   - Pass history to AI for context

3. **Test with real conversations**
   - Verify 4-step structure is maintained
   - Check response quality and empathy
   - Optimize prompt if needed

**Acceptance Criteria:**
- [ ] Real OpenAI responses replace mock data
- [ ] Responses follow 4-step framework consistently
- [ ] Conversation context maintained across turns
- [ ] Response latency <3 seconds (p95)

---

### Priority 2: Supabase Database Integration

**Files:**
- `packages/backend/src/lib/supabase.ts`
- `packages/backend/src/routes/chat.ts`

1. **Set up Supabase project**
   - Create new project at supabase.com
   - Run schema from `docs/SUPABASE_SCHEMA.sql`
   - Configure RLS policies
   - Copy API keys to `.env`

2. **Implement database functions**
   ```typescript
   // packages/backend/src/lib/supabase.ts

   export async function saveMessage(messageData: CreateMessageDTO) {
     const { data, error } = await supabaseAdmin
       .from('messages')
       .insert(messageData)
       .select()
       .single();

     if (error) throw error;
     return data;
   }

   export async function getConversationHistory(conversationId: string) {
     const { data, error } = await supabaseAdmin
       .from('messages')
       .select('*')
       .eq('conversation_id', conversationId)
       .order('created_at', { ascending: true });

     if (error) throw error;
     return data;
   }

   export async function createConversation(userId: string) {
     const { data, error } = await supabaseAdmin
       .from('conversations')
       .insert({ user_id: userId })
       .select()
       .single();

     if (error) throw error;
     return data;
   }
   ```

3. **Update chat routes to use database**
   - Save user messages
   - Save AI responses
   - Retrieve history for context

**Acceptance Criteria:**
- [ ] Messages persist to Supabase
- [ ] Conversation history retrieved correctly
- [ ] 30-day retention enforced
- [ ] RLS policies prevent unauthorized access

---

### Priority 3: Supabase Authentication

**Files:**
- `packages/frontend/src/components/auth/SignInModal.tsx`
- `packages/frontend/src/components/auth/AuthProvider.tsx`
- `packages/backend/src/middleware/auth.ts`

1. **Create sign-in modal component**
   ```typescript
   // Email/password and Google OAuth options
   // Use Supabase Auth UI library
   ```

2. **Add auth middleware to backend**
   ```typescript
   export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
     const token = req.headers.authorization?.split('Bearer ')[1];

     if (!token) {
       return res.status(401).json({ error: 'Unauthorized' });
     }

     const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

     if (error || !user) {
       return res.status(401).json({ error: 'Invalid token' });
     }

     req.user = user;
     next();
   }
   ```

3. **Protect chat endpoints**
   - Apply auth middleware to `/api/chat/*` routes
   - Support guest mode (temporary sessions)

**Acceptance Criteria:**
- [ ] Users can sign up with email/password
- [ ] Google OAuth sign-in works
- [ ] Guest mode available
- [ ] Auth tokens validated on backend

---

## 🛡️ Phase 3: Safety & Data Management (Week 3)

### Priority 1: Enhanced Safety Detection

**File:** `packages/backend/src/services/safety.ts`

1. **Implement sentiment analysis**
   - Use OpenAI moderation API
   - Add sentiment scoring threshold

2. **Log safety events to database**
   ```typescript
   export async function logSafetyEvent(
     userId: string,
     messageId: string,
     triggerPhrase: string
   ) {
     await supabaseAdmin
       .from('safety_logs')
       .insert({
         user_id: userId,
         message_id: messageId,
         trigger_phrase: triggerPhrase,
         escalation_action: 'resources_shown'
       });
   }
   ```

3. **Admin dashboard for monitoring**
   - Create `/admin/safety` page
   - Display recent high-risk conversations
   - Allow manual review

**Acceptance Criteria:**
- [ ] All safety triggers logged to database
- [ ] 100% detection rate for test phrases
- [ ] No false positives on normal conversations
- [ ] Admin can review flagged conversations

---

### Priority 2: Conversation History UI

**File:** `packages/frontend/src/app/history/page.tsx`

1. **Create history page**
   - List all user conversations
   - Show date and message preview
   - Click to view full conversation

2. **Add delete functionality**
   - Allow users to delete conversations
   - Confirm deletion with modal
   - Comply with GDPR right to deletion

**Acceptance Criteria:**
- [ ] Users can view past conversations
- [ ] Conversations sorted by date
- [ ] Delete works and removes from database
- [ ] UI is mobile-responsive

---

### Priority 3: GDPR Compliance

**Tasks:**
1. Create privacy policy page
2. Add cookie consent banner
3. Implement data export (download as JSON)
4. Set up automated anonymization cron job
5. Add "Delete All Data" button in settings

**Acceptance Criteria:**
- [ ] Privacy policy published
- [ ] Cookie consent shown on first visit
- [ ] Users can download their data
- [ ] Data anonymized after 30 days automatically
- [ ] Users can delete all data on request

---

## 🎨 Phase 4: Polish & Optimization (Week 4)

### Priority 1: Streaming Responses

**Files:**
- `packages/backend/src/routes/chat.ts`
- `packages/frontend/src/components/chat/ChatInterface.tsx`

1. **Implement Server-Sent Events (SSE)**
   ```typescript
   // Backend
   router.post('/send-stream', async (req, res) => {
     res.setHeader('Content-Type', 'text/event-stream');

     const stream = await openai.chat.completions.create({
       model: 'gpt-4',
       messages: [...],
       stream: true
     });

     for await (const chunk of stream) {
       res.write(`data: ${JSON.stringify(chunk)}\n\n`);
     }

     res.end();
   });
   ```

2. **Update frontend to consume stream**
   ```typescript
   const eventSource = new EventSource('/api/chat/send-stream');
   eventSource.onmessage = (event) => {
     const chunk = JSON.parse(event.data);
     // Append to message bubble in real-time
   };
   ```

**Acceptance Criteria:**
- [ ] AI responses stream word-by-word
- [ ] Perceived latency reduced
- [ ] No UI jank during streaming

---

### Priority 2: Error Handling & Monitoring

1. **Set up Sentry**
   - Install Sentry SDK
   - Configure error tracking
   - Add performance monitoring

2. **Add error boundaries**
   - Wrap components in error boundaries
   - Show user-friendly error messages
   - Log errors to Sentry

3. **Add loading states**
   - Skeleton loaders for history page
   - Better typing indicator
   - Retry logic for failed requests

**Acceptance Criteria:**
- [ ] Errors logged to Sentry
- [ ] Users see helpful error messages
- [ ] No crashes from API failures

---

### Priority 3: Analytics Integration

1. **Set up PostHog**
   - Create account and project
   - Install PostHog SDK
   - Track key events:
     - Page views
     - Messages sent
     - Safety triggers
     - Session duration

2. **Add custom dashboards**
   - User engagement metrics
   - Conversation depth
   - Safety escalation frequency

**Acceptance Criteria:**
- [ ] All events tracked
- [ ] Dashboard shows key metrics
- [ ] Privacy-compliant (no PII in events)

---

## 🧪 Phase 5: Testing & Refinement (Week 5)

### Priority 1: User Testing

1. **Recruit beta testers**
   - 8-10 women, ages 40-58
   - Mix of UK and Portugal
   - Currently experiencing peri/menopause

2. **Create testing protocol**
   - Guided tasks (send first message, trigger safety, etc.)
   - Free exploration period
   - Post-session survey

3. **Collect feedback**
   - Record sessions (with consent)
   - Analyze conversation logs
   - Interview participants

**Acceptance Criteria:**
- [ ] 8-10 participants recruited
- [ ] All testing sessions completed
- [ ] Feedback collected and analyzed

---

### Priority 2: Prompt Optimization

1. **Analyze conversation quality**
   - Review logs for tone consistency
   - Check for robotic phrases
   - Identify areas for improvement

2. **A/B test prompt variations**
   - Test different system prompts
   - Measure empathy scores
   - Choose best performing version

**Acceptance Criteria:**
- [ ] ≥75% of users report feeling "heard"
- [ ] No repetitive phrases in responses
- [ ] Consistent 4-step structure

---

## 🚢 Phase 6: Launch Preparation (Week 6)

### Priority 1: Production Deployment

1. **Deploy to Netlify**
   - Connect GitHub repo
   - Configure build settings
   - Add environment variables
   - Test production build

2. **Deploy to Render**
   - Connect GitHub repo
   - Configure service settings
   - Add environment variables
   - Set up health checks

3. **Configure custom domain**
   - Purchase domain (e.g., menoai.app)
   - Add DNS records
   - Enable SSL

**Acceptance Criteria:**
- [ ] Frontend live on Netlify
- [ ] Backend live on Render
- [ ] Custom domain configured
- [ ] SSL certificates active

---

### Priority 2: Launch Materials

1. **Create landing page copy**
   - Clear value proposition
   - Trust signals (privacy, safety)
   - Beta tester testimonials

2. **Prepare investor demo**
   - 5-minute demo video
   - Slide deck with metrics
   - User testimonials

3. **Write blog post announcement**
   - Share on LinkedIn, Twitter
   - Post in menopause support groups
   - Reach out to health journalists

**Acceptance Criteria:**
- [ ] Landing page optimized
- [ ] Demo materials ready
- [ ] Launch announcement drafted

---

## 📈 Post-MVP Features (Weeks 7-12)

### Pattern Recognition
- Detect recurring topics (brain fog, mood swings)
- Proactive check-ins: "I've noticed X has come up a few times..."
- Suggest journaling or tracking

### Daily/Weekly Prompts
- Optional morning check-ins
- Weekly reflection prompts
- Respect quiet hours (10 PM - 7 AM)

### Community Features
- Moderated peer support groups
- Anonymous sharing of conversations (opt-in)
- Expert Q&A sessions

### Premium Tier
- 1:1 coaching sessions with licensed therapists
- Personalized coping strategy library
- Advanced pattern analytics

### Mobile App
- React Native version
- Push notifications
- Offline mode

---

## 📊 Success Metrics to Track

### Engagement
- Daily Active Users (DAU)
- Messages per session
- Session duration
- Return rate (% returning after 1 week)

### Emotional Impact
- Post-session survey scores
- "Feeling heard" rating (target: ≥75%)
- User testimonials

### Safety
- Safety trigger detection rate (target: 100%)
- False positive rate (target: <5%)
- Escalation completion (users clicking resources)

### Technical
- Response latency (target: <3s p95)
- Uptime (target: 99%)
- Error rate (target: <1%)

---

## 🔧 Development Tips

### Working with the Monorepo

```bash
# Always rebuild shared package after changes
cd packages/shared && npm run build

# Run in watch mode during development
cd packages/shared && npm run dev
```

### Debugging

```bash
# Backend logs
cd packages/backend
npm run dev
# Watch the console for request logs

# Frontend logs
# Open browser DevTools → Console
```

### Testing API Changes

```bash
# Use curl or Postman
curl -X POST http://localhost:4000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"message": "test message"}'
```

---

## 📚 Resources

### Documentation
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### NVC & NLP Resources
- "Nonviolent Communication" by Marshall Rosenberg
- "Reframing" by Richard Bandler
- NVC Feelings & Needs lists

### Menopause Context
- British Menopause Society resources
- Menopause Support community forums
- Clinical guidelines for menopause care

---

## 🆘 Troubleshooting

### Common Issues

**"Cannot find module '@menoai/shared'"**
- Solution: Build the shared package first
  ```bash
  cd packages/shared && npm run build
  ```

**Supabase connection errors**
- Check environment variables are set correctly
- Verify API keys are valid
- Check RLS policies aren't blocking requests

**OpenAI API errors**
- Verify API key is set in `.env`
- Check account has credits
- Review rate limits

**Port already in use**
- Kill process on port 3000/4000
  ```bash
  lsof -ti:3000 | xargs kill -9
  lsof -ti:4000 | xargs kill -9
  ```

---

**Ready to build Phase 2?** Start with OpenAI integration! 🚀
