
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

        // Parallel Data Fetching
        const [
            { count: totalUsers },
            { data: usageData },
            { data: recentLogs }
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('usage_logs').select('cost_estimated'),
            supabase.from('usage_logs').select('*').order('created_at', { ascending: false }).limit(20)
        ]);

        // Calculate Total Cost
        const totalCost = usageData?.reduce((acc, log) => acc + (log.cost_estimated || 0), 0) || 0;

        // Calculate Cost This Month (Naive filter for MVP)
        // Ideally we filter in SQL, but for MVP fetching all cost columns is okay if not huge.
        // Better:
        // const { data: monthData } = await supabase.from('usage_logs').select('cost_estimated').gte('created_at', startOfMonth);

        return NextResponse.json({
            users: totalUsers || 0,
            totalCost,
            recentActivity: recentLogs || []
        });

    } catch (error: any) {
        console.error("Admin Stats Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
