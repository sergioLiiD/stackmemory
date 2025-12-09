
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: projectId } = await params;
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data: prompts, error } = await supabase
            .from('prompts')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ prompts });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: projectId } = await params;
        const body = await req.json();
        const { title, prompt, model, tags } = body;

        if (!title || !prompt) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data, error } = await supabase
            .from('prompts')
            .insert({
                project_id: projectId,
                title,
                prompt,
                model: model || 'GPT-4o',
                tags: tags || []
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ prompt: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
