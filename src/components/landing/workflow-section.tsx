"use client";

import { Terminal, BrainCircuit, MessageSquareText } from "lucide-react";
import { motion } from "framer-motion";

export function WorkflowSection() {
    const steps = [
        {
            icon: Terminal,
            title: "1. Auto-Sync CLI",
            desc: "Don't copy-paste. Run 'npm install stackmemory' and our invisible CLI watcher updates your Vault whenever you install a new package.",
            color: "text-blue-400",
            badge: "New"
        },
        {
            icon: BrainCircuit,
            title: "2. Context Weaver",
            desc: "One click to compile your Stack + Rules + Active Prompts into a single payload for ChatGPT or Claude.",
            color: "text-purple-400"
        },
        {
            icon: MessageSquareText,
            title: "3. Chat with your Stack",
            desc: "It's not just a database. It's a conversation. Ask about your architecture, your history, or your code snippets as if you were talking to a Senior Dev who memorized your repo.",
            color: "text-green-400"
        }
    ];

    return (
        <section className="w-full max-w-6xl p-4 py-20 mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Zero Friction Workflow</h2>
                <p className="text-neutral-400 max-w-2xl mx-auto">We know you hate documentation. So we made it automatic.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, i) => (
                    <motion.div
                        whileHover={{ y: -5 }}
                        key={i}
                        className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-colors"
                    >
                        {step.badge && (
                            <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-[#180260] text-[#a78bfa] text-[10px] font-bold uppercase tracking-wider border border-[#a78bfa]/20">
                                {step.badge}
                            </div>
                        )}
                        <div className={`p-4 rounded-2xl bg-white/5 mb-6 ${step.color} group-hover:scale-110 transition-transform`}>
                            <step.icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                        <p className="text-neutral-400 text-sm leading-relaxed">{step.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
