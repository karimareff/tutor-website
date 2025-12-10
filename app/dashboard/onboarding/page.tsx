'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProfileForm from "@/components/ProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function OnboardingPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleOnboardingComplete = () => {
        router.push('/dashboard/teacher');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-100 mb-4">
                        <Sparkles className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">Welcome to TutorHub!</h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Let's set up your tutor profile so you can start accepting students.
                    </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-blue-50/50 p-6 border-b border-slate-200">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">1</span>
                            Complete Your Profile
                        </h2>
                    </div>
                    <div className="p-6">
                        <ProfileForm user={user} onUpdate={handleOnboardingComplete} embedded={true} />
                    </div>
                </div>
            </div>
        </div>
    );
}
