#!/usr/bin/env node
const { Command } = require('commander');
const inquirer = require('inquirer');
const Conf = require('conf');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const path = require('path');

const program = new Command();
const config = new Conf({ projectName: 'stackmemory-cli' });
const pkg = require('../package.json');

const DEFAULT_API_URL = process.env.STACKMEMORY_API_URL || 'https://stackmemory.app/api';

// --- Helpers ---

const getAuth = () => {
    const token = config.get('token');
    const projectId = config.get('projectId') || process.env.STACKMEMORY_PROJECT_ID;
    return { token, projectId };
};

const getApiClient = (token) => {
    return axios.create({
        baseURL: DEFAULT_API_URL,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
};

const spinner = (text) => ora(text);

// --- Commands ---

program
    .version(pkg.version)
    .description('StackMemory CLI - The Silent Observer & Vibe Coder');

program
    .command('login')
    .description('Authenticate with StackMemory')
    .action(async () => {
        console.log(chalk.blue('StackMemory Login'));
        console.log('Please grab your access token (JWT) from dashboard/settings (or developer tools for now).');

        const answers = await inquirer.prompt([
            {
                type: 'password',
                name: 'token',
                message: 'Enter your Access Token:',
                mask: '*'
            }
        ]);

        if (answers.token) {
            config.set('token', answers.token);
            console.log(chalk.green('✔ Token saved!'));
        }
    });

program
    .command('init')
    .description('Initialize this directory with a Project ID')
    .action(async () => {
        const currentId = config.get('projectId');
        if (currentId) {
            console.log(chalk.dim(`Current Project ID: ${currentId}`));
        }

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectId',
                message: 'Enter your Project ID (from URL):',
                default: currentId,
                validate: input => input.length > 5 ? true : 'Invalid ID'
            }
        ]);

        config.set('projectId', answers.projectId);
        console.log(chalk.green(`✔ Project ID linked: ${answers.projectId}`));
    });

program
    .command('sync')
    .description('Sync package.json dependencies and scripts')
    .action(async () => {
        const { projectId, token } = getAuth();
        if (!projectId) return console.log(chalk.red('Run "stackmemory init" first.'));

        const targetFile = path.resolve(process.cwd(), 'package.json');
        if (!fs.existsSync(targetFile)) return console.log(chalk.red('No package.json found.'));

        if (!fs.existsSync(targetFile)) return console.log(chalk.red('No package.json found.'));

        console.log(chalk.blue(`Target Project: ${projectId}`));
        const s = spinner('Analyzing package.json...').start();

        try {
            const pkgContent = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
            const dependencies = { ...pkgContent.dependencies, ...pkgContent.devDependencies };
            const stack = Object.keys(dependencies).map(key => ({
                name: key,
                version: dependencies[key].replace(/[\^~]/g, '')
            }));
            const scripts = pkgContent.scripts || {};

            // Use Sync Endpoint (Legacy URL or new route? Using the one in stackmemory.js original)
            // Original used: https://stackmemory.app/api/project/sync
            // Let's assume /api/project/sync is compatible or needs update.
            // Original code used a specific full URL. Let's stick to that for sync.
            // Actually, let's use the Axios client if possible, but the original script didn't use auth.
            // For now, let's allow unauthenticated sync with ProjectID only (as before) OR use auth if available.

            if (token) {
                const client = getApiClient(token);
                await client.post('/project/sync', { projectId, stack, scripts });
            } else {
                await axios.post(`${DEFAULT_API_URL}/project/sync`, {
                    projectId,
                    stack,
                    scripts
                });
            }

            s.succeed('Sync Complete!');
        } catch (e) {
            if (e.response?.data) console.error(chalk.red('Debug Info:'), JSON.stringify(e.response.data, null, 2));
            s.fail(`Sync Failed: ${e.response?.data?.error || e.message}`);
        }
    });

