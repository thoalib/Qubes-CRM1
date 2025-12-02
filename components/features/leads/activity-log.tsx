"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ActivityLogProps {
    leadId: string
}

const activities = [
    {
        id: 1,
        user: "Alice Smith",
        action: "changed stage to",
        target: "Contacted",
        timestamp: "2 hours ago",
        initials: "AS",
    },
    {
        id: 2,
        user: "Alice Smith",
        action: "created lead",
        target: "",
        timestamp: "1 day ago",
        initials: "AS",
    },
]

export function ActivityLog({ leadId }: ActivityLogProps) {
    return (
        <div className="space-y-8">
            {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="/avatars/01.png" alt="Avatar" />
                        <AvatarFallback>{activity.initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                            {activity.user} <span className="text-muted-foreground font-normal">{activity.action}</span> {activity.target}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
