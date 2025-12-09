import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = (cookieStore: ReturnType<typeof cookies> | Awaited<ReturnType<typeof cookies>>) => {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    // If cookieStore is a promise, it should have been awaited before passing here,
                    // or we assume it's the object.
                    // However, to support Next.js 15+ correctly, the caller should await cookies().
                    return (cookieStore as any).get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        (cookieStore as any).set({ name, value, ...options })
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        (cookieStore as any).set({ name, value: '', ...options })
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                    }
                },
            },
        }
    )
}
