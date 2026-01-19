'use client'

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, BrainCircuit, Calendar, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function StudentTutorsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [tutors, setTutors] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchTutors();
        }
    }, [user]);

    const fetchTutors = async () => {
        console.log("Starting fetchTutors for user:", user?.id);
        try {
            if (!user) {
                console.log("No user found, skipping fetch");
                return;
            }

            // 1. Get Tutor IDs first
            console.log("Step 1: Fetching student_tutors connections...");
            const { data: connectionData, error: connectionError } = await supabase
                .from('student_tutors')
                .select('tutor_id')
                .eq('student_id', user.id);

            if (connectionError) {
                console.error("Step 1 Error (student_tutors):", connectionError);
                throw connectionError;
            }

            console.log("Step 1 Success. Connections found:", connectionData?.length, connectionData);

            const tutorIds = connectionData?.map(c => c.tutor_id) || [];

            if (tutorIds.length === 0) {
                console.log("No connections found. Setting empty tutors list.");
                setTutors([]);
                return;
            }

            // 2. Fetch Tutor Details
            console.log("Step 2: Fetching tutor details for IDs:", tutorIds);
            const { data: tutorsData, error: tutorsError } = await supabase
                .from('tutors')
                .select(`
                    id,
                    bio,
                    profiles(full_name, avatar_url)
                `)
                .in('id', tutorIds);

            if (tutorsError) {
                console.error("Step 2 Error (tutors):", tutorsError);
                throw tutorsError;
            }

            console.log("Step 2 Success. Tutors details:", tutorsData);

            // 3. Adapt structure
            const adaptedData = tutorsData?.map(t => ({
                tutor_id: t.id,
                tutors: t
            })) || [];

            setTutors(adaptedData);

        } catch (error: any) {
            console.error('Error fetching tutors (Details):', JSON.stringify(error, null, 2));
            toast.error("Could not load tutors. details: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Tutors</h1>
                <p className="text-slate-500">Manage your learning journey with your tutors</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading tutors...</div>
            ) : tutors.length === 0 ? (
                <Card className="bg-slate-50 border-dashed border-2">
                    <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-purple-500">
                            <Users className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No tutors found</h3>
                        <p className="text-slate-500 max-w-sm mt-1 mb-4">
                            You haven't joined any tutors yet. Use the invite link sent by your tutor to join their class.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tutors.map((item) => {
                        const tutor = item.tutors;
                        const profile = tutor.profiles;
                        return (
                            <Card key={item.tutor_id} className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                                <CardContent className="p-0 flex flex-col flex-1">
                                    <div className="p-6 flex flex-col items-center text-center border-b bg-slate-50/50">
                                        <Avatar className="h-24 w-24 mb-4 border-4 border-white shadow-sm">
                                            <AvatarImage src={profile.avatar_url} />
                                            <AvatarFallback className="text-xl bg-purple-100 text-purple-600">
                                                {profile.full_name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <h3 className="text-xl font-bold text-slate-900">{profile.full_name}</h3>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{tutor.bio || "No bio available"}</p>
                                    </div>

                                    <div className="p-4 grid grid-cols-2 gap-2 flex-1 content-start">
                                        <Link href={`/dashboard/student/tutors/${item.tutor_id}/book`} className="col-span-2">
                                            <Button className="w-full" variant="default">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Book Session
                                            </Button>
                                        </Link>
                                        <Link href={`/dashboard/student/assignments?tutor=${item.tutor_id}`}>
                                            <Button variant="outline" className="w-full text-xs">
                                                <BookOpen className="h-3 w-3 mr-2" />
                                                Assignments
                                            </Button>
                                        </Link>
                                        <Link href={`/dashboard/student/quizzes?tutor=${item.tutor_id}`}>
                                            <Button variant="outline" className="w-full text-xs">
                                                <BrainCircuit className="h-3 w-3 mr-2" />
                                                Quizzes
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
