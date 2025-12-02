"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns, Employee } from "@/components/features/employees/columns"
import { EmployeeForm } from "@/components/features/employees/employee-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@supabase/ssr"

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error) throw error

                const mappedEmployees: Employee[] = (data || []).map(p => ({
                    id: p.id,
                    fullName: p.full_name || "Unknown",
                    email: "Hidden", // Email is in auth.users, not accessible directly here
                    role: p.role as "admin" | "employee",
                    isActive: p.is_active,
                    createdAt: p.created_at,
                }))

                setEmployees(mappedEmployees)
            } catch (error) {
                console.error('Error fetching employees:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchEmployees()
    }, [supabase])

    if (loading) {
        return <div className="p-8 text-center">Loading employees...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
                <EmployeeForm />
            </div>
            <div className="grid gap-4 md:grid-cols-3 mb-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{employees.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {employees.filter(e => e.isActive).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admins</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {employees.filter(e => e.role === "admin").length}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <DataTable columns={columns} data={employees} />
        </div>
    )
}
