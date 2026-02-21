'use client'

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, User, LayoutGrid, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTutorContext } from "@/contexts/TutorContext";
import { format } from "date-fns";
import Link from "next/link";
import { useAcademyBasePath } from "@/lib/useAcademyBasePath";
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
                <Link href="/dashboard/student">
                    <Button variant="outline">Go to My Academies</Button>
                </Link>
            </div>
        );
    }

    const basePath = useAcademyBasePath();
    const brandColor = activeTutor?.tutor?.brand_color || '#3b82f6';
    const academyName = activeTutor?.tutor?.academy_name || activeTutor?.tutor?.profiles?.full_name || 'Academy';

    const fetchSessions = async () => {
        try {
            setLoading(true);

            const { data } = await supabase
                .from('bookings')
                .select(`
                    id,
                    status,
                    sessions!inner(
                        id, subject, start_time, end_time,
                        meeting_url, duration, tutor_id,
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
                    if (activeTutorId && session.tutor_id !== activeTutorId) continue;

                    const normalizedBooking = { ...booking, sessions: session };
                    if (new Date(session.start_time) >= now) {
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

    const SessionCard = ({ booking, isPast = false }: { booking: any, isPast?: boolean }) => (
        <div
            className="bg-white rounded-xl border p-5 hover:shadow-md transition-all duration-200 group"
            style={{ borderColor: isPast ? '#e2e8f0' : `${brandColor}15` }}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            backgroundColor: isPast ? '#f1f5f9' : `${brandColor}10`,
                            color: isPast ? '#94a3b8' : brandColor,
                        }}
                    >
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-base text-slate-900">{booking.sessions.subject}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {format(new Date(booking.sessions.start_time), 'MMM d, yyyy · h:mm a')}
                            </span>
                            <span className="flex items-center gap-1">
                                {booking.sessions.duration} min
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isPast && booking.sessions.meeting_url && (
                        <Button
                            className="text-white"
                            style={{ backgroundColor: brandColor }}
                            onClick={() => window.open(booking.sessions.meeting_url, '_blank')}
                        >
                            <Video className="h-4 w-4 mr-2" />
                            Join Call
                        </Button>
                    )}
                    {isPast && (
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-500">
                            Completed
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div
                className="relative overflow-hidden rounded-2xl p-6 md:p-8"
                style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}bb 100%)` }}
            >
                <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-10 bg-white" />
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full opacity-10 bg-white" />
                <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Sessions</h1>
                            <p className="text-white/70 text-sm">{academyName}</p>
                        </div>
                    </div>
                    <Link href="/dashboard/student/tutors">
                        <Button className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-0">
                            Book Session
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList>
                    <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
                    <TabsTrigger value="past">Past ({pastSessions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-6">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading sessions...</div>
                    ) : upcomingSessions.length === 0 ? (
                        <div className="bg-white rounded-2xl border-2 border-dashed py-16 flex flex-col items-center justify-center text-center" style={{ borderColor: `${brandColor}30` }}>
                            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                                <Calendar className="h-7 w-7" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">No upcoming sessions</h3>
                            <p className="text-slate-500 max-w-sm mb-4">Book a session to get started with {academyName}.</p>
                            <Link href="/dashboard/student/tutors">
                                <Button style={{ backgroundColor: brandColor }} className="text-white">
                                    Book a Session
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {upcomingSessions.map(booking => (
                                <SessionCard key={booking.id} booking={booking} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="past" className="mt-6">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading sessions...</div>
                    ) : pastSessions.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">No past sessions</div>
                    ) : (
                        <div className="grid gap-3">
                            {pastSessions.map(booking => (
                                <SessionCard key={booking.id} booking={booking} isPast={true} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
