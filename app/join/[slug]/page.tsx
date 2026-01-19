'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

export default function JoinPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { user, loading } = useAuth();
    const [tutor, setTutor] = useState<any>(null);
    const [joining, setJoining] = useState(false);
    const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');

    useEffect(() => {
        const fetchTutor = async () => {
            const { data, error } = await supabase
                .from('tutors')
                .select('*, profiles(full_name, avatar_url)')
                .eq('slug', slug)
                .single();

            if (error || !data) {
                setStatus('error');
            } else {
                setTutor(data);
                setStatus('ready');
            }
        };

        if (slug) fetchTutor();
    }, [slug]);

    const handleJoin = async () => {
        if (!user) {
            // Redirect to login with return URL
            router.push(`/login?next=/join/${slug}`);
            return;
        }

        try {
            setJoining(true);

            // Check if already joined
            const { data: existing } = await supabase
                .from('student_tutors')
                .select('id')
                .eq('student_id', user.id)
                .eq('tutor_id', tutor.id)
                .single();

            if (existing) {
                toast.info("You are already in this class!");
                router.push('/dashboard/student');
                return;
            }

            // Join
            const { error } = await supabase
                .from('student_tutors')
                .insert({
                    student_id: user.id,
                    tutor_id: tutor.id,
                    status: 'ACTIVE'
                });

            if (error) throw error;

            setStatus('success');
            toast.success("Successfully joined class!");
            setTimeout(() => {
                router.push('/dashboard/student');
            }, 1500);

        } catch (error: any) {
            toast.error("Failed to join class: " + error.message);
        } finally {
            setJoining(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Tutor Not Found</CardTitle>
                        <CardDescription>The class you are looking for does not exist.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full"><Link href="/">Go Home</Link></Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="w-full max-w-md bg-green-50 border-green-200">
                    <CardContent className="pt-6 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-green-900 mb-2">Success!</h2>
                        <p className="text-green-700 mb-4">You have joined {tutor.profiles.full_name}'s class.</p>
                        <p className="text-sm text-green-600">Redirecting to dashboard...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-slate-100 mb-4 overflow-hidden relative border-2 border-white shadow-sm">
                        {tutor.profiles?.avatar_url ? (
                            <Image
                                src={tutor.profiles.avatar_url}
                                alt={tutor.profiles.full_name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center font-bold text-2xl text-slate-300">
                                {tutor.profiles?.full_name?.[0]}
                            </div>
                        )}
                    </div>
                    <CardTitle className="text-2xl">Join {tutor.profiles.full_name}'s Class</CardTitle>
                    <CardDescription>
                        You are about to join this class as a student. You will be able to receive assignments and take quizzes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {user ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600 text-center">
                                Signed in as <strong>{user.email}</strong>
                            </div>
                            <Button className="w-full" size="lg" onClick={handleJoin} disabled={joining}>
                                {joining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Confirm & Join Class
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Button className="w-full" size="lg" asChild>
                                <Link href={`/login?next=/join/${slug}`}>
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Login to Join
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href={`/signup?next=/join/${slug}&role=student`}>
                                    Create Student Account
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
