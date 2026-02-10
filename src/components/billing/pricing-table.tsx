"use client";

import { useState } from "react";
import { Check, Sparkles, Zap } from "lucide-react";
import { ComparisonMatrix } from "@/components/landing/comparison-matrix";

export function PricingTable({
    currentPlan,
    proVariantId,
    ltdVariantId
}: {
    currentPlan?: string | null;
    proVariantId?: string;
    ltdVariantId?: string;
}) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleCheckout = async (variantId: string, type: string) => {
        setLoading(type);
        try {
            const res = await fetch('/api/billing/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variantId, redirectUrl: window.location.href })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Error creating checkout: " + data.error);
                setLoading(null);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to start checkout");
            setLoading(null);
        }
    };

    const isPro = currentPlan === 'Pro Monthly' || currentPlan === 'StackMemory Pro';
    const isLtd = currentPlan === 'Life Time Deal' || currentPlan?.includes('Lifetime');
    const hasActivePlan = isPro || isLtd;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="p-6 rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121212] flex flex-col">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Hacker</h3>
                <div className="text-3xl font-bold mb-6">$0<span className="text-sm font-normal text-neutral-500">/mo</span></div>

                <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                        <Check className="w-4 h-4 text-green-500" /> 1 Project Limit
                    </li>
                    <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                        <Check className="w-4 h-4 text-green-500" /> <strong>20 Chats / Month</strong>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                        <Check className="w-4 h-4 text-green-500" /> <strong>1 Project Insight / Month</strong>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                        <Check className="w-4 h-4 text-green-500" /> Community Support
                    </li>
                </ul>

                <button
                    disabled={true}
                    className="w-full py-3 rounded-xl bg-neutral-100 dark:bg-white/5 text-neutral-500 font-medium cursor-not-allowed"
                >
                    {hasActivePlan ? 'Included' : 'Current Plan'}
                </button>
            </div>

            {/* Pro Plan */}
            <div className="relative p-6 rounded-3xl border border-purple-500/30 bg-purple-900/5 dark:bg-[#1a1033] flex flex-col">
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5" /> Pro
                </h3>
                <div className="text-3xl font-bold mb-6 text-purple-900 dark:text-white">€34,99<span className="text-sm font-normal text-neutral-500">/mo</span></div>

                <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                        <Check className="w-4 h-4 text-purple-500" /> Unlimited Projects
                    </li>
                    <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                        <Check className="w-4 h-4 text-purple-500" /> <strong>500 Chats / Month</strong>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                        <Check className="w-4 h-4 text-purple-500" /> <strong>Gemini 3.0 Pro & Flash</strong>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                        <Check className="w-4 h-4 text-purple-500" /> Multimodal Inputs (Images/Video)
                    </li>
                </ul>

                {isPro ? (
                    <button disabled className="w-full py-3 rounded-xl bg-green-500 text-white font-bold flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" /> Active Plan
                    </button>
                ) : (
                    <button
                        onClick={() => proVariantId && handleCheckout(proVariantId, 'pro')}
                        disabled={loading !== null || isLtd || !proVariantId}
                        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading === 'pro' ? 'Redirecting...' : isLtd ? 'Included in Lifetime' : 'Subscribe Monthly'}
                    </button>
                )}
            </div>

            {/* LTD Plan */}
            <div className="relative p-6 rounded-3xl border border-orange-500/30 bg-orange-900/5 dark:bg-[#331800] flex flex-col overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-amber-500 text-white text-[10px] uppercase font-bold px-4 py-1 rounded-bl-xl">
                    Limited Time
                </div>
                <h3 className="text-lg font-bold text-orange-900 dark:text-orange-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> Annual Access
                </h3>
                <div className="text-3xl font-bold mb-6 text-orange-900 dark:text-white">€99<span className="text-sm font-normal text-neutral-500">/once</span></div>

                <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                        <Check className="w-4 h-4 text-orange-500" /> <strong>Everything in Pro, for 1 year.</strong>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                        <Check className="w-4 h-4 text-orange-500" /> No monthly fees.
                    </li>
                    <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                        <Check className="w-4 h-4 text-orange-500" /> Early access to V4 features.
                    </li>
                </ul>

                {isLtd ? (
                    <button disabled className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5" /> Lifetime Owner
                    </button>
                ) : (
                    <button
                        onClick={() => ltdVariantId && handleCheckout(ltdVariantId, 'ltd')}
                        disabled={loading !== null || isPro || !ltdVariantId}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading === 'ltd' ? 'Redirecting...' : 'Get Annual Access'}
                    </button>
                )}
            </div>

            <div className="lg:col-span-3">
                <ComparisonMatrix />
            </div>
        </div>
    );
}
