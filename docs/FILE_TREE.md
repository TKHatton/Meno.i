# MenoAI File Structure

Complete directory tree showing all files in the MVP skeleton.

```
Meno.i/
├── docs/
│   ├── FILE_TREE.md                    # This file
│   ├── NEXT_STEPS.md                   # Detailed implementation roadmap
│   └── SUPABASE_SCHEMA.sql             # Database schema for Supabase
│
├── packages/
│   ├── backend/                        # Express API (Node.js + TypeScript)
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   └── supabase.ts         # Supabase admin client
│   │   │   ├── routes/
│   │   │   │   ├── chat.ts             # Chat endpoints (/send, /history)
│   │   │   │   └── health.ts           # Health check endpoint
│   │   │   ├── services/
│   │   │   │   ├── ai.ts               # AI response generation (mock + future OpenAI)
│   │   │   │   └── safety.ts           # Safety detection service
│   │   │   └── index.ts                # Express server entry point
│   │   ├── package.json                # Backend dependencies
│   │   └── tsconfig.json               # TypeScript config
│   │
│   ├── frontend/                       # Next.js 14 app (React + Tailwind)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── chat/
│   │   │   │   │   └── page.tsx        # Main chat interface page
│   │   │   │   ├── globals.css         # Global styles + Tailwind imports
│   │   │   │   ├── layout.tsx          # Root layout component
│   │   │   │   └── page.tsx            # Landing page
│   │   │   ├── components/
│   │   │   │   ├── chat/
│   │   │   │   │   ├── ChatInterface.tsx    # Main chat component
│   │   │   │   │   ├── MessageBubble.tsx    # Individual message display
│   │   │   │   │   ├── MessageInput.tsx     # Message text input
│   │   │   │   │   ├── MessageList.tsx      # List of all messages
│   │   │   │   │   └── TypingIndicator.tsx  # Animated typing dots
│   │   │   │   └── safety/
│   │   │   │       └── SafetyModal.tsx      # Safety resources modal
│   │   │   └── lib/
│   │   │       ├── api.ts              # API client for backend
│   │   │       └── supabase.ts         # Supabase client (RLS)
│   │   ├── next.config.js              # Next.js configuration
│   │   ├── package.json                # Frontend dependencies
│   │   ├── postcss.config.js           # PostCSS config for Tailwind
│   │   ├── tailwind.config.ts          # Tailwind CSS config
│   │   └── tsconfig.json               # TypeScript config
│   │
│   └── shared/                         # Shared TypeScript types
│       ├── src/
│       │   ├── prompts/
│       │   │   └── templates.ts        # AI system prompts
│       │   ├── types/
│       │   │   ├── conversation.ts     # Conversation types
│       │   │   ├── message.ts          # Message types
│       │   │   └── user.ts             # User types
│       │   └── index.ts                # Package exports
│       ├── package.json                # Shared package config
│       └── tsconfig.json               # TypeScript config
│
├── prompts/
│   └── menoai-mvp-plan.md             # Original planning prompt
│
├── .env.example                        # Environment variable template
├── .gitignore                          # Git ignore rules
├── netlify.toml                        # Netlify deployment config
├── package.json                        # Root workspace config
├── PRD.md                              # Product Requirements Document
├── README.md                           # Setup and usage instructions
└── render.yaml                         # Render deployment config
```

## File Count Summary

- **Total TypeScript files:** 24
- **Configuration files:** 9
- **Documentation files:** 5
- **Total lines of code:** ~2,500+

## Key Files by Function

### Frontend Entry Points
- `packages/frontend/src/app/page.tsx` - Landing page
- `packages/frontend/src/app/chat/page.tsx` - Chat interface

### Backend Entry Points
- `packages/backend/src/index.ts` - Express server
- `packages/backend/src/routes/chat.ts` - Main API logic

### Core Logic
- `packages/backend/src/services/ai.ts` - AI response generation
- `packages/backend/src/services/safety.ts` - Safety detection
- `packages/shared/src/prompts/templates.ts` - System prompts

### Configuration
- `package.json` (root) - Monorepo workspace
- `netlify.toml` - Frontend deployment
- `render.yaml` - Backend deployment
- `.env.example` - Environment variables template

### Documentation
- `README.md` - Setup guide
- `docs/NEXT_STEPS.md` - Development roadmap
- `docs/SUPABASE_SCHEMA.sql` - Database schema
- `PRD.md` - Product requirements
