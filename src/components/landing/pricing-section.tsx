"use client";

import { PricingTable } from "@/components/billing/pricing-table";

export function PricingSection() {
    return (
        <section id="pricing" className="py-24 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-full h-full bg-[#180260]/20 blur-[120px] pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-6">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg text-neutral-400">
                        Start for free, upgrade when you need more power.
                        Launch your projects with the best toolstack in minutes.
                    </p>
                </div>

                <div className="dark">
                    <PricingTable
                        currentPlan="free"
                        proVariantId={process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_PRO}
                        ltdVariantId={process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_LTD}
                    />
                </div>
            </div>
        </section>
    );
}
