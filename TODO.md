# Parle! - Implementation TODO

## Phase 1: Project Setup & Infrastructure

- [x] **1.1** Initialize Next.js project with TypeScript, Tailwind CSS, App Router
- [x] **1.2** Install and configure core dependencies
  - [x] Hono (`hono`, `@hono/node-server`)
  - [x] Prisma (`prisma`, `@prisma/client`)
  - [x] Mastra (`@mastra/core`)
  - [x] Anthropic SDK (`@anthropic-ai/sdk`)
  - [x] shadcn/ui (init + base components: Button, Input, Card, Dialog, etc.)
  - [x] Auth libraries (`bcryptjs`, `jsonwebtoken`, `jose`)
  - [x] Google Cloud TTS (`@google-cloud/text-to-speech`)
- [x] **1.3** Setup environment variables (`.env.local`, `.env.example`)
- [x] **1.4** Configure `tsconfig.json` with strict mode and path aliases (`@/`)
- [x] **1.5** Setup ESLint and Prettier
- [x] **1.6** Setup PWA manifest (`public/manifest.json`) — service worker deferred to Phase 11
- [x] **1.7** Create base project directory structure (`src/app`, `src/components`, `src/lib`, `src/mastra`, `src/server`)

## Phase 2: Database & ORM

- [ ] **2.1** Create MongoDB Atlas cluster (free tier) and get connection string — **manual step required**
- [x] **2.2** Write Prisma schema (`prisma/schema.prisma`)
  - [x] User model
  - [x] Conversation model (with embedded messages)
  - [x] Feedback model (with embedded grammar errors, vocab suggestions, etc.)
  - [x] Vocabulary model
  - [x] LearningProgress model
- [x] **2.3** Run `prisma generate` (using Prisma v6; `db push` requires MongoDB Atlas connection)
- [x] **2.4** Create Prisma client singleton (`src/lib/db.ts`)

## Phase 3: Authentication

- [x] **3.1** Implement auth utilities (`src/lib/auth.ts`)
  - [x] Password hashing (bcrypt)
  - [x] JWT token generation and verification (jose)
  - [x] Cookie helpers (set/get/clear httpOnly cookie)
- [x] **3.2** Implement Hono auth routes (`src/server/routes/auth.ts`)
  - [x] `POST /api/auth/register`
  - [x] `POST /api/auth/login`
  - [x] `POST /api/auth/logout`
- [x] **3.3** Create auth middleware for Hono (`src/server/middleware/auth.ts`)
- [x] **3.4** Mount Hono router via Next.js catch-all route (`src/server/api/[...route]/route.ts`)
- [x] **3.5** Build login page (`src/app/(auth)/login/page.tsx`)
- [x] **3.6** Build registration page (`src/app/(auth)/register/page.tsx`)
- [x] **3.7** Implement auth redirect logic (`src/middleware.ts` + server action for cookie)

## Phase 4: Layout & Navigation

- [x] **4.1** Create root layout (`src/app/layout.tsx`) with metadata, fonts, PWA head tags
- [x] **4.2** Build Header component (`src/components/layout/Header.tsx`)
- [x] **4.3** Build BottomNav component (`src/components/layout/BottomNav.tsx`) — mobile tab bar
  - [x] Tabs: Parler, Historique, Vocabulaire, Progrès (with lucide icons)
- [x] **4.4** Create main layout group (`src/app/(main)/layout.tsx`) with Header + BottomNav
- [x] **4.5** Verify responsive layout on mobile viewport (build passes)

## Phase 5: Mastra AI Agents

- [x] **5.1** Initialize Mastra instance (`src/mastra/index.ts`)
- [x] **5.2** Implement Conversation Agent (`src/mastra/agents/conversation.ts`)
  - [x] System prompt: Marseille friend persona, polite tone, B1-B2→C1 adaptation
  - [x] Scenario-aware context injection
  - [x] French-only responses
- [x] **5.3** Implement Correction Agent (`src/mastra/agents/correction.ts`)
  - [x] System prompt: analyze transcript, output structured JSON feedback
  - [x] Output format: grammar errors, vocabulary suggestions, pronunciation notes, key phrases, overall comment
  - [x] Feedback in French with Japanese explanations
