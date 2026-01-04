# StackMemory Roadmap

## 🚀 Recent Accomplishments

- **Stack Management**:
  - [x] Edit technology items (Name, Version, Type).
  - [x] dedicated "Notes" field for each stack item.
  - [x] Improved UI/UX with Modals and Hover effects.
- **GitHub Integration**:
  - [x] "Magic Import" real fetching of `package.json`.
  - [x] Accurate version parsing (cleaning `^` and `~`).
  - [x] Persisting Repository URL.
  - [x] Graceful handling of Private Repos (Guides user to manual paste).
- **Service Locker**:
  - [x] "Add Service" Modal.
  - [x] Persistence of service data (Provider, Name, Cost, etc.).
- **Journal**:
  - [x] Journal Tab fully functional.
  - [x] "New Entry" Modal with Title, Content (Markdown), and Tags.
  - [x] Timeline visualization.
  - [x] **Automatic Semantic Tagging**: AI analyzes functionality to suggest relevant tags.

- **Modules**:
  - [x] **Firebase Configuration**: Store and manage API keys securely.
  - [x] **Project To-Do List**: Simple task tracking within the dashboard.

## 🛡️ Phase 8: Beta Launch Prep (Usage Limits & Guardrails)

- **Usage Controls**:
  - [x] **Database Schema**: Created `usage_logs` and updated `profiles` with limits.
  - [x] **Limit Logic**: Implemented `checkAndIncrementLimit` for Feature Gating (Chat/Insight).
  - [x] **Tier Enforcement**: Project Insight restricted to Pro/Founder tiers.
- **Admin Analytics 2.0**:
  - [x] **Real-time Cost Tracking**: Tracking Gemini API spend per request.
  - [x] **Detailed Breakdown**: Visual split of costs by Model and Feature.
  - [x] **Usage Logs Table**: Admin view of recent 100 API calls with metadata.
- **Founder Privileges**:
  - [x] **Founder Tier**: Created unlimited tier for Admins.

## 🏆 Special Phase: Operation Gemini (Hackathon Pivot)

**Goal**: Refactor the core AI engine to use Google Gemini 1.5 Pro/Flash to win the Gemini Hackathon.

- **Core Brain Transplant (OpenAI -> Gemini)**:
  - [x] **Model Switch**: Replaced `gpt-4o-mini` with `gemini-1.5-flash` (Speed/Cost) and `gemini-1.5-pro` (Reasoning).
  - [x] **SDK Migration**: Implemented `@google/generative-ai` SDK.
  - [x] **Embeddings**: Switched `text-embedding-ada-002` to Google's `text-embedding-004` (768 dims).
  - [x] **Branding**: Updated UI to remove OpenAI references and show "Powered by Gemini".

- **Launch Assets**:
  - [x] **Code-Animated Promo**: Created `/promo` page with "Terminal -> Chaos -> Order" animation for video intro.

- **Leveraging Gemini's Superpowers**:
  - [x] **Massive Context (1M+ Tokens)**:
    - [x] **"Whole Repo" Understanding**: Refactor Vibe Coder to ingest full file structures/content instead of just chunks.
    - [x] Eliminate/Reduce RAG complexity by passing full context text.
  - [x] **Multimodal Native**:
    - [x] **Visual Debugging**: Allow users to paste screenshots of UI errors in chat.
    - [ ] **Video Analysis**: Analyze short screencasts to offer UX improvements.

- **Phase 7: Video Multimodal Analysis (In Progress)**:
  - [x] **UI**: Add Video Upload to Vibe Coder Chat.
  - [x] **Backend**: Gemini 2.0 Video Understanding.
  - [x] **Experience**: "Here is a video of the bug" -> "I found the line causing it".

- **Phase 6: Project Insight (Deep Dive)**:
  - [x] **Data Ingestion**: Process massive context (docs + code structure).
  - [x] **Insight Report**: "Project Bible" generation with Gemini 2.0.
  - [x] **UI**: Dedicated Insight Tab with persistent report.

- **Phase 9: VibeOnboard (The Human Layer)**:
  - [x] **Backend**: Gemini 2.0 "Senior DevRel" Agent (`/api/vibe/onboard`).
  - [x] **Frontend**: Onboarding Tab with "Generate Guide" button.
  - [x] **Feature**: Auto-generated `GETTING_STARTED.md` (Prerequisites, Install, Architecture).
  - [x] **Integration**: Added to Landing Page and User Guide.

- **Phase 10: Video Analysis Phase 2 (Screencast Debugging)**:
  - [x] **Goal**: "I found a bug, here's a video".
  - [x] **UI**: Dedicated Chat Video upload (Storage > 1MB).
  - [x] **Backend**: Gemini 2.0 Integration via GoogleAIFileManager (Bypass Vercel Limits).

- **Phase 11: Beta Launch (Business)**:
  - [ ] Analytics (Google/PostHog).
  - [x] Compliance (Cookie Banner).
  - [ ] Lifetime Deal Signup & Checkout verification.

## 📊 Phase 16: The Watchtower (Analytics) - COMPLETED

- **Goal**: Stop flying blind. Understand user behavior to iterate fast.
- [x] **PostHog Integration**:
  - [x] Install `posthog-js`.
  - [x] Create Client-Side Provider.
  - [x] Track Core Events (Sign Up, Project Created, Vibe Coder Usage).
  - [x] Create "Feature Usage" dashboard.

## 💻 Phase 12: CLI Evolution (The Local Agent) - COMPLETED

- [x] **Env Var Drift**: `stackmemory check` compares local `.env` vs `.env.example`.
- [x] **Infra Scan**: `stackmemory scan` detects invisible stack (Docker, Makefiles, Justfiles).
- [ ] **IDE Sync**: `npx stackmemory pull rules` to sync `.cursorrules` / `.vscode` team settings.

## 🧩 Phase 17: Low-Code Operations (n8n Integration) - COMPLETED

**Goal**: Solve "Credential Amnesia" for n8n users.

- [x] **Credential Memory**:
  - [x] Parse n8n workflow JSON.
  - [x] Extract credential references (e.g., "Stripe API", "Supabase Admin").
  - [x] Map usage: "This API Key is used in workflows A, B, and C".
- [ ] **Workflow Logic**:
  - [ ] "Explain this Workflow": AI reads the JSON graph and writes a human summary.
  - [ ] Semantic Search: "Where do we use the SendGrid node?"

## 🖥️ Phase 14: Native Mac App (The Local Brain)

**Goal**: Move beyond the browser to become an integrated part of the OS.

- **Why Native? (Superpowers)**:
  - **Native Scanner**: Eliminate the need for manual CLI sync. The app watches file system events (`fs.watch`) to auto-update the stack in real-time.
  - **"Always On" Vibe Coder**: Spotlight-like floating HUD (`Cmd+K`) to chat with your codebase without context switching.
  - **Local Performance**: Zero-latency indexing and vector search running locally on the machine.

- **Implementation Strategy**:
  - **Option A: Electron**:
    - *Pros*: Fastest route. Wrap existing Next.js app. Extensive community support.
    - *Cons*: Heavier resource usage (RAM).
  - **Option B: Tauri 2.0 (Recommended)**:
    - *Pros*: Extremely lightweight (Rust backend). Secure by default. "Vibecoding" trend standard.
    - *Cons*: Steeper learning curve for Rust backend logic.
