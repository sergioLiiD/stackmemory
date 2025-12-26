import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type LimitAction = 'chat' | 'insight';

export async function checkAndIncrementLimit(userId: string, action: LimitAction): Promise<{ allowed: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Fetch current profile stats
    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
            tier,
            usage_count_chat,
            usage_limit_chat,
            usage_count_insight,
            usage_limit_insight,
            limit_reset_at
        `)
        .eq('id', userId)
        .single();

    if (error || !profile) {
        console.error("Limit check failed:", error);
        return { allowed: true }; // Fail open if DB error? Or fail closed? prefer open for beta.
    }

    // 2. Check Admin/Founder override
    // Pro/Founder/Admin usually have unlimited or very high limits.
    // For now, let's assume 'pro' and 'founder' are effectively unlimited for beta, 
    // or specifically check high limits.
    if (['pro', 'founder'].includes(profile.tier)) {
        return { allowed: true };
    }

    // 3. Reset Logic (Simplified)
    // In a real app, a cron job or lazy reset would zero out counts if now() > limit_reset_at
    const now = new Date();
    const resetAt = new Date(profile.limit_reset_at);

    if (now > resetAt) {
        // Time to reset!
        // We do a lazy reset here by resetting counts and pushing date forward
        await supabase
            .from('profiles')
            .update({
                usage_count_chat: 0,
                usage_count_insight: 0,
                limit_reset_at: new Date(now.setMonth(now.getMonth() + 1)).toISOString()
            })
            .eq('id', userId);

        // Return allowed because we just reset
        // But we still need to increment below
    }

    // 4. Check Limits
    let limit = action === 'chat' ? profile.usage_limit_chat : profile.usage_limit_insight;

    // Feature Gating: 
    // Insight was previously strict PRO, but Pricing Table says "3/mo" for Free.
    // So we rely on 'usage_limit_insight' (default 3 for free) in the DB.
    // We only block if they exceed that limit.

    const current = action === 'chat' ? profile.usage_count_chat : profile.usage_count_insight;

    if (current >= limit) {
        return {
            allowed: false,
            error: `You have reached your ${action} limit for this month (${limit}/${limit}). Upgrade to Pro for unlimited access.`
        };
    }

    // 5. Increment
    // Note: Concurrency issue possible here (race condition), but acceptable for MVP limits.
    // RPC 'increment' function is safer but typical update is fine for now.
    const updatePayload = action === 'chat'
        ? { usage_count_chat: current + 1 }
        : { usage_count_insight: current + 1 };

    await supabase.from('profiles').update(updatePayload).eq('id', userId);

    return { allowed: true };
}
