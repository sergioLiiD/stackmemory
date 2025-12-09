# Semantic Search Strategy (Phase 2)

**Technical Architecture for "The Vibe Coder"**

## 1. Core Architecture: "The Modern Monolith"

We will avoid complex multi-database setups. We leverage the existing Supabase infrastructure.

- **Database**: PostgreSQL (Supabase).
- **Vector Engine**: `pgvector` extension on the same Postgres instance.
- **Benefits**: Zero latency between metadata (Projects) and vectors (Embeddings). Unified RLS (Row Level Security).

## 2. Security & Access (The Foundation)

To persistently read a user's repository (not just once during import), we need persistent access.

- **Current State**: Ephemeral PATs (User pastes token -> Magic Import -> Token lost).
- **Phase 2 Requirement**: **GitHub OAuth App**.
  - **Why?** Allows "Sign in with GitHub".
  - **Mechanism**: Supabase Auth handles the handshake and stores the `provider_token` (GitHub Access Token) securely in the session/database.
  - **User Trust**: User grants specific scopes (`repo:read`). Access can be revoked by the user via GitHub settings.

## 3. Data Ingestion Engine (The "Smart Crawler")

The key to quality and cost control is **Selective Indexing**. We do NOT index the entire repository.

### The Filter Strategy (Signal vs. Noise)

We only fetch and vectorise files with high "logic density".

**✅ Allowlist (Index these):**

- `.ts`, `.tsx`, `.js`, `.jsx` (Frontend/Backend logic)
- `.py` (Scripts, Backend)
- `.sql` (Database schemas)
- `.rs`, `.go`, `.java`, `.rb` (Other backend logic)
- `.md` (Documentation, high semantic value)

**❌ Blocklist (Ignore these):**

- `node_modules/`, `dist/`, `.next/`, `build/` (Dependencies & Build artifacts)
- `package-lock.json`, `yarn.lock` (Auto-generated noise)
- `.png`, `.jpg`, `.svg` (Assets)
- `.css` (pure styling is rarely semantically searched for logic)

### "Chunking" Logic

- We won't just slice by character count.
- We will split by meaningful blocks (e.g., functions or classes) or manageable paragraphs (500-1000 tokens) with slight overlap to preserve context.

## 4. The Data Flow

1. **Connect**: User signs in with GitHub (OAuth).
2. **Select**: User specifically enables "Semantic Indexing" for Project X.
3. **Crawl (Background Job)**:
    - Backend uses the OAuth token to fetch the file tree.
    - Applies **Allowlist Filter**.
    - Downloads raw content of valid files.
4. **Vectorize**:
    - Send content execution to Embedding API (OpenAI `text-embedding-3-small` or similar).
    - Receive Vector (`[0.012, -0.931, ...]`).
5. **Store**:
    - Insert into `embeddings` table (`project_id`, `file_path`, `content_chunk`, `vector`).

## 5. The Search Experience (UX)

1. **Query**: User types "How did I handle auth in Python?".
2. **Vectorize Query**: Convert question to vector.
3. **Similarity Search (`pgvector`)**: Find vectors mathematically closest to the query vector.
4. **Results**: Return the specific **File + Code Snippet** + Link to GitHub.
