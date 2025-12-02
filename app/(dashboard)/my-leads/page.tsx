"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { createBrowserClient } from "@supabase/ssr"

type MyLead = {
    id: string
    name: string
    email: string
    phone: string
    type: "academy" | "agency"
    stage: string
    interestLevel: "hot" | "warm" | "cold" | "not_interested"
    nextFollowUpDate: string
    lastContactedAt: string
    totalCalls: number
}

const myLeadsColumns: ColumnDef<MyLead>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            const lead = row.original
            return (
                <Link href={`/leads/${lead.id}`} className="hover:underline font-medium">
                    {lead.name}
                </Link>
            )
        },
    },
    {
        accessorKey: "phone",
        header: "Phone",
    },
    {
        accessorKey: "interestLevel",
        header: "Interest",
        cell: ({ row }) => {
            const level = row.getValue("interestLevel") as string
            const colors = {
                hot: "bg-red-500",
                warm: "bg-orange-500",
                cold: "bg-blue-500",
                not_interested: "bg-gray-500",
            }
            const icons = {
                hot: "🔥",
                warm: "🟡",
                cold: "🔵",
                not_interested: "❌",
            }
            return (
                <Badge className={colors[level as keyof typeof colors] || "bg-gray-500"}>
                    {icons[level as keyof typeof icons] || ""} {level?.replace('_', ' ') || "Unknown"}
                </Badge>
            )
        },
    },
    {
        accessorKey: "nextFollowUpDate",
        header: "Follow-up",
        cell: ({ row }) => {
            const dateStr = row.getValue("nextFollowUpDate") as string
            if (!dateStr) return <span className="text-sm text-gray-400">Not scheduled</span>

            const date = new Date(dateStr)
            const today = new Date()
            const isOverdue = date < today
            const isToday = date.toDateString() === today.toDateString()

            return (
                <div className="flex items-center gap-2">
                    {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                    {isToday && <Badge className="bg-orange-500">Today</Badge>}
                    {!isOverdue && !isToday && (
                        <span className="text-sm">{date.toLocaleDateString()}</span>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "totalCalls",
        header: "Calls",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const lead = row.original
            return (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-1" />
                        Log Call
                    </Button>
                </div>
            )
        },
    },
]

export default function MyLeadsPage() {
    const [myLeads, setMyLeads] = useState<MyLead[]>([])
    const [loading, setLoading] = useState(true)
    const [callsToday, setCallsToday] = useState(0)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    // Fetch leads assigned to current user
                    // Note: In a real app, RLS would handle the filtering, 
                    // but we can also filter explicitly for clarity
                    const { data, error } = await supabase
                        .from('leads')
                        .select('*')
                        .eq('assigned_to', user.id)
                        .order('next_follow_up_date', { ascending: true })

                    if (error) throw error

                    const mappedLeads: MyLead[] = (data || []).map(l => ({
                        id: l.id,
                        name: l.name || "Unknown",
                        email: l.email || "",
                        phone: l.phone || "",
                        type: l.type as "academy" | "agency",
                        stage: l.stage,
                        interestLevel: l.interest_level as "hot" | "warm" | "cold" | "not_interested",
                        nextFollowUpDate: l.next_follow_up_date,
                        lastContactedAt: l.last_contacted_at,
                        totalCalls: l.total_calls_made || 0,
                    }))

                    setMyLeads(mappedLeads)

                    // Fetch calls made today
                    const startOfDay = new Date()
                    startOfDay.setHours(0, 0, 0, 0)

                    const { count } = await supabase
                        .from('call_logs')
                        .select('*', { count: 'exact', head: true })
                        .eq('employee_id', user.id)
                        .gte('call_date', startOfDay.toISOString())

                    setCallsToday(count || 0)
                }
            } catch (error) {
                console.error('Error fetching leads:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchLeads()
    }, [supabase])

    const today = new Date()
    const overdueLeads = myLeads.filter(l => l.nextFollowUpDate && new Date(l.nextFollowUpDate) < today && new Date(l.nextFollowUpDate).toDateString() !== today.toDateString())
    const todayLeads = myLeads.filter(l => l.nextFollowUpDate && new Date(l.nextFollowUpDate).toDateString() === today.toDateString())
    const upcomingLeads = myLeads.filter(l => {
        if (!l.nextFollowUpDate) return false
        const followUpDate = new Date(l.nextFollowUpDate)
        const threeDaysFromNow = new Date()
        threeDaysFromNow.setDate(today.getDate() + 3)
        return followUpDate > today && followUpDate <= threeDaysFromNow
    })
    const hotLeads = myLeads.filter(l => l.interestLevel === 'hot')

    if (loading) {
        return <div className="p-8 text-center">Loading your leads...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">My Leads</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myLeads.length}</div>
                        <p className="text-xs text-muted-foreground">Total assigned</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{callsToday}</div>
                        <p className="text-xs text-muted-foreground">Keep it up!</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Follow-ups Due</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{overdueLeads.length + todayLeads.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {overdueLeads.length} overdue, {todayLeads.length} today
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">🔥 {hotLeads.length}</div>
                        <p className="text-xs text-muted-foreground">Priority calls</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="followups" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="followups">
                        Follow-ups Due ({overdueLeads.length + todayLeads.length + upcomingLeads.length})
                    </TabsTrigger>
                    <TabsTrigger value="hot">
                        Hot Leads ({hotLeads.length})
                    </TabsTrigger>
                    <TabsTrigger value="all">
                        All My Leads ({myLeads.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="followups" className="space-y-4">
                    {overdueLeads.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-red-600">🚨 Overdue ({overdueLeads.length})</h3>
                            <DataTable columns={myLeadsColumns} data={overdueLeads} />
                        </div>
                    )}
                    {todayLeads.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-orange-600">📅 Today ({todayLeads.length})</h3>
                            <DataTable columns={myLeadsColumns} data={todayLeads} />
                        </div>
                    )}
                    {upcomingLeads.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">📆 Upcoming (Next 3 days)</h3>
                            <DataTable columns={myLeadsColumns} data={upcomingLeads} />
                        </div>
                    )}
                    {overdueLeads.length === 0 && todayLeads.length === 0 && upcomingLeads.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                            No follow-ups due soon. Good job!
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="hot" className="space-y-4">
                    <DataTable columns={myLeadsColumns} data={hotLeads} />
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                    <DataTable columns={myLeadsColumns} data={myLeads} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
