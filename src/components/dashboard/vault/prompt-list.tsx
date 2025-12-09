"use client";

import { TopPrompt } from "@/data/mock";
import { Copy, Wand2 } from "lucide-react";

interface PromptListProps {
    prompts?: TopPrompt[];
}

export function PromptList({ prompts }: PromptListProps) {

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-6">
            {prompts?.map((prompt) => (
                <div key={prompt.id} className="group rounded-3xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-colors">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                        <div>
                            <h4 className="font-bold text-foreground text-sm mb-1">{prompt.title}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                MODEL: {prompt.model}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => copyToClipboard(prompt.prompt)}
                                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                title="Copy Prompt"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="p-4 bg-muted/10 backdrop-blur-sm">
                        <pre className="text-sm text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                            {prompt.prompt}
                        </pre>
                    </div>
                </div>
            ))}

            {!prompts?.length && (
                <div className="p-12 text-center border border-dashed border-border rounded-3xl bg-card/50">
                    <Wand2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <h4 className="text-foreground font-medium mb-1">Vault Empty</h4>
                    <p className="text-sm text-muted-foreground">Save your best prompts here to reuse them later.</p>
                </div>
            )}
        </div>
    );
}
