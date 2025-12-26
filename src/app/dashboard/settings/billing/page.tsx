import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { PricingTable } from '@/components/billing/pricing-table';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function BillingPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    // Fetch Subscription
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'on_trial'])
        .single();

    const proVariantId = process.env.LEMONSQUEEZY_VARIANT_ID_PRO;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Upgrade your Memory
                    </h1>
                    <p className="text-neutral-400 max-w-lg mx-auto">
                        Unlock the full power of Gemini 1.5 with massive context, multimodal support, and unlimited projects.
                    </p>
                </div>

                <PricingTable
                    currentPlan={subscription?.variant_name}
                    proVariantId={proVariantId}
                />

                {subscription && subscription.update_payment_url && (
                    <div className="mt-12 text-center">
                        <a
                            href={subscription.update_payment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-neutral-500 underline hover:text-neutral-300"
                        >
                            Manage Current Subscription & Payment Methods
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
