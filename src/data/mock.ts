export interface Service {
    provider: string;
    name: string;
    account: string;
    cost: string;
    status: 'active' | 'inactive' | 'deprecated';
    url?: string;
    category?: 'infrastructure' | 'social' | 'saas' | 'newsletter' | 'other';
    notes?: string;
    icon?: string;
}

export interface Decision {
    id: string;
    title: string;
    date: string;
    status: 'accepted' | 'proposed' | 'rejected';
    context: string;
}

export interface StackItem {
    name: string;
    version?: string;
    type: 'frontend' | 'backend' | 'ai' | 'database' | 'devops' | 'other';
    icon?: string; // Optional icon identifier
    notes?: string;
}

export interface Secret {
    key: string;
    environment: 'production' | 'preview' | 'development';
}

export interface TopPrompt {
    id: string;
    title: string;
    model: string;
    prompt: string;
    tags?: string[];
}

export interface JournalEntry {
    id: string;
    title: string;
    date: string;
    content: string; // Markdown supported
    tags: string[];
    links?: string[];
}

export interface Snippet {
    id: string;
    title: string;
    language: string;
    code: string;
    description?: string;
}

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}

export interface Task {
    id: string;
    text: string;
    completed: boolean;
}

export interface DesignSystem {
    colors: { name: string; value: string }[];
    fonts: { name: string; type: 'sans' | 'serif' | 'mono' | 'display' }[];
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'archived' | 'legacy' | 'planning';
    repoUrl?: string;
    liveUrl?: string; // e.g. https://my-app.vercel.app
    deployProvider?: string; // e.g. Vercel, Netlify, Dreamhost
    deployAccount?: string; // e.g. personal@gmail.com
    stack: StackItem[]; // Changed from string[]
    hasUpdates?: boolean;
    lastUpdated: string;
    health: number; // 0-100
    services?: Service[];
    firebaseConfig?: FirebaseConfig; // Optional Firebase configuration
    tasks?: Task[]; // Project To-Dos
    decisions?: Decision[];
    secrets?: Secret[];
    prompts?: TopPrompt[];
    journal?: JournalEntry[];
    snippets?: Snippet[];
    design?: DesignSystem;
    hasVulnerabilities?: boolean;
    insight_report?: string;
    insight_generated_at?: string;
}

