"use client";
import { useState, useEffect, useMemo } from "react";
import { Project, Service, MCPServer } from "@/data/mock";
import { useDashboard } from "../../dashboard-context";
import { CheckCircle2, Copy, Eye, EyeOff, ExternalLink, Github, Globe, Key, Server, Shield, Pencil, Check, X, Search, RefreshCw, FileCode, Hash, Link as LinkIcon, FileText, Network, Terminal, Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { ServiceModal } from "./service-modal";
import { MCPModal } from "./mcp-modal";
import { TodoListCard } from "./todo-list-card";
import { HealthBar } from "../health-bar";
import { ProjectCommandsCard } from "./project-commands-card";
import { getMCPSuggestions } from "@/lib/mcp-advisor";
import { DesignSystemCard } from "./design-system-card";


import { useRouter } from "next/navigation";

export function OverviewTab({ project }: { project: Project }) {
    const { updateProject, deleteProject } = useDashboard();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [editForm, setEditForm] = useState({
        repoUrl: project.repoUrl,
        liveUrl: project.liveUrl,
        deployProvider: project.deployProvider || '',
        deployAccount: project.deployAccount || ''
    });

    // Crawler State
    const [isCrawling, setIsCrawling] = useState(false);
    const [crawlResult, setCrawlResult] = useState<{ count: number, files: any[] } | null>(null);
    const [lastSynced, setLastSynced] = useState<string | null>(null);

    // Auth Fallback State
    const [authError, setAuthError] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualToken, setManualToken] = useState("");

    // Secrets State
    const [isAddingSecret, setIsAddingSecret] = useState(false);
    const [newSecretKey, setNewSecretKey] = useState("");
    const [newSecretEnv, setNewSecretEnv] = useState<"production" | "preview" | "development">("production");

    const handleSaveSecret = async () => {
        if (!newSecretKey.trim()) return;

        const newSecret = {
            key: newSecretKey.toUpperCase().replace(/\s+/g, '_'),
            environment: newSecretEnv,
        };

        const updatedSecrets = [...(project.secrets || []), newSecret];

        // Optimistic Update
        updateProject(project.id, { secrets: updatedSecrets });

        // Reset Form
        setIsAddingSecret(false);
        setNewSecretKey("");
        setNewSecretEnv("production");

        // DB Update
        if (supabase) {
            const { error } = await supabase
                .from('projects')
                .update({ secrets: updatedSecrets })
                .eq('id', project.id);

            if (error) console.error("Failed to save secret", error);
        }
    };

    const handleConnectGithub = async () => {
        if (!supabase) return;
        // Set flag to resume sync after redirect
        if (typeof window !== 'undefined') {
            localStorage.setItem('pending_sync_project', project.id);
        }
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                scopes: 'repo',
                redirectTo: window.location.href
            }
        });
        if (error) console.error("GitHub Auth failed:", error);
    };

    const checkSyncStatus = async () => {
        try {
            const res = await fetch('/api/project/sync/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project.id })
            });
            const data = await res.json();
            if (data.success && data.lastSynced) {
                setLastSynced(data.lastSynced);
            }
        } catch (e) {
            console.error("Failed to check sync status", e);
        }
    };

    const startCrawl = async (overrideToken?: string) => {
        if (!project.repoUrl) return;
        setIsCrawling(true);
        setAuthError(false);

        try {
            const res = await fetch('/api/crawl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoUrl: project.repoUrl,
                    projectId: project.id,
                    githubToken: overrideToken
                })
            });
            const data = await res.json();

            if (res.status === 401) {
                setAuthError(true);
                return;
            }

            if (data.success) {
                setCrawlResult({ count: data.filesFound, files: data.files });
                setShowManualInput(false);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (e) {
            alert('Failed to crawl');
        } finally {
            setIsCrawling(false);
            checkSyncStatus();
        }
    };

    // Check for existing embeddings on load
    useEffect(() => {
        const checkIndex = async () => {
            if (!supabase) return;
            // Get count of embeddings for this project
            const { count, error } = await supabase
                .from('embeddings')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', project.id);

            if (count && count > 0) {
                // We don't fetch file list to save bandwidth, just the count is enough to show "Indexed"
                setCrawlResult({ count, files: [] });
            }
        };
        checkIndex();
        checkSyncStatus();

        // Check for pending sync (from OAuth redirect)
        if (typeof window !== 'undefined') {
            const pendingAndId = localStorage.getItem('pending_sync_project');
            if (pendingAndId === project.id) {
                localStorage.removeItem('pending_sync_project');
                // Allow a small delay for session to stabilize
                setTimeout(() => {
                    startCrawl();
                }, 1000);
            }
        }
    }, [project.id]);

    const handleDelete = async () => {
        if (deleteConfirmation === project.name) {
            await deleteProject(project.id);
            router.push('/dashboard');
        }
    };

    const handleSave = async () => {
        // 1. Optimistic UI Update
        updateProject(project.id, {
            repoUrl: editForm.repoUrl,
            liveUrl: editForm.liveUrl,
            deployProvider: editForm.deployProvider,
            deployAccount: editForm.deployAccount
            // Note: Stack is already updated in local state via individual button clicks, 
            // so 'project.stack' is fresh.
        });

        setIsEditing(false);

        // 2. Persist to DB
        if (supabase) {
            const { error } = await supabase
                .from('projects')
                .update({
                    repository_url: editForm.repoUrl,
                    live_url: editForm.liveUrl,
                    deploy_provider: editForm.deployProvider,
                    deploy_account: editForm.deployAccount
                })
                .eq('id', project.id);

            if (error) {
                console.error("Failed to update project", error);
            }
        }
    };

    // Modal State
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);

    // MCP Modal State
    const [isMCPModalOpen, setIsMCPModalOpen] = useState(false);
    const [editingMCP, setEditingMCP] = useState<MCPServer | null>(null);

    // Derived Suggestions
    const suggestedMCPs = useMemo(() => {
        return getMCPSuggestions(project.stack || [], project.mcps || []);
    }, [project.stack, project.mcps]);

    // Helper to persist services
    const saveServices = async (newServices: Service[]) => {
        // Optimistic update
        updateProject(project.id, { services: newServices });

        // DB update
        if (supabase) {
            const { error } = await supabase
                .from('projects')
                .update({ services: newServices })
                .eq('id', project.id);

            if (error) console.error("Error saving services:", error);
        }
    };

    const saveMCPs = async (newMCPs: MCPServer[]) => {
        updateProject(project.id, { mcps: newMCPs });

        if (supabase) {
            const { error } = await supabase.from('projects').update({ mcps: newMCPs }).eq('id', project.id);
            if (error) console.error("Error saving MCPs:", error);
        }
    };

    const handleAddMCP = (mcp: MCPServer) => {
        let newMCPs = [...(project.mcps || [])];
        const existingIndex = newMCPs.findIndex(m => m.id === mcp.id);

        if (existingIndex >= 0) {
            newMCPs[existingIndex] = mcp;
        } else {
            newMCPs.push(mcp);
        }

        saveMCPs(newMCPs);
        setEditingMCP(null);
    };

    const handleEditMCP = (mcp: MCPServer) => {
        setEditingMCP(mcp);
        setIsMCPModalOpen(true);
    };

    const handleDeleteMCP = (id: string) => {
        if (confirm("Remove this Context Bridge?")) {
            const newMCPs = (project.mcps || []).filter(m => m.id !== id);
            saveMCPs(newMCPs);
        }
    };

    const handleAddService = (service: Service) => {
        if (editingServiceIndex !== null) {
            // Edit existing
            const newServices = [...(project.services || [])];
            newServices[editingServiceIndex] = service;
            saveServices(newServices);
            setEditingServiceIndex(null);
        } else {
            // Add new
            saveServices([...(project.services || []), service]);
        }
    };

    const handleEditService = (service: Service, index: number) => {
        setEditingServiceIndex(index);
        setIsServiceModalOpen(true);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Column 1: Metadata & Secrets */}
            <div className="space-y-6">




                {/* Secrets Metadata */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/10 shadow-sm dark:shadow-none">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-400" /> Secrets Metadata
                        <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full ml-auto">KEYS ONLY</span>
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">Store keys names only, never values.</p>

                    <div className="space-y-2">
                        {project.secrets?.map((secret, i) => (
                            <div key={i} className="group flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Key className="w-3 h-3 text-neutral-500" />
                                    <code className="text-xs text-neutral-300 truncate">{secret.key}</code>
                                </div>
                                <span className="text-[10px] text-neutral-500 px-2 py-0.5 rounded-full bg-black/30 border border-white/5">{secret.environment}</span>
                            </div>
                        ))}
                        {!project.secrets?.length && (
                            <div className="text-center py-4 text-neutral-600 text-sm border border-dashed border-white/10 rounded-lg">No secrets recorded</div>
                        )}
                        {isAddingSecret ? (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-[#a78bfa]/50 animate-in fade-in slide-in-from-top-1">
                                <Key className="w-3 h-3 text-[#a78bfa]" />
                                <input
                                    autoFocus
                                    value={newSecretKey}
                                    onChange={(e) => setNewSecretKey(e.target.value)}
                                    placeholder="API_KEY_NAME"
                                    className="flex-1 bg-transparent text-xs text-white placeholder:text-neutral-600 focus:outline-none font-mono uppercase"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveSecret()}
                                />
                                <select
                                    value={newSecretEnv}
                                    onChange={(e) => setNewSecretEnv(e.target.value as any)}
                                    className="bg-black/30 border border-white/10 rounded px-1 py-0.5 text-[10px] text-neutral-400 focus:outline-none focus:border-[#a78bfa]"
                                >
                                    <option value="production">PROD</option>
                                    <option value="development">DEV</option>
                                    <option value="preview">PREVIEW</option>
                                </select>
                                <button onClick={handleSaveSecret} className="text-green-400 hover:text-green-300 p-1">
                                    <Check className="w-3 h-3" />
                                </button>
                                <button onClick={() => setIsAddingSecret(false)} className="text-red-400 hover:text-red-300 p-1">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingSecret(true)}
                                className="w-full py-2 mt-2 rounded-full border border-dashed border-neutral-300 dark:border-white/10 text-neutral-500 text-xs hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                            >
                                + Add Secret Key
                            </button>
                        )}
                    </div>
                </div>

                {/* Ingestion Zone (Vibe Coder) */}
                <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="mb-4 relative z-10">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <RefreshCw className={cn("w-5 h-5 text-purple-400", isCrawling && "animate-spin")} />
                                Semantic Indexing
                            </h3>
                            {lastSynced && (
                                <span className="text-[10px] text-neutral-500 font-mono bg-black/20 px-2 py-1 rounded">
                                    Last synced: {new Date(lastSynced).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-neutral-400">
                            Sync your repository to generate vector embeddings for the AI.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-3">
                        {authError ? (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-in fade-in zoom-in-95 duration-200">
                                <h4 className="text-sm font-bold text-red-400 mb-2">Authentication Failed</h4>
                                <p className="text-xs text-neutral-400 mb-4">
                                    We couldn't access your repository. Please re-authenticate or provide a token manually.
                                </p>

                                <div className="space-y-3">
                                    <button onClick={handleConnectGithub} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors">
                                        <Github className="w-4 h-4" /> Connect GitHub
                                    </button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/5"></div>
                                        </div>
                                        <div className="relative flex justify-center text-[10px] uppercase">
                                            <span className="bg-[#121212] px-2 text-neutral-500">Or use token</span>
                                        </div>
                                    </div>

                                    {showManualInput ? (
                                        <div className="flex gap-2">
                                            <input
                                                value={manualToken}
                                                onChange={(e) => setManualToken(e.target.value)}
                                                placeholder="ghp_..."
                                                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => startCrawl(manualToken)}
                                                disabled={!manualToken || isCrawling}
                                                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                                            >
                                                {isCrawling ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Sync"}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowManualInput(true)}
                                            className="w-full text-xs text-neutral-500 hover:text-neutral-300 transition-colors underline decoration-white/5 hover:decoration-neutral-300"
                                        >
                                            I have a Personal Access Token
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : crawlResult ? (
                            <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-green-400 font-medium flex items-center gap-2">
                                        <Check className="w-4 h-4" /> Synced Successfully
                                    </span>
                                    <span className="text-xs text-neutral-500">{crawlResult.count} files found</span>
                                </div>
                                <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                    {crawlResult.files.map((f: any, i: number) => (
                                        <div key={i} className="flex items-center gap-2 text-[10px] text-neutral-300">
                                            <FileCode className="w-3 h-3 text-neutral-600" />
                                            <span className="truncate">{f.path}</span>
                                            <span className="ml-auto text-neutral-600">{(f.size / 1024).toFixed(1)}kb</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCrawlResult(null)}
                                    className="w-full mt-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => startCrawl()}
                                disabled={isCrawling || !project.repoUrl}
                                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isCrawling ? (
                                    <>Processing Repository...</>
                                ) : (
                                    <>
                                        <Github className="w-4 h-4" />
                                        Sync Repository Now
                                    </>
                                )}
                            </button>
                        )}

                        {!project.repoUrl && (
                            <p className="text-[10px] text-red-400 text-center">
                                * Link a GitHub repository in the metadata section first.
                            </p>
                        )}
                    </div>
                </div>



                {/* Design System Assets */}
                <DesignSystemCard project={project} />

                {/* Command Zone (Cheatsheet) */}
                <ProjectCommandsCard project={project} />

                {/* Danger Zone */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#121212] border border-red-500/20 shadow-sm dark:shadow-none">
                    <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" /> Danger Zone
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">
                        Once you delete a project, there is no going back. Please be certain.
                    </p>
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="w-full py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm hover:bg-red-500/20 transition-colors font-medium"
                    >
                        Delete Project
                    </button>
                </div>
            </div >

            {/* Delete Confirmation Modal */}
            {
                isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-2">Delete Project?</h3>
                            <p className="text-neutral-400 text-sm mb-6">
                                This action cannot be undone. This will permanently delete the
                                project <span className="text-white font-mono">{project.name}</span> and remove all associated data.
                            </p>

                            <div className="mb-6">
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">
                                    Type <span className="text-white normal-case">"{project.name}"</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors font-mono text-sm"
                                    placeholder={project.name}
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirmation(""); }}
                                    className="flex-1 py-3 rounded-lg bg-white/5 border border-white/5 text-white hover:bg-white/10 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteConfirmation !== project.name}
                                    className={cn("flex-1 py-3 rounded-lg border transition-colors font-medium",
                                        deleteConfirmation === project.name
                                            ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                                            : "bg-white/5 border-white/5 text-neutral-500 cursor-not-allowed"
                                    )}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Column 2 & 3: Service Locker */}
            <div className="md:col-span-2 space-y-6">
                {/* Metadata Card (Moved) */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/10 shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Globe className="w-5 h-5 text-[#a78bfa]" /> Metadata
                        </h3>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white transition-colors">
                                <Pencil className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="text-red-400 hover:text-red-300">
                                    <X className="w-4 h-4" />
                                </button>
                                <button onClick={handleSave} className="text-green-400 hover:text-green-300">
                                    <Check className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Status</label>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 text-neutral-900 dark:text-white capitalize text-sm">
                                <span className={cn("w-2 h-2 rounded-full",
                                    project.status === 'active' ? 'bg-green-500' :
                                        project.status === 'legacy' ? 'bg-orange-500' :
                                            'bg-neutral-500'
                                )} />
                                {project.status}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Health Score</label>
                            <HealthBar project={project} showLabel={true} />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Repository</label>
                            {isEditing ? (
                                <input
                                    value={editForm.repoUrl}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, repoUrl: e.target.value }))}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                    placeholder="https://github.com/..."
                                />
                            ) : (
                                project.repoUrl ? (
                                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/5 text-blue-400 hover:text-blue-300 hover:border-blue-500/30 transition-colors text-sm truncate">
                                        <Github className="w-4 h-4 text-white" />
                                        <span className="truncate">{project.repoUrl.replace('https://github.com/', '')}</span>
                                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                                    </a>
                                ) : <div className="text-neutral-600 text-sm px-3 py-2">Not connected</div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Live URL</label>
                            {isEditing ? (
                                <input
                                    value={editForm.liveUrl}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, liveUrl: e.target.value }))}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
                                    placeholder="https://..."
                                />
                            ) : (
                                project.liveUrl ? (
                                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/5 text-green-400 hover:text-green-300 hover:border-green-500/30 transition-colors text-sm truncate">
                                        <Globe className="w-4 h-4 text-white" />
                                        <span className="truncate">{project.liveUrl.replace('https://', '')}</span>
                                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                                    </a>
                                ) : <div className="text-neutral-600 text-sm px-3 py-2">Not deployed</div>
                            )}
                        </div>

                        <div className="pt-2 border-t border-white/5">
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">Deployment</label>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1 block">Provider</label>
                                    {isEditing ? (
                                        <input
                                            value={editForm.deployProvider}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, deployProvider: e.target.value }))}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#a78bfa]"
                                            placeholder="Vercel, AWS..."
                                        />
                                    ) : (
                                        <div className="text-sm text-neutral-900 dark:text-white font-medium">
                                            {project.deployProvider || <span className="text-neutral-400 dark:text-neutral-600 italic">--</span>}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1 block">Account</label>
                                    {isEditing ? (
                                        <input
                                            value={editForm.deployAccount}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, deployAccount: e.target.value }))}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#a78bfa]"
                                            placeholder="user@example.com"
                                        />
                                    ) : (
                                        <div className="text-sm text-neutral-900 dark:text-neutral-400">
                                            {project.deployAccount || <span className="text-neutral-400 dark:text-neutral-600 italic">--</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Context Bridges (MCP) */}
                <div className="p-6 rounded-3xl bg-neutral-900 border border-cyan-500/20 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />

                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Network className="w-5 h-5 text-cyan-400" /> Context Bridges
                            </h3>
                            <p className="text-xs text-neutral-400 mt-1">
                                Connect AI agents to your data (Model Context Protocol).
                            </p>
                        </div>
                        <button
                            onClick={() => { setEditingMCP(null); setIsMCPModalOpen(true); }}
                            className="text-xs bg-cyan-900/50 text-cyan-200 border border-cyan-500/30 px-4 py-2 rounded-full hover:bg-cyan-900 transition-colors font-medium flex items-center gap-2"
                        >
                            + New Bridge
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 relative z-10">
                        {project.mcps?.map((mcp, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5 group hover:border-cyan-500/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mcp.type === 'stdio' ? 'bg-neutral-800 text-neutral-400' : 'bg-purple-900/20 text-purple-400'}`}>
                                        {mcp.type === 'stdio' ? <Terminal className="w-5 h-5" /> : <Network className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-white">{mcp.name}</h4>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider ${mcp.type === 'stdio' ? 'bg-neutral-800 text-neutral-500' : 'bg-purple-900/20 text-purple-300'}`}>
                                                {mcp.type}
                                            </span>
                                        </div>
                                        <code className="text-[10px] text-neutral-500 font-mono mt-1 block truncate max-w-[200px] md:max-w-xs">
                                            {mcp.type === 'stdio' ? `${mcp.command} ${(mcp.args || []).join(' ')}` : mcp.url}
                                        </code>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEditMCP(mcp)}
                                        className="p-1.5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors"
                                    >
                                        <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMCP(mcp.id)}
                                        className="p-1.5 hover:bg-red-500/10 rounded-full text-neutral-400 hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!project.mcps?.length && (
                            <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
                                <p className="text-xs text-neutral-500">No context bridges configured.</p>
                            </div>
                        )}
                    </div>

                    {/* Suggestions Section */}
                    {suggestedMCPs.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                            <h4 className="text-sm font-bold text-neutral-400 mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-400" /> Recommended for your stack
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                                {suggestedMCPs.map((suggestion) => (
                                    <div key={suggestion.id} className="flex items-center justify-between p-3 rounded-xl bg-purple-900/10 border border-purple-500/20 hover:bg-purple-900/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                                <Network className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-bold text-white">{suggestion.name}</h4>
                                                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full">Suggested</span>
                                                </div>
                                                <p className="text-[10px] text-neutral-400 max-w-xs truncate">{suggestion.description}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                // Pre-fill modal with suggestion
                                                setEditingMCP({ ...suggestion, id: crypto.randomUUID(), status: 'active' });
                                                setIsMCPModalOpen(true);
                                            }}
                                            className="px-3 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-lg text-xs font-bold border border-purple-500/20 transition-colors flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Bridge
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* To-Do List */}
                <TodoListCard project={project} />

                <div className="p-6 rounded-3xl bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/10 shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Server className="w-5 h-5 text-blue-400" /> Service Locker
                        </h3>
                        <button onClick={() => setIsServiceModalOpen(true)} className="text-xs bg-[#180260] text-white px-4 py-2 rounded-full hover:bg-[#2a04a3] transition-colors shadow-lg shadow-[#180260]/20 font-medium">
                            + Add Service
                        </button>
                    </div>

                    <p className="text-sm text-neutral-400 mb-6">Track accounts and emails. Avoid the "which account did I use?" panic.</p>

                    <div className="grid grid-cols-1 gap-3">
                        {project.services?.map((service, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/5 group hover:border-blue-500/30 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                        {service.category === 'social' ? <Globe className="w-5 h-5" /> : <Server className="w-5 h-5" />}
                                    </div>
                                    <div className="min-w-0">
                                        {/* Provider displayed prominently above */}
                                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">
                                            {service.provider}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">{service.name}</h4>
                                            {service.category && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-neutral-500 uppercase tracking-wide">{service.category}</span>}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                                            <span className="truncate max-w-[150px]">{service.account}</span>
                                            {service.url && (
                                                <a href={service.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">
                                                    <LinkIcon className="w-3 h-3" /> Link
                                                </a>
                                            )}
                                        </div>
                                        {service.notes && (
                                            <div className="mt-1 flex items-start gap-1 text-[10px] text-neutral-500 italic">
                                                <FileText className="w-3 h-3 shrink-0 mt-0.5" />
                                                <p className="line-clamp-1">{service.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-xs font-mono text-neutral-400 mb-1">{service.cost}</div>
                                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditService(service, i)}
                                            className="p-1.5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors"
                                            title="Edit Service"
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                        <button className="p-1.5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors" title="Copy Account">
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <ServiceModal
                isOpen={isServiceModalOpen}
                onClose={() => { setIsServiceModalOpen(false); setEditingServiceIndex(null); }}
                onSave={handleAddService}
                initialData={editingServiceIndex !== null ? project.services?.[editingServiceIndex] : null}
            />

            <MCPModal
                isOpen={isMCPModalOpen}
                onClose={() => { setIsMCPModalOpen(false); setEditingMCP(null); }}
                onSave={handleAddMCP}
                initialData={editingMCP}
            />
        </div >
    );
}

