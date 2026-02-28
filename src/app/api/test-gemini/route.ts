import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
    const apiKey = process.env.GOOGLE_API_KEY || '';
    const results: any = {
        envVarPresent: !!apiKey,
        geminiTest: { attempts: [] },
        dbTest: null
    };

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Targeted test for the model we just switched to
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
            const r = await model.embedContent("Checking connectivity and dimensions.");
            results.geminiTest.attempts.push({
                model: "gemini-embedding-001",
                success: true,
                dims: r.embedding.values.length,
                sample: r.embedding.values.slice(0, 3)
            });
        } catch (e: any) {
            results.geminiTest.attempts.push({
                model: "gemini-embedding-001",
                success: false,
                error: e.message
            });
        }

    } catch (e: any) {
        results.geminiTest.error = e.message;
    }

    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { count, error } = await supabase.from('embeddings').select('*', { count: 'exact', head: true });
        results.dbTest = { success: !error, count, error: error?.message };
    } catch (e: any) {
        results.dbTest = { error: e.message };
    }

    return NextResponse.json(results);
}
