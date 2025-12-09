"use client";

import { useState } from "react";
import { Service } from "@/data/mock";
import { motion, AnimatePresence } from "framer-motion";
import { X, Server, Link as LinkIcon, Hash, FileText, LayoutGrid } from "lucide-react";

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Service) => void;
}

export function ServiceModal({ isOpen, onClose, onSave }: ServiceModalProps) {
    const [provider, setProvider] = useState("");
    const [name, setName] = useState("");
    const [account, setAccount] = useState("");
    const [cost, setCost] = useState("");
    const [url, setUrl] = useState("");
    const [category, setCategory] = useState<Service['category']>('infrastructure');
    const [notes, setNotes] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            provider,
            name,
            account,
            cost,
            status: 'active',
            url,
            category,
            notes
        });
        onClose();
        resetForm();
    };

    const resetForm = () => {
        setProvider("");
        setName("");
        setAccount("");
        setCost("");
        setUrl("");
        setCategory("infrastructure");
        setNotes("");
    };

    const handleClose = () => {
        onClose();
        resetForm();
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
                            <Server className="w-5 h-5 text-[#a78bfa]" />
                            Add Service
                        </h2>
                        <button onClick={handleClose} className="text-neutral-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-neutral-500 flex items-center gap-1">
                                    <LayoutGrid className="w-3 h-3" /> Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as any)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa] appearance-none"
                                >
                                    <option value="infrastructure">Infrastructure</option>
                                    <option value="social">Social Media</option>
                                    <option value="saas">SaaS</option>
                                    <option value="newsletter">Newsletter</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-neutral-500 flex items-center gap-1">
                                    <LinkIcon className="w-3 h-3" /> URL
                                </label>
                                <input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400">Provider <span className="text-red-500">*</span></label>
                            <input
                                required
                                value={provider}
                                onChange={(e) => setProvider(e.target.value)}
                                placeholder="e.g. Vercel, AWS, Supabase"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa]"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400">Service Type/Name <span className="text-red-500">*</span></label>
                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Hosting, Database, Storage"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400">Account / Email Used <span className="text-red-500">*</span></label>
                            <input
                                required
                                value={account}
                                onChange={(e) => setAccount(e.target.value)}
                                placeholder="e.g. team@company.com"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400">Monthly Cost</label>
                            <input
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                placeholder="e.g. $20/mo, Free"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-neutral-500 flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Secure Notes <span className="text-[9px] normal-case text-neutral-600">(Hints only)</span>
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Backup email: x@x.com, Created via FB Business..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa] h-20 resize-none"
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
                                Add Service
                            </button>
                        </div>

                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
