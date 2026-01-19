'use client'

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BrainCircuit, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function StudentQuizzesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (user) {
            fetchQuizzes();
        }
    }, [user]);

    const fetchQuizzes = async () => {
        try {
            const { data: tutorsData } = await supabase
                .from('student_tutors')
                .select('tutor_id')
                .eq('student_id', user?.id);

            const tutorIds = tutorsData?.map((t: any) => t.tutor_id) || [];

            if (tutorIds.length === 0) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('quizzes')
                .select(`
                    *,
                    tutors(profiles(full_name))
                `)
                .in('tutor_id', tutorIds)
                .eq('status', 'PUBLISHED')
                .order('created_at', { ascending: false });

            setQuizzes(data || []);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredQuizzes = quizzes.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tutors?.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
                <p className="text-slate-500">Test your knowledge with these quizzes</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search quizzes..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading quizzes...</div>
            ) : filteredQuizzes.length === 0 ? (
                <Card className="bg-slate-50 border-dashed border-2">
                    <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-emerald-500">
                            <BrainCircuit className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No quizzes available</h3>
                        <p className="text-slate-500 max-w-sm mt-1 mb-4">
                            {searchQuery ? "Try adjusting your search terms." : "You're all caught up! No quizzes to take right now."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredQuizzes.map((quiz) => (
                        <Link key={quiz.id} href={`/dashboard/student/quizzes/${quiz.id}`}>
                            <Card className="hover:border-emerald-300 transition-colors cursor-pointer group">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                <BrainCircuit className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-lg text-slate-900">{quiz.title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <span>{quiz.tutors?.profiles?.full_name}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        {quiz.questions?.length || 'Multiple'} Questions
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button className="shrink-0 bg-emerald-600 hover:bg-emerald-700">
                                            Start Quiz
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
