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

export type Task = {
    id: string
    title: string
    description: string
    status: "pending" | "in_progress" | "completed" | "blocked"
    priority: "standard" | "important" | "critical"
    assignedTo: string
    dueDate: string
}

export const getColumns = ({ onEdit, onDelete }: { onEdit: (task: Task) => void, onDelete: (task: Task) => void }): ColumnDef<Task>[] => [
    {
        accessorKey: "title",
        header: "Title",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const statusColors = {
                pending: "bg-gray-500",
                in_progress: "bg-blue-500",
                completed: "bg-green-500",
                blocked: "bg-red-500",
            }
            return (
                <Badge className={statusColors[status as keyof typeof statusColors]}>
                    {status.replace("_", " ")}
                </Badge>
            )
        },
    },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
            const priority = row.getValue("priority") as string
            const priorityColors = {
                standard: "bg-gray-200 text-gray-800",
                important: "bg-orange-200 text-orange-800",
                critical: "bg-red-200 text-red-800",
            }
            return (
                <Badge variant="outline" className={priorityColors[priority as keyof typeof priorityColors]}>
                    {priority}
                </Badge>
            )
        },
    },
    {
        accessorKey: "assignedTo",
        header: "Assigned To",
    },
    {
        accessorKey: "dueDate",
        header: "Due Date",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const task = row.original

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
                            onClick={() => navigator.clipboard.writeText(task.id)}
                        >
                            Copy Task ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                            Edit task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(task)}
                            className="text-red-600 focus:text-red-600"
                        >
                            Delete task
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
