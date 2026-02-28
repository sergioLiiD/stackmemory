import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { safeGenerateContentStream } from '@/lib/gemini';

export async function POST(req: Request) {
    try {
        const { projectId, projectName } = await req.json();

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

        const criticalPatterns = [
            '%.md', '%package.json%', '%config%', '%schema%', '%layout.tsx%', '%page.tsx%',
            '%.py', '%.go', '%.rs', '%.php', '%.js', '%.ts', '%.tsx', '%.jsx',
            '%Dockerfile%', '%Makefile%', '%composer.json%', '%requirements.txt%', '%gemfile%', '%cargo.toml%'
        ];
        let contextContent = "";

        let { data: contentFiles, error: contentError } = await supabase
            .from('embeddings')
            .select('file_path, content')
            .eq('project_id', projectId)
            .or(criticalPatterns.map(p => `file_path.ilike.${p}`).join(','));

        if (contentError) console.error("Content fetch error:", contentError);

        // Fallback 1: If no "critical" files found, try to just get ANY files for this project
        if (!contentFiles || contentFiles.length === 0) {
            console.log("No critical files found, fetching first 20 available files for project:", projectId);
            const { data: topFiles, error: topError } = await supabase
                .from('embeddings')
                .select('file_path, content')
                .eq('project_id', projectId)
                .limit(20);

            if (topError) console.error("Top files fetch error:", topError);
            contentFiles = topFiles;
        }

        if (contentFiles && contentFiles.length > 0) {
            contextContent = contentFiles.map(f => `
--- FILE: ${f.file_path} ---
${f.content}
---------------------------
`).join('\n');
        } else {
            // DEBUG: Check if ANY embeddings exist for this project at all
            const { count } = await supabase
                .from('embeddings')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', projectId);

            console.log(`DEBUG: Embeddings count for ${projectId}: ${count || 0}`);
            if ((count || 0) === 0) {
                contextContent = "NO EMBEDDINGS FOUND IN DATABASE. Please 'Sync Repository' first.";
            } else {
                contextContent = "EMBEDDINGS EXIST BUT RETRIEVAL FAILED. Check RLS or Project ID mismatch.";
            }
        }

        const systemPrompt = `You are a Senior Principal Software Architect and UI Designer.
Your goal is to write a "Project Insight Report" (The Bible) based EXCLUSIVELY on the provided source code and file tree.

CRITICAL INSTRUCTIONS:
- **NO HALLUCINATIONS**: If the "CRITICAL FILE CONTENTS" is empty or does not contain enough information, YOU MUST SAY SO. 
- **DO NOT INVENT**: Do not assume a project is a "Portfolio", "CRM", or "Landing Page" unless you see the specific code for it.
- **GROUNDING**: Every claim you make about the Tech Stack or Features MUST be traceable to the provided file contents.
- **IDENTIFY LACK OF DATA**: If you see a file tree but no file contents, report that the "Codebase is indexed but contents are not yet accessible for deep analysis."

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
2. **> Impact Summary** (One sentence summary based on REAL CODE)
3. **## Executive Summary** (Briefly describe what the code actually does)
4. **## Key Features** (List only features found in the code/file tree)
5. **## Tech Stack Analysis** (Identify frameworks from package.json/imports)
6. **## Architectural Map** (Describe the folder structure and data flow)
7. **## Improvement Opportunities** (Real technical debt found in the code)

If no code is provided, your report should be a 1-paragraph status update stating that the codebase needs to be synchronized to provide a detailed analysis.
`;

        const userMessage = `
--- SOURCE OF TRUTH START ---
PROJECT NAME: ${projectName || 'Unknown Project'}

PROJECT FILE TREE:
${fileTree}

CRITICAL FILE CONTENTS (Actual Code Snippets):
${contextContent || "NO CODE SNIPPETS PROVIDED. DO NOT INVENT FEATURES."}
--- SOURCE OF TRUTH END ---

TASK: Based ONLY on the "SOURCE OF TRUTH" above, generate the Project Insight Report for ${projectName || 'this project'}. 
If there are no code snippets, clearly state that the analysis is limited to the file tree.
`;

        const { result, modelUsed } = await safeGenerateContentStream({
            model: "gemini-2.5-pro",
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
        console.error("Project Insight Error:", e);
        return NextResponse.json({ error: e.message || 'Failed to generate insight' }, { status: 500 });
    }
}
