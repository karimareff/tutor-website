import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: 'student' | 'tutor' | 'admin';
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    login: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and subscribe to auth changes
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (currentUser: User) => {
        try {
            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();

            // Self-healing: Create profile if missing
            // Check for PGRST116 (No rows found) - checking multiple properties to be safe
            if (error && (error.code === 'PGRST116' || error.details?.includes('0 rows') || error.message?.includes('single JSON object'))) {
                console.log('Profile missing, creating new profile...');
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        id: currentUser.id,
                        email: currentUser.email!,
                        full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
                        role: currentUser.user_metadata?.role || 'student',
                        avatar_url: currentUser.user_metadata?.avatar_url
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating profile:', JSON.stringify(createError, null, 2));
                    throw createError;
                }
                data = newProfile;
                error = null;
            } else if (error) {
                console.error('Error fetching profile:', JSON.stringify(error, null, 2));
            }

            if (data) {
                setProfile(data);

                // Self-healing: Ensure tutor record exists if role is tutor
                if (data.role === 'tutor') {
                    const { error: tutorError } = await supabase
                        .from('tutors')
                        .select('id')
                        .eq('id', currentUser.id)
                        .single();

                    if (tutorError && tutorError.code === 'PGRST116') {
                        console.log('Tutor record missing, creating...');
                        await supabase
                            .from('tutors')
                            .insert({
                                id: currentUser.id,
                                hourly_rate: 300 // Default rate
                            });
                    }
                }
            }
        } catch (error) {
            console.error('Error in profile management:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string) => {
        console.log("Login triggered for", email);
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error(error.message);
        } else {
            setProfile(null);
            toast.success('Logged out successfully');
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, logout, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
