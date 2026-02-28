"use client";

import { useState, useEffect } from "react";
import { Sparkles, FileText, RefreshCw, BookOpen, Layers, Lightbulb } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import { useDashboard } from "../../dashboard-context";
import { useSubscription } from "@/components/billing/subscription-context";
import Link from "next/link";

interface InsightTabProps {
    project: any;
}

export function InsightTab({ project }: InsightTabProps) {
    const [report, setReport] = useState<string | null>(project.insight_report);
    const [loading, setLoading] = useState(false);
    const [lastGenerated, setLastGenerated] = useState<string | null>(project.insight_generated_at);
    const { updateProject } = useDashboard();
    const { checkAccess, usage } = useSubscription();
    const supabase = createClient();

    const generateInsight = async () => {
        if (!checkAccess('insight')) {
            alert(`✨ Limit Reached: You've used ${usage.insight.current}/${usage.insight.limit} insights. Please upgrade for more!`);
            return;
        }

        setLoading(true);
        const previousReport = report;
        setReport(""); // Reset for new generation

        try {
            const response = await fetch("/api/vibe/insight", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: project.id,
                    projectName: project.name
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to generate insight");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedReport = "";

            if (!reader) throw new Error("No reader available");

            // We hide the initial 'Scanning' state once chunks start arriving
            let isFirstChunk = true;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                if (isFirstChunk) {
                    setLoading(false); // Switch from full-page loading to real-time display
                    isFirstChunk = false;
                }

                const chunk = decoder.decode(value, { stream: true });
                accumulatedReport += chunk;
                setReport(accumulatedReport);
            }

            // Cleanup & Persist
            const finalizedReport = accumulatedReport.replace(/```markdown/g, '').replace(/```/g, '');
            setReport(finalizedReport);

            const now = new Date().toISOString();
            setLastGenerated(now);
            updateProject(project.id, {
                insight_report: finalizedReport,
                insight_generated_at: now
            });

        } catch (error: any) {
            console.error("Error generating insight:", error);
            setReport(previousReport); // Restore if failed
            if (error.message.includes('Upgrade to Pro')) {
                alert("✨ Premium Feature: Upgrade to Pro (StackMemory+) to generate Deep Dive Insights!");
            } else {
                alert("Failed to generate insight. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && !report) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="relative">
                    {/* Pulsing Aura */}
                    <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full animate-pulse" />
                    <div className="relative p-8 rounded-3xl bg-neutral-900/50 border border-white/10 backdrop-blur-2xl">
                        <Sparkles className="w-16 h-16 text-blue-400 animate-[spin_4s_linear_infinite]" />
                        {/* Scanning Line Effect */}
                        <div className="absolute left-0 right-0 h-0.5 bg-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.5)] animate-[scan_2s_ease-in-out_infinite] top-0" />
                    </div>
                </div>
                <div className="space-y-3 max-w-md">
                    <h3 className="text-2xl font-semibold text-white tracking-tight">Vibe Architect is Thinking...</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                        Synthesizing file structure, analyzing technical documentation, and drafting your architectural bible using **Gemini 3.1 Pro**.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-[bounce_1s_infinite_0ms]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-[bounce_1s_infinite_200ms]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-[bounce_1s_infinite_400ms]" />
                    </div>
                </div>

                <style jsx>{`
                    @keyframes scan {
                        0% { top: 0% }
                        100% { top: 100% }
                    }
                `}</style>
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
                <div className="flex items-center gap-4">
                    <button
                        onClick={generateInsight}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium"
                    >
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        Regenerate
                    </button>
                    <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/5">
                        Usage: {usage.insight.current}/{usage.insight.limit}
                    </div>
                </div>
            </div>

            {/* The Report */}
            <div className="prose prose-invert prose-lg max-w-none">
                <ReactMarkdown
                    components={{
                        // Hero Header
                        h1: ({ node, ...props }) => (
                            <div className="relative mt-12 mb-8 pb-6 border-b border-white/10">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent tracking-tight" {...props} />
                                <div className="absolute -bottom-px left-0 w-20 h-1 bg-indigo-500/50 rounded-full" />
                            </div>
                        ),
                        // Section Headers
                        h2: ({ node, ...props }) => (
                            <h2 className="text-2xl font-semibold text-white mt-10 mb-6 flex items-center gap-3" {...props}>
                                <span className="w-1 h-8 rounded-full bg-indigo-500 block" />
                                {props.children}
                            </h2>
                        ),
                        // Subheaders
                        h3: ({ node, ...props }) => <h3 className="text-xl font-medium text-indigo-200 mt-8 mb-4 tracking-wide" {...props} />,
                        // Paragraphs
                        p: ({ node, ...props }) => <p className="text-neutral-300 leading-relaxed mb-6 font-light" {...props} />,
                        // Unordered Lists (Feature Grids implicitly)
                        ul: ({ node, ...props }) => <ul className="grid gap-3 my-6" {...props} />,
                        // List Items (Cards)
                        li: ({ node, ...props }) => (
                            <li className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all shadow-lg shadow-black/20">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                                <div className="text-neutral-300 text-sm leading-relaxed">{props.children}</div>
                            </li>
                        ),
                        // Code Blocks
                        code: ({ node, className, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '')
                            const isInline = !match
                            return isInline ? (
                                <code className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-sm" {...props} />
                            ) : (
                                <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0F0F0F] my-6 shadow-2xl">
                                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                                        </div>
                                        <span className="text-xs text-neutral-500 font-mono">{match?.[1]}</span>
                                    </div>
                                    <div className="p-4 overflow-x-auto custom-scrollbar">
                                        <code className={className} {...props} />
                                    </div>
                                </div>
                            )
                        },
                        // Blockquotes (Summary Cards)
                        blockquote: ({ node, children, ...props }) => (
                            <blockquote className="relative p-6 my-8 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-neutral-900/50 border border-indigo-500/20 shadow-xl" {...props}>
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl opacity-50" />
                                <div className="text-indigo-100 italic relative z-10 font-medium text-lg leading-relaxed">{children}</div>
                            </blockquote>
                        ),
                        // Links
                        a: ({ node, ...props }) => <a className="text-indigo-400 hover:text-indigo-300 underline decoration-indigo-500/30 hover:decoration-indigo-300 transition-all font-medium" {...props} />,
                        hr: ({ node, ...props }) => <hr className="my-12 border-white/10" {...props} />,
                    }}
                >
                    {report}
                </ReactMarkdown>
            </div>
        </div>
    );
}
