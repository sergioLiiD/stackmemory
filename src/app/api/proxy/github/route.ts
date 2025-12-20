
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { url, token } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // Dynamically set Accept header based on target URL

        // Handle Contents API
        if (url.includes('/contents/')) {
            // Check if it's a directory listing request (ends in / or has query params right after contents)
            // e.g., .../contents/?ref=main
            const isDirectory = url.endsWith('/') || url.includes('/contents/?');

            if (isDirectory) {
                headers['Accept'] = 'application/vnd.github.v3+json';
            } else {
                headers['Accept'] = 'application/vnd.github.v3.raw';
            }
        }
        // Standard API call (metadata, user info) -> JSON
        else if (url.includes('api.github.com') && !url.includes('raw.githubusercontent.com')) {
            headers['Accept'] = 'application/vnd.github.v3+json';
        }
        // Fallback -> RAW
        else {
            headers['Accept'] = 'application/vnd.github.v3.raw';
        }

        const res = await fetch(url, { headers });

        if (!res.ok) {
            return NextResponse.json(
                { error: `GitHub fetch failed: ${res.status} ${res.statusText}` },
                { status: res.status }
            );
        }

        const data = await res.text(); // Return raw text (likely package.json content)

        return new NextResponse(data, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
