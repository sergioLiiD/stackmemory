# StackMemory CLI

The official CLI for [StackMemory](https://stackmemory.app).
Gives your project a specialized memory by syncing your `package.json` dependencies and scripts to your StackMemory Dashboard.

## Usage

You can run it directly using `npx`:

```bash
npx stackmemory --project <YOUR_PROJECT_ID>
```

## Features

- **Auto-Absorb**: Instantly syncs your Tech Stack versions.
- **Script Sync**: Mirrors your `package.json` scripts to your project's "Command Zone" in the dashboard.
- **Ghost Mode**: Runs silently in the background, watching for changes.

## Setup

1. Create a project at [stackmemory.app](https://stackmemory.app).
2. Get your **Project ID** from the dashboard URL (e.g., `stackmemory.app/project/<PROJECT_ID>`).
3. Run the command in your project root.
