import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
    try {
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
        if (!secret) {
            console.error("LEMON_SQUEEZY_WEBHOOK_SECRET is missing");
            return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
        }

        const text = await request.text();
        const hmac = crypto.createHmac("sha256", secret);
        const digest = Buffer.from(hmac.update(text).digest("hex"), "utf8");
        const signatureHeader = request.headers.get("x-signature");

        if (!signatureHeader) {
            return NextResponse.json({ error: "Missing signature" }, { status: 401 });
        }

        const signature = Buffer.from(signatureHeader, "utf8");

        if (digest.length !== signature.length || !crypto.timingSafeEqual(digest, signature)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const payload = JSON.parse(text);
        const eventName = payload.meta.event_name;
        const customData = payload.meta.custom_data;

        // Only process order_created (sale success)
        if (eventName === "order_created") {
            if (!customData || !customData.user_id) {
                console.log("No user_id in webhook custom_data. Ignoring.");
                return NextResponse.json({ message: "Ignored: No user_id" });
            }

            const userId = customData.user_id;
            const attributes = payload.data.attributes;
            const firstOrderItem = attributes.first_order_item;
            const productName = firstOrderItem?.product_name || "";

            let newTier = 'pro';
            // Simple string matching is robust enough for now
            if (productName.toLowerCase().includes("founder")) {
                newTier = 'founder';
            }

            console.log(`Granting ${newTier} access to user ${userId}`);

            // Update Database
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({ tier: newTier })
                .eq('id', userId);

            if (error) {
                console.error("Error updating profile in Supabase:", error);
                return NextResponse.json({ error: "Database update failed" }, { status: 500 });
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
