'use client'

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Video, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { toast } from "sonner";

export default function MyBookingsPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchBookings();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    sessions (
                        *,
                        tutors (
                            profiles (full_name, avatar_url)
                        )
                    )
                `)
                .eq('student_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error: any) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 py-12 bg-muted/10">
                <div className="container max-w-4xl">
                    <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

                    <div className="space-y-4">
                        {bookings.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    {user ? "You have no upcoming bookings." : "Please log in to view your bookings."}
                                </CardContent>
                            </Card>
                        ) : (
                            bookings.map((booking) => {
                                const session = booking.sessions;
                                if (!session) return null;

                                const isOnline = session.location?.toLowerCase().includes('online') || session.location?.toLowerCase().includes('zoom');
                                const status = booking.status || 'Confirmed'; // Default to Confirmed if not present

                                return (
                                    <Card key={booking.id} className="overflow-hidden">
                                        <CardContent className="p-0 flex flex-col md:flex-row">
                                            {/* Date/Time Column */}
                                            <div className="bg-primary/5 p-6 flex flex-col justify-center items-center text-center min-w-[150px] border-b md:border-b-0 md:border-r">
                                                <div className="text-2xl font-bold text-primary">
                                                    {format(new Date(session.start_time), 'd')}
                                                </div>
                                                <div className="text-lg font-medium">
                                                    {format(new Date(session.start_time), 'MMM')}
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {format(new Date(session.start_time), 'h:mm a')}
                                                </div>
                                            </div>

                                            {/* Info Column */}
                                            <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-lg">{session.subject || "Tutoring Session"}</h3>
                                                        <Badge variant={status === 'Confirmed' ? 'default' : 'secondary'} className={status === 'Confirmed' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}>
                                                            {status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-foreground">{session.tutors?.profiles?.full_name}</span>
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        {isOnline ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                                                        {session.location}
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    {isOnline ? (
                                                        <Button className="gap-2">
                                                            <ExternalLink className="h-4 w-4" />
                                                            Open Meeting
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline" className="gap-2">
                                                            <MapPin className="h-4 w-4" />
                                                            View Location
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
