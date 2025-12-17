"use client";

import { PricingTable } from "@/components/billing/pricing-table";
import { useSubscription } from "@/components/billing/subscription-context";
import { loadStripe } from "@stripe/stripe-js";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Initialize Stripe outside to avoid re-creation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PricingPage() {
    const { tier } = useSubscription();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
            });
            const { sessionId, url } = await response.json();
            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No checkout URL received");
            }
        } catch (error) {
            console.error("Upgrade failed:", error);
            // Ideally show a toast here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white p-6 relative overflow-hidden flex flex-col items-center">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#180260]/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-4xl relative z-10">
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

                <div className={loading ? "opacity-50 pointer-events-none" : ""}>
                    <PricingTable currentTier={tier} onUpgrade={handleUpgrade} />
                </div>

                {loading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
