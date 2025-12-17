"use client";

import { useState } from "react";
import { Project, Snippet } from "@/data/mock";
import { Terminal, Copy, Plus, X, Wand2, Trash2, HelpCircle } from "lucide-react";
import { useDashboard } from "../../dashboard-context";
import { supabase } from "@/lib/supabase";

export function ProjectCommandsCard({ project }: { project: Project }) {
    const { updateProject } = useDashboard();
    const [isAdding, setIsAdding] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [newCmd, setNewCmd] = useState({ title: "", code: "", description: "" });

    // Persistent storage helper
    const saveSnippets = async (newSnippets: Snippet[]) => {
        updateProject(project.id, { snippets: newSnippets });
        if (supabase) {
            await supabase.from('projects').update({ snippets: newSnippets }).eq('id', project.id);
        }
    };

    const handleAdd = () => {
        if (!newCmd.title || !newCmd.code) return;
        const snippet: Snippet = {
            id: crypto.randomUUID(),
            title: newCmd.title,
            code: newCmd.code,
            language: 'bash',
            description: newCmd.description
        };
        saveSnippets([...(project.snippets || []), snippet]);
        setNewCmd({ title: "", code: "", description: "" });
        setIsAdding(false);
    };

    const handleDelete = (id: string) => {
        if (confirm("Delete this command?")) {
            saveSnippets((project.snippets || []).filter(s => s.id !== id));
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };

    // Auto-suggestions based on stack
    const suggestions = [
        {
            check: (p: Project) => p.stack.some(s => s.name.toLowerCase().includes('docker')),
            title: "Docker Up",
            code: "docker-compose up -d",
            desc: "Start services in background"
        },
        {
            check: (p: Project) => p.stack.some(s => s.name.toLowerCase().includes('next')),
            title: "Dev Server",
            code: "npm run dev",
            desc: "Start Next.js dev server"
        },
        {
            check: (p: Project) => p.stack.some(s => s.name.toLowerCase().includes('prisma')),
            title: "Prisma Studio",
            code: "npx prisma studio",
            desc: "Open database GUI"
        },
        {
            check: (p: Project) => p.stack.some(s => s.name.toLowerCase().includes('supabase')),
            title: "Supabase Start",
            code: "npx supabase start",
            desc: "Start local Supabase"
        }
    ].filter(s => s.check(project));

    return (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/10 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-green-500" /> Command Zone
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-neutral-500 hover:text-white"
                        title="How to automate this?"
                    >
                        <HelpCircle className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                    >
                        {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* CLI Help Box */}
            {showHelp && (
                <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs">
                    <div className="flex items-start gap-3">
                        <Terminal className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
                        <div>
                            <p className="font-bold mb-1 text-blue-400">Automate this with CLI</p>
                            <p className="opacity-80 mb-2">
                                Run the watcher in your project root to auto-sync <code>package.json</code>.
                            </p>
                            <div className="bg-black/30 rounded px-2 py-1.5 font-mono text-white inline-block border border-white/5 select-all">
                                npx stackmemory --project {project.id}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-white/5">
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                        <Wand2 className="w-3 h-3" /> Smart Suggestions
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setNewCmd({ title: s.title, code: s.code, description: s.desc });
                                    setIsAdding(true);
                                }}
                                className="text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs transition-colors flex flex-col gap-1"
                            >
                                <span className="font-bold text-neutral-300">{s.title}</span>
                                <span className="font-mono text-[10px] text-neutral-500 truncate w-full">{s.code}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Form */}
            {isAdding && (
                <div className="mb-6 p-4 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/5 space-y-3">
                    <input
                        value={newCmd.title}
                        onChange={(e) => setNewCmd(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Title (e.g. Build Prod)"
                        className="w-full bg-transparent border-b border-white/10 px-0 py-1 text-sm focus:outline-none focus:border-green-500"
                        autoFocus
                    />
                    <div className="flex gap-2 bg-black/30 p-2 rounded-lg border border-white/5 font-mono text-xs">
                        <span className="text-green-500">$</span>
                        <input
                            value={newCmd.code}
                            onChange={(e) => setNewCmd(prev => ({ ...prev, code: e.target.value }))}
                            placeholder="npm run build"
                            className="w-full bg-transparent focus:outline-none text-white"
                        />
                    </div>
                    <input
                        value={newCmd.description}
                        onChange={(e) => setNewCmd(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description (optional)"
                        className="w-full bg-transparent border-b border-white/10 px-0 py-1 text-xs text-neutral-500 focus:outline-none focus:border-green-500"
                    />
                    <button
                        onClick={handleAdd}
                        className="w-full py-2 bg-green-500 text-black font-bold rounded-lg text-xs hover:bg-green-400 transition-colors"
                    >
                        Save Command
                    </button>
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {project.snippets?.map((snippet) => (
                    <div key={snippet.id} className="group relative p-3 rounded-xl bg-neutral-900 border border-white/10 font-mono text-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-neutral-400">{snippet.title}</span>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => copyToClipboard(snippet.code)}
                                    className="p-1 hover:text-white text-neutral-500 transition-colors"
                                    title="Copy"
                                >
                                    <Copy className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => handleDelete(snippet.id)}
                                    className="p-1 hover:text-red-400 text-neutral-500 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 text-green-400 break-all">
                            <span className="select-none opacity-50">$</span>
                            {snippet.code}
                        </div>
                        {snippet.description && (
                            <div className="mt-2 text-[10px] text-neutral-600 border-t border-white/5 pt-1.5">
                                {snippet.description}
                            </div>
                        )}
                    </div>
                ))}
                {!project.snippets?.length && !isAdding && (
                    <div className="text-center py-8 text-neutral-600 text-sm border border-dashed border-white/10 rounded-xl">
                        No commands saved yet.
                    </div>
                )}
            </div>
        </div>
    );
}
