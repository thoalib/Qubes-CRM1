import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function getDemoSessionFromCookie(cookieHeader: string | null) {
    if (!cookieHeader) return null
    try {
        const cookies = cookieHeader.split(";")
        const sessionCookie = cookies.find((c) => c.trim().startsWith("demo_session="))
        if (!sessionCookie) return null
        const sessionJson = decodeURIComponent(sessionCookie.split("=")[1])
        const session = JSON.parse(sessionJson)
        // Check if session expired
        if (session.expires_at && session.expires_at < Date.now()) {
            return null
        }
        return session
    } catch {
        return null
    }
}

export default async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Check for demo session first
    const demoSession = getDemoSessionFromCookie(request.headers.get('cookie'))

    if (demoSession) {
        // Demo user is authenticated
        const user = demoSession.user

        if (request.nextUrl.pathname.startsWith('/login')) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // Block employees from admin routes
        if (user.user_metadata?.role === 'employee') {
            const adminRoutes = ['/leads', '/finance', '/team', '/employees']
            if (adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
                return NextResponse.redirect(new URL('/my-leads', request.url))
            }
        }

        return response
    }

    // Fall back to Supabase auth
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // If no user and not on login page, redirect to login
    if (!user && !request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If user is logged in, check role and protect routes
    if (user) {
        // If on login page, redirect to dashboard
        if (request.nextUrl.pathname.startsWith('/login')) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // Get user's role from profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        // Block employees from admin routes
        if (profile?.role === 'employee') {
            const adminRoutes = ['/leads', '/finance', '/team', '/employees']
            if (adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
                return NextResponse.redirect(new URL('/my-leads', request.url))
            }
        }
    }

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
