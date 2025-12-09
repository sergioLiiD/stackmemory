
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { projectId, manualContext } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // 1. Fetch README.md
        // We look for files ending in readme.md (case insensitive if possible, but ILIKE works)
        const { data: readmeChunks } = await supabase
            .from('embeddings')
            .select('content, metadata')
            .eq('project_id', projectId)
            .ilike('file_path', '%readme.md');

        const readmeContent = reconstructFile(readmeChunks);

        // 2. Fetch package.json
        const { data: packageChunks } = await supabase
            .from('embeddings')
            .select('content, metadata')
            .eq('project_id', projectId)
            .ilike('file_path', '%package.json');

        const packageContent = reconstructFile(packageChunks);

        // 3. Fetch File Tree (Distinct paths)
        // Note: 'embeddings' might have duplicates if chunked. We want distinct paths.
        // Supabase select distinct on file_path?
        const { data: files } = await supabase
            .from('embeddings')
            .select('file_path')
            .eq('project_id', projectId);

        // De-duplicate paths in JS
        const uniquePaths = Array.from(new Set(files?.map(f => f.file_path) || [])).sort();
        const fileTree = uniquePaths.join('\n');

        // 4. Assemble The Wave
        const megaPrompt = `
================================================================================
PROJECT CONTEXT WEAVER (THE WAVE)
================================================================================

# 1. PROJECT GOAL & CONTEXT
${manualContext || "No specific goal provided."}

${readmeContent ? `\n# 2. DOCUMENTATION (README.md)\n${readmeContent}` : ""}

# 3. TECHNICAL STACK & DEPENDENCIES (package.json)
${packageContent || "No package.json found."}

# 4. FILE STRUCTURE
The following is the complete file structure of the project.
Use this to understand the architecture and file locations.

${fileTree || "No files indexed."}

================================================================================
INSTRUCTIONS FOR THE MODEL:
You are an expert Senior Software Engineer acting as a co-pilot for this project.
1. Use the Context above to understand the goal.
2. Use the File Structure to locate relevant logic.
3. Use the Tech Stack to suggest compatible libraries.
4. When writing code, adhere to the project's existing patterns.
================================================================================
`;

        return NextResponse.json({ prompt: megaPrompt });

    } catch (error: any) {
        console.error("Context Gen Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function reconstructFile(chunks: any[] | null) {
    if (!chunks || chunks.length === 0) return "";

    // Sort by chunkIndex in metadata
    // metadata is jsonb, typed as any here
    try {
        const sorted = chunks.sort((a, b) => {
            const idxA = a.metadata?.chunkIndex ?? 0;
            const idxB = b.metadata?.chunkIndex ?? 0;
            return idxA - idxB;
        });
        return sorted.map(c => c.content).join('');
    } catch (e) {
        return chunks.map(c => c.content).join('');
    }
}
