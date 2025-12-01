'use client'

import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MapPin, Clock, Award, BookOpen, Calendar, MessageSquare, Loader2 } from "lucide-react";
import tutorTeaching from "@/assets/tutor-teaching.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function TutorProfilePage() {
    const params = useParams();
    const id = params?.id as string;
    const { user } = useAuth();

    const [tutor, setTutor] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingId, setBookingId] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchTutorAndSessions();
        }
    }, [id]);

    const fetchTutorAndSessions = async () => {
        try {
            // Fetch Tutor Profile (Mocking some fields as they might not exist in DB yet)
            const { data: tutorData, error: tutorError } = await supabase
                .from('tutors')
                .select(`
                    *,
                    profiles (full_name, avatar_url)
                `)
                .eq('id', id)
                .single();

            if (tutorError) throw tutorError;
            setTutor(tutorData);

            // Fetch Available Sessions
            const { data: sessionsData, error: sessionsError } = await supabase
                .from('sessions')
                .select('*')
                .eq('tutor_id', id)
                .eq('status', 'AVAILABLE')
                .gte('start_time', new Date().toISOString())
                .order('start_time', { ascending: true });

            if (sessionsError) throw sessionsError;
            setSessions(sessionsData || []);

        } catch (error: any) {
            console.error('Error fetching data:', JSON.stringify(error, null, 2));
            toast.error('Failed to load tutor data: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleBookSession = async (sessionId: string) => {
        if (!user) {
            toast.error("Please login to book a session");
            return;
        }

        setBookingId(sessionId);
        try {
            const { error } = await supabase
                .from('sessions')
                .update({
                    student_id: user.id,
                    status: 'BOOKED'
                })
                .eq('id', sessionId)
                .eq('status', 'AVAILABLE'); // Optimistic concurrency check

            if (error) throw error;

            toast.success("Session booked successfully!");
            fetchTutorAndSessions(); // Refresh list
        } catch (error: any) {
            toast.error("Failed to book session. It might have been taken.");
        } finally {
            setBookingId(null);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!tutor) return <div>Tutor not found</div>;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <section className="py-12">
                    <div className="container">
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardContent className="p-8">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <img
                                                src={tutor.profiles?.avatar_url || "https://github.com/shadcn.png"}
                                                alt={tutor.profiles?.full_name}
                                                className="w-32 h-32 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h1 className="text-3xl font-bold mb-2">{tutor.profiles?.full_name}</h1>
                                                        <p className="text-lg text-muted-foreground mb-3">{tutor.bio || "Tutor"}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-6 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Star className="h-4 w-4 fill-accent text-accent" />
                                                        <span className="font-semibold">{tutor.rating || 5.0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <MapPin className="h-4 w-4" />
                                                        Cairo, Egypt
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Available Sessions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {sessions.length === 0 ? (
                                            <p className="text-muted-foreground">No available sessions at the moment.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {sessions.map((session) => (
                                                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                        <div>
                                                            <h4 className="font-semibold">{session.subject}</h4>
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {format(new Date(session.start_time), 'MMM d, yyyy')}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {session.location}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="font-bold text-lg">{session.price} EGP</div>
                                                            <Button
                                                                onClick={() => handleBookSession(session.id)}
                                                                disabled={bookingId === session.id}
                                                            >
                                                                {bookingId === session.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                Book
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="sticky top-24">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="text-center pb-4 border-b">
                                            <div className="text-4xl font-bold text-primary mb-1">{tutor.hourly_rate || 300} EGP</div>
                                            <div className="text-sm text-muted-foreground">per hour</div>
                                        </div>

                                        <Button className="w-full" variant="outline" size="lg">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Send Message
                                        </Button>

                                        <div className="pt-4 border-t">
                                            <img
                                                src={tutorTeaching.src}
                                                alt="Tutor teaching"
                                                className="w-full rounded-lg"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
