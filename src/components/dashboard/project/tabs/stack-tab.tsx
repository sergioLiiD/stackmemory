"use client";

import { useState } from "react";
import { Project, StackItem } from "@/data/mock";
import { Box, Layers, Plus, Trash2, Save, X, Pencil, ShieldAlert, ArrowUpRight, RefreshCw } from "lucide-react";
import { useDashboard } from "../../dashboard-context";
import { supabase } from "@/lib/supabase";
import { StackModal } from "./stack-modal";
import { FirebaseConfigCard } from "./firebase-card";
import { useEffect } from "react";

export function StackTab({ project }: { project: Project }) {
    const { updateProject } = useDashboard();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StackItem | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [updates, setUpdates] = useState<{ [key: string]: { latest?: string, vulnerabilities?: any[] } }>({});

    // Sync state
    const [isSyncing, setIsSyncing] = useState(false);

    const handleStackSync = async () => {
        if (!project.repoUrl) return;
        setIsSyncing(true);
        try {
            const res = await fetch('/api/crawl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoUrl: project.repoUrl,
                    projectId: project.id
                })
            });

            if (res.status === 401) {
                if (confirm("Session expired. Would you like to reconnect GitHub now?")) {
                    await supabase.auth.signInWithOAuth({
                        provider: 'github',
                        options: {
                            redirectTo: window.location.href,
                            scopes: 'repo read:user'
                        }
                    });
                }
                return;
            }

            const data = await res.json();

            if (res.ok) {
                if (data.stackUpdate?.updated) {
                    window.location.reload();
                } else if (data.stackUpdate?.error) {
                    alert("Sync warning: Stack update failed - " + data.stackUpdate.error);
                } else if (data.stackUpdate && !data.stackUpdate.found) {
                    alert("No package.json found. Crawler analyzed " + data.filesFound + " files.");
                } else {
                    window.location.reload();
                }
            } else {
                alert("Failed to sync: " + (data.error || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            alert("Error syncing stack");
        } finally {
            setIsSyncing(false);
        }
    };


    // Check for updates
    useEffect(() => {
        const checkUpdates = async () => {
            if (!project.stack.length) return;
            const packages = project.stack
                .filter(item => item.version)
                .map(item => ({ name: item.name, version: item.version }));

            if (packages.length === 0) return;

            try {
                const res = await fetch('/api/stack/check-updates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ packages })
                });
                const data = await res.json();
                if (data.updates) {
                    const updateMap: { [key: string]: { latest?: string, vulnerabilities?: any[] } } = {};
                    data.updates.forEach((u: any) => {
                        updateMap[u.name.toLowerCase()] = {
                            latest: u.latest,
                            vulnerabilities: u.vulnerabilities
                        };
                    });

                    const hasNewUpdates = data.updates.some((u: any) => u.latest || (u.vulnerabilities && u.vulnerabilities.length > 0));

                    if (hasNewUpdates !== project.hasUpdates) {
                        updateProject(project.id, { hasUpdates: hasNewUpdates });
                        if (supabase) {
                            supabase.from('projects').update({ has_updates: hasNewUpdates }).eq('id', project.id).then();
                        }
                    }

                    setUpdates(updateMap);
                }
            } catch (error) {
                console.error("Failed to check updates", error);
            }
        };

        checkUpdates();
    }, [project.stack]);

    // Helper to persist changes
    const saveStack = async (newStack: StackItem[]) => {
        // Optimistic update
        updateProject(project.id, { stack: newStack });

        // DB update
        if (supabase) {
            const { error } = await supabase
                .from('projects')
                .update({ stack: newStack })
                .eq('id', project.id);

            if (error) console.error("Error saving stack:", error);
        }
    };

    const handleAdd = () => {
        setEditingItem(null);
        setEditingIndex(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item: StackItem, index: number) => {
        setEditingItem(item);
        setEditingIndex(index);
        setIsModalOpen(true);
    };

    const handleModalSave = (item: StackItem) => {
        let newStack = [...project.stack];

        if (editingIndex !== null) {
            // Edit existing
            newStack[editingIndex] = item;
        } else {
            // Add new
            newStack.push(item);
        }

        saveStack(newStack);
        setIsModalOpen(false);
    };

    const handleDelete = (index: number) => {
        if (confirm("Remove this item?")) {
            const newStack = project.stack.filter((_, i) => i !== index);
            saveStack(newStack);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#a78bfa]" /> Technology Stack
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleStackSync}
                        disabled={!project.repoUrl || isSyncing}
                        className="text-xs bg-white/5 border border-white/10 text-neutral-400 hover:text-white px-4 py-2 rounded-full hover:bg-white/10 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={project.repoUrl ? "Update stack from package.json" : "Link a repository first"}
                    >
                        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync with Repo'}
                    </button>
                    <button
                        onClick={handleAdd}
                        className="text-xs bg-[#180260] text-white px-4 py-2 rounded-full hover:bg-[#2a04a3] transition-colors shadow-lg shadow-[#180260]/20 font-medium flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" /> Add Tech
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.stack.map((item, i) => (
                    <div key={i} className="relative p-5 rounded-3xl bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 transition-all group shadow-sm dark:shadow-none">

                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEditItem(item, i)}
                                className="p-1.5 rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
                                title="Edit"
                            >
                                <Pencil className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => handleDelete(i)}
                                className="p-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="flex items-start justify-between mb-3 pr-12">
                            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-700 dark:text-white relative">
                                <Box className="w-5 h-5" />
                                {updates[item.name.toLowerCase()]?.latest && (
                                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-[#121212] ${updates[item.name.toLowerCase()]?.vulnerabilities?.length
                                        ? 'bg-red-500'
                                        : 'bg-yellow-500'}`}
                                        title={`Update available: v${updates[item.name.toLowerCase()].latest}`} />
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {updates[item.name.toLowerCase()]?.vulnerabilities && updates[item.name.toLowerCase()]!.vulnerabilities!.length > 0 && (
                                    <div className="group/shield relative">
                                        <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse cursor-help" />
                                    </div>
                                )}
                                {item.version && (
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-mono border ${updates[item.name.toLowerCase()]?.vulnerabilities?.length
                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                        : updates[item.name.toLowerCase()]?.latest
                                            ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                            : 'bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-transparent'
                                        }`}>
                                        v{item.version}
                                    </span>
                                )}
                            </div>
                        </div>
                        <h4 className="text-base font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-[#a78bfa] transition-colors">{item.name}</h4>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">{item.type}</span>
                            {updates[item.name.toLowerCase()]?.latest && (
                                <span className={`text-[10px] font-bold animate-pulse ${updates[item.name.toLowerCase()]?.vulnerabilities?.length ? 'text-red-400' : 'text-yellow-500'
                                    }`}>
                                    Latest: v{updates[item.name.toLowerCase()].latest}
                                </span>
                            )}
                        </div>
                        {item.notes && (
                            <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-white/5">
                                <p className="text-xs text-neutral-600 dark:text-neutral-500 leading-relaxed line-clamp-2">
                                    {item.notes}
                                </p>
                            </div>
                        )}

                        {/* Explicit Warning/Alert Section */}
                        {(updates[item.name.toLowerCase()]?.latest || (updates[item.name.toLowerCase()]?.vulnerabilities && updates[item.name.toLowerCase()]!.vulnerabilities!.length > 0)) && (
                            <div className={`mt-3 p-3 rounded-xl border space-y-3 ${updates[item.name.toLowerCase()]?.vulnerabilities?.length
                                ? 'bg-red-500/5 border-red-500/10'
                                    ? 'bg-red-500/5 border-red-500/10'
                                    : 'bg-yellow-500/5 border-yellow-500/10'
                                }`}>
                                {updates[item.name.toLowerCase()]?.latest && (
                                    <div className={`flex items-start gap-2 text-xs ${updates[item.name.toLowerCase()]?.vulnerabilities?.length ? 'text-red-300' : 'text-yellow-600 dark:text-yellow-500'
                                        }`}>
                                        <ArrowUpRight className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className={`font-bold ${updates[item.name.toLowerCase()]?.vulnerabilities?.length ? 'text-red-200' : 'text-yellow-700 dark:text-yellow-400'
                                                }`}>New Version Available</span>
                                            <span className="opacity-80">Update to <span className={`font-mono px-1 rounded ${updates[item.name.toLowerCase()]?.vulnerabilities?.length ? 'bg-red-500/10' : 'bg-yellow-500/10'
                                                }`}>v{updates[item.name.toLowerCase()].latest}</span> recommended.</span>
                                        </div>
                                    </div>
                                )}
                                {updates[item.name.toLowerCase()]?.vulnerabilities?.map((v: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-red-400/80">
                                        <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-red-100 flex items-center gap-1">Security Vulnerability <span className="text-[9px] bg-red-500/20 px-1 rounded uppercase tracking-wider text-red-200">Critical</span></span>
                                            <span className="font-mono text-[10px] opacity-70 mb-0.5">{v.id}</span>
                                            <span className="leading-relaxed">{v.summary}</span>
                                            <span className="mt-1 text-red-300 underline cursor-pointer hover:text-red-200">View Patch Info</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {!project.stack.length && (
                <div className="p-12 text-center border border-dashed border-white/10 rounded-xl mt-4">
                    <Layers className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                    <p className="text-neutral-500">No technology stack defined.</p>
                </div>
            )}

            <StackModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleModalSave}
                initialItem={editingItem}
            />

            {/* Integrations & Configurations */}
            <div className="mt-8 border-t border-neutral-200 dark:border-white/5 pt-8">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#a78bfa]" /> Integrations
                </h3>

                <div className="grid grid-cols-1 gap-4">
                    {/* Firebase Config */}
                    {(project.firebaseConfig || project.stack.some(s => s.name.toLowerCase().includes('firebase'))) ? (
                        <FirebaseConfigCard project={project} />
                    ) : (

                        <div className="p-6 rounded-3xl bg-[#121212] border border-dashed border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Firebase Configuration</h4>
                                    <p className="text-xs text-neutral-500">Add API keys and project settings.</p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    const emptyConfig = {
                                        apiKey: "", authDomain: "", projectId: "", storageBucket: "", messagingSenderId: "", appId: ""
                                    };
                                    updateProject(project.id, { firebaseConfig: emptyConfig });

                                    if (supabase) {
                                        await supabase.from('projects').update({ firebase_config: emptyConfig }).eq('id', project.id);
                                    }
                                }}
                                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white hover:bg-white/10 transition-colors font-medium"
                            >
                                + Enable
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
