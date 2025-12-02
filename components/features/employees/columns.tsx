"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
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

export type Employee = {
    id: string
    fullName: string
    email: string
    role: "admin" | "employee"
    isActive: boolean
    createdAt: string
}

export const columns: ColumnDef<Employee>[] = [
    {
        accessorKey: "fullName",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string
            return (
                <Badge variant={role === "admin" ? "default" : "outline"}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
            )
        },
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("isActive") as boolean
            return (
                <Badge variant={isActive ? "default" : "destructive"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Joined",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const employee = row.original

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
                            onClick={() => navigator.clipboard.writeText(employee.id)}
                        >
                            Copy Employee ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit employee</DropdownMenuItem>
                        <DropdownMenuItem>Reset password</DropdownMenuItem>
                        <DropdownMenuItem>
                            {employee.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
