# Product Requirements Document (PRD)

## MenoAI - Emotional Intelligence Companion for Menopause

**Version:** 1.0  
**Date:** October 18, 2025  
**Owner:** Product Team  
**Status:** MVP Planning

---

## 1. Product Overview

### What We're Building

MenoAI is an AI-powered conversational companion that provides emotionally intelligent support for women navigating perimenopause and menopause. Unlike medical chatbots or symptom trackers, MenoAI combines therapeutic frameworks (NLP and NVC) to deliver empathetic, personalized conversations that help users understand their experiences, reframe negative thought patterns, and build emotional resilience.

### Problem Statement

Women going through perimenopause and menopause face a complex intersection of physical symptoms, emotional volatility, and identity shifts—often with limited support systems. Current solutions fall into two extremes:

- **Medical apps** focus on symptom tracking but lack emotional support
- **General mental health apps** don't understand menopause-specific experiences

**The gap:** Women need a space where they feel heard, validated, and empowered—not just informed or tracked.

### Why This Matters

- 1.3 billion women worldwide will be in perimenopause/menopause by 2030
- 60% report feeling unsupported by healthcare systems
- Emotional symptoms (anxiety, mood swings, identity crisis) are often dismissed as "just hormones"
- Relationship strain, work performance concerns, and self-confidence erosion go unaddressed

---

## 2. Target Users

### Primary User Persona

**Name:** Sarah, 47  
**Stage:** Perimenopause  
**Location:** UK or Portugal

**Context:**
- Working professional experiencing brain fog and mood swings
- Feels isolated—partner doesn't understand what she's going through
- Frustrated by dismissive medical interactions ("it's normal, everyone goes through it")
- Seeking emotional validation and practical coping strategies
- Values privacy and non-judgmental support

### User Pain Points

| Pain Point | Description | Impact |
|------------|-------------|--------|
| **Emotional Invalidation** | Feelings dismissed as "overreacting" or "just hormones" | Isolation, shame, self-doubt |
| **Identity Crisis** | "I don't recognize myself anymore" | Loss of confidence, confusion about self-worth |
| **Communication Breakdown** | Partners/family don't understand the experience | Relationship tension, loneliness |
| **Symptom Overwhelm** | Hot flashes, brain fog, sleep disruption happening simultaneously | Exhaustion, loss of control |
| **Professional Anxiety** | Fear of appearing incompetent at work due to brain fog | Career insecurity, stress |
| **Lack of Safe Space** | No judgment-free zone to express frustration, fear, or grief | Suppressed emotions, burnout |

### Secondary Users

- Women aged 40-58 (core demographic)
- Those seeking non-medical emotional support
- Users who prefer digital-first solutions over in-person therapy

---

## 3. Goals and Success Metrics

### Product Goals

**Primary Goal:**  
Create a trusted emotional companion that helps women feel heard, validated, and empowered during menopause transitions.

**Secondary Goals:**
- Reduce emotional distress through evidence-based conversational techniques (NLP/NVC)
- Normalize menopause experiences and eliminate shame
- Bridge the gap between symptom awareness and emotional resilience

### Success Metrics (MVP Phase)

#### User Engagement Metrics
- **Return rate:** ≥60% of users return for 2+ sessions per week
- **Session depth:** Average conversation length of 5-10 message exchanges
- **Retention:** 40% of users active after 30 days

#### Emotional Impact Metrics (Qualitative)
- User feedback indicates feeling "heard, calmer, and supported"
- Post-session survey: ≥75% report increased self-awareness
- Testimonials include phrases like "feels like talking to someone who gets it"

#### Safety Metrics
- 100% of high-risk conversations flagged and escalated appropriately
- Zero incidents of harmful advice given

#### Technical Metrics
- Response latency: <3 seconds for AI replies
- Uptime: 99% availability
- Conversation history retained for 30 days

### Long-Term Success Indicators (Post-MVP)

