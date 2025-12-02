"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@supabase/ssr"

type FinanceEntry = {
    id: string
    type: "income" | "expense"
    amount: number
    category: string
    date: string
    description: string
}

const columns: ColumnDef<FinanceEntry>[] = [
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
            return new Date(row.getValue("date")).toLocaleDateString()
        }
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            return (
                <Badge variant={type === "income" ? "default" : "destructive"}>
                    {type}
                </Badge>
            )
        },
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = row.getValue("amount") as number
            const type = row.original.type
            return (
                <span className={type === "income" ? "text-green-600" : "text-red-600"}>
                    {type === "income" ? "+" : "-"}${amount}
                </span>
            )
        },
    },
]

export default function FinancePage() {
    const [entries, setEntries] = useState<FinanceEntry[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const fetchFinance = async () => {
            try {
                const { data, error } = await supabase
                    .from('finance_entries')
                    .select('*')
                    .order('date', { ascending: false })

                if (error) throw error

                const mappedEntries: FinanceEntry[] = (data || []).map(e => ({
                    id: e.id,
                    type: e.type as "income" | "expense",
                    amount: Number(e.amount),
                    category: e.category || "Uncategorized",
                    date: e.date,
                    description: e.category || "No description", // Using category as description for now
                }))

                setEntries(mappedEntries)
            } catch (error) {
                console.error('Error fetching finance entries:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchFinance()
    }, [supabase])

    const incomeEntries = entries.filter(e => e.type === "income")
    const expenseEntries = entries.filter(e => e.type === "expense")

    const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0)
    const totalExpense = expenseEntries.reduce((sum, e) => sum + e.amount, 0)
    const netIncome = totalIncome - totalExpense

    if (loading) {
        return <div className="p-8 text-center">Loading finance data...</div>
    }

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Finance</h2>
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">${totalExpense.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${netIncome.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">All Transactions</TabsTrigger>
                    <TabsTrigger value="income">Income</TabsTrigger>
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4">
                    <DataTable columns={columns} data={entries} />
                </TabsContent>
                <TabsContent value="income" className="space-y-4">
                    <DataTable columns={columns} data={incomeEntries} />
                </TabsContent>
                <TabsContent value="expenses" className="space-y-4">
                    <DataTable columns={columns} data={expenseEntries} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
