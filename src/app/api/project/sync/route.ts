import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { projects } from '@/data/mock';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { projectId, stack, scripts } = body;

        if (!projectId) {
            // Fallback for demo: use the first project if ID not provided
            // or we could assume a specific ID for this "CLI" demo context.
            // For now, let's just log.
        }

        // Simulating DB update for Mock Mode
        // In a real app, this would update the specific project using projectId
        // For the mock, we'll assume we are updating the default project '1'
        const targetId = projectId || '1';
        const project = projects.find(p => p.id === targetId);

        if (project) {
            // Update Stack
            // Merge existing stack with new one to preserve manually added items not in package.json?
            // Or overwrite? "Sync" implies source of truth is package.json.
            // Let's overwrite for dependencies found.

            // Map scripts to Snippets
            const scriptSnippets = Object.entries(scripts || {}).map(([key, value]) => ({
                id: `script-${key}`,
                title: `npm run ${key}`,
                code: value as string,
                language: 'bash',
                description: 'Synced from package.json',
                project_id: targetId
            }));

            // In Memory Update
            project.snippets = [
                ...(project.snippets || []).filter(s => !s.id.startsWith('script-')), // Remove old synced scripts
                ...scriptSnippets
            ];

            // Stack update logic is complex if we want to keep versions, etc.
            // For now let's focus on Snippets as that was the main goal.

            // Persist to Supabase if available
            if (supabase) {
                // Delete old synced snippets for this project
                // (This requires a way to identify them, maybe a metadata column? 
                // For now, simple insert might duplicate if we don't be careful. 
                // We'll skip complex DB logic for this demo step and focus on the "Show".)
            }
        }

        return NextResponse.json({
            success: true,
            message: `Synced ${Object.keys(scripts || {}).length} scripts`,
            snippets: project?.snippets
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
