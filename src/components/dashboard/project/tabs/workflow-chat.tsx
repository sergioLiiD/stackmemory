"use client";

import { useState, useRef, useEffect } from "react";
import { Workflow } from "@/data/mock";
import { Send, Image as ImageIcon, Loader2, Bot, X, FileJson, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/components/billing/subscription-context";
import Link from "next/link";

interface Message {
    role: "user" | "model";
    content: string;
    image?: string; // base64
}

interface WorkflowChatProps {
    workflow: Workflow;
    projectId: string;
}

export function WorkflowChat({ workflow, projectId }: WorkflowChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { checkAccess, usage } = useSubscription();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial greeting or existing summary
    useEffect(() => {
        if (messages.length === 0) {
            if (workflow.ai_description) {
                setMessages([
                    { role: "model", content: `**Quick Summary:**\n${workflow.ai_description}\n\nAsk me anything else about this workflow!` }
                ]);
            } else {
                setMessages([
                    { role: "model", content: "Hello! I've analyzed this workflow. Ask me questions like 'What triggers this?' or 'Where are the credentials used?'" }
                ]);
            }
        }
    }, [workflow]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleImageSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => setImage(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const sendMessage = async () => {
        if ((!input.trim() && !image) || isLoading) return;

        if (!checkAccess('chat')) {
            setMessages(prev => [...prev, {
                role: "model",
                content: `⚠️ **Usage Limit Reached:** You've used ${usage.chat.current}/${usage.chat.limit} chats this month. [Upgrade to Pro](/pricing) for 500 chats/month and unlimited insights.`
            }]);
            return;
        }

        const userMsg: Message = { role: "user", content: input, image: image || undefined };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setImage(null);
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/workflow-explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflow_id: workflow.id,
                    json: workflow.content, // Always send context
                    project_id: projectId,
                    messages: [...messages, userMsg].map(m => ({
                        role: m.role,
                        parts: [
                            { text: m.content },
                            ...(m.image ? [{ inline_data: { mime_type: "image/png", data: m.image.split(',')[1] } }] : [])
                        ]
                    }))
                })
            });

            if (!response.ok) throw new Error("Failed to fetch response");

            const data = await response.json();
            const aiMsg: Message = { role: "model", content: data.reply };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "model", content: "⚠️ Sorry, I encountered an error analyzing that." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-neutral-950 text-white">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-neutral-900">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#ff6d5a]/10 text-[#ff6d5a] flex items-center justify-center">
                        <FileJson className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{workflow.name}</h3>
                        <p className="text-xs text-neutral-500">Multimodal Workflow Agent</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={cn("flex gap-3 max-w-[90%]", m.role === "user" ? "ml-auto flex-row-reverse" : "")}>
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1", m.role === "user" ? "bg-white/10" : "bg-gradient-to-br from-[#ff6d5a] to-orange-600")}>
                            {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-white" />}
                        </div>
                        <div className={cn("rounded-2xl px-4 py-3 text-sm leading-relaxed", m.role === "user" ? "bg-white/10 text-white" : "bg-neutral-900 border border-white/5 text-neutral-300")}>
                            {m.image && (
                                <img src={m.image} alt="Upload" className="max-w-full rounded-lg mb-2 border border-white/10" />
                            )}
                            <div className="whitespace-pre-wrap">{m.content}</div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff6d5a] to-orange-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-neutral-900 border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-[#ff6d5a] animate-spin" />
                            <span className="text-xs text-neutral-500">Analyzing nodes & logic...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-neutral-900 border-t border-white/10">
                {image && (
                    <div className="mb-2 relative inline-block">
                        <img src={image} alt="Preview" className="h-16 rounded-md border border-white/20" />
                        <button
                            onClick={() => setImage(null)}
                            className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white hover:bg-red-600"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
                <div className="flex gap-2">
                    <label className="p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors text-neutral-400 hover:text-white">
                        <ImageIcon className="w-5 h-5" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageSelect(e.target.files)} />
                    </label>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Ask about this workflow..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-[#ff6d5a]/50 placeholder:text-neutral-600"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={(!input.trim() && !image) || isLoading}
                        className="p-3 rounded-xl bg-[#ff6d5a] hover:bg-[#ff6d5a]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
