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

## 🔮 Future Ideas

- **Deep Cost Analysis**: Break down costs per project.
- **AI Insights**: Analyze journal entries for decision patterns.
- **Team Collaboration**: Shared projects and comments.
