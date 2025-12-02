"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

type UserRole = "admin" | "employee"

interface AuthContextType {
    user: any
    role: UserRole | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    signOut: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null)
    const [role, setRole] = useState<UserRole | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const getUser = async () => {
            try {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    setUser(user)

                    // Get user's role from profiles table
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single()

                    if (profile) {
                        setRole(profile.role as UserRole)
                    }
                }
            } catch (error) {
                console.error('Error fetching user:', error)
            } finally {
                setLoading(false)
            }
        }

        getUser()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    setUser(session.user)

                    // Get role
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single()

                    if (profile) {
                        setRole(profile.role as UserRole)
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUser(null)
                    setRole(null)
                    router.push('/login')
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase, router])

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
