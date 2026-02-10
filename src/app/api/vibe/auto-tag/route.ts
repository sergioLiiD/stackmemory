
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { content, projectId } = await req.json();

        if (!content || !projectId) {
            return NextResponse.json({ error: 'Content and Project ID are required' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Limit Check (Optional hook)
        try {
            // We can reuse the 'chat' limit or a new 'ai_features' limit
            // For now, let's just log it but not block strict limits to encourage usage
        } catch (e) { }


        const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });

        const prompt = `
        Analyze the following developer journal entry and generate a list of 3-5 relevant semantic tags (hashtags).
        
        The tags should be:
        - Concise (one word preferred, max 2 words).
        - Relevant to software engineering, the specific technologies mentioned, or the type of work (e.g., #debugging, #react, #database, #planning).
        - Lowercase.
        - Do not include the '#' symbol in the output list, just the words.
        
        Return ONLY a JSON array of strings. Example: ["react", "bugfix", "performance"]

        JOURNAL CONTENT:
        ${content}
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON
        let tags: string[] = [];
        try {
            // Clean markdown code blocks if Gemini returns them
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            tags = JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse Gemini Auto-Tag response", text);
            // Fallback: simple split if JSON fails, or return empty
            return NextResponse.json({ tags: [] });
        }

        return NextResponse.json({ tags });

    } catch (error: any) {
        console.error("Auto-Tag API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to auto-tag' },
            { status: 500 }
        );
    }
}
