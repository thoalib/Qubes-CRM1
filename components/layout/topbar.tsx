"use client"

import { Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Topbar() {
    return (
        <div className="border-b p-4 flex items-center justify-between bg-background">
            <div className="flex items-center gap-4 w-full max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-8" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                </Button>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">JD</span>
                </div>
            </div>
        </div>
    )
}
