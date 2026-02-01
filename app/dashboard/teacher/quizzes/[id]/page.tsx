'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, User, Award, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function QuizResultsPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);

    useEffect(() => {
        if (user && id) {
            fetchData();
        }
    }, [user, id]);

    const fetchData = async () => {
        try {
            // Fetch quiz
            const { data: quizData, error: quizError } = await supabase
                .from('quizzes')
                .select('*')
                .eq('id', id)
                .single();

            if (quizError) throw quizError;
            setQuiz(quizData);

            // Fetch submissions
            const { data: subData, error: subError } = await supabase
                .from('quiz_submissions')
                .select('*, students:profiles!quiz_submissions_student_id_fkey(full_name, avatar_url)')
                .eq('quiz_id', id)
                .order('submitted_at', { ascending: false });

            if (subError) throw subError;
            setSubmissions(subData || []);

        } catch (error: any) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <h2 className="text-xl font-bold text-slate-800">Quiz Not Found</h2>
                <Button asChild variant="link" className="mt-4">
                    <Link href="/dashboard/teacher/quizzes">Return to Quizzes</Link>
                </Button>
            </div>
        );
    }

    const averageScore = submissions.length > 0
        ? submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / submissions.length
        : 0;

    const passRate = submissions.length > 0
        ? (submissions.filter(sub => (sub.score || 0) >= 70).length / submissions.length) * 100
        : 0;

    return (
        <div className="space-y-6 max-w-5xl">
            <Button asChild variant="ghost" className="pl-0">
                <Link href="/dashboard/teacher/quizzes" className="flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Quizzes
                </Link>
            </Button>

            {/* Quiz Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
                <p className="text-slate-500">
                    {quiz.questions.length} Questions
                    {quiz.time_limit_minutes && ` • ${quiz.time_limit_minutes} min time limit`}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Submissions</CardDescription>
                        <CardTitle className="text-3xl">{submissions.length}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Average Score</CardDescription>
                        <CardTitle className="text-3xl">{averageScore.toFixed(1)}%</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Pass Rate (≥70%)</CardDescription>
                        <CardTitle className="text-3xl">{passRate.toFixed(0)}%</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Submissions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                    {submissions.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No submissions yet
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {submissions.map((submission) => {
                                const score = submission.score || 0;
                                const passed = score >= 70;

                                return (
                                    <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0">
                                                {submission.students?.full_name?.[0] || <User className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <div className="font-medium">{submission.students?.full_name || "Unknown Student"}</div>
                                                <div className="text-xs text-slate-500">
                                                    Submitted {format(new Date(submission.submitted_at), 'MMM d, h:mm a')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className={`text-xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                                    {score.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {Object.keys(submission.answers || {}).length} / {quiz.questions.length} answered
                                                </div>
                                            </div>
                                            {passed ? (
                                                <CheckCircle className="h-6 w-6 text-green-600" />
                                            ) : (
                                                <XCircle className="h-6 w-6 text-red-600" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Question-by-Question Analysis */}
            {submissions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Question Analysis</CardTitle>
                        <CardDescription>See how students performed on each question</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {quiz.questions.map((question: any, qIdx: number) => {
                            const correctCount = submissions.filter(sub =>
                                sub.answers?.[qIdx] === question.correctAnswer
                            ).length;
                            const correctRate = submissions.length > 0
                                ? (correctCount / submissions.length) * 100
                                : 0;

                            return (
                                <div key={qIdx} className="p-4 border rounded-lg">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <p className="font-medium flex-1">
                                            {qIdx + 1}. {question.text}
                                        </p>
                                        <Badge variant={correctRate >= 70 ? "default" : "destructive"}>
                                            {correctRate.toFixed(0)}% correct
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        <span className="font-medium text-green-700">Correct Answer:</span> {question.options[question.correctAnswer]}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {correctCount} of {submissions.length} students answered correctly
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
