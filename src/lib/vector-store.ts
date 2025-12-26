import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProcessedFile } from './crawler/github-crawler';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (e: any) {
        console.error("Gemini generateEmbedding ERROR:", e);
        throw e;
    }
}

export async function storeEmbeddings(projectId: string, files: ProcessedFile[]) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let totalChunks = 0;

    for (const file of files) {
        // Simple chunking strategy for now:
        // 1. If file is small (< 50KB), treat as one chunk.
        // 2. If larger, we should split.
        // TODO: Implement proper sliding window chunking.

        const content = file.content;

        // Skip empty files
        if (!content.trim()) continue;

        // Chunking: Increased to 50000 chars (~12k tokens) for Gemini Massive Context
        const chunkSize = 50000;
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
                    console.error(`Supabase INSERT ERROR for ${file.path}:`, error);
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

export async function searchSimilarDocuments(projectId: string, query: string, matchThreshold: number = 0.65, matchCount: number = 20) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Vectorize Query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Search via RPC
    const { data: documents, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount, // Use the passed matchCount (default 20)
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

