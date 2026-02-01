'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, Trash2, Loader2, MapPin, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SessionsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<any[]>([]);
    const [tutorSubjects, setTutorSubjects] = useState<string[]>([]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<any>(null);
    const [newSession, setNewSession] = useState({
        subject: "",
        price: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "online",
        capacity: "1",
        meetingUrl: ""
    });

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch tutor subjects
            const { data: tutorData } = await supabase
                .from('tutors')
                .select('subjects')
                .eq('id', user?.id)
                .single();

            if (tutorData) {
                setTutorSubjects(tutorData.subjects || []);
            }

            // Fetch sessions
            const { data, error } = await supabase
                .from('sessions')
                .select(`
                    *,
                    bookings (
                        id,
                        students:profiles!bookings_student_id_fkey (full_name)
                    )
                `)
                .eq('tutor_id', user?.id)
                .order('start_time', { ascending: true });

            if (error) throw error;
            setSessions(data || []);
        } catch (error: any) {
            toast.error("Failed to load sessions");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingSession(null);
        setNewSession({ subject: "", price: "", date: "", startTime: "", endTime: "", location: "online", capacity: "1", meetingUrl: "" });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (session: any) => {
        setEditingSession(session);
        const startDate = new Date(session.start_time);
        const endDate = new Date(session.end_time);
        setNewSession({
            subject: session.subject,
            price: session.price.toString(),
            date: startDate.toISOString().split('T')[0],
            startTime: startDate.toTimeString().slice(0, 5),
            endTime: endDate.toTimeString().slice(0, 5),
            location: session.location,
            capacity: session.capacity?.toString() || "1",
            meetingUrl: session.meeting_url || ""
        });
        setIsDialogOpen(true);
    };

    const handleSaveSession = async () => {
        try {
            if (!newSession.subject || !newSession.price || !newSession.date || !newSession.startTime || !newSession.endTime) {
                toast.error("Please fill in all fields");
                return;
            }

            const startDateTime = new Date(`${newSession.date}T${newSession.startTime}`);
            const endDateTime = new Date(`${newSession.date}T${newSession.endTime}`);

            const sessionData = {
                tutor_id: user?.id,
                subject: newSession.subject,
                price: parseInt(newSession.price),
                location: newSession.location,
                capacity: parseInt(newSession.capacity),
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                meeting_url: newSession.meetingUrl || null,
                status: editingSession ? editingSession.status : 'AVAILABLE'
            };

            if (editingSession) {
                const { error } = await supabase
                    .from('sessions')
                    .update(sessionData)
                    .eq('id', editingSession.id);
                if (error) throw error;
                toast.success("Session updated successfully");
            } else {
                const { error } = await supabase
                    .from('sessions')
                    .insert(sessionData);
                if (error) throw error;
                toast.success("Session created successfully");
            }

            setIsDialogOpen(false);
            setEditingSession(null);
            fetchData();
            setNewSession({ subject: "", price: "", date: "", startTime: "", endTime: "", location: "online", capacity: "1", meetingUrl: "" });
        } catch (error: any) {
            toast.error(error.message || "Failed to save session");
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!confirm("Are you sure you want to delete this session?")) return;
        try {
            const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
            if (error) throw error;
            toast.success("Session deleted");
            fetchData();
        } catch (error: any) {
            toast.error("Failed to delete session");
        }
    };

    const upcomingSessions = sessions.filter(s => new Date(s.start_time) >= new Date());
    const pastSessions = sessions.filter(s => new Date(s.start_time) < new Date());

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Sessions</h1>
                    <p className="text-slate-500">Manage your tutoring sessions</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingSession(null); }}>
                    <DialogTrigger asChild>
                        <Button onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSession ? "Edit Session" : "Create New Session"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Subject</Label>
                                <Select value={newSession.subject} onValueChange={(val) => setNewSession({ ...newSession, subject: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                                    <SelectContent>{tutorSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Price (EGP)</Label>
                                <Input type="number" value={newSession.price} onChange={(e) => setNewSession({ ...newSession, price: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Date</Label>
                                <Input type="date" value={newSession.date} onChange={(e) => setNewSession({ ...newSession, date: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2"><Label>Start</Label><Input type="time" value={newSession.startTime} onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>End</Label><Input type="time" value={newSession.endTime} onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })} /></div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Capacity (Students)</Label>
                                <Input type="number" min="1" value={newSession.capacity} onChange={(e) => setNewSession({ ...newSession, capacity: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Location</Label>
                                <Select value={newSession.location} onValueChange={(val) => setNewSession({ ...newSession, location: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="online">Online</SelectItem><SelectItem value="in-person">In Person</SelectItem></SelectContent>
                                </Select>
                            </div>
                            {newSession.location === 'online' && (
                                <div className="grid gap-2">
                                    <Label>Meeting Link (Optional)</Label>
                                    <Input
                                        placeholder="https://zoom.us/j/..."
                                        value={newSession.meetingUrl}
                                        onChange={(e) => setNewSession({ ...newSession, meetingUrl: e.target.value })}
                                    />
                                </div>
                            )}
                            <Button onClick={handleSaveSession}>{editingSession ? "Update Session" : "Create Session"}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : sessions.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="py-12 text-center">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <h3 className="font-semibold text-slate-900 mb-1">No Sessions Yet</h3>
                        <p className="text-sm text-slate-500 mb-4">Create your first session to start accepting bookings.</p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Session
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {upcomingSessions.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 mb-3">Upcoming Sessions</h2>
                            <div className="space-y-3">
                                {upcomingSessions.map(session => (
                                    <Card key={session.id}>
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <Calendar className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{session.subject}</h3>
                                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {format(new Date(session.start_time), 'MMM d, h:mm a')}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {session.location}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 mt-1">
                                                        {session.bookings?.length || 0}/{session.capacity || 1} spots filled
                                                    </p>
                                                    {session.bookings?.length > 0 && session.bookings.length <= 3 && (
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Students: {session.bookings.map((b: any) => b.students?.full_name).filter(Boolean).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={session.status === 'BOOKED' ? 'default' : 'outline'}>
                                                    {session.status}
                                                </Badge>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenEdit(session)}
                                                        title="Edit session"
                                                    >
                                                        <Pencil className="h-4 w-4 text-slate-600" />
                                                    </Button>
                                                    {session.status === 'AVAILABLE' && (
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSession(session.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {pastSessions.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-slate-500 mb-3">Past Sessions</h2>
                            <div className="space-y-2 opacity-60">
                                {pastSessions.slice(0, 5).map(session => (
                                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                        <div>
                                            <span className="font-medium">{session.subject}</span>
                                            <span className="text-sm text-slate-500 ml-2">
                                                {format(new Date(session.start_time), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                        <Badge variant="secondary">{session.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
