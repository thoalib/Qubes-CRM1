"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns, Customer } from "@/components/features/customers/columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createBrowserClient } from "@supabase/ssr"

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const { data, error } = await supabase
                    .from('customers')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error) throw error

                // Map Supabase data to Customer type if needed, 
                // but assuming the schema matches the type for now or close enough
                // We might need to map snake_case to camelCase if the type expects camelCase
                // The type definition in columns.tsx likely expects camelCase based on previous mock data

                const mappedCustomers: Customer[] = (data || []).map(c => ({
                    id: c.id,
                    email: c.email,
                    fullName: c.full_name,
                    phone: c.phone,
                    firstSource: c.first_source,
                    workshopsAttended: c.workshops_attended,
                    quizzesCompleted: c.quizzes_completed,
                    totalSpent: c.total_spent,
                    isActiveLead: c.is_active_lead,
                    isStudent: c.is_student,
                    currentLeadType: c.current_lead_type,
                    lastActivityDate: c.last_activity_date,
                }))

                setCustomers(mappedCustomers)
            } catch (error) {
                console.error('Error fetching customers:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCustomers()
    }, [supabase])

    const totalCustomers = customers.length
    const activeLeads = customers.filter(c => c.isActiveLead).length
    const students = customers.filter(c => c.isStudent).length
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0)

    const allCustomers = customers
    const leadCustomers = customers.filter(c => c.isActiveLead)
    const studentCustomers = customers.filter(c => c.isStudent)
    const prospectCustomers = customers.filter(c => !c.isActiveLead && !c.isStudent)

    if (loading) {
        return <div className="p-8 text-center">Loading customers...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Customer Database</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCustomers}</div>
                        <p className="text-xs text-muted-foreground">All interactions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeLeads}</div>
                        <p className="text-xs text-muted-foreground">In pipeline</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{students}</div>
                        <p className="text-xs text-muted-foreground">Enrolled</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Lifetime value</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">All Customers ({allCustomers.length})</TabsTrigger>
                    <TabsTrigger value="leads">Active Leads ({leadCustomers.length})</TabsTrigger>
                    <TabsTrigger value="students">Students ({studentCustomers.length})</TabsTrigger>
                    <TabsTrigger value="webinar">Webinar Registrants ({customers.filter(c => c.firstSource === 'workshop').length})</TabsTrigger>
                    <TabsTrigger value="prospects">Prospects ({prospectCustomers.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4">
                    <DataTable columns={columns} data={allCustomers} />
                </TabsContent>
                <TabsContent value="leads" className="space-y-4">
                    <DataTable columns={columns} data={leadCustomers} />
                </TabsContent>
                <TabsContent value="students" className="space-y-4">
                    <DataTable columns={columns} data={studentCustomers} />
                </TabsContent>
                <TabsContent value="webinar" className="space-y-4">
                    <DataTable columns={columns} data={customers.filter(c => c.firstSource === 'workshop')} />
                </TabsContent>
                <TabsContent value="prospects" className="space-y-4">
                    <DataTable columns={columns} data={prospectCustomers} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
