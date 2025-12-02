"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Calendar, MapPin, GraduationCap, DollarSign } from "lucide-react"
import Link from "next/link"
import { CallLogForm } from "@/components/features/calls/call-log-form"

export default function LeadDetailPage({ params }: { params: { id: string } }) {
    // Mock data - will be replaced with Supabase query
    const lead = {
        id: params.id,
        name: "John Doe",
        email: "john@example.com",
        phone: "+91 98765 43210",
        type: "academy",
        stage: "follow_up",
        source: "Workshop",
        interestLevel: "hot",
        place: "Mumbai",
        currentEducation: "B.Tech Final Year",
        budgetRange: "25k-50k",
        decisionTimeline: "This month",
        assignedTo: "Alice Smith",
        createdAt: "2023-11-10T10:00:00Z",
        lastContactedAt: "2023-11-20T14:30:00Z",
        nextFollowUpDate: "2023-11-25T10:00:00Z",
        totalCalls: 3,
    }

    // Pipeline stages
    const stages = [
        { id: "new", label: "New", color: "bg-gray-500" },
        { id: "contacted", label: "Contacted", color: "bg-blue-500" },
        { id: "follow_up", label: "Follow-up", color: "bg-yellow-500" },
        { id: "demo", label: "Demo", color: "bg-purple-500" },
        { id: "negotiation", label: "Negotiation", color: "bg-orange-500" },
        { id: "enrolled", label: "Enrolled", color: "bg-green-500" },
        { id: "not_pursuing", label: "Not Pursuing", color: "bg-red-500" },
    ]

    const currentStageIndex = stages.findIndex(s => s.id === lead.stage)

    const handleStageChange = (newStage: string) => {
        // TODO: Update in Supabase
        console.log("Changing stage to:", newStage)
    }

    const callHistory = [
        {
            id: 1,
            date: "2023-11-20T14:30:00Z",
            outcome: "answered",
            duration: 15,
            summary: "Very interested in Web Dev course. Wants to join next batch.",
            interestLevel: "hot",
            employee: "Alice Smith",
        },
        {
            id: 2,
            date: "2023-11-15T11:00:00Z",
            outcome: "answered",
            duration: 8,
            summary: "Initial contact. Showed interest. Will think and get back.",
            interestLevel: "warm",
            employee: "Alice Smith",
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{lead.name}</h2>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {lead.email}
                        </span>
                        <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {lead.phone}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <CallLogForm leadId={lead.id} leadName={lead.name} />
                    <Button variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                    </Button>
                </div>
            </div>

            {/* Visual Pipeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Lead Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 overflow-x-auto pb-4">
                        {stages.map((stage, index) => {
                            const isActive = stage.id === lead.stage
                            const isPast = index < currentStageIndex
                            const isFuture = index > currentStageIndex

                            return (
                                <div key={stage.id} className="flex items-center">
                                    <button
                                        onClick={() => handleStageChange(stage.id)}
                                        className={`
                      px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                      ${isActive ? `${stage.color} text-white scale-105 shadow-lg` : ''}
                      ${isPast ? 'bg-gray-200 text-gray-600' : ''}
                      ${isFuture ? 'bg-gray-100 text-gray-400 hover:bg-gray-200' : ''}
                      ${!isActive && !isFuture ? 'hover:scale-105' : ''}
                    `}
                                    >
                                        {isActive && "📍 "}
                                        {stage.label}
                                        {isPast && " ✓"}
                                    </button>
                                    {index < stages.length - 1 && (
                                        <div className={`w-8 h-0.5 ${isPast ? 'bg-gray-400' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Click on any stage to update the lead status
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Lead Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lead Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Type</p>
                                <Badge className="mt-1">
                                    {lead.type === 'academy' ? 'Academy' : 'Agency'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Source</p>
                                <p className="font-medium">{lead.source}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Interest Level</p>
                                <Badge className={
                                    lead.interestLevel === 'hot' ? 'bg-red-500' :
                                        lead.interestLevel === 'warm' ? 'bg-orange-500' :
                                            'bg-blue-500'
                                }>
                                    {lead.interestLevel === 'hot' ? '🔥' : lead.interestLevel === 'warm' ? '🟡' : '🔵'} {lead.interestLevel}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Assigned To</p>
                                <p className="font-medium">{lead.assignedTo}</p>
                            </div>
                            {lead.place && (
                                <div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> Place
                                    </p>
                                    <p className="font-medium">{lead.place}</p>
                                </div>
                            )}
                            {lead.currentEducation && (
                                <div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <GraduationCap className="h-3 w-3" /> Currently Studying
                                    </p>
                                    <p className="font-medium">{lead.currentEducation}</p>
                                </div>
                            )}
                            {lead.budgetRange && (
                                <div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" /> Budget Range
                                    </p>
                                    <p className="font-medium">₹{lead.budgetRange}</p>
                                </div>
                            )}
                            {lead.decisionTimeline && (
                                <div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Decision Timeline
                                    </p>
                                    <p className="font-medium">{lead.decisionTimeline}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Call History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Call History ({callHistory.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {callHistory.map((call) => (
                                    <div key={call.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {call.outcome === 'answered' ? '✅' : '📵'} {call.outcome}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {call.duration} mins
                                                </span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(call.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm mb-2">{call.summary}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>By: {call.employee}</span>
                                            <span>•</span>
                                            <Badge className={
                                                call.interestLevel === 'hot' ? 'bg-red-500 text-xs' : 'bg-orange-500 text-xs'
                                            }>
                                                {call.interestLevel}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Quick Stats */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Calls</p>
                                <p className="text-2xl font-bold">{lead.totalCalls}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Last Contacted</p>
                                <p className="font-medium">
                                    {new Date(lead.lastContactedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Next Follow-up</p>
                                <p className="font-medium text-orange-600">
                                    {new Date(lead.nextFollowUpDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Created</p>
                                <p className="font-medium">
                                    {new Date(lead.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
