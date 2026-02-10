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

        // A. Check Limits
        const { allowed, error: limitError } = await import('@/lib/limits').then(m => m.checkAndIncrementLimit(user.id, 'insight'));
        if (!allowed) {
            return NextResponse.json({ error: limitError }, { status: 403 });
        }

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

        // 3. Prompt Gemini 3.0 Flash (The "Architect")
        const systemPrompt = `You are a Senior Principal Software Architect and UI Designer.
Your goal is to write a "Project Insight Report" (The Bible) for a new CTO or Investor.

OUTPUT FORMAT:
- **Markdown ONLY**.
- **Do NOT** use code blocks (\`\`\`). Return raw markdown text.
- **Styling Hooks**:
  - Use **# Headers** for main sections.
  - Use **> Blockquotes** for summaries/impact statements.
  - Use **- Bullet points** for lists.
  - Use **bold** for emphasis.

STRUCTURE:
1. **# [Project Name]** (Hero Title)
2. **> Impact Summary** (One sentence summary in a blockquote)
3. **## Executive Summary**
4. **## Key Features** (Bulleted list)
5. **## Tech Stack Analysis** (Why use this?)
6. **## Architectural Map** (Data flow)
7. **## Improvement Opportunities** (Refactoring)

Make it comprehensive but structured.
`;

        const userMessage = `
PROJECT FILE TREE:
${fileTree}

CRITICAL FILE CONTENTS (Documentation & Configs):
${contextContent}

Please generate the Project Insight Report.
`;

        const model = genAI.getGenerativeModel({
            model: "gemini-3.0-flash",
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent([
            "OUTPUT RULES: Return RAW Markdown. DO NOT wrap in ```markdown code blocks.",
            userMessage
        ]);

        let report = result.response.text();

        // CLEANUP: Remove markdown code blocks if Gemini ignores instructions
        report = report.replace(/```markdown/g, '').replace(/```/g, '');

        // LOG USAGE
        // Calculate rough tokens
        const inputTokens = Math.ceil((userMessage.length + systemPrompt.length) / 4);
        const outputTokens = Math.ceil(report.length / 4);
        const { logUsage } = await import('@/lib/usage-logger');
        await logUsage(projectId, 'insight', 'gemini-3.0-flash', inputTokens, outputTokens);

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
