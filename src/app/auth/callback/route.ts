import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    // Enforce dashboard redirect
    let next = searchParams.get('next')
    if (!next || next === '/' || next === '') {
        next = '/dashboard'
    }

    // Determine the base URL (origin) robustly
    let origin = process.env.NEXT_PUBLIC_SITE_URL;
    if (!origin) {
        // Fallback to request origin, but force https in production if needed
        const urlObj = new URL(request.url);
        origin = urlObj.origin;
        if (origin.includes('stackmemory.app') && origin.startsWith('http://')) {
            origin = origin.replace('http://', 'https://');
        }
    }
    // Remove trailing slash if present to avoid double slashes
    origin = origin.replace(/\/$/, '');

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options)
                            })
                        } catch (error) {
                            // Ignore if called from server component, but this is a Route Handler so it works.
                            console.error("Cookie setting failed:", error)
                        }
                    },
                },
            }
        )

        try {
            const { error } = await supabase.auth.exchangeCodeForSession(code)

            if (!error) {
                return NextResponse.redirect(`${origin}${next}`)
            } else {
                console.error("Auth Exchange Error:", error);
                return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
            }
        } catch (err: any) {
            console.error("Auth Exchange Crash:", err);
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(err.message || "Unknown error")}`)
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=No_Code_Provided`)
}
