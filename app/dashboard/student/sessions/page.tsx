'use client'

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, User, LayoutGrid } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTutorContext } from "@/contexts/TutorContext";
import { format } from "date-fns";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentSessionsPage() {
    const { user } = useAuth();
    const { activeTutorId, activeTutor, clearActiveTutor } = useTutorContext();
    const [loading, setLoading] = useState(true);
    const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
    const [pastSessions, setPastSessions] = useState<any[]>([]);

    useEffect(() => {
        if (user && activeTutorId) {
            fetchSessions();
        }
    }, [user, activeTutorId]);

    // Gate: require academy selection
    if (!activeTutorId) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <LayoutGrid className="h-7 w-7 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Select an Academy</h2>
                <p className="text-slate-500 max-w-sm mb-6">Choose an academy from the switcher above to view your sessions.</p>
                <Button variant="outline" onClick={() => clearActiveTutor()}>
                    <Link href="/dashboard/student">Go to My Academies</Link>
                </Button>
            </div>
        );
    }

    const fetchSessions = async () => {
        try {
            setLoading(true);

            const { data } = await supabase
                .from('bookings')
                .select(`
                    id,
                    status,
                    sessions!inner(
                        id,
                        subject,
                        start_time,
                        end_time,
                        meeting_url,
                        duration,
                        tutor_id,
                        tutors(profiles(full_name))
                    )
                `)
                .eq('student_id', user?.id)
                .order('sessions(start_time)', { ascending: true });

            const now = new Date();
            const upcoming = [];
            const past = [];

            if (data) {
                for (const booking of data) {
                    const session = Array.isArray(booking.sessions) ? booking.sessions[0] : booking.sessions;
                    const startTime = new Date(session.start_time);

                    // Filter by active tutor if set
                    if (activeTutorId && session.tutor_id !== activeTutorId) {
                        continue;
                    }

                    const normalizedBooking = { ...booking, sessions: session };

                    if (startTime >= now) {
                        upcoming.push(normalizedBooking);
                    } else {
                        past.push(normalizedBooking);
                    }
                }
            }

            setUpcomingSessions(upcoming);
            setPastSessions(past.sort((a, b) =>
                new Date(b.sessions.start_time).getTime() - new Date(a.sessions.start_time).getTime()
            ));

        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const activeTutorName = activeTutor?.tutor?.profiles?.full_name;

    const SessionCard = ({ booking, isPast = false }: { booking: any, isPast?: boolean }) => (
        <Card className="mb-4 hover:border-blue-300 transition-colors">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isPast ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-600'}`}>
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg text-slate-900">{booking.sessions.subject}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {booking.sessions.tutors?.profiles?.full_name}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {format(new Date(booking.sessions.start_time), 'PPp')}
                                </span>
                                <span className="flex items-center gap-1">
                                    Duration: {booking.sessions.duration} mins
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {!isPast && booking.sessions.meeting_url && (
                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => window.open(booking.sessions.meeting_url, '_blank')}>
                                <Video className="h-4 w-4 mr-2" />
                                Join Call
                            </Button>
                        )}
                        {!isPast && (
                            <Button variant="outline">
                                Details
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {activeTutorName ? `${activeTutorName}'s Sessions` : 'My Sessions'}
                    </h1>
                    <p className="text-slate-500">
                        {activeTutorName
                            ? `Sessions with ${activeTutorName}`
                            : 'Manage your upcoming and past tutoring sessions'}
                    </p>
                </div>
                <Link href="/dashboard/student/tutors">
                    <Button>Book New Session</Button>
                </Link>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList>
                    <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
                    <TabsTrigger value="past">Past ({pastSessions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-6">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading sessions...</div>
                    ) : upcomingSessions.length === 0 ? (
                        <Card className="bg-slate-50 border-dashed border-2">
                            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-blue-500">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">No upcoming sessions</h3>
                                <p className="text-slate-500 max-w-sm mt-1 mb-4">
                                    {activeTutorName
                                        ? `No upcoming sessions with ${activeTutorName}.`
                                        : "You don't have any booked sessions coming up."}
                                </p>
                                <Link href="/dashboard/student/tutors">
                                    <Button>Book a Session</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        upcomingSessions.map(booking => (
                            <SessionCard key={booking.id} booking={booking} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="past" className="mt-6">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading sessions...</div>
                    ) : pastSessions.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">No past sessions found</div>
                    ) : (
                        pastSessions.map(booking => (
                            <SessionCard key={booking.id} booking={booking} isPast={true} />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
