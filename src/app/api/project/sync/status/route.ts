import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        const body = await req.json();
        const { projectId } = body;

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        // Read the persistent last_indexed_at from the projects table
        const { data, error } = await supabase
            .from('projects')
            .select('last_indexed_at')
            .eq('id', projectId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching sync status:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            lastSynced: data?.last_indexed_at || null
        });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
