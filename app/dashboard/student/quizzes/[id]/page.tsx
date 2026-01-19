'use client'

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle, XCircle, Timer } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default function StudentQuizPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Quiz State
    const [answers, setAnswers] = useState<Record<number, number>>({}); // Question Index -> Option Index
    const [submittedResult, setSubmittedResult] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Initial Load
    useEffect(() => {
        if (user && id) {
            fetchQuizAndSubmission();
        }
    }, [user, id]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft === null || submittedResult) return;

        if (timeLeft <= 0) {
            handleSubmit(true); // Auto submit on timeout
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submittedResult]);

    const fetchQuizAndSubmission = async () => {
        try {
            setLoading(true);

            // 1. Fetch Quiz
            const { data: quizData, error: quizError } = await supabase
                .from('quizzes')
                .select('*, tutors(profiles(full_name))')
                .eq('id', id)
                .single();

            if (quizError) throw quizError;
            setQuiz(quizData);

            // 2. Check for existing submission
            const { data: subData } = await supabase
                .from('quiz_submissions')
                .select('*')
                .eq('quiz_id', id)
                .eq('student_id', user?.id)
                .single();

            if (subData) {
                setSubmittedResult(subData);
            } else {
                // Initialize Timer if not submitted
                if (quizData.time_limit_minutes) {
                    setTimeLeft(quizData.time_limit_minutes * 60);
                }
            }

        } catch (error: any) {
            console.error("Error fetching quiz:", error);
            toast.error("Failed to load quiz");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (questionIdx: number, optionIdx: number) => {
        if (submittedResult) return; // Prevent changing after submit
        setAnswers(prev => ({
            ...prev,
            [questionIdx]: optionIdx
        }));
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (submittedResult) return;

        try {
            setSubmitting(true);

            // Calculate Score (Client-side grading for MVP)
            let correctCount = 0;
            const totalQuestions = quiz.questions.length;

            quiz.questions.forEach((q: any, idx: number) => {
                const studentAnswer = answers[idx];
                if (studentAnswer === q.correctAnswer) {
                    correctCount++;
                }
            });

            const score = Math.round((correctCount / totalQuestions) * 100);

            // Save to DB
            const { data, error } = await supabase
                .from('quiz_submissions')
                .insert({
                    quiz_id: quiz.id,
                    student_id: user?.id,
                    answers: answers,
                    score: score,
                    submitted_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            setSubmittedResult(data);
            if (autoSubmit) {
                toast.info("Time's up! Quiz submitted automatically.");
            } else {
                toast.success(`Quiz submitted! Your score: ${score}%`);
            }

        } catch (error: any) {
            console.error("Error submitting quiz:", error);
            toast.error("Failed to submit quiz");
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
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
                <Button asChild variant="link" className="mt-4"><Link href="/dashboard/student">Return to Dashboard</Link></Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <Button asChild variant="ghost" className="pl-0 hover:bg-transparent">
                <Link href="/dashboard/student" className="flex items-center text-slate-500 hover:text-slate-800">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Link>
            </Button>

            <div className="flex flex-col gap-6">
                {/* Header Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl mb-1">{quiz.title}</CardTitle>
                                <CardDescription>
                                    By {quiz.tutors?.profiles?.full_name} • {quiz.questions.length} Questions
                                </CardDescription>
                            </div>
                            {submittedResult ? (
                                <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${submittedResult.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {submittedResult.score}%
                                </div>
                            ) : (
                                timeLeft !== null && (
                                    <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
                                        <Timer className="h-5 w-5" />
                                        {formatTime(timeLeft)}
                                    </div>
                                )
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Progress value={submittedResult ? 100 : (Object.keys(answers).length / quiz.questions.length) * 100} className="h-2" />
                    </CardContent>
                </Card>

                {/* Questions */}
                <div className="space-y-6">
                    {quiz.questions.map((q: any, qIdx: number) => {
                        const userAnswer = submittedResult ? submittedResult.answers[qIdx] : answers[qIdx];
                        const isCorrect = submittedResult && userAnswer === q.correctAnswer;
                        const isWrong = submittedResult && userAnswer !== q.correctAnswer;

                        return (
                            <Card key={qIdx} className={`transition-all ${isCorrect ? 'border-green-200 bg-green-50/30' : isWrong ? 'border-red-200 bg-red-50/30' : ''}`}>
                                <CardHeader className="pb-2">
                                    <h3 className="text-lg font-medium flex gap-2">
                                        <span className="text-slate-400">#{qIdx + 1}</span>
                                        {q.text}
                                    </h3>
                                </CardHeader>
                                <CardContent className="grid gap-3 pt-2">
                                    {q.options.map((opt: string, optIdx: number) => {
                                        const isSelected = userAnswer === optIdx;
                                        const isActualCorrect = submittedResult && q.correctAnswer === optIdx;

                                        let btnClass = "justify-start h-auto py-3 px-4 text-left font-normal border-2 hover:bg-slate-50";
                                        if (isSelected) {
                                            btnClass += " border-primary bg-primary/5 text-primary";
                                        } else {
                                            btnClass += " border-transparent bg-white shadow-sm";
                                        }

                                        if (submittedResult) {
                                            if (isActualCorrect) btnClass = "justify-start h-auto py-3 px-4 text-left font-normal border-2 border-green-500 bg-green-100 text-green-900";
                                            else if (isSelected && !isActualCorrect) btnClass = "justify-start h-auto py-3 px-4 text-left font-normal border-2 border-red-500 bg-red-100 text-red-900";
                                            else btnClass = "justify-start h-auto py-3 px-4 text-left font-normal border-2 border-transparent bg-white opacity-60";
                                        }

                                        return (
                                            <Button
                                                key={optIdx}
                                                variant="ghost"
                                                className={btnClass}
                                                onClick={() => handleSelectOption(qIdx, optIdx)}
                                                disabled={!!submittedResult}
                                            >
                                                <div className="flex items-center w-full">
                                                    <div className={`h-6 w-6 rounded-full border flex items-center justify-center mr-3 text-xs ${isSelected || isActualCorrect ? 'border-current font-bold' : 'border-slate-300 text-slate-400'}`}>
                                                        {String.fromCharCode(65 + optIdx)}
                                                    </div>
                                                    {opt}
                                                    {isActualCorrect && <CheckCircle className="ml-auto h-5 w-5 text-green-600" />}
                                                    {submittedResult && isSelected && !isActualCorrect && <XCircle className="ml-auto h-5 w-5 text-red-500" />}
                                                </div>
                                            </Button>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Submit Button */}
                {!submittedResult && (
                    <Card className="sticky bottom-4 shadow-xl border-t-4 border-t-primary">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="text-sm text-slate-500">
                                Answered {Object.keys(answers).length} of {quiz.questions.length} questions
                            </div>
                            <Button size="lg" onClick={() => handleSubmit(false)} disabled={submitting}>
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Submit Quiz"}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
