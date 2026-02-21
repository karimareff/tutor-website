'use client'

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTutorContext } from '@/contexts/TutorContext';
import { useAuth } from '@/contexts/AuthContext';
import StudentDashboardLayout from '@/components/dashboard/StudentDashboardLayout';

export default function AcademyPortalLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { linkedTutors, setActiveTutor, activeTutor, loading: tutorsLoading } = useTutorContext();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/login?next=/academy/${slug}/home`);
        }
    }, [user, authLoading, slug, router]);

    // Auto-set active tutor based on URL slug
    useEffect(() => {
        if (!tutorsLoading && linkedTutors.length > 0 && slug) {
            const matchedTutor = linkedTutors.find(t => t.tutor?.slug === slug);
            if (matchedTutor) {
                // Only set if not already the active tutor
                if (!activeTutor || activeTutor.tutor_id !== matchedTutor.tutor_id) {
                    setActiveTutor(matchedTutor.tutor_id);
                }
            } else {
                // Student is not enrolled in this academy
                router.push('/dashboard/student');
            }
        }
    }, [slug, linkedTutors, tutorsLoading, activeTutor, setActiveTutor, router]);

    // Loading states
    if (authLoading || tutorsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-slate-500">Loading academy...</div>
            </div>
        );
    }

    if (!user) return null;

    return <StudentDashboardLayout>{children}</StudentDashboardLayout>;
}
