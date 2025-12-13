"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Copy, Check, ChevronRight, Key } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CliInstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CliInstructionsModal({ isOpen, onClose }: CliInstructionsModalProps) {
    const [copiedStep, setCopiedStep] = useState<number | null>(null);

    const copyToClipboard = (text: string, stepIndex: number) => {
        navigator.clipboard.writeText(text);
        setCopiedStep(stepIndex);
        setTimeout(() => setCopiedStep(null), 2000);
    };

    const steps = [
        {
            title: "Install the CLI",
            description: "Install the StackMemory package globally to use it in any project.",
            command: "npm install -g stackmemory",
            icon: Terminal
        },
        {
            title: "Authenticate",
            description: "Set your API Key as an environment variable.",
            command: "export STACKMEMORY_API_KEY=sm_live_xxxxxxxxxxxx",
            icon: Key
        },
        {
            title: "Start Watching",
            description: "Run the watcher in your project root. It will detect new packages automatically.",
            command: "stackmemory watch",
            icon: ChevronRight
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-lg flex flex-col bg-[#0a0a0a] border border-[#180260]/50 rounded-2xl overflow-hidden shadow-2xl shadow-[#180260]/20"
                    >
                        {/* Header */}
                        <div className="px-6 pt-6 pb-2 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Terminal className="w-5 h-5 text-[#a78bfa]" /> CLI Setup
                                </h2>
                                <p className="text-neutral-400 text-sm mt-1">Connect your local environment to the Vault.</p>
                            </div>
                            <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {steps.map((step, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-neutral-300 border border-white/10">
                                            {index + 1}
                                        </div>
                                        {step.title}
                                    </div>
                                    <p className="text-xs text-neutral-500 pl-8">{step.description}</p>

                                    <div className="relative pl-8 group">
                                        <div className="bg-black/50 border border-white/10 rounded-lg p-3 font-mono text-sm text-[#a78bfa] flex items-center justify-between">
                                            <span>{step.command}</span>
                                            <button
                                                onClick={() => copyToClipboard(step.command, index)}
                                                className="p-1.5 rounded-md hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
                                            >
                                                {copiedStep === index ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                            <p className="text-xs text-neutral-500">
                                Need help? <a href="#" className="text-white hover:underline">Read the full documentation</a>
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
