
import { NextResponse } from 'next/server';
import { searchSimilarDocuments } from '@/lib/vector-store';

export async function POST(req: Request) {
    try {
        const { query, projectId } = await req.json();

        if (!query || !projectId) {
            return NextResponse.json({ error: 'Query and Project ID are required' }, { status: 400 });
        }

        const documents = await searchSimilarDocuments(projectId, query);

        return NextResponse.json({
            success: true,
            results: documents
        });

    } catch (error: any) {
        console.error("Search API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Search failed' },
            { status: 500 }
        );
    }
}
