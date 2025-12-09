
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Verify Admin Access
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch Profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');

        if (profilesError) throw profilesError;

        // Fetch Usage Logs (Optimization: Ideally use RPC or View for aggregation)
        // For MVP: Fetching user_id and cost_estimated only
        const { data: usageLogs, error: usageError } = await supabase
            .from('usage_logs')
            .select('user_id, cost_estimated');

        if (usageError) throw usageError;

        // Aggregation in memory
        const costMap = new Map<string, number>();
        usageLogs?.forEach(log => {
            const current = costMap.get(log.user_id) || 0;
            costMap.set(log.user_id, current + (log.cost_estimated || 0));
        });

        // Combine
        const adminsUsers = profiles.map(p => ({
            ...p,
            total_spend: costMap.get(p.id) || 0,
            has_logs: costMap.has(p.id)
        })).sort((a, b) => b.total_spend - a.total_spend); // Sort by highest spenders

        return NextResponse.json({ users: adminsUsers });

    } catch (error: any) {
        console.error("Admin Users API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
