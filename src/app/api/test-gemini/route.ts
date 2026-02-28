import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
    const apiKey = process.env.GOOGLE_API_KEY || '';
    const results: any = {
        envVarPresent: !!apiKey,
        apiKeyPrefix: apiKey ? apiKey.substring(0, 5) + '...' : 'NONE',
        apiDiscovery: {
            v1beta: null,
            v1: null
        },
        dbTest: null
    };

    // 1. Raw API Discovery (List Models)
    try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await resp.json();
        results.apiDiscovery.v1beta = {
            status: resp.status,
            modelCount: data.models?.length || 0,
            embeddingModels: data.models?.filter((m: any) => m.supportedGenerationMethods?.includes('embedContent')).map((m: any) => m.name),
            error: data.error
        };
    } catch (e: any) {
        results.apiDiscovery.v1beta = { error: e.message };
    }

    try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const data = await resp.json();
        results.apiDiscovery.v1 = {
            status: resp.status,
            modelCount: data.models?.length || 0,
            embeddingModels: data.models?.filter((m: any) => m.supportedGenerationMethods?.includes('embedContent')).map((m: any) => m.name),
            error: data.error
        };
    } catch (e: any) {
        results.apiDiscovery.v1 = { error: e.message };
    }

    // 2. Database Check
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
