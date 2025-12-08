"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, BrainCircuit, Sparkles, Layers, FileText, Terminal } from "lucide-react";
import { Project } from "@/data/mock";
import { cn } from "@/lib/utils";

interface ContextWeaverModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
}

export function ContextWeaverModal({ isOpen, onClose, project }: ContextWeaverModalProps) {
    const [selectedSections, setSelectedSections] = useState({
        stack: true,
        metadata: true,
        prompts: true,
        rules: false, // Default off until we have real rules
    });
    const [generatedContext, setGeneratedContext] = useState("");
    const [copied, setCopied] = useState(false);

    // Generate context whenever selection or project changes
    useEffect(() => {
        if (!isOpen) return;

        const parts = [];

        // 1. Metadata
        if (selectedSections.metadata) {
            parts.push(`PROJECT CONTEXT:\nName: ${project.name}\nDescription: ${project.description}\nStatus: ${project.status}`);
        }

        // 2. Stack
        if (selectedSections.stack && project.stack.length > 0) {
            const stackList = project.stack.map(s => `- ${s.name} (${s.type}${s.version ? `, v${s.version}` : ''})`).join('\n');
            parts.push(`TECH STACK:\n${stackList}`);
        }

        // 3. Vault Prompts (Simulated "Active Prompts" for now, using the first 2 from mock if available)
        if (selectedSections.prompts && project.prompts && project.prompts.length > 0) {
            const prompts = project.prompts.map(p => `### ${p.title}\n${p.prompt}`).join('\n\n');
            parts.push(`ACTIVE SYSTEM PROMPTS:\n${prompts}`);
        }

        // 4. Custom instruction wrapper
        const wrapper = `You are an expert developer working on the project described above. 
Please strictly adhere to the Tech Stack and System Prompts provided.
Refuse to use libraries not listed in the stack unless explicitly asked.`;

        setGeneratedContext(`${parts.join('\n\n')}\n\n---\n${wrapper}`);

    }, [isOpen, selectedSections, project]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContext);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleSection = (key: keyof typeof selectedSections) => {
        setSelectedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-3xl flex flex-col bg-[#0a0a0a] border border-[#180260]/50 rounded-3xl overflow-hidden shadow-2xl shadow-[#180260]/20 max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="px-8 pt-8 pb-4 flex justify-between items-start bg-gradient-to-b from-[#180260]/20 to-transparent">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <BrainCircuit className="w-8 h-8 text-[#A78BFA]" />
                                    Context Weaver
                                </h2>
                                <p className="text-neutral-400 mt-2">
                                    Generate a "Context Payload" for ChatGPT/Claude to prevent hallucinations.
                                </p>
                            </div>
                            <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Left Panel: Configuration */}
                            <div className="w-1/3 border-r border-white/10 p-6 space-y-6 overflow-y-auto">
                                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">Include Data</h3>

                                <button
                                    onClick={() => toggleSection('metadata')}
                                    className={cn("w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                        selectedSections.metadata ? "bg-[#180260]/30 border-[#A78BFA] text-white" : "bg-white/5 border-transparent text-neutral-400 hover:bg-white/10"
                                    )}
                                >
                                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center border", selectedSections.metadata ? "bg-[#A78BFA] border-[#A78BFA]" : "border-neutral-500")}>
                                        {selectedSections.metadata && <Check className="w-3 h-3 text-black" />}
                                    </div>
                                    <span className="font-medium">Project Metadata</span>
                                </button>

                                <button
                                    onClick={() => toggleSection('stack')}
                                    className={cn("w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                        selectedSections.stack ? "bg-[#180260]/30 border-[#A78BFA] text-white" : "bg-white/5 border-transparent text-neutral-400 hover:bg-white/10"
                                    )}
                                >
                                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center border", selectedSections.stack ? "bg-[#A78BFA] border-[#A78BFA]" : "border-neutral-500")}>
                                        {selectedSections.stack && <Check className="w-3 h-3 text-black" />}
                                    </div>
                                    <span className="font-medium">Tech Stack</span>
                                </button>

                                <button
                                    onClick={() => toggleSection('prompts')}
                                    className={cn("w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                        selectedSections.prompts ? "bg-[#180260]/30 border-[#A78BFA] text-white" : "bg-white/5 border-transparent text-neutral-400 hover:bg-white/10"
                                    )}
                                >
                                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center border", selectedSections.prompts ? "bg-[#A78BFA] border-[#A78BFA]" : "border-neutral-500")}>
                                        {selectedSections.prompts && <Check className="w-3 h-3 text-black" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">Active Prompts</span>
                                        <span className="text-[10px] opacity-60">{project.prompts?.length || 0} prompts found</span>
                                    </div>
                                </button>

                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <div className="bg-[#A78BFA]/10 rounded-xl p-4 border border-[#A78BFA]/20">
                                        <h4 className="flex items-center gap-2 text-[#A78BFA] font-bold text-sm mb-2">
                                            <Sparkles className="w-4 h-4" /> Pro Tip
                                        </h4>
                                        <p className="text-xs text-neutral-400">
                                            Paste this payload at the <strong>start</strong> of every new AI chat session to ensure perfect context retention.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Preview */}
                            <div className="flex-1 bg-black/20 p-6 flex flex-col min-h-0">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Context Payload Preview</h3>
                                    <span className="text-xs text-neutral-500 font-mono">{generatedContext.length} chars</span>
                                </div>

                                <div className="flex-1 relative rounded-xl overflow-hidden border border-white/10 bg-[#050505]">
                                    <textarea
                                        readOnly
                                        value={generatedContext}
                                        className="w-full h-full p-4 bg-transparent text-sm font-mono text-neutral-300 resize-none focus:outline-none custom-scrollbar"
                                    />
                                    {/* Action Bar */}
                                    <div className="absolute bottom-4 right-4 flex gap-3">
                                        <button
                                            onClick={handleCopy}
                                            className="flex items-center gap-2 px-6 py-3 bg-[#A78BFA] hover:bg-white text-[#180260] font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                        >
                                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                            {copied ? "Copied to Clipboard!" : "Copy Context Payload"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
