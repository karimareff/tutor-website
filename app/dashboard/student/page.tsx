'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, BookOpen, BrainCircuit, TrendingUp, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function StudentDashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        assignments: [] as any[],
        quizzes: [] as any[],
        sessions: [] as any[],
        tutors: [] as any[],
    });

    useEffect(() => {
        if (user) {
            if (user?.user_metadata?.role === 'tutor') {
                window.location.href = '/dashboard/teacher';
                return;
            }
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            // Fetch my tutors
            const { data: tutorsData } = await supabase
                .from('student_tutors')
                .select(`
                    tutor_id,
                    tutors(
                        id,
                        profiles(full_name, avatar_url)
                    )
                `)
                .eq('student_id', user?.id)
                .limit(4);

            const tutorIds = tutorsData?.map((t: any) => t.tutor_id) || [];

            // Fetch pending assignments (top 3 due soon)
            let assignmentsData: any[] = [];
            if (tutorIds.length > 0) {
                const { data: aData } = await supabase
                    .from('assignments')
                    .select('*, tutors(profiles(full_name))')
                    .in('tutor_id', tutorIds)
                    .eq('status', 'PUBLISHED')
                    .gt('due_date', new Date().toISOString())
                    .order('due_date', { ascending: true })
                    .limit(3);
                assignmentsData = aData || [];
            }

            // Fetch available quizzes (top 3)
            let quizzesData: any[] = [];
            if (tutorIds.length > 0) {
                const { data: qData } = await supabase
                    .from('quizzes')
                    .select('*, tutors(profiles(full_name))')
                    .in('tutor_id', tutorIds)
                    .eq('status', 'PUBLISHED')
                    .limit(3);
                quizzesData = qData || [];
            }

            // Fetch upcoming sessions (top 3)
            const { data: sessionsData } = await supabase
                .from('bookings')
                .select(`
                    id,
                    sessions!inner(
                        id,
                        subject,
                        start_time,
                        tutors(profiles(full_name))
                    )
                `)
                .eq('student_id', user?.id)
                .gte('sessions.start_time', new Date().toISOString())
                .order('sessions(start_time)', { ascending: true })
                .limit(3);

            setData({
                assignments: assignmentsData,
                quizzes: quizzesData,
                sessions: sessionsData || [],
                tutors: tutorsData || [],
            });

        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const actionCards = [
        {
            title: "Assignment Due",
            value: data.assignments.length > 0 ? `${data.assignments.length} Pending` : "No pending work",
            action: "Open Assignments",
            href: "/dashboard/student/assignments",
            icon: BookOpen,
            color: "bg-orange-100 text-orange-600",
            active: data.assignments.length > 0
        },
        {
            title: "Quiz Available",
            value: data.quizzes.length > 0 ? `${data.quizzes.length} Available` : "No quizzes",
            action: "Start Quiz",
            href: "/dashboard/student/quizzes",
            icon: BrainCircuit,
            color: "bg-emerald-100 text-emerald-600",
            active: data.quizzes.length > 0
        },
        {
            title: "Next Session",
            value: data.sessions.length > 0 ? format(new Date(data.sessions[0].sessions.start_time), 'MMM d, h:mm a') : "No session booked",
            action: data.sessions.length > 0 ? "View Details" : "Book Session",
            href: data.sessions.length > 0 ? "/dashboard/student/sessions" : "/dashboard/student/tutors",
            icon: Calendar,
            color: "bg-blue-100 text-blue-600",
            active: data.sessions.length > 0
        },
        {
            title: "My Tutors",
            value: data.tutors.length > 0 ? "Go to Tutors" : "No Tutors",
            action: data.tutors.length > 0 ? "View All" : "Find Tutors",
            href: "/dashboard/student/tutors",
            icon: Users,
            color: "bg-purple-100 text-purple-600",
            active: true
        }
    ];

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
    }

    const hasTasks = data.assignments.length > 0 || data.quizzes.length > 0 || data.sessions.length > 0;

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500">What would you like to do today?</p>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {actionCards.map((card) => (
                    <Link key={card.title} href={card.href} className="block group">
                        <Card className="h-full border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-5 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-lg ${card.color}`}>
                                        <card.icon className="h-5 w-5" />
                                    </div>
                                    {card.active && (
                                        <span className="flex h-2 w-2 rounded-full bg-red-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">
                                        {card.value}
                                    </h3>
                                    <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                                        {card.action}
                                        <TrendingUp className="h-3 w-3" />
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Today's Tasks */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-slate-500" />
                    Today's Tasks
                </h2>

                {!hasTasks ? (
                    <Card className="bg-slate-50 border-dashed border-2">
                        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-emerald-500">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">You're all caught up!</h3>
                            <p className="text-slate-500 max-w-sm mt-1">
                                No pending assignments, quizzes, or sessions for today.
                                Ask your tutor for new work or book a session.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3">
                        {/* Due Assignments */}
                        {data.assignments.map((assignment: any) => (
                            <Link key={assignment.id} href={`/dashboard/student/assignments/${assignment.id}`}>
                                <Card className="hover:border-blue-300 transition-colors cursor-pointer">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-slate-900 truncate">{assignment.title}</h4>
                                            <p className="text-sm text-slate-500 truncate">
                                                Due {format(new Date(assignment.due_date), 'MMM d, h:mm a')} • {assignment.tutors?.profiles?.full_name}
                                            </p>
                                        </div>
                                        <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">
                                            Complete
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}

                        {/* Available Quizzes */}
                        {data.quizzes.map((quiz: any) => (
                            <Link key={quiz.id} href={`/dashboard/student/quizzes/${quiz.id}`}>
                                <Card className="hover:border-blue-300 transition-colors cursor-pointer">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <BrainCircuit className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-slate-900 truncate">{quiz.title}</h4>
                                            <p className="text-sm text-slate-500 truncate">
                                                Quiz Available • {quiz.tutors?.profiles?.full_name}
                                            </p>
                                        </div>
                                        <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">
                                            Start Quiz
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}

                        {/* Upcoming Sessions */}
                        {data.sessions.map((booking: any) => (
                            <div key={booking.id} className="block">
                                <Card className="bg-slate-50 border-slate-200">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-slate-900 truncate">Session: {booking.sessions?.subject}</h4>
                                            <p className="text-sm text-slate-500 truncate">
                                                {format(new Date(booking.sessions?.start_time), 'EEEE, MMM d @ h:mm a')} • {booking.sessions?.tutors?.profiles?.full_name}
                                            </p>
                                        </div>
                                        <Link href="/dashboard/student/sessions">
                                            <div className="text-sm font-medium text-slate-600 bg-white border px-3 py-1 rounded-full whitespace-nowrap hover:bg-slate-50">
                                                View
                                            </div>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
