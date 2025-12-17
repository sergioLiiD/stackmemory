```typescript
import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = new Map<string, { value: string, options: CookieOptions }>()
    
    // Create a temporary client that writes to our map
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
             // Read from incoming request
             const match = request.headers.get('cookie')?.match(new RegExp(`(^| )${ name }=([^;] +)`));
             return match ? match[2] : undefined;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set(name, { value, options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set(name, { value: '', options: { ...options, maxAge: -1 } })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Create response
      const response = NextResponse.redirect(`${ origin }${ next } `)
      
      // Copy cookies from our map to the response
      cookieStore.forEach(({ value, options }, name) => {
          response.cookies.set(name, value, options);
      });
      
      return response
    } else {
       console.error("Auth Exchange Error:", error);
       return NextResponse.redirect(`${ origin } /auth/auth - code - error ? error = ${ encodeURIComponent(error.message) } `)
    }
  }

  return NextResponse.redirect(`${ origin } /auth/auth - code - error ? error = No_Code_Provided`)
}
```
