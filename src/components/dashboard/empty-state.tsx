"use client";

import { motion } from "framer-motion";
import { Plus, Terminal, Box, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    onCreateProject: () => void;
}

export function EmptyState({ onCreateProject }: EmptyStateProps) {
    return (
        <div className="w-full flex flex-col items-center justify-center py-20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md text-center space-y-8"
            >
                {/* Visual Icon */}
                <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative w-full h-full bg-gradient-to-br from-[#180260]/80 to-black border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl">
                        <Box className="w-16 h-16 text-[#a78bfa] opacity-80" />

                        {/* Floating elements */}
                        <motion.div
                            animate={{ y: [-5, 5, -5] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-4 -top-4 p-3 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-xl"
                        >
                            <Terminal className="w-6 h-6 text-green-400" />
                        </motion.div>

                        <motion.div
                            animate={{ y: [5, -5, 5] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -left-4 -bottom-4 p-3 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-xl"
                        >
                            <Plus className="w-6 h-6 text-blue-400" />
                        </motion.div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Your Vault is Empty</h2>
                    <p className="text-neutral-400 text-lg leading-relaxed">
                        StackMemory is the central brain for your projects. <br />
                        Create a project to start syncing your stack, scripts, and architectural decisions.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <button
                        onClick={onCreateProject}
                        className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)]"
                    >
                        <span>Create First Project</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>

                    {/* Optional secondary action if needed */}
                    {/* <button className="px-8 py-3.5 text-neutral-400 hover:text-white font-medium transition-colors">
                        Documentation
                    </button> */}
                </div>

                {/* CLI Hint */}
                <div className="pt-8 opacity-60">
                    <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono">
                        Power User?
                    </p>
                    <p className="text-sm text-neutral-400 mt-2">
                        You can also import directly from GitHub via the UI.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
