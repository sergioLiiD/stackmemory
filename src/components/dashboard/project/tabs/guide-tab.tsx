"use client";

import { motion } from "framer-motion";
import { HelpCircle, ChevronDown, Sparkles, Waves, Layout, Box, Book } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FAQItem {
    question: string;
    answer: React.ReactNode;
    icon?: any;
}

const faqs: FAQItem[] = [
    {
        icon: Layout,
        question: "Overview & Service Locker",
        answer: (
            <div className="space-y-2 text-sm text-neutral-400">
                <p>The <b>Overview</b> is your mission control. Here you can:</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li><b>Metadata:</b> Edit repo/live links and deployment info.</li>
                    <li><b>Service Locker:</b> Track 3rd party services (Vercel, AWS, Supabase) and their costs so you never lose track of an account.</li>
                    <li><b>Semantic Indexing:</b> Sync your codebase to enable the AI features. This must be done first!</li>
                </ul>
            </div>
        )
    },
    {
        icon: Sparkles,
        question: "Vibe Coder (AI Assistant)",
        answer: (
            <div className="space-y-2 text-sm text-neutral-400">
                <p>An intelligent assistant that knows your code.</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li><b>Chat:</b> Ask questions like "How does the auth flow work?" or "Where is the user component?".</li>
                    <li><b>RAG Technology:</b> We use vector embeddings to find the exact files relevant to your question before sending it to GPT-4o.</li>
                    <li><b>Citations:</b> The bot will tell you exactly which files it read to give you the answer.</li>
                </ul>
            </div>
        )
    },
    {
        icon: Waves,
        question: "Context Weaver & Prompts",
        answer: (
            <div className="space-y-2 text-sm text-neutral-400">
                <p>Generate "Mega-Prompts" (The Wave) to use in external tools like Claude or ChatGPT.</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li><b>The Wave:</b> We bundle your `README.md`, `package.json`, and File Tree into a massive context block.</li>
                    <li><b>Manual Context:</b> You add your specific request (e.g. "I want to add a blog feature").</li>
                    <li><b>Result:</b> You get a specialized prompt that "onboards" any LLM to your project instantly.</li>
                    <li><b>Prompt Vault:</b> Save your best manual prompts or generated waves for later reuse.</li>
                </ul>
            </div>
        )
    },
    {
        icon: Box,
        question: "Stack Management",
        answer: (
            <div className="space-y-2 text-sm text-neutral-400">
                <p>Keep your tech stack documented and up to date.</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li><b>Magic Import:</b> If `package.json` exists, we can auto-detect frameworks and libraries.</li>
                    <li><b>Manual Entry:</b> Add specific versions or tools that aren't in package.json (like Docker or Figma).</li>
                    <li><b>Notes:</b> Add context on WHY you chose a specific technology.</li>
                </ul>
            </div>
        )
    },
    {
        icon: Book,
        question: "Journal & Snippets",
        answer: (
            <div className="space-y-2 text-sm text-neutral-400">
                <ul className="list-disc pl-4 space-y-1">
                    <li><b>Journal:</b> A timeline of your decisions. "Why did we switch to Next.js?". Document it here so you don't forget.</li>
                    <li><b>Snippets:</b> Store reusable blocks of code that handle specific logic for this project.</li>
                </ul>
            </div>
        )
    }
];

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem, isOpen: boolean, onToggle: () => void }) {
    return (
        <div className="border border-neutral-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#121212] overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-neutral-100 dark:bg-white/5 text-neutral-500", isOpen && "text-blue-500 bg-blue-500/10")}>
                        <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-white">{item.question}</span>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-neutral-400 transition-transform", isOpen && "rotate-180")} />
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0 }}
                className="overflow-hidden"
            >
                <div className="p-4 pt-0 text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-dashed border-neutral-200 dark:border-white/10 mt-2">
                    {item.answer}
                </div>
            </motion.div>
        </div>
    );
}

export function GuideTab() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center justify-center gap-2 mb-2">
                    <HelpCircle className="w-8 h-8 text-yellow-400" />
                    How to use StackMemory
                </h2>
                <p className="text-neutral-500">
                    Master the tools to accelerate your workflow.
                </p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <FAQAccordion
                        key={i}
                        item={faq}
                        isOpen={openIndex === i}
                        onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                    />
                ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/10 text-center">
                <h4 className="text-white font-bold mb-2">Still have questions?</h4>
                <p className="text-sm text-neutral-400 mb-4">
                    We are constantly improving. Check the roadmap for upcoming features.
                </p>
                <a
                    href="https://github.com/sergioLiiD/stackmemory"
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-colors"
                >
                    View on GitHub
                </a>
            </div>
        </div>
    );
}
