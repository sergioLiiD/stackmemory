import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { workflow_id, json, project_id, image, messages } = await req.json();

        if (!json || !workflow_id) {
            return NextResponse.json({ error: "Missing json or workflow_id" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
            return NextResponse.json({ error: "Server Configuration Error: Missing AI Key" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // User reported 1.5 deprecated/not found, switching to 3.0
        const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });

        // CHAT MODE
        if (messages && Array.isArray(messages)) {
            // We construct the history. 
            // The JSON context is Critical. We'll add it as a System Instruction if supported, or just the first user message.
            // Gemini 3.0 supports systemInstruction in model config, but for simplicity we can just prepend.

            const systemPrompt = `You are an expert in n8n automation workflows. 
            Here is the JSON definition of the workflow you are analyzing:
            \`\`\`json
            ${JSON.stringify(json).substring(0, 30000)}
            \`\`\`
            
            Answer the user's questions about this workflow. BE CONCISE.
            If the user sends an image, analyze it in context of this workflow (e.g. error logs, node configurations).`;

            // Transform frontend messages to Gemini format
            // Frontend: { role: 'user'|'model', parts: [{text: ...}, {inline_data: ...}] }
            // Gemini API expects history to NOT include the current turn? 
            // Wait, sendMessage in Gemini SDK handles the new message separately.
            // So we take everything EXCEPT the last one as history, and the last one as the message to send.

            const lastMsg = messages[messages.length - 1];
            const history = messages.slice(0, -1).map((m: any) => ({
                role: m.role,
                parts: m.parts
            }));

            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }]
                    },
                    {
                        role: "model",
                        parts: [{ text: "Understood. I have read the workflow JSON. How can I help?" }]
                    },
                    ...history
                ]
            });

            const result = await chat.sendMessage(lastMsg.parts);
            const response = await result.response;
            const text = response.text();

            return NextResponse.json({ reply: text });
        }

        // --- LEGACY / SUMMARY MODE (One-shot) ---
        // (Kept for backward compatibility or initial summary generation)

        let promptParts: any[] = [];
        const basePrompt = `You are an expert in n8n automation workflows. 
        Analyze the provided context.
        Task: Detailed summary of this workflow.
        JSON Content:
        ${JSON.stringify(json).substring(0, 30000)}
        `;
        promptParts.push(basePrompt);

        // Image Handling (Multimodal)
        if (image) {
            // content-type is usually inside the base64 string "data:image/png;base64,..."
            // we need to strip the prefix for Gemini SDK usually, or pass it as inlineData
            const base64Data = image.split(',')[1] || image;
            const mimeType = image.split(';')[0].split(':')[1] || "image/png";

            promptParts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            });
        }

        const result = await model.generateContent(promptParts);
        const response = await result.response;
        const text = response.text();

        // Persist summary
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            await supabase
                .from('workflows')
                .update({ ai_description: text })
                .eq('id', workflow_id);
        } else {
            console.warn("Missing Supabase Keys for persistence");
        }

        return NextResponse.json({ summary: text });

    } catch (error: any) {
        console.error("AI Workflow Analysis Failed:", error);
        return NextResponse.json({ error: error.message || "Analysis failed" }, { status: 500 });
    }
}
