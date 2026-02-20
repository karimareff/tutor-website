import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Users, Calendar, GraduationCap, ArrowRight } from "lucide-react";

interface AcademyPageProps {
    params: Promise<{ slug: string }>;
}

async function getTutorBySlug(slug: string) {
    const { data, error } = await supabase
        .from('tutors')
        .select(`
            id,
            slug,
            bio,
            subjects,
            academy_name,
            logo_url,
            brand_color,
            welcome_message,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .eq('slug', slug)
        .single();

    if (error || !data) return null;
    return data;
}

async function getStudentCount(tutorId: string) {
    const { count } = await supabase
        .from('student_tutors')
        .select('id', { count: 'exact', head: true })
        .eq('tutor_id', tutorId)
        .eq('status', 'ACTIVE');
    return count || 0;
}

export default async function AcademyPage({ params }: AcademyPageProps) {
    const { slug } = await params;
    const tutor = await getTutorBySlug(slug);

    if (!tutor) {
        notFound();
    }

    const studentCount = await getStudentCount(tutor.id);
    const profile = Array.isArray(tutor.profiles) ? tutor.profiles[0] : tutor.profiles;
    const tutorName = profile?.full_name || 'Tutor';
    const academyName = tutor.academy_name || `${tutorName}'s Academy`;
    const brandColor = tutor.brand_color || '#3b82f6';
    const welcomeMessage = tutor.welcome_message || `Welcome to ${academyName}! Join our class to access assignments, quizzes, and sessions.`;

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div
                className="relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 50%, ${brandColor}99 100%)`,
                }}
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
                    {/* Logo / Avatar */}
                    <div className="mb-6 flex justify-center">
                        {tutor.logo_url ? (
                            <div className="h-24 w-24 rounded-2xl overflow-hidden relative shadow-xl border-4 border-white/20">
                                <Image
                                    src={tutor.logo_url}
                                    alt={academyName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : profile?.avatar_url ? (
                            <div className="h-24 w-24 rounded-2xl overflow-hidden relative shadow-xl border-4 border-white/20">
                                <Image
                                    src={profile.avatar_url}
                                    alt={tutorName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl border-4 border-white/20">
                                <GraduationCap className="h-12 w-12 text-white" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        {academyName}
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
                        {welcomeMessage}
                    </p>

                    {/* CTA */}
                    <Link
                        href={`/join/${tutor.slug}`}
                        className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-lg"
                    >
                        Join This Class
                        <ArrowRight className="h-5 w-5" />
                    </Link>

                    {/* Quick stats */}
                    <div className="flex items-center justify-center gap-8 mt-10 text-white/70 text-sm">
                        <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            <span>{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
                        </div>
                        {tutor.subjects && tutor.subjects.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                <BookOpen className="h-4 w-4" />
                                <span>{tutor.subjects.length} subject{tutor.subjects.length !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* About */}
                {tutor.bio && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">About</h2>
                        <p className="text-slate-600 leading-relaxed text-lg">{tutor.bio}</p>
                    </div>
                )}

                {/* Subjects */}
                {tutor.subjects && tutor.subjects.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Subjects Taught</h2>
                        <div className="flex flex-wrap gap-3">
                            {tutor.subjects.map((subject: string, idx: number) => (
                                <span
                                    key={idx}
                                    className="px-4 py-2 rounded-full text-sm font-medium border"
                                    style={{
                                        backgroundColor: `${brandColor}10`,
                                        borderColor: `${brandColor}30`,
                                        color: brandColor,
                                    }}
                                >
                                    {subject}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Features / What You Get */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">What You'll Get</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                            <div
                                className="h-10 w-10 rounded-lg flex items-center justify-center mb-4"
                                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                            >
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Assignments</h3>
                            <p className="text-sm text-slate-500">
                                Receive and submit assignments with feedback from your tutor.
                            </p>
                        </div>
                        <div className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                            <div
                                className="h-10 w-10 rounded-lg flex items-center justify-center mb-4"
                                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                            >
                                <Calendar className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Live Sessions</h3>
                            <p className="text-sm text-slate-500">
                                Book and attend live tutoring sessions with video calls.
                            </p>
                        </div>
                        <div className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                            <div
                                className="h-10 w-10 rounded-lg flex items-center justify-center mb-4"
                                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                            >
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Quizzes</h3>
                            <p className="text-sm text-slate-500">
                                Test your knowledge with interactive quizzes and instant results.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center pt-8 border-t border-slate-100">
                    <p className="text-slate-500 mb-4">Ready to start learning?</p>
                    <Link
                        href={`/join/${tutor.slug}`}
                        className="inline-flex items-center gap-2 font-semibold px-8 py-3 rounded-xl text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                        style={{ backgroundColor: brandColor }}
                    >
                        Join {academyName}
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-100 py-6 text-center text-sm text-slate-400">
                Powered by <Link href="/" className="text-slate-500 hover:text-slate-700">TutorHub</Link>
            </footer>
        </div>
    );
}
