"use client";

import { PricingTable } from "@/components/billing/pricing-table";
import { useSubscription } from "@/components/billing/subscription-context";
import { Separator } from "@/components/ui/separator";
import { Mail, Gift } from "lucide-react";

export default function BillingPage() {
    const { tier, trialEndsAt } = useSubscription();

    return (
        <div className="flex flex-col h-full bg-neutral-50 dark:bg-[#0a0a0a]">
            {/* Header */}
            <div className="px-8 py-6 border-b border-neutral-200 dark:border-white/5 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Subscription & Billing</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage your plan and payment methods</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-neutral-200 dark:bg-white/5 border border-neutral-300 dark:border-white/10 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                        Current Plan: <span className="text-neutral-900 dark:text-white capitalize font-medium">{tier}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <section>
                        <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-6">Available Plans</h2>

                        {/* Trial Banner */}
                        {trialEndsAt && new Date(trialEndsAt) > new Date() && (
                            <div className="mb-6 bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/40 dark:to-fuchsia-900/40 border border-violet-200 dark:border-violet-500/30 p-4 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-violet-500/10 dark:bg-violet-500/20 rounded-lg">
                                    <Gift className="w-5 h-5 text-violet-600 dark:text-violet-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Free Pro Trial Active</h3>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-300">
                                        Your complimentary Pro access ends on <span className="text-neutral-900 dark:text-white font-medium">{new Date(trialEndsAt).toLocaleDateString()}</span>.
                                    </p>
                                </div>
                            </div>
                        )}

                        <PricingTable currentTier={tier} />
                    </section>

                    <Separator className="bg-neutral-200 dark:bg-white/5" />

                    <section className="bg-neutral-100 dark:bg-[#180260]/10 border border-neutral-200 dark:border-[#180260]/30 rounded-xl p-6">
                        <h3 className="text-base font-medium text-neutral-900 dark:text-white mb-2">Need help with billing?</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                            If you need to change your payment method, download invoices, or cancel your subscription,
                            please check your email for the link provided by Lemon Squeezy after your purchase.
                        </p>
                        <a
                            href="mailto:support@stackmemory.app"
                            className="text-sm text-violet-600 dark:text-[#a78bfa] hover:text-violet-700 dark:hover:text-[#c4b5fd] hover:underline"
                        >
                            Contact Support
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
}
