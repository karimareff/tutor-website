'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Clock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function TakeQuizPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [submission, setSubmission] = useState<any>(null);

    useEffect(() => {
        if (user && id) {
            fetchQuiz();
        }
    }, [user, id]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || hasSubmitted) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev && prev <= 1) {
                    handleSubmit(); // Auto-submit when time runs out
                    return 0;
                }
                return prev ? prev - 1 : null;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, hasSubmitted]);

    const fetchQuiz = async () => {
        try {
            // Fetch quiz
            const { data: quizData, error: quizError } = await supabase
                .from('quizzes')
                .select('*, tutors(profiles(full_name))')
                .eq('id', id)
                .single();

            if (quizError) throw quizError;
            setQuiz(quizData);

            // Check if already submitted
            const { data: existingSubmission } = await supabase
                .from('quiz_submissions')
                .select('*')
                .eq('quiz_id', id)
                .eq('student_id', user?.id)
                .single();

            if (existingSubmission) {
                setHasSubmitted(true);
                setSubmission(existingSubmission);
            } else if (quizData.time_limit_minutes) {
                setTimeLeft(quizData.time_limit_minutes * 60);
            }

        } catch (error: any) {
            console.error("Error fetching quiz:", error);
            toast.error("Failed to load quiz");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;

        try {
            setSubmitting(true);

            // Calculate score
            let correctCount = 0;
            const totalQuestions = quiz.questions.length;

            quiz.questions.forEach((q: any, idx: number) => {
                if (answers[idx] === q.correctAnswer) {
                    correctCount++;
                }
            });

            const score = (correctCount / totalQuestions) * 100;

            // Save submission
            const { error } = await supabase
                .from('quiz_submissions')
                .insert({
                    quiz_id: id,
                    student_id: user?.id,
                    answers: answers,
                    score: score
                });

            if (error) throw error;

            setHasSubmitted(true);
            setSubmission({ answers, score });
            toast.success(`Quiz submitted! Score: ${score.toFixed(1)}%`);

        } catch (error: any) {
            toast.error(error.message || "Failed to submit quiz");
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                    <Link href="/dashboard/student/quizzes">Return to Quizzes</Link>
                </Button>
            </div>
        );
    }

    // Results view after submission
    if (hasSubmitted && submission) {
        const totalQuestions = quiz.questions.length;
        const correctCount = quiz.questions.filter((q: any, idx: number) =>
            submission.answers[idx] === q.correctAnswer
        ).length;

        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <Button asChild variant="ghost" className="pl-0">
                    <Link href="/dashboard/student/quizzes" className="flex items-center">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Quizzes
                    </Link>
                </Button>

                <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-2xl">Quiz Completed!</CardTitle>
                        <CardDescription className="text-center text-lg">
                            Your Score: <span className="font-bold text-green-700">{submission.score.toFixed(1)}%</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-slate-600">
                            You got {correctCount} out of {totalQuestions} questions correct
                        </p>
                    </CardContent>
                </Card>

                {/* Show answers review */}
                <Card>
                    <CardHeader>
                        <CardTitle>Review Your Answers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {quiz.questions.map((question: any, qIdx: number) => {
                            const studentAnswer = submission.answers[qIdx];
                            const isCorrect = studentAnswer === question.correctAnswer;

                            return (
                                <div key={qIdx} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {isCorrect ? <CheckCircle className="h-4 w-4 text-white" /> : <AlertCircle className="h-4 w-4 text-white" />}
                                        </div>
                                        <p className="font-medium text-slate-900">
                                            {qIdx + 1}. {question.text}
                                        </p>
                                    </div>
                                    <div className="ml-9 space-y-2">
                                        {question.options.map((option: string, oIdx: number) => {
                                            const isStudentAnswer = studentAnswer === oIdx;
                                            const isCorrectAnswer = question.correctAnswer === oIdx;

                                            return (
                                                <div
                                                    key={oIdx}
                                                    className={`p-2 rounded ${isCorrectAnswer ? 'bg-green-100 font-medium' :
                                                            isStudentAnswer ? 'bg-red-100' : ''
                                                        }`}
                                                >
                                                    {option}
                                                    {isCorrectAnswer && <span className="ml-2 text-green-700 text-sm">✓ Correct Answer</span>}
                                                    {isStudentAnswer && !isCorrectAnswer && <span className="ml-2 text-red-700 text-sm">✗ Your Answer</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Quiz taking view
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Button asChild variant="ghost" className="pl-0">
                <Link href="/dashboard/student/quizzes" className="flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Quizzes
                </Link>
            </Button>

            {/* Quiz Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                    <CardDescription>
                        <span>By {quiz.tutors?.profiles?.full_name}</span>
                        <span className="mx-2">•</span>
                        <span>{quiz.questions.length} Questions</span>
                    </CardDescription>
                </CardHeader>
                {timeLeft !== null && (
                    <CardContent>
                        <div className={`flex items-center gap-2 text-lg font-semibold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                            <Clock className="h-5 w-5" />
                            Time Remaining: {formatTime(timeLeft)}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Questions */}
            <div className="space-y-6">
                {quiz.questions.map((question: any, qIdx: number) => (
                    <Card key={qIdx}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Question {qIdx + 1}
                            </CardTitle>
                            <p className="text-slate-700">{question.text}</p>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={answers[qIdx]?.toString()}
                                onValueChange={(val) => setAnswers({ ...answers, [qIdx]: parseInt(val) })}
                            >
                                {question.options.map((option: string, oIdx: number) => (
                                    <div key={oIdx} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                        <RadioGroupItem value={oIdx.toString()} id={`q${qIdx}-o${oIdx}`} />
                                        <Label htmlFor={`q${qIdx}-o${oIdx}`} className="flex-1 cursor-pointer">
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Submit Button */}
            <Card className="sticky bottom-4 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Answered: {Object.keys(answers).length} / {quiz.questions.length}
                            </p>
                        </div>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || Object.keys(answers).length !== quiz.questions.length}
                            size="lg"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Quiz'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
