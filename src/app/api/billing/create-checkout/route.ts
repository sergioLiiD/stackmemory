import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { variantId, redirectUrl } = await req.json();
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!variantId) {
            return NextResponse.json({ error: 'Variant ID required' }, { status: 400 });
        }

        const storeId = process.env.LEMONSQUEEZY_STORE_ID;
        const apiKey = process.env.LEMONSQUEEZY_API_KEY;

        if (!storeId || !apiKey) {
            return NextResponse.json({ error: 'LemonSqueezy config missing' }, { status: 500 });
        }

        const payload = {
            data: {
                type: 'checkouts',
                attributes: {
                    checkout_data: {
                        custom: {
                            user_id: user.id
                        }
                    },
                    product_options: {
                        redirect_url: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
                    }
                },
                relationships: {
                    store: {
                        data: {
                            type: 'stores',
                            id: storeId.toString()
                        }
                    },
                    variant: {
                        data: {
                            type: 'variants',
                            id: variantId.toString()
                        }
                    }
                }
            }
        };

        const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.errors) {
            console.error("LemonSqueezy API Error:", data.errors);
            return NextResponse.json({ error: data.errors[0].detail }, { status: 400 });
        }

        return NextResponse.json({ url: data.data.attributes.url });

    } catch (e: any) {
        console.error("Checkout Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
