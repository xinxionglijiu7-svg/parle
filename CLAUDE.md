# Parle! - French Speaking Practice Chatbot

## Project Overview

French language speaking practice chatbot targeting B1-B2 → C1 level progression.
The AI persona is a polite friend living in Marseille. Conversations are voice-driven with full transcript history for review. Post-conversation feedback is provided by a dedicated correction agent.

- **Target user**: Personal use (potential public release later)
- **Platform**: PWA (Progressive Web App) for mobile-first access
- **Deploy**: Vercel
- **UI language**: French
- **Design**: Minimal

## Tech Stack

| Layer             | Technology                |
| ----------------- | ------------------------- |
| Framework         | Next.js (App Router)      |
| API               | Hono                      |
| ORM               | Prisma v6 (v7 MongoDB未対応のため) |
| Database          | MongoDB (Atlas free tier) |
| AI Agent          | Mastra + Claude API       |
| Speech-to-Text    | Web Speech API (browser)  |
| Text-to-Speech    | Google Cloud TTS          |
| Auth              | Username + Password       |
| UI Components     | shadcn/ui                 |
| Styling           | Tailwind CSS              |

## Architecture

### Agent Structure (Mastra)

Two-agent system:

1. **Conversation Agent** (`conversationAgent`)
   - Persona: A polite friend living in Marseille
   - Conducts natural conversation within the selected scenario
   - Adapts language complexity to B1-B2 level, gradually pushing toward C1
   - Responds in French only

2. **Correction Agent** (`correctionAgent`)
   - Activated after conversation ends
   - Reviews the full transcript
   - Provides feedback on:
     - Grammar errors with corrections
     - Vocabulary suggestions (more natural/advanced alternatives)
     - Pronunciation notes (based on STT transcription patterns)
     - Key phrases to remember
   - Feedback language: French with Japanese explanations where helpful

### Voice Flow

```
User speaks (mic) → Web Speech API (STT) → text sent to Conversation Agent
→ Agent responds (text) → Google Cloud TTS → audio playback to user
→ Both sides saved as transcript
```

### Data Models (Prisma + MongoDB)

```
User
├── id
├── username (unique)
├── passwordHash
├── level (current proficiency)
├── createdAt
└── updatedAt

Conversation
├── id
├── userId
├── scenarioId
├── messages[] (embedded: role, content, timestamp)
├── status (active / completed)
├── createdAt
└── completedAt

Feedback
├── id
├── conversationId
├── userId
├── grammarErrors[] (embedded: original, correction, explanation)
├── vocabularySuggestions[] (embedded: used, suggested, context)
├── pronunciationNotes[]
├── keyPhrases[]
├── overallComment
└── createdAt

Vocabulary
├── id
├── userId
├── word
├── translation
├── context (sentence where it appeared)
├── scenarioId
├── reviewCount
├── lastReviewedAt
├── createdAt

LearningProgress
├── id
├── userId
├── date
├── conversationsCompleted
├── newWordsLearned
├── grammarErrorCount
├── streak
└── createdAt
```

## Features

### Core Features

1. **Voice Conversation** — Speak with the AI in French, hear responses via TTS
2. **Transcript** — Full text record of every conversation, reviewable later
3. **Post-Conversation Feedback** — Grammar, vocabulary, pronunciation corrections after each session
4. **Conversation Scenarios** — Structured practice around real-life situations

### Conversation Scenarios

| ID  | Scenario (FR)                          | Description                |
| --- | -------------------------------------- | -------------------------- |
| 1   | Chercher un appartement               | Searching for an apartment |
| 2   | Démarches à la mairie                  | City hall paperwork        |
| 3   | Discussion au café                     | Casual café chat           |
| 4   | Faire les courses au marché            | Shopping at the market     |
| 5   | Saluer les voisins                     | Greeting neighbors         |
| 6   | Conversations entre collègues au bureau | Office colleague chat     |
| 7   | Entretien et recherche d'emploi        | Job hunting & interviews  |

### Learning Tools

