"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export type Customer = {
    id: string
    email: string
    fullName: string
    phone: string
    firstSource: string
    workshopsAttended: number
    quizzesCompleted: number
    totalSpent: number
    isActiveLead: boolean
    isStudent: boolean
    currentLeadType: string | null
    lastActivityDate: string
}

export const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: "fullName",
        header: "Name",
        cell: ({ row }) => {
            const customer = row.original
            return (
                <Link href={`/customers/${customer.id}`} className="hover:underline font-medium">
                    {customer.fullName}
                </Link>
            )
        },
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "firstSource",
        header: "Source",
        cell: ({ row }) => {
            const source = row.getValue("firstSource") as string
            const sourceColors: Record<string, string> = {
                workshop: "bg-blue-100 text-blue-800",
                quiz: "bg-purple-100 text-purple-800",
                academy_lead: "bg-green-100 text-green-800",
                agency_lead: "bg-orange-100 text-orange-800",
                website: "bg-gray-100 text-gray-800",
            }
            return (
                <Badge variant="outline" className={sourceColors[source] || "bg-gray-100 text-gray-800"}>
                    {source?.replace('_', ' ')}
                </Badge>
            )
        },
    },
    {
        accessorKey: "workshopsAttended",
        header: "Workshops",
    },
    {
        accessorKey: "totalSpent",
        header: "Total Spent",
        cell: ({ row }) => {
            const amount = row.getValue("totalSpent") as number
            return <span>₹{amount.toLocaleString()}</span>
        },
    },
    {
        accessorKey: "isActiveLead",
        header: "Status",
        cell: ({ row }) => {
            const customer = row.original
            if (customer.isStudent) {
                return <Badge className="bg-green-500">Student</Badge>
            }
            if (customer.isActiveLead) {
                return (
                    <Badge className="bg-blue-500">
                        {customer.currentLeadType === 'academy' ? 'Academy Lead' : 'Agency Lead'}
                    </Badge>
                )
            }
            return <Badge variant="outline">Customer</Badge>
        },
    },
    {
        accessorKey: "lastActivityDate",
        header: "Last Activity",
        cell: ({ row }) => {
            const date = new Date(row.getValue("lastActivityDate"))
            return <span className="text-sm text-muted-foreground">{date.toLocaleDateString()}</span>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const customer = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/customers/${customer.id}`}>
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!customer.isActiveLead && (
                            <>
                                <DropdownMenuItem>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Convert to Academy Lead
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Convert to Agency Lead
                                </DropdownMenuItem>
                            </>
                        )}
                        {customer.isActiveLead && (
                            <DropdownMenuItem>Re-engage as Lead</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
