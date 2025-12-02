"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "./supabase"
import { getDemoSession, demoSignOut } from "./demo-auth"

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

    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            try {
                // Check for demo session first
                const demoSession = getDemoSession()
                if (demoSession?.user) {
                    setUser(demoSession.user)
                    const userRole = demoSession.user.user_metadata?.role || 'employee'
                    setRole(userRole as UserRole)
                    setLoading(false)
                    return
                }

                // Fall back to Supabase (when real credentials are set up)
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
    }, [])

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
    try {
        const context = useContext(AuthContext)
        if (!context) {
            return {
                user: null,
                role: null,
                loading: true,
                signOut: async () => { },
            }
        }
        return context
    } catch {
        return {
            user: null,
            role: null,
            loading: true,
            signOut: async () => { },
        }
    }
}
