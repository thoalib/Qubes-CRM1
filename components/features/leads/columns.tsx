"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Lead = {
    id: string
    name: string
    email: string
    status: "new" | "contacted" | "qualified" | "proposal" | "closed"
    source: string
    assignedTo: string
    lastContact: string
    type?: string
}

export const columns: ColumnDef<Lead>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return <div className="capitalize">{status}</div>
        },
    },
    {
        accessorKey: "source",
        header: "Source",
    },
    {
        accessorKey: "assignedTo",
        header: "Assigned To",
    },
    {
        accessorKey: "lastContact",
        header: "Last Contact",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const lead = row.original

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
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(lead.id)}
                        >
                            Copy Lead ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit lead</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
