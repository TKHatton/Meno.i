# MenoAI - Emotional Intelligence Companion for Menopause

An AI-powered conversational companion that provides emotionally intelligent support for women navigating perimenopause and menopause.

**Core Philosophy:** Empathy before education, validation before solutions.

---

## 📋 Project Overview

MenoAI combines therapeutic frameworks (NVC and NLP) to deliver empathetic, personalized conversations that help users understand their experiences, reframe negative thought patterns, and build emotional resilience.

### Key Features

- **4-Step Response Framework:** Validate → Reflect → Reframe → Empower
- **Emotional Validation:** Uses Nonviolent Communication (NVC) principles
- **Cognitive Reframing:** Applies NLP techniques for perspective shifts
- **Safety Escalation:** Detects high-risk language and provides professional resources
- **Privacy-First:** GDPR compliant, 30-day retention, encrypted data

### Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database/Auth:** Supabase (PostgreSQL + Auth + RLS)
- **AI:** OpenAI GPT-4 (Phase 2)
- **Hosting:** Netlify (frontend), Render (backend)
- **Monitoring:** Sentry, PostHog

---

## 🚀 Quick Start

> **📌 Note:** This quick start runs the app with **mock AI responses**. To enable real OpenAI + Supabase integration, see **[Phase 2 Setup Guide](docs/PHASE2_SETUP.md)** after completing these steps.

### Prerequisites

- Node.js 18+ and npm 9+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Meno.i
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   **For Frontend:**
   ```bash
   cd packages/frontend
   cp ../../.env.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

   **For Backend:**
   ```bash
   cd packages/backend
   cp ../../.env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   OPENAI_API_KEY=sk-your-openai-key-here
   PORT=4000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Build the shared package**
   ```bash
   cd packages/shared
   npm run build
   ```

5. **Run the development servers**

   Open two terminal windows:

   **Terminal 1 - Backend:**
   ```bash
   cd packages/backend
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd packages/frontend
   npm run dev
   ```

   Or from the root directory:
   ```bash
   npm run dev
   ```

6. **Open the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000
   - Health check: http://localhost:4000/api/health

---

## 📁 Project Structure

```
meno-ai/
├── packages/
│   ├── frontend/              # Next.js 14 application
│   │   ├── src/
│   │   │   ├── app/          # Next.js App Router pages
│   │   │   ├── components/   # React components
│   │   │   └── lib/          # Utilities (API client, Supabase)
│   │   ├── package.json
│   │   └── tailwind.config.ts
│   │
│   ├── backend/               # Express API server
│   │   ├── src/
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── services/     # Business logic (AI, safety)
│   │   │   ├── lib/          # Utilities (Supabase admin)
│   │   │   └── index.ts      # Server entry point
│   │   └── package.json
│   │
│   └── shared/                # Shared TypeScript types
│       ├── src/
│       │   ├── types/        # Message, Conversation, User types
│       │   └── prompts/      # AI prompt templates
│       └── package.json
│
├── .env.example               # Environment variable template
├── netlify.toml              # Frontend deployment config
├── render.yaml               # Backend deployment config
└── README.md
```

---

## 🧪 Testing the Application

### Test the Chat Flow

1. Go to http://localhost:3000
2. Click "Start Chatting"
3. Send a message like: "I snapped at my partner and feel awful"
4. You should receive an empathetic response using the 4-step framework

### Test Safety Triggers

Send a message containing high-risk phrases:
- "I can't handle this anymore"
- "What's the point"

You should see:
- A safety-focused response from the AI
- The safety modal appearing with crisis resources

### Test the API Directly

```bash
# Health check
curl http://localhost:4000/api/health

# Send a message
curl -X POST http://localhost:4000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"message": "I am feeling overwhelmed today"}'
```

---

## 🗄️ Supabase Setup (Optional for MVP Phase 1)

The current implementation uses mock responses. To enable full database functionality:

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and API keys

### 2. Run Database Migrations

Execute this SQL in your Supabase SQL editor:

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
    safety_level VARCHAR(10) CHECK (safety_level IN ('low', 'medium', 'high')),
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
CREATE INDEX idx_messages_safety ON messages(safety_level) WHERE safety_level = 'high';
```

### 3. Configure Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );
```

---

