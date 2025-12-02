"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns, Lead } from "@/components/features/leads/columns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadForm } from "@/components/features/leads/lead-form"
import { createBrowserClient } from "@supabase/ssr"

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const { data, error } = await supabase
                    .from('leads')
                    .select(`
                        *,
                        assignee:profiles!assigned_to(full_name)
                    `)
                    .order('created_at', { ascending: false })

                if (error) throw error

                const mappedLeads: Lead[] = (data || []).map(l => ({
                    id: l.id,
                    name: l.contact_details?.name || "Unknown",
                    email: l.contact_details?.email || "Unknown",
                    status: l.stage,
                    source: l.source || "Unknown",
                    assignedTo: l.assignee?.full_name || "Unassigned",
                    lastContact: l.last_contacted_at || l.created_at,
                    type: l.type
                }))

                setLeads(mappedLeads)
            } catch (error) {
                console.error('Error fetching leads:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchLeads()
    }, [supabase])

    const academyLeads = leads.filter(l => l.type === 'academy')
    const agencyLeads = leads.filter(l => l.type === 'agency')

    if (loading) {
        return <div className="p-8 text-center">Loading leads...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
                <LeadForm />
            </div>
            <Tabs defaultValue="academy" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="academy">Academy ({academyLeads.length})</TabsTrigger>
                    <TabsTrigger value="agency">Agency ({agencyLeads.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="academy" className="space-y-4">
                    <DataTable columns={columns} data={academyLeads} />
                </TabsContent>
                <TabsContent value="agency" className="space-y-4">
                    <DataTable columns={columns} data={agencyLeads} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
