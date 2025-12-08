"use client";

import { cn } from "@/lib/utils";
import { Layout, Box, Terminal, Book, Code2 } from "lucide-react";

export type TabId = 'overview' | 'stack' | 'prompts' | 'journal' | 'snippets';

interface ProjectTabsProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
    const tabs: { id: TabId; label: string; icon: any }[] = [
        { id: 'overview', label: 'Overview', icon: Layout },
        { id: 'stack', label: 'Stack', icon: Box },
        { id: 'prompts', label: 'Prompt Vault', icon: Terminal },
        { id: 'journal', label: 'Journal', icon: Book },
        { id: 'snippets', label: 'Snippets', icon: Code2 },
    ];

    return (
        <div className="flex items-center gap-1 bg-[#121212] border border-white/5 rounded-xl p-1 mb-8 w-fit">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            isActive
                                ? "bg-[#180260] text-white shadow-lg shadow-[#180260]/20"
                                : "text-neutral-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
