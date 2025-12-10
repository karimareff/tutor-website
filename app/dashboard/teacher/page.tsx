'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, DollarSign, Star, Plus, Clock, MapPin, Trash2, Settings } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import RecurringSessionDialog from "@/components/RecurringSessionDialog";
import SessionList from "@/components/SessionList";

export default function TeacherDashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        totalStudents: 0,
        averageRating: 5.0,
    });
    const [sessions, setSessions] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);

    // Create Session Form State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newSession, setNewSession] = useState({
        subject: "",
        price: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "online"
    });
    const [tutorSubjects, setTutorSubjects] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            console.log('=== Fetching dashboard data for tutor:', user?.id);

            // Fetch all sessions for this tutor
            const { data: sessionsData, error } = await supabase
                .from('sessions')
                .select(`
                    *,
                    bookings (
                        *,
                        students:profiles!bookings_student_id_fkey (*)
                    )
                `)
                .eq('tutor_id', user?.id)
                .order('start_time', { ascending: true });

            console.log('=== Sessions query result:', { sessionsData, error });

            if (error) throw error;

            setSessions(sessionsData || []);

            // Calculate stats
            const completedSessions = sessionsData?.filter(s => s.status === 'COMPLETED') || [];

            // Calculate unique students from all bookings
            const allBookings = sessionsData?.flatMap(s => s.bookings || []) || [];
            console.log('=== All bookings:', allBookings);

            const uniqueStudents = new Set(allBookings.map((b: any) => b.student_id));

            // Calculate earnings
            const earnings = allBookings.reduce((acc: number, curr: any) => {
                const session = sessionsData?.find(s => s.id === curr.session_id);
                return acc + (session?.price || 0);
            }, 0);

            console.log('=== Stats calculated:', {
                totalEarnings: earnings,
                totalStudents: uniqueStudents.size,
                sessionsCount: sessionsData?.length
            });

            // Fetch reviews for this tutor
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select(`
                    *,
                    students:profiles!reviews_student_id_fkey (full_name),
                    sessions (subject)
                `)
                .eq('tutor_id', user?.id)
                .order('created_at', { ascending: false });

            if (reviewsError) {
                console.error('Error fetching reviews:', reviewsError);
            } else {
                setReviews(reviewsData || []);
            }

            // Calculate actual average rating from reviews
            const avgRating = reviewsData && reviewsData.length > 0
                ? reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length
                : 5.0;

            setStats({
                totalEarnings: earnings,
                totalStudents: uniqueStudents.size,
                averageRating: Number(avgRating.toFixed(1)),
            });

            // Fetch tutor subjects for the dropdown
            const { data: tutorData } = await supabase
                .from('tutors')
                .select('subjects')
                .eq('id', user?.id)
                .single();

            if (tutorData?.subjects) {
                setTutorSubjects(tutorData.subjects);
            }
        } catch (error: any) {
            console.error('=== Error fetching dashboard data:', JSON.stringify(error, null, 2));
            toast.error('Failed to load dashboard data: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async () => {
        try {
            if (!newSession.subject || !newSession.price || !newSession.date || !newSession.startTime || !newSession.endTime) {
                toast.error("Please fill in all fields");
                return;
            }

            const startDateTime = new Date(`${newSession.date}T${newSession.startTime}`);
            const endDateTime = new Date(`${newSession.date}T${newSession.endTime}`);

            const { error } = await supabase
                .from('sessions')
                .insert({
                    tutor_id: user?.id,
                    subject: newSession.subject,
                    price: parseInt(newSession.price),
                    location: newSession.location,
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                    status: 'AVAILABLE'
                });

            if (error) throw error;

            toast.success("Session created successfully");
            setIsCreateOpen(false);
            fetchDashboardData();
            setNewSession({
                subject: "",
                price: "",
                date: "",
                startTime: "",
                endTime: "",
                location: "online"
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to create session");
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!confirm("Are you sure you want to delete this session?")) return;

        try {
            const { error } = await supabase
                .from('sessions')
                .delete()
                .eq('id', sessionId);

            if (error) throw error;
            toast.success("Session deleted");
            fetchDashboardData();
        } catch (error: any) {
            toast.error("Failed to delete session");
        }
    };

    const STAT_CARDS = [
        { label: "Total Earnings", value: `${stats.totalEarnings.toLocaleString()} EGP`, icon: DollarSign },
        { label: "Total Students", value: stats.totalStudents.toString(), icon: Users },
        { label: "Average Rating", value: stats.averageRating.toFixed(1), icon: Star },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
                        <p className="text-slate-500">Manage your inventory and schedule</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="h-9">
                            <Link href="/settings">
                                <Settings className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Link>
                        </Button>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="h-9">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Session</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Subject</Label>
                                        <Select
                                            value={newSession.subject}
                                            onValueChange={(val) => setNewSession({ ...newSession, subject: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tutorSubjects.length > 0 ? (
                                                    tutorSubjects.map((subject) => (
                                                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-sm text-slate-500 text-center">
                                                        No subjects found. Please update your profile.
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Price (EGP)</Label>
                                        <Input
                                            type="number"
                                            value={newSession.price}
                                            onChange={(e) => setNewSession({ ...newSession, price: e.target.value })}
                                            placeholder="300"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Date</Label>
                                        <Input
                                            type="date"
                                            value={newSession.date}
                                            onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Start Time</Label>
                                            <Input
                                                type="time"
                                                value={newSession.startTime}
                                                onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>End Time</Label>
                                            <Input
                                                type="time"
                                                value={newSession.endTime}
                                                onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Location</Label>
                                        <Select
                                            value={newSession.location}
                                            onValueChange={(val) => setNewSession({ ...newSession, location: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="online">Online</SelectItem>
                                                <SelectItem value="in-person">In Person</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleCreateSession} className="w-full mt-4">Create Session</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <RecurringSessionDialog
                            tutorId={user?.id || ''}
                            onSessionsCreated={fetchDashboardData}
                        />
                    </div>
                </div>

                <Tabs defaultValue="sessions" className="space-y-6">
                    <TabsList className="grid grid-cols-2 md:inline-flex h-auto md:h-10 w-full md:w-auto gap-2 md:gap-0 p-2 md:p-1 bg-slate-100 rounded-lg">
                        <TabsTrigger value="sessions" className="w-full">My Sessions</TabsTrigger>
                        <TabsTrigger value="bookings" className="w-full">Booked Students</TabsTrigger>
                        <TabsTrigger value="reviews" className="w-full">Reviews</TabsTrigger>
                        <TabsTrigger value="overview" className="w-full">Overview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            {STAT_CARDS.map((stat) => (
                                <Card key={stat.label}>
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="bookings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Booked Sessions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div>Loading...</div>
                                ) : (
                                    <SessionList
                                        bookings={sessions.flatMap(session =>
                                            (session.bookings || []).map((booking: any) => ({
                                                ...booking,
                                                session
                                            }))
                                        )}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reviews">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5" />
                                    Student Reviews ({reviews.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div>Loading...</div>
                                ) : reviews.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        No reviews yet. Students will be able to review you after completing sessions.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="border-b pb-4 last:border-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{review.students?.full_name || 'Student'}</div>
                                                        <div className="text-sm text-slate-500">{review.sessions?.subject || 'Session'}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${i < review.rating
                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                        : 'text-gray-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm font-medium">{review.rating}/5</span>
                                                    </div>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-sm text-slate-500 mb-2">{review.comment}</p>
                                                )}
                                                <p className="text-xs text-slate-400">
                                                    {format(new Date(review.created_at), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sessions">
                        <Card>
                            <CardHeader>
                                <CardTitle>Session Inventory</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div>Loading...</div>
                                ) : sessions.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        No sessions created yet. Create one to get started!
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sessions.map((session) => (
                                            <div key={session.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors gap-4">
                                                <div className="space-y-2 w-full">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h4 className="font-semibold text-lg text-slate-900">{session.subject}</h4>
                                                        <Badge variant={session.status === 'AVAILABLE' ? 'outline' : 'secondary'} className={session.status === 'AVAILABLE' ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" : "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200"}>
                                                            {session.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-4 text-sm text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 shrink-0" />
                                                            {format(new Date(session.start_time), 'MMM d, yyyy')}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3 shrink-0" />
                                                            {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                                                        </span>
                                                        <span className="flex items-center gap-1 col-span-2 md:col-span-1">
                                                            <MapPin className="h-3 w-3 shrink-0" />
                                                            {session.location}
                                                        </span>
                                                    </div>
                                                    {session.bookings && session.bookings.length > 0 && (
                                                        <p className="text-sm text-primary font-medium">
                                                            {session.bookings.length} student{session.bookings.length !== 1 ? 's' : ''} booked
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t border-slate-100 md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                                                    <div className="font-bold text-lg text-slate-900">{session.price} EGP</div>
                                                    {session.status === 'AVAILABLE' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive/90"
                                                            onClick={() => handleDeleteSession(session.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
            <Footer />
        </div>
    );
}
