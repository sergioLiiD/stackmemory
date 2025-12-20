"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "../dashboard-context";
import { X, Scan, CheckCircle2, AlertCircle, Loader2, PenTool, Type, Wand2, Github, Key, Search } from "lucide-react";
import { parsePackageJson, ParsedStack } from "@/lib/parser/package-json";
import { SmartImportHelper } from "./smart-import-helper";
import { Project, StackItem } from "@/data/mock";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-context";
import { getUserRepos, GitHubRepo } from "@/lib/github/client";

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: Project) => void;
}

type Tab = 'magic' | 'manual' | 'github';

export function ImportModal({ isOpen, onClose, onSave }: ImportModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>('magic');

    // Magic State
    const [input, setInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ParsedStack | null>(null);
    const [error, setError] = useState("");
    const [repoUrl, setRepoUrl] = useState("");
    const [githubToken, setGithubToken] = useState("");
    const [projectDetails, setProjectDetails] = useState<{ name: string, description: string }>({ name: "", description: "" });

    // Manual State
    const [manualName, setManualName] = useState("");
    const [manualDesc, setManualDesc] = useState("");
    const [manualStack, setManualStack] = useState("");

    // GitHub State
    const { session, signInWithGithub } = useAuth();
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);
    const [repoSearch, setRepoSearch] = useState("");

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

        try {
            // Clean URL to get raw content
            let rawUrl = repoUrl;
            let attemptedUrl = "";

            if (repoUrl.includes("github.com")) {
                try {
                    const url = new URL(repoUrl);
                    if (url.pathname.includes("/blob/")) {
                        rawUrl = repoUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
                    } else {
                        const pathParts = url.pathname.split('/').filter(Boolean);
                        if (pathParts.length >= 2) {
                            const user = pathParts[0];
                            const repo = pathParts[1];
                            rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/main/package.json`;
                        }
                    }
                } catch (e) {
                    console.error("Invalid URL format", e);
                }
            } else if (repoUrl.includes("raw.githubusercontent.com")) {
                rawUrl = repoUrl;
            }

            if (!rawUrl) {
                throw new Error("Invalid GitHub URL. Please use the format: https://github.com/user/repo");
            }

            // Use Proxy to bypass CORS and handle Auth safely
            const proxyFetch = async (targetUrl: string) => {
                const res = await fetch('/api/proxy/github', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: targetUrl, token: githubToken || session?.provider_token })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    // Propagate 404 specifically
                    if (res.status === 404) throw new Error("404");
                    throw new Error(errData.error || `Proxy error: ${res.status}`);
                }
                return res;
            };

            // 1. Fetch Repo Metadata using Proxy to get default_branch
            // We need to parse owner/repo from the URL again if it was a direct raw URL, but mainly we expect standard github URLs here
            let statsUrl = "";
            let owner = "";
            let repo = "";

            try {
                if (repoUrl.includes("github.com")) {
                    const urlObj = new URL(repoUrl);
                    const parts = urlObj.pathname.split('/').filter(Boolean);
                    if (parts.length >= 2) {
                        owner = parts[0];
                        repo = parts[1];
                        statsUrl = `https://api.github.com/repos/${owner}/${repo}`;
                    }
                }
            } catch (e) {
                console.error("Error parsing repo URL for metadata", e);
            }

            let defaultBranch = "main";
            if (statsUrl) {
                console.log("Fetching metadata from:", statsUrl);
                try {
                    const metaRes = await proxyFetch(statsUrl);
                    if (metaRes.ok) {
                        const meta = await metaRes.json();
                        if (meta.default_branch) {
                            defaultBranch = meta.default_branch;
                            console.log("Detected default branch:", defaultBranch);
                        }
                    }
                } catch (e) {
                    console.warn("Failed to fetch repo metadata, falling back to 'main'", e);
                }
            }

            // 2. Construct Raw URL with detected branch
            if (owner && repo) {
                attemptedUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/package.json`;
            } else {
                attemptedUrl = rawUrl; // Fallback if parsing failed
            }

            console.log("Attempting to fetch via proxy:", attemptedUrl);
            let res;
            try {
                res = await proxyFetch(attemptedUrl);
            } catch (e: any) {
                if (e.message === "404") res = { ok: false, status: 404 } as Response;
                else throw e;
            }

            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error(`Repository not found or private.\nAttempted: ${attemptedUrl}\n\nFor private repos, please provide a GitHub Token below or paste content manually.`);
                }
                throw new Error(`Failed to fetch package.json via proxy. (Status: ${res.status})`);
            }

            // The proxy returns the raw text of the file
            const text = await res.text();
            let parsed;
            try {
                parsed = parsePackageJson(text);
            } catch (e) {
                // If it returned JSON content type but we want to parse it safely
                // Sometimes proxy might return "Error" string if something leaked, but we handled errors above
                parsed = null;
            }

            if (parsed) {
                setResult({ ...parsed, repo: repoUrl });
                // Auto-fill details if not set
                if (!projectDetails.name) {
                    setProjectDetails(prev => ({
                        ...prev,
                        name: parsed?.name || prev.name || repoUrl.split('/').pop() || "New Project",
                        description: parsed?.description || prev.description || ""
                    }));
                }

                // setIsAnalyzed(true);

            } else {
                setError("Could not parse package.json from the provided URL.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleMagicConfirm = () => {
        if (result) {
            const stackItems: StackItem[] = result.stack.map(tech => ({
                name: tech.name,
                version: tech.version,
                type: 'other' // Default type, user can edit later
            }));

            saveProject({
                name: projectDetails.name || result.name,
                description: projectDetails.description || result.description || "",
                repoUrl: repoUrl || result.repo || "",
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
            repoUrl: data.repoUrl || "", // Persist repoUrl
            liveUrl: data.liveUrl || "",
            deployProvider: data.deployProvider || "",
            deployAccount: data.deployAccount || "",
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
        setRepos([]);
    };

    const loadRepos = async () => {
        if (!session?.provider_token) return;
        setIsLoadingRepos(true);
        try {
            const data = await getUserRepos(session.provider_token);
            setRepos(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingRepos(false);
        }
    };

    // Load repos when switching to GitHub activeTab
    useState(() => {
        if (activeTab === 'github' && session?.provider_token && repos.length === 0) {
            loadRepos();
        }
    });

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
                            <button
                                onClick={() => {
                                    setActiveTab('github');
                                    if (session?.provider_token) loadRepos();
                                }}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative flex items-center gap-2",
                                    activeTab === 'github' ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                                )}
                            >
                                <Github className="w-4 h-4" />
                                From GitHub
                                {activeTab === 'github' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a78bfa]" />}
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

                                            {error && (
                                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
                                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium">Error Scanning Repository</p>
                                                        <p className="text-xs opacity-90">{error}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 2: Auto-Scan from URL */}
                                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                                                <label className="text-sm font-medium text-white flex items-center gap-2">
                                                    <Github className="w-4 h-4" />
                                                    Scan Repository
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={repoUrl}
                                                        onChange={(e) => setRepoUrl(e.target.value)}
                                                        placeholder="https://github.com/facebook/react"
                                                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa] transition-colors"
                                                    />
                                                    <button
                                                        onClick={handleUrlAnalyze}
                                                        disabled={isAnalyzing || !repoUrl}
                                                        className="bg-[#180260] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2a04a3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                    >
                                                        {isAnalyzing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                                                        Scan Repo
                                                    </button>
                                                </div>

                                                {/* Optional Token Field */}
                                                <div className="relative group">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Key className="w-3 h-3 text-neutral-500" />
                                                        <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Private Repo Token (Optional)</label>
                                                    </div>
                                                    <input
                                                        type="password"
                                                        value={githubToken}
                                                        onChange={(e) => setGithubToken(e.target.value)}
                                                        placeholder="ghp_..."
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#a78bfa] transition-colors"
                                                    />
                                                    <p className="text-[10px] text-neutral-600 mt-1">
                                                        If your repo is private, paste a <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white underline">Classic Token</a> with <code>repo</code> scope.
                                                    </p>
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
                                                    <p className="text-xs opacity-80">Ready to import this project.</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5 block">Project Name</label>
                                                    <input
                                                        value={projectDetails.name}
                                                        onChange={(e) => setProjectDetails(prev => ({ ...prev, name: e.target.value }))}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa] transition-colors"
                                                        placeholder="Project Name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5 block">Description</label>
                                                    <textarea
                                                        value={projectDetails.description}
                                                        onChange={(e) => setProjectDetails(prev => ({ ...prev, description: e.target.value }))}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa] transition-colors resize-none h-20"
                                                        placeholder="Project Description"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Technologies</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.stack.map(tech => (
                                                        <span key={tech.name} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white flex items-center gap-1">
                                                            {tech.name} <span className="text-neutral-500 text-xs">v{tech.version}</span>
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

                            {activeTab === 'github' && (
                                <div className="space-y-4">
                                    {!session?.provider_token ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400 space-y-4">
                                            <div className="p-4 bg-white/5 rounded-full mb-2">
                                                <Key className="w-8 h-8 text-neutral-500" />
                                            </div>
                                            <h3 className="text-white font-medium">GitHub Access Required</h3>
                                            <p className="max-w-xs text-sm">We need permission to read your repositories to import them automatically.</p>
                                            <button
                                                onClick={() => signInWithGithub()}
                                                className="bg-[#24292F] hover:bg-[#24292F]/80 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                                            >
                                                <Github className="w-4 h-4" />
                                                Connect GitHub
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 h-full">
                                            <div className="relative">
                                                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                                                <input
                                                    placeholder="Search repositories..."
                                                    value={repoSearch}
                                                    onChange={e => setRepoSearch(e.target.value)}
                                                    className="w-full bg-[#121212] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#a78bfa]"
                                                />
                                            </div>

                                            {isLoadingRepos ? (
                                                <div className="flex justify-center py-12">
                                                    <Loader2 className="w-6 h-6 animate-spin text-[#a78bfa]" />
                                                </div>
                                            ) : (
                                                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                                    {repos
                                                        .filter(r => r.name.toLowerCase().includes(repoSearch.toLowerCase()))
                                                        .map(repo => (
                                                            <div key={repo.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors group">
                                                                <div className="min-w-0">
                                                                    <h4 className="text-white text-sm font-medium truncate flex items-center gap-2">
                                                                        {repo.name}
                                                                        {repo.private && <span className="text-[10px] px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-neutral-400">Private</span>}
                                                                    </h4>
                                                                    <p className="text-neutral-500 text-xs truncate max-w-[300px]">{repo.description || "No description"}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        setRepoUrl(repo.html_url);
                                                                        setError("");
                                                                        setResult(null);
                                                                        setInput("");
                                                                        setActiveTab('magic');
                                                                        // Auto-trigger analysis
                                                                        // We need to wait for state update, or just call logic directly
                                                                        // For now, let's pre-fill and switch tab where "Scan" is available
                                                                        // Ideally, we'd trigger the scan immediately.
                                                                        setTimeout(() => setRepoUrl(repo.html_url), 100);
                                                                    }}
                                                                    className="px-3 py-1.5 bg-[#180260] hover:bg-[#2e1065] text-[#a78bfa] text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
                                                                >
                                                                    Import
                                                                </button>
                                                            </div>
                                                        ))}
                                                    {repos.length === 0 && (
                                                        <p className="text-center text-neutral-500 py-8 text-sm">No repositories found.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
