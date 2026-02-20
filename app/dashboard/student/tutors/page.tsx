'use client'

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

export default function StudentTutorsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [tutors, setTutors] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchTutors();
        }
    }, [user]);

    const fetchTutors = async () => {
        try {
            // Fetch student-tutor relationships
            const { data, error } = await supabase
                .from('student_tutors')
                .select(`
                    *,
                    tutors (
                        id,
                        slug,
                        bio,
                        subjects,
                        profiles (full_name, avatar_url)
                    )
                `)
                .eq('student_id', user?.id)
                .eq('status', 'ACTIVE');

            if (error) throw error;
            setTutors(data || []);

        } catch (error) {
            console.error('Error fetching tutors:', error);
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

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Classes</h1>
                <p className="text-slate-500">Classes you're enrolled in</p>
            </div>

            {tutors.length === 0 ? (
                <Card className="bg-slate-50 border-dashed border-2">
                    <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-purple-500">
                            <User className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No classes yet</h3>
                        <p className="text-slate-500 max-w-sm mt-1 mb-4">
                            You haven't joined any classes yet. Ask your tutor for their invite link to get started.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tutors.map((connection) => {
                        const tutor = connection.tutors;
                        if (!tutor) return null;

                        return (
                            <Card key={connection.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                                            {tutor.profiles?.full_name?.[0] || 'T'}
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-xl mb-1">
                                                {tutor.profiles?.full_name || 'Tutor'}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Joined {new Date(connection.created_at).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Subjects */}
                                    {tutor.subjects && tutor.subjects.length > 0 && (
                                        <div>
                                            <div className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                                                <BookOpen className="h-4 w-4 mr-1" />
                                                Subjects
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {tutor.subjects.slice(0, 4).map((subject: string, idx: number) => (
                                                    <Badge key={idx} variant="secondary">
                                                        {subject}
                                                    </Badge>
                                                ))}
                                                {tutor.subjects.length > 4 && (
                                                    <Badge variant="outline">+{tutor.subjects.length - 4} more</Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bio */}
                                    {tutor.bio && (
                                        <p className="text-sm text-slate-600 line-clamp-2">
                                            {tutor.bio}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" size="sm" asChild className="flex-1">
                                            <Link href={`/tutor/${tutor.slug}`}>
                                                View Profile
                                            </Link>
                                        </Button>
                                        <Button size="sm" asChild className="flex-1">
                                            <Link href={`/tutor/${tutor.slug}/book`}>
                                                <Calendar className="h-4 w-4 mr-1" />
                                                Book Session
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
