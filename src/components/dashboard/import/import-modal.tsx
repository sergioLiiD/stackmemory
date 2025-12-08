"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "../dashboard-context";
import { X, Scan, CheckCircle2, AlertCircle, Loader2, PenTool, Type, Wand2, Github } from "lucide-react";
import { parsePackageJson, ParsedStack } from "@/lib/parser/package-json";
import { SmartImportHelper } from "./smart-import-helper";
import { Project, StackItem } from "@/data/mock";
import { cn } from "@/lib/utils";

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: Project) => void;
}

type Tab = 'magic' | 'manual';

export function ImportModal({ isOpen, onClose, onSave }: ImportModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>('magic');

    // Magic State
    const [input, setInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ParsedStack | null>(null);
    const [error, setError] = useState("");
    const [repoUrl, setRepoUrl] = useState("");

    // Manual State
    const [manualName, setManualName] = useState("");
    const [manualDesc, setManualDesc] = useState("");
    const [manualStack, setManualStack] = useState("");

    const handleAnalyze = () => {
        setError("");
        setIsAnalyzing(true);
        setResult(null);

        setTimeout(() => {
            const parsed = parsePackageJson(input);
            setIsAnalyzing(false);

            if (parsed) {
                setResult(parsed);
            } else {
                setError("Invalid JSON. Please Check your input.");
            }
        }, 1500);
    };

    const handleUrlAnalyze = async () => {
        setError("");
        setIsAnalyzing(true);
        setResult(null);

        // Simulation for prototype: 
        // In a real app, we would fetch https://raw.githubusercontent.com/.../package.json
        // For this demo, we will simulate a "Mock Success" to avoid CORS/404 issues with private/random repos.

        setTimeout(() => {
            setIsAnalyzing(false);

            // Mock Result based on URL
            const repoName = repoUrl.split('/').pop() || "imported-project";

            setResult({
                name: repoName,
                description: `Imported from ${repoUrl}`,
                stack: ["React", "TypeScript", "TailwindCSS", "Next.js", "Vercel"] // Generic modern stack
            });
        }, 2000);
    };

    const handleMagicConfirm = () => {
        if (result) {
            const stackItems: StackItem[] = result.stack.map(tech => ({
                name: tech,
                type: 'other' // Default type, user can edit later
            }));

            saveProject({
                name: result.name,
                description: result.description || "",
                stack: stackItems,
                status: "active"
            });
        }
    };

    const handleManualConfirm = () => {
        if (!manualName) return;

        const stackItems: StackItem[] = manualStack.split(',')
            .map(s => s.trim())
            .filter(Boolean)
            .map(tech => ({
                name: tech,
                type: 'other'
            }));

        saveProject({
            name: manualName,
            description: manualDesc,
            stack: stackItems,
            status: "planning"
        });
    };

    const saveProject = (data: Partial<Project>) => {
        const newProject: Project = {
            id: Math.random().toString(36).substr(2, 9),
            name: data.name || "Untitled",
            description: data.description || "",
            status: (data.status as any) || "planning",
            stack: data.stack || [],
            lastUpdated: "Just now",
            health: 100
        };
        onSave(newProject);
        handleClose();
    };

    const handleClose = () => {
        onClose();
        // Reset all
        setInput("");
        setResult(null);
        setManualName("");
        setManualDesc("");
        setManualStack("");
        setActiveTab('magic');
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
                        onClick={handleClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#0a0a0a] border border-[#180260]/50 rounded-2xl overflow-hidden shadow-2xl shadow-[#180260]/20"
                    >
                        {/* Header */}
                        <div className="px-6 pt-6 pb-2 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Scan className="w-5 h-5 text-[#a78bfa]" /> New Project
                                </h2>
                                <p className="text-neutral-400 text-sm mt-1">Add a new project to your Vault.</p>
                            </div>
                            <button onClick={handleClose} className="text-neutral-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="px-6 flex gap-4 border-b border-white/10 mt-4">
                            <button
                                onClick={() => setActiveTab('magic')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative",
                                    activeTab === 'magic' ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                                )}
                            >
                                Magic Import
                                {activeTab === 'magic' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a78bfa]" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('manual')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative",
                                    activeTab === 'manual' ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                                )}
                            >
                                Manual Entry
                                {activeTab === 'manual' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a78bfa]" />}
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {activeTab === 'magic' ? (
                                <>
                                    {!result ? (
                                        <div className="space-y-4">
                                            {/* Step 1: Instructions / Prompt */}
                                            <SmartImportHelper />

                                            {/* Separation Divider */}
                                            <div className="flex items-center gap-4 py-2">
                                                <div className="h-px bg-white/10 flex-1" />
                                                <span className="text-xs text-neutral-500 font-medium uppercase tracking-widest">OR</span>
                                                <div className="h-px bg-white/10 flex-1" />
                                            </div>

                                            {/* Step 2: Auto-Scan from URL */}
                                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                                                <label className="text-sm font-medium text-white flex items-center gap-2">
                                                    <Github className="w-4 h-4" />
                                                    Scan Repository
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        placeholder="https://github.com/username/project"
                                                        className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-sm text-neutral-300 focus:outline-none focus:border-[#a78bfa] transition-colors"
                                                        value={repoUrl}
                                                        onChange={(e) => setRepoUrl(e.target.value)}
                                                    />
                                                    <button
                                                        onClick={handleUrlAnalyze}
                                                        disabled={!repoUrl.trim() || isAnalyzing}
                                                        className="bg-[#2D2B52] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#a78bfa] hover:text-[#180260] transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
                                                    >
                                                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                                                        Scan Repo
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Step 3: Manual Paste Area */}
                                            <div className="space-y-2 pt-2">
                                                <label className="text-sm font-medium text-white flex items-center justify-between">
                                                    <span>Paste Content Manually</span>
                                                    <span className="text-xs text-neutral-500 font-normal">Accepts package.json or DEV_MEMORY.md</span>
                                                </label>
                                                <div className="relative">
                                                    <textarea
                                                        placeholder="{ 'name': 'my-app', ... } or # My Project ..."
                                                        className="w-full h-32 bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-sm font-mono text-neutral-300 focus:outline-none focus:border-[#a78bfa] transition-colors resize-none shadow-inner"
                                                        value={input}
                                                        onChange={(e) => setInput(e.target.value)}
                                                    />
                                                    {/* Visual hint if empty */}
                                                    {!input && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                                            <Type className="w-12 h-12 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <button
                                                    onClick={handleAnalyze}
                                                    disabled={!input.trim()}
                                                    className="bg-[#180260] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#2e1065] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-[#a78bfa]/20 shadow-lg shadow-indigo-500/10"
                                                >
                                                    <Wand2 className="w-4 h-4 text-[#a78bfa]" />
                                                    Process text
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 text-green-400 bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                                                <CheckCircle2 className="w-6 h-6" />
                                                <div>
                                                    <h3 className="font-bold">Stack Detected</h3>
                                                    <p className="text-xs opacity-80">Ready to import <strong>{result.name}</strong></p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Technologies</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.stack.map(tech => (
                                                        <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4">
                                                <button onClick={() => setResult(null)} className="px-4 py-2 text-neutral-400 hover:text-white transition-colors">
                                                    Back
                                                </button>
                                                <button onClick={handleMagicConfirm} className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:scale-105 transition-transform">
                                                    Import Project
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-neutral-400">Project Name</label>
                                        <input
                                            value={manualName}
                                            onChange={(e) => setManualName(e.target.value)}
                                            className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#a78bfa]"
                                            placeholder="e.g. Corporate Website"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-neutral-400">Description</label>
                                        <input
                                            value={manualDesc}
                                            onChange={(e) => setManualDesc(e.target.value)}
                                            className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#a78bfa]"
                                            placeholder="Short description of the project"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-neutral-400">Tech Stack <span className="text-neutral-600">(Comma separated)</span></label>
                                        <input
                                            value={manualStack}
                                            onChange={(e) => setManualStack(e.target.value)}
                                            className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#a78bfa]"
                                            placeholder="Next.js, Tailwind, Supabase..."
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            onClick={handleManualConfirm}
                                            disabled={!manualName}
                                            className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Create Project
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
