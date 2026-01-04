# Model Context Protocol (MCP) Integration 🔌

> **Goal**: Transform StackMemory into an "MCP Manager" that not only tracks your Tech Stack but manages the *context bridges* (MCP Servers) your AI tools use to interact with that stack.

## 1. The Concept

As "Vibecoding" evolves, projects are no longer just Code + Database. They are now Code + Database + **AI Context**.
The **Model Context Protocol (MCP)** is the standard for connecting AI models to your data.

**StackMemory should track which MCP Servers a project uses**, just like it tracks dependencies or secrets.

### Why document this?

- **Onboarding**: "Which MCPs do I need to install locally to work with this repo's AI agent?"
- **Context**: "Why do we use the Postgres MCP? Ah, for the 'SQL Optimizer' agent."
- **Discovery**: "We use Supabase... is there an MCP for that?" (Yes, prompt suggestions).

---

## 2. Feature: "Context Bridges" (Implemented)

Located in the **Overview Tab**, this section allows you to manage the MCP Servers your project uses.

### Data Model

The `Project` entity now includes an `mcps` array:

```typescript
interface MCPServer {
    id: string;
    name: string; // e.g., "Postgres MCP"
    type: 'stdio' | 'sse';
    command?: string; // e.g., "npx"
    args?: string[]; // e.g. ["-y", "@modelcontextprotocol/server-postgres"]
    url?: string; // for SSE
    env?: Record<string, string>;
    description?: string;
    status: 'active' | 'inactive' | 'suggested';
}
```

### UI Features

1. **Context Bridges List**: Visual cards showing your active MCP bridges.
2. **Bridge Modal**: A form to easily add/edit MCP configurations (supports STDIO and SSE).
3. **One-click Install**: Helper to copy configurations.

---

## 3. The "MCP Advisor" (Implemented) 🧠

StackMemory automatically looks at your **Tech Stack** and suggests relevant MCPs.

**How it works:**

- If your stack includes `Postgres` or `Supabase`, it suggests the **PostgreSQL MCP**.
- If it sees `GitHub`, it suggests the **GitHub MCP**.
- Suggestions appear in a special "✨ Recommended for your stack" section in the Overview.
- Clicking "Add Bridge" pre-fills the configuration for you.

---

## 4. Implementation Status

- [x] **Phase 1: Core UI** (Data Model, Modal, List) - *Completed Jan 2026*
- [x] **Phase 2: AI Advisor** (Suggestion Logic, UI Integration) - *Completed Jan 2026*
- [ ] **Phase 3: Integration** (Sync with local `claude_desktop_config.json`) - *Planned*

---

## 5. Recommended MCPs for this Project (StackMemory)

Given we use **Supabase**, **Next.js**, and **Vercel**, here are the MCPs we should document/use:

1. **Postgres MCP**:
    - *Usage*: Read-only access to `profiles`, `projects` tables for the AI to answer data questions.
    - *Config*: Connect via Supabase Transaction Pooler string.

2. **GitHub MCP**:
    - *Usage*: Allow the AI to check pending PRs or search issues related to "bugs".

3. **Vercel MCP** (Community/Custom):
    - *Usage*: Check deployment status or retrieve build logs directly in chat.
