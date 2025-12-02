"use client"

import * as React from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface LeadStatusProps {
    currentStage: string
}

export function LeadStatus({ currentStage }: LeadStatusProps) {
    return (
        <Select defaultValue={currentStage}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="new">New Lead</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="follow_up">Need Follow-up</SelectItem>
                <SelectItem value="potential">Potential Candidate</SelectItem>
                <SelectItem value="enrolled">Enrolled</SelectItem>
                <SelectItem value="not_pursuing">Not Pursuing</SelectItem>
            </SelectContent>
        </Select>
    )
}
