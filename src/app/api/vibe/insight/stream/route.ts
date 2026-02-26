import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { safeGenerateContentStream } from '@/lib/gemini';

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

        // 2. Check Limits
        const { allowed, error: limitError } = await import('@/lib/limits').then(m => m.checkAndIncrementLimit(user.id, 'insight'));
        if (!allowed) {
            return NextResponse.json({ error: limitError }, { status: 403 });
        }

        // 3. Fetch Context
        const { data: allFiles } = await supabase
            .from('embeddings')
            .select('file_path')
            .eq('project_id', projectId);

        const fileTree = allFiles?.map(f => f.file_path).sort().join('\n') || "No files found";

        const criticalPatterns = ['%.md', '%package.json%', '%config%', '%schema%', '%layout.tsx%', '%page.tsx%'];
        let contextContent = "";

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

        const { result, modelUsed } = await safeGenerateContentStream({
            model: "gemini-3.1-pro-preview",
            systemInstruction: systemPrompt,
            contents: [
                { text: "OUTPUT RULES: Return RAW Markdown. DO NOT wrap in ```markdown code blocks." },
                { text: userMessage }
            ]
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                let fullReport = "";
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        fullReport += chunkText;
                        controller.enqueue(encoder.encode(chunkText));
                    }

                    // Save to DB & Log Usage after stream completes
                    // Note: This runs on the server after the stream is sent to the consumer
                    // Cleanup markdown blocks if any
                    const finalizedReport = fullReport.replace(/```markdown/g, '').replace(/```/g, '');

                    const inputTokens = Math.ceil((userMessage.length + systemPrompt.length) / 4);
                    const outputTokens = Math.ceil(finalizedReport.length / 4);

                    const { logUsage } = await import('@/lib/usage-logger');
                    await logUsage(projectId, 'insight', modelUsed, inputTokens, outputTokens);

                    await supabase
                        .from('projects')
                        .update({
                            insight_report: finalizedReport,
                            insight_generated_at: new Date().toISOString()
                        })
                        .eq('id', projectId);

                } catch (err) {
                    console.error("Streaming error:", err);
                    controller.error(err);
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (e: any) {
        console.error("Project Insight Streaming Error:", e);
        return NextResponse.json({ error: e.message || 'Failed to generate insight' }, { status: 500 });
    }
}
