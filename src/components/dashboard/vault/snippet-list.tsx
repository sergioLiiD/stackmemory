"use client";

import { Snippet } from "@/data/mock";
import { Code2, FileCode } from "lucide-react";

interface SnippetListProps {
    snippets?: Snippet[];
}

export function SnippetList({ snippets }: SnippetListProps) {
    return (
        <div className="grid gap-6">
            {snippets?.map((snippet) => (
                <div key={snippet.id} className="rounded-3xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors">
                    <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileCode className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-bold text-foreground">{snippet.title}</span>
                        </div>
                        <span className="text-[10px] uppercase text-muted-foreground font-bold">{snippet.language}</span>
                    </div>
                    <div className="p-4 bg-muted/10 backdrop-blur-sm overflow-x-auto">
                        <pre className="text-sm font-mono text-muted-foreground">
                            <code>{snippet.code}</code>
                        </pre>
                    </div>
                    {snippet.description && (
                        <div className="p-3 border-t border-border text-xs text-muted-foreground bg-muted/20">
                            {snippet.description}
                        </div>
                    )}
                </div>
            ))}

            {!snippets?.length && (
                <div className="p-12 text-center border border-dashed border-border rounded-3xl bg-card/50">
                    <Code2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No code snippets saved.</p>
                </div>
            )}
        </div>
    );
}
