"use client";

import { useState } from "react";
import { updateUserTier, updateUserLimit } from "./actions";
import { Settings, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    userId: string;
    initialTier: 'free' | 'pro' | 'founder';
    initialLimit: number | null;
}

export function AdminUserActions({ userId, initialTier, initialLimit }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [tier, setTier] = useState(initialTier);
    const [limit, setLimit] = useState<string>(initialLimit?.toString() || "");
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateUserTier(userId, tier);
            await updateUserLimit(userId, limit ? parseInt(limit) : null);
            setIsOpen(false);
        } catch (error) {
            alert("Failed to update user");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                title="Manage User"
            >
                <Settings className="w-4 h-4" />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-2xl relative">
                <h3 className="text-lg font-medium text-white mb-4">Manage User</h3>

                <div className="space-y-4">
                    {/* Tier Selection */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1">Subscription Tier</label>
                        <select
                            value={tier}
                            onChange={(e) => setTier(e.target.value as any)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa]"
                        >
                            <option value="free">Free (Architect)</option>
                            <option value="pro">Pro (Legend)</option>
                            <option value="founder">Founder</option>
                        </select>
                    </div>

                    {/* Custom Limit */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1">
                            Custom Project Limit
                            <span className="text-neutral-600 ml-1">(Optional)</span>
                        </label>
                        <input
                            type="number"
                            placeholder="Default (Tier Limit)"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a78bfa]"
                        />
                        <p className="text-[10px] text-neutral-500 mt-1">
                            Leave empty to use the tier's default limit.
                        </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-2 rounded-lg bg-neutral-900 text-neutral-400 text-sm hover:bg-neutral-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 rounded-lg bg-[#a78bfa] text-[#1e1b4b] text-sm font-medium hover:bg-[#c4b5fd] transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
