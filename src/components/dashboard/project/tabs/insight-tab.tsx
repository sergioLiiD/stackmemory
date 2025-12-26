"use client";

import { useState, useEffect } from "react";
import { Sparkles, FileText, RefreshCw, BookOpen, Layers, Lightbulb } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import { useDashboard } from "../../dashboard-context";

interface InsightTabProps {
    project: any;
}

export function InsightTab({ project }: InsightTabProps) {
    const [report, setReport] = useState<string | null>(project.insight_report);
    const [loading, setLoading] = useState(false);
    const [lastGenerated, setLastGenerated] = useState<string | null>(project.insight_generated_at);
    const { updateProject } = useDashboard();
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

            // Update Context
            updateProject(project.id, {
                insight_report: data.report,
                insight_generated_at: new Date().toISOString()
            });

            setReport(data.report);
            setLastGenerated(new Date().toISOString());
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
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header / Actions */}
            <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-neutral-900/50 to-neutral-900/30 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                        <Lightbulb className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white tracking-tight">Project Insight</h3>
                        {lastGenerated && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-xs font-medium text-neutral-400">
                                    Generated {new Date(lastGenerated).toLocaleDateString()} at {new Date(lastGenerated).toLocaleTimeString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={generateInsight}
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium"
                >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    Regenerate
                </button>
            </div>

            {/* The Report */}
            {/* The Report */}
            <div className="prose prose-invert prose-lg max-w-none">
                <div
                    className="insight-html-content space-y-8"
                    dangerouslySetInnerHTML={{ __html: report }}
                />
            </div>
        </div>
    );
}
