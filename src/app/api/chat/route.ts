
import { NextResponse } from 'next/server';
import { searchSimilarDocuments } from '@/lib/vector-store';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export const runtime = 'nodejs'; // REQUIRED for fs and GoogleAIFileManager uploadFile
// Actually, 'vector-store.ts' uses 'cookies()' which works in edge, but 'supabase/ssr' or 'supabase-js' might need specific handling. 
// Safest to stick to Node.js runtime for now to avoid specific Edge warnings unless requested.

// Ensure you have `npm install @google/generative-ai` which includes server capability or separate package if needed.
// We are using dynamic import for `GoogleAIFileManager` to avoid build issues on Edge (though we forced Node runtime).
export async function POST(req: Request) {
    try {
        const { query, projectId, media, mediaUrl } = await req.json();

        if ((!query && !media && !mediaUrl) || !projectId) {
            return NextResponse.json({ error: 'Query/Media and Project ID are required' }, { status: 400 });
        }

        const cookieStore = await cookies();
        let supabase = createClient(cookieStore);
        let { data: { user } } = await supabase.auth.getUser();

        // 2. Try Bearer Token (if no cookie user)
        if (!user && req.headers.get('Authorization')) {
            const token = req.headers.get('Authorization')?.replace('Bearer ', '');
            if (token) {
                const { createClient: createClientManual } = await import('@supabase/supabase-js');
                const manualClient = createClientManual(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    {
                        global: {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    }
                );
                const { data: { user: tokenUser } } = await manualClient.auth.getUser();
                user = tokenUser;
                if (user) supabase = manualClient as any;
            }
        }

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 0.5. Check Feature Gating (Video/Media is PRO ONLY)
        // Fetch profile to check tier
        const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single();

        const isPro = ['pro', 'founder'].includes(profile?.tier || 'free');

        if ((media || mediaUrl) && !isPro) {
            return NextResponse.json({ error: 'Multimedia/Video analysis is a Pro feature.' }, { status: 403 });
        }

        // 1. Retrieve Context
        // Note: For image-only queries, we might still want RAG if there's text, 
        // OR we might want to just let Gemini analyze the image. 
        // For now, if there is a query text, we do RAG.
        let documents: any[] = [];
        let contextText = "";

        if (query && query.length > 5) { // Only RAG if meaningful text
            console.log("CHAT DEBUG: Searching for documents...", { projectId, query });
            documents = await searchSimilarDocuments(projectId, query);
            console.log("CHAT DEBUG: Found documents:", documents.map((d: any) => d.file_path));

            contextText = documents.map((doc: any) =>
                `--- FILE: ${doc.file_path} ---\n${doc.content}\n------`
            ).join('\n\n');
        }

        // 1.5 Fetch Project Stack (Dependencies)
        const { data: projectData } = await supabase
            .from('projects')
            .select('stack')
            .eq('id', projectId)
            .single();

        const stackContext = projectData?.stack && Array.isArray(projectData.stack)
            ? projectData.stack.map((s: any) => `- ${s.name}: ${s.version || 'unknown'}`).join('\n')
            : "No stack information available.";

        const systemPrompt = `You are Vibe Coder, an expert senior software engineer assisting the user with their project.
You have access to valid code snippets from the project's codebase and the project's tech stack below.

PROJECT TECH STACK (from package.json):
${stackContext}

CONTEXT CODEBASE (RAG Results):
${contextText}

INSTRUCTIONS:
- Answer the user's question based PRIMARILY on the provided context.
- If the user provides an IMAGE or VIDEO, analyze it carefully (it might be a UI error, a design, or code screenshot).
- For VIDEOS, pay attention to temporal changes, animations, or bugs that occur over time.
- If the context answers the question, cite the specific files.
- If the context is missing information, say so, but try to answer based on general knowledge if appropriate (while noting it's not in the visible context).
- Be concise, professional, and helpful.
- Use Markdown for code blocks.
`;

        // 2. Prepare Content (Text + Media)
        let promptParts: any[] = [];
        let fileUri: string | null = null;

        if (query) promptParts.push(query);

        // Handle Media (Base64 OR URL)
        if (mediaUrl) {
            // Server-to-Server Upload to Gemini (Bypassing Vercel Body Limits)
            // 1. Download from Supabase (Public URL)
            const fileRes = await fetch(mediaUrl);
            const arrayBuffer = await fileRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // 2. Temp File for Upload (Google FileManager needs a path usually, OR we can use specific stream methods?)
            // The Node SDK `uploadFile` requires a path. We need to write to /tmp.
            // Edge runtime does NOT support filesystem. We MUST use Node runtime (already set).
            const fs = await import('fs');
            const path = await import('path');
            const os = await import('os');
            const { GoogleAIFileManager } = await import('@google/generative-ai/server');

            const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY || '');

            const tempFilePath = path.join(os.tmpdir(), `gemini_upload_${Date.now()}`);
            fs.writeFileSync(tempFilePath, buffer);

            // 3. Upload to Google
            const uploadResponse = await fileManager.uploadFile(tempFilePath, {
                mimeType: fileRes.headers.get('content-type') || 'video/mp4',
                displayName: "User Upload"
            });

            fileUri = uploadResponse.file.uri;

            // 4. Wait for processing (for Video)
            if (uploadResponse.file.state === 'PROCESSING') {
                // Simple poll
                let state = 'PROCESSING';
                while (state === 'PROCESSING') {
                    await new Promise(r => setTimeout(r, 1000));
                    const check = await fileManager.getFile(uploadResponse.file.name);
                    state = check.state;
                    if (state === 'FAILED') throw new Error("Video processing failed.");
                }
            }

            promptParts.push({
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: fileUri
                }
            });

            // Cleanup Temp
            fs.unlinkSync(tempFilePath);

        } else if (media) {
            // Standard Base64 (Legacy/Small Images)
            const base64Data = media.split(',')[1];
            const mimeType = media.split(';')[0].split(':')[1];
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

        const { safeGenerateContentStream } = await import('@/lib/gemini');

        const { result, modelUsed } = await safeGenerateContentStream({
            systemInstruction: systemPrompt,
            contents: promptParts
        });

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
                    await logUsage(projectId, 'chat', modelUsed, estimatedInputTokens, estimatedOutputTokens);
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