5. **Vocabulary Notebook** — Auto-save new words from conversations, manual add/edit
6. **Spaced Repetition Review** — Review saved vocabulary with SRS scheduling
7. **Learning History & Progress** — Track conversations completed, words learned, error trends, streak

### Authentication

- Simple username + password authentication
- Passwords hashed with bcrypt
- JWT session tokens stored in httpOnly cookies

## Project Structure

```
ai-chat/
├── CLAUDE.md
├── next.config.js
├── package.json
├── prisma/
│   └── schema.prisma
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing / login
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── (main)/
│   │       ├── conversation/
│   │       │   ├── page.tsx           # Scenario selection
│   │       │   └── [id]/
│   │       │       └── page.tsx       # Active conversation
│   │       ├── history/
│   │       │   ├── page.tsx           # Conversation list
│   │       │   └── [id]/
│   │       │       └── page.tsx       # Transcript + feedback
│   │       ├── vocabulary/
│   │       │   └── page.tsx           # Vocab notebook + review
│   │       └── progress/
│   │           └── page.tsx           # Learning dashboard
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── conversation/
│   │   │   ├── VoiceRecorder.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ScenarioCard.tsx
│   │   │   └── AudioPlayer.tsx
│   │   ├── feedback/
│   │   │   └── FeedbackPanel.tsx
│   │   ├── vocabulary/
│   │   │   ├── WordCard.tsx
│   │   │   └── ReviewMode.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── BottomNav.tsx  # Mobile navigation
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── auth.ts            # Auth utilities
│   │   └── tts.ts             # Google Cloud TTS client
│   ├── mastra/
│   │   ├── index.ts           # Mastra instance
│   │   ├── agents/
│   │   │   ├── conversation.ts
│   │   │   └── correction.ts
│   │   └── tools/
│   │       └── vocabulary.ts  # Tool for saving words
│   └── server/
│       ├── api/
│       │   └── [...route]/
│       │       └── route.ts   # Hono catch-all route
│       └── routes/
│           ├── auth.ts
│           ├── conversation.ts
│           ├── feedback.ts
│           ├── vocabulary.ts
│           └── progress.ts
└── tailwind.config.ts
```

## API Routes (Hono)

| Method | Path                              | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| POST   | /api/auth/register                | Register new user              |
| POST   | /api/auth/login                   | Login                          |
| POST   | /api/auth/logout                  | Logout                         |
| GET    | /api/conversations                | List user conversations        |
| POST   | /api/conversations                | Start new conversation         |
| POST   | /api/conversations/:id/message    | Send message in conversation   |
| PATCH  | /api/conversations/:id/complete   | End conversation, trigger feedback |
| GET    | /api/conversations/:id            | Get conversation with messages |
| GET    | /api/conversations/:id/feedback   | Get feedback for conversation  |
| GET    | /api/vocabulary                   | List saved vocabulary          |
| POST   | /api/vocabulary                   | Add vocabulary word            |
| PATCH  | /api/vocabulary/:id/review        | Mark word as reviewed          |
| DELETE | /api/vocabulary/:id               | Delete vocabulary word         |
| GET    | /api/progress                     | Get learning progress stats    |
| POST   | /api/tts                          | Generate TTS audio             |

## Development Commands

```bash
npm install          # Install dependencies (auto-runs prisma generate via postinstall)
npm run dev          # Start dev server
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to MongoDB
npm run build        # Production build (prisma generate + next build)
npm run lint         # Lint
```

## Environment Variables

```
# Database
DATABASE_URL=mongodb+srv://...

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Google Cloud TTS
GOOGLE_CLOUD_TTS_API_KEY=...

# Auth
JWT_SECRET=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Coding Conventions

- Use TypeScript strict mode
- Use `async/await` over `.then()` chains
- Server Components by default, `"use client"` only when needed
- API routes handled by Hono, mounted via Next.js catch-all route
- French for all user-facing strings, English for code (variable names, comments)
- Component names in PascalCase, utilities in camelCase
- Prefer named exports over default exports