- [x] **5.4** Create vocabulary tool for Mastra (`src/mastra/tools/vocabulary.ts`)
  - [x] Auto-extract and save new/notable words from conversation
- [x] **5.5** Define scenario data (`src/mastra/scenarios.ts`) — 7 scenarios with initial prompts

## Phase 6: Core Conversation Feature

- [x] **6.1** Implement conversation API routes (`src/server/routes/conversation.ts`)
  - [x] `POST /api/conversations` — create new conversation with scenario
  - [x] `POST /api/conversations/:id/message` — send user message, get agent response
  - [x] `PATCH /api/conversations/:id/complete` — end conversation, trigger correction agent + auto-save vocabulary
  - [x] `GET /api/conversations` — list user's conversations
  - [x] `GET /api/conversations/:id` — get single conversation with messages
- [x] **6.2** Build scenario selection page (`src/app/(main)/conversation/page.tsx`)
  - [x] ScenarioCard component (`src/components/conversation/ScenarioCard.tsx`)
  - [x] Grid layout of 7 scenarios
- [x] **6.3** Build active conversation page (`src/app/(main)/conversation/[id]/page.tsx`)
  - [x] MessageBubble component (`src/components/conversation/MessageBubble.tsx`)
  - [x] Scrollable message list with auto-scroll
  - [x] "Terminer la conversation" button with loading state
- [x] **6.4** Integrate Web Speech API for voice input
  - [x] VoiceRecorder component (`src/components/conversation/VoiceRecorder.tsx`)
  - [x] Mic toggle button with pulse animation
  - [x] Real-time transcription display + send button
  - [x] Language set to `fr-FR`, fallback to text input
- [x] **6.5** Integrate Google Cloud TTS for voice output
  - [x] TTS client (`src/lib/tts.ts`) — Google Cloud Wavenet fr-FR
  - [x] `POST /api/tts` route (`src/server/routes/tts.ts`)
  - [x] AudioPlayer hook (`src/components/conversation/AudioPlayer.tsx`)
  - [x] Auto-play agent responses on load and after each reply

## Phase 7: Feedback System

- [x] **7.1** Implement feedback API routes (`src/server/routes/feedback.ts`)
  - [x] `GET /api/feedback/:conversationId` — get feedback for a conversation
- [x] **7.2** Implement feedback generation flow (implemented in Phase 6 `PATCH /complete`)
  - [x] On conversation complete → call Correction Agent with full transcript
  - [x] Parse structured JSON response → save as Feedback record
  - [x] Auto-extract vocabulary → save to Vocabulary collection
- [x] **7.3** Build FeedbackPanel component (`src/components/feedback/FeedbackPanel.tsx`)
  - [x] Sections: grammar errors (red), vocabulary suggestions (amber), pronunciation notes (purple), key phrases (green tags)
  - [x] Overall comment display with icon
- [x] **7.4** Integrate FeedbackPanel into conversation history detail page (`src/app/(main)/history/[id]/page.tsx`)

## Phase 8: Conversation History

- [x] **8.1** Build history list page (`src/app/(main)/history/page.tsx`)
  - [x] List of past conversations (scenario name, date, status badge)
  - [x] Sort by date (newest first, via API)
  - [x] Click to navigate: completed → history detail, active → resume conversation
  - [x] Empty state message
- [x] **8.2** Build history detail page (implemented in Phase 7)
  - [x] Full transcript display (reuse MessageBubble)
  - [x] FeedbackPanel below transcript
  - [x] Replay audio for individual messages

## Phase 9: Vocabulary Notebook

- [x] **9.1** Implement vocabulary API routes (`src/server/routes/vocabulary.ts`)
  - [x] `GET /api/vocabulary` — list with pagination, search, filter by scenario
  - [x] `POST /api/vocabulary` — manually add word (duplicate check)
  - [x] `PATCH /api/vocabulary/:id/review` — update review count and date (known → +1, unknown → -1)
  - [x] `DELETE /api/vocabulary/:id` — delete word
- [x] **9.2** Build vocabulary page (`src/app/(main)/vocabulary/page.tsx`)
  - [x] Two modes: Parcourir / Réviser (toggle buttons)
  - [x] WordCard component (`src/components/vocabulary/WordCard.tsx`)
  - [x] Add word dialog (Dialog component)
  - [x] Search input with icon
