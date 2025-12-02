"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().optional(),
    priority: z.enum(["standard", "important", "critical"]),
    assigned_to: z.string().min(1, "Please select an assignee"),
    due_date: z.string().min(1, "Due date is required"),
})

type FormValues = z.infer<typeof formSchema>

interface TaskFormProps {
    task?: any // If provided, we are in Edit mode
    trigger?: React.ReactNode
    onSuccess?: () => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function TaskForm({ task, trigger, onSuccess, open: controlledOpen, onOpenChange }: TaskFormProps) {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [employees, setEmployees] = React.useState<any[]>([])
    const { toast } = useToast()

    // Use controlled open state if provided, otherwise use internal state
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = onOpenChange || setInternalOpen

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: task?.title || "",
            description: task?.description || "",
            priority: task?.priority || "standard",
            assigned_to: task?.assigned_to || "",
            due_date: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "",
        },
    })

    React.useEffect(() => {
        const fetchEmployees = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('role', 'employee')

            if (data) setEmployees(data)
        }
        fetchEmployees()
    }, [supabase])

    // Reset form when task prop changes or dialog opens
    React.useEffect(() => {
        if (open) {
            form.reset({
                title: task?.title || "",
                description: task?.description || "",
                priority: task?.priority || "standard",
                assigned_to: task?.assigned_to || "",
                due_date: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "",
            })
        }
    }, [task, open, form])

    const onSubmit = async (values: FormValues) => {
        setLoading(true)
        try {
            if (task?.id) {
                // Update existing task
                const { error } = await supabase
                    .from('tasks')
                    .update({
                        title: values.title,
                        description: values.description,
                        priority: values.priority,
                        assigned_to: values.assigned_to,
                        due_date: values.due_date,
                    })
                    .eq('id', task.id)

                if (error) throw error
                toast({ title: "Success", description: "Task updated successfully" })
            } else {
                // Create new task
                const { error } = await supabase
                    .from('tasks')
                    .insert({
                        title: values.title,
                        description: values.description,
                        priority: values.priority,
                        assigned_to: values.assigned_to,
                        due_date: values.due_date,
                        status: 'pending'
                    })

                if (error) throw error
                toast({ title: "Success", description: "Task created successfully" })
            }

            setOpen(false)
            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error('Error saving task:', error)
            toast({
                title: "Error",
                description: error.message || "Failed to save task",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Task
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{task ? "Edit Task" : "Add New Task"}</SheetTitle>
                    <SheetDescription>
                        {task ? "Update task details below." : "Create a new task and assign it to a team member."}
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" {...form.register("title")} />
                        {form.formState.errors.title && (
                            <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...form.register("description")} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                            onValueChange={(val) => form.setValue("priority", val as any)}
                            defaultValue={form.getValues("priority")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="important">Important</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="assigned_to">Assign To</Label>
                        <Select
                            onValueChange={(val) => form.setValue("assigned_to", val)}
                            defaultValue={form.getValues("assigned_to")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.full_name || "Unknown"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.assigned_to && (
                            <p className="text-sm text-red-500">{form.formState.errors.assigned_to.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input id="due_date" type="date" {...form.register("due_date")} />
                        {form.formState.errors.due_date && (
                            <p className="text-sm text-red-500">{form.formState.errors.due_date.message}</p>
                        )}
                    </div>

                    <SheetFooter className="mt-4">
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {task ? "Update Task" : "Create Task"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
