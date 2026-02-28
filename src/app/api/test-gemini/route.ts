import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
    const results: any = {
        envVarPresent: !!process.env.GOOGLE_API_KEY,
        geminiTest: null,
        dbTest: null
    };

    // 1. Test Gemini Models
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
        results.geminiTest = { attempts: [] };

        // Attempt 1: text-embedding-004
        try {
            const m1 = genAI.getGenerativeModel({ model: "text-embedding-004" });
            const r1 = await m1.embedContent("test");
            results.geminiTest.attempts.push({
                model: "text-embedding-004",
                success: true,
                dims: r1.embedding.values.length,
                sample: r1.embedding.values.slice(0, 3)
            });
        } catch (e: any) {
            results.geminiTest.attempts.push({ model: "text-embedding-004", success: false, error: e.message });
        }

        // Attempt 2: embedding-001
        try {
            const m2 = genAI.getGenerativeModel({ model: "embedding-001" });
            const r2 = await m2.embedContent("test");
            results.geminiTest.attempts.push({
                model: "embedding-001",
                success: true,
                dims: r2.embedding.values.length,
                sample: r2.embedding.values.slice(0, 3)
            });
        } catch (e: any) {
            results.geminiTest.attempts.push({ model: "embedding-001", success: false, error: e.message });
        }
    } catch (e: any) {
        results.geminiTest = { success: false, error: e.message };
    }

    // 2. Test Database Access (Simplified)
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { count, error } = await supabase.from('embeddings').select('*', { count: 'exact', head: true }).limit(1);
        results.dbTest = { success: !error, count: count || 0, error: error?.message };
    } catch (e: any) {
        results.dbTest = { success: false, error: e.message };
    }

    return NextResponse.json(results);
}
