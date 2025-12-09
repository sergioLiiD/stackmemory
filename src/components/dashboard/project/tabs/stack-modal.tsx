"use client";

import { useState, useEffect } from "react";
import { StackItem } from "@/data/mock";
import { motion, AnimatePresence } from "framer-motion";
import { X, Layers, Box, Info } from "lucide-react";

interface StackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: StackItem) => void;
    initialItem?: StackItem | null;
}

export function StackModal({ isOpen, onClose, onSave, initialItem }: StackModalProps) {
    const [name, setName] = useState("");
    const [version, setVersion] = useState("");
    const [type, setType] = useState<StackItem['type']>('other');
    const [notes, setNotes] = useState("");

    // Reset or Fill form when opening/changing initialItem
    useEffect(() => {
        if (isOpen) {
            if (initialItem) {
                setName(initialItem.name);
                setVersion(initialItem.version || "");
                setType(initialItem.type);
                setNotes(initialItem.notes || "");
            } else {
                // Reset for add mode
                setName("");
                setVersion("");
                setType("other");
                setNotes("");
            }
        }
    }, [isOpen, initialItem]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            version: version || undefined,
            type,
            notes: notes || undefined
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-lg bg-[#0a0a0a] border border-[#a78bfa]/20 rounded-2xl overflow-hidden shadow-2xl"
                >
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#121212]">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Layers className="w-5 h-5 text-[#a78bfa]" />
                            {initialItem ? "Edit Technology" : "Add Technology"}
                        </h2>
                        <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Name <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Next.js"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Version</label>
                                <input
                                    value={version}
                                    onChange={(e) => setVersion(e.target.value)}
                                    placeholder="e.g. 14.2.0"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa]"
                            >
                                <option value="frontend">Frontend</option>
                                <option value="backend">Backend</option>
                                <option value="database">Database</option>
                                <option value="devops">DevOps</option>
                                <option value="ai">AI / LLM</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                                Notes
                                <span className="text-xs text-neutral-600 font-normal ml-auto">Optional</span>
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Why was this chosen? Any quirks?"
                                className="w-full h-24 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa] resize-none"
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
                                className="px-6 py-2 bg-[#a78bfa] text-[#1e1b4b] font-bold rounded-lg hover:bg-[#c4b5fd] transition-colors shadow-lg shadow-[#a78bfa]/20"
                            >
                                {initialItem ? "Save Changes" : "Add to Stack"}
                            </button>
                        </div>

                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
