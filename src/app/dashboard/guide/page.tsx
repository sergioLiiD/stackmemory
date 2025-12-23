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
    Terminal
} from "lucide-react";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GuideArticle, GuideArticleView } from "./article-view";

export default function GuidePage() {
    const [selectedArticle, setSelectedArticle] = useState<GuideArticle | null>(null);

    const guides: GuideArticle[] = [
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
            tips: [
                "Connect your GitHub account to enable auto-sync on push.",
                "For monorepos, you can select specific sub-directories to import separate projects."
            ]
        },
        {
            id: "cli-tool",
            title: "StackMemory CLI",
            description: "Sync your local projects directly from your terminal. Seamless integration for developers.",
            longDescription: "The CLI is the developer's bridge to StackMemory. It allows you to synchronize your local project stacks, detect dependencies, and update your dashboard without leaving your terminal.",
            icon: Terminal,
            badge: "FREE",
            color: "text-slate-500",
            bg: "bg-slate-500/10",
            btnColor: "bg-slate-800 hover:bg-slate-900",
            actionLink: "/dashboard",
            benefits: [
                "Instant sync from local environment",
                "Integrates with your existing workflow",
                "Supports CI/CD pipelines for automated docs"
            ],
            tips: [
                "Run `npx stackmemory init` in your project root to get started.",
                "Add `stackmemory sync` to your build script."
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
            tips: [
                "Check the dashboard weekly for new alerts.",
                "We highlight 'Critical' vulnerabilities in red so you can triage immediately."
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
            tips: [
                "Create a 'Master System Prompt' for your preferred coding style.",
                "Store complex regex patterns or API wrappers as snippets for quick access."
            ]
        },
        {
            id: "report-export",
            title: "Report Export",
            description: "Generate professional PDF reports of your stack analysis. Perfect for client handoffs or documentation.",
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
            tips: [
                "Attach these reports to your invoices as a value-add for clients.",
                "Use them for internal compliance audits."
            ]
        },
        {
            id: "stack-analysis",
            title: "Stack Analysis",
            description: "Deep dive into your technology choices. Get AI-powered insights on compatibility and upgrades.",
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
            tips: [
                "Run an analysis before adding a major new library to your project.",
                "Use the 'Alternatives' suggestions to modernize legacy codebases."
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
