'use client'

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, MessageSquare, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import Loading from "@/components/ui/loading";
import ReviewDialog from "@/components/ReviewDialog";

export default function StudentDashboardPage() {
    const { user } = useAuth();
    const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
    const [pastLessons, setPastLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            // 1. Fetch bookings
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('bookings')
                .select(`
                    id,
                    sessions (
                        *,
                        tutors (
                            *,
                            profiles (full_name)
                        )
                    )
                `)
                .eq('student_id', user?.id);

            if (bookingsError) throw bookingsError;

            // 2. Fetch reviews for this student
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select('id, session_id, rating')
                .eq('student_id', user?.id);

            if (reviewsError) {
                console.error("Error fetching reviews:", reviewsError);
                // Don't throw, just continue without reviews
            }

            // 3. Create a map of session_id -> reviews
            const reviewsMap = new Map();
            if (reviewsData) {
                reviewsData.forEach((review: any) => {
                    if (!reviewsMap.has(review.session_id)) {
                        reviewsMap.set(review.session_id, []);
                    }
                    reviewsMap.get(review.session_id).push(review);
                });
            }

            const now = new Date();
            const upcoming: any[] = [];
            const past: any[] = [];

            if (bookingsData) {
                bookingsData.forEach((booking: any) => {
                    const session = booking.sessions;
                    // Attach reviews to session object
                    session.reviews = reviewsMap.get(session.id) || [];
                    // The UI expects 'lesson' object with session fields.
                    const lesson = { ...session, booking_id: booking.id };

                    const sessionDate = new Date(session.start_time);
                    if (sessionDate >= now) {
                        upcoming.push(lesson);
                    } else {
                        past.push(lesson);
                    }
                });
            }

            // Sort by date
            upcoming.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
            past.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

            setUpcomingLessons(upcoming);
            setPastLessons(past);
        } catch (error: any) {
            console.error('Error fetching bookings:', JSON.stringify(error, null, 2));
            toast.error('Failed to load bookings: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        try {
            const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('id', bookingId);

            if (error) throw error;

            toast.success("Booking cancelled successfully");
            fetchBookings();
        } catch (error: any) {
            console.error('Error cancelling booking:', error);
            toast.error("Failed to cancel booking");
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">My Dashboard</h1>
                        <p className="text-muted-foreground">Manage your lessons and learning journey</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <User className="h-4 w-4 mr-2" />
                            Edit Profile
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="upcoming" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="upcoming">Upcoming Lessons</TabsTrigger>
                        <TabsTrigger value="past">Past Lessons</TabsTrigger>
                        <TabsTrigger value="messages">Messages</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-4">
                        {loading ? (
                            <Loading />
                        ) : upcomingLessons.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    No upcoming lessons. Browse tutors to book a session.
                                </CardContent>
                            </Card>
                        ) : (
                            upcomingLessons.map((lesson) => (
                                <Card key={lesson.id}>
                                    <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant={lesson.status === 'BOOKED' ? 'default' : 'secondary'}>
                                                    {lesson.status}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">{lesson.location}</span>
                                            </div>
                                            <h3 className="text-xl font-semibold mb-1">{lesson.subject}</h3>
                                            <p className="text-muted-foreground">with {lesson.tutors?.profiles?.full_name}</p>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                {format(new Date(lesson.start_time), 'MMM d, yyyy')}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-primary" />
                                                {format(new Date(lesson.start_time), 'h:mm a')}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 w-full md:w-auto">
                                            {lesson.location === 'online' && (
                                                <Button className="flex-1 md:flex-none">
                                                    <Video className="h-4 w-4 mr-2" />
                                                    Join Class
                                                </Button>
                                            )}
                                            <Button variant="outline" className="flex-1 md:flex-none">
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Chat
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="flex-1 md:flex-none"
                                                onClick={() => handleCancelBooking(lesson.booking_id)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="past">
                        <div className="grid gap-4">
                            {loading ? (
                                <Loading />
                            ) : pastLessons.length === 0 ? (
                                <Card>
                                    <CardContent className="p-6 text-center text-muted-foreground">
                                        No past lessons.
                                    </CardContent>
                                </Card>
                            ) : (
                                pastLessons.map((lesson) => {
                                    const hasReviewed = lesson.reviews && lesson.reviews.length > 0;

                                    return (
                                        <Card key={lesson.id}>
                                            <CardContent className="p-6 flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold">{lesson.subject}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        with {lesson.tutors?.profiles?.full_name} • {format(new Date(lesson.start_time), 'MMM d, yyyy')}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!hasReviewed && (
                                                        <ReviewDialog
                                                            sessionId={lesson.id}
                                                            tutorId={lesson.tutors?.id}
                                                            studentId={user?.id || ''}
                                                            tutorName={lesson.tutors?.profiles?.full_name || 'Tutor'}
                                                            onReviewSubmitted={fetchBookings}
                                                        />
                                                    )}
                                                    <Button variant="secondary" size="sm">Book Again</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="messages">
                        <Card>
                            <CardContent className="p-12 text-center text-muted-foreground">
                                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No new messages</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
            <Footer />
        </div>
    );
}