## 🔑 Environment Variables Reference

### Frontend (`.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Phase 2+ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Phase 2+ |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |

### Backend (`.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Phase 2+ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Phase 2+ |
| `OPENAI_API_KEY` | OpenAI API key | Phase 2 |
| `PORT` | Server port (default: 4000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

---

## 🚢 Deployment

### Frontend (Netlify)

1. Push code to GitHub
2. Connect repository to Netlify
3. Set build command: `cd packages/frontend && npm run build`
4. Set publish directory: `packages/frontend/.next`
5. Add environment variables in Netlify dashboard

### Backend (Render)

1. Connect repository to Render
2. Select "Web Service"
3. Set build command: `cd packages/backend && npm install && npm run build`
4. Set start command: `cd packages/backend && npm start`
5. Add environment variables in Render dashboard

The `netlify.toml` and `render.yaml` files in the root already contain the necessary configuration.

---

## 📊 Development Roadmap

### ✅ Phase 1: Foundation (Current)
- Monorepo structure with TypeScript
- Next.js frontend with Tailwind CSS
- Express backend with mock responses
- Safety detection system
- Basic chat interface

### 🚧 Phase 2: AI Integration (Next)
- OpenAI GPT-4 integration
- Real-time conversation context
- Emotion and need detection
- Supabase database integration
- User authentication

### 📅 Phase 3: Safety & Data (Weeks 3)
- Full safety escalation protocol
- Conversation history
- 30-day retention policy
- GDPR compliance features

### 📅 Phase 4: Polish (Week 4)
- Streaming responses
- Error handling
- Analytics integration
- Accessibility improvements

### 📅 Phase 5: Testing (Week 5)
- Beta user testing
- Feedback collection
- UX refinements

### 📅 Phase 6: Launch (Week 6)
- Production deployment
- Privacy policy
- Public launch

---

## 🧰 Available Scripts

### Root Level
- `npm run dev` - Run both frontend and backend concurrently
- `npm run build` - Build all packages
- `npm run install:all` - Install all dependencies

### Frontend (`packages/frontend`)
- `npm run dev` - Start Next.js dev server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server

### Backend (`packages/backend`)
- `npm run dev` - Start Express dev server with hot reload (port 4000)
- `npm run build` - Compile TypeScript
- `npm start` - Start production server

### Shared (`packages/shared`)
- `npm run build` - Compile TypeScript types
- `npm run dev` - Watch mode for development

---

## 🤝 Contributing

This is an early-stage MVP. Contribution guidelines will be added in Phase 3.

---

## 📝 License

Proprietary - All rights reserved

---

## 📞 Support

For questions or issues during development, please refer to the PRD or create an issue in the repository.

---

## 🎯 Current Status

**Phase:** Phase 2 Complete - OpenAI + Supabase Integration
**Status:** ✅ Full AI and database functionality implemented
**Next Step:** Configure API keys to activate (see [Phase 2 Setup Guide](docs/PHASE2_SETUP.md))

### What's Working Now

**Phase 1 (Complete):**
- ✅ Full-stack TypeScript monorepo
- ✅ Next.js chat interface with Tailwind styling
- ✅ Express API with health check and chat endpoints
- ✅ Mock 4-step AI responses (default mode)
- ✅ Safety detection and escalation modal
- ✅ Shared types and prompt templates

**Phase 2 (Complete - Requires Configuration):**
- ✅ OpenAI GPT-4 integration with automatic fallback
- ✅ Supabase authentication (Email + Google OAuth)
- ✅ Database persistence for conversations and messages
- ✅ Safety event logging to database
- ✅ Conversation history with context awareness
- ✅ Auth middleware for protected routes
- ✅ Guest mode support

### Activate Phase 2 Features

Follow the **[Phase 2 Setup Guide](docs/PHASE2_SETUP.md)** to:
1. Get OpenAI API key (~5 min)
2. Create Supabase project (~10 min)
3. Configure environment variables (~5 min)
4. Test all features (~10 min)

**Total setup time:** ~30 minutes

### What's Coming Next (Phase 3+)

- Streaming responses for better UX
- Admin dashboard for safety monitoring
- Pattern recognition (recurring topics)
- Enhanced analytics and insights
- Mobile app (React Native)
