#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Colors for console
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    red: "\x1b[31m",
};

const LOG_PREFIX = `${colors.blue}[StacKMemory CLI]${colors.reset}`;

console.log(`${LOG_PREFIX} Starting Auto-Sync Watcher... 👻`);
console.log(`${LOG_PREFIX} Watching package.json for changes...`);

const targetFile = path.resolve(process.cwd(), 'package.json');

if (!fs.existsSync(targetFile)) {
    console.error(`${colors.red}Error: package.json not found in ${process.cwd()}${colors.reset}`);
    process.exit(1);
}

let fsWait = false;
fs.watch(targetFile, (event, filename) => {
    if (filename && event === 'change') {
        if (fsWait) return;
        fsWait = setTimeout(() => {
            fsWait = false;
        }, 100);

        console.log(`${LOG_PREFIX} ${colors.yellow}Change detected in ${filename}!${colors.reset}`);
        analyzeAndSync();
    }
});

async function analyzeAndSync() {
    console.log(`${LOG_PREFIX} Reading package.json...`);

    try {
        const fileContent = fs.readFileSync(targetFile, 'utf8');
        const pkg = JSON.parse(fileContent);

        // 1. Extract Stack
        const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
        const stack = Object.keys(dependencies).map(key => ({
            name: key,
            version: dependencies[key].replace('^', '').replace('~', '')
        }));

        // 2. Extract Scripts
        const scripts = pkg.scripts || {};

        console.log(`${LOG_PREFIX} ${colors.green}Found ${stack.length} deps & ${Object.keys(scripts).length} scripts.${colors.reset}`);
        console.log(`${LOG_PREFIX} Syncing to Dashboard API...`);

        // 3. Send to API
        try {
            const response = await fetch('http://localhost:3000/api/project/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: '1', // Default ID for demo
                    stack,
                    scripts
                })
            });
            const data = await response.json();

            if (data.success) {
                console.log(`${LOG_PREFIX} ${colors.green}✔ Sync Success! Updated Command Zone.${colors.reset}`);
            } else {
                console.log(`${LOG_PREFIX} ${colors.red}Sync Failed: ${data.error}${colors.reset}`);
            }
        } catch (netError) {
            console.log(`${LOG_PREFIX} ${colors.yellow}Warning: API not reachable (Is dev server running?)${colors.reset}`);
        }

    } catch (error) {
        console.error(`${LOG_PREFIX} ${colors.red}Failed to parse package.json: ${error.message}${colors.reset}`);
    }
}

// Initial scan
analyzeAndSync();

// Keep process alive
setInterval(() => { }, 1000);