- [x] **9.3** Implement SRS review mode
  - [x] ReviewMode component (`src/components/vocabulary/ReviewMode.tsx`)
  - [x] Simple SRS: words with low reviewCount or old lastReviewedAt prioritized
  - [x] Show word → Révéler → Connu / À revoir
  - [x] Session summary with score (Trophy icon)

## Phase 10: Learning Progress

- [x] **10.1** Implement progress API route (`src/server/routes/progress.ts`)
  - [x] `GET /api/progress` — aggregated stats (conversations, vocabulary, streak, grammar trend, recent activity)
- [x] **10.2** Build progress dashboard page (`src/app/(main)/progress/page.tsx`)
  - [x] Total conversations count (completed + in progress)
  - [x] Total vocabulary count
  - [x] Grammar error trend (improving / stable / declining with icons)
  - [x] Current streak with flame icon
  - [x] Recent activity list (clickable → history detail)
- [x] **10.3** Implement streak calculation logic (consecutive days, tolerant of today not yet active)
- [x] **10.4** Update LearningProgress on each conversation completion (`PATCH /complete`)

## Phase 11: PWA & Mobile Optimization

- [x] **11.1** Service Worker (`public/sw.js`) + registration component (next-pwa非対応のため手動実装)
- [x] **11.2** Create PWA icon (`public/icons/icon.svg`) — SVG for all sizes
- [x] **11.3** Configure `manifest.json` (standalone, portrait, theme color, start_url, maskable icon)
- [x] **11.4** Add meta tags for iOS (apple-touch-icon, apple-mobile-web-app-capable, status-bar-style)
- [ ] **11.5** Test install-to-homescreen on Android and iOS — **manual testing required**
- [x] **11.6** Touch-friendly: tap-highlight disabled, safe-area-inset, overscroll-none, min 44px targets
- [ ] **11.7** Test mic permission flow on mobile browsers — **manual testing required**

## Phase 12: Testing & Polish

- [ ] **12.1** Manual end-to-end test — **manual testing required**
- [ ] **12.2** Test voice input/output on mobile — **manual testing required**
- [x] **12.3** Error handling: `ApiError` class + `apiFetch` helper with auto-redirect on 401
- [x] **12.4** Loading states: skeleton screens for conversation, history, vocabulary, progress pages
- [x] **12.5** Error boundaries: root `error.tsx`, main group `error.tsx`, `not-found.tsx`, `ErrorBoundary` component — all in French
- [ ] **12.6** Verify responsive design — **manual testing required**

## Phase 13: Deployment

- [x] **13.1** Git repo initialized, `.gitignore` configured, build script includes `prisma generate`
- [ ] **13.2** Set environment variables on Vercel dashboard — **manual step** (see below)
- [ ] **13.3** Configure MongoDB Atlas network access — **manual step**
- [ ] **13.4** Deploy: `vercel` or push to GitHub + connect Vercel — **manual step**
- [ ] **13.5** Test PWA install from production URL — **manual step**
- [ ] **13.6** Setup custom domain (optional) — **manual step**

### Deployment Steps

1. **Create GitHub repo and push:**
   ```bash
   git add .
   git commit -m "Initial commit: Parle! French speaking practice chatbot"
   gh repo create parle --public --push --source=.
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new) and import the repo
   - Or run `npx vercel` from the project directory

3. **Set environment variables on Vercel:**
   - `DATABASE_URL` — MongoDB Atlas connection string
   - `ANTHROPIC_API_KEY` — Claude API key
   - `GOOGLE_CLOUD_TTS_API_KEY` — Google Cloud TTS API key
   - `JWT_SECRET` — Random secret (run `openssl rand -base64 32`)
   - `NEXT_PUBLIC_APP_URL` — Your Vercel URL

4. **MongoDB Atlas network access:**
   - Go to Atlas → Network Access → Add IP Address
   - Allow `0.0.0.0/0` (or specific Vercel IPs)

5. **Push schema to MongoDB:**
   ```bash
   npx prisma db push
   ```

6. **Deploy and verify**
