"use client";
import { useState, useEffect } from "react";
import { Project, Service } from "@/data/mock";
import { useDashboard } from "../../dashboard-context";
import { CheckCircle2, Copy, Eye, EyeOff, ExternalLink, Github, Globe, Key, Server, Shield, Pencil, Check, X, Search, RefreshCw, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { ServiceModal } from "./service-modal";
import { TodoListCard } from "./todo-list-card";


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

    const handleAddService = (service: Service) => {
        saveServices([...(project.services || []), service]);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Column 1: Metadata & Secrets */}
            <div className="space-y-6">
                {/* Metadata Card */}
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
                        <button className="w-full py-2 mt-2 rounded-full border border-dashed border-neutral-300 dark:border-white/10 text-neutral-500 text-xs hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">+ Add Secret Key</button>
                    </div>
                </div>

                {/* Ingestion Zone (Vibe Coder) */}
                <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                        <RefreshCw className={cn("w-5 h-5 text-purple-400", isCrawling && "animate-spin")} />
                        Semantic Indexing
                    </h3>
                    <p className="text-xs text-neutral-400 mb-4 relative z-10">
                        Sync your repository to generate vector embeddings for the AI.
                    </p>

                    <div className="relative z-10 space-y-3">
                        {crawlResult ? (
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
                                onClick={async () => {
                                    if (!project.repoUrl) return;
                                    setIsCrawling(true);
                                    try {
                                        const res = await fetch('/api/crawl', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ repoUrl: project.repoUrl, projectId: project.id })
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            setCrawlResult({ count: data.filesFound, files: data.files });
                                        } else {
                                            alert('Error: ' + data.error);
                                        }
                                    } catch (e) {
                                        alert('Failed to crawl');
                                    } finally {
                                        setIsCrawling(false);
                                    }
                                }}
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
            </div>

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
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{service.name}</h4>
                                        <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">{service.url}</a>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-neutral-500 mb-1">{service.username}</div>
                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors">
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div >
    );
}

