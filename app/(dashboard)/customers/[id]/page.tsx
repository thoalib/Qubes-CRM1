"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Mail, Phone, Calendar, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
    // Mock data - will be replaced with Supabase query
    const customer = {
        id: params.id,
        fullName: "John Doe",
        email: "john@example.com",
        phone: "+91 98765 43210",
        firstSource: "workshop",
        workshopsAttended: 3,
        quizzesCompleted: 1,
        paymentsMade: 2,
        totalSpent: 15000,
        isActiveLead: true,
        isStudent: false,
        currentLeadType: "academy",
        firstInteractionDate: "2023-09-15T10:00:00Z",
        lastActivityDate: "2023-11-15T10:00:00Z",
    }

    const activities = [
        {
            id: 1,
            type: "payment",
            title: "Payment Completed",
            description: "Paid ₹7,500 for workshop",
            amount: 7500,
            timestamp: "2023-11-15T10:00:00Z",
            icon: "💳",
        },
        {
            id: 2,
            type: "workshop_registration",
            title: "Registered for Workshop",
            description: "Advanced Web Development Workshop",
            timestamp: "2023-11-10T14:30:00Z",
            icon: "📚",
        },
        {
            id: 3,
            type: "lead_created",
            title: "Added as Academy Lead",
            description: "Lead stage: Contacted",
            timestamp: "2023-10-20T09:15:00Z",
            icon: "🎯",
        },
        {
            id: 4,
            type: "quiz_completion",
            title: "Completed Quiz",
            description: "Identified as: Tech Enthusiast",
            timestamp: "2023-10-05T16:45:00Z",
            icon: "✅",
        },
        {
            id: 5,
            type: "workshop_registration",
            title: "Registered for Workshop",
            description: "Introduction to React Workshop",
            timestamp: "2023-09-15T10:00:00Z",
            icon: "📚",
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/customers">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight">{customer.fullName}</h2>
                    <p className="text-muted-foreground">{customer.email}</p>
                </div>
                <div className="flex items-center gap-2">
                    {customer.isActiveLead && (
                        <Button variant="outline">View Lead Details</Button>
                    )}
                    {!customer.isActiveLead && !customer.isStudent && (
                        <>
                            <Button>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Convert to Academy Lead
                            </Button>
                            <Button variant="outline">
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Convert to Agency Lead
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {activities.map((activity, index) => (
                                    <div key={activity.id} className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl">
                                            {activity.icon}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">{activity.title}</p>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(activity.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                                            {activity.amount && (
                                                <p className="text-sm font-semibold text-green-600">₹{activity.amount.toLocaleString()}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{customer.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    First contact: {new Date(customer.firstInteractionDate).toLocaleDateString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {customer.isStudent && (
                                <Badge className="bg-green-500">Student</Badge>
                            )}
                            {customer.isActiveLead && (
                                <Badge className="bg-blue-500">
                                    {customer.currentLeadType === 'academy' ? 'Academy Lead' : 'Agency Lead'}
                                </Badge>
                            )}
                            {!customer.isActiveLead && !customer.isStudent && (
                                <Badge variant="outline">Prospect</Badge>
                            )}
                            <Separator />
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground">First Source</span>
                                <p className="text-sm capitalize">{customer.firstSource.replace('_', ' ')}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Engagement Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Workshops Attended</span>
                                <span className="text-sm font-semibold">{customer.workshopsAttended}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Quizzes Completed</span>
                                <span className="text-sm font-semibold">{customer.quizzesCompleted}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Payments Made</span>
                                <span className="text-sm font-semibold">{customer.paymentsMade}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Total Spent</span>
                                <span className="text-lg font-bold text-green-600">₹{customer.totalSpent.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
