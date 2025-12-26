import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { projectId } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // 1. Verify Authentication & Access
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // (Optional: Verify user owns project)

        // 2. Fetch Project Context
        // A. Get File List (Distinct paths)
        // We can't do "select distinct file_path" easily with simple Supabase JS without RPC usually, 
        // but we can just fetch all and dedup in JS if not too massive, OR use a small limit.
        // Better: Fetch just file_paths.
        const { data: files } = await supabase
            .from('embeddings')
            .select('file_path')
            .eq('project_id', projectId);

        const uniqueFiles = Array.from(new Set(files?.map(f => f.file_path) || [])).slice(0, 500); // Limit to 500 files to save context
        const fileStructure = uniqueFiles.join('\n');

        // B. Get README content
        const { data: readmeChunks } = await supabase
            .from('embeddings')
            .select('content')
            .eq('project_id', projectId)
            .ilike('file_path', '%README%')
            .limit(3); // First 3 chunks of README

        const readmeContent = readmeChunks?.map(c => c.content).join('\n') || "No README found.";

        // 3. Prompt Gemini
        const systemPrompt = `You are a Senior Technical Lead onboarding a new junior developer to this codebase.
Your goal is to explain the ARCHITECTURE and KEY FILES of the project in a simple, engaging way.

Create a 5-Step "Interactive Tour" of the codebase.
For each step, choose a CRITICAL file (like the entry point, the main config, the database schema, or a core component).

Respond ONLY with valid JSON in this format:
{
  "title": "Tour Title (e.g. 'How StackMemory Works')",
  "steps": [
    {
      "step_number": 1,
      "title": "The Entry Point",
      "file_path": "src/app/page.tsx",
      "description": "Here is where the magic begins...",
      "why_important": "This file handles the main routing..."
    }
  ]
}

- The 'file_path' MUST exist in the provided file list.
- Keep descriptions concise (under 2 sentences).
- 'why_important' should explain the architectural role.
`;

        const userMessage = `
PROJECT FILE STRUCTURE:
${fileStructure}

README CONTENT:
${readmeContent}

Generate the onboarding tour.
`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
        const result = await model.generateContent([systemPrompt, userMessage]);
        const responseText = result.response.text();

        return NextResponse.json(JSON.parse(responseText));

    } catch (e: any) {
        console.error("VibeOnboard Error:", e);
        return NextResponse.json({ error: e.message || 'Failed to generate tour' }, { status: 500 });
    }
}
