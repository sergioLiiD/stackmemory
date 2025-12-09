"use client";

import { useState, useEffect } from "react";
import { Project, TopPrompt } from "@/data/mock";
import { Terminal, Waves, Copy, Check, Info, Plus } from "lucide-react";
import { PromptList } from "../../vault/prompt-list";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

// Simple Modal Component for Adding Prompt
function AddPromptModal({ isOpen, onClose, onSave, isLoading }: { isOpen: boolean, onClose: () => void, onSave: (p: any) => void, isLoading: boolean }) {
    const [title, setTitle] = useState("");
    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState("GPT-4o");

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Save to Vault</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-neutral-400 block mb-1">Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500/50"
                            placeholder="My Helper Prompt"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-neutral-400 block mb-1">Prompt Content</label>
                        <textarea
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            className="w-full h-40 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500/50 resize-none font-mono text-xs"
                            placeholder="Act as a senior engineer..."
                        />
                    </div>
                    <div>
                        <label className="text-xs text-neutral-400 block mb-1">Model Tag</label>
                        <input
                            value={model}
                            onChange={e => setModel(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white transition-colors">Cancel</button>
                    <button
                        onClick={() => onSave({ title, prompt, model })}
                        disabled={!title || !prompt || isLoading}
                        className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50"
                    >
                        {isLoading ? "Saving..." : "Save Prompt"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export function PromptVaultTab({ project }: { project: Project }) {
    const [manualContext, setManualContext] = useState("");
    const [generatedWave, setGeneratedWave] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Prompts State
    const [prompts, setPrompts] = useState<TopPrompt[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchPrompts();
    }, [project.id]);

    const fetchPrompts = async () => {
        try {
            const res = await fetch(`/api/projects/${project.id}/prompts`);
            const data = await res.json();
            if (data.prompts) setPrompts(data.prompts);
        } catch (e) {
            console.error("Failed to fetch prompts", e);
        }
    };

    const handleSavePrompt = async (newPrompt: any) => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/projects/${project.id}/prompts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPrompt)
            });
            if (res.ok) {
                await fetchPrompts();
                setIsAddOpen(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/context/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project.id, manualContext })
            });
            const data = await res.json();
            if (data.prompt) {
                setGeneratedWave(data.prompt);
            }
        } catch (e) {
            console.error("Failed to generate wave", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedWave);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                    <Waves className="w-6 h-6 text-cyan-400" /> Context Weaver
                    <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">BETA</span>
                </h3>
                <p className="text-sm text-neutral-400">
                    Generate a "Mega-Prompt" (The Wave) that bundles your project structure, tech stack, and documentation.
                    Paste this into Claude 3.5 Sonnet or GPT-4o to get instant, context-aware help.
                </p>
            </div>

            {/* Generator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Input */}
                <div className="bg-[#121212] rounded-2xl border border-white/10 p-6 flex flex-col h-[500px]">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                        1. Functional Context
                        <span className="text-[10px] text-neutral-500 font-normal">What are you trying to do?</span>
                    </h4>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4 flex gap-3 text-xs text-blue-300">
                        <Info className="w-4 h-4 shrink-0" />
                        <div>
                            We will automatically fetch and append:
                            <ul className="list-disc pl-4 mt-1 opacity-80">
                                <li><b>README.md</b> from your repo</li>
                                <li><b>package.json</b> (Stack & Versions)</li>
                                <li><b>File Tree</b> (Architecture)</li>
                            </ul>
                        </div>
                    </div>

                    <textarea
                        value={manualContext}
                        onChange={(e) => setManualContext(e.target.value)}
                        placeholder="e.g. I want to build a blog section using Contentlayer. It should have a dark mode toggle and use the existing 'Card' component..."
                        className="flex-1 w-full bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-white resize-none focus:outline-none focus:border-cyan-500/50 transition-colors mb-4 custom-scrollbar"
                    />

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20"
                    >
                        {isLoading ? (
                            <Waves className="w-5 h-5 animate-pulse" />
                        ) : (
                            <Waves className="w-5 h-5" />
                        )}
                        {isLoading ? "Weaving Context..." : "Generate Wave"}
                    </button>
                </div>

                {/* Right: Output */}
                <div className="bg-[#121212] rounded-2xl border border-white/10 p-6 flex flex-col h-[500px] relative group">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                        2. The Wave
                        {generatedWave && (
                            <button
                                onClick={() => {
                                    setIsAddOpen(true);
                                    // Pre-fill prompt if we have context
                                    // Or just open blank? The user wanted to save THEIR prompts, maybe the generated one too.
                                    // Let's assume they want to save manually crafted prompts or the result.
                                    // For now just open blank modal.
                                }}
                                className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                            >
                                Save as Prompt
                            </button>
                        )}
                    </h4>

                    {generatedWave ? (
                        <>
                            <div className="absolute top-4 right-4 z-10 flex gap-2">
                                <button
                                    onClick={handleCopy}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg",
                                        copied
                                            ? "bg-green-500 text-white shadow-green-900/20"
                                            : "bg-white text-black hover:bg-neutral-200"
                                    )}
                                >
                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copied ? "Copied!" : "Copy Context"}
                                </button>
                            </div>
                            <textarea
                                readOnly
                                value={generatedWave}
                                className="flex-1 w-full bg-black/50 border border-white/5 rounded-xl p-4 text-[10px] font-mono text-neutral-400 resize-none focus:outline-none custom-scrollbar"
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 border-2 border-dashed border-white/5 rounded-xl">
                            <Waves className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm">Context will appear here</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Legacy Vault (Saved Prompts) */}
            <div className="pt-8 border-t border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                            <Terminal className="w-5 h-5 text-pink-400" /> Saved Prompts
                        </h3>
                        <p className="text-sm text-neutral-500">Your manually saved snippets.</p>
                    </div>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="text-xs bg-[#180260] text-white px-4 py-2 rounded-full hover:bg-[#2a04a3] transition-colors shadow-lg shadow-[#180260]/20 font-medium font-medium flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" /> Add Prompt
                    </button>
                </div>
                {/* Render fetched prompts or fall back to mock project prompts if empty/loading (optional, but better to just show fetched) */}
                <PromptList prompts={prompts.length > 0 ? prompts : project.prompts} />
            </div>

            <AddPromptModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSave={handleSavePrompt}
                isLoading={isSaving}
            />
        </div>
    );
}
