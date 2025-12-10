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
import { GraduationCap, Book, Presentation, ArrowLeft } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SignupPage() {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'role' | 'form'>('role');
    const [selectedRole, setSelectedRole] = useState<'student' | 'tutor'>('student');
    const router = useRouter();

    const handleRoleSelect = (role: 'student' | 'tutor') => {
        setSelectedRole(role);
        setStep('form');
    };

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const name = formData.get('name') as string;

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        role: selectedRole,
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                toast.success('Account created successfully!');
                // Redirect based on role
                if (selectedRole === 'tutor') {
                    router.push('/dashboard/onboarding');
                } else {
                    router.push('/tutors'); // Or home '/'
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

    if (step === 'role') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-10">
                        <Link href="/" className="inline-flex items-center justify-center gap-2 font-bold text-2xl mb-6">
                            <GraduationCap className="h-10 w-10 text-blue-600" />
                            <span className="text-slate-900 text-3xl">
                                TutorHub
                            </span>
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Join our learning community</h1>
                        <p className="text-slate-500 text-lg">Choose how you want to get started</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {/* Student Card */}
                        <Card
                            className="cursor-pointer border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 group relative overflow-hidden bg-white rounded-2xl"
                            onClick={() => handleRoleSelect('student')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-8 flex flex-col items-center text-center h-full justify-center space-y-6 relative z-10">
                                <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Book className="h-10 w-10 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2 text-slate-900">I am a Student</h3>
                                    <p className="text-slate-500">
                                        Find expert tutors, book sessions, and master your subjects.
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full mt-auto border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                                    Join as Student
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Tutor Card */}
                        <Card
                            className="cursor-pointer border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 group relative overflow-hidden bg-white rounded-2xl"
                            onClick={() => handleRoleSelect('tutor')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-8 flex flex-col items-center text-center h-full justify-center space-y-6 relative z-10">
                                <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Presentation className="h-10 w-10 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2 text-slate-900">I am a Tutor</h3>
                                    <p className="text-slate-500">
                                        Share your knowledge, set your rates, and grow your student base.
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full mt-auto border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors">
                                    Join as Tutor
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-10 text-center">
                        <span className="text-slate-500">Already have an account? </span>
                        <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md border-slate-200 shadow-xl rounded-2xl bg-white">
                <CardHeader className="text-center relative space-y-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        onClick={() => setStep('role')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Link href="/" className="flex items-center justify-center gap-2 font-bold text-xl mb-6">
                        <GraduationCap className="h-8 w-8 text-blue-600" />
                        <span className="text-slate-900 text-2xl">
                            TutorHub
                        </span>
                    </Link>
                    <CardTitle className="text-slate-900 font-bold text-2xl">
                        Create {selectedRole === 'student' ? 'Student' : 'Tutor'} Account
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-base">Enter your details to get started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Ahmed Hassan"
                                required
                                className="bg-slate-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-slate-900 h-11"
                            />
                        </div>
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
                            <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-slate-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-slate-900 h-11"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-lg font-semibold text-base shadow-md hover:shadow-lg transition-all" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-slate-500">Already have an account? </span>
                        <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
