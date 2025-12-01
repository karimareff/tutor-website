'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, DollarSign, Star, Check, X, MessageSquare, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function TeacherDashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        totalStudents: 0,
        averageRating: 5.0,
    });
    const [bookingRequests, setBookingRequests] = useState<any[]>([]);
    const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            // Fetch all bookings for this tutor
            const { data: bookings, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    profiles:student_id (full_name)
                `)
                .eq('tutor_id', user?.id)
                .order('date', { ascending: true });

            if (error) throw error;

            // Separate pending requests from confirmed/upcoming
            const pending: any[] = [];
            const upcoming: any[] = [];
            const now = new Date();

            if (bookings) {
                bookings.forEach(booking => {
                    if (booking.status === 'pending') {
                        pending.push(booking);
                    } else if (booking.status === 'confirmed' && new Date(booking.date) >= now) {
                        upcoming.push(booking);
                    }
                });
            }

            setBookingRequests(pending);
            setUpcomingLessons(upcoming);

            // Calculate stats
            const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
            const uniqueStudents = new Set(bookings?.map(b => b.student_id) || []);

            // Assuming 300 EGP per hour (you can fetch this from tutors table)
            const earnings = completedBookings.length * 300;

            setStats({
                totalEarnings: earnings,
                totalStudents: uniqueStudents.size,
                averageRating: 4.9, // This should come from a reviews table
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled') => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: action })
                .eq('id', bookingId);

            if (error) throw error;

            toast.success(`Booking ${action === 'confirmed' ? 'accepted' : 'declined'}`);
            fetchDashboardData(); // Refresh data
        } catch (error: any) {
            toast.error(error.message || 'Failed to update booking');
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
                        <p className="text-muted-foreground">Manage your schedule and students</p>
                    </div>
                    <Button variant="outline">
                        <User className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="messages">Messages</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            {STAT_CARDS.map((stat) => (
                                <Card key={stat.label}>
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Booking Requests</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {loading ? (
                                        <div>Loading...</div>
                                    ) : bookingRequests.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-4">No pending requests</p>
                                    ) : (
                                        bookingRequests.map((req) => (
                                            <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <h4 className="font-semibold">{req.profiles?.full_name || 'Unknown Student'}</h4>
                                                    <p className="text-sm text-muted-foreground">{req.subject}</p>
                                                    <div className="flex items-center gap-2 text-sm mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {req.date} • {req.time}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleBookingAction(req.id, 'confirmed')}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleBookingAction(req.id, 'cancelled')}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Upcoming Schedule</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {loading ? (
                                        <div>Loading...</div>
                                    ) : upcomingLessons.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-4">No upcoming lessons</p>
                                    ) : (
                                        upcomingLessons.map((lesson) => (
                                            <div key={lesson.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                                <div>
                                                    <h4 className="font-semibold">{lesson.profiles?.full_name || 'Unknown Student'}</h4>
                                                    <p className="text-sm text-muted-foreground">{lesson.subject}</p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant="outline" className="mb-1">{lesson.type || 'Online'}</Badge>
                                                    <p className="text-sm font-medium">{lesson.date} • {lesson.time}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
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
