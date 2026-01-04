import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { workflow_id, json, project_id } = await req.json();

        if (!json || !workflow_id) {
            return NextResponse.json({ error: "Missing json or workflow_id" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing AI API Key" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are an expert in n8n automation workflows. 
        Analyze the following n8n workflow JSON.
        
        Task:
        1. Summarize its purpose in 2 clear, human-readable sentences.
        2. Mention the key triggers (e.g. Webhook, Cron) and key actions (e.g. Stripe Payment, Database Update).
        3. Do not mention specific Node IDs or technical jargon unless necessary.
        
        JSON Content:
        ${JSON.stringify(json).substring(0, 30000)} // Truncate check for safety
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Persist to Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for backend updates

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            await supabase
                .from('workflows')
                .update({ ai_description: text })
                .eq('id', workflow_id);
        }

        return NextResponse.json({ summary: text });

    } catch (error) {
        console.error("AI Workflow Analysis Failed:", error);
        return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
    }
}
