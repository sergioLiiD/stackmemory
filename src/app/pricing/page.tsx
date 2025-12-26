"use client";

import { PricingTable } from "@/components/billing/pricing-table";
import { useSubscription } from "@/components/billing/subscription-context";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

export default function PricingPage() {
    const { tier } = useSubscription();

    const proVariantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_PRO;
    const ltdVariantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_LTD;

    return (
        <div className="min-h-screen bg-[#020202] text-white p-6 relative overflow-hidden flex flex-col items-center">
            <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="lazyOnload" />

            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#180260]/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-6xl relative z-10">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent mb-4">
                        Invest in your Second Brain
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-xl mx-auto">
                        Unlock unlimited projects, automatic GitHub sync, and cross-project semantic search.
                    </p>
                </div>

                <div>
                    <PricingTable
                        currentPlan={tier === 'free' ? null : tier}
                        proVariantId={proVariantId}
                        ltdVariantId={ltdVariantId}
                    />
                </div>
            </div>
        </div>
    );
}