- Partnerships with menopause clinics or therapists
- Expansion to 1,000+ active users
- Positive clinical validation studies
- Community features (peer support groups)

---

## 4. Core Features for MVP

### Feature Prioritization Framework

| Priority | Feature | Rationale |
|----------|---------|-----------|
| **P0 (Must-Have)** | AI Conversational Engine | Core product value |
| **P0** | Emotional validation using NVC | Differentiator from competitors |
| **P0** | NLP reframing techniques | Therapeutic value |
| **P0** | Safety escalation protocol | User safety critical |
| **P1 (Should-Have)** | Conversation history (30 days) | Continuity and pattern recognition |
| **P1** | User accounts (email/Google) | Personalization and data retention |
| **P2 (Nice-to-Have)** | Daily check-ins | Proactive engagement |
| **P2** | Pattern recognition alerts | Enhanced personalization |

### P0 Features (MVP Launch)

#### 1. AI Conversational Engine

**Description:** Real-time chat interface where users can share experiences and receive empathetic, context-aware responses.

**Functional Requirements:**
- Text-based conversation interface
- AI powered by GPT-4 or Claude Sonnet with custom system prompts
- Response structure follows: Validate → Reflect → Reframe → Empower
- Blend of 70% NVC (emotional validation) + 30% NLP (cognitive reframing)
- Conversational tone—warm, sisterly, non-clinical

**Technical Specifications:**
- API integration with OpenAI or Anthropic
- Custom prompt engineering layer
- Context window: Maintain 3-turn memory (user → AI → user)
- Response time: <3 seconds

**Acceptance Criteria:**
- User can initiate conversation without tutorials or onboarding friction
- AI responses feel natural, empathetic, and non-robotic
- No repetitive phrases or overly clinical language

#### 2. Emotional Validation (NVC Framework)

**Description:** AI identifies user emotions and needs, then validates them using Nonviolent Communication principles.

**Functional Requirements:**
- Emotion detection from user input (sadness, shame, guilt, anxiety, anger, etc.)
- Need identification (connection, understanding, peace, safety, etc.)
- Responses structured as: Observation → Feeling → Need → Request
- Micro-NVC for high-emotion moments (2-step empathy: "That sounds heavy" + reflection)

**Example Interaction:**
- **User:** "I snapped at my partner and feel awful about it."
- **AI:** "It sounds like that moment felt heavy—maybe you're feeling guilty because connection matters to you. Would you like to look at what triggered that and how you might respond differently next time?"

**Acceptance Criteria:**
- 80% of user responses receive appropriate emotional validation
- Users report feeling "heard" in post-session feedback

#### 3. NLP Reframing Techniques

**Description:** AI helps users shift perspective from disempowerment to agency using cognitive reframing.

**NLP Techniques Implemented:**
1. **Reframing:** "What if this isn't failure—it's your body asking for rest?"
2. **Meta-model questioning:** "What specifically makes you feel that way today?"
3. **Anchoring:** "Let's link deep breathing to a phrase like 'I'm safe and resting.'"
4. **Future pacing:** "Imagine yourself six months from now, feeling calm. What does that look like?"
5. **Pattern interrupt:** Breaking self-criticism loops with curiosity

**Acceptance Criteria:**
- AI naturally integrates reframes without sounding formulaic
- Users show shift from negative to neutral/positive framing in conversations

#### 4. Safety Escalation Protocol

**Description:** AI detects high-risk language and offers professional resources.

**Trigger Words/Phrases:**
- "I can't handle this anymore"
- "I want to disappear"
- "What's the point?"
- Mentions of self-harm, suicidal ideation, severe depression

**Safety Response Template:**
> "I hear how unbearable this feels right now. You don't have to face it alone. Would you like me to connect you with a menopause support line or a licensed professional who can help?"

**Escalation Resources:**
- Link to mental health helplines
- Recommendation to contact GP or therapist
- Option to pause conversation and revisit later

