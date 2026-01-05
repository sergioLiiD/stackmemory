# StackMemory CLI Evolution 🚀

This document outlines the capabilities of the StackMemory Command Line Interface (CLI), currently known as the "Trojan Horse" for developer productivity.

## Status: Active Development

- **Package**: `stackmemory` (NPM)
- **Current Version**: `0.0.6`
- **Command**: `npx stackmemory`

---

## 🏗 Current Capabilities (The Foundation)

Currently, the CLI serves as a **Sync Agent** that connects your local environment to the StackMemory Dashboard.

### 1. Auto-Absorb via `sync`

Automatically scans `package.json` to extract dependencies and syncs them to your project's "Tech Stack".

```bash
npx stackmemory --project <ID>
```

- **Benefit**: No manual data entry. Your dashboard always reflects the actual code state.

### 2. Script Sync

Mirrors your `scripts` (e.g., `dev`, `build`, `test`) to the project's "Command Zone".

- **Benefit**: Team members can see available commands without opening `package.json`.

### 3. Local Guardian (`check`)

Prevents "It works on my machine" syndrome by detecting Env Var Drift.

```bash
stackmem check
```

- **Benefit**: Alerts you if your `.env` is missing keys defined in `.env.example`.

### 4. Infra Scan (`scan`)

Detects "invisible" infrastructure components that aren't in `package.json`.

```bash
stackmem scan
```

- **Benefit**: Finds Docker, Makefiles, Vercel configs, and suggests adding them to your Tech Stack.

---

## 🔮 The Vision: "The Developer's Trojan Horse"

We aim to remove friction by meeting the developer where they live: **The Terminal**.

### 🛠 High-Priority Requests

#### 1. Contextual Q&A (`ask`)

Query your StackMemory brain directly from the terminal.

```bash
stackmem ask "How do I add a new service to the docker-compose?"
```

- **How it works**: Uses RAG against your indexed codebase (Vector Store) to provide an answer without leaving the terminal.
- **Output**: Returns concise markdown-formatted answers with code snippets.

#### 2. Journal Logging (`log`)

Capture thoughts, bugs, or decisions instantly.

```bash
stackmem log "Fixed the cert issue on staging. It was a missing env var." --tags bugfix,infra
```

- **How it works**: Sends text to the Journal API.
- **Magic**: Automatically applies "Semantic Tags" using the new Auto-Tag feature.

#### 3. Semantic History Search (`history`)

Forget `Ctrl+R`. Find commands by *meaning*, not just syntax.

```bash
stackmem history "certificate ssl configuration"
```

- **How it works**: Indexes shell history ~bash_history~ / ~zsh_history~ embedded with meaning.
- **Output**: Returns the exact command you ran 3 weeks ago: `openssl req -x509 -newkey rsa:4096 ...`

#### 4. Repo & Stack Update (`update`)

Force a re-scan of the codebase state.

```bash
stackmem update
```

- **Action**: Triggers the GitHub Crawler server-side (or local analysis) to refresh the "Project Insight" and "Security Insights".

### 🚀 Future Moonshots

#### 5. Local Agent Guidelines

Verify if the local environment matches the team's standards.

```bash
stackmem doctor
```

- **Checks**:
  - `node` version matches `.nvmrc`?
  - `.env` keys missing compared to `.env.example`?
  - Pending git commits?

#### 6. "Push to Stack" (Error Piping)

Pipe error logs directly to the AI for analysis.

```bash
npm run build 2>&1 | stackmem push --analyze
```

- **Result**: Creates a Journal Entry with the crash log + AI Analysis of the fix.

---

## Technical Implementation Plan

1. **Refactor CLI**: Move from simple script to `commander.js` or `oclif` structure.
2. **Auth**: Implement `stackmem login` (Device Flow) to persist token locally (e.g., `~/.stackmemory/auth.json`).
3. - [x] **`stackmem login`**: Store access token securely in local config (`~/.config/stackmemory-cli`).

- [x] **`stackmem init`**: Link the current directory to a StackMemory Project ID.
- [x] **`stackmem sync`**: Parse `package.json` (Stack & Scripts) and push to the Vault.
  - [x] Must support `dependencies` and `devDependencies`.
  - [x] Must support sending `scripts` as Snippets/Command Zone items.
  - [x] **Real-time**: Frontend updates instantly upon sync.
- [x] **`stackmem doctor`**: Diagnoses connection, token status, and linked project.
- [x] **`stackmem ask <query>`**: Direct interface to the Project Brain (RAG).
- [x] **`stackmem log <content>`**: Quick journal entry with optional tags.