export const mockProjects: Project[] = [
    {
        id: "1",
        name: "Fintech Dashboard",
        description: "Main banking interface for client X",
        status: "active",
        repoUrl: "https://github.com/agency/fintech-dashboard",
        liveUrl: "https://dashboard.fintech.com",
        stack: [
            { name: "Next.js", version: "14.2", type: "frontend" },
            { name: "Supabase", type: "backend" },
            { name: "Tailwind CSS", version: "3.4", type: "frontend" },
            { name: "React Query", type: "frontend" },
            { name: "Zustand", type: "frontend" }
        ],
        lastUpdated: "2 hours ago",
        health: 95,
        services: [
            { provider: "Vercel", name: "Hosting (Pro)", account: "team@fintech.com", cost: "$20/mo", status: "active" },
            { provider: "Supabase", name: "PostgreSQL DB", account: "dev@fintech.com", cost: "$25/mo", status: "active" },
            { provider: "Resend", name: "Transactional Email", account: "notifications@fintech.com", cost: "Free", status: "active" }
        ],
        decisions: [
            { id: "d1", title: "Use Supabase over Firebase", date: "2024-01-15", status: "accepted", context: "Needed raw SQL access and relational data modeling." },
            { id: "d2", title: "Migrate to Tailwind v4", date: "2024-03-10", status: "proposed", context: "Simplify config, but waiting for stability." }
        ],
        secrets: [
            { key: "NEXT_PUBLIC_SUPABASE_URL", environment: "production" },
            { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", environment: "production" },
            { key: "STRIPE_SECRET_KEY", environment: "production" },
            { key: "OPENAI_API_KEY", environment: "production" }
        ],
        prompts: [
            {
                id: "p1",
                title: "Tech Stack Generator",
                model: "Gemini 1.5 Pro",
                prompt: "Analyze this package.json and extract the tech stack into a JSON format with categories...",
                tags: ["setup", "analysis"]
            },
            {
                id: "p2",
                title: "SQL Optimization",
                model: "GPT-4o",
                prompt: "Optimize this PostgreSQL query for high-volume transaction data...",
                tags: ["database", "optimization"]
            }
        ],
        journal: [
            {
                id: "j1",
                title: "Initial Concept",
                date: "2024-01-05",
                content: "Decided to move away from simple text files to a structured SaaS approach. The client needs a dashboard that aggregates multiple data sources.",
                tags: ["planning", "concept"]
            },
            {
                id: "j2",
                title: "Auth Refactor",
                date: "2024-02-20",
                content: "Switched from custom JWT auth to Supabase Auth to save time on maintenance. Had to migrate user tables.",
                tags: ["auth", "refactor"]
            }
        ],
        snippets: [
            {
                id: "s1",
                title: "Supabase Client Singleton",
                language: "typescript",
                code: "import { createClient } from '@supabase/supabase-js'...\n\nexport const supabase = createClient(...)",
                description: "Ensures single instance of client"
            }
        ]
    },
    {
        id: "2",
        name: "Legacy CRM",
        description: "Internal customer management tool. Needs migration.",
        status: "legacy",
        stack: [
            { name: "React", version: "16.8", type: "frontend" },
            { name: "Redux", type: "frontend" },
            { name: "Node.js", version: "12", type: "backend" },
            { name: "Express", type: "backend" },
            { name: "MongoDB", type: "database" }
        ],
        lastUpdated: "2 months ago",
        health: 45,
        services: [
            { provider: "AWS", name: "EC2 (t2.micro)", account: "legacy@corp.com", cost: "$12/mo", status: "active" },
            { provider: "MongoDB Atlas", name: "Cluster M10", account: "db@corp.com", cost: "$50/mo", status: "active" }
        ],
        decisions: [
            { id: "d1", title: "Stick to Redux", date: "2020-05-20", status: "accepted", context: "Team is familiar with Redux patterns." }
        ],
        secrets: [
            { key: "MONGO_URI", environment: "production" },
            { key: "JWT_SECRET", environment: "production" }
        ]
    },
    {
        id: "3",
        name: "E-commerce API",
        description: "Headless Shopify integration middleware",
        status: "active",
        stack: [
            { name: "NestJS", type: "backend" },
            { name: "PostgreSQL", type: "database" },
            { name: "Redis", type: "database" },
            { name: "Docker", type: "devops" },
            { name: "Typescript", type: "other" }
        ],
        lastUpdated: "1 day ago",
        health: 88,
        services: [
            { provider: "Railway", name: "API Hosting", account: "dev@shop.com", cost: "$10/mo", status: "active" },
            { provider: "Upstash", name: "Redis", account: "dev@shop.com", cost: "Free", status: "active" }
        ],
        secrets: [
            { key: "SHOPIFY_ACCESS_TOKEN", environment: "production" },
            { key: "REDIS_URL", environment: "production" }
        ]
    },
    {
        id: "4",
        name: "Marketing Site 2024",
        description: "New landing page experiments",
        status: "planning",
        stack: [
            { name: "Astro", type: "frontend" },
            { name: "React", type: "frontend" },
            { name: "Framer Motion", type: "frontend" }
        ],
        lastUpdated: "1 week ago",
        health: 100,
        services: []
    },
    {
        id: "5",
        name: "Old Portfolio",
        description: "My 2020 portfolio site",
        status: "archived",
        repoUrl: "https://github.com/me/old-portfolio",
        stack: [
            { name: "Gatsby", type: "frontend" },
            { name: "GraphQL", type: "backend" },
            { name: "Contentful", type: "backend" }
        ],
        lastUpdated: "3 years ago",
        health: 20,
        services: [
            { provider: "Netlify", name: "Static Hosting", account: "me@gmail.com", cost: "Free", status: "deprecated" }
        ],
        journal: [
            {
                id: "j1",
                title: "Project Archived",
                date: "2023-01-01",
                content: "Moved to a new Next.js portfolio. This project is now read-only.",
                tags: ["archive"]
            }
        ]
    }
];

export const mockGlobalPrompts: TopPrompt[] = [
    {
        id: "gp1",
        title: "Master Refactor Agent",
        model: "GPT-4o",
        prompt: "Check the current file for adherence to the 'Clean Code' principles and SOLID...",
        tags: ["programming", "refactor", "best-practices"]
    },
    {
        id: "gp2",
        title: "Tailwind Converter",
        model: "Gemini 1.5 Pro",
        prompt: "Convert the following custom CSS into Utility-first Tailwind CSS classes...",
        tags: ["css", "frontend", "tailwind"]
    },
    {
        id: "gp3",
        title: "Explain Like I'm Junior",
        model: "GPT-3.5",
        prompt: "Explain this complex function step-by-step using simple analogies...",
        tags: ["learning", "documentation"]
    }
];

export const mockGlobalSnippets: Snippet[] = [
    {
        id: "gs1",
        title: "React hook useDebounce",
        language: "typescript",
        code: "export function useDebounce(value, delay) { ... }",
        description: "Standard debounce hook for search inputs"
    },
    {
        id: "gs2",
        title: "Docker Compose Postgres",
        language: "yaml",
        code: "version: '3.8'\nservices:\n  db:\n    image: postgres:15...",
        description: "Quick setup for local DB"
    },
    {
        id: "gs3",
        title: "Reset CSS - Josh Comeau",
        language: "css",
        code: "*, *::before, *::after {\n  box-sizing: border-box;\n}...",
        description: "The modern CSS reset"
    }
];
