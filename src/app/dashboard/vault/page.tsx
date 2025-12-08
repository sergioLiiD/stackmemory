"use client";

import { useState } from "react";
import { Layers, Terminal, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockGlobalPrompts, mockGlobalSnippets } from "@/data/mock";
import { PromptList } from "@/components/dashboard/vault/prompt-list";
import { SnippetList } from "@/components/dashboard/vault/snippet-list";

type VaultTab = 'prompts' | 'snippets';

export default function VaultPage() {
    const [activeTab, setActiveTab] = useState<VaultTab>('prompts');

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#180260] flex items-center justify-center text-white shadow-lg shadow-[#180260]/20">
                        <Layers className="w-5 h-5" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Global Vault</h1>
                </div>
                <p className="text-neutral-400 max-w-2xl">
                    Your central repository for reusable knowledge. Store system prompts and code snippets that you use across multiple projects.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-[#121212] border border-white/5 rounded-xl p-1 mb-8 w-fit">
                <button
                    onClick={() => setActiveTab('prompts')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'prompts'
                            ? "bg-[#180260] text-white shadow-lg shadow-[#180260]/20"
                            : "text-neutral-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Terminal className="w-4 h-4" />
                    Global Prompts
                </button>
                <button
                    onClick={() => setActiveTab('snippets')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'snippets'
                            ? "bg-[#180260] text-white shadow-lg shadow-[#180260]/20"
                            : "text-neutral-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Code2 className="w-4 h-4" />
                    Global Snippets
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'prompts' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">System Prompts Library</h2>
                            <button className="text-xs bg-[#180260] text-white px-3 py-1.5 rounded-lg hover:bg-[#2a04a3] transition-colors shadow-lg shadow-[#180260]/20 font-medium">
                                + New Global Prompt
                            </button>
                        </div>
                        <PromptList prompts={mockGlobalPrompts} />
                    </div>
                )}

                {activeTab === 'snippets' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Code Snippet Library</h2>
                            <button className="text-xs bg-[#180260] text-white px-3 py-1.5 rounded-lg hover:bg-[#2a04a3] transition-colors shadow-lg shadow-[#180260]/20 font-medium">
                                + New Global Snippet
                            </button>
                        </div>
                        <SnippetList snippets={mockGlobalSnippets} />
                    </div>
                )}
            </div>
        </div>
    );
}
