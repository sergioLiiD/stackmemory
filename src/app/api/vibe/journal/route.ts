
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { title, content, tags, projectId, date } = await req.json();

        if (!content || !projectId) {
            return NextResponse.json({ error: 'Content and Project ID are required' }, { status: 400 });
        }

        // Auth Strategy: Cookie OR Bearer Token
        const cookieStore = await cookies();
        let supabase = createClient(cookieStore);
        let user;

        // 1. Try Cookie Auth
        const { data: { user: cookieUser } } = await supabase.auth.getUser();
        user = cookieUser;

        // 2. Try Bearer Token (if no cookie user)
        if (!user && req.headers.get('Authorization')) {
            const token = req.headers.get('Authorization')?.replace('Bearer ', '');
            if (token) {
                // Initialize Supabase with the token
                const { createClient: createClientManual } = await import('@supabase/supabase-js');
                const manualClient = createClientManual(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    {
                        global: {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    }
                );
                const { data: { user: tokenUser } } = await manualClient.auth.getUser();
                user = tokenUser;
                // Use this client for DB operations if we want RLS to work for this user
                if (user) supabase = manualClient as any;
            }
        }

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get current project to append
        const { data: project } = await supabase
            .from('projects')
            .select('journal')
            .eq('id', projectId)
            .single();

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Create Entry
        const newEntry = {
            id: Math.random().toString(36).substr(2, 9),
            title: title || 'CLI Log',
            date: date || new Date().toISOString().split('T')[0],
            content: content,
            tags: tags || []
        };

        const currentJournal = project.journal || [];
        const updatedJournal = [newEntry, ...currentJournal];

        const { error } = await supabase
            .from('projects')
            .update({ journal: updatedJournal })
            .eq('id', projectId);

        if (error) throw error;

        // Optional: Auto-Tag if tags are empty? (We can call auto-tag internally or let CLI do it)
        // For CLI 'log' command, we might want to run auto-tag if not provided.
        // But for now, let's keep it simple.

        return NextResponse.json({ success: true, entry: newEntry });

    } catch (error: any) {
        console.error("Journal API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to create entry' },
            { status: 500 }
        );
    }
}
