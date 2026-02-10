"use client";

import { ArrowRight, Terminal, Copy, Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export function Hero() {
    const [copied, setCopied] = useState(false);

    const copyCommand = () => {
        navigator.clipboard.writeText("npm install stackmemory");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="relative w-full max-w-7xl mx-auto pt-32 pb-20 px-4 flex flex-col items-center text-center z-10">

            {/* Badge */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-green-400 mb-8 backdrop-blur-sm"
            >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                v1.0 Early Access for Developers
            </motion.div>

            {/* Main Heading */}
            <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 max-w-4xl"
            >
                The AI Journal That <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient">
                    Actually Remembers Your Code.
                </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-10 leading-relaxed"
            >
                Powered by <span className="text-white font-medium">Google Gemini 3.0</span>.
                Vibe Coder reads your <strong>entire repo</strong> (docs, config, code) to give you instant answers,
                architectural insights, and deep debugging. Stop explaining your stack repeatedly.
            </motion.p>

            {/* CTAs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col md:flex-row items-center gap-4 w-full justify-center"
            >
                <Link
                    href="/dashboard"
                    className="px-8 py-4 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] md:w-auto w-full justify-center"
                >
                    Start Memory <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Copy Command Button */}
                <button
                    onClick={copyCommand}
                    className="group relative px-6 py-4 rounded-full bg-white/5 border border-white/10 text-neutral-300 font-mono text-sm hover:bg-white/10 transition-colors flex items-center gap-3 md:w-auto w-full justify-center cursor-copy"
                >
                    <span className="text-green-400">$</span>
                    npm install stackmemory
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />}
                </button>
            </motion.div>

            {/* Visual / Terminal Animation Placeholder */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-20 w-full max-w-4xl relative"
            >
                <div className="absolute -inset-1 bg-gradient-to-b from-green-500/20 to-transparent blur-3xl rounded-[2rem] opacity-30" />
                <div className="relative rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden">
                    {/* Terminal Header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 text-red-500 border border-current" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 text-yellow-500 border border-current" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20 text-green-500 border border-current" />
                        </div>
                        <div className="flex-1 text-center text-xs font-mono text-neutral-500">
                            zsh — stackmemory watch
                        </div>
                    </div>

                    {/* Terminal Content */}
                    <div className="p-6 font-mono text-sm text-left space-y-2 h-[300px] overflow-hidden">
                        <div className="flex gap-2">
                            <span className="text-green-400">➜</span>
                            <span className="text-blue-400">my-app</span>
                            <span className="text-neutral-500">git:(main)</span>
                            <span className="text-white">npm install @supabase/supabase-js</span>
                        </div>
                        <div className="text-neutral-400 pb-4">
                            added 1 package, and audited 143 packages in 3s...
                        </div>

                        <div className="flex gap-2 animate-pulse">
                            <span className="text-purple-400">StackMemory</span>
                            <span className="text-neutral-300">Detected new dependency:</span>
                            <span className="text-white font-bold">@supabase/supabase-js</span>
                        </div>
                        <div className="pl-4 border-l-2 border-white/10 ml-1 text-neutral-400 mt-2">
                            <p>Auto-documenting...</p>
                            <p>✓ Version: 2.39.0</p>
                            <p>✓ Added to Stack: Backend / Database</p>
                            <p>✓ Context updated for AI Assistant</p>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <span className="text-green-400">➜</span>
                            <span className="text-blue-400">my-app</span>
                            <span className="text-neutral-500">git:(main)</span>
                            <span className="text-white animate-pulse">_</span>
                        </div>
                    </div>
                </div>
            </motion.div>

        </section>
    );
}
