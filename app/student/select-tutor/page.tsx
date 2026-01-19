'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTutorContext } from "@/contexts/TutorContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, GraduationCap, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SelectTutorPage() {
    const router = useRouter();
    const { user, profile, loading: authLoading } = useAuth();
    const { linkedTutors, setActiveTutor, loading: tutorLoading } = useTutorContext();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?next=/student/select-tutor');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (!authLoading && profile?.role === 'tutor') {
            router.push('/dashboard/teacher');
        }
    }, [authLoading, profile, router]);

    const handleSelectTutor = (tutorId: string) => {
        setActiveTutor(tutorId);
        router.push('/dashboard/student');
    };

    if (authLoading || tutorLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1 container py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                            <GraduationCap className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Select Your Tutor</h1>
                        <p className="text-slate-500 max-w-md mx-auto">
                            You are connected to multiple tutors. Choose which tutor's dashboard you'd like to view.
                        </p>
                    </div>

                    {linkedTutors.length === 0 ? (
                        <Card className="max-w-md mx-auto">
                            <CardContent className="pt-6 text-center">
                                <p className="text-slate-500 mb-4">You haven't joined any tutors yet.</p>
                                <p className="text-sm text-slate-400 mb-6">Ask your tutor for their invite link to get started!</p>
                                <Button variant="outline" asChild>
                                    <Link href="/tutors">Browse Tutors</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {linkedTutors.map((item) => (
                                <Card key={item.id} className="group hover:shadow-lg transition-shadow duration-200">
                                    <CardHeader className="text-center pb-4">
                                        <div className="mx-auto h-20 w-20 rounded-full bg-slate-100 mb-3 overflow-hidden relative border-2 border-white shadow-sm">
                                            {item.tutor?.profiles?.avatar_url ? (
                                                <Image
                                                    src={item.tutor.profiles.avatar_url}
                                                    alt={item.tutor.profiles.full_name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center font-bold text-2xl text-slate-300 bg-gradient-to-br from-primary/20 to-primary/5">
                                                    {item.tutor?.profiles?.full_name?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <CardTitle className="text-xl">{item.tutor?.profiles?.full_name}</CardTitle>
                                        {item.tutor?.subjects && item.tutor.subjects.length > 0 && (
                                            <CardDescription className="text-primary font-medium">
                                                {item.tutor.subjects.join(', ')}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button
                                            className="w-full"
                                            size="lg"
                                            onClick={() => handleSelectTutor(item.tutor_id)}
                                        >
                                            Enter Dashboard
                                        </Button>
                                        {item.tutor?.slug && (
                                            <Button variant="outline" className="w-full" asChild>
                                                <Link href={`/tutor/${item.tutor.slug}`}>
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    View Public Page
                                                </Link>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