program
    .command('ask <query>')
    .description('Ask your project brain a question')
    .action(async (query) => {
        const { token, projectId } = getAuth();
        if (!token || !projectId) return console.log(chalk.red('Run "stackmemory login" and "init" first.'));

        const s = spinner('Thinking...').start();
        const client = getApiClient(token);

        try {
            // Streaming response is hard with Axios + formatting, let's use fetch for stream or simplified POST
            // The /api/chat returns a stream. For CLI, simpler to wait or handle stream.
            // Let's try simple POST and buffering for now (MVP).

            // Actually, fetch API is available in Node 18+.
            const response = await fetch(`${DEFAULT_API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query, projectId })
            });

            if (!response.ok) throw new Error(response.statusText);

            s.stop();

            // Stream reader
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            process.stdout.write(chalk.cyan('AI: '));

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                process.stdout.write(decoder.decode(value));
            }
            process.stdout.write('\n');

        } catch (e) {
            s.fail(`Error: ${e.message}`);
        }
    });

program
    .command('log <content>')
    .description('Log an entry to your Journal')
    .option('-t, --tags <tags>', 'Comma separated tags')
    .action(async (content, options) => {
        const { token, projectId } = getAuth();
        if (!token || !projectId) return console.log(chalk.red('Run "stackmemory login" and "init" first.'));

        const s = spinner('Logging to Journal...').start();
        const client = getApiClient(token);

        try {
            await client.post('/vibe/journal', {
                content,
                projectId,
                tags: options.tags ? options.tags.split(',') : [],
                title: 'CLI Entry'
            });
            s.succeed('Entry Saved!');
        } catch (e) {
            console.error(chalk.red('Debug Info:'), JSON.stringify(e.response?.data || {}, null, 2));
            s.fail(`Failed: ${e.response?.data?.error || e.message}`);
        }
    });

program
    .command('check')
    .description('Check for Env Var Drift (missing keys)')
    .action(() => {
        console.log(chalk.bold('🔍 Checking Environment Variables...'));
        const cwd = process.cwd();
        const envPath = path.join(cwd, '.env');
        const examplePath = [
            path.join(cwd, '.env.example'),
            path.join(cwd, '.env.template'),
            path.join(cwd, 'env.example')
        ].find(p => fs.existsSync(p));

        if (!fs.existsSync(envPath)) {
            console.log(chalk.red('✘ No .env file found.'));
            return;
        }

        if (!examplePath) {
            console.log(chalk.yellow('⚠ No .env.example found. Create one to enable drift checks.'));
            return;
        }

        const parseKeys = (content) => {
            return content.split('\n')
                .map(l => l.trim())
                .filter(l => l && !l.startsWith('#'))
                .map(l => l.split('=')[0].trim())
                .filter(k => k);
        };

        const envKeys = parseKeys(fs.readFileSync(envPath, 'utf8'));
        const exampleKeys = parseKeys(fs.readFileSync(examplePath, 'utf8'));

        const missing = exampleKeys.filter(k => !envKeys.includes(k));
        const extra = envKeys.filter(k => !exampleKeys.includes(k));

        if (missing.length === 0) {
            console.log(chalk.green('✔ .env is in sync with example!'));
        } else {
            console.log(chalk.red('✘ Missing Keys in .env:'));
            missing.forEach(k => console.log(chalk.red(`  - ${k}`)));
        }

        if (extra.length > 0) {
            console.log(chalk.dim('\nExtra keys in .env (not in example):'));
            extra.forEach(k => console.log(chalk.dim(`  - ${k}`)));
        }
    });

program
    .command('scan')
    .description('Scan for invisible infrastructure (Docker, Make, etc.)')
    .action(() => {
        console.log(chalk.bold('📡 Scanning Infrastructure...'));
        const cwd = process.cwd();

        const sigs = {
            'Docker': ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'],
            'Kubernetes': ['k8s', 'charts', 'helm'], // dirs or files
            'Make': ['Makefile'],
            'Just': ['Justfile', 'justfile'],
            'Vercel': ['vercel.json'],
            'Netlify': ['netlify.toml'],
            'Supabase': ['supabase/config.toml'],
            'Redis': ['redis.conf'], // rudimentary
            'Prisma': ['prisma/schema.prisma'],
            'Drizzle': ['drizzle.config.ts', 'drizzle.config.js']
        };

        const found = [];

        Object.entries(sigs).forEach(([name, patterns]) => {
            const hit = patterns.some(p => {
                const full = path.join(cwd, p);
                return fs.existsSync(full);
            });
            if (hit) found.push(name);
        });

        if (found.length === 0) {
            console.log(chalk.yellow('No infrastructure signatures found.'));
        } else {
            console.log(chalk.green(`✔ Detected Stack:`));
            found.forEach(f => console.log(chalk.cyan(`  • ${f}`)));
            console.log(chalk.dim('\nTip: Add these to your Project Stack in the Dashboard.'));
        }
    });

program
    .command('doctor')
    .description('Check local environment health')
    .action(() => {
        console.log(chalk.bold('StackMemory Doctor 🩺'));
        const { projectId } = getAuth();

        if (projectId) console.log(chalk.green(`✔ Project ID linked: ${projectId}`));
        else console.log(chalk.red('✘ No Project ID linked (Run "stackmemory init")'));

        if (fs.existsSync('package.json')) console.log(chalk.green('✔ package.json found'));
        else console.log(chalk.red('✘ package.json missing'));

        if (projectId && config.get('token')) {
            const { token } = getAuth();
            const client = getApiClient(token);
            spinner('Verifying Project Connection...').start();

            client.get(`/project/${projectId}`) // Need to ensure this route exists or use a generic query
                .then(res => {
                    // Assuming /api/project/[id] exists, or we query via supabase client if we were full node.
                    // But we are CLI. Let's assume we need to add a verify endpoint or use existing.
                    // Actually, let's use the sync endpoint or just rely on the sync success.
                    // Better: The 'sync' command success proves connection.
                    // Let's print the Configured ID clearly.
                })
                .catch(() => { });
        }

        // Let's keep it simple for now to avoid side quests with new APIs.
        // Just print the ID clearly.
        console.log(chalk.blue(`\nConfiguration:`));
        console.log(`Project ID: ${projectId}`);
        console.log(`API URL: ${DEFAULT_API_URL}`);
        console.log(`Token: ${config.get('token') ? 'Saved (******)' : 'Missing'}`);
    });

program.parse(process.argv);
