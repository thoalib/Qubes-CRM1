"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp, Phone, Target, Award } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

export default function TeamDashboardPage() {
    const [stats, setStats] = useState({
        totalCalls: 0,
        conversions: 0,
        conversionRate: 0,
        avgCallDuration: 0,
        followUpRate: 0,
        totalRevenue: 0
    })
    const [topPerformers, setTopPerformers] = useState<any[]>([])
    const [callOutcomes, setCallOutcomes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                // 1. Fetch Call Logs for stats
                const { data: calls } = await supabase
                    .from('call_logs')
                    .select('*')

                const totalCalls = calls?.length || 0
                const avgDuration = totalCalls > 0
                    ? Math.round(calls!.reduce((sum, c) => sum + (c.call_duration || 0), 0) / totalCalls)
                    : 0

                // 2. Fetch Leads for conversions
                const { data: leads } = await supabase
                    .from('leads')
                    .select('*')

                const conversions = leads?.filter(l => l.stage === 'enrolled' || l.stage === 'won').length || 0
                const conversionRate = totalCalls > 0 ? ((conversions / totalCalls) * 100).toFixed(1) : 0

                // 3. Fetch Revenue
                const { data: revenue } = await supabase
                    .from('finance_entries')
                    .select('amount')
                    .eq('type', 'income')

                const totalRevenue = revenue?.reduce((sum, r) => sum + Number(r.amount), 0) || 0

                setStats({
                    totalCalls,
                    conversions,
                    conversionRate: Number(conversionRate),
                    avgCallDuration: avgDuration,
                    followUpRate: 85, // Mock for now as it requires complex logic
                    totalRevenue
                })

                // 4. Calculate Call Outcomes
                const outcomeCounts: Record<string, number> = {}
                calls?.forEach(c => {
                    const outcome = c.call_outcome || 'Unknown'
                    outcomeCounts[outcome] = (outcomeCounts[outcome] || 0) + 1
                })

                const outcomes = Object.entries(outcomeCounts).map(([outcome, count]) => ({
                    outcome: outcome.charAt(0).toUpperCase() + outcome.slice(1),
                    count,
                    percentage: totalCalls > 0 ? Math.round((count / totalCalls) * 100) : 0
                })).sort((a, b) => b.count - a.count)

                setCallOutcomes(outcomes)

                // 5. Top Performers (Mocked logic for now as we need to join multiple tables)
                // In a real scenario, we'd aggregate calls and revenue by employee_id
                setTopPerformers([])

            } catch (error) {
                console.error('Error fetching team data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTeamData()
    }, [supabase])

    if (loading) {
        return <div className="p-8 text-center">Loading team analytics...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Team Dashboard</h2>
            </div>

            {/* Team Performance Metrics */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                        <Phone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCalls}</div>
                        <p className="text-xs text-muted-foreground">
                            All time
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.conversions}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.conversionRate}% conversion rate
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Call Duration</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgCallDuration} min</div>
                        <p className="text-xs text-muted-foreground">Average</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Follow-up Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.followUpRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Target: 90%
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{(stats.totalRevenue / 1000).toFixed(1)}k</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
            </div>

            {/* Leaderboard */}
            <Card>
                <CardHeader>
                    <CardTitle>🏆 Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-4 text-muted-foreground">
                        Leaderboard data requires more call history.
                    </div>
                </CardContent>
            </Card>

            {/* Analytics Tabs */}
            <Tabs defaultValue="outcomes" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="outcomes">Call Outcomes</TabsTrigger>
                </TabsList>

                <TabsContent value="outcomes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Call Outcomes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {callOutcomes.map((item) => (
                                    <div key={item.outcome} className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">{item.outcome}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {item.count} ({item.percentage}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {callOutcomes.length === 0 && (
                                    <div className="text-center text-muted-foreground">No calls logged yet</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
