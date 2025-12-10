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

        // Query the most recent embedding creation time for this project
        const { data, error } = await supabase
            .from('embeddings')
            .select('created_at')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found" which is fine (never synced)
            console.error("Error fetching sync status:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            lastSynced: data?.created_at || null
        });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
