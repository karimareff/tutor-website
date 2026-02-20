'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, LogIn, BookOpen, Calendar, GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

const ACTIVE_TUTOR_KEY = 'active_tutor_id';

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
                // Auto-select this tutor so dashboard shows their branding
                localStorage.setItem(ACTIVE_TUTOR_KEY, tutor.id);
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

            // Auto-select this tutor so dashboard shows their branding
            localStorage.setItem(ACTIVE_TUTOR_KEY, tutor.id);

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
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white rounded-2xl shadow-lg border p-8 max-w-md w-full text-center">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Class Not Found</h2>
                    <p className="text-slate-500 mb-6">The class you are looking for does not exist or the link may be invalid.</p>
                    <Button asChild variant="outline" className="w-full"><Link href="/">Go Home</Link></Button>
                </div>
            </div>
        );
    }

    const profile = Array.isArray(tutor.profiles) ? tutor.profiles[0] : tutor.profiles;
    const tutorName = profile?.full_name || 'Tutor';
    const brandColor = tutor.brand_color || '#3b82f6';
    const academyName = tutor.academy_name || `${tutorName}'s Class`;

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4"
                style={{ backgroundColor: `${brandColor}08` }}
            >
                <div className="bg-white rounded-2xl shadow-lg border p-8 max-w-md w-full text-center">
                    <div
                        className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: `${brandColor}15` }}
                    >
                        <CheckCircle className="h-8 w-8" style={{ color: brandColor }} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">You're In!</h2>
                    <p className="text-slate-600 mb-4">
                        You have joined <strong>{academyName}</strong>. Redirecting to your dashboard...
                    </p>
                    <div className="h-1 rounded-full overflow-hidden bg-slate-100">
                        <div
                            className="h-full rounded-full animate-pulse"
                            style={{ backgroundColor: brandColor, width: '100%' }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: `${brandColor}08` }}>
            {/* Branded Header */}
            <div
                className="relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 50%, ${brandColor}99 100%)`,
                }}
            >
                <div className="max-w-lg mx-auto px-6 py-12 text-center relative">
                    {/* Avatar */}
                    <div className="mb-4 flex justify-center">
                        {profile?.avatar_url ? (
                            <div className="h-20 w-20 rounded-2xl overflow-hidden relative shadow-xl border-4 border-white/20">
                                <Image
                                    src={profile.avatar_url}
                                    alt={tutorName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl border-4 border-white/20">
                                <span className="text-3xl font-bold text-white">{tutorName[0]}</span>
                            </div>
                        )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{academyName}</h1>
                    <p className="text-white/80 text-sm">by {tutorName}</p>
                </div>
            </div>

            {/* Join Card */}
            <div className="max-w-lg mx-auto px-6 -mt-6 relative z-10 pb-12">
                <div className="bg-white rounded-2xl shadow-lg border p-6 space-y-6">
                    {/* What you'll get */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-3">What you'll get access to:</h3>
                        <div className="space-y-2">
                            {[
                                { icon: BookOpen, label: "Assignments with feedback" },
                                { icon: GraduationCap, label: "Interactive quizzes" },
                                { icon: Calendar, label: "Live tutoring sessions" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 py-2">
                                    <div
                                        className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: `${brandColor}12`, color: brandColor }}
                                    >
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm text-slate-700">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action */}
                    {user ? (
                        <div className="space-y-3">
                            <div className="p-3 rounded-lg text-sm text-slate-600 text-center" style={{ backgroundColor: `${brandColor}08` }}>
                                Signed in as <strong>{user.email}</strong>
                            </div>
                            <Button
                                className="w-full text-white"
                                size="lg"
                                onClick={handleJoin}
                                disabled={joining}
                                style={{ backgroundColor: brandColor }}
                            >
                                {joining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Join {academyName}
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Button
                                className="w-full text-white"
                                size="lg"
                                asChild
                                style={{ backgroundColor: brandColor }}
                            >
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
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    Powered by <Link href="/" className="text-slate-500 hover:text-slate-700">TutorHub</Link>
                </p>
            </div>
        </div>
    );
}

