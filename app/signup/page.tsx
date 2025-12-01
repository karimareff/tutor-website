'use client'

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SignupPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const name = formData.get('name') as string;
        const role = formData.get('role') as string;

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        role: role,
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                toast.success('Account created successfully!');
                // Redirect based on role
                if (role === 'tutor') {
                    router.push('/dashboard/teacher');
                } else {
                    router.push('/dashboard/student');
                }
            } else {
                // Email confirmation enabled
                toast.success('Account created! Please check your email to verify.');
                router.push('/login');
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Link href="/" className="flex items-center justify-center gap-2 font-bold text-xl mb-4">
                        <GraduationCap className="h-7 w-7 text-primary" />
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            TutorHub Egypt
                        </span>
                    </Link>
                    <CardTitle className="text-2xl">Create an Account</CardTitle>
                    <CardDescription>Join thousands of successful students</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Ahmed Hassan"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <Label>I am a:</Label>
                            <RadioGroup defaultValue="student" name="role">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="student" id="student" />
                                    <Label htmlFor="student" className="font-normal cursor-pointer">
                                        Student looking for tutors
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="tutor" id="tutor" />
                                    <Label htmlFor="tutor" className="font-normal cursor-pointer">
                                        Tutor offering services
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link href="/login" className="text-primary font-semibold hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
