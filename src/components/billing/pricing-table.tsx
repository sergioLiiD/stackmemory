"use client";

import { Check, Zap, Shield, Globe, Github, Sparkles, Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-context";

interface PricingProps {
    currentTier?: 'free' | 'pro' | 'founder';
}

export function PricingTable({ currentTier = 'free' }: PricingProps) {
    const { user } = useAuth();
    const [planType, setPlanType] = useState<'monthly' | 'founder'>('monthly');

    const getCheckoutLink = (type: 'monthly' | 'founder') => {
        const baseUrl = type === 'monthly'
            ? "https://store.stackmemory.app/checkout/buy/63f72d1c-1936-42ca-bd94-54c1cb13f836"
            : "https://store.stackmemory.app/checkout/buy/546bb2de-c49f-421e-9d81-8ac465dbbbbf";

        if (user?.id) {
            return `${baseUrl}?checkout[custom][user_id]=${user.id}`;
        }
        return baseUrl;
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Plan Toggle */}
            <div className="flex justify-center mb-10">
                <div className="bg-white/5 p-1 rounded-xl flex items-center gap-1 border border-white/10">
                    <button
                        onClick={() => setPlanType('monthly')}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            planType === 'monthly' ? "bg-[#a78bfa] text-[#1e1b4b]" : "text-neutral-400 hover:text-white"
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setPlanType('founder')}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                            planType === 'founder' ? "bg-amber-400 text-amber-950" : "text-neutral-400 hover:text-white"
                        )}
                    >
                        Founder Deal <Sparkles className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* Free Tier */}
                <div className="p-8 rounded-3xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-sm relative overflow-hidden flex flex-col">
                    <div className="relative z-10 flex-1">
                        <h3 className="text-lg font-medium text-neutral-400 mb-2">Architect (Free)</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-3xl font-bold text-white">$0</span>
                            <span className="text-sm text-neutral-500">/forever</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-sm text-neutral-300">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Up to 5 Projects</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-neutral-300">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Manual Deployment Import</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-neutral-300">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Basic Search (No AI)</span>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-auto">
                        {currentTier === 'free' ? (
                            <div className="w-full py-3 rounded-xl bg-white/5 border border-white/5 text-center text-sm font-medium text-neutral-500">
                                Current Plan
                            </div>
                        ) : (
                            <div className="w-full py-3 rounded-xl bg-transparent text-center text-sm font-medium text-neutral-600">
                                Downgrade not available
                            </div>
                        )}
                    </div>
                </div>

                {/* Pro / Founder Tier */}
                <div
                    className={cn(
                        "p-8 rounded-3xl border transition-all duration-500 relative overflow-hidden group flex flex-col",
                        planType === 'founder'
                            ? "border-amber-500/30 bg-gradient-to-b from-amber-900/20 to-[#0a0a0a] hover:border-amber-500/50"
                            : "border-[#a78bfa]/30 bg-gradient-to-b from-[#180260]/20 to-[#0a0a0a] hover:border-[#a78bfa]/50"
                    )}
                >
                    <div
                        className={cn(
                            "absolute inset-0 transition-colors duration-500",
                            planType === 'founder' ? "bg-amber-500/5 group-hover:bg-amber-500/10" : "bg-[#a78bfa]/5 group-hover:bg-[#a78bfa]/10"
                        )}
                    />

                    <div className="relative z-10 flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3
                                className={cn(
                                    "text-lg font-medium transition-colors duration-300",
                                    planType === 'founder' ? "text-amber-400" : "text-[#a78bfa]"
                                )}
                            >
                                {planType === 'founder' ? 'Founder Edition' : 'Legend (Pro)'}
                            </h3>
                            <span
                                className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                                    planType === 'founder' ? "bg-amber-400 text-amber-950" : "bg-[#a78bfa] text-[#1e1b4b]"
                                )}
                            >
                                {planType === 'founder' ? 'Limited Time' : 'Recommended'}
                            </span>
                        </div>

                        <div className="flex items-baseline gap-1 mb-6 h-10">
                            {planType === 'founder' ? (
                                <>
                                    <span className="text-3xl font-bold text-white">€49.99</span>
                                    <span className="text-sm text-neutral-500">/5 years</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-3xl font-bold text-white">€8.99</span>
                                    <span className="text-sm text-neutral-500">/month</span>
                                </>
                            )}
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-sm text-white font-medium">
                                <Globe
                                    className={cn("w-4 h-4 transition-colors", planType === 'founder' ? "text-amber-400" : "text-[#a78bfa]")}
                                />
                                <span>
                                    {planType === 'founder' ? '100 Active Projects' : '50 Active Projects'}
                                </span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-white font-medium">
                                <Github
                                    className={cn("w-4 h-4 transition-colors", planType === 'founder' ? "text-amber-400" : "text-[#a78bfa]")}
                                />
                                <span>Auto-Sync with GitHub</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-white font-medium">
                                <Zap
                                    className={cn("w-4 h-4 transition-colors", planType === 'founder' ? "text-amber-400" : "text-[#a78bfa]")}
                                />
                                <span>AI Semantic Search</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-white font-medium">
                                {planType === 'founder' ? (
                                    <Gem className="w-4 h-4 text-amber-400" />
                                ) : (
                                    <Shield className="w-4 h-4 text-[#a78bfa]" />
                                )}
                                <span>
                                    {planType === 'founder' ? 'Exclusive Founder Badge' : 'Priority Support'}
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-auto">
                        {currentTier === 'pro' || currentTier === 'founder' ? (
                            <div
                                className={cn(
                                    "w-full py-3 rounded-xl border text-center text-sm font-medium",
                                    planType === 'founder'
                                        ? "bg-amber-400/20 border-amber-400/30 text-amber-400"
                                        : "bg-[#a78bfa]/20 border-[#a78bfa]/30 text-[#a78bfa]"
                                )}
                            >
                                Active Plan
                            </div>
                        ) : (
                            <a
                                href={getCheckoutLink(planType)}
                                className={cn(
                                    "w-full py-3 rounded-xl text-[#1e1b4b] transition-all font-bold shadow-lg block text-center lemonsqueezy-button",
                                    planType === 'founder'
                                        ? "bg-amber-400 hover:bg-amber-300 shadow-amber-400/20"
                                        : "bg-[#a78bfa] hover:bg-[#c4b5fd] shadow-[#a78bfa]/20"
                                )}
                            >
                                {planType === 'founder' ? 'Become a Founder' : 'Upgrade to Pro'}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="text-center mt-8 text-xs text-neutral-600">
                Secure payments via Lemon Squeezy • Cancel anytime
            </div>
        </div>
    );
}
