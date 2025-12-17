import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { projectId, stack, scripts } = body;

        if (!projectId) {
            return NextResponse.json({ success: false, error: 'Missing projectId' }, { status: 400 });
        }

        if (!supabase) {
            return NextResponse.json({ success: false, error: 'Supabase client unavailable' }, { status: 500 });
        }

        // 1. Update Project Stack
        const { error: stackError } = await supabase
            .from('projects')
            .update({ stack: stack })
            .eq('id', projectId);

        if (stackError) {
            console.error("Stack update error:", stackError);
            // Verify if project exists
            return NextResponse.json({ success: false, error: 'Project not found or update failed' }, { status: 404 });
        }

        // 2. Sync Scripts as Snippets
        if (scripts) {
            // A. Delete existing auto-synced snippets to prevent duplicates
            await supabase
                .from('snippets')
                .delete()
                .eq('project_id', projectId)
                .eq('description', 'Synced from package.json');

            // B. Insert new scripts
            const scriptSnippets = Object.entries(scripts).map(([key, value]) => ({
                project_id: projectId,
                title: `npm run ${key}`,
                code: value as string,
                language: 'bash',
                description: 'Synced from package.json'
            }));

            if (scriptSnippets.length > 0) {
                const { error: snippetsError } = await supabase
                    .from('snippets')
                    .insert(scriptSnippets);

                if (snippetsError) console.error("Snippets insert error:", snippetsError);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Synced stack and ${Object.keys(scripts || {}).length} scripts`
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
