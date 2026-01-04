"use client";

import { useState } from "react";
import {
    Layout,
    Import,
    ShieldAlert,
    Layers,
    Share2,
    Laptop,
    Gift,
    BookOpen,
    Terminal,
    Sparkles,
    Map as MapIcon,
    Network,
    Bot,
    PenTool,
    Palette
} from "lucide-react";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GuideArticle, GuideArticleView } from "./article-view";

export default function GuidePage() {
    const [selectedArticle, setSelectedArticle] = useState<GuideArticle | null>(null);

    const guides: GuideArticle[] = [
        {
            id: "multimodal-agent",
            title: "Vibe Coder AI",
            description: "Your intelligent coding partner with Vision. Explain bugs with screenshots or videos.",
            longDescription: "Vibe Coder isn't just a text bot. It's a Multimodal AI agent powered by Gemini 2.0 Flash. It can see what you see. Upload screenshots of broken layouts or screen recordings of buggy behaviors, and it will analyze the visual context alongside your code to provide pinpoint solutions.",
            icon: Bot,
            badge: "NEW",
            color: "text-fuchsia-500",
            bg: "bg-fuchsia-500/10",
            btnColor: "bg-fuchsia-600 hover:bg-fuchsia-700",
            actionLink: "/dashboard",
            benefits: [
                "Multimodal analysis (Text + Image + Video)",
                "Full codebase retrieval (RAG)",
                "Deep reasoning on architectural decisions"
            ],
            useCases: [
                "Upload a screenshot of a CSS misalignment -> AI gives you the Tailwind fix.",
                "Record a video of a weird animation glitch -> AI analyzes the frame timing.",
                "Paste a Figma design -> AI generates the React component code."
            ],
            tips: [
                "Use the 'Attach' button in chat to upload media.",
                "Be specific: 'Look at the top-right corner of this screenshot'."
            ]
        },
        {
            id: "project-management",
            title: "Project Management",
            description: "Organize your tech stacks in one place. Edit dependencies, view versions, and track stack evolution.",
            longDescription: "StackMemory acts as the central nervous system for your development projects. It allows you to visualize, track, and manage the technology choices across your entire portfolio.",
            icon: Layout,
            badge: "FREE",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            btnColor: "bg-blue-600 hover:bg-blue-700",
            actionLink: "/dashboard",
            benefits: [
                "Single pane of glass for all your repositories",
                "Historical tracking of stack changes",
                "Visualize tech debt and upgrade opportunities"
            ],
            useCases: [
                "Tracking which version of Next.js each of your 10 client projects use.",
                "Auditing all projects that use a deprecated library.",
                "Onboarding a freelancer by sharing the project stack view."
            ],
            tips: [
                "Use the 'Active' vs 'Archived' status to focus on what matters.",
                "Group similar projects to spot patterns in your tech choices."
            ]
        },
        {
            id: "smart-import",
            title: "Smart Import",
            description: "Add projects manually via CLI or sync directly with GitHub to auto-detect your stack.",
            longDescription: "Get up and running in seconds. Our Smart Import engine parses your package.json files to automatically populate your project stack, saving you hours of manual data entry.",
            icon: Import,
            badge: "PRO",
            color: "text-violet-500",
            bg: "bg-violet-500/10",
            btnColor: "bg-violet-600 hover:bg-violet-700",
            actionLink: "/dashboard?import=true",
            actionLabel: "Start Importing",
            benefits: [
                "Zero manual data entry required",
                "Instant parsing of package.json and other config files",
                "Keeps your dashboard in sync with your codebase"
            ],
            useCases: [
                "Migrating a legacy portfolio of 50 repos into StackMemory in minutes.",
                "Automatically separating Monorepo workspaces into distinct projects.",
                "Keeping documentation up-to-date automatically via CI/CD hooks."
            ],
            tips: [
                "Connect your GitHub account to enable auto-sync on push.",
                "For monorepos, you can select specific sub-directories to import separate projects."
            ]
        },
        {
            id: "cli-tool",
            title: "StackMemory CLI",
            description: "Your terminal companion. Sync, Chat, and Journal without leaving your IDE.",
            longDescription: "The CLI is the developer's bridge to StackMemory. Sync your stack, ask your codebase questions with `stackmem ask`, log journal entries with `stackmem log`, and verify health with `stackmem doctor`.",
            icon: Terminal,
            badge: "FREE",
            color: "text-slate-500",
            bg: "bg-slate-500/10",
            btnColor: "bg-slate-800 hover:bg-slate-900",
            actionLink: "/dashboard",
            benefits: [
                "Instant Sync (`stackmem sync`)",
                "Chat with Codebase (`stackmem ask`)",
                "Dev Diary & Health Checks"
            ],
            useCases: [
                "Asking 'Where is the Auth logic?' directly from your terminal.",
                "Logging a quick decision: `stackmem log 'Switched to Supabase for auth' -t arch`.",
                "Verifying environment health before a deployment."
            ],
            tips: [
                "Run `stackmem login` to authenticate.",
                "Use `stackmem ask 'how do I...'` for instant answers."
            ]
        },
        {
            id: "journal-tags",
            title: "Journal & Auto-Tagging",
            description: "A developer diary that knows what you're writing about. Powered by Semantic Analysis.",
            longDescription: "Don't just write code, document the journey. The Journal allows you to log decisions, bugs, and victories. Our 'Magic Auto-Tag' feature analyzes your entry text and automatically suggests semantic tags (e.g., #refactor, #database) so you don't have to organize manually.",
            icon: PenTool,
            badge: "NEW",
            color: "text-pink-500",
            bg: "bg-pink-500/10",
            btnColor: "bg-pink-600 hover:bg-pink-700",
            actionLink: "/dashboard",
            benefits: [
                "Mood tracking (Euphoric, Flow, Stuck, etc.)",
                "AI-Suggested Tags based on content",
                "Timeline visualization of your progress"
            ],
            useCases: [
                "Logging a critical bug fix to explain 'Why' it happened for future you.",
                "Tracking your daily 'State of Mind' to correlate with productivity.",
                "Generating a weekly report of what you worked on based on tags."
            ],
            tips: [
                "Click the ✨ Magic Wand icon in the modal to auto-tag your entry.",
                "Use the 'Stuck' mood when you're blocked; it helps identify pain points later."
            ]
        },
        {
            id: "vulnerability-scanner",
            title: "Vulnerability Scanner",
            description: "Automatically detect security risks in your dependencies. Get alerts and fix recommendations.",
            longDescription: "Security shouldn't be an afterthought. Our scanner continuously monitors your dependency tree against the latest CVE databases to alert you of potential risks before they reach production.",
            icon: ShieldAlert,
            badge: "FREE",
            color: "text-red-500",
            bg: "bg-red-500/10",
            btnColor: "bg-red-600 hover:bg-red-700",
            actionLink: "/dashboard",
            benefits: [
                "Real-time alerts for critical vulnerabilities",
                "Actionable fix recommendations",
                "Prioritize updates based on severity"
            ],
            useCases: [
                "Getting alerted that your version of 'axios' has a known XSS flaw.",
                "Checking safety before upgrading a major dependency.",
                "Generating a security compliance report for a client."
            ],
            tips: [
                "Check the dashboard weekly for new alerts.",
                "We highlight 'Critical' vulnerabilities in red so you can triage immediately."
            ]
        },
        {
            id: "context-bridges",
            title: "Context Bridges (MCP)",
            description: "Manage Model Context Protocol servers. Connect your AI agents to your data sources.",
            longDescription: "Transform StackMemory into your MCP command center. Document active servers, get AI-powered suggestions for your stack, and share configurations with your team for Claude Desktop or Cursor.",
            icon: Network,
            badge: "NEW",
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
            btnColor: "bg-cyan-600 hover:bg-cyan-700",
            actionLink: "/dashboard",
            benefits: [
                "Centralized MCP Server tracking",
                "AI Advisor for stack-based suggestions",
                "One-click config generation for teams"
            ],
            useCases: [
                "Connecting your AI to a local Postgres database to query data.",
                "Standardizing the 'GitHub MCP' configuration for your entire team.",
                "Discovering that a 'Sentry MCP' exists because you use Sentry."
            ],
            tips: [
                "Check 'Overview' for suggested bridges based on your stack.",
                "Copy the JSON config to your `claude_desktop_config.json`."
            ]
        },
        {
            id: "global-vault",
            title: "Global Vault",
            description: "Store your best system prompts and code snippets. Reuse them instantly across any project.",
            longDescription: "Stop rewriting the same boilerplate code and AI prompts. The Global Vault is your personal library of reusable assets that can be injected into any project workflow.",
            icon: Layers,
            badge: "PRO",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            btnColor: "bg-amber-600 hover:bg-amber-700",
            actionLink: "/dashboard/vault",
            actionLabel: "Open Vault",
            benefits: [
                "Write once, reuse everywhere",
                "Standardize your AI persona across projects",
                "Share common utility functions instantly"
            ],
            useCases: [
                "Saving your perfect 'Senior React Engineer' system prompt.",
                "Storing your standard 'Tailwind Config' snippet.",
                "Sharing a 'Bug Report' template with the whole team."
            ],
            tips: [
                "Create a 'Master System Prompt' for your preferred coding style.",
                "Store complex regex patterns or API wrappers as snippets for quick access."
            ]
        },
        {
            id: "design-system",
            title: "Design System Explorer",
            description: "Visual overview of your project's UI tokens. Colors, Fonts, and Components.",
            longDescription: "Consistency is key. The Design System Explorer analyzes your CSS/Tailwind configuration to present a live style guide of your project's colors, typography, and core components.",
            icon: Palette,
            badge: "FREE",
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            btnColor: "bg-rose-600 hover:bg-rose-700",
            actionLink: "/dashboard",
            benefits: [
                "Auto-detected Color Palette",
                "Typography scale visualization",
                "Ensure brand consistency"
            ],
            useCases: [
                "Checking if you are using the correct shade of 'primary-blue'.",
                "Onboarding a designer to the project's existing constraints.",
                "Auditing for accessibility contrast issues."
            ],
            tips: [
                "It works best with TailwindCSS projects.",
                "Check the 'Overview' tab to see the Design System card."
            ]
        },
        {
            id: "report-export",
            title: "Report Export",
            description: "Generate professional PDF reports of your stack analysis. Perfect for client handoffs.",
            longDescription: "Impress clients and stakeholders with professional, branded documentation of your technology stack. Generate PDFs that detail every dependency, version, and security status.",
            icon: Share2,
            badge: "PRO",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            btnColor: "bg-emerald-600 hover:bg-emerald-700",
            actionLink: "/dashboard",
            benefits: [
                "Professional PDF formatting ready for presentation",
                "Ideal for agency client handoffs",
                "Keep a paper trail of stack decisions"
            ],
            useCases: [
                "Sending a 'Technical Audit' PDF to a potential client.",
                "Archiving the state of the stack at the end of a sprint (v1.0.0).",
                "Providing documentation for a due dilligence process."
            ],
            tips: [
                "Attach these reports to your invoices as a value-add for clients.",
                "Use them for internal compliance audits."
            ]
        },
        {
            id: "stack-analysis",
            title: "Stack Analysis",
            description: "Deep dive into your technology choices. AI-powered insights on compatibility.",
            longDescription: "Make informed architectural decisions. Our AI analyzes your combination of technologies to suggest optimizations, compatibility fixes, and modern alternatives.",
            icon: Laptop,
            badge: "FREE",
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
            btnColor: "bg-cyan-600 hover:bg-cyan-700",
            actionLink: "/dashboard",
            benefits: [
                "Identify conflicting dependencies",
                "Discover new tools that work well with your stack",
                "Plan upgrades with confidence"
            ],
            useCases: [
                "Evaluating if 'Next.js 14' is compatible with your current 'Auth' library.",
                "Finding a modern replacement for 'moment.js'.",
                "Understanding why your build is so slow (dependency bloat)."
            ],
            tips: [
                "Run an analysis before adding a major new library to your project.",
                "Use the 'Alternatives' suggestions to modernize legacy codebases."
            ]
        },
        {
            id: "project-insight",
            title: "Project Insight",
            description: "Generate a comprehensive 'Deep Dive' report (The Bible) for your project using Gemini 2.0.",
            longDescription: "Project Insight is the ultimate documentation tool. It reads your entire file tree and critical documents to write a Senior Architect-level report including Executive Summary, Architecture Map, and Improvement Opportunities.",
            icon: Sparkles,
            badge: "PRO",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            btnColor: "bg-indigo-600 hover:bg-indigo-700",
            actionLink: "/dashboard/projects",
            actionLabel: "Generate Insight",
            benefits: [
                "Instant \"ReadMe\" on steroids for new developers",
                "Uncover architectural flaws and technical debt",
                "Shareable report for stakeholders/investors"
            ],
            useCases: [
                "Generating a 'Current State' report for a legacy project you just inherited.",
                "Creating an 'Architecture Document' for compliance.",
                "Summarizing the entire project for a new CTO."
            ],
            tips: [
                "Insights are perfect for summarizing a project before a big refactor.",
                "Reports are persisted, so you can look back at how your project evolved."
            ]
        },
        {
            id: "onboarding",
            title: "Onboarding Protocols",
            description: "Automatically generate a 'Getting Started' guide (README) for any project.",
            longDescription: "New to a codebase? Forgot how to start your own project? VibeOnboard analyzes your package.json, environment variables, and structure to write a perfect setup guide.",
            icon: MapIcon,
            badge: "PRO",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            btnColor: "bg-emerald-600 hover:bg-emerald-700",
            actionLink: "/dashboard/projects",
            actionLabel: "Create Protocol",
            benefits: [
                " Instant setup instructions for new team members",
                "Detects required API keys and env vars",
                "Standardizes documentation across projects"
            ],
            useCases: [
                "Creating a foolproof 'Setup Guide' for Junior Developers.",
                "Standardizing the onboarding process across 10 microservices.",
                "Rapidly spinning up a dev environment for a project you haven't touched in 6 months."
            ],
            tips: [
                "Use this when handing off a project to a client.",
                "Great for refreshing your memory on old archived projects."
            ]
        },
        {
            id: "n8n-integration",
            title: "n8n Workflow Brain",
            description: "Solve 'Credential Amnesia'. Import workflows and let AI detect missing API keys.",
            longDescription: "n8n workflows are complex graphs that depend on specific credentials. StackMemory parses your exported JSON files to identify every service used (Stripe, Postgres, OpenAI) and cross-references them with your Project Secrets. No more broken workflows due to missing keys.",
            icon: Network, // Reusing Network icon or import Workflow icon
            badge: "NEW",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            btnColor: "bg-orange-600 hover:bg-orange-700",
            actionLink: "/dashboard",
            benefits: [
                "Auto-detect Required Credentials",
                "Visualize Node Infrastructure",
                "Prevent runtime errors in production"
            ],
            useCases: [
                "Importing a complex 'User Onboarding' workflow to see all 5 APIs it touches.",
                "Onboarding a team member: 'Here is the workflow, and here represent the secrets you need'.",
                "Auditing which workflows depend on a specific API key (e.g., 'OpenAI Key')."
            ],
            tips: [
                "Export your workflow from n8n editor as JSON.",
                "Upload it in the 'Workflows' tab of your project."
            ]
        }
    ];

    return (
        <>
            <div className="max-w-6xl mx-auto pb-20">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/20">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Knowledge Base</h1>
                            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                                Discover everything you can do with StackMemory.
                            </p>
                        </div>
                    </div>

                    {/* Pro Upsell Banner */}
                    <div className="p-6 rounded-3xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-full">
                                <Gift className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-900 dark:text-white">Unlock Full Potential</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Pro users get access to GitHub Sync, the Global Vault, and advanced exports.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/billing"
                            className="px-6 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            View Plans
                        </Link>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {guides.map((guide) => (
                        <button
                            key={guide.id}
                            onClick={() => setSelectedArticle(guide)}
                            className="group relative p-6 rounded-[2rem] bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10 transition-all shadow-sm hover:shadow-md text-left"
                        >
                            <motion.div layoutId={`card-${guide.id}`} className="h-full flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", guide.bg)}>
                                        <guide.icon className={cn("w-6 h-6", guide.color)} />
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border",
                                        guide.badge === 'PRO'
                                            ? "bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-200 dark:border-violet-500/20"
                                            : "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-300 border-green-200 dark:border-green-500/20"
                                    )}>
                                        {guide.badge}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                    {guide.title}
                                </h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6 flex-grow">
                                    {guide.description}
                                </p>

                                <span className="inline-flex items-center text-sm font-medium text-neutral-900 dark:text-white hover:underline decoration-neutral-400 underline-offset-4 mt-auto">
                                    Read Guide →
                                </span>
                            </motion.div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Article Modal */}
            <AnimatePresence>
                {selectedArticle && (
                    <GuideArticleView
                        article={selectedArticle}
                        onClose={() => setSelectedArticle(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
