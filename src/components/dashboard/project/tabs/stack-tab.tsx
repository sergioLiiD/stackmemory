"use client";

import { useState } from "react";
import { Project, StackItem } from "@/data/mock";
import { Box, Layers, Plus, Trash2, Save, X, Pencil, ShieldAlert } from "lucide-react";
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
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#121212]" title={`Update available: v${updates[item.name.toLowerCase()].latest}`} />
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {updates[item.name.toLowerCase()]?.vulnerabilities && updates[item.name.toLowerCase()]!.vulnerabilities!.length > 0 && (
                                    <div className="group/shield relative">
                                        <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse cursor-help" />
                                        {/* Tooltip for Vulnerabilities */}
                                        <div className="absolute bottom-full right-0 mb-2 w-64 bg-red-950/90 border border-red-500/30 rounded-lg p-3 shadow-xl backdrop-blur-md opacity-0 group-hover/shield:opacity-100 transition-opacity pointer-events-none z-50">
                                            <h5 className="text-xs font-bold text-red-200 mb-2 flex items-center gap-1">
                                                <ShieldAlert className="w-3 h-3" /> Security Alerts
                                            </h5>
                                            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                                                {updates[item.name.toLowerCase()]!.vulnerabilities!.map((v: any, idx: number) => (
                                                    <div key={idx} className="pb-1 border-b border-red-500/10 last:border-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-mono text-red-300">{v.id}</span>
                                                            <span className="text-[9px] px-1 rounded bg-red-500/20 text-red-300">{v.severity}</span>
                                                        </div>
                                                        <p className="text-[9px] text-red-400/80 line-clamp-1">{v.summary}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {item.version && (
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-mono border ${updates[item.name.toLowerCase()]?.latest
                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
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
                                <span className="text-[10px] font-bold text-red-400 animate-pulse">
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
