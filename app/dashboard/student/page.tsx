'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, BookOpen, BrainCircuit, TrendingUp, CheckCircle2, Award, ArrowRight, GraduationCap, Sparkles, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTutorContext } from "@/contexts/TutorContext";
import { toast } from "sonner";
import Image from "next/image";

interface ProgressStats {
    sessionsAttended: number;
    assignmentsCompleted: number;
    totalAssignments: number;
    assignmentAvgGrade: number | null;
    quizzesCompleted: number;
    quizAvgScore: number | null;
}

export default function StudentDashboardPage() {
    const { user } = useAuth();
    const { activeTutorId, activeTutor, linkedTutors, setActiveTutor, loading: tutorsLoading } = useTutorContext();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        assignments: [] as any[],
        quizzes: [] as any[],
        sessions: [] as any[],
    });
    const [progress, setProgress] = useState<ProgressStats>({
        sessionsAttended: 0,
        assignmentsCompleted: 0,
        totalAssignments: 0,
        assignmentAvgGrade: null,
        quizzesCompleted: 0,
        quizAvgScore: null,
    });

    useEffect(() => {
        if (user) {
            if (user?.user_metadata?.role === 'tutor') {
                window.location.href = '/dashboard/teacher';
                return;
            }
            if (activeTutorId) {
                fetchDashboardData();
            } else {
                setLoading(false);
            }
        }
    }, [user, activeTutorId]);

    const fetchDashboardData = async () => {
        if (!activeTutorId) return;
        try {
            setLoading(true);
            const tutorIds = [activeTutorId];

            const { data: aData } = await supabase
                .from('assignments')
                .select('*, tutors(profiles(full_name))')
                .in('tutor_id', tutorIds)
                .eq('status', 'PUBLISHED')
                .gt('due_date', new Date().toISOString())
                .order('due_date', { ascending: true })
                .limit(3);

            const { data: qData } = await supabase
                .from('quizzes')
                .select('*, tutors(profiles(full_name))')
                .in('tutor_id', tutorIds)
                .eq('status', 'PUBLISHED')
                .limit(3);

            const { data: sessionsData } = await supabase
                .from('bookings')
                .select(`
                    id,
                    sessions!inner(
                        id, subject, start_time, tutor_id,
                        tutors(profiles(full_name))
                    )
                `)
                .eq('student_id', user?.id)
                .gte('sessions.start_time', new Date().toISOString())
                .order('sessions(start_time)', { ascending: true })
                .limit(3);

            let filteredSessions = (sessionsData || []).filter((b: any) => {
                const session = Array.isArray(b.sessions) ? b.sessions[0] : b.sessions;
                return session?.tutor_id === activeTutorId;
            });

            setData({ assignments: aData || [], quizzes: qData || [], sessions: filteredSessions });

            // Progress stats
            const { count: sessionsCount } = await supabase
                .from('bookings')
                .select('id', { count: 'exact', head: true })
                .eq('student_id', user?.id);

            const { data: submissionsData } = await supabase
                .from('assignment_submissions')
                .select('grade')
                .eq('student_id', user?.id);

            const assignmentsCompleted = submissionsData?.length || 0;
            const gradedAssignments = submissionsData?.filter((a: any) => a.grade !== null) || [];
            const assignmentAvgGrade = gradedAssignments.length > 0
                ? gradedAssignments.reduce((sum: number, a: any) => sum + Number(a.grade), 0) / gradedAssignments.length
                : null;

            const { count: assignmentCount } = await supabase
                .from('assignments')
                .select('id', { count: 'exact', head: true })
                .in('tutor_id', tutorIds)
                .eq('status', 'PUBLISHED');

            const { data: quizSubmissions } = await supabase
                .from('quiz_submissions')
                .select('score')
                .eq('student_id', user?.id);

            const quizzesCompleted = quizSubmissions?.length || 0;
            const quizAvgScore = quizzesCompleted > 0
                ? quizSubmissions!.reduce((sum: number, q: any) => sum + Number(q.score || 0), 0) / quizzesCompleted
                : null;

            setProgress({
                sessionsAttended: sessionsCount || 0,
                assignmentsCompleted,
                totalAssignments: assignmentCount || 0,
                assignmentAvgGrade,
                quizzesCompleted,
                quizAvgScore,
            });
        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // ─── ACADEMY LOBBY ───
    if (!activeTutorId) {
        if (tutorsLoading) {
            return <div className="p-8 text-center text-slate-500">Loading your academies...</div>;
        }

        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center pt-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600 mb-4">
                        <Sparkles className="h-3.5 w-3.5" />
                        Your Learning Space
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">My Academies</h1>
                    <p className="text-slate-500 mt-2">
                        {linkedTutors.length > 0 ? 'Select an academy to enter' : 'Join a class to get started'}
                    </p>
                </div>

                {linkedTutors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {linkedTutors.map((item) => {
                            const tutorName = item.tutor?.profiles?.full_name || 'Academy';
                            const avatarUrl = item.tutor?.profiles?.avatar_url;
                            const brandColor = item.tutor?.brand_color || '#3b82f6';
                            const academyName = item.tutor?.academy_name || `${tutorName}'s Academy`;
                            const subject = item.tutor?.subjects?.[0];

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTutor(item.tutor_id)}
                                    className="text-left group relative overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                                >
                                    <div
                                        className="h-24 relative overflow-hidden"
                                        style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}bb 100%)` }}
                                    >
                                        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-20 bg-white" />
                                        <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full opacity-15 bg-white" />
                                    </div>
                                    <div className="p-5 pt-0 -mt-8 relative">
                                        <div className="mb-3">
                                            <div className="h-14 w-14 rounded-xl overflow-hidden relative bg-white shadow-md border-2 border-white">
                                                {avatarUrl ? (
                                                    <Image src={avatarUrl} alt={tutorName} fill className="object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: brandColor }}>
                                                        {academyName[0]}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-slate-700">{academyName}</h3>
                                        <p className="text-sm text-slate-500 mb-3">{tutorName}{subject ? ` · ${subject}` : ''}</p>
                                        <div className="flex items-center gap-1.5 text-sm font-medium transition-all group-hover:gap-2.5" style={{ color: brandColor }}>
                                            Enter Academy <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="border-dashed border-2">
                        <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                            <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                <GraduationCap className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No academies yet</h3>
                            <p className="text-slate-500 max-w-sm mb-6">Ask your tutor for a join link to get started.</p>
                        </CardContent>
                    </Card>
                )}

                <p className="text-center text-xs text-slate-400">
                    Powered by <Link href="/" className="text-slate-500 hover:text-slate-700 font-medium">TutorHub</Link>
                </p>
            </div>
        );
    }

    // ─── BRANDED ACADEMY HOME ───
    const brandColor = activeTutor?.tutor?.brand_color || '#3b82f6';
    const academyName = activeTutor?.tutor?.academy_name || activeTutor?.tutor?.profiles?.full_name || 'Academy';
    const welcomeMessage = activeTutor?.tutor?.welcome_message;
    const tutorName = activeTutor?.tutor?.profiles?.full_name;
    const avatarUrl = activeTutor?.tutor?.profiles?.avatar_url;

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading...</div>;
    }

    const hasTasks = data.assignments.length > 0 || data.quizzes.length > 0 || data.sessions.length > 0;
    const totalPending = data.assignments.length + data.quizzes.length;

    return (
        <div className="space-y-8">
            {/* Hero Welcome Section */}
            <div
                className="relative overflow-hidden rounded-2xl"
                style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 50%, ${brandColor}88 100%)` }}
            >
                {/* Decorative shapes */}
                <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-10 bg-white" />
                <div className="absolute top-1/2 -left-8 h-24 w-24 rounded-full opacity-10 bg-white" />
                <div className="absolute -bottom-6 right-1/3 h-20 w-20 rounded-full opacity-8 bg-white" />

                <div className="relative p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6">
                    {/* Tutor Avatar */}
                    <div className="flex-shrink-0">
                        <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl overflow-hidden relative bg-white/20 backdrop-blur-sm shadow-xl border-2 border-white/25">
                            {avatarUrl ? (
                                <Image src={avatarUrl} alt={academyName} fill className="object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-white">
                                    {academyName[0]}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Welcome Text */}
                    <div className="flex-1">
                        <p className="text-white/70 text-sm font-medium mb-1">Welcome back to</p>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{academyName}</h1>
                        {welcomeMessage && (
                            <p className="text-white/80 text-sm md:text-base max-w-lg leading-relaxed">
                                {welcomeMessage}
                            </p>
                        )}
                        {totalPending > 0 && (
                            <div className="mt-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white/90">
                                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                {totalPending} item{totalPending > 1 ? 's' : ''} need{totalPending === 1 ? 's' : ''} your attention
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Assignments Card */}
                <Link href="/dashboard/student/assignments" className="group">
                    <div className="bg-white rounded-2xl border p-6 hover:shadow-md transition-all duration-300 h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                                <BookOpen className="h-6 w-6" />
                            </div>
                            {data.assignments.length > 0 && (
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: brandColor }}>
                                    {data.assignments.length} pending
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">Assignments</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            {data.assignments.length > 0
                                ? `Next due: ${format(new Date(data.assignments[0].due_date), 'MMM d')}`
                                : 'No pending assignments'}
                        </p>
                        <span className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: brandColor }}>
                            View all <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                    </div>
                </Link>

                {/* Quizzes Card */}
                <Link href="/dashboard/student/quizzes" className="group">
                    <div className="bg-white rounded-2xl border p-6 hover:shadow-md transition-all duration-300 h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                                <BrainCircuit className="h-6 w-6" />
                            </div>
                            {data.quizzes.length > 0 && (
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: brandColor }}>
                                    {data.quizzes.length} available
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">Quizzes</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            {data.quizzes.length > 0 ? `${data.quizzes.length} quiz${data.quizzes.length > 1 ? 'zes' : ''} available` : 'No quizzes available'}
                        </p>
                        <span className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: brandColor }}>
                            View all <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                    </div>
                </Link>

                {/* Sessions Card */}
                <Link href="/dashboard/student/sessions" className="group">
                    <div className="bg-white rounded-2xl border p-6 hover:shadow-md transition-all duration-300 h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                                <Calendar className="h-6 w-6" />
                            </div>
                            {data.sessions.length > 0 && (
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: brandColor }}>
                                    upcoming
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">Sessions</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            {data.sessions.length > 0
                                ? format(new Date(data.sessions[0].sessions.start_time), 'EEEE, MMM d')
                                : 'No upcoming sessions'}
                        </p>
                        <span className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: brandColor }}>
                            View all <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                    </div>
                </Link>
            </div>

            {/* Two-column layout: Progress + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Progress Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border p-6 h-full">
                        <div className="flex items-center gap-2 mb-6">
                            <Award className="h-5 w-5" style={{ color: brandColor }} />
                            <h2 className="text-lg font-bold text-slate-900">Your Progress</h2>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-slate-600">Sessions Attended</span>
                                    <span className="font-bold text-slate-900">{progress.sessionsAttended}</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            backgroundColor: brandColor,
                                            width: `${Math.min((progress.sessionsAttended / Math.max(progress.sessionsAttended + 5, 10)) * 100, 100)}%`
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-slate-600">Assignments</span>
                                    <span className="font-bold text-slate-900">
                                        {progress.assignmentsCompleted}/{progress.totalAssignments}
                                        {progress.assignmentAvgGrade !== null && (
                                            <span className="font-normal text-slate-400 ml-1">({Math.round(progress.assignmentAvgGrade)}%)</span>
                                        )}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            backgroundColor: brandColor,
                                            width: progress.totalAssignments > 0
                                                ? `${(progress.assignmentsCompleted / progress.totalAssignments) * 100}%`
                                                : '0%'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-slate-600">Quizzes Completed</span>
                                    <span className="font-bold text-slate-900">
                                        {progress.quizzesCompleted}
                                        {progress.quizAvgScore !== null && (
                                            <span className="font-normal text-slate-400 ml-1">({Math.round(progress.quizAvgScore)}%)</span>
                                        )}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            backgroundColor: brandColor,
                                            width: `${Math.min((progress.quizzesCompleted / Math.max(progress.quizzesCompleted + 3, 5)) * 100, 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border p-6 h-full">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock className="h-5 w-5" style={{ color: brandColor }} />
                            <h2 className="text-lg font-bold text-slate-900">What's Next</h2>
                        </div>

                        {!hasTasks ? (
                            <div className="py-8 text-center">
                                <div className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${brandColor}10` }}>
                                    <CheckCircle2 className="h-7 w-7" style={{ color: brandColor }} />
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-1">All caught up!</h3>
                                <p className="text-sm text-slate-500">No pending tasks from {academyName}.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.assignments.map((a: any) => (
                                    <Link key={a.id} href={`/dashboard/student/assignments/${a.id}`}>
                                        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                                            <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-slate-900 truncate text-sm">{a.title}</h4>
                                                <p className="text-xs text-slate-500">Due {format(new Date(a.due_date), 'MMM d, h:mm a')}</p>
                                            </div>
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                                                Submit
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                                {data.quizzes.map((q: any) => (
                                    <Link key={q.id} href={`/dashboard/student/quizzes/${q.id}`}>
                                        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                                            <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                                                <BrainCircuit className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-slate-900 truncate text-sm">{q.title}</h4>
                                                <p className="text-xs text-slate-500">Quiz available</p>
                                            </div>
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                                                Start
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                                {data.sessions.map((b: any) => (
                                    <div key={b.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/50">
                                        <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-slate-900 truncate text-sm">{b.sessions?.subject}</h4>
                                            <p className="text-xs text-slate-500">{format(new Date(b.sessions?.start_time), 'EEEE, MMM d @ h:mm a')}</p>
                                        </div>
                                        <span className="text-xs font-medium text-slate-500 bg-white border px-2.5 py-1 rounded-full">
                                            Upcoming
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
