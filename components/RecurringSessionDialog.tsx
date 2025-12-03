'use client'

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Repeat } from "lucide-react";

interface RecurringSessionDialogProps {
    tutorId: string;
    onSessionsCreated: () => void;
}

export default function RecurringSessionDialog({ tutorId, onSessionsCreated }: RecurringSessionDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        subject: "",
        price: "",
        frequency: "weekly",
        dayOfWeek: "1", // Monday
        time: "15:00",
        durationMinutes: "120",
        endDate: "",
        location: "online",
        capacity: "10"
    });

    const handleSubmit = async () => {
        if (!formData.subject || !formData.price || !formData.endDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSubmitting(true);
        try {
            // Generate sessions based on recurrence rule
            const sessions = generateRecurringSessions(formData);

            if (sessions.length === 0) {
                toast.error("No sessions to create. Check your end date.");
                return;
            }

            if (sessions.length > 52) {
                toast.error("Too many sessions (max 52). Please adjust your end date.");
                return;
            }

            // Insert all sessions
            const { error } = await supabase
                .from('sessions')
                .insert(sessions);

            if (error) throw error;

            toast.success(`Successfully created ${sessions.length} recurring sessions!`);
            setIsOpen(false);
            setFormData({
                subject: "",
                price: "",
                frequency: "weekly",
                dayOfWeek: "1",
                time: "15:00",
                durationMinutes: "120",
                endDate: "",
                location: "online",
                capacity: "10"
            });
            onSessionsCreated();
        } catch (error: any) {
            console.error('Error creating recurring sessions:', error);
            toast.error(error.message || "Failed to create recurring sessions");
        } finally {
            setSubmitting(false);
        }
    };

    const generateRecurringSessions = (data: typeof formData) => {
        const sessions: any[] = [];
        const startDate = new Date();
        const endDate = new Date(data.endDate);
        const dayOfWeek = parseInt(data.dayOfWeek);
        const [hours, minutes] = data.time.split(':').map(Number);
        const durationMs = parseInt(data.durationMinutes) * 60 * 1000;

        // Find the first occurrence
        let currentDate = new Date(startDate);
        while (currentDate.getDay() !== dayOfWeek) {
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Generate sessions
        while (currentDate <= endDate) {
            const sessionStart = new Date(currentDate);
            sessionStart.setHours(hours, minutes, 0, 0);

            const sessionEnd = new Date(sessionStart.getTime() + durationMs);

            sessions.push({
                tutor_id: tutorId,
                subject: data.subject,
                price: parseFloat(data.price),
                start_time: sessionStart.toISOString(),
                end_time: sessionEnd.toISOString(),
                location: data.location,
                status: 'AVAILABLE',
                capacity: parseInt(data.capacity),
                recurrence_rule: {
                    frequency: data.frequency,
                    day_of_week: dayOfWeek,
                    time: data.time,
                    duration_minutes: parseInt(data.durationMinutes),
                    end_date: data.endDate
                }
            });

            // Move to next occurrence
            if (data.frequency === 'weekly') {
                currentDate.setDate(currentDate.getDate() + 7);
            } else if (data.frequency === 'biweekly') {
                currentDate.setDate(currentDate.getDate() + 14);
            } else if (data.frequency === 'monthly') {
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }

        return sessions;
    };

    const getPreviewCount = () => {
        if (!formData.endDate) return 0;
        try {
            return generateRecurringSessions(formData).length;
        } catch {
            return 0;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Repeat className="h-4 w-4" />
                    Create Recurring Sessions
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Recurring Sessions</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="subject">Subject *</Label>
                            <Input
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="e.g., Calculus 101"
                            />
                        </div>
                        <div>
                            <Label htmlFor="price">Price (EGP) *</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="150"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="frequency">Frequency *</Label>
                            <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="biweekly">Bi-weekly (Every 2 weeks)</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="dayOfWeek">Day of Week *</Label>
                            <Select value={formData.dayOfWeek} onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Sunday</SelectItem>
                                    <SelectItem value="1">Monday</SelectItem>
                                    <SelectItem value="2">Tuesday</SelectItem>
                                    <SelectItem value="3">Wednesday</SelectItem>
                                    <SelectItem value="4">Thursday</SelectItem>
                                    <SelectItem value="5">Friday</SelectItem>
                                    <SelectItem value="6">Saturday</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="time">Start Time *</Label>
                            <Input
                                id="time"
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="duration">Duration (minutes) *</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={formData.durationMinutes}
                                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                                placeholder="120"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="endDate">End Date *</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div>
                            <Label htmlFor="capacity">Capacity (students) *</Label>
                            <Input
                                id="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                placeholder="10"
                                min="1"
                                max="50"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="location">Location *</Label>
                        <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="in-person">In-Person</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.endDate && (
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium">
                                This will create <span className="text-primary font-bold">{getPreviewCount()}</span> sessions
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formData.frequency === 'weekly' && `Every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(formData.dayOfWeek)]} at ${formData.time}`}
                                {formData.frequency === 'biweekly' && `Every other ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(formData.dayOfWeek)]} at ${formData.time}`}
                                {formData.frequency === 'monthly' && `Monthly on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(formData.dayOfWeek)]} at ${formData.time}`}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2 justify-end pt-4">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting || !formData.subject || !formData.price || !formData.endDate}>
                            {submitting ? "Creating..." : `Create ${getPreviewCount()} Sessions`}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
