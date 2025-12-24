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

- **Modules**:
  - [x] **Firebase Configuration**: Store and manage API keys securely.
  - [x] **Project To-Do List**: Simple task tracking within the dashboard.

## 🏆 Special Phase: Operation Gemini (Hackathon Pivot)

**Goal**: Refactor the core AI engine to use Google Gemini 1.5 Pro/Flash to win the Gemini Hackathon.

- **Core Brain Transplant (OpenAI -> Gemini)**:
  - [ ] **Model Switch**: Replace `gpt-4o-mini` with `gemini-1.5-flash` (Speed/Cost) and `gemini-1.5-pro` (Reasoning).
  - [ ] **SDK Migration**: Implement `@google/generative-ai` SDK.
  - [ ] **Embeddings**: Switch `text-embedding-ada-002` to Google's `text-embedding-004`.

- **Leveraging Gemini's Superpowers**:
  - [ ] **Massive Context (1M+ Tokens)**:
    - [ ] **"Whole Repo" Understanding**: Refactor Vibe Coder to ingest full file structures/content instead of just chunks.
    - [ ] Eliminate/Reduce RAG complexity by passing full context text.
  - [ ] **Multimodal Native**:
    - [ ] **Visual Debugging**: Allow users to paste screenshots of UI errors in chat.
    - [ ] **Video Analysis**: Analyze short screencasts to offer UX improvements.

## ✅ Phase 2: Semantic Intelligence (The "Vibe Coder" Core)

- **Foundation: Secure Access**
  - [x] **GitHub OAuth Integration**:
    - [x] Configure Supabase Auth with GitHub Provider.
    - [x] Added `repo` scope for private access.
    - [x] Validated Persistent Login.

- **Data Ingestion Engine**
  - [x] **Repository Crawler**:
    - [x] Backend worker to crawl GitHub repo trees.
    - [x] Smart filtering (ignoring `node_modules`, images).
    - [x] Optimized for Markdown documentation priority.

- **The Brain: Vector Storage**
  - [x] **Database Upgrade**:
    - [x] Enabled `pgvector` extension.
    - [x] Created `embeddings` table with RLS.
  - [x] **Embedding Generation**:
    - [x] OpenAI `text-embedding-ada-002` integration.
    - [x] Chunking strategy implemented.

- **The Mouth: Semantic Search & Chat**
  - [x] **Vibe Coder Assistant**:
    - [x] Full RAG (Retrieval Augmented Generation) pipeline.
    - [x] Streaming Responses with citations.
    - [x] Integrated `GPT-4o-mini`.

## 🛠️ Phase 3: Advanced Tools & Admin

- **Context Weaver (The "Mega-Prompt" Generator)**
  - [x] **Automatic Context Injection**:
    - [x] Fetches README.md & package.json from DB.
    - [x] Generates File Tree.
  - [x] **Manual Context Input**: Dedicated area for functional requirements.
  - [x] **Prompt Persistence**:
    - [x] Save custom prompts to Database.
    - [x] "Saved Prompts" library per project.

- **Admin Dashboard**
  - [x] **Usage Monitoring**:
    - [x] Track Token Usage & Estimated Costs.
    - [x] `usage_logs` table.
  - [x] **Client Management**:
    - [x] List all users.
    - [x] Sort by Total Spend.

## 💎 Monetization & Growth (Beta Launch)

- **Commercial Infrastructure (LemonSqueezy)**:
  - [ ] **Setup**: Create Store, Products (LTD/Monthly), and Webhooks.
  - [ ] **Checkout Integration**: Generate magic links or overlay checkout.
  - [ ] **Webhook Handler**: `api/webhooks/lemonsqueezy` to provision access (update DB).
  - [ ] **Billing Portal**: Link for users to manage subscription/invoices.
- **Beta Program (500 Users)**:
  - [ ] **Lifetime Deal (LTD) Strategy**:
    - [ ] Define limits (Projects, Storage, AI Tokens).
    - [ ] Create signup flow for Beta Testers.
- **Analytics**:
  - [ ] Google Analytics Integration.

## 🔮 Future Ideas

- **Deep Cost Analysis**: Break down costs per project.
- **AI Insights**: Analyze journal entries for decision patterns.
- **Team Collaboration**: Shared projects and comments.

### 🧠 New Product Concepts

- **VibeOnboard (The Human Layer)**:
  - *Concept*: A "brain" for the team, not just the code.
  - *Problem*: New devs take weeks to understand project conventions and logic.
  - *Solution*: Interactive onboarding courses generated from StackMemory's indexed data. "Here is layout.tsx, try making a small change...".
  - *Hook*: "Reduce onboarding time from 2 weeks to 2 days".

- **TechDiligence (B2B Audit)**:
  - Automated "Health Score" for investors/agencies buying codebases.
  - Detects technical debt, zombie dependencies, and code complexity instantly.

- **VibeFlow (The Action Layer)**:
  - Integration with n8n to **act** on the stack.
  - "I see you added a database table, want me to create the Stripe webhook?"

- **StackMarket**:
  - Community marketplace for "Blueprints" (e.g., "The Perfect Next.js SaaS Starter").
  - "Buy & Hydrate": Clones repo + Configures Env Vars + Sets up DB/Services.

## 🚀 Phase 3.5: CLI & Public Launch (MVP Polish)

- **CLI Package**:
  - [x] Prepare `package.json` for NPM publication (`bin`, `files`).
  - [x] Publish `stackmemory` to NPM Registry.
  - [x] Verify `npm install -g stackmemory` works on clean machine.
- **Onboarding Experience**:
  - [x] "Connect CLI" Modal with instructions.
  - [x] "Empty State" for new users (Quick Start Guide).
  - [x] Verify End-to-End flow (SignUp -> Install -> Sync).
- **Compliance**:
  - [x] Add Privacy Policy Page (Required for Google Auth).
  - [x] Add Terms of Service Page.
  - [x] Add Cookie Policy Page.
  - [x] Add GDPR Rights Section and Cookie Consent Banner.

## 🧩 Phase 4: Low-Code Operations (n8n Integration)

- **Prompt Hub & Extraction**:
  - [ ] Import n8n workflows (.json).
  - [ ] Auto-extract System Prompts from semantic nodes (OpenAI, LangChain).
- **Semantic Logic Parsing**:
  - [ ] Convert visual graph (JSON) to pseudo-code representation.
  - [ ] Enable "What does this workflow do?" search queries.
- **Dependency & Credential Mapping**:
  - [ ] Visualize credential usage across workflows.
  - [ ] Map "Invisible" dependencies (Webhook A -> Workflow B).
