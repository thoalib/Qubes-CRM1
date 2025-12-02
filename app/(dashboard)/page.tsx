"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@supabase/ssr"

export default function DashboardPage() {
    const [metrics, setMetrics] = useState({
        totalLeads: 0,
        activeStudents: 0,
        pendingTasks: 0,
        monthlyRevenue: 0
    })
    const [loading, setLoading] = useState(true)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                // 1. Total Leads
                const { count: leadsCount } = await supabase
                    .from('leads')
                    .select('*', { count: 'exact', head: true })

                // 2. Active Students
                const { count: studentsCount } = await supabase
                    .from('students')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'active')

                // 3. Pending Tasks
                const { count: tasksCount } = await supabase
                    .from('tasks')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending')

                // 4. Monthly Revenue (Sum of income entries for current month)
                const startOfMonth = new Date()
                startOfMonth.setDate(1)
                startOfMonth.setHours(0, 0, 0, 0)

                const { data: revenueData } = await supabase
                    .from('finance_entries')
                    .select('amount')
                    .eq('type', 'income')
                    .gte('date', startOfMonth.toISOString())

                const totalRevenue = revenueData?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0

                setMetrics({
                    totalLeads: leadsCount || 0,
                    activeStudents: studentsCount || 0,
                    pendingTasks: tasksCount || 0,
                    monthlyRevenue: totalRevenue
                })
            } catch (error) {
                console.error('Error fetching dashboard metrics:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchMetrics()
    }, [supabase])

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "..." : metrics.totalLeads}
                        </div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "..." : metrics.activeStudents}
                        </div>
                        <p className="text-xs text-muted-foreground">Currently enrolled</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "..." : metrics.pendingTasks}
                        </div>
                        <p className="text-xs text-muted-foreground">To do</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "..." : `₹${metrics.monthlyRevenue.toLocaleString()}`}
                        </div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
