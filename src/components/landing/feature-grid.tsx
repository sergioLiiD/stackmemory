"use client";

import { BentoCard, BentoHeader } from "@/components/ui/bento-card";
import { Terminal, BrainCircuit, MessageSquareText, History, Database, Code2, Box, Sparkles } from "lucide-react";
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
                        <p className="pl-8">"openai": "^4.0.0"</p>
                        <p className="pl-4">{"}"}</p>
                        <p>{"}"}</p>

                        <div className="absolute top-2 right-2 px-2 py-1 bg-[#180260] rounded text-[10px] text-white animate-pulse">
                            Auto-Scanning...
                        </div>
                    </div>
                </BentoCard>

                {/* 2. CONTEXT WEAVER (Large) */}
                <BentoCard className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-neutral-900 to-black" delay={0.2}>
                    <div className="h-full flex flex-col justify-between">
                        <div>
                            <BrainCircuit className="w-8 h-8 text-purple-400 mb-4" />
                            <BentoHeader title="Active Recall" subtitle="Don't search. Just ask." />
                            <p className="text-sm text-neutral-400 mt-4 leading-relaxed">
                                "Where did I define the `useAuth` hook?"<br />
                                "Show me the prisma schema for the User model."<br />
                                It talks back, referencing your exact files.
                            </p>
                        </div>

                        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
                                <Sparkles className="w-3 h-3 text-yellow-400" /> AI Payload Preview
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 w-3/4 bg-white/10 rounded" />
                                <div className="h-2 w-full bg-white/10 rounded" />
                                <div className="h-2 w-5/6 bg-white/10 rounded" />
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

                {/* 4. SERVICE LEDGER */}
                <BentoCard className="md:col-span-1 md:row-span-2" delay={0.4}>
                    <div className="h-full flex flex-col">
                        <Database className="w-8 h-8 text-blue-400 mb-4" />
                        <BentoHeader title="Service Ledger" />
                        <p className="text-sm text-neutral-500 mt-2">
                            Track AWS, Vercel, and DB accounts by project.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2 content-start h-full">
                            {['AWS', 'Vercel', 'Mongo', 'Supabase', 'Stripe', 'Resend'].map((tag) => (
                                <span key={tag} className="px-2 py-1 rounded-md bg-white/10 text-xs text-white/70 border border-white/5">
                                    {tag}
                                </span>
                            ))}
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
