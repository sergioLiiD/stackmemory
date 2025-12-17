"use client";

import { AlertTriangle, Brain, Lightbulb } from "lucide-react";

export function ProblemSection() {
    return (
        <section className="w-full py-24 bg-[#050505]">
            <div className="max-w-4xl mx-auto px-4 text-center">

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
                    The Problem: AI has Amnesia.
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">

                    {/* PROBLEM */}
                    <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/10">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                            <h3 className="text-xl font-semibold text-white">Zero Context</h3>
                        </div>
                        <p className="text-neutral-400 leading-relaxed">
                            Every time you start a new chat, you have to re-explain your stack.<br />
                            "I use Next.js 14, not 12."<br />
                            "Remember, we use Tailwind, not CSS Modules."
                        </p>
                        <div className="mt-6 p-4 rounded bg-red-950/30 text-red-200/70 text-sm italic border-l-2 border-red-500/20">
                            Result: You spend 20% of your time coding, and 80% correcting the AI.
                        </div>
                    </div>

                    {/* SOLUTION */}
                    <div className="p-8 rounded-2xl bg-green-500/5 border border-green-500/10">
                        <div className="flex items-center gap-3 mb-4">
                            <Lightbulb className="w-6 h-6 text-green-400" />
                            <h3 className="text-xl font-semibold text-white">The Fix: Permanent Memory</h3>
                        </div>
                        <p className="text-neutral-400 leading-relaxed">
                            StackMemory creates a <strong>Permanent Cognitive Layer</strong> for your project.
                        </p>
                        <ul className="mt-6 space-y-3">
                            <li className="flex items-center gap-2 text-neutral-300">
                                <Brain className="w-4 h-4 text-green-400" />
                                <span>It knows your exact tech stack versions</span>
                            </li>
                            <li className="flex items-center gap-2 text-neutral-300">
                                <Brain className="w-4 h-4 text-green-400" />
                                <span>It remembers your architectural decisions</span>
                            </li>
                            <li className="flex items-center gap-2 text-neutral-300">
                                <Brain className="w-4 h-4 text-green-400" />
                                <span>You can ask it: "How do we handle auth in this project?"</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </section>
    );
}
