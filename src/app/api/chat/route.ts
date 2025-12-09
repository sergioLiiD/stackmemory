
import { NextResponse } from 'next/server';
import { searchSimilarDocuments } from '@/lib/vector-store';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge'; // Optional: Use edge runtime for faster streaming if compatible with supabase access (Supabase JS is edge compatible, but pgvector RPC content might be heavy. Let's stick to nodejs default if unsure, but usually edge is fine for this).
// Actually, 'vector-store.ts' uses 'cookies()' which works in edge, but 'supabase/ssr' or 'supabase-js' might need specific handling. 
// Safest to stick to Node.js runtime for now to avoid specific Edge warnings unless requested.

export async function POST(req: Request) {
    try {
        const { query, projectId } = await req.json();

        if (!query || !projectId) {
            return NextResponse.json({ error: 'Query and Project ID are required' }, { status: 400 });
        }

        // 1. Retrieve Context
        const documents = await searchSimilarDocuments(projectId, query);

        // Format context for the LLM
        const contextText = documents.map((doc: any) =>
            `--- FILE: ${doc.file_path} ---\n${doc.content}\n------`
        ).join('\n\n');

        const systemPrompt = `You are Vibe Coder, an expert senior software engineer assisting the user with their project.
You have access to valid code snippets from the project's codebase below.

CONTEXT CODEBASE:
${contextText}

INSTRUCTIONS:
- Answer the user's question based PRIMARILY on the provided context.
- If the context answers the question, cite the specific files.
- If the context is missing information, say so, but try to answer based on general knowledge if appropriate (while noting it's not in the visible context).
- Be concise, professional, and helpful.
- Use Markdown for code blocks.
`;

        // 2. Generate Stream
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query }
            ],
            stream: true,
        });

        // 3. Return Readable Stream
        // Convert OpenAI stream to Web Standard stream
        const readableStream = new ReadableStream({
            async start(controller) {
                let fullText = "";

                for await (const chunk of stream) {
                    const text = chunk.choices[0]?.delta?.content || '';
                    if (text) {
                        fullText += text;
                        controller.enqueue(new TextEncoder().encode(text));
                    }
                }

                // Log Usage
                const inputLength = systemPrompt.length + query.length;
                const outputLength = fullText.length;
                const estimatedInputTokens = Math.ceil(inputLength / 4);
                const estimatedOutputTokens = Math.ceil(outputLength / 4);

                // We use import inside edge wrapper if possible, or just a fetch if Edge. 
                // But we are using Node runtime (implicit default).
                try {
                    const { logUsage } = await import('@/lib/usage-logger');
                    await logUsage(projectId, 'chat', 'gpt-4o-mini', estimatedInputTokens, estimatedOutputTokens);
                } catch (e) {
                    console.error("Failed to log chat usage", e);
                }

                const sourcesList = documents.map((d: any) => d.file_path).join(', ');
                if (sourcesList) {
                    controller.enqueue(new TextEncoder().encode(`\n\n__SOURCES__:${JSON.stringify(documents)}`));
                }

                controller.close();
            },
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Chat failed' },
            { status: 500 }
        );
    }
}
