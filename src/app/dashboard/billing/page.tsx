import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { PricingTable } from "@/components/billing/pricing-table";
import { Separator } from "@/components/ui/separator";
import { Mail, Gift } from "lucide-react";
import { redirect } from 'next/navigation';

export default async function BillingPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    // Fetch Subscription from the new table
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'on_trial'])
        .single();

    // Also fetch profile for Trial info if it exists (legacy support)
    const { data: profile } = await supabase
        .from('profiles')
        .select('pro_trial_ends_at, tier')
        .eq('id', user.id)
        .single();

    const proVariantId = process.env.LEMONSQUEEZY_VARIANT_ID_PRO;
    const ltdVariantId = process.env.LEMONSQUEEZY_VARIANT_ID_LTD;

    // Determine effective tier/plan name
    // Priority: Subscription Table > Profile Tier > Free
    let currentPlanName = 'Hacker';
    if (subscription) {
        currentPlanName = subscription.variant_name || 'Pro';
    } else if (profile?.tier === 'pro' || profile?.tier === 'founder') {
        currentPlanName = profile.tier === 'founder' ? 'Lifetime' : 'Pro (Legacy)';
    }

    const trialEndsAt = profile?.pro_trial_ends_at;

    return (
        <div className="flex flex-col h-full bg-neutral-50 dark:bg-[#0a0a0a] rounded-3xl shadow-sm border border-neutral-200 dark:border-white/5 overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-neutral-200 dark:border-white/5 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Subscription & Billing</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage your plan and payment methods</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-neutral-200 dark:bg-white/5 border border-neutral-300 dark:border-white/10 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                        Current Plan: <span className="text-neutral-900 dark:text-white capitalize font-medium">{currentPlanName}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    <section>
                        <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-6">Available Plans</h2>

                        {/* Trial Banner */}
                        {trialEndsAt && new Date(trialEndsAt) > new Date() && !subscription && (
                            <div className="mb-6 bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/40 dark:to-fuchsia-900/40 border border-violet-200 dark:border-violet-500/30 p-4 rounded-3xl flex items-center gap-3">
                                <div className="p-2 bg-violet-500/10 dark:bg-violet-500/20 rounded-xl">
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

                        <PricingTable
                            currentPlan={currentPlanName}
                            proVariantId={proVariantId}
                            ltdVariantId={ltdVariantId}
                        />

                        {subscription && subscription.update_payment_url && (
                            <div className="mt-8 text-center">
                                <a
                                    href={subscription.update_payment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-neutral-500 underline hover:text-neutral-300 transition-colors"
                                >
                                    Manage Subscription & Invoices (LemonSqueezy Portal)
                                </a>
                            </div>
                        )}

                    </section>

                    <Separator className="bg-neutral-200 dark:bg-white/5" />

                    <section className="bg-neutral-100 dark:bg-[#180260]/10 border border-neutral-200 dark:border-[#180260]/30 rounded-3xl p-6">
                        <h3 className="text-base font-medium text-neutral-900 dark:text-white mb-2">Need help with billing?</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                            If you need to change your payment method, download invoices, or cancel your subscription,
                            please check your email for the link provided by Lemon Squeezy after your purchase, or use the link above.
                        </p>
                        <a
                            href="mailto:support@stackmemory.app"
                            suppressHydrationWarning
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
