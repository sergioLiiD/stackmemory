
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Pricing per 1M tokens (USD)
const PRICING = {
    'text-embedding-ada-002': { input: 0.02, output: 0 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4o': { input: 5.00, output: 15.00 },
    // Google Gemini Pricing (approx per 1M tokens) is erratic during preview, assuming Tier 1 payloads
    'gemini-1.5-flash': { input: 0.075, output: 0.30 },
    'gemini-2.0-flash': { input: 0.10, output: 0.40 } // Placeholder slightly higher
};

type ModelName = keyof typeof PRICING;

export async function logUsage(
    projectId: string | null,
    action: 'embedding' | 'chat' | 'insight',
    model: string,
    inputTokens: number,
    outputTokens: number
) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return; // Should allow anonymous logs? Maybe not for billing.

        const prices = PRICING[model as ModelName] || { input: 0, output: 0 };
        const cost = (
            (inputTokens / 1_000_000) * prices.input +
            (outputTokens / 1_000_000) * prices.output
        );

        await supabase.from('usage_logs').insert({
            user_id: user.id,
            project_id: projectId,
            action,
            model,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cost_estimated: cost
        });

    } catch (e) {
        console.error("Failed to log usage:", e);
        // Don't fail the main request just because logging failed
    }
}
