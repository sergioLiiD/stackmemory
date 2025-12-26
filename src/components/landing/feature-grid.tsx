"use client";

import { BentoCard, BentoHeader } from "@/components/ui/bento-card";
import { Terminal, BrainCircuit, MessageSquareText, History, Database, Code2, Box, Sparkles, Map as MapIcon } from "lucide-react";
import Image from "next/image";

export function FeatureGrid() {
    return (
        <section className="max-w-7xl w-full p-4 mx-auto py-20">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">It understands your code. <br /><span className="text-neutral-500">So you don't have to explain it.</span></h2>
                <p className="text-neutral-400 max-w-2xl mx-auto">A complete memory system that acts as the bridge between you and your AI.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 w-full md:h-[900px]">

                {/* 1. MAGIC IMPORT (Large) */}
                <BentoCard className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-[#180260]/40 to-transparent border-[#180260]/50" delay={0.1}>
                    <div className="flex items-start justify-between">
                        <BentoHeader title="Auto-Absorb" subtitle="It reads your package.json and learns your stack instantly." />
                        <Terminal className="w-6 h-6 text-[#a78bfa]" />
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-black/40 font-mono text-xs text-green-400 overflow-hidden relative h-full">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90" />
                        <p>{"{"}</p>
                        <p className="pl-4">"name": "super-app",</p>
                        <p className="pl-4">"dependencies": {"{"}</p>
                        <p className="pl-8">"next": "^14.0.0",</p>
                        <p className="pl-8">"react": "^18.2.0"</p>
                        <p className="pl-8">"@google/generative-ai": "^0.2.0"</p>
                        <p className="pl-4">{"}"}</p>
                        <p>{"}"}</p>

                        <div className="absolute top-2 right-2 px-2 py-1 bg-[#180260] rounded text-[10px] text-white animate-pulse">
                            Auto-Scanning...
                        </div>
                    </div>
                </BentoCard>

                {/* 2. PROJECT INSIGHT (Deep Dive) */}
                <BentoCard className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-indigo-900/40 to-black/80" delay={0.2}>
                    <div className="h-full flex flex-col justify-between">
                        <div>
                            <Sparkles className="w-8 h-8 text-indigo-400 mb-4" />
                            <BentoHeader title="Project Insight" subtitle="The 'Architect's Bible' for your repo." />
                            <p className="text-sm text-neutral-400 mt-4 leading-relaxed">
                                Gemini 2.0 reads every file in your project to generate a comprehensive <strong>"Deep Dive Report"</strong>:
                                Executive Summary, Tech Stack Analysis, and Architecture Map.
                            </p>
                        </div>

                        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-50">
                                <div className="w-20 h-20 bg-indigo-500 blur-3xl rounded-full" />
                            </div>
                            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Report Generated
                            </h4>
                            <div className="space-y-2 text-xs font-mono text-indigo-200 opacity-80">
                                <p>&gt; Analyzing 143 files...</p>
                                <p>&gt; Detected Next.js 14 App Router</p>
                                <p>&gt; Found potential N+1 query in /api/users</p>
                            </div>
                        </div>
                    </div>
                </BentoCard>

                {/* 3. DECISION RECORDS */}
                <BentoCard className="md:col-span-1 md:row-span-2" delay={0.3}>
                    <div className="h-full flex flex-col">
                        <div className="mb-auto">
                            <History className="w-8 h-8 text-orange-400 mb-4" />
                            <BentoHeader title="Living History" />
                            <p className="text-sm text-neutral-500 mt-2">
                                It remembers *why* you chose Supabase over Firebase.
                            </p>
                        </div>

                        <div className="space-y-3 mt-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                    <div className="h-2 w-12 bg-white/20 rounded mb-2" />
                                    <div className="h-1.5 w-full bg-white/10 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </BentoCard>

                {/* 4. VIBE ONBOARD (New) */}
                <BentoCard className="md:col-span-1 md:row-span-2 bg-gradient-to-br from-emerald-900/40 to-black" delay={0.4}>
                    <div className="h-full flex flex-col">
                        <MapIcon className="w-8 h-8 text-emerald-400 mb-4" />
                        <BentoHeader title="Vibe Onboard" subtitle="Auto-generated docs." />
                        <p className="text-sm text-neutral-500 mt-2">
                            It writes the "Getting Started" guide so you don't have to.
                        </p>

                        <div className="mt-6 p-3 rounded-lg bg-neutral-900 border border-white/10 text-[10px] font-mono text-emerald-300 opacity-80">
                            <p># Getting Started</p>
                            <p className="text-neutral-500">1. Install Deps</p>
                            <p className="pl-2">$ npm install</p>
                            <p className="text-neutral-500 mt-1">2. Env Vars</p>
                            <p className="pl-2">cp .env.example .env</p>
                        </div>
                    </div>
                </BentoCard>

                {/* 5. PROMPT LIBRARY (New) */}
                <BentoCard className="md:col-span-2 md:row-span-1 flex flex-row items-center justify-between p-6" delay={0.5}>
                    <div className="flex flex-col justify-center max-w-[60%]">
                        <MessageSquareText className="w-8 h-8 text-pink-400 mb-3" />
                        <BentoHeader title="Omniscient Search" subtitle="Query across all your projects." />
                        <p className="text-xs text-neutral-500 mt-2">"In which project did I use Stripe?"</p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-pink-500 blur-3xl opacity-20" />
                        <div className="relative z-10 bg-black/50 backdrop-blur-md p-3 rounded-lg border border-white/10 text-[10px] text-neutral-300 font-mono w-40">
                            &gt; Found 'Stripe' in 3 projects.
                        </div>
                    </div>
                </BentoCard>

            </div>
        </section>
    );
}
