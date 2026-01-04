import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { projectId, stack, scripts } = body;

        if (!projectId) {
            return NextResponse.json({ success: false, error: 'Missing projectId' }, { status: 400 });
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
                const { createClient: createClientManual } = await import('@supabase/supabase-js');
                const manualClient = createClientManual(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    {
                        global: {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    }
                );
                const { data: { user: tokenUser } } = await manualClient.auth.getUser();
                user = tokenUser;
                if (user) supabase = manualClient as any;
            }
        }

        // If still no user, we might want to allow it IF we use a Service Role (Dangerous)
        // Or we enforce Auth.
        // For CLI 'sync', forcing auth is safer and consistent with "Trojan Horse" vision.
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized: Please run `stackmem login`' }, { status: 401 });
        }

        // 1. Get current project to preserve manual items
        const { data: currentProject, error: fetchError } = await supabase
            .from('projects')
            .select('stack')
            .eq('id', projectId)
            .single();

        if (fetchError || !currentProject) {
            return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
        }

        // 2. Smart Merge Strategy
        // - CLI provides the "Source of Truth" for code dependencies.
        // - We must preserve items that are NOT in the CLI payload (manual items like 'PostgreSQL', 'Vercel', etc)
        // - But we should also be careful: if a user REMOVES a dependency from package.json, it should be removed from DB.

        const newStackNames = new Set((stack as any[]).map(s => s.name));
        const manualItems = (currentProject.stack || []).filter((item: any) => {
            // Heuristic: If it has a version that looks like semver (from package.json), it might be a code dependency.
            // Better: If we assume the previous sync put it there, how do we distinguish?
            // For now, let's assume if it's NOT in the new list, keep it ONLY if it doesn't look like a package.json dependency.
            // Simpler approach: Keep everything that is NOT in the new list?
            // NO, because then deleting a dependency in package.json wouldn't delete it in DB.
            // We need a flag 'source': 'cli' vs 'manual'? We don't have that yet.

            // Workaround: Code dependencies usually have specific types or we can just accept that "If it was previously synced, it might be gone".
            // Let's rely on names collision. 
            // If I have 'axios' manual and 'axios' cli, cli wins (version update).
            // If I have 'PostgreSQL' manual and NO 'PostgreSQL' cli, keep 'PostgreSQL'.

            // BUT: If I had 'lodash' (cli) and I remove it from package.json, CLI sends payload WITHOUT 'lodash'.
            // If I just merge, I would keep 'lodash' because it's not in new list. That's wrong.

            // SOLUTION: We can assume items with type 'database', 'devops', 'other' (that are not typically in package.json) are manual,
            // whereas 'frontend', 'backend' might be code.
            // The CLI currently doesn't infer types well (everything is default/unknown).

            // SAFE BET for MVP: 
            // Identify items that were clearly manual. Manual usually don't have exact versions like "^1.2.3" (unless user added).
            // Let's assume: If the stack item exists in DB but is NOT in the new payload:
            // - If it looks like an NPM package (lowercase, no spaces, maybe versioned), it MIGHT be a deleted dependency.
            // - If it looks like a Service (Capitalized, etc), keep it.

            // BETTER: For now, let's just MERGE by Name.
            // If name exists in Payload -> Use Payload (update version).
            // If name NOT in Payload -> Keep it (assume it's manual or another source).
            // Limitation: You cannot "delete" a dependency from the UI purely by removing it from package.json if we use this logic, 
            // but it is safer than deleting your Database entry.
            // Users can manually delete items in the UI if they really want to clean up.
            return !newStackNames.has(item.name);
        });

        const mergedStack = [
            ...manualItems,
            ...stack
        ];

        // 3. Update It
        const { error: stackUpdateError } = await supabase
            .from('projects')
            .update({ stack: mergedStack, last_updated: new Date().toISOString() })
            .eq('id', projectId);

        if (stackUpdateError) {
            console.error("Stack update error:", stackUpdateError);
            return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
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
