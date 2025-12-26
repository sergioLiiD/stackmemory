"use client";

import { useState, useEffect } from "react";
import { Sparkles, FileText, RefreshCw, BookOpen, Layers, Lightbulb } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";

interface InsightTabProps {
    project: any;
}

export function InsightTab({ project }: InsightTabProps) {
    const [report, setReport] = useState<string | null>(project.insight_report);
    const [loading, setLoading] = useState(false);
    const [lastGenerated, setLastGenerated] = useState<string | null>(project.insight_generated_at);
    const supabase = createClient();

    const generateInsight = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/vibe/insight", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId: project.id }),
            });

            if (!response.ok) throw new Error("Failed to generate insight");

            const data = await response.json();
            setReport(data.report);
            setLastGenerated(new Date().toISOString());

            // Optimistic update if needed, but the API should save to DB usually.
            // But let's assume the component re-fetches or we just update local state.
        } catch (error) {
            console.error("Error generating insight:", error);
            // Show error toast
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                    <Sparkles className="w-16 h-16 text-blue-400 animate-pulse relative z-10" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-medium text-white">Analyzing Project D.N.A...</h3>
                    <p className="text-neutral-400">
                        Vibe Coder is reading your documentation, understanding your architecture, and writing the "Project Bible". This takes a moment.
                    </p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <BookOpen className="w-8 h-8 text-blue-400" />
                </div>
                <div className="space-y-2 max-w-lg">
                    <h3 className="text-xl font-semibold text-white">Project Insight</h3>
                    <p className="text-neutral-400">
                        Generate a comprehensive "Deep Dive" report for this project.
                        Includes Executive Summary, Architecture Map, and Tech Stack analysis.
                    </p>
                </div>
                <button
                    onClick={generateInsight}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
                >
                    <Sparkles className="w-4 h-4" />
                    Generate Insight Report
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header / Actions */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                        <Lightbulb className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-medium text-white">Project Insight</h3>
                        {lastGenerated && (
                            <p className="text-xs text-neutral-500">
                                Last updated: {new Date(lastGenerated).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={generateInsight}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate
                </button>
            </div>

            {/* The Report */}
            <div className="prose prose-invert prose-lg max-w-none">
                <div className="p-8 rounded-2xl bg-[#0A0A0A] border border-white/5 shadow-2xl">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6 pb-4 border-b border-white/10" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-white mt-8 mb-4 flex items-center gap-2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-lg font-medium text-blue-200 mt-6 mb-3" {...props} />,
                            p: ({ node, ...props }) => <p className="text-neutral-300 leading-relaxed mb-4" {...props} />,
                            ul: ({ node, ...props }) => <ul className="space-y-2 mb-6" {...props} />,
                            li: ({ node, ...props }) => <li className="flex items-start gap-2 text-neutral-300" {...props} ><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" /><span>{props.children}</span></li>,
                            code: ({ node, ...props }) => <code className="px-1.5 py-0.5 rounded bg-white/10 text-blue-300 font-mono text-sm" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500/30 pl-4 py-2 my-6 bg-blue-500/5 rounded-r-lg italic text-neutral-400" {...props} />,
                        }}
                    >
                        {report}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
