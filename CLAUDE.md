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
│       ├── middleware/
│       │   ├── auth.ts        # Bearer token verification
│       │   └── rateLimit.ts   # Rate limiting (10/min auth, 60/min API)
│       └── routes/
│           ├── auth.ts
│           ├── conversation.ts
│           ├── feedback.ts
│           ├── vocabulary.ts
│           ├── progress.ts
│           └── tts.ts
├── Makefile                   # Development commands (make help)
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
make help            # Show all available commands
make setup           # First-time setup (install + db push)
make dev             # Start dev server
make build           # Production build
make deploy          # Deploy to Vercel
make db-push         # Push schema to MongoDB
make db-studio       # Open Prisma Studio (DB viewer)
make env-check       # Verify environment variables
make jwt-secret      # Generate a new JWT secret
make lint            # Run linter
make clean           # Clean build artifacts
```

Or use npm directly:
```bash
npm install          # Install dependencies (auto-runs prisma generate via postinstall)
npm run dev          # Start dev server
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

## Lessons Learned

### Prisma v6/v7 + MongoDB
- Prisma v7は`@prisma/adapter-mongodb`が存在しないためMongoDBをサポートしない。v6を使用すること
- `prisma db push`は`.env`ファイルを優先的に読む。`.env.local`と`.env`が両方ある場合は`.env`の値に注意

### Next.js App Router
- **APIルートは`src/app/api/`配下に配置する必要がある**。`src/server/api/`に置くとローカルでは動くがVercelでは404になる
- `tsconfig.json`にパスエイリアス(`@/*`)を使う場合、`"baseUrl": "."`を明示的に設定しないとVercel上でモジュール解決に失敗する場合がある
- Next.js 16ではmiddlewareは非推奨（proxyに移行予定）だが、現時点では動作する

### Mastra AI Framework
- Agent/ToolのIDにはハイフン(`-`)を使わず、アンダースコア(`_`)のみ使用する。新しいバージョンではバリデーションエラーになる
- `generate()`メソッドにはメッセージ配列ではなく、文字列プロンプトを渡す
- モデル指定には文字列形式(`"anthropic/claude-sonnet-4-6"`)ではなく、`@ai-sdk/anthropic`の`anthropic()`プロバイダー関数を使用する
- モデルIDはAnthropic APIで有効な正確な名前を使用すること（例: `anthropic("claude-sonnet-4-6")`）。バージョンサフィックス(`-latest`, `-20250514`等)が無効な場合がある

### Vercel Deployment
- GitHubリポジトリ連携では、pushするたびに自動デプロイされる
- 環境変数はVercelダッシュボードで設定し、変更後は再デプロイが必要
- Root Directoryはデフォルト（空欄）のままにすること。`./`を入れると問題が起きる場合がある
- `package.json`に`"postinstall": "prisma generate"`を設定しておくとVercelビルド時にPrismaクライアントが自動生成される

### MongoDB Atlas
- 接続文字列のパスワード部分の`<>`はプレースホルダーなので削除する
- 接続文字列にデータベース名を含める（例: `.mongodb.net/parle?`）。省略すると`empty database name not allowed`エラー
- Network Accessで`0.0.0.0/0`を許可しないと外部からの接続ができない

### Security
- APIキーやパスワードをチャットや会話ログに貼り付けた場合は、必ずローテーション（再生成）する
- APIルートのエラーハンドリングでは内部エラーの詳細をクライアントに返さない（ログのみ）
- Google Cloud APIキーはHTTPリファラー制限とAPI制限をかける

### General
- `npm init -y`は`"type": "commonjs"`を設定するが、Next.jsプロジェクトでは`"type": "module"`に変更が必要
- shadcn/uiの`npx shadcn`は`class-variance-authority`を自動インストールしないので手動で追加する
- next-pwaはTurbopackと互換性がないため、手動でService Workerを実装する
- Google Cloud TTSの`Buffer`はVercelで`BodyInit`に直接渡せない。`new Uint8Array()`に変換する
