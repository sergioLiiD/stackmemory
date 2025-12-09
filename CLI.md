# 👻 StacKMemory CLI

Automate your dashboard documentation using the StacKMemory Watcher.
This CLI tool watches your local `package.json` and automatically syncs your:

1. **Tech Stack**: Dependencies and versions.
2. **Command Zone**: Custom transcripts (`npm run scripts`).

## 🚀 Quick Start

### 1. Installation

The CLI is included in the project. No global installation required if you are working within the repo.

```bash
# It uses the local script at src/cli/watch.js
```

### 2. Usage

Run the watcher in a separate terminal window while you work:

```bash
npm run cli:watch
```

Output should look like this:

```text
[StacKMemory CLI] Starting Auto-Sync Watcher... 👻
[StacKMemory CLI] Watching package.json for changes...
[StacKMemory CLI] Found 25 deps & 6 scripts.
[StacKMemory CLI] Syncing to Dashboard API...
[StacKMemory CLI] ✔ Sync Success! Updated Command Zone.
```

### 3. Features

- **Auto-Discovery**: Detects new packages installed via `npm install` and adds them to your Stack tab.
- **Script Sync**: Detects changes to `scripts` in `package.json` and pushes them to your "Command Zone" card in the Dashboard.
- **Real-time**: Updates continuously as you save `package.json`.

## 🛠 Troubleshooting

- **"API not reachable"**: Ensure your Next.js dev server is running on `http://localhost:3000`.
- **"Project ID mismatch"**: Currently defaults to Project ID '1'. (Configure in `src/cli/watch.js` if needed).
