"use client";

import { useState } from "react";
import { JournalEntry } from "@/data/mock";
import { motion, AnimatePresence } from "framer-motion";
import { X, Book, Calendar, Sparkles } from "lucide-react";
import { useDashboard } from "../../dashboard-context";

interface JournalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: JournalEntry) => void;
    projectId: string; // [NEW] Pass ID directly
}

export function JournalModal({ isOpen, onClose, onSave, projectId }: JournalModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [isAutoTagging, setIsAutoTagging] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: JournalEntry = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            content,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        onSave(newEntry);
        handleClose();
    };

    const handleClose = () => {
        onClose();
        setTitle("");
        setContent("");
        setTags("");
    };

    const handleAutoTag = async () => {
        if (!content || content.length < 10) {
            alert("Please write a bit more content first!");
            return;
        }

        setIsAutoTagging(true);
        try {
            const res = await fetch('/api/vibe/auto-tag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    projectId: projectId
                })
            });

            const data = await res.json();
            if (data.tags && Array.isArray(data.tags)) {
                const currentTags = tags.split(',').map(t => t.trim()).filter(Boolean);
                const uniqueTags = Array.from(new Set([...currentTags, ...data.tags]));
                setTags(uniqueTags.join(', '));
            }

        } catch (error) {
            console.error("Auto-tag failed", error);
        } finally {
            setIsAutoTagging(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-2xl bg-[#0a0a0a] border border-[#a78bfa]/20 rounded-2xl overflow-hidden shadow-2xl"
                >
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#121212]">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Book className="w-5 h-5 text-[#a78bfa]" />
                            New Journal Entry
                        </h2>
                        <button onClick={handleClose} className="text-neutral-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400">Title <span className="text-red-500">*</span></label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Architectural Decision"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa]"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400">Content <span className="text-neutral-600">(Markdown supported)</span> <span className="text-red-500">*</span></label>
                            <textarea
                                required
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your thoughts here..."
                                className="w-full h-40 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa] resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400 flex items-center justify-between">
                                <span>Tags <span className="text-neutral-600">(Comma separated)</span></span>
                                <button
                                    type="button"
                                    onClick={handleAutoTag}
                                    disabled={isAutoTagging || !content}
                                    className="flex items-center gap-1.5 text-xs text-[#a78bfa] hover:text-[#c4b5fd] disabled:opacity-50 transition-colors"
                                >
                                    <Sparkles className={`w-3 h-3 ${isAutoTagging ? 'animate-spin' : ''}`} />
                                    {isAutoTagging ? 'Analyzing...' : 'Auto-Tag'}
                                </button>
                            </label>
                            <input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g. planning, backend, refactor"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa]"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-[#a78bfa] text-[#1e1b4b] font-bold rounded-lg hover:bg-[#c4b5fd] transition-colors shadow-lg shadow-[#a78bfa]/20"
                            >
                                Save Entry
                            </button>
                        </div>

                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
