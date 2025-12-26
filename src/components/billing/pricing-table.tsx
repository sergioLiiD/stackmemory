"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function PricingTable({
    currentPlan,
    proVariantId
}: {
    currentPlan?: string | null;
    proVariantId?: string; // Passed from env
}) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async (variantId: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/billing/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variantId,
                    redirectUrl: window.location.href
                })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Error creating checkout: " + data.error);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to start checkout");
        } finally {
            setLoading(false);
        }
    };

    const isPro = currentPlan === 'Pro Monthly' || currentPlan === 'StackMemory Pro';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121212]">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Hacker</h3>
                <div className="text-3xl font-bold mb-6">$0<span className="text-sm font-normal text-neutral-500">/mo</span></div>

                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                        <Check className="w-4 h-4 text-green-500" /> 1 Project Limit
                    </li>
                    <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                        <Check className="w-4 h-4 text-green-500" /> Basic Vibe Coder (GPT-4o-mini)
                    </li>
                    <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                        <Check className="w-4 h-4 text-green-500" /> Community Support
                    </li>
                </ul>

                <button
                    disabled={true}
                    className="w-full py-3 rounded-xl bg-neutral-100 dark:bg-white/5 text-neutral-500 font-medium cursor-not-allowed"
                >
                    Current Plan
                </button>
            </div>

            {/* Pro Plan */}
            <div className="relative p-8 rounded-3xl border border-purple-500/30 bg-purple-900/5 dark:bg-[#1a1033]">
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
                    Most Popular
                </div>
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300 mb-2">Pro</h3>
                <div className="text-3xl font-bold mb-6 text-purple-900 dark:text-white">$19<span className="text-sm font-normal text-neutral-500">/mo</span></div>

                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                        <Check className="w-4 h-4 text-purple-500" /> Unlimited Projects
                    </li>
                    <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                        <Check className="w-4 h-4 text-purple-500" /> <strong>Google Gemini Flash</strong> (Massive Context)
                    </li>
                    <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                        <Check className="w-4 h-4 text-purple-500" /> Multimodal Inputs (Images)
                    </li>
                    <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                        <Check className="w-4 h-4 text-purple-500" /> Priority Indexing
                    </li>
                </ul>

                {isPro ? (
                    <button
                        disabled={true}
                        className="w-full py-3 rounded-xl bg-green-500 text-white font-bold flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" /> Active Plan
                    </button>
                ) : (
                    <button
                        onClick={() => proVariantId && handleCheckout(proVariantId)}
                        disabled={loading || !proVariantId}
                        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? 'Redirecting...' : 'Upgrade to Pro'}
                    </button>
                )}

                {!proVariantId && (
                    <p className="text-[10px] text-red-400 mt-2 text-center">
                        * Configure LEMONSQUEEZY_VARIANT_ID_PRO in .env
                    </p>
                )}
            </div>
        </div>
    );
}
