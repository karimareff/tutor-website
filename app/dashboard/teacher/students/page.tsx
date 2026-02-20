'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, Loader2, User, Calendar, BookOpen, BrainCircuit, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface StudentProgress {
    id: string;
    student: {
        id: string;
        full_name: string;
        avatar_url: string | null;
    };
    status: string;
    created_at: string;
    sessionsAttended: number;
    assignmentsCompleted: number;
    assignmentAvgGrade: number | null;
    quizzesCompleted: number;
    quizAvgScore: number | null;
}

export default function StudentsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<StudentProgress[]>([]);
    const [tutorSlug, setTutorSlug] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch tutor slug
            const { data: tutorData } = await supabase
                .from('tutors')
                .select('slug')
                .eq('id', user?.id)
                .single();

            if (tutorData) {
                setTutorSlug(tutorData.slug);
            }

            // Fetch students
            const { data: studentsData, error } = await supabase
                .from('student_tutors')
                .select(`
                    *,
                    student:profiles!student_tutors_student_id_fkey (
                        id, full_name, avatar_url
                    )
                `)
                .eq('tutor_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch progress for each student
            const studentsWithProgress: StudentProgress[] = await Promise.all(
                (studentsData || []).map(async (item: any) => {
                    const studentId = item.student?.id;

                    // Sessions attended
                    const { count: sessionsCount } = await supabase
                        .from('bookings')
                        .select('id, sessions!inner(tutor_id)', { count: 'exact', head: true })
                        .eq('student_id', studentId)
                        .eq('sessions.tutor_id', user?.id);

                    // Assignment submissions
                    const { data: assignmentData } = await supabase
                        .from('assignment_submissions')
                        .select('grade, assignments!inner(tutor_id)')
                        .eq('student_id', studentId)
                        .eq('assignments.tutor_id', user?.id);

                    const assignmentsCompleted = assignmentData?.length || 0;
                    const gradedAssignments = assignmentData?.filter((a: any) => a.grade !== null) || [];
                    const assignmentAvgGrade = gradedAssignments.length > 0
                        ? gradedAssignments.reduce((sum: number, a: any) => sum + Number(a.grade), 0) / gradedAssignments.length
                        : null;

                    // Quiz submissions
                    const { data: quizData } = await supabase
                        .from('quiz_submissions')
                        .select('score, quizzes!inner(tutor_id)')
                        .eq('student_id', studentId)
                        .eq('quizzes.tutor_id', user?.id);

                    const quizzesCompleted = quizData?.length || 0;
                    const quizAvgScore = quizzesCompleted > 0
                        ? quizData!.reduce((sum: number, q: any) => sum + Number(q.score || 0), 0) / quizzesCompleted
                        : null;

                    return {
                        ...item,
                        sessionsAttended: sessionsCount || 0,
                        assignmentsCompleted,
                        assignmentAvgGrade,
                        quizzesCompleted,
                        quizAvgScore,
                    };
                })
            );

            setStudents(studentsWithProgress);
        } catch (error: any) {
            console.error("Error fetching students:", error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Students</h1>
                    <p className="text-slate-500">View student progress and manage your roster</p>
                </div>
                <Button onClick={copyJoinLink} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copy Invite Link
                </Button>
            </div>

            {/* Invite Banner */}
            {tutorSlug && (
                <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">Invite Students to Your Class</h3>
                            <p className="text-sm text-blue-100">Share this link with your students to join your roster.</p>
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded text-sm font-mono">
                            {typeof window !== 'undefined' ? window.location.host : ''}/join/{tutorSlug}
                        </div>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : students.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="py-12 text-center">
                        <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <h3 className="font-semibold text-slate-900 mb-1">No Students Yet</h3>
                        <p className="text-sm text-slate-500 mb-4">Share your invite link to start building your class roster.</p>
                        <Button onClick={copyJoinLink} className="gap-2">
                            <Copy className="h-4 w-4" />
                            Copy Invite Link
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {students.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                {/* Student Info */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
                                        {item.student?.full_name?.[0] || <User className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900">
                                            {item.student?.full_name || 'Unknown Student'}
                                        </h3>
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <Calendar className="h-3 w-3" />
                                            Joined {format(new Date(item.created_at), 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                    <Badge variant="outline">{item.status}</Badge>
                                </div>

                                {/* Progress Stats */}
                                <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                                    {/* Sessions */}
                                    <div className="text-center">
                                        <div className="flex items-center justify-center h-8 w-8 mx-auto mb-1 bg-blue-100 text-blue-600 rounded-lg">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div className="text-lg font-bold text-slate-900">{item.sessionsAttended}</div>
                                        <div className="text-xs text-slate-500">Sessions</div>
                                    </div>

                                    {/* Assignments */}
                                    <div className="text-center">
                                        <div className="flex items-center justify-center h-8 w-8 mx-auto mb-1 bg-orange-100 text-orange-600 rounded-lg">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <div className="text-lg font-bold text-slate-900">
                                            {item.assignmentsCompleted}
                                            {item.assignmentAvgGrade !== null && (
                                                <span className="text-xs font-normal text-slate-500 ml-1">
                                                    ({Math.round(item.assignmentAvgGrade)}%)
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500">Assignments</div>
                                    </div>

                                    {/* Quizzes */}
                                    <div className="text-center">
                                        <div className="flex items-center justify-center h-8 w-8 mx-auto mb-1 bg-emerald-100 text-emerald-600 rounded-lg">
                                            <BrainCircuit className="h-4 w-4" />
                                        </div>
                                        <div className="text-lg font-bold text-slate-900">
                                            {item.quizzesCompleted}
                                            {item.quizAvgScore !== null && (
                                                <span className="text-xs font-normal text-slate-500 ml-1">
                                                    ({Math.round(item.quizAvgScore)}%)
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500">Quizzes</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

