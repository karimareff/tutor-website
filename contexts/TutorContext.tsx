'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface LinkedTutor {
    id: string;
    tutor_id: string;
    status: string;
    created_at: string;
    tutor: {
        id: string;
        slug: string;
        subjects?: string[];
        profiles: {
            full_name: string;
            avatar_url?: string;
        };
    };
}

interface TutorContextType {
    linkedTutors: LinkedTutor[];
    activeTutor: LinkedTutor | null;
    activeTutorId: string | null;
    setActiveTutor: (tutorId: string) => void;
    clearActiveTutor: () => void;
    loading: boolean;
    refetchTutors: () => Promise<void>;
}

const TutorContext = createContext<TutorContextType | undefined>(undefined);

const ACTIVE_TUTOR_KEY = 'active_tutor_id';

export const TutorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, profile } = useAuth();
    const [linkedTutors, setLinkedTutors] = useState<LinkedTutor[]>([]);
    const [activeTutorId, setActiveTutorId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchLinkedTutors = useCallback(async () => {
        if (!user || profile?.role !== 'student') {
            setLinkedTutors([]);
            setLoading(false);
            return;
        }

        try {
            // Query student_tutors with tutor details
            const { data, error } = await supabase
                .from('student_tutors')
                .select(`
                    id,
                    tutor_id,
                    status,
                    created_at,
                    tutors (
                        id,
                        slug,
                        subjects
                    )
                `)
                .eq('student_id', user.id)
                .eq('status', 'ACTIVE');

            if (error) {
                console.error('Supabase error:', error.message, error.details, error.hint);
                throw error;
            }

            // Fetch profile info for each tutor (tutors.id = profiles.id)
            const tutorIds = (data || []).map((item: any) =>
                Array.isArray(item.tutors) ? item.tutors[0]?.id : item.tutors?.id
            ).filter(Boolean);

            let profilesMap: Record<string, any> = {};
            if (tutorIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', tutorIds);

                profilesMap = (profilesData || []).reduce((acc: Record<string, any>, p: any) => {
                    acc[p.id] = p;
                    return acc;
                }, {});
            }

            // Transform data to match expected type
            const transformedData = (data || []).map((item: any) => {
                const tutorData = Array.isArray(item.tutors) ? item.tutors[0] : item.tutors;
                if (!tutorData) return null;

                const profileData = profilesMap[tutorData.id] || { full_name: 'Unknown', avatar_url: null };

                return {
                    id: item.id,
                    tutor_id: item.tutor_id,
                    status: item.status,
                    created_at: item.created_at,
                    tutor: {
                        id: tutorData.id,
                        slug: tutorData.slug,
                        subjects: tutorData.subjects,
                        profiles: profileData,
                    },
                };
            }).filter(Boolean) as LinkedTutor[];

            setLinkedTutors(transformedData);

            // Restore active tutor from localStorage
            const storedTutorId = localStorage.getItem(ACTIVE_TUTOR_KEY);
            if (storedTutorId && transformedData.some(t => t.tutor_id === storedTutorId)) {
                setActiveTutorId(storedTutorId);
            } else if (transformedData.length === 1) {
                // Auto-select if only one tutor
                setActiveTutorId(transformedData[0].tutor_id);
                localStorage.setItem(ACTIVE_TUTOR_KEY, transformedData[0].tutor_id);
            }
        } catch (error: any) {
            console.error('Error fetching linked tutors:', error?.message || error);
        } finally {
            setLoading(false);
        }
    }, [user, profile?.role]);

    useEffect(() => {
        fetchLinkedTutors();
    }, [fetchLinkedTutors]);

    const setActiveTutor = (tutorId: string) => {
        setActiveTutorId(tutorId);
        localStorage.setItem(ACTIVE_TUTOR_KEY, tutorId);
    };

    const clearActiveTutor = () => {
        setActiveTutorId(null);
        localStorage.removeItem(ACTIVE_TUTOR_KEY);
    };

    const activeTutor = linkedTutors.find(t => t.tutor_id === activeTutorId) || null;

    return (
        <TutorContext.Provider
            value={{
                linkedTutors,
                activeTutor,
                activeTutorId,
                setActiveTutor,
                clearActiveTutor,
                loading,
                refetchTutors: fetchLinkedTutors,
            }}
        >
            {children}
        </TutorContext.Provider>
    );
};

export const useTutorContext = () => {
    const context = useContext(TutorContext);
    if (context === undefined) {
        throw new Error('useTutorContext must be used within a TutorProvider');
    }
    return context;
};
