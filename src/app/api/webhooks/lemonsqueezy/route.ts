import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const text = await req.text();
        const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '');
        const digest = Buffer.from(hmac.update(text).digest('hex'), 'utf8');
        const signature = Buffer.from(req.headers.get('x-signature') || '', 'utf8');

        if (!crypto.timingSafeEqual(digest, signature)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const body = JSON.parse(text);
        const { meta, data } = body;
        const eventName = meta.event_name;
        const customData = meta.custom_data || {}; // We will pass user_id here during checkout

        // Init Supabase Admin (Service Role) - strictly needed to write to subscriptions for any user
        // We use standard createClient but we need SERVICE_ROLE_KEY ideally for robust webhooks
        // However, standard server client works if RLS allows it or if we use Service Key.
        // For simplicity in this project structure, we might rely on the fact that we are in a route handler.
        // BUT, RLS "Users can view their own" blocks inserts for others. 
        // We really need a Service Role client here.
        // Let's assume standard client for now, but really we should use a `createAdminClient` helper if available.
        // Checking existing code, we usually use `createClient(cookieStore)`.
        // BUT cookies won't exist in a webhook request from LemonSqueezy.
        // So we MUST use a Service Role client manually constructed here.

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        // We'll import createClient from supabase-js directly for admin access
        const { createClient: createSupabaseAdmin } = require('@supabase/supabase-js');
        const supabase = createSupabaseAdmin(supabaseUrl, supabaseServiceKey);

        // Log event
        await supabase.from('webhook_events').insert({
            event_type: eventName,
            payload: body,
            processed: false
        });

        const userId = customData.user_id; // CRITICAL: We must pass ?checkout[custom][user_id]=... in the checkout link

        if (!userId) {
            console.warn("Webhook received without user_id in custom_data");
            return NextResponse.json({ received: true, warning: "No user_id" });
        }

        if (eventName === 'subscription_created' || eventName === 'subscription_updated' || eventName === 'subscription_resumed') {
            const sub = data.attributes;
            await supabase.from('subscriptions').upsert({
                id: data.id,
                user_id: userId,
                status: sub.status,
                variant_name: sub.variant_name,
                renews_at: sub.renews_at,
                ends_at: sub.ends_at,
                update_payment_url: sub.urls.update_payment_method,
            });
        } else if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
            const sub = data.attributes;
            await supabase.from('subscriptions').update({
                status: sub.status,
                ends_at: sub.ends_at
            }).eq('id', data.id);
        }

        return NextResponse.json({ received: true });

    } catch (e: any) {
        console.error("Webhook Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
