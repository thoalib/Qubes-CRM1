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
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Plus, Loader2 } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    type: z.enum(["academy", "agency"]),
    source: z.string().optional(),
    assigned_to: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface LeadFormProps {
    lead?: any
    trigger?: React.ReactNode
    onSuccess?: () => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function LeadForm({ lead, trigger, onSuccess, open: controlledOpen, onOpenChange }: LeadFormProps) {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [employees, setEmployees] = React.useState<any[]>([])
    const { toast } = useToast()

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = onOpenChange || setInternalOpen

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: lead?.name || "",
            email: lead?.email || "",
            phone: lead?.phone || "",
            type: lead?.type || "academy",
            source: lead?.source || "",
            assigned_to: lead?.assigned_to || "",
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

    React.useEffect(() => {
        if (open) {
            form.reset({
                name: lead?.name || "",
                email: lead?.email || "",
                phone: lead?.phone || "",
                type: lead?.type || "academy",
                source: lead?.source || "",
                assigned_to: lead?.assigned_to || "",
            })
        }
    }, [lead, open, form])

    const onSubmit = async (values: FormValues) => {
        setLoading(true)
        console.log('[LeadForm] Submitting values:', values)

        try {
            if (lead?.id) {
                console.log('[LeadForm] Updating lead:', lead.id)
                const { data, error } = await supabase
                    .from('leads')
                    .update({
                        name: values.name,
                        email: values.email,
                        phone: values.phone || null,
                        type: values.type,
                        source: values.source || null,
                        assigned_to: values.assigned_to || null,
                    })
                    .eq('id', lead.id)
                    .select()

                console.log('[LeadForm] Update result:', { data, error })
                if (error) throw error
                toast({ title: "Success", description: "Lead updated successfully" })
            } else {
                console.log('[LeadForm] Creating new lead')
                const insertData = {
                    name: values.name,
                    email: values.email,
                    phone: values.phone || null,
                    type: values.type,
                    source: values.source || null,
                    assigned_to: values.assigned_to || null,
                    stage: 'new',
                    interest_level: 'warm',
                }
                console.log('[LeadForm] Insert data:', insertData)

                const { data, error } = await supabase
                    .from('leads')
                    .insert(insertData)
                    .select()

                console.log('[LeadForm] Insert result:', { data, error })
                if (error) throw error
                toast({ title: "Success", description: "Lead created successfully" })
            }

            setOpen(false)
            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error('[LeadForm] Error saving lead:', error)
            toast({
                title: "Error",
                description: error.message || "Failed to save lead",
                variant: "destructive"
            })
        } finally {
            console.log('[LeadForm] Setting loading to false')
            setLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Lead
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{lead ? "Edit Lead" : "Add New Lead"}</SheetTitle>
                    <SheetDescription>
                        {lead ? "Update lead details below." : "Create a new lead in the system."}
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" {...form.register("name")} />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...form.register("email")} />
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" {...form.register("phone")} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            onValueChange={(val) => form.setValue("type", val as any)}
                            defaultValue={form.getValues("type")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="academy">Academy</SelectItem>
                                <SelectItem value="agency">Agency</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="source">Source</Label>
                        <Input id="source" placeholder="Website, Referral..." {...form.register("source")} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="assigned_to">Assign To (Optional)</Label>
                        <Select
                            onValueChange={(val) => form.setValue("assigned_to", val)}
                            defaultValue={form.getValues("assigned_to")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.full_name || "Unknown"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <SheetFooter className="mt-4">
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {lead ? "Update Lead" : "Create Lead"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
