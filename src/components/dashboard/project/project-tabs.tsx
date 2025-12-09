"use client";

import { cn } from "@/lib/utils";
import { Layout, Box, Terminal, Book, Code2, Sparkles, Waves } from "lucide-react";
import { motion } from "framer-motion";

export type TabId = 'overview' | 'stack' | 'prompts' | 'journal' | 'snippets' | 'assistant';

interface ProjectTabsProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
    const tabs: { id: TabId; label: string; icon: any }[] = [
        { id: 'overview', label: 'Overview', icon: Layout },
        { id: 'stack', label: 'Stack', icon: Box },
        { id: 'prompts', label: 'Context Weaver', icon: Waves }, // Renamed from Prompt Vault
        { id: 'journal', label: 'Journal', icon: Book },
        { id: 'snippets', label: 'Snippets', icon: Code2 },
        { id: 'assistant', label: 'Vibe Coder', icon: Sparkles },
    ];

    return (
        <div className="flex items-center gap-1 p-1 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 mb-8 w-fit">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id as TabId)}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all relative",
                        activeTab === tab.id
                            ? "text-neutral-900 dark:text-white bg-white dark:bg-white/10 shadow-sm dark:shadow-none"
                            : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                    )}
                >
                    <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-indigo-600 dark:text-[#a78bfa]" : "opacity-70")} />
                    {tab.label}
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="active-tab"
                            className="absolute inset-0 rounded-full bg-transparent border border-neutral-200 dark:border-white/10"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
}
