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
