'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus, Calendar, Clock, FileText, BrainCircuit, Users,
    Copy, ArrowRight, CheckCircle2, Sparkles, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, isToday, startOfDay, endOfDay } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TeacherDashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [tutorSlug, setTutorSlug] = useState<string | null>(null);
    const [tutorSubjects, setTutorSubjects] = useState<string[]>([]);

    // Action Data
    const [todaySessions, setTodaySessions] = useState<any[]>([]);
    const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
    const [dueTodayAssignments, setDueTodayAssignments] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [studentsCount, setStudentsCount] = useState(0);
    const [inactiveStudentsCount, setInactiveStudentsCount] = useState(0);

    // Quick Create Session Dialog
    const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
    const [newSession, setNewSession] = useState({
        subject: "",
        price: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "online"
    });

    useEffect(() => {
        if (user) {
            if (user?.user_metadata?.role === 'student') {
                window.location.href = '/dashboard/student';
                return;
            }
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const today = new Date();
            const todayStart = startOfDay(today).toISOString();
            const todayEnd = endOfDay(today).toISOString();

            // Fetch tutor profile
            const { data: tutorData } = await supabase
                .from('tutors')
                .select('slug, subjects')
                .eq('id', user?.id)
                .single();

            if (tutorData) {
                setTutorSlug(tutorData.slug);
                setTutorSubjects(tutorData.subjects || []);
            }

            // 1. Today's Sessions
            const { data: sessionsData } = await supabase
                .from('sessions')
                .select(`
                    id, subject, start_time, end_time, location, status,
                    bookings (
                        id,
                        students:profiles!bookings_student_id_fkey (full_name)
                    )
                `)
                .eq('tutor_id', user?.id)
                .gte('start_time', todayStart)
                .lte('start_time', todayEnd)
                .order('start_time', { ascending: true });

            setTodaySessions(sessionsData || []);

            // 2. Pending Submissions (needs grading)
            const { data: submissionsData } = await supabase
                .from('assignment_submissions')
                .select(`
                    id, submitted_at, grade,
                    assignments!inner(id, title, tutor_id),
                    students:profiles!assignment_submissions_student_id_fkey(full_name)
                `)
                .eq('assignments.tutor_id', user?.id)
                .is('grade', null)
                .order('submitted_at', { ascending: false })
                .limit(10);

            setPendingSubmissions(submissionsData || []);

            // 3. Assignments Due Today
            const { data: dueTodayData } = await supabase
                .from('assignments')
                .select('id, title, due_date')
                .eq('tutor_id', user?.id)
                .gte('due_date', todayStart)
                .lte('due_date', todayEnd);

            setDueTodayAssignments(dueTodayData || []);

            // 4. Students count
            const { count: studentsTotal } = await supabase
                .from('student_tutors')
                .select('*', { count: 'exact', head: true })
                .eq('tutor_id', user?.id);

            setStudentsCount(studentsTotal || 0);

            // 5. Recent Activity (bookings, submissions)
            const activities: any[] = [];

            // Recent bookings
            const { data: recentBookings } = await supabase
                .from('bookings')
                .select(`
                    id, created_at,
                    sessions!inner(subject, tutor_id),
                    students:profiles!bookings_student_id_fkey(full_name)
                `)
                .eq('sessions.tutor_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(5);

            recentBookings?.forEach(b => {
                const students = b.students as any;
                const sessions = b.sessions as any;
                const studentName = Array.isArray(students) ? students[0]?.full_name : students?.full_name;
                const sessionSubject = Array.isArray(sessions) ? sessions[0]?.subject : sessions?.subject;

                activities.push({
                    id: `booking-${b.id}`,
                    type: 'booking',
                    message: `${studentName || 'A student'} booked ${sessionSubject}`,
                    time: b.created_at,
                    link: '/dashboard/teacher/sessions'
                });
            });

            // Recent submissions
            submissionsData?.slice(0, 5).forEach(s => {
                const students = s.students as any;
                const assignments = s.assignments as any;

                const studentName = Array.isArray(students) ? students[0]?.full_name : students?.full_name;
                const assignmentTitle = Array.isArray(assignments) ? assignments[0]?.title : assignments?.title;
                const assignmentId = Array.isArray(assignments) ? assignments[0]?.id : assignments?.id;

                activities.push({
                    id: `submission-${s.id}`,
                    type: 'submission',
                    message: `${studentName || 'A student'} submitted ${assignmentTitle}`,
                    time: s.submitted_at,
                    link: `/dashboard/teacher/assignments/${assignmentId}`
                });
            });

            // Sort by time
            activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
            setRecentActivity(activities.slice(0, 6));

        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async () => {
        try {
            if (!newSession.subject || !newSession.price || !newSession.date || !newSession.startTime || !newSession.endTime) {
                toast.error("Please fill in all fields");
                return;
            }

            const startDateTime = new Date(`${newSession.date}T${newSession.startTime}`);
            const endDateTime = new Date(`${newSession.date}T${newSession.endTime}`);

            const { error } = await supabase
                .from('sessions')
                .insert({
                    tutor_id: user?.id,
                    subject: newSession.subject,
                    price: parseInt(newSession.price),
                    location: newSession.location,
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                    status: 'AVAILABLE'
                });

            if (error) throw error;

            toast.success("Session created successfully");
            setIsSessionDialogOpen(false);
            fetchDashboardData();
            setNewSession({ subject: "", price: "", date: "", startTime: "", endTime: "", location: "online" });
        } catch (error: any) {
            toast.error(error.message || "Failed to create session");
        }
    };

    const copyJoinLink = () => {
        if (!tutorSlug) {
            toast.error("Set up your profile first to get a join link");
            return;
        }
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const link = `${origin}/join/${tutorSlug}`;
        navigator.clipboard.writeText(link);
        toast.success("Join link copied to clipboard!");
    };

    const hasTodayItems = todaySessions.length > 0 || dueTodayAssignments.length > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500">Welcome back! Here's what needs your attention.</p>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap gap-3 p-4 bg-white rounded-lg border shadow-sm">
                <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Session</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Subject</Label>
                                <Select value={newSession.subject} onValueChange={(val) => setNewSession({ ...newSession, subject: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                                    <SelectContent>{tutorSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Price (EGP)</Label>
                                <Input type="number" value={newSession.price} onChange={(e) => setNewSession({ ...newSession, price: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Date</Label>
                                <Input type="date" value={newSession.date} onChange={(e) => setNewSession({ ...newSession, date: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2"><Label>Start</Label><Input type="time" value={newSession.startTime} onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>End</Label><Input type="time" value={newSession.endTime} onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })} /></div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Location</Label>
                                <Select value={newSession.location} onValueChange={(val) => setNewSession({ ...newSession, location: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="online">Online</SelectItem><SelectItem value="in-person">In Person</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleCreateSession}>Create Session</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Button variant="outline" className="gap-2" asChild>
                    <Link href="/dashboard/teacher/assignments">
                        <Plus className="h-4 w-4" />
                        Add Assignment
                    </Link>
                </Button>

                <Button variant="outline" className="gap-2" asChild>
                    <Link href="/dashboard/teacher/quizzes">
                        <Plus className="h-4 w-4" />
                        Create Quiz
                    </Link>
                </Button>

                <Button variant="outline" className="gap-2" onClick={copyJoinLink}>
                    <Users className="h-4 w-4" />
                    Invite Students
                </Button>
            </div>

            {/* Today Section */}
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        Today
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-4 text-slate-400">Loading...</div>
                    ) : !hasTodayItems ? (
                        <div className="text-center py-6">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-slate-600 font-medium">You're all caught up today! 🎉</p>
                            <p className="text-sm text-slate-400 mt-1">No sessions or deadlines scheduled for today.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todaySessions.map(session => (
                                <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{session.subject}</p>
                                            <p className="text-sm text-slate-500">
                                                {format(new Date(session.start_time), 'h:mm a')}
                                                {session.bookings?.length > 0 && ` • ${session.bookings[0].students?.full_name}`}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={session.status === 'BOOKED' ? 'default' : 'outline'}>
                                        {session.status}
                                    </Badge>
                                </div>
                            ))}
                            {dueTodayAssignments.map(assignment => (
                                <div key={assignment.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{assignment.title}</p>
                                            <p className="text-sm text-slate-500">Due today at {format(new Date(assignment.due_date), 'h:mm a')}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/dashboard/teacher/assignments/${assignment.id}`}>
                                            View <ArrowRight className="h-3 w-3 ml-1" />
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Submissions to Review */}
                <Card className={`cursor-pointer hover:shadow-md transition-shadow ${pendingSubmissions.length > 0 ? 'border-orange-200 bg-orange-50/50' : ''}`}>
                    <Link href="/dashboard/teacher/assignments" className="block">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${pendingSubmissions.length > 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Submissions to Review</p>
                                        <p className="text-2xl font-bold text-slate-900">{pendingSubmissions.length}</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-400" />
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                {/* Students */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <Link href="/dashboard/teacher/students" className="block">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Your Students</p>
                                        <p className="text-2xl font-bold text-slate-900">{studentsCount}</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-400" />
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                {/* Quizzes */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <Link href="/dashboard/teacher/quizzes" className="block">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <BrainCircuit className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Manage Quizzes</p>
                                        <p className="text-lg font-medium text-slate-700">View All →</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-400" />
                            </div>
                        </CardContent>
                    </Link>
                </Card>
            </div>

            {/* Empty State for No Students */}
            {studentsCount === 0 && !loading && (
                <Card className="border-dashed border-2 bg-slate-50/50">
                    <CardContent className="py-8 text-center">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">No Students Yet</h3>
                        <p className="text-sm text-slate-500 mb-4">Share your invite link to start building your class roster.</p>
                        <Button onClick={copyJoinLink} className="gap-2">
                            <Copy className="h-4 w-4" />
                            Copy Invite Link
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Recent Activity */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-slate-500" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-4 text-slate-400">Loading...</div>
                    ) : recentActivity.length === 0 ? (
                        <div className="text-center py-6 text-slate-400">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No recent activity yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentActivity.map((activity) => (
                                <Link
                                    key={activity.id}
                                    href={activity.link}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activity.type === 'submission' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {activity.type === 'submission' ? <FileText className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-700">{activity.message}</p>
                                            <p className="text-xs text-slate-400">{format(new Date(activity.time), 'MMM d, h:mm a')}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
