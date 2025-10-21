# MenoAI (Meno.I) — MVP Technical Plan & Kickstart Build Prompt

**Audience:** Claude Code (read this file and follow the instructions)  
**Context files:** `PRD.md` (place at repo root or reference correct path)

---

## Role & Objective

You are an experienced **senior software architect** and **AI project planner**.

I’m building an AI-powered emotional intelligence companion called **MenoAI (Meno.I)** — a web app that supports women navigating perimenopause and menopause through emotionally intelligent conversation.

**Core philosophy:** empathy before education, validation before solutions.

Your task:  
Use the content within **`PRD.md`** to create a complete technical implementation plan for building the MVP version of MenoAI based on the following summary.

---

## Project Summary

- MenoAI is a conversational app blending **NVC (Nonviolent Communication)** and **NLP (Neuro-Linguistic Programming)** principles to deliver emotionally validating and reframing conversations.
- It detects emotional tone and intent, responds with empathy, and uses a **4-step response structure:** **Validate → Reflect → Reframe → Empower**.
- It must include **safety detection and escalation** when users express distress or self-harm risk.
- Users can **chat anonymously** or **create optional accounts** (email/Google).
- **Conversation history retained for 30 days** (then anonymized).
- **Launch target:** 6-week MVP; testing group of 8–10 women (UK & Portugal).

### Preferred Stack & Tools (for planning phase)

- **Frontend:** Next.js 14 (React + Tailwind)
- **Backend:** Node.js with Express **or** Python FastAPI (you may recommend which is better for this use case)
- **Database:** PostgreSQL via **Supabase**
- **Auth:** **Supabase Auth**
- **AI Model:** OpenAI GPT-4 or Claude Sonnet 4.5 (API integration)
- **Hosting:** Netlify (frontend)
- **Analytics & Monitoring:** PostHog or Mixpanel, Sentry
- **Privacy:** GDPR compliance, encryption at rest and in transit

---

## Deliverables (Planning Phase)

1. **Structured build plan** clearly separating phases (**planning → setup → feature development → testing → launch**).
2. **Week-by-week roadmap** for **6 weeks** showing what gets done, in what order, and why.
3. **Proposed file-structure outline** for the chosen stack.
4. **Integrations and environment variables** to configure.
5. **Local setup instructions** for running the project.
6. **Milestones and quality checks** for each phase (e.g., “Conversation engine responding with empathy and correct safety triggers”).
7. **Next-steps after MVP** suggestions (features or optimizations to tackle next).

**Before writing the plan**, think step-by-step about the **architecture, data flow, and deployment strategy**.  
Write a **short summary of your reasoning first (1–2 paragraphs)**, then present the **detailed plan**.

---

## Now for the Build (Execution Phase)

You are now an experienced **senior full-stack engineer** working with AI conversational systems.

Use the planning output **you just created** as the **source of truth**.

### Confirmed Tech Choices (Execution)

- **Frontend:** Next.js 14 + Tailwind CSS, **hosted on Netlify**
- **Backend:** Node.js + Express (**TypeScript**), **hosted on Render**
- **Database/Auth:** **Supabase** (Postgres + Auth + RLS)
- **AI Provider:** **OpenAI GPT-4** (structured 4-step output: Validate → Reflect → Reframe → Empower)
- **Monitoring:** **Sentry + PostHog**
- **Privacy:** **GDPR** retention/anonymization after **30 days**

### Execution Goal

Begin coding **Phase 1 (Setup)** and **Phase 2 (Core Features)** from the plan to create a **runnable MVP skeleton**.

### Execution Deliverables

1. **Initial repo structure (monorepo)** with **shared types** and **prompt templates**.
2. Add required **config and env files**:
   - `.env.example`
   - `netlify.toml` (frontend build)
   - `render.yaml` (backend deployment)
3. **Minimal working code** that runs locally and connects the two services:
   - Next.js 14 app with Tailwind and `/chat` page
   - Express API with `/api/health` and `/api/chat` routes
   - `/api/chat` returns a **mock structured response** using the 4-step format (**no OpenAI call yet**)
4. Configure **Supabase connection modules** for both frontend and backend.
5. Include **inline comments** explaining what each file does.
6. Ensure `package.json` lists all dependencies and the project runs with:
   - **Frontend:** http://localhost:3000
   - **Backend:** http://localhost:4000

### Formatting Requirements (for your output)

1. **File/Folder Tree**
2. **`.env.example`**
3. **Key files with code** (Next.js, Express, Supabase client, config files)
4. **Local Setup Instructions (step-by-step)**

### Constraints

- Use **TypeScript everywhere**.
- Avoid placeholders like “…” — **all code must be runnable**.
- Keep it **clean and documented** for a beginner.

### Final Confirmation

When finished, confirm that the app can be **run locally** with the provided commands and describe the **next Phase** (adding real **LLM** integration with safety scaffolding and structured outputs).

---

## Notes for Claude Code

- First, **read** `PRD.md` and this file.
- Produce the **planning deliverables**, then immediately proceed to the **execution deliverables** in a single response (clearly separated).
- Keep the code **minimal but running**, and include **clear comments**.
- If any assumptions are needed (paths, package names), **state them explicitly** before proceeding.

