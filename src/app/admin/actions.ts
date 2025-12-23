"use server";

import { getAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { revalidatePath } from "next/cache";

export async function updateUserTier(userId: string, tier: 'free' | 'pro' | 'founder') {
    await requireAdmin();

    const supabase = getAdminClient();
    const { error } = await supabase
        .from('profiles')
        .update({ tier })
        .eq('id', userId);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
}

export async function updateUserLimit(userId: string, limit: number | null) {
    await requireAdmin();

    const supabase = getAdminClient();
    const { error } = await supabase
        .from('profiles')
        .update({ custom_project_limit: limit })
        .eq('id', userId);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
}

export async function grantProMonths(userId: string, months: number) {
    await requireAdmin();

    const supabase = getAdminClient();

    // 1. Get current trial end date
    const { data: profile } = await supabase
        .from('profiles')
        .select('pro_trial_ends_at')
        .eq('id', userId)
        .single();

    const currentEnd = profile?.pro_trial_ends_at ? new Date(profile.pro_trial_ends_at) : new Date();
    // If expired/null, start from now. If active, add to existing date.
    const effectiveStart = currentEnd > new Date() ? currentEnd : new Date();

    const newEnd = new Date(effectiveStart);
    newEnd.setMonth(newEnd.getMonth() + months);

    const { error } = await supabase
        .from('profiles')
        .update({ pro_trial_ends_at: newEnd.toISOString() })
        .eq('id', userId);

    if (error) throw new Error(error.message);
    revalidatePath('/admin');
}
