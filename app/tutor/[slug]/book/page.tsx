'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, MapPin, DollarSign, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function BookingPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [tutor, setTutor] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<string | null>(null);

    useEffect(() => {
        if (slug) fetchTutorAndSessions();
    }, [slug]);

    const fetchTutorAndSessions = async () => {
        try {
            // Fetch Tutor
            const { data: tutorData, error: tutorError } = await supabase
                .from('tutors')
                .select('*, profiles(full_name, avatar_url)')
                .eq('slug', slug)
                .single();

            if (tutorError || !tutorData) throw new Error("Tutor not found");
            setTutor(tutorData);

            // Fetch Available Sessions
            const { data: sessionsData } = await supabase
                .from('sessions')
                .select(`
                    id, subject, start_time, end_time, price, location, capacity,
                    bookings (
                        id
                    )
                `)
                .eq('tutor_id', tutorData.id)
                .gte('start_time', new Date().toISOString())
                .order('start_time', { ascending: true });

            setSessions(sessionsData || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load sessions");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (sessionId: string) => {
        if (!user) {
            router.push(`/login?next=/tutor/${slug}/book`);
            return;
        }

        try {
            setBooking(sessionId);

            // Check if already booked
            const { data: existing } = await supabase
                .from('bookings')
                .select('id')
                .eq('session_id', sessionId)
                .eq('student_id', user.id)
                .single();

            if (existing) {
                toast.info("You already booked this session");
                setBooking(null);
                return;
            }

            // Insert booking
            const { error } = await supabase
                .from('bookings')
                .insert({
                    session_id: sessionId,
                    student_id: user.id,
                    status: 'CONFIRMED'
                });

            if (error) throw error;

            toast.success("Session booked successfully!");
            setTimeout(() => {
                router.push('/dashboard/student');
            }, 1000);

        } catch (error: any) {
            toast.error(error.message || "Booking failed");
            setBooking(null);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!tutor) return <div className="min-h-screen flex items-center justify-center">Tutor not found</div>;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1 container py-12 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Book a Session</h1>
                    <p className="text-slate-500">with {tutor.profiles.full_name}</p>
                </div>

                <div className="grid gap-4">
                    {sessions.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-slate-500">
                                No available sessions at the moment.
                            </CardContent>
                        </Card>
                    ) : (
                        sessions.map(session => {
                            const bookedCount = session.bookings?.length || 0;
                            const capacity = session.capacity || 1;
                            const isFull = bookedCount >= capacity;

                            return (
                                <Card key={session.id} className={isFull ? "opacity-60 bg-slate-100" : ""}>
                                    <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-lg">{session.subject}</h3>
                                                {isFull && <div className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-bold uppercase">Full</div>}
                                            </div>
                                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(session.start_time), 'EEE, MMM d')}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {session.location}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    {session.price} EGP
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="lg"
                                            disabled={isFull || booking === session.id}
                                            onClick={() => handleBook(session.id)}
                                        >
                                            {booking === session.id ? <Loader2 className="animate-spin" /> : (isFull ? "Full" : "Book session")}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
