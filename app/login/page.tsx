'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, profile } = useAuth();

    useEffect(() => {
        if (user && profile) {
            const next = searchParams.get('next');
            if (next) {
                router.push(next);
                return;
            }

            if (profile.role === 'tutor') {
                router.push('/dashboard/teacher');
            } else if (profile.role === 'admin') {
                router.push('/dashboard/admin');
            } else {
                router.push('/dashboard/student');
            }
        }
    }, [user, profile, router, searchParams]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const { data: { user }, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (user) {
                // Fetch profile to check role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                toast.success('Logged in successfully');

                if (profile?.role === 'tutor') {
                    router.push('/dashboard/teacher');
                } else if (profile?.role === 'admin') {
                    router.push('/dashboard/admin');
                } else {
                    router.push('/dashboard/student');
                }
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md border-slate-200 shadow-xl rounded-2xl bg-white">
                <CardHeader className="text-center space-y-2">
                    <Link href="/" className="flex items-center justify-center gap-2 font-bold text-xl mb-6">
                        <GraduationCap className="h-8 w-8 text-blue-600" />
                        <span className="text-slate-900 text-2xl">
                            TutorHub
                        </span>
                    </Link>
                    <CardTitle className="text-slate-900 font-bold text-2xl">Welcome Back</CardTitle>
                    <CardDescription className="text-slate-500 text-base">Sign in to your account to continue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                className="bg-slate-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-slate-900 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-slate-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-slate-900 h-11"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-lg font-semibold text-base shadow-md hover:shadow-lg transition-all" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-slate-500">Don't have an account? </span>
                        <Link href="/signup" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
