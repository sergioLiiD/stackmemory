
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { processRepository } from '@/lib/crawler/github-crawler';

export async function POST(req: Request) {
    try {
        const { repoUrl, projectId, githubToken } = await req.json();

        if (!repoUrl) {
            return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
        }

        // 1. Get Session & Token
        // Priority: Manual Token > Session Token
        let token = githubToken;

        if (!token) {
            const cookieStore = await cookies();
            const supabase = createClient(cookieStore);
            const { data: { session } } = await supabase.auth.getSession();
            token = session?.provider_token;
        }

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized: Missing GitHub Provider Token. Please re-login with GitHub or provide a manual token.' }, { status: 401 });
        }

        // 2. Start Crawling
        // Note: In a production app, this should be offloaded to a queue (Inngest, BullMQ, etc.)
        // For V1/MVP, we'll do it synchronously but limit the file count to avoid Vercel timeout (10s/60s).
        const processedFiles = await processRepository(repoUrl, token, 20); // Start small

        // 3. Store Embeddings
        const { storeEmbeddings } = await import('@/lib/vector-store');
        const totalChunks = await storeEmbeddings(projectId, processedFiles);

        // 3.5 Check for package.json to update Stack
        const packageJsonFile = processedFiles.find(f => f.path.toLowerCase().endsWith('package.json'));
        if (packageJsonFile) {
            try {
                const json = JSON.parse(packageJsonFile.content);
                const stackItems: any[] = [];

                // Helper to classify
                const getType = (name: string): string => {
                    const n = name.toLowerCase();
                    if (['react', 'next', 'vue', 'svelte', 'angular', 'tailwindcss', 'framer-motion', 'lucide-react', 'clsx'].some(k => n.includes(k))) return 'frontend';
                    if (['node', 'express', 'nestjs', 'fastify', 'prisma', 'drizzle', 'mongoose', 'zod'].some(k => n.includes(k))) return 'backend';
                    if (['openai', 'langchain', 'tensorflow', 'pytorch', 'anthropic'].some(k => n.includes(k))) return 'ai';
                    if (['supabase', 'firebase', 'postgres', 'mysql', 'mongodb', 'redis'].some(k => n.includes(k))) return 'database';
                    if (['docker', 'kubernetes', 'vercel', 'aws', 'terraform', 'eslint', 'typescript', 'prettier'].some(k => n.includes(k))) return 'devops';
                    return 'other';
                };

                const allDeps = { ...json.dependencies, ...json.devDependencies };

                Object.entries(allDeps).forEach(([name, version]: [string, any]) => {
                    stackItems.push({
                        name,
                        version: typeof version === 'string' ? version.replace(/[\^~]/g, '') : '',
                        type: getType(name)
                    });
                });

                if (stackItems.length > 0) {
                    const cookieStore = await cookies();
                    const supabase = createClient(cookieStore);

                    // We need to fetch the existing project to merge or overwrite? 
                    // Requirement implies "refresh", so overwrite is mostly correct for the *code* stack.
                    // However, existing UI might have manual notes. 
                    // For V1, we'll overwrite the 'stack' column to ensure it reflects reality.
                    // Ideally we would merge, but that's complex. Overwriting ensures 'v16.1.0' appears.

                    const { error: updateError } = await supabase
                        .from('projects')
                        .update({
                            stack: stackItems,
                            last_updated: new Date().toISOString()
                        })
                        .eq('id', projectId);

                    if (updateError) {
                        console.error("Failed to update stack in DB:", updateError);
                    }
                }
            } catch (e) {
                console.error("Failed to parse package.json for stack update", e);
            }
        }

        // 4. Return Summary
        return NextResponse.json({
            success: true,
            filesFound: processedFiles.length,
            chunksStored: totalChunks,
            files: processedFiles.map(f => ({ path: f.path, size: f.size, language: f.language })) // Metadata only
        });

    } catch (error: any) {
        console.error("Crawl error full details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
