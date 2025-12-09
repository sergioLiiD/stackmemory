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

## 🚧 Phase 2: Semantic Intelligence (The "Vibe Coder" Core)

1. **Foundation: Secure Access**
    - [ ] **GitHub OAuth Integration**:
        - Configure Supabase Auth with GitHub Provider.
        - Implement secure token storage (Provider Access Tokens).
        - Replace current ephemeral PAT system with persistent OAuth sessions.

2. **Data Ingestion Engine**
    - [ ] **Repository Crawler**:
        - Build a backend worker to fetch repository trees recursively.
        - Implement file filters (ignore `node_modules`, `lock` files, images).
        - Extract clean code filtering out noise.

3. **The Brain: Vector Storage**
    - [ ] **Database Upgrade**:
        - Enable `pgvector` extension in Supabase.
        - Create `embeddings` table linked to `projects`.
    - [ ] **Embedding Generation**:
        - Integration with OpenAI/Gemini Embeddings API.
        - Generate vectors for code chunks upon ingestion.

4. **User Experience**
    - [ ] **Semantic Search UI**:
        - "Smart Search" bar across all projects.
        - Results visualization (showing code distinct from metadata).

## 🔮 Future Ideas

- **AI Context Synthesizer**: Use LLMs to read the repository structure/files and generate a smart "Briefing" summary for the Context Weaver.
- **Sync with GitHub**: "Re-scan" button to update stack/versions automatically.
- **Cost Analysis**: Sum total monthly costs from Service Locker.
- **AI Insights**: Analyze journal entries for decision patterns.
