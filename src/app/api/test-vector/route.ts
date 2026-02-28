import { NextResponse } from 'next/server';
import { searchSimilarDocuments } from '@/lib/vector-store';

export async function POST(req: Request) {
    try {
        const { projectId, query } = await req.json();

        if (!projectId || !query) {
            return NextResponse.json({ error: 'projectId and query required' }, { status: 400 });
        }

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
