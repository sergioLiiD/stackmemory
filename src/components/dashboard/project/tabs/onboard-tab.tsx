"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, GraduationCap, Map, Terminal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import { useDashboard } from "../../dashboard-context";

interface OnboardTabProps {
    project: any;
}

export function OnboardTab({ project }: OnboardTabProps) {
    const [guide, setGuide] = useState<string | null>(project.onboarding_guide);
    const [loading, setLoading] = useState(false);
    const [lastGenerated, setLastGenerated] = useState<string | null>(project.onboarding_generated_at);
    const { updateProject } = useDashboard();

    // Explicitly assume project has onboarding_guide field now (types might need update in mock.ts/interface later)

    const generateGuide = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/vibe/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId: project.id }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to generate guide");
            }

            const data = await response.json();

            // Update Context
            updateProject(project.id, {
                onboarding_guide: data.report,
                onboarding_generated_at: new Date().toISOString()
            });

            setGuide(data.report);
            setLastGenerated(new Date().toISOString());
        } catch (error: any) {
            console.error("Error generating guide:", error);
            if (error.message.includes('Upgrade to Pro')) {
                alert("✨ Premium Feature: Upgrade to Pro to generate AI Onboarding Guides for your team!");
            } else {
                alert("Failed to generate guide. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                    <Terminal className="w-16 h-16 text-emerald-400 animate-pulse relative z-10" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-medium text-white">Drafting Protocols...</h3>
                    <p className="text-neutral-400">
                        Vibe Coder is analyzing your scripts and environment to write the perfect "Getting Started" guide.
                    </p>
                </div>
            </div>
        );
    }

    if (!guide) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <GraduationCap className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="space-y-2 max-w-lg">
                    <h3 className="text-xl font-semibold text-white">Project Onboarding</h3>
                    <p className="text-neutral-400">
                        Generate a "Getting Started" guide tailored to this codebase.
                        Includes prerequisites, installation steps, and architecture overview.
                    </p>
                </div>
                <button
                    onClick={generateGuide}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20"
                >
                    <Sparkles className="w-4 h-4" />
                    Generate Onboarding Guide
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header / Actions */}
            <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-neutral-900/50 to-neutral-900/30 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                        <Map className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white tracking-tight">Onboarding Protocol</h3>
                        {lastGenerated && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-xs font-medium text-neutral-400">
                                    Generated {new Date(lastGenerated).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={generateGuide}
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium"
                >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    Regenerate
                </button>
            </div>

            {/* The Guide */}
            <div className="div-prose">
                <ReactMarkdown
                    components={{
                        h1: ({ node, ...props }) => (
                            <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                            <h2 className="text-xl font-bold text-emerald-300 mt-8 mb-4 flex items-center gap-2" {...props} />
                        ),
                        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-white mt-6 mb-3" {...props} />,
                        p: ({ node, ...props }) => <p className="text-neutral-300 leading-relaxed mb-4" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-6 text-neutral-300" {...props} />,
                        li: ({ node, ...props }) => <li className="marker:text-emerald-500" {...props} />,
                        // Code blocks are important for onboarding (install commands)
                        code: ({ node, className, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '')
                            const isInline = !match
                            return isInline ? (
                                <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-emerald-300 font-mono text-sm" {...props} />
                            ) : (
                                <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0F0F0F] my-6">
                                    <div className="p-4 overflow-x-auto">
                                        <code className={className} {...props} />
                                    </div>
                                </div>
                            )
                        },
                        blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 my-6 bg-emerald-500/5 italic text-neutral-400" {...props} />
                        ),
                    }}
                >
                    {guide}
                </ReactMarkdown>
            </div>
        </div>
    );
}
