# Product Requirements Document (PRD)

## MenoAI — Emotional Intelligence Companion for Menopause  
**Version:** 1.0  
**Date:** October 18, 2025  
**Owner:** Product Team  
**Status:** MVP Planning  

---

## 1. Product Overview

### What We're Building
MenoAI is an AI-powered conversational companion that provides emotionally intelligent support for women navigating perimenopause and menopause.  
Unlike medical chatbots or symptom trackers, MenoAI combines therapeutic frameworks (NLP and NVC) to deliver empathetic, personalized conversations that help users understand their experiences, reframe negative thought patterns, and build emotional resilience.

### Problem Statement
Women going through perimenopause and menopause face a complex intersection of physical symptoms, emotional volatility, and identity shifts—often with limited support systems. Current solutions fall into two extremes:

- **Medical apps:** Focus on symptom tracking but lack emotional support.  
- **Mental health apps:** Don’t understand menopause-specific experiences.  

**The gap:** Women need a space where they feel heard, validated, and empowered—not just informed or tracked.

### Why This Matters
- 1.3 billion women worldwide will be in perimenopause/menopause by 2030.  
- 60% report feeling unsupported by healthcare systems.  
- Emotional symptoms (anxiety, mood swings, identity crisis) are often dismissed as "just hormones."  
- Relationship strain, work performance concerns, and self-confidence erosion go unaddressed.

---

## 2. Target Users

### Primary User Persona
**Name:** Sarah  
**Age:** 47  
**Stage:** Perimenopause  
**Location:** UK or Portugal  

**Context:**  
- Working professional experiencing brain fog and mood swings.  
- Feels isolated; partner doesn’t understand her experience.  
- Frustrated by dismissive medical interactions (“it’s normal, everyone goes through it”).  
- Seeking emotional validation and practical coping strategies.  
- Values privacy and non-judgmental support.

### User Pain Points

| Pain Point | Description | Impact |
|-------------|--------------|--------|
| Emotional Invalidation | Feelings dismissed as “overreacting” or “just hormones” | Isolation, shame, self-doubt |
| Identity Crisis | “I don’t recognize myself anymore” | Loss of confidence, confusion about self-worth |
| Communication Breakdown | Partners/family don’t understand the experience | Relationship tension, loneliness |
| Symptom Overwhelm | Hot flashes, brain fog, sleep disruption simultaneously | Exhaustion, loss of control |
| Professional Anxiety | Fear of appearing incompetent at work | Career insecurity, stress |
| Lack of Safe Space | No judgment-free zone to express frustration or grief | Suppressed emotions, burnout |

### Secondary Users
- Women aged 40–58 (core demographic)  
- Those seeking non-medical emotional support  
- Users preferring digital-first solutions over in-person therapy  

---

## 3. Goals and Success Metrics

### Product Goals
**Primary Goal:**  
Create a trusted emotional companion that helps women feel heard, validated, and empowered during menopause transitions.

**Secondary Goals:**  
- Reduce emotional distress through NLP/NVC-based conversations.  
- Normalize menopause experiences and eliminate shame.  
- Bridge the gap between symptom awareness and emotional resilience.

### Success Metrics (MVP Phase)

#### User Engagement
- **Return rate:** ≥60% of users return for 2+ sessions per week.  
- **Session depth:** 5–10 messages per session.  
- **Retention:** 40% of users active after 30 days.

#### Emotional Impact (Qualitative)
- ≥75% of post-session users report feeling “heard, calmer, supported.”  
- Testimonials use phrases like “feels like talking to someone who gets it.”  

#### Safety Metrics
- 100% of high-risk conversations flagged appropriately.  
- Zero harmful or unsafe advice incidents.

#### Technical Metrics
- Response latency <3 seconds.  
- 99% uptime.  
- 30-day conversation history retention.

#### Long-Term Indicators
- Partnerships with menopause clinics or therapists.  
- 1,000+ active users.  
- Positive clinical validation studies.  
- Community peer support features.

---

## 4. Core Features for MVP

### Feature Prioritization

| Priority | Feature | Rationale |
|-----------|----------|------------|
| **P0 (Must-Have)** | AI Conversational Engine | Core product value |
| **P0** | Emotional Validation (NVC) | Differentiator |
| **P0** | NLP Reframing | Therapeutic value |
| **P0** | Safety Escalation Protocol | User protection |
| **P1 (Should-Have)** | Conversation History | Continuity and reflection |
| **P1** | User Accounts | Personalization |
| **P2 (Nice-to-Have)** | Daily Check-ins | Engagement |
| **P2** | Pattern Recognition | Enhanced personalization |

---

### P0 Features (MVP Launch)

#### 1. AI Conversational Engine
Real-time, text-based interface with empathetic, context-aware responses.  
Combines **70% NVC** (emotional validation) + **30% NLP** (cognitive reframing).  
Tone: warm, sisterly, non-clinical.  

**Technical Specs:**  
- API: OpenAI GPT-4 or Anthropic Claude Sonnet  
- 3-turn context memory  
- <3s response time  

**Acceptance Criteria:**  
- No onboarding friction  
- Responses feel natural and empathetic  
- No robotic or repetitive phrasing  

#### 2. Emotional Validation (NVC Framework)
AI identifies user emotions/needs and validates them via Nonviolent Communication.  

**Response Structure:**  
Observation → Feeling → Need → Request  

**Example:**  
_User_: “I snapped at my partner and feel awful.”  
_AI_: “That moment sounds heavy—perhaps guilt shows how much connection matters to you. Want to explore what triggered it?”  

**Acceptance Criteria:**  
- 80% of responses show correct validation  
- Users report feeling “heard”  

#### 3. NLP Reframing Techniques
Reframes disempowering thoughts into empowering ones.  
Includes: anchoring, future pacing, pattern interruption, meta-model questioning.

**Example:**  
“What if this isn’t failure—just your body asking for rest?”

#### 4. Safety Escalation Protocol
Detects high-risk language (self-harm, despair, suicidal ideation).  
Uses calm, empathetic escalation template linking helplines and professional resources.

**Acceptance Criteria:**  
- 100% of flagged phrases trigger correctly  
- No false positives disrupting normal chat  

---

### P1 Features

#### 5. Conversation History
- Retain 30 days of history  
- Searchable, deletable, anonymized  
- GDPR compliant  

#### 6. User Accounts
- Optional email/Google sign-in  
- Guest mode for quick access  
- Seamless conversion from guest to user  

---

### P2 Features

#### 7. Pattern Recognition & Check-Ins
AI detects recurring issues (e.g., “brain fog”) and prompts reflection.  

#### 8. Daily/Weekly Prompts
Light-touch engagement:
- “How are you feeling today?”
- “Would you like to review your week?”

No notifications between 10 PM–7 AM.

---

## 5. Technical Requirements

### Architecture Overview
