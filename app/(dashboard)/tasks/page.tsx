"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { getColumns, Task } from "@/components/features/tasks/columns"
import { TaskForm } from "@/components/features/tasks/task-form"
import { createBrowserClient } from "@supabase/ssr"
import { useToast } from "@/hooks/use-toast"

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const { toast } = useToast()

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const fetchTasks = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select(`
                    *,
                    assignee:profiles!assigned_to(full_name)
                `)
                .order('due_date', { ascending: true })

            if (error) throw error

            const mappedTasks: Task[] = (data || []).map(t => ({
                id: t.id,
                title: t.title,
                description: t.description,
                status: t.status,
                priority: t.priority,
                assignedTo: t.assignee?.full_name || "Unassigned",
                assigned_to: t.assigned_to, // Keep original ID for editing
                due_date: t.due_date, // Keep original date format for editing
                dueDate: t.due_date,
            }))

            setTasks(mappedTasks)
        } catch (error) {
            console.error('Error fetching tasks:', error)
            toast({ title: "Error", description: "Failed to fetch tasks", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [supabase])

    const handleEdit = (task: Task) => {
        setEditingTask(task)
        setIsFormOpen(true)
    }

    const handleDelete = async (task: Task) => {
        if (!confirm("Are you sure you want to delete this task?")) return

        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', task.id)

            if (error) throw error

            toast({ title: "Success", description: "Task deleted" })
            fetchTasks()
        } catch (error) {
            console.error('Error deleting task:', error)
            toast({ title: "Error", description: "Failed to delete task", variant: "destructive" })
        }
    }

    const columns = getColumns({
        onEdit: handleEdit,
        onDelete: handleDelete
    })

    if (loading) {
        return <div className="p-8 text-center">Loading tasks...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
                <TaskForm onSuccess={fetchTasks} />
            </div>
            <DataTable columns={columns} data={tasks} />

            {/* Edit Task Form - Controlled */}
            <TaskForm
                task={editingTask}
                open={isFormOpen}
                onOpenChange={(open) => {
                    setIsFormOpen(open)
                    if (!open) {
                        setEditingTask(undefined)
                    }
                }}
                onSuccess={() => {
                    setIsFormOpen(false)
                    setEditingTask(undefined)
                    fetchTasks()
                }}
            />
        </div>
    )
}
