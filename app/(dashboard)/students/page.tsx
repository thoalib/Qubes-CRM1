"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@supabase/ssr"

type Student = {
    id: string
    name: string
    email: string
    course: string
    batch: string
    status: "active" | "on_hold" | "completed" | "withdrawn"
    feePaid: number
    feeTotal: number
}

const columns: ColumnDef<Student>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "course",
        header: "Course",
    },
    {
        accessorKey: "batch",
        header: "Batch",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return <Badge variant="outline">{status}</Badge>
        },
    },
    {
        accessorKey: "feePaid",
        header: "Fee Paid",
        cell: ({ row }) => {
            const paid = row.getValue("feePaid") as number
            const total = row.original.feeTotal
            return <span>${paid} / ${total}</span>
        },
    },
]

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Fetch students and join with customers to get name/email
                const { data, error } = await supabase
                    .from('students')
                    .select(`
                        *,
                        customer:customers(full_name, email)
                    `)
                    .order('created_at', { ascending: false })

                if (error) throw error

                const mappedStudents: Student[] = (data || []).map(s => ({
                    id: s.id,
                    name: s.customer?.full_name || "Unknown",
                    email: s.customer?.email || "Unknown",
                    course: s.course,
                    batch: s.batch,
                    status: s.status,
                    feePaid: s.fee_paid || 0,
                    feeTotal: s.fee_total || 0,
                }))

                setStudents(mappedStudents)
            } catch (error) {
                console.error('Error fetching students:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStudents()
    }, [supabase])

    if (loading) {
        return <div className="p-8 text-center">Loading students...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Students</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3 mb-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{students.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {students.filter(s => s.status === "active").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${students.reduce((sum, s) => sum + s.feePaid, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <DataTable columns={columns} data={students} />
        </div>
    )
}
