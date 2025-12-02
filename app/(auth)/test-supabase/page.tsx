"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"

export default function TestSupabasePage() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const test = async () => {
            try {
                setLoading(true)
                const supabase = createClient()

                // Test 1: Check if client is initialized
                console.log("Supabase client created")

                // Test 2: Get current session
                const { data: { session } } = await supabase.auth.getSession()
                console.log("Current session:", session)

                // Test 3: Try to list users (this will fail with anon key, which is expected)
                const { data: users, error: usersError } = await supabase
                    .from('profiles')
                    .select('*')
                    .limit(5)

                setResult({
                    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
                    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                    currentSession: session,
                    profilesData: users,
                    profilesError: usersError?.message,
                })
                setError(null)
            } catch (err: any) {
                setError(err.message)
                setResult(null)
            } finally {
                setLoading(false)
            }
        }

        test()
    }, [])

    return (
        <div className="min-h-screen p-8 bg-white">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Supabase Configuration Test</h1>

                {loading && <p className="text-gray-600">Testing connection...</p>}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
                        Error: {error}
                    </div>
                )}

                {result && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded">
                            <h2 className="font-bold mb-2">Configuration</h2>
                            <pre className="text-sm overflow-auto">
                                {JSON.stringify(
                                    {
                                        supabaseUrl: result.supabaseUrl,
                                        hasAnonKey: result.hasAnonKey,
                                    },
                                    null,
                                    2
                                )}
                            </pre>
                        </div>

                        <div className="bg-gray-50 p-4 rounded">
                            <h2 className="font-bold mb-2">Current Session</h2>
                            <pre className="text-sm overflow-auto">
                                {JSON.stringify(result.currentSession, null, 2)}
                            </pre>
                        </div>

                        <div className="bg-gray-50 p-4 rounded">
                            <h2 className="font-bold mb-2">Profiles Query</h2>
                            <pre className="text-sm overflow-auto">
                                {result.profilesError ? (
                                    `Error: ${result.profilesError}`
                                ) : (
                                    JSON.stringify(result.profilesData, null, 2)
                                )}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
