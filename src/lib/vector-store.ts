import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProcessedFile } from './crawler/github-crawler';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function generateEmbedding(text: string): Promise<number[]> {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

export async function storeEmbeddings(projectId: string, files: ProcessedFile[]) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let totalChunks = 0;

    for (const file of files) {
        // Simple chunking strategy for now:
        // 1. If file is small (< 8KB), treat as one chunk.
        // 2. If larger, we should split. For MVP, let's truncate or just take the first X chars.
        // TODO: Implement proper sliding window chunking.

        const content = file.content;

        // Skip empty files
        if (!content.trim()) continue;

        // Naive chunking: Limit to ~8000 tokens (approx 32000 chars) for Ada-002
        // We'll be much more conservative: 8000 characters per chunk.
        const chunkSize = 8000;
        const chunks = [];

        for (let i = 0; i < content.length; i += chunkSize) {
            chunks.push(content.slice(i, i + chunkSize));
        }

        for (const chunk of chunks) {
            try {
                const embedding = await generateEmbedding(chunk);

                const { error } = await supabase.from('embeddings').insert({
                    project_id: projectId,
                    content: chunk,
                    file_path: file.path,
                    metadata: {
                        language: file.language,
                        size: file.size,
                        chunkIndex: chunks.indexOf(chunk),
                        totalChunks: chunks.length
                    },
                    embedding
                });

                if (error) {
                    console.error(`Failed to store embedding for ${file.path}`, error);
                } else {
                    totalChunks++;
                    // Log Usage (Approx: 1 token = 4 chars)
                    const estimatedTokens = Math.ceil(chunk.length / 4);
                    // We run this async without awaiting to not slow down the loop too much, 
                    // or await it if strict tracking is needed. 
                    // To be safe in Server Components/Actions, preferably await or use `waitUntil`.
                    // Here we await to ensure it fires.
                    const { logUsage } = await import('./usage-logger');
                    await logUsage(projectId, 'embedding', 'text-embedding-004', estimatedTokens, 0);
                }
            } catch (e) {
                console.error(`Failed to generate embedding for ${file.path}`, e);
            }
        }
    }

    return totalChunks;
}

export async function searchSimilarDocuments(projectId: string, query: string, matchThreshold: number = 0.78, matchCount: number = 5) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Vectorize Query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Search via RPC
    const { data: documents, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding, // Corrected from 'embedding' to 'queryEmbedding' to maintain semantic correctness
        match_threshold: 0.5, // Lowered from 0.7 to 0.5 to catch more results
        match_count: 5,
        filter_project_id: projectId
    });

    if (error) {
        console.error("Match Documents RPC Error:", error);
        throw error;
    }

    console.log(`Search for "${query}": Found ${documents?.length || 0} matches.`);
    if (!documents || documents.length === 0) {
        console.warn("No documents found. Check project_id match:", projectId);
    }

    return documents;
}

