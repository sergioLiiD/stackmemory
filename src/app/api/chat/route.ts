
import { NextResponse } from 'next/server';
import { searchSimilarDocuments } from '@/lib/vector-store';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export const runtime = 'edge'; // Optional: Use edge runtime for faster streaming if compatible with supabase access (Supabase JS is edge compatible, but pgvector RPC content might be heavy. Let's stick to nodejs default if unsure, but usually edge is fine for this).
// Actually, 'vector-store.ts' uses 'cookies()' which works in edge, but 'supabase/ssr' or 'supabase-js' might need specific handling. 
// Safest to stick to Node.js runtime for now to avoid specific Edge warnings unless requested.

export async function POST(req: Request) {
    try {
        const { query, projectId, image } = await req.json();

        if ((!query && !image) || !projectId) {
            return NextResponse.json({ error: 'Query/Image and Project ID are required' }, { status: 400 });
        }

        // 1. Retrieve Context
        // Note: For image-only queries, we might still want RAG if there's text, 
        // OR we might want to just let Gemini analyze the image. 
        // For now, if there is a query text, we do RAG.
        let documents: any[] = [];
        let contextText = "";

        if (query && query.length > 5) { // Only RAG if meaningful text
            documents = await searchSimilarDocuments(projectId, query);
            contextText = documents.map((doc: any) =>
                `--- FILE: ${doc.file_path} ---\n${doc.content}\n------`
            ).join('\n\n');
        }

        const systemPrompt = `You are Vibe Coder, an expert senior software engineer assisting the user with their project.
You have access to valid code snippets from the project's codebase below.

CONTEXT CODEBASE:
${contextText}

INSTRUCTIONS:
- Answer the user's question based PRIMARILY on the provided context.
- If the user provides an IMAGE, analyze it carefully (it might be a UI error, a design, or code screenshot).
- If the context answers the question, cite the specific files.
- If the context is missing information, say so, but try to answer based on general knowledge if appropriate (while noting it's not in the visible context).
- Be concise, professional, and helpful.
- Use Markdown for code blocks.
`;

        // 2. Generate Stream with Gemini
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt
        });

        // Construct Content Parts
        let promptParts: any[] = [];

        if (query) {
            promptParts.push(query);
        }

        if (image) {
            // content type: 'image/jpeg' or 'image/png'. 
            // The frontend sends raw base64 dataUrl: "data:image/png;base64,....."
            // We need to strip the prefix.
            const base64Data = image.split(',')[1];
            // Detect mime type
            const mimeType = image.split(';')[0].split(':')[1];

            promptParts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            });
        }

        if (promptParts.length === 0) {
            return NextResponse.json({ error: 'No content provided' }, { status: 400 });
        }

        const result = await model.generateContentStream(promptParts);

        // 3. Return Readable Stream
        const readableStream = new ReadableStream({
            async start(controller) {
                let fullText = "";

                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                        fullText += text;
                        controller.enqueue(new TextEncoder().encode(text));
                    }
                }

                // Log Usage
                // Estimate roughly tokens (Gemini has its own counters but for MVP we estimate)
                const inputLength = systemPrompt.length + query.length;
                const outputLength = fullText.length;
                const estimatedInputTokens = Math.ceil(inputLength / 4);
                const estimatedOutputTokens = Math.ceil(outputLength / 4);

                try {
                    const { logUsage } = await import('@/lib/usage-logger');
                    await logUsage(projectId, 'chat', 'gemini-1.5-flash', estimatedInputTokens, estimatedOutputTokens);
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
