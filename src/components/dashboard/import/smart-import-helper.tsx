"use client";

import { Copy, Bot } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const GENERATOR_PROMPT = `Please generate a **DEV_MEMORY.md** file for this project with the following details:

1. **Project Identity:** Name and elevator pitch description.
2. **Status:** Current state (Idea, MVP, Production, or Archived).
3. **Tech Stack:** List all libraries, frameworks, and tools used. Include version numbers if known.
4. **Services & Accounts:** List every external service (Vercel, Supabase, AWS, n8n, etc.). 
   *IMPORTANT:* Specify WHICH email/account is used for each service (e.g., "Supabase: personal@gmail.com", "AWS: work-admin@company.com").
5. **Deployment:** GitHub repository URL and Live Production URL.
6. **Env Vars:** List necessary environment variable names (KEYS only, no values).
7. **Key Prompts:** Include the main system prompt used to generate this app.`;

export function SmartImportHelper() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(GENERATOR_PROMPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mb-4 p-4 rounded-xl bg-[#180260]/20 border border-[#180260]/30 shadow-inner">
            <h4 className="flex items-center gap-2 text-white font-bold mb-2 text-sm">
                <Bot className="w-4 h-4 text-[#a78bfa]" />
                Step 1: Get Project Context
            </h4>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
                If you are using an AI generator (Bolt/Lovable), ask it to create a summary file for you.
                <br /><span className="text-[#a78bfa] font-medium">Copy this prompt</span> and paste it into your AI chat, then come back here with the result.
            </p>

            <div className="relative">
                <pre className="text-xs text-neutral-300 bg-black/40 p-4 rounded-lg border border-white/10 overflow-y-auto max-h-64 font-mono white-space-pre-wrap">
                    {GENERATOR_PROMPT}
                </pre>
                {/* Gradient overlay removed to ensure full visibility when scrolling */}
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-[#a78bfa] text-[#180260] text-xs font-bold flex items-center gap-2 hover:bg-white transition-colors"
                >
                    {copied ? "Copied!" : (
                        <>
                            <Copy className="w-3 h-3" /> Copy Prompt
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
