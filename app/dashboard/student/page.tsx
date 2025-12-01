'use client'

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, MessageSquare, User, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";

export default function StudentDashboardPage() {
    const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
    const [pastLessons, setPastLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    tutors:tutor_id (
                        *,
                        profiles:id (full_name)
                    )
                `)
                .order('date', { ascending: true });

            if (error) throw error;

            const now = new Date();
            const upcoming: any[] = [];
            const past: any[] = [];

            if (data) {
                data.forEach(booking => {
                    const bookingDate = new Date(booking.date);
                    if (bookingDate >= now) {
                        upcoming.push(booking);
                    } else {
                        past.push(booking);
                    }
                });
            }

            setUpcomingLessons(upcoming);
            setPastLessons(past);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
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
                        <BookingModal
                            trigger={
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Book a Lesson
                                </Button>
                            }
                            onSuccess={fetchBookings}
                        />
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
                            <div>Loading...</div>
                        ) : upcomingLessons.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    No upcoming lessons.
                                </CardContent>
                            </Card>
                        ) : (
                            upcomingLessons.map((lesson) => (
                                <Card key={lesson.id}>
                                    <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant={lesson.status === 'confirmed' ? 'default' : 'secondary'}>
                                                    {lesson.status}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">{lesson.type}</span>
                                            </div>
                                            <h3 className="text-xl font-semibold mb-1">{lesson.subject}</h3>
                                            <p className="text-muted-foreground">with {lesson.tutors?.profiles?.full_name}</p>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                {lesson.date}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-primary" />
                                                {lesson.time}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 w-full md:w-auto">
                                            {lesson.type === 'online' && lesson.status === 'confirmed' && (
                                                <Button className="flex-1 md:flex-none">
                                                    <Video className="h-4 w-4 mr-2" />
                                                    Join Class
                                                </Button>
                                            )}
                                            <Button variant="outline" className="flex-1 md:flex-none">
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Chat
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
                                <div>Loading...</div>
                            ) : pastLessons.length === 0 ? (
                                <Card>
                                    <CardContent className="p-6 text-center text-muted-foreground">
                                        No past lessons.
                                    </CardContent>
                                </Card>
                            ) : (
                                pastLessons.map((lesson) => (
                                    <Card key={lesson.id}>
                                        <CardContent className="p-6 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold">{lesson.subject}</h3>
                                                <p className="text-sm text-muted-foreground">with {lesson.tutors?.profiles?.full_name} • {lesson.date}</p>
                                            </div>
                                            <Button variant="secondary" size="sm">Book Again</Button>
                                        </CardContent>
                                    </Card>
                                ))
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