**Acceptance Criteria:**
- 100% of high-risk phrases trigger safety protocol
- No false positives that disrupt normal conversations
- Clear, non-alarming language in escalation messages

### P1 Features (MVP Launch)

#### 5. Conversation History

**Description:** Users can view past conversations for continuity and self-reflection.

**Functional Requirements:**
- 30-day conversation retention
- Searchable by date
- Option to delete conversations on request
- Anonymized after 30 days (retain patterns, not identifiable data)

**Acceptance Criteria:**
- Users can access previous chats within 2 clicks
- Data complies with GDPR (right to deletion)

#### 6. User Accounts (Optional Sign-In)

**Description:** Optional email or Google sign-in for personalized experience.

**Functional Requirements:**
- Email/password or Google OAuth
- Guest mode available (no login required for trial)
- Data tied to account for multi-device access

**Acceptance Criteria:**
- Sign-up flow takes <60 seconds
- Guest users can convert to accounts without losing history

### P2 Features (Post-MVP)

#### 7. Pattern Recognition & Proactive Check-Ins

**Description:** AI notices recurring struggles and prompts reflection.

**Example:**
- "I've noticed brain fog has come up a few times this week. Would you like to explore what might be triggering it?"

#### 8. Daily/Weekly Prompts

**Description:** Optional proactive messages like:
- "How are you feeling today?"
- "Would you like to review your week's patterns?"

**Constraints:**
- No notifications during rest hours (10 PM - 7 AM)
- User can opt out entirely

---

## 5. Technical Requirements

### Architecture Overview

```
┌─────────────────┐
│ Web Frontend    │ (React/Next.js)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend API     │ (Node.js/Python FastAPI)
└────────┬────────┘
         │
    ┌────┴────┬─────────────┬──────────────┐
    ▼         ▼             ▼              ▼
┌────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
│Database│ │AI Model │ │Auth      │ │Analytics │
│Postgres│ │OpenAI/  │ │Service   │ │Pipeline  │
│        │ │Claude   │ │Firebase  │ │          │
└────────┘ └─────────┘ └──────────┘ └──────────┘
```

### Frontend

**Technology Stack:**
- **Framework:** React with Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **State Management:** React Context API or Zustand (for chat state)
- **Real-time Updates:** WebSocket or Server-Sent Events (SSE) for streaming responses

**Key Components:**

```
src/
├── components/
│   ├── ChatInterface/
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   ├── MessageBubble.tsx
│   │   └── TypingIndicator.tsx
│   ├── Auth/
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   └── GuestMode.tsx
│   ├── History/
│   │   └── ConversationList.tsx
│   └── Safety/
│       └── EscalationModal.tsx
├── pages/
│   ├── index.tsx (landing)
│   ├── chat.tsx (main interface)
│   └── history.tsx
└── utils/
    ├── api.ts
    └── websocket.ts
```

**Responsive Design:**
- Mobile-first approach (60% of users expected on mobile)
- Minimum viewport: 320px width
- Touch-optimized input areas

**Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly

### Backend

**Technology Stack:**
- **Framework:** Node.js with Express OR Python with FastAPI
- **API Style:** RESTful + WebSocket for real-time chat
- **Authentication:** Firebase Auth or Auth0
- **Environment:** Deployed on Vercel, Railway, or AWS Lambda

**Core API Endpoints:**

```typescript
POST   /api/chat/send              // Send message, get AI response
GET    /api/chat/history           // Retrieve conversation history
DELETE /api/chat/history/:id       // Delete conversation
POST   /api/auth/signup            // Create account
POST   /api/auth/login             // Authenticate user
GET    /api/user/profile           // Get user data
POST   /api/safety/escalate        // Log safety trigger event
```

**AI Integration Layer:**

