"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, FileCode, Loader2, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TourStep {
    step_number: number;
    title: string;
    file_path: string;
    description: string;
    why_important: string;
}

interface TourData {
    title: string;
    steps: TourStep[];
}

export function TourWizard({ projectId, onClose }: { projectId: string; onClose: () => void }) {
    const [tour, setTour] = useState<TourData | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // File Viewer State
    const [viewingFile, setViewingFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [loadingFile, setLoadingFile] = useState(false);

    useEffect(() => {
        async function fetchTour() {
            try {
                // Check if we have a saved tour provided by parent or local storage (optimization)
                // For now, fetch fresh.
                const res = await fetch('/api/vibe/onboarding', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectId })
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || "Failed to generate tour");
                }

                const data = await res.json();
                setTour(data);
                setLoading(false);
            } catch (e: any) {
                console.error(e);
                setError(e.message || "Could not generate tour. Please try again.");
                setLoading(false);
            }
        }
        fetchTour();
    }, [projectId]);

    const handleViewCode = async (filePath: string) => {
        setViewingFile(filePath);
        setLoadingFile(true);
        setFileContent(null);

        try {
            const supabase = createClient();
            // Try to find content in embeddings (easiest way without new API)
            const { data } = await supabase
                .from('embeddings')
                .select('content')
                .eq('project_id', projectId)
                .eq('file_path', filePath)
                .limit(1)
                .single();

            if (data) {
                setFileContent(data.content);
            } else {
                setFileContent("// File content not found in index.");
            }
        } catch (e) {
            setFileContent("// Error loading file.");
        } finally {
            setLoadingFile(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed bottom-8 right-8 w-96 bg-[#180260] border border-[#a78bfa]/30 rounded-2xl shadow-2xl p-6 z-50 text-white flex flex-col items-center justify-center min-h-[200px] animate-in fade-in slide-in-from-bottom-10">
                <Loader2 className="w-8 h-8 text-[#a78bfa] animate-spin mb-4" />
                <h3 className="text-lg font-bold">Summoning Vibe Coder...</h3>
                <p className="text-sm text-neutral-400 text-center mt-2">Analyzing architecture & generating tour...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed bottom-8 right-8 w-96 bg-[#180260] border border-red-500/30 rounded-2xl shadow-2xl p-6 z-50 text-white animate-in fade-in slide-in-from-bottom-10">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-red-400">Error</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-neutral-400 hover:text-white" /></button>
                </div>
                <p className="text-sm text-neutral-300">{error}</p>
            </div>
        );
    }

    if (!tour) return null;

    const step = tour.steps[currentStepIndex];
    const isFirst = currentStepIndex === 0;
    const isLast = currentStepIndex === tour.steps.length - 1;

    return (
        <>
            {/* WIZARD CARD */}
            <div className="fixed bottom-8 right-8 w-[450px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#a78bfa]/30 rounded-2xl shadow-2xl shadow-purple-900/20 z-40 text-white animate-in fade-in slide-in-from-bottom-5 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#180260] to-[#2e1065] p-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#a78bfa] text-[#180260] text-xs font-bold">
                            {currentStepIndex + 1}/{tour.steps.length}
                        </span>
                        <h3 className="font-bold text-sm truncate max-w-[250px]">{tour.title}</h3>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-1 text-white">{step.title}</h2>
                    <div className="flex items-center gap-2 text-xs text-[#a78bfa] font-mono mb-4 bg-purple-900/20 w-fit px-2 py-1 rounded">
                        <FileCode className="w-3 h-3" />
                        {step.file_path}
                    </div>

                    <p className="text-neutral-300 text-sm mb-4 leading-relaxed">
                        {step.description}
                    </p>

                    <div className="bg-blue-900/10 border-l-2 border-blue-500 p-3 mb-6">
                        <p className="text-xs text-blue-200">
                            <strong>Why it matters:</strong> {step.why_important}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => handleViewCode(step.file_path)}
                            className="bg-white/5 hover:bg-white/10 text-xs px-3 py-2 rounded-lg border border-white/10 flex items-center gap-2 transition-colors"
                        >
                            <FileCode className="w-3 h-3" /> View Code
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                                disabled={isFirst}
                                className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => isLast ? onClose() : setCurrentStepIndex(prev => Math.min(tour.steps.length - 1, prev + 1))}
                                className="flex items-center gap-1 pl-4 pr-2 py-2 rounded-full bg-[#a78bfa] hover:bg-[#c4b5fd] text-[#180260] font-bold text-sm transition-colors"
                            >
                                {isLast ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CODE VIEWER MODAL */}
            {viewingFile && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8 animate-in fade-in">
                    <div className="w-full max-w-4xl bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#252526]">
                            <div className="font-mono text-sm text-neutral-400">{viewingFile}</div>
                            <button onClick={() => setViewingFile(null)} className="text-white hover:text-red-400"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 bg-[#1e1e1e]">
                            {loadingFile ? (
                                <div className="flex items-center justify-center h-full text-neutral-500 gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" /> Loading content...
                                </div>
                            ) : (
                                <pre className="font-mono text-sm text-neutral-300">
                                    <code>{fileContent}</code>
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
