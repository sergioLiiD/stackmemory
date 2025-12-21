#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Colors for console
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    red: "\x1b[31m",
};

const LOG_PREFIX = `${colors.blue}[StackMemory]${colors.reset}`;
const API_URL = process.env.STACKMEMORY_API_URL || 'https://stackmemory.app/api/project/sync';

// Parse Args
const args = process.argv.slice(2);

// Find flags
const helpIdx = args.findIndex(arg => arg === '--help' || arg === '-h');
const versionIdx = args.findIndex(arg => arg === '--version' || arg === '-v');
const projectIdx = args.findIndex(arg => arg === '--project' || arg === '-p');

// Show Version
if (versionIdx !== -1) {
    const pkg = require('../package.json');
    console.log(`${pkg.name} version ${pkg.version}`);
    process.exit(0);
}

// Show Help
if (helpIdx !== -1) {
    console.log(`
${colors.bright}StackMemory CLI${colors.reset} - The Silent Observer

${colors.yellow}Usage:${colors.reset}
  npx stackmemory --project <PROJECT_ID>

${colors.yellow}Options:${colors.reset}
  --project, -p   Required. The Project ID from your StackMemory Dashboard.
  --help, -h      Show this help message.
  --version, -v   Show version number.

${colors.yellow}Description:${colors.reset}
  This tool runs in the background and watches your ${colors.bright}package.json${colors.reset} file.
  When changes are detected (new dependencies, scripts), it automatically
  syncs them to your StackMemory Vault.

${colors.yellow}Environment Variables:${colors.reset}
  STACKMEMORY_PROJECT_ID  (Optional) Auto-fill project ID.
  STACKMEMORY_API_URL     (Debug) Override API endpoint.
`);
    process.exit(0);
}

const projectId = projectIdx !== -1 ? args[projectIdx + 1] : process.env.STACKMEMORY_PROJECT_ID;

if (!projectId) {
    console.error(`${LOG_PREFIX} ${colors.red}Error: No Project ID provided.${colors.reset}`);
    console.log(`Try: ${colors.green}npx stackmemory --help${colors.reset}`);
    process.exit(1);
}

console.log(`${LOG_PREFIX} Starting Auto-Sync for Project: ${colors.bright}${projectId}${colors.reset}`);
console.log(`${LOG_PREFIX} Target API: ${API_URL}`);

const targetFile = path.resolve(process.cwd(), 'package.json');

if (!fs.existsSync(targetFile)) {
    console.error(`${colors.red}Error: package.json not found in ${process.cwd()}${colors.reset}`);
    process.exit(1);
}

// Debounce logic
let fsWait = false;
fs.watch(targetFile, (event, filename) => {
    if (filename && event === 'change') {
        if (fsWait) return;
        fsWait = setTimeout(() => {
            fsWait = false;
        }, 500); // 500ms debounce

        console.log(`${LOG_PREFIX} ${colors.yellow}Change detected in ${filename}!${colors.reset}`);
        analyzeAndSync();
    }
});

async function analyzeAndSync() {
    try {
        const fileContent = fs.readFileSync(targetFile, 'utf8');
        const pkg = JSON.parse(fileContent);

        // 1. Extract Stack
        const dependencies = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
        const stack = Object.keys(dependencies).map(key => ({
            name: key,
            version: dependencies[key].replace(/[\^~]/g, '')
        }));

        // 2. Extract Scripts
        const scripts = pkg.scripts || {};

        console.log(`${LOG_PREFIX} Found ${stack.length} dependencies & ${Object.keys(scripts).length} scripts.`);
        console.log(`${LOG_PREFIX} Syncing...`);

        // 3. Send to API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId,
                stack,
                scripts
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log(`${LOG_PREFIX} ${colors.green}✔ Sync Success!${colors.reset}`);
        } else {
            console.error(`${LOG_PREFIX} ${colors.red}Sync Failed: ${data.error || 'Unknown Error'}${colors.reset}`);
        }

    } catch (error) {
        console.error(`${LOG_PREFIX} ${colors.red}Error: ${error.message}${colors.reset}`);
    }
}

// Initial scan
analyzeAndSync();

// Keep alive
setInterval(() => { }, 10000);
