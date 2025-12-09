
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, FileCode, ExternalLink, Bot, User, RefreshCcw } from "lucide-react";
import { Project } from "@/data/mock";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface AssistantTabProps {
    project: Project;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: any[];
}

export function AssistantTab({ project }: AssistantTabProps) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { id: 'welcome', role: 'assistant', content: "Hello! I'm Vibe Coder. I've analyzed your codebase using semantic search. Ask me anything about your logic, components, or architecture." }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        const aiMsgId = (Date.now() + 1).toString();
        // Add placeholder AI message
        setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: "" }]);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMsg.content, projectId: project.id })
            });

            if (!res.ok) throw new Error("Chat failed");
            if (!res.body) throw new Error("No body");

            const reader = res.body.getReader();
            constdecoder = new TextDecoder();
            let done = false;
            let fullText = "";
            let sources: any[] = [];

            while (!done) {
                const { value, done: DONE } = await reader.read();
                done = DONE;
                const chunkValue = new TextDecoder().decode(value);

                fullText += chunkValue;

                // Check for Sources Magic Separator
                if (fullText.includes("__SOURCES__:")) {
                    const parts = fullText.split("__SOURCES__:");
                    const mainContent = parts[0];
                    const sourcesJson = parts[1];

                    if (sourcesJson) {
                        try {
                            sources = JSON.parse(sourcesJson);
                        } catch (e) {
                            // incomplete json, ignore until full
                        }
                    }

                    // Update UI with content only (hide sources raw text)
                    setMessages(prev => prev.map(m =>
                        m.id === aiMsgId ? { ...m, content: mainContent, sources: sources.length ? sources : undefined } : m
                    ));
                } else {
                    setMessages(prev => prev.map(m =>
                        m.id === aiMsgId ? { ...m, content: fullText } : m
                    ));
                }
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: "Sorry, I encountered an error while processing your request." } : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] border border-neutral-200 dark:border-white/10 rounded-3xl overflow-hidden bg-neutral-50 dark:bg-[#0a0a0a]">
            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "flex gap-4 max-w-3xl mx-auto",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                            </div>
                        )}

                        <div className={cn(
                            "rounded-2xl p-4 text-sm leading-relaxed max-w-[85%]",
                            msg.role === 'user'
                                ? "bg-neutral-900 dark:bg-white text-white dark:text-black rounded-tr-sm"
                                : "bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/5 text-neutral-800 dark:text-neutral-200 rounded-tl-sm shadow-sm"
                        )}>
                            {msg.role === 'user' ? (
                                <p>{msg.content}</p>
                            ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            code({ node, className, children, ...props }: any) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return match ? (
                                                    <div className="bg-black/50 rounded-lg p-2 my-2 overflow-x-auto border border-white/10">
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    </div>
                                                ) : (
                                                    <code className="bg-neutral-200 dark:bg-white/10 px-1 py-0.5 rounded text-xs" {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            )}

                            {/* Sources/Citations */}
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-white/5">
                                    <p className="text-[10px] uppercase font-bold text-neutral-500 mb-2 flex items-center gap-1">
                                        <FileCode className="w-3 h-3" /> Sources Analysis
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {msg.sources.map((source, idx) => (
                                            <a
                                                key={idx}
                                                href={`${project.repoUrl}/blob/main/${source.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 hover:border-purple-500/30 hover:bg-purple-500/10 transition-colors text-xs text-neutral-600 dark:text-neutral-400 no-underline"
                                            >
                                                <span className="truncate max-w-[150px]">{source.file_path}</span>
                                                <ExternalLink className="w-3 h-3 opacity-50" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-neutral-500" />
                            </div>
                        )}
                    </motion.div>
                ))}

                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-3xl mx-auto">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-100" />
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-200" />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-[#0a0a0a] border-t border-neutral-200 dark:border-white/10">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Vibe Coder about your project..."
                        className="w-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 rounded-2xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors dark:text-white"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
