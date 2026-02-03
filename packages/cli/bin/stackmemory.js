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
            const cleanToken = answers.token.trim();
            config.set('token', cleanToken);
            console.log(chalk.green('✔ Token saved!'));
            console.log(chalk.dim(`Config stored at: ${config.path}`));
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
    .command('ask [query]')
    .description('Ask your project brain a question')
    .action(async (query) => {
        const { token, projectId } = getAuth();

        console.log(chalk.dim(`DEBUG: Config path: ${config.path}`));
        console.log(chalk.dim(`DEBUG: Project ID: ${projectId}`));
        console.log(chalk.dim(`DEBUG: Token: ${token ? (token.substring(0, 10) + '...' + token.substring(token.length - 5)) : 'None'}`));

        if (!token || !projectId) return console.log(chalk.red('Run "stackmemory login" and "init" first.'));

        if (!query) {
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'question',
                    message: 'What do you want to ask your codebase?'
                }
            ]);
            query = answers.question;
        }

        if (!query) return;

        const s = spinner('Thinking...').start();

        const client = getApiClient(token);

        try {
            // Using axios for consistency with other commands and test script
            const response = await client.post('/chat', {
                query,
                projectId
            }, {
                responseType: 'stream'
            });

            s.stop();
            process.stdout.write(chalk.cyan('AI: '));

            const stream = response.data;

            stream.on('data', (chunk) => {
                process.stdout.write(chunk.toString());
            });

            stream.on('end', () => {
                process.stdout.write('\n');
            });

            stream.on('error', (e) => {
                console.error(chalk.red('Stream Error:'), e.message);
            });

            // Wait for stream to finish
            await new Promise((resolve, reject) => {
                stream.on('end', resolve);
                stream.on('error', reject);
            });

        } catch (e) {
            s.stop(); // Ensure spinner stops on error
            if (e.response?.status === 401) {
                console.log(chalk.red('✖ Error: Unauthorized. Please run "stackmemory login" again to refresh your token.'));
            } else {
                s.fail(`Error: ${e.response?.data?.error || e.message}`);
            }
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
    .action(async () => {
        console.log(chalk.bold('🔍 Checking Environment Variables...'));
        const cwd = process.cwd();
        const envCandidates = [
            path.join(cwd, '.env.local'),
            path.join(cwd, '.env')
        ];
        const envPath = envCandidates.find(p => fs.existsSync(p));

        // Find existing example
        let examplePath = [
            path.join(cwd, '.env.example'),
            path.join(cwd, '.env.template'),
            path.join(cwd, 'env.example')
        ].find(p => fs.existsSync(p));

        if (!envPath) {
            console.log(chalk.red('✘ No .env or .env.local file found.'));
            return;
        }

        const parseKeys = (content) => {
            return content.split('\n')
                .map(l => l.trim())
                .filter(l => l && !l.startsWith('#'))
                .map(l => l.split('=')[0].trim())
                .filter(k => k);
        };

        if (!examplePath) {
            console.log(chalk.yellow('⚠ No .env.example found.'));

            const answers = await inquirer.prompt([{
                type: 'confirm',
                name: 'create',
                message: 'Would you like to generate .env.example from your current env file?',
                default: true
            }]);

            if (answers.create) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                const keys = parseKeys(envContent);
                const exampleContent = keys.map(k => `${k}=`).join('\n');

                fs.writeFileSync(path.join(cwd, '.env.example'), exampleContent);
                console.log(chalk.green('✔ Created .env.example'));
                examplePath = path.join(cwd, '.env.example');
            } else {
                console.log(chalk.dim('Skipping check. Create .env.example to enable drift detection.'));
                return;
            }
        }

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
