"use client"

import * as React from "react"
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
import { UserPlus } from "lucide-react"

export function EmployeeForm() {
    const [isGeneratingPassword, setIsGeneratingPassword] = React.useState(false)
    const [generatedPassword, setGeneratedPassword] = React.useState("")

    const generatePassword = () => {
        setIsGeneratingPassword(true)
        // Generate a random password
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
        let password = ""
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setGeneratedPassword(password)
        setIsGeneratingPassword(false)
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Employee
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Add New Employee</SheetTitle>
                    <SheetDescription>
                        Create a new employee account with login credentials.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fullName" className="text-right">
                            Full Name
                        </Label>
                        <Input id="fullName" placeholder="John Doe" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input id="email" type="email" placeholder="john@company.com" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <Select defaultValue="employee">
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="employee">Employee</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Password</Label>
                        <div className="col-span-3 space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    id="password"
                                    type="text"
                                    value={generatedPassword}
                                    placeholder="Click generate to create password"
                                    readOnly
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={generatePassword}
                                    disabled={isGeneratingPassword}
                                >
                                    Generate
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Password will be sent to the employee's email
                            </p>
                        </div>
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit">Create Employee</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
