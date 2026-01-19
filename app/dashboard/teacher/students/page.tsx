'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, Loader2, User, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

export default function StudentsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<any[]>([]);
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
            const { data, error } = await supabase
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
            setStudents(data || []);
        } catch (error: any) {
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
                    <p className="text-slate-500">Manage your class roster</p>
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
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
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
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