```python
# Pseudo-code structure
class MenoAIEngine:
    def __init__(self):
        self.model = "gpt-4" or "claude-sonnet-4"
        self.system_prompt = load_prompt_template()
    
    def process_message(self, user_input, conversation_history):
        # 1. Emotion detection
        emotion = self.detect_emotion(user_input)
        
        # 2. Intent classification
        intent = self.classify_intent(user_input)
        
        # 3. Safety check
        if self.is_high_risk(user_input):
            return self.safety_response()
        
        # 4. Build context
        context = self.build_context(conversation_history, emotion, intent)
        
        # 5. Generate response
        response = self.llm.generate(context)
        
        # 6. Log interaction
        self.log_conversation(user_input, response, emotion, intent)
        
        return response
```

**Prompt Engineering:**
- System prompt includes NVC/NLP framework rules
- Context injection with last 3 conversation turns
- Temperature: 0.7-0.8 (balance creativity and consistency)
- Max tokens: 300 per response (keep concise)

**Safety Layer:**
- Keyword detection for high-risk phrases
- Sentiment analysis (threshold >0.8 negativity triggers review)
- Human-in-the-loop for flagged conversations (post-MVP)

### Database

**Technology:** PostgreSQL (Supabase or AWS RDS)

**Schema Design:**

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    auth_provider VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP,
    anonymized BOOLEAN DEFAULT FALSE
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    archived BOOLEAN DEFAULT FALSE,
    retention_expires_at TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(10) CHECK (role IN ('user', 'ai')),
    content TEXT NOT NULL,
    emotion_tag VARCHAR(50),
    intent_tag VARCHAR(50),
    need_tag VARCHAR(50),
    safety_level VARCHAR(10) CHECK (safety_level IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Safety logs table
CREATE TABLE safety_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    message_id UUID REFERENCES messages(id),
    trigger_phrase TEXT,
    escalation_action VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_safety ON messages(safety_level) WHERE safety_level = 'High';
```

**Data Retention Policy:**
- Active conversations: 30 days
- Anonymization after 30 days (strip user_id, keep emotion/intent tags for training)
- User can request full deletion at any time (GDPR compliance)

### Third-Party Integrations

| Service | Purpose | Priority |
|---------|---------|----------|
| **OpenAI API** or **Anthropic Claude** | AI conversation engine | P0 |
| **Firebase Auth** or **Auth0** | User authentication | P1 |
| **Supabase** or **AWS RDS** | Database hosting | P0 |
| **Vercel** or **Railway** | Frontend/backend hosting | P0 |
| **PostHog** or **Mixpanel** | Analytics | P2 |
| **Sentry** | Error monitoring | P1 |

### Security & Privacy

**Data Protection:**
- All data encrypted at rest (AES-256)
- HTTPS enforced (TLS 1.3)
- No third-party data sharing without explicit consent

**GDPR Compliance:**
- Right to access (users can download their data)
- Right to deletion (one-click account deletion)
- Transparent privacy policy
- Cookie consent banner

**AI Safety:**
- No training on user data without anonymization
- Conversations not used to fine-tune models without opt-in

---

## 6. User Flows

### Flow 1: First-Time User Journey

```
┌─────────────────┐
│  Landing Page   │
└────────┬────────┘
         │
         [User clicks "Start Chatting"]
         │
         ▼
┌─────────────────┐
│   Guest or      │
│   Sign Up?      │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌────────┐  ┌─────────┐
│ Guest  │  │ Sign Up/│
│ Mode   │  │  Login  │
└───┬────┘  └────┬────┘
    │            │
    └─────┬──────┘
          │
          ▼
┌─────────────────┐
│ Welcome Message │
│   from MenoAI   │
└────────┬────────┘
          │
"Hi, I'm MenoAI—your compassionate space to talk about
everything menopause brings. What's on your mind right now?"
          │
          ▼
┌─────────────────┐
│   User Types    │
│ First Message   │
└────────┬────────┘
          │
          ▼
┌─────────────────┐
│  AI Responds    │
│  (3s latency)   │
└────────┬────────┘
          │
          ▼
┌─────────────────┐
│  Conversation   │
│   Continues     │
│  (5-10 msgs)    │
└────────┬────────┘
          │
          ▼
┌─────────────────┐
│  Session Ends   │
│ (User closes)   │
└─────────────────┘
```

**Key Touchpoints:**
- **0 seconds:** Landing page loads
- **5 seconds:** User decides to start chat (guest or sign up)
- **10 seconds:** First message sent
- **13 seconds:** AI responds
- **5-10 minutes:** Average session length

### Flow 2: Returning User Journey

```
┌─────────────────┐
│  User Returns   │
│  (Auto-login)   │
└────────┬────────┘
          │
          ▼
┌─────────────────┐
│   Dashboard     │
│  - New Chat     │
│  - View History │
└────────┬────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌────────┐  ┌─────────┐
│New Chat│  │Previous │
│        │  │  Convo  │
└───┬────┘  └────┬────┘
    │            │
    └─────┬──────┘
          │
          ▼
┌─────────────────┐
│ Chat Interface  │
│ (Context aware) │
└─────────────────┘
```

### Flow 3: Safety Escalation Journey

```
┌─────────────────┐
│  User Sends     │
│ High-Risk Msg   │
│ "I can't do     │
│ this anymore"   │
└────────┬────────┘
          │
          ▼
┌─────────────────┐
│   AI Detects    │
│ Safety Trigger  │
└────────┬────────┘
          │
          ▼
┌─────────────────┐
│Safety Response  │
│ "I hear how     │
│ unbearable...   │
│ Would you like  │
│   support?"     │
└────────┬────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌────────┐  ┌─────────┐
│Yes,    │  │No, keep │
│connect │  │ talking │
│me      │  │         │
└───┬────┘  └────┬────┘
    │            │
    ▼            ▼
┌────────┐  ┌─────────┐
│Display │  │Continue │
│Resource│  │with care│
│Links   │  │         │
└────────┘  └─────────┘
```

**Safety Resources Shown:**
- Samaritans (UK): 116 123
- NHS Mental Health Hotline: 111
- Menopause Support Helpline (if applicable)

### Flow 4: Pattern Recognition (Post-MVP)

```
User mentions "brain fog" in 3 conversations over 7 days
│
▼
AI sends proactive message:
"I've noticed brain fog has come up a few times.
Would you like to explore patterns or triggers?"
│
┌────┴─────┐
│          │
▼          ▼
┌────────┐  ┌─────────┐
│Yes,    │  │No thanks│
│explore │  │         │
└───┬────┘  └─────────┘
    │
    ▼
┌─────────────────┐
│     Guided      │
│   Reflection    │
│    Session      │
└─────────────────┘
```

---

## 7. Milestones and Timeline

### Phase 1: Foundation (Weeks 1-2)

#### Week 1: Setup & Infrastructure
- Set up development environment (Next.js + Node.js/FastAPI)
- Configure database (PostgreSQL schema)
- Integrate authentication (Firebase Auth)
- Set up hosting (Vercel/Railway)
- Create basic UI components (ChatInterface, MessageBubble)

#### Week 2: AI Integration
- Integrate OpenAI/Claude API
- Build custom system prompt with NVC/NLP rules
- Implement emotion detection logic
- Create intent classification system
- Build safety keyword detection

**Deliverable:** Basic chatbot that responds to user input with empathetic tone

### Phase 2: Core Features (Weeks 3-4)

#### Week 3: Conversation Intelligence
- Implement 3-turn conversation memory
- Build NVC response templates (Validate → Reflect → Reframe → Empower)
- Add NLP reframing logic (meta-model, anchoring, future pacing)
- Create conversation history UI
- Build user account system (guest + authenticated)

#### Week 4: Safety & Polish
- Implement safety escalation protocol
- Add resource links (helplines, professional contacts)
- Build data retention/anonymization logic (30-day auto-delete)
- Conduct internal QA testing
- Optimize response latency (<3s target)

**Deliverable:** Fully functional MVP ready for user testing

### Phase 3: Testing & Refinement (Week 5)

#### Week 5: User Testing
- Recruit 8-10 beta testers (UK + Portugal, ages 40-58)
- Run 5-day guided testing sessions
- Collect qualitative feedback (surveys, interviews)
- Monitor safety trigger accuracy
- Analyze conversation logs for tone/empathy quality

**Key Questions to Test:**
- Does the AI feel empathetic and non-robotic?
- Do users feel heard and validated?
- Are responses helpful without being preachy?
- Does safety escalation trigger appropriately?
- Any frustrating UX friction points?

**Deliverable:** User feedback report + prioritized bug fixes

### Phase 4: Launch Prep (Week 6)

#### Week 6: Final Polish & Launch
- Address critical bugs from testing
- Refine system prompts based on feedback
- Finalize privacy policy and GDPR compliance
- Set up analytics (PostHog/Mixpanel)
- Prepare investor demo materials
- Soft launch to beta testers

**Deliverable:** Public-facing MVP live at [domain.com]

### Post-MVP Roadmap (Weeks 7-12)

#### Phase 5: Growth & Iteration
- Add pattern recognition features
- Implement daily/weekly check-ins
- Build admin dashboard for monitoring safety flags
- Expand knowledge base (menopause symptom library)
- A/B test different conversation tones
- Plan for mobile app (React Native)

#### Phase 6: Scale Preparation
- Optimize AI costs (caching, prompt compression)
- Prepare for 100+ concurrent users
- Explore partnerships with menopause clinics
- Develop premium features (coaching sessions, community access)

### Timeline Summary

| Phase | Duration | Key Milestone |
|-------|----------|---------------|
| **Phase 1: Foundation** | Weeks 1-2 | Basic chatbot functional |
| **Phase 2: Core Features** | Weeks 3-4 | Full MVP with safety protocols |
| **Phase 3: Testing** | Week 5 | Beta user feedback collected |
| **Phase 4: Launch** | Week 6 | MVP live for public use |
| **Phase 5: Growth** | Weeks 7-12 | Pattern recognition, proactive features |

**Total MVP Timeline:** 6 weeks from start to launch  
**Investor Demo Target:** Week 8

---

## Appendix

### A. Tech Stack Summary

```yaml
Frontend:
  - Framework: Next.js 14+ (React)
  - Styling: Tailwind CSS
  - State: Zustand / React Context
  - Real-time: WebSocket/SSE

Backend:
  - API: Node.js (Express) OR Python (FastAPI)
  - AI: OpenAI GPT-4 / Anthropic Claude Sonnet 4
  - Auth: Firebase Auth / Auth0

Database:
  - Primary: PostgreSQL (Supabase / AWS RDS)
  - Caching: Redis (optional)

Hosting:
  - Frontend: Vercel
  - Backend: Railway / AWS Lambda
  - Database: Supabase / AWS RDS

Monitoring:
  - Analytics: PostHog / Mixpanel
  - Errors: Sentry
  - Logs: CloudWatch / Datadog
```

### B. Budget Allocation

| Category | Monthly Cost (MVP) |
|----------|-------------------|
| AI API (OpenAI/Claude) | $150 |
| Hosting (Vercel + Railway) | $30 |
| Database (Supabase) | $25 |
| Auth (Firebase) | $0 (free tier) |
| Monitoring (Sentry) | $0 (free tier) |
| **Total** | **~$205/month** |

### C. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI response latency >5s | High | Use streaming responses, optimize prompts |
| Safety trigger false positives | Medium | Iterative keyword refinement + human review |
| User adoption <40% retention | High | Continuous UX testing, personalization features |
| AI gives harmful advice | Critical | Multi-layer safety checks, human-in-loop review |
| GDPR non-compliance | Critical | Legal review, clear consent flows |

---

**End of Document**