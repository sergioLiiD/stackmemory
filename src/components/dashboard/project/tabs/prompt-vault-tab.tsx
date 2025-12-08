"use client";

import { Project } from "@/data/mock";
import { Terminal } from "lucide-react";
import { PromptList } from "../../vault/prompt-list";

export function PromptVaultTab({ project }: { project: Project }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                        <Terminal className="w-5 h-5 text-pink-400" /> Prompt Vault
                    </h3>
                    <p className="text-sm text-neutral-500">Don&apos;t lose the magic words that built this app.</p>
                </div>
                <button className="text-xs bg-[#180260] text-white px-3 py-1.5 rounded-lg hover:bg-[#2a04a3] transition-colors shadow-lg shadow-[#180260]/20 font-medium">
                    + Add Prompt
                </button>
            </div>

            <PromptList prompts={project.prompts} />
        </div>
    );
}
