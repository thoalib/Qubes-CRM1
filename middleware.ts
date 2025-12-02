import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

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
            // We can't easily check role here without a DB query, so we'll just redirect to root
            // The client-side auth context will handle the specific dashboard redirect
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
            // Check if current path starts with any admin route
            // Note: /leads is for admins, /my-leads is for employees
            // We need to be careful not to block /leads/[id] if employees need access to it, 
            // but based on our design, employees use /my-leads and likely a different detail view or the same one.
            // If /leads/[id] is shared, we shouldn't block /leads entirely if it matches /leads/[id].
            // However, the requirement was "Leads" (all leads) is admin only.
            // Employees access leads via "My Leads" page.

            if (adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
                // Allow access to specific lead details if they are assigned? 
                // For now, let's strictly enforce the admin routes as defined in sidebar.
                // If an employee tries to access /leads, redirect to /my-leads
                return NextResponse.redirect(new URL('/my-leads', request.url))
            }
        }
    }

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
