import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Get user profile to check for stripe_customer_id
        const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single();

        let customerId = profile?.stripe_customer_id;

        // If no customer ID, create one in Stripe
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: user.id }
            });
            customerId = customer.id;

            // Save it back to profile
            await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID, // Ensure this is set in .env.local
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout_success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout_canceled=true`,
            metadata: {
                userId: user.id
            }
        });

        return NextResponse.json({ sessionId: session.id });

    } catch (error) {
        console.error('[STRIPE_CHECKOUT]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
