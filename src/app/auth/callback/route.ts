import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const cookieStore = await cookies()

        // Debug: Log all cookies to check for verifier
        const cookieNames = cookieStore.getAll().map(c => c.name);
        console.log("Auth Callback Cookies:", cookieNames);
        const hasVerifier = cookieNames.some(n => n.includes('code-verifier'));
        console.log("Has Verifier Cookie:", hasVerifier);

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options })
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log("Session Exchange Success");
            return NextResponse.redirect(`${origin}${next}`)
        } else {
            console.error("Auth Exchange Error:", error);
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}&code=${code}`)
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=No_Code_Provided`)
}
