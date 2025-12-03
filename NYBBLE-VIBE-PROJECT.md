# 🎮 NYBBLE VIBE - Event Engagement Platform

> A gamified Chrome extension for meeting engagement, feedback collection, and AI-powered meeting insights.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Problem Statement](#-problem-statement)
3. [Solution](#-solution)
4. [Features](#-features)
5. [User Journey](#-user-journey)
6. [Technical Architecture](#-technical-architecture)
7. [Gamification System](#-gamification-system)
8. [AI Features](#-ai-features)
9. [Admin Dashboard](#-admin-dashboard)
10. [Design System](#-design-system)
11. [Data Models](#-data-models)
12. [API Endpoints](#-api-endpoints)
13. [MVP Scope](#-mvp-scope)
14. [Future Roadmap](#-future-roadmap)
15. [Getting Started](#-getting-started)

---

## 🎯 Project Overview

**Nybble Vibe** is a Chrome extension that enhances meeting experiences by adding gamification, real-time engagement tools, and AI-powered insights. It runs alongside Google Meet (or any video conferencing tool) as a companion sidebar.

### Core Concept

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   NOT a meeting platform replacement                                        │
│   A COMPANION that enhances existing meetings                               │
│                                                                             │
│   User's Screen:                                                            │
│   ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│   │                                 │  │                                 │  │
│   │        GOOGLE MEET              │  │       NYBBLE VIBE               │  │
│   │        (Video Call)             │  │       (Sidebar)                 │  │
│   │                                 │  │                                 │  │
│   │   The actual meeting happens    │  │   Engagement, polls,            │  │
│   │   here as normal                │  │   reactions, points             │  │
│   │                                 │  │                                 │  │
│   └─────────────────────────────────┘  └─────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 😫 Problem Statement

### Current Meeting Pain Points

| Phase | Problem |
|-------|---------|
| **PRE** | No excitement building, no preparation, no expectations set |
| **DURING** | Passive audience, cameras off, "any questions?" = silence, no engagement measurement |
| **POST** | Generic surveys nobody fills, no actionable feedback, forgotten in 24 hours |

### Business Impact

- Low meeting engagement = wasted time
- No feedback = can't improve
- No data = can't measure what works
- Boring experience = people avoid optional meetings

---

## ✨ Solution

Nybble Vibe transforms meetings into engaging experiences through:

1. **Gamification** - Points, badges, leaderboards make participation fun
2. **Low-friction engagement** - One-tap reactions, quick polls
3. **Smart feedback** - AI-generated questions, goal tracking
4. **AI Meeting Q&A** - Ask questions about the meeting after it ends using the transcript
5. **Data collection** - Measure engagement, sentiment, participation

---

## 🚀 Features

### Pre-Meeting Features

| Feature | Description | Points |
|---------|-------------|--------|
| **Agenda Preview** | View meeting agenda and topics | +10 |
| **Set Goals** | Define what you want to achieve | +20 |
| **Prepare Questions** | Pre-write questions to ask | +15 each |
| **See Attendees** | View who's joining | - |
| **Expectations** | Select what you hope to learn | +15 |

### During-Meeting Features

| Feature | Description | Points |
|---------|-------------|--------|
| **Attendance Tracking** | Auto-track join time and duration | +50 |
| **Live Polls** | Vote on polls pushed by organizer | +15 each |
| **Quick Reactions** | Tap emoji reactions (🔥👏💡🤔❤️🚀) | +5 each (max 10) |
| **Q&A Submission** | Submit anonymous questions | +25 each |
| **Prepared Q Tracking** | Mark prepared questions as asked | +10 |

### Post-Meeting Features

| Feature | Description | Points |
|---------|-------------|--------|
| **Participation Summary** | See your engagement stats | - |
| **Quick Feedback** | Rate the meeting (emoji scale) | +10 |
| **Goal Achievement** | Did you achieve your goal? | +20 |
| **Detailed Feedback** | Open text feedback | +20 |
| **AI Meeting Q&A** | Ask AI about meeting content | +10 each |
| **Achievements** | View badges earned | - |
| **Leaderboard** | See your ranking | - |

---

## 👤 User Journey

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                        USER JOURNEY TIMELINE                                │
│                                                                             │
│  ENTRY              PRE-MEETING         DURING            POST-MEETING      │
│  ─────              ───────────         ──────            ────────────      │
│                                                                             │
│  📧 Gets link       📋 View agenda      🔴 Live mode      📊 Stats shown    │
│      │              🎯 Set goals        ⚡ Reactions      📝 Feedback       │
│      ▼              ❓ Prep questions   📊 Vote polls     🤖 AI Q&A         │
│  Opens extension    👥 See attendees    💬 Submit Qs      🏆 Final score    │
│      │                   │                   │            🎖️ Badges         │
│      ▼                   ▼                   ▼                 │            │
│  ┌─────────┐        ┌─────────┐        ┌─────────┐        ┌─────────┐      │
│  │ 30 sec  │───────►│ ~2 min  │───────►│ Meeting │───────►│ ~3 min  │      │
│  │ Setup   │        │  Prep   │        │Duration │        │Feedback │      │
│  └─────────┘        └─────────┘        └─────────┘        └─────────┘      │
│                                                                             │
│  Total user time: ~6-8 minutes across entire meeting lifecycle              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase States

The extension detects and displays different UI based on meeting phase:

```javascript
const PHASES = {
  PRE: 'pre',      // Before meeting starts
  LIVE: 'live',    // During meeting
  POST: 'post',    // After meeting ends
  CLOSED: 'closed' // Event fully closed
};
```

---

## 🏗️ Technical Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ┌─────────────────────┐          ┌─────────────────────┐                  │
│   │  ADMIN DASHBOARD    │          │  CHROME EXTENSION   │                  │
│   │  (React Web App)    │          │  (Sidebar)          │                  │
│   │                     │          │                     │                  │
│   │  • Create events    │          │  • PRE/LIVE/POST UI │                  │
│   │  • Manage polls     │          │  • Polls & reactions│                  │
│   │  • Upload transcr.  │          │  • AI Q&A           │                  │
│   │  • View analytics   │          │  • Points/badges    │                  │
│   └──────────┬──────────┘          └──────────┬──────────┘                  │
│              │                                │                              │
│              │         REST API               │                              │
│              └────────────┬───────────────────┘                              │
│                           │                                                  │
│                           ▼                                                  │
│              ┌─────────────────────┐                                         │
│              │     BACKEND API     │                                         │
│              │     (Node/Nest)     │                                         │
│              │                     │                                         │
│              │  • Events CRUD      │                                         │
│              │  • Polls management │                                         │
│              │  • User tracking    │                                         │
│              │  • Points system    │                                         │
│              │  • AI integration   │                                         │
│              └──────────┬──────────┘                                         │
│                         │                                                    │
│              ┌──────────┴──────────┐                                         │
│              ▼                     ▼                                         │
│   ┌─────────────────┐   ┌─────────────────┐                                 │
│   │    DATABASE     │   │    AI SERVICE   │                                 │
│   │   (PostgreSQL)  │   │   (OpenAI API)  │                                 │
│   └─────────────────┘   └─────────────────┘                                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Chrome Extension Structure

```
nybble-vibe-extension/
│
├── manifest.json              # Extension configuration (Manifest V3)
│
├── background/
│   └── service-worker.js      # Background script for event handling
│
├── content/
│   ├── inject.js              # Injects sidebar into Google Meet
│   └── styles.css             # Injection styles
│
├── sidebar/                   # Main sidebar app
│   ├── index.html
│   ├── index.js               # Entry point
│   ├── styles.css             # Main styles
│   │
│   ├── components/
│   │   ├── PreMeeting.js      # Pre-meeting UI
│   │   ├── LiveMeeting.js     # During meeting UI
│   │   ├── PostMeeting.js     # Post-meeting UI
│   │   ├── Poll.js            # Poll component
│   │   ├── ReactionBar.js     # Emoji reactions
│   │   ├── PointsDisplay.js   # Points & rank
│   │   ├── Achievements.js    # Badges display
│   │   └── AIChat.js          # AI Q&A interface
│   │
│   ├── services/
│   │   ├── api.js             # Backend API calls
│   │   ├── storage.js         # Chrome storage wrapper
│   │   └── ai.js              # AI service calls
│   │
│   └── data/
│       └── mockData.js        # Mock data for MVP
│
├── popup/                     # Extension popup (settings)
│   ├── index.html
│   └── popup.js
│
└── assets/
    ├── icons/
    │   ├── icon16.png
    │   ├── icon48.png
    │   └── icon128.png
    └── images/
```

### Manifest.json Template

```json
{
  "manifest_version": 3,
  "name": "Nybble Vibe",
  "version": "1.0.0",
  "description": "Gamified meeting engagement & feedback",
  
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  
  "host_permissions": [
    "https://meet.google.com/*",
    "https://zoom.us/*"
  ],
  
  "background": {
    "service_worker": "background/service-worker.js"
  },
  
  "content_scripts": [
    {
      "matches": ["https://meet.google.com/*"],
      "js": ["content/inject.js"],
      "css": ["content/styles.css"]
    }
  ],
  
  "action": {
    "default_popup": "popup/index.html",
    "default_icon": {
      "16": "assets/icons/icon16.png",
      "48": "assets/icons/icon48.png",
      "128": "assets/icons/icon128.png"
    }
  },
  
  "icons": {
    "16": "assets/icons/icon16.png",
    "48": "assets/icons/icon48.png",
    "128": "assets/icons/icon128.png"
  }
}
```

---

## 🏆 Gamification System

### Points Table

```javascript
const POINTS = {
  // Pre-meeting
  VIEW_AGENDA: 10,
  SET_GOAL: 20,
  PREPARE_QUESTION: 15,
  SET_EXPECTATIONS: 15,
  
  // During meeting
  ATTENDANCE: 50,
  FULL_ATTENDANCE: 30,      // Stay 90%+ of meeting
  POLL_VOTE: 15,
  REACTION: 5,              // Max 10 reactions = 50 pts
  ASK_QUESTION: 25,
  MARK_QUESTION_ASKED: 10,
  
  // Post-meeting
  COMPLETE_FEEDBACK: 40,
  RATE_MEETING: 10,
  GOAL_ACHIEVED: 20,
  DETAILED_FEEDBACK: 20,
  AI_QUESTION: 10,
};
```

### Badges/Achievements

```javascript
const BADGES = [
  {
    id: 'full_journey',
    name: 'Full Journey',
    icon: '🎯',
    description: 'Complete PRE + LIVE + POST phases',
    condition: (user, event) => user.completedPre && user.attendedLive && user.completedPost
  },
  {
    id: 'poll_master',
    name: 'Poll Master',
    icon: '📊',
    description: 'Vote in all polls of an event',
    condition: (user, event) => user.pollsVoted === event.totalPolls
  },
  {
    id: 'curious_mind',
    name: 'Curious Mind',
    icon: '💬',
    description: 'Ask 3 or more questions',
    condition: (user) => user.questionsAsked >= 3
  },
  {
    id: 'on_fire',
    name: 'On Fire',
    icon: '🔥',
    description: '5 event attendance streak',
    condition: (user) => user.streak >= 5
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    icon: '⏰',
    description: 'Join meeting 5+ minutes early',
    condition: (user, event) => user.joinTime <= event.startTime - 5 * 60 * 1000
  },
  {
    id: 'marathon',
    name: 'Marathon Runner',
    icon: '🏃',
    description: 'Attend 90%+ of meeting duration',
    condition: (user, event) => user.attendancePercent >= 90
  },
  {
    id: 'ai_explorer',
    name: 'AI Explorer',
    icon: '🤖',
    description: 'Ask 5+ questions to meeting AI',
    condition: (user) => user.aiQuestionsAsked >= 5
  },
  {
    id: 'top_3',
    name: 'Podium Finish',
    icon: '🎖️',
    description: 'Finish in top 3 of an event',
    condition: (user, event) => user.rank <= 3
  },
  {
    id: 'champion',
    name: 'Champion',
    icon: '👑',
    description: 'Finish #1 in an event',
    condition: (user, event) => user.rank === 1
  }
];
```

### Streak System

```javascript
const STREAK_MULTIPLIERS = {
  3: 1.5,   // 3 events in a row = 1.5x points
  5: 2.0,   // 5 events = 2x points
  10: 3.0,  // 10 events = 3x points
};
```

---

## 🤖 AI Features

### "Ask the Meeting" - Transcript Q&A

After a meeting ends, users can ask questions about what was discussed using the meeting transcript.

#### How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   1. MEETING HAPPENS                                                        │
│      └── Google Meet records/transcribes                                    │
│                                                                             │
│   2. ADMIN UPLOADS TRANSCRIPT                                               │
│      └── Supported formats: .txt, .vtt, .srt, .json                        │
│      └── Or: Auto-import from Otter.ai, Fellow, etc. (future)              │
│                                                                             │
│   3. TRANSCRIPT PROCESSED                                                   │
│      └── Stored in database linked to event                                │
│      └── Optionally: Create embeddings for better search                   │
│                                                                             │
│   4. USER ASKS QUESTION                                                     │
│      └── "What was decided about the deadline?"                            │
│      └── "Who is responsible for the API integration?"                     │
│      └── "Summarize the discussion about budget"                           │
│                                                                             │
│   5. AI GENERATES ANSWER                                                    │
│      └── Sends transcript + question to LLM                                │
│      └── Returns contextual answer with citations                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Example Prompt Template

```javascript
const generateAIAnswer = async (transcript, question) => {
  const prompt = `
You are an AI assistant that answers questions about a meeting based on its transcript.

MEETING TRANSCRIPT:
${transcript}

USER QUESTION:
${question}

INSTRUCTIONS:
1. Answer based ONLY on the transcript content
2. If the information is not in the transcript, say so
3. Quote relevant parts when helpful
4. Be concise but complete
5. Mention who said what when relevant

ANSWER:
`;
  
  return await openai.chat(prompt);
};
```

#### Example Questions

- "What were the main action items?"
- "Who volunteered for the frontend task?"
- "What was the decision on the deadline?"
- "Summarize what Maria said about the budget"
- "What questions were asked during Q&A?"
- "Were there any disagreements? About what?"
- "What are the next steps?"

#### AI-Generated Smart Feedback Questions

```javascript
const generateFeedbackQuestions = async (event) => {
  const prompt = `
Event: ${event.title}
Description: ${event.description}
Agenda: ${event.agenda.join(', ')}
${event.transcript ? `Meeting Summary: ${summarize(event.transcript)}` : ''}

Generate 5 engaging feedback questions for participants:
- 1 rating question (emoji scale)
- 2 multiple choice questions
- 1 open-ended question
- 1 fun/creative question

Make them SPECIFIC to this event, not generic.
Return as JSON array.
`;
  
  return await openai.chat(prompt);
};
```

---

## 🖥️ Admin Dashboard

### Features Overview

| Section | Features |
|---------|----------|
| **Events** | Create, edit, delete events; Set agenda; Link to calendar |
| **Polls** | Create polls; Launch/close during meeting; View results |
| **Transcripts** | Upload meeting transcripts; Enable AI Q&A |
| **Analytics** | Engagement metrics; Participation rates; Feedback summary |
| **Users** | View leaderboards; Manage badges; Export data |
| **Settings** | Configure points; Custom badges; Integrations |

### Dashboard Screens

#### Events Management

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  EVENTS                                                    [+ Create Event]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  🔴 LIVE   Tech Talk Q4                              45 participants    │ │
│  │  Started 23 min ago                                  [View] [Manage]    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  ⏰ UPCOMING   Sprint Review                         Dec 18, 2:00 PM    │ │
│  │  12 confirmed                                        [View] [Edit]      │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  ✅ COMPLETED   All Hands November                   89 participants    │ │
│  │  Nov 28, 2024                                        [Analytics] [AI]   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Poll Management

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  POLLS - Tech Talk Q4                                       [+ Create Poll]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Poll 1: "What's your Q1 priority?"                          [ACTIVE]   │ │
│  │  ├── Performance (67%) ████████████████████                             │ │
│  │  ├── Security (23%)    ███████                                          │ │
│  │  └── Features (10%)    ███                                              │ │
│  │                                                   34/45 voted           │ │
│  │  [Close Poll] [Show Results to All]                                     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Poll 2: "Best AI model for our use case?"                   [DRAFT]    │ │
│  │  Options: GPT-4, Claude, Gemini, Other                                  │ │
│  │  [Edit] [Launch Now] [Delete]                                           │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Analytics View

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ANALYTICS                                          [Export] [Date Range ▼]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Avg Rating   │  │ Attendance   │  │ Poll Rate    │  │ Feedback     │     │
│  │   4.2/5 ⭐   │  │    87%       │  │    73%       │  │    65%       │     │
│  │   ↑ 0.3      │  │   ↑ 5%       │  │   ↑ 12%      │  │   ↑ 8%       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                                              │
│  ENGAGEMENT TREND                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                                        ╱╲                               │ │
│  │                            ╱╲         ╱  ╲    ╱╲                        │ │
│  │                   ╱╲      ╱  ╲       ╱    ╲  ╱  ╲                       │ │
│  │         ╱╲       ╱  ╲    ╱    ╲     ╱      ╲╱    ╲                      │ │
│  │        ╱  ╲     ╱    ╲  ╱      ╲   ╱                                    │ │
│  │       ╱    ╲   ╱      ╲╱        ╲ ╱                                     │ │
│  │      ╱      ╲ ╱                  ╲                                      │ │
│  │     ╱        ╲                                                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│       Oct           Nov           Dec                                        │
│                                                                              │
│  TOP FEEDBACK THEMES                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  😊 Positive: "Great insights", "Well organized", "Loved the demos"     │ │
│  │  😐 Improve:  "Too long", "More Q&A time", "Share slides earlier"       │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design System

### Color Palette

```css
:root {
  /* Background */
  --bg-primary: #0D0D0F;
  --bg-secondary: #1A1A1F;
  --bg-tertiary: #252529;
  
  /* Accent Colors */
  --accent-primary: #6366F1;    /* Indigo */
  --accent-secondary: #22D3EE;  /* Cyan */
  --accent-glow: rgba(99, 102, 241, 0.4);
  
  /* Status Colors */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --live: #EF4444;
  
  /* Text */
  --text-primary: #F4F4F5;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;
  
  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-medium: rgba(255, 255, 255, 0.2);
}
```

### Typography

```css
/* Primary Font */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Alternative: Space Grotesk for headings */
font-family: 'Space Grotesk', sans-serif;

/* Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
```

### Component Styles

```css
/* Card with glassmorphism */
.card {
  background: rgba(26, 26, 31, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 16px;
}

/* Glowing button */
.btn-primary {
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 20px var(--accent-glow);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px var(--accent-glow);
}

/* Reaction button */
.reaction-btn {
  font-size: 24px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.reaction-btn:hover {
  transform: scale(1.1);
  background: var(--bg-secondary);
}

.reaction-btn:active {
  transform: scale(0.95);
}
```

### Animations

```css
/* Floating emoji animation */
@keyframes float-up {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(1.5);
  }
}

.floating-emoji {
  animation: float-up 2s ease-out forwards;
}

/* Points popup */
@keyframes points-pop {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(10px);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) translateY(-5px);
  }
  100% {
    opacity: 0;
    transform: scale(1) translateY(-20px);
  }
}

/* Badge unlock */
@keyframes badge-unlock {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
```

---

## 📊 Data Models

### Event

```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  phase: 'pre' | 'live' | 'post' | 'closed';
  
  meetingUrl?: string;           // Google Meet link
  calendarEventId?: string;      // Google Calendar ID
  
  agenda: AgendaItem[];
  polls: Poll[];
  
  transcriptUrl?: string;        // Uploaded transcript
  transcriptText?: string;       // Processed text
  
  settings: EventSettings;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AgendaItem {
  id: string;
  title: string;
  duration: number;              // minutes
  presenter?: string;
}

interface EventSettings {
  allowAnonymousQuestions: boolean;
  showLeaderboard: boolean;
  requirePreparation: boolean;
  enableAIQuestions: boolean;
}
```

### Poll

```typescript
interface Poll {
  id: string;
  eventId: string;
  question: string;
  options: PollOption[];
  status: 'draft' | 'active' | 'closed';
  showResultsTo: 'all' | 'voted' | 'admin';
  createdAt: Date;
  closedAt?: Date;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollVote {
  id: string;
  pollId: string;
  optionId: string;
  participantId: string;
  timestamp: Date;
}
```

### Participant

```typescript
interface Participant {
  id: string;
  eventId: string;
  userId?: string;               // If authenticated
  displayName: string;
  avatar: string;                // Emoji or image URL
  isExternal: boolean;           // External webinar attendee
  
  // Pre-meeting data
  goals: string[];
  preparedQuestions: PreparedQuestion[];
  expectations: string[];
  
  // Attendance data
  joinTime?: Date;
  leaveTime?: Date;
  attendancePercent: number;
  
  // Engagement data
  reactions: Reaction[];
  pollVotes: string[];           // Poll IDs voted
  questionsAsked: Question[];
  
  // Feedback data
  rating?: number;
  goalAchieved?: 'yes' | 'partially' | 'no';
  feedback?: string;
  aiQuestionsAsked: AIQuestion[];
  
  // Gamification
  points: number;
  badges: string[];              // Badge IDs
  rank?: number;
}

interface PreparedQuestion {
  id: string;
  text: string;
  wasAsked: boolean;
}

interface Reaction {
  emoji: string;
  timestamp: Date;
}

interface Question {
  id: string;
  text: string;
  isAnonymous: boolean;
  timestamp: Date;
}

interface AIQuestion {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}
```

### User (Cross-event)

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  
  // From PeopleForce integration
  department?: string;
  skills?: string[];
  
  // Global stats
  totalPoints: number;
  totalEvents: number;
  currentStreak: number;
  longestStreak: number;
  badges: UserBadge[];
  
  createdAt: Date;
}

interface UserBadge {
  badgeId: string;
  earnedAt: Date;
  eventId: string;               // Event where earned
}
```

---

## 🔌 API Endpoints

### Events

```
GET    /api/events                    # List events
POST   /api/events                    # Create event
GET    /api/events/:id                # Get event details
PUT    /api/events/:id                # Update event
DELETE /api/events/:id                # Delete event
PATCH  /api/events/:id/phase          # Update event phase
POST   /api/events/:id/transcript     # Upload transcript
```

### Polls

```
GET    /api/events/:eventId/polls           # List polls
POST   /api/events/:eventId/polls           # Create poll
PATCH  /api/polls/:id/status                # Launch/close poll
POST   /api/polls/:id/vote                  # Submit vote
GET    /api/polls/:id/results               # Get results
```

### Participants

```
POST   /api/events/:eventId/join            # Join event
GET    /api/events/:eventId/participants    # List participants
PATCH  /api/participants/:id                # Update participant data
POST   /api/participants/:id/reaction       # Send reaction
POST   /api/participants/:id/question       # Ask question
POST   /api/participants/:id/feedback       # Submit feedback
```

### AI

```
POST   /api/events/:eventId/ai/ask          # Ask question about transcript
POST   /api/events/:eventId/ai/questions    # Generate feedback questions
GET    /api/events/:eventId/ai/summary      # Get AI-generated summary
```

### Analytics

```
GET    /api/analytics/overview              # Global stats
GET    /api/analytics/events/:eventId       # Event-specific stats
GET    /api/analytics/engagement            # Engagement trends
GET    /api/analytics/leaderboard           # Global leaderboard
```

---

## 📦 MVP Scope

### What to Build First (1-2 hours)

| Component | Description | Priority |
|-----------|-------------|----------|
| Extension shell | Manifest, injection, sidebar container | P0 |
| Phase detection | PRE/LIVE/POST state management | P0 |
| Mock data | Static event, polls, users | P0 |
| Pre-meeting UI | Agenda, goals, questions | P1 |
| Live meeting UI | Polls, reactions, points | P0 |
| Post-meeting UI | Feedback, score, badges | P1 |
| Animations | Floating emojis, points popup | P1 |
| AI Q&A mock | Simulated responses | P2 |

### What to Skip for MVP

- Real backend API
- Real database
- Real-time sync between users
- Actual AI integration
- Admin dashboard
- User authentication
- Chrome Web Store publishing

### Mock Data Strategy

```javascript
// data/mockData.js

export const mockEvent = {
  id: 'tech-talk-dec',
  title: 'Tech Talk - Q4 Review',
  description: 'Quarterly technology review and roadmap discussion',
  startTime: new Date('2024-12-15T10:00:00'),
  endTime: new Date('2024-12-15T11:00:00'),
  phase: 'live', // Change to test different phases
  
  agenda: [
    { id: '1', title: 'Q4 Results Overview', duration: 15 },
    { id: '2', title: 'AI/ML Initiatives Update', duration: 20 },
    { id: '3', title: 'Q1 Roadmap Preview', duration: 15 },
    { id: '4', title: 'Q&A', duration: 10 },
  ],
  
  polls: [
    {
      id: 'poll-1',
      question: 'What should be our Q1 priority?',
      options: [
        { id: 'a', text: 'Performance', votes: 12 },
        { id: 'b', text: 'Security', votes: 8 },
        { id: 'c', text: 'New Features', votes: 5 },
      ],
      status: 'active',
    },
  ],
  
  transcript: `
    [10:02] Maria: Welcome everyone to our Q4 tech talk...
    [10:05] Juan: Let me share the performance metrics...
    [10:15] Ana: The AI model improvements have been significant...
    [10:30] Pedro: For Q1, I suggest we focus on security...
    ...
  `,
};

export const mockParticipants = [
  { id: '1', name: 'Maria G.', avatar: '🦊', points: 285, rank: 1 },
  { id: '2', name: 'Juan P.', avatar: '🐼', points: 245, rank: 2 },
  { id: '3', name: 'Ana R.', avatar: '🦄', points: 220, rank: 3 },
  { id: '4', name: 'You', avatar: '🤖', points: 145, rank: 7, isCurrentUser: true },
  // ... more
];

export const mockAIResponses = {
  'action items': 'Based on the transcript, the main action items are: 1) Juan to prepare performance report by Dec 20, 2) Ana to finalize AI model documentation, 3) Pedro to create security audit plan.',
  'decision': 'The team decided to prioritize security improvements for Q1, with performance optimization as secondary focus.',
  'default': 'Based on the meeting transcript, I can help you find specific information. Try asking about decisions, action items, or specific topics discussed.',
};
```

---

## 🚀 Future Roadmap

### Phase 2: Backend & Real-time

- [ ] Backend API (Node.js/NestJS)
- [ ] Database (PostgreSQL)
- [ ] Real-time sync (WebSockets)
- [ ] User authentication
- [ ] Multi-user leaderboard

### Phase 3: Admin Dashboard

- [ ] Event management
- [ ] Poll creation/management
- [ ] Analytics dashboard
- [ ] User management
- [ ] Export functionality

### Phase 4: AI Integration

- [ ] Real OpenAI integration
- [ ] Transcript Q&A
- [ ] Smart question generation
- [ ] Sentiment analysis
- [ ] Automatic summarization

### Phase 5: Integrations

- [ ] Google Calendar sync
- [ ] Slack notifications
- [ ] PeopleForce data
- [ ] Otter.ai transcript import
- [ ] Fellow.app integration

### Phase 6: Polish & Scale

- [ ] Chrome Web Store publishing
- [ ] Firefox extension
- [ ] Mobile companion app
- [ ] Custom branding options
- [ ] Enterprise features

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- Chrome browser
- Code editor (VS Code recommended)

### Quick Start

1. **Clone/Create the extension folder**

```bash
mkdir nybble-vibe-extension
cd nybble-vibe-extension
```

2. **Create manifest.json** (see template above)

3. **Create basic structure** (see folder structure above)

4. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select your extension folder

5. **Test**
   - Go to `meet.google.com`
   - Sidebar should appear
   - Test different phases by changing mock data

### Development Tips

- Use `chrome.storage.local` for persistence
- Reload extension after changes: click refresh icon in `chrome://extensions/`
- Use Chrome DevTools to debug (right-click sidebar → Inspect)
- Console logs appear in sidebar's DevTools console

---

## 📝 License

MIT License - Feel free to use, modify, and distribute.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Contact

For questions about this project, reach out to the Nybble Labs team.

---

**Happy building! 🎮✨**

