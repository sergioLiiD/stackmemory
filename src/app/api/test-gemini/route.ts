import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
    const results: any = {
        envVarPresent: !!process.env.GOOGLE_API_KEY,
        geminiTest: { attempts: [] },
        dbTest: null
    };

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

        // Attempt 1: text-embedding-004 with v1
        try {
            // @ts-ignore - Forcing v1 API
            const m1 = genAI.getGenerativeModel({ model: "text-embedding-004" }, { apiVersion: 'v1' });
            const r1 = await m1.embedContent("test");
            results.geminiTest.attempts.push({
                model: "text-embedding-004 (v1)",
                success: true,
                dims: r1.embedding.values.length
            });
        } catch (e: any) {
            results.geminiTest.attempts.push({ model: "text-embedding-004 (v1)", success: false, error: e.message });
        }

        // Attempt 2: embedding-001 with v1
        try {
            // @ts-ignore - Forcing v1 API
            const m2 = genAI.getGenerativeModel({ model: "embedding-001" }, { apiVersion: 'v1' });
            const r2 = await m2.embedContent("test");
            results.geminiTest.attempts.push({
                model: "embedding-001 (v1)",
                success: true,
                dims: r2.embedding.values.length
            });
        } catch (e: any) {
            results.geminiTest.attempts.push({ model: "embedding-001 (v1)", success: false, error: e.message });
        }

        // Attempt 3: models/text-embedding-004 (full prefix)
        try {
            const m3 = genAI.getGenerativeModel({ model: "models/text-embedding-004" });
            const r3 = await m3.embedContent("test");
            results.geminiTest.attempts.push({
                model: "models/text-embedding-004",
                success: true,
                dims: r3.embedding.values.length
            });
        } catch (e: any) {
            results.geminiTest.attempts.push({ model: "models/text-embedding-004", success: false, error: e.message });
        }

    } catch (e: any) {
        results.geminiTest.error = e.message;
    }

    // Database check
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
