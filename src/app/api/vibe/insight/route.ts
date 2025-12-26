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

        // 1. Verify Authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 2. Fetch Massive Context
        // A. File Tree (All paths)
        const { data: allFiles } = await supabase
            .from('embeddings')
            .select('file_path')
            .eq('project_id', projectId);

        const fileTree = allFiles?.map(f => f.file_path).sort().join('\n') || "No files found";

        // B. Fetch Critical Files & Documentation
        // We want: all .md files, package.json, config files, and maybe schema files.
        const criticalPatterns = ['%.md', '%package.json%', '%config%', '%schema%', '%layout.tsx%', '%page.tsx%'];
        let contextContent = "";

        // Depending on DB size, we might need multiple queries or a smarter filter.
        // For now, let's grab top 50 files that match key patterns.
        const { data: contentFiles } = await supabase
            .from('embeddings')
            .select('file_path, content')
            .eq('project_id', projectId)
            .or(criticalPatterns.map(p => `file_path.ilike.${p}`).join(','));

        if (contentFiles) {
            contextContent = contentFiles.map(f => `
--- FILE: ${f.file_path} ---
${f.content}
---------------------------
`).join('\n');
        }

        // 3. Prompt Gemini 2.0 Flash (The "Architect")
        const systemPrompt = `You are a Senior Principal Software Architect auditing this codebase.
Your goal is to write a "Project Insight Report" (The Bible) for a new CTO or Investor.
The report must be comprehensive yet readable.

STRUCTURE OF THE REPORT (Markdown):

# [Project Name] - Architectural Insight

## 1. Executive Summary
(2-3 paragraphs. What is this project? What problem does it solve? Who is it for? Write for a non-technical stakeholder.)

## 2. Key Features & Capabilities
(Bulleted list of high-level features inferred from the code.)

## 3. Technology Stack Analysis
(Why were these choices made? e.g. "Uses Next.js App Router for...", "Supabase for...", "Tailwind for...")

## 4. Architectural Map
(Explain the data flow. How does the Frontend talk to the Backend? Where is state managed? How is Auth handled?)

## 5. Critical Files Deep Dive
(Select the top 5-10 most important files from the file tree and specific content provided. Explain what they do.)

## 6. Improvement Opportunities
(Based on your audit, suggest 3 high-impact technical improvements or refactors.)
`;

        const userMessage = `
PROJECT FILE TREE:
${fileTree}

CRITICAL FILE CONTENTS (Documentation & Configs):
${contextContent}

Please generate the Project Insight Report.
`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Default is text output, which is what we want (Markdown)
        const result = await model.generateContent([systemPrompt, userMessage]);
        const report = result.response.text();

        // 4. Save to Database
        const { error: updateError } = await supabase
            .from('projects')
            .update({
                insight_report: report,
                insight_generated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        if (updateError) {
            console.error("Failed to save report:", updateError);
            // We still return the report even if save failed
        }

        return NextResponse.json({ report });

    } catch (e: any) {
        console.error("Project Insight Error:", e);
        return NextResponse.json({ error: e.message || 'Failed to generate insight' }, { status: 500 });
    }
}
