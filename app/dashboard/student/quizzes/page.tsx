'use client'

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BrainCircuit, LayoutGrid, ArrowRight, HelpCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTutorContext } from "@/contexts/TutorContext";
import Link from "next/link";
import { useAcademyBasePath } from "@/lib/useAcademyBasePath";

export default function StudentQuizzesPage() {
    const { user } = useAuth();
    const { activeTutorId, activeTutor, clearActiveTutor } = useTutorContext();
    const [loading, setLoading] = useState(true);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (user && activeTutorId) {
            fetchQuizzes();
        }
    }, [user, activeTutorId]);

    // Gate: require academy selection
    if (!activeTutorId) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <LayoutGrid className="h-7 w-7 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Select an Academy</h2>
                <p className="text-slate-500 max-w-sm mb-6">Choose an academy from the switcher above to view your quizzes.</p>
                <Link href="/dashboard/student">
                    <Button variant="outline">Go to My Academies</Button>
                </Link>
            </div>
        );
    }

    const basePath = useAcademyBasePath();
    const brandColor = activeTutor?.tutor?.brand_color || '#3b82f6';
    const academyName = activeTutor?.tutor?.academy_name || activeTutor?.tutor?.profiles?.full_name || 'Academy';

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const { data } = await supabase
                .from('quizzes')
                .select('*, tutors(profiles(full_name))')
                .eq('tutor_id', activeTutorId)
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
        q.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div
                className="relative overflow-hidden rounded-2xl p-6 md:p-8"
                style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}bb 100%)` }}
            >
                <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-10 bg-white" />
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full opacity-10 bg-white" />
                <div className="relative flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                        <BrainCircuit className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Quizzes</h1>
                        <p className="text-white/70 text-sm">{academyName}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
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
                <span className="text-sm text-slate-500">{filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'zes' : ''}</span>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading quizzes...</div>
            ) : filteredQuizzes.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed py-16 flex flex-col items-center justify-center text-center" style={{ borderColor: `${brandColor}30` }}>
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                        <BrainCircuit className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">No quizzes available</h3>
                    <p className="text-slate-500 max-w-sm">
                        {searchQuery
                            ? "No quizzes match your search."
                            : `${academyName} hasn't published any quizzes yet. Check back soon!`}
                    </p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filteredQuizzes.map((quiz) => (
                        <Link key={quiz.id} href={`${basePath}/quizzes/${quiz.id}`}>
                            <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-all duration-200 group cursor-pointer" style={{ borderColor: `${brandColor}15` }}>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: `${brandColor}10`, color: brandColor }}
                                    >
                                        <BrainCircuit className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 text-base group-hover:text-slate-700 truncate">{quiz.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                            <HelpCircle className="h-3.5 w-3.5" />
                                            <span>{quiz.questions?.length || 'Multiple'} questions</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: brandColor }}>
                                            Start Quiz
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
