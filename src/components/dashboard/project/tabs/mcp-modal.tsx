"use client";

import { useState, useEffect } from "react";
import { MCPServer } from "@/data/mock";
import { motion, AnimatePresence } from "framer-motion";
import { X, Network, Terminal, Code2, Play, Settings } from "lucide-react";

interface MCPModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (server: MCPServer) => void;
    initialData?: MCPServer | null;
}

export function MCPModal({ isOpen, onClose, onSave, initialData }: MCPModalProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState<'stdio' | 'sse'>('stdio');
    const [command, setCommand] = useState("");
    const [args, setArgs] = useState("");
    const [description, setDescription] = useState("");

    // Future: Env vars editor

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setCommand(initialData.command || "");
            setArgs(initialData.args?.join(" ") || "");
            setDescription(initialData.description || "");
        } else {
            resetForm();
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: initialData?.id || crypto.randomUUID(),
            name,
            type,
            command,
            args: args.split(" ").filter(Boolean),
            description,
            status: initialData?.status || 'active'
        });
        onClose();
        resetForm();
    };

    const resetForm = () => {
        setName("");
        setType("stdio");
        setCommand("");
        setArgs("");
        setDescription("");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-lg bg-[#0a0a0a] border border-cyan-500/20 rounded-2xl overflow-hidden shadow-2xl"
                >
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#121212]">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Network className="w-5 h-5 text-cyan-400" />
                            {initialData ? "Edit Context Bridge" : "New Context Bridge"}
                        </h2>
                        <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">

                        {/* Type Selection */}
                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                            <button
                                type="button"
                                onClick={() => setType('stdio')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-colors ${type === 'stdio'
                                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                        : 'text-neutral-500 hover:text-neutral-300'
                                    }`}
                            >
                                <Terminal className="w-3 h-3" /> STDIO (Local)
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('sse')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-colors ${type === 'sse'
                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                        : 'text-neutral-500 hover:text-neutral-300'
                                    }`}
                            >
                                <Network className="w-3 h-3" /> SSE (Remote)
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400">Server Name <span className="text-red-500">*</span></label>
                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Postgres MCP"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                                autoFocus
                            />
                        </div>

                        {type === 'stdio' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">Command <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Play className="absolute left-3 top-2.5 w-3 h-3 text-neutral-500" />
                                        <input
                                            required
                                            value={command}
                                            onChange={(e) => setCommand(e.target.value)}
                                            placeholder="npx"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">Arguments</label>
                                    <input
                                        value={args}
                                        onChange={(e) => setArgs(e.target.value)}
                                        placeholder="-y @modelcontextprotocol/server-postgres"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Server URL <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={command} // Reuse command field for URL in SSE mode for now
                                    onChange={(e) => setCommand(e.target.value)}
                                    placeholder="https://mcp-server.com/sse"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-neutral-500 flex items-center gap-1">
                                <Code2 className="w-3 h-3" /> Description / Purpose
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Allows AI to query the database tables..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 h-20 resize-none"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-cyan-900/50 text-cyan-200 border border-cyan-500/50 font-bold rounded-lg hover:bg-cyan-900 transition-colors shadow-lg shadow-cyan-900/20"
                            >
                                {initialData ? "Save Bridge" : "Create Bridge"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
