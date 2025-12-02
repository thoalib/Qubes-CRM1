"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Phone } from "lucide-react"

interface CallLogFormProps {
    leadId: string
    leadName: string
    trigger?: React.ReactNode
}

export function CallLogForm({ leadId, leadName, trigger }: CallLogFormProps) {
    const [open, setOpen] = useState(false)
    const [objections, setObjections] = useState<string[]>([])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Save to Supabase
        console.log("Call logged for lead:", leadId)
        setOpen(false)
    }

    const toggleObjection = (objection: string) => {
        setObjections(prev =>
            prev.includes(objection)
                ? prev.filter(o => o !== objection)
                : [...prev, objection]
        )
    }

    return (
        <Dialog open={open} onSetOpen={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Phone className="mr-2 h-4 w-4" />
                        Log Call
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Log Call - {leadName}</DialogTitle>
                    <DialogDescription>
                        Record details of your conversation
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Call Outcome */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="outcome" className="text-right">
                                Call Outcome *
                            </Label>
                            <Select required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select outcome" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="answered">✅ Answered</SelectItem>
                                    <SelectItem value="no_answer">📵 No Answer</SelectItem>
                                    <SelectItem value="voicemail">📞 Voicemail</SelectItem>
                                    <SelectItem value="busy">🔴 Busy</SelectItem>
                                    <SelectItem value="wrong_number">❌ Wrong Number</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Call Duration */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration" className="text-right">
                                Duration (mins)
                            </Label>
                            <Input
                                id="duration"
                                type="number"
                                placeholder="15"
                                className="col-span-3"
                            />
                        </div>

                        {/* Interest Level */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="interest" className="text-right">
                                Interest Level
                            </Label>
                            <Select>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select interest level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hot">🔥 Hot</SelectItem>
                                    <SelectItem value="warm">🟡 Warm</SelectItem>
                                    <SelectItem value="cold">🔵 Cold</SelectItem>
                                    <SelectItem value="not_interested">❌ Not Interested</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-4 border-t pt-4">
                            <h4 className="font-medium mb-3">Additional Information</h4>
                        </div>

                        {/* Place */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="place" className="text-right">
                                Place/City
                            </Label>
                            <Input
                                id="place"
                                placeholder="Mumbai"
                                className="col-span-3"
                            />
                        </div>

                        {/* Current Education */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="education" className="text-right">
                                Currently Studying
                            </Label>
                            <Input
                                id="education"
                                placeholder="B.Tech Final Year"
                                className="col-span-3"
                            />
                        </div>

                        {/* Budget Range */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="budget" className="text-right">
                                Budget Range
                            </Label>
                            <Select>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select budget range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10k-25k">₹10,000 - ₹25,000</SelectItem>
                                    <SelectItem value="25k-50k">₹25,000 - ₹50,000</SelectItem>
                                    <SelectItem value="50k+">₹50,000+</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Decision Timeline */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="timeline" className="text-right">
                                Decision Timeline
                            </Label>
                            <Select>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="When will they decide?" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="this_week">This Week</SelectItem>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="3_months">3+ Months</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-4 border-t pt-4">
                            <h4 className="font-medium mb-3">Call Summary</h4>
                        </div>

                        {/* Summary */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="summary" className="text-right pt-2">
                                Summary
                            </Label>
                            <Textarea
                                id="summary"
                                placeholder="What was discussed during the call..."
                                className="col-span-3"
                                rows={4}
                            />
                        </div>

                        {/* Objections */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">
                                Objections Raised
                            </Label>
                            <div className="col-span-3 space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="obj-price"
                                        checked={objections.includes("price")}
                                        onCheckedChange={() => toggleObjection("price")}
                                    />
                                    <label htmlFor="obj-price" className="text-sm">
                                        Price too high
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="obj-time"
                                        checked={objections.includes("time")}
                                        onCheckedChange={() => toggleObjection("time")}
                                    />
                                    <label htmlFor="obj-time" className="text-sm">
                                        Need more time to decide
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="obj-comparing"
                                        checked={objections.includes("comparing")}
                                        onCheckedChange={() => toggleObjection("comparing")}
                                    />
                                    <label htmlFor="obj-comparing" className="text-sm">
                                        Comparing with other options
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="obj-online"
                                        checked={objections.includes("online")}
                                        onCheckedChange={() => toggleObjection("online")}
                                    />
                                    <label htmlFor="obj-online" className="text-sm">
                                        Not sure about online learning
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-4 border-t pt-4">
                            <h4 className="font-medium mb-3">Next Steps</h4>
                        </div>

                        {/* Next Action */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="next-action" className="text-right">
                                Next Action
                            </Label>
                            <Select>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="What's next?" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="follow_up">📞 Schedule Follow-up</SelectItem>
                                    <SelectItem value="send_info">📧 Send Information</SelectItem>
                                    <SelectItem value="demo">🎥 Schedule Demo</SelectItem>
                                    <SelectItem value="close">✅ Close Deal</SelectItem>
                                    <SelectItem value="disqualify">❌ Disqualify</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Follow-up Date */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="followup-date" className="text-right">
                                Follow-up Date
                            </Label>
                            <Input
                                id="followup-date"
                                type="date"
                                className="col-span-3"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Call Log</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
