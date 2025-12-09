
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { processRepository } from '@/lib/crawler/github-crawler';

export async function POST(req: Request) {
    try {
        const { repoUrl, projectId } = await req.json();

        if (!repoUrl) {
            return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
        }

        // 1. Get Session & Token
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session || !session.provider_token) {
            return NextResponse.json({ error: 'Unauthorized: Missing GitHub Provider Token. Please re-login with GitHub.' }, { status: 401 });
        }

        const token = session.provider_token;

        // 2. Start Crawling
        // Note: In a production app, this should be offloaded to a queue (Inngest, BullMQ, etc.)
        // For V1/MVP, we'll do it synchronously but limit the file count to avoid Vercel timeout (10s/60s).
        const processedFiles = await processRepository(repoUrl, token, 20); // Start small

        // 3. Store Embeddings
        const { storeEmbeddings } = await import('@/lib/vector-store');
        const totalChunks = await storeEmbeddings(projectId, processedFiles);

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
