import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { workflow_id, json, project_id, image } = await req.json();

        if (!json || !workflow_id) {
            return NextResponse.json({ error: "Missing json or workflow_id" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
            return NextResponse.json({ error: "Server Configuration Error: Missing AI Key" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let promptParts: any[] = [];

        // Text Prompt
        const basePrompt = `You are an expert in n8n automation workflows. 
        Analyze the provided context.
        
        Task:
        1. Summarize the workflow's purpose in 2 clear, human-readable sentences.
        2. Mention the key triggers (e.g. Webhook, Cron) and key actions.
        3. If an image is provided, use it to verify the node layout or identify visual notes that aren't in the JSON.
        
        JSON Content:
        ${JSON.stringify(json).substring(0, 30000)} // Truncate check for safety
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

        // Persist to Supabase
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
