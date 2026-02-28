import { NextResponse } from 'next/server';
import { searchSimilarDocuments } from '@/lib/vector-store';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const query = searchParams.get('query') || 'test';

    return handleTest(projectId, query);
}

export async function POST(req: Request) {
    const { projectId, query } = await req.json();
    return handleTest(projectId, query);
}

async function handleTest(projectId: string | null, query: string) {
    try {
        if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 });

        console.log(`DIAGNOSTIC: Testing vector search for ${projectId}...`);
        const results = await searchSimilarDocuments(projectId, query);

        return NextResponse.json({
            success: true,
            count: results?.length || 0,
            sample: results?.slice(0, 2)
        });

    } catch (e: any) {
        console.error("DIAGNOSTIC VECTOR ERROR:", e);
        return NextResponse.json({
            success: false,
            error: e.message,
            stack: e.stack
        }, { status: 500 });
    }
}
