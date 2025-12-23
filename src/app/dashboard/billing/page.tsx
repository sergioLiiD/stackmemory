"use client";

import { PricingTable } from "@/components/billing/pricing-table";
import { useSubscription } from "@/components/billing/subscription-context";
import { Separator } from "@/components/ui/separator";

export default function BillingPage() {
    const { tier } = useSubscription();

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a]">
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-xl font-semibold text-white">Subscription & Billing</h1>
                        <p className="text-sm text-neutral-400 mt-1">Manage your plan and payment methods</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400 font-mono">
                        Current Plan: <span className="text-white capitalize font-medium">{tier}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <section>
                        <h2 className="text-lg font-medium text-white mb-6">Available Plans</h2>
                        <PricingTable currentTier={tier} />
                    </section>

                    <Separator className="bg-white/5" />

                    <section className="bg-[#180260]/10 border border-[#180260]/30 rounded-xl p-6">
                        <h3 className="text-base font-medium text-white mb-2">Need help with billing?</h3>
                        <p className="text-sm text-neutral-400 mb-4">
                            If you need to change your payment method, download invoices, or cancel your subscription,
                            please check your email for the link provided by Lemon Squeezy after your purchase.
                        </p>
                        <a
                            href="mailto:support@stackmemory.app"
                            className="text-sm text-[#a78bfa] hover:text-[#c4b5fd] hover:underline"
                        >
                            Contact Support
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
}
