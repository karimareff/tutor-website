'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import Link from "next/link";

export default function StudentAssignmentsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (user) {
            fetchAssignments();
        }
    }, [user]);

    const fetchAssignments = async () => {
        try {
            // First get my tutors to filter assignments
            const { data: tutorsData } = await supabase
                .from('student_tutors')
                .select('tutor_id')
                .eq('student_id', user?.id);

            const tutorIds = tutorsData?.map((t: any) => t.tutor_id) || [];

            if (tutorIds.length === 0) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('assignments')
                .select(`
                    *,
                    tutors(profiles(full_name))
                `)
                .in('tutor_id', tutorIds)
                .eq('status', 'PUBLISHED')
                .order('due_date', { ascending: true });

            setAssignments(data || []);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssignments = assignments.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tutors?.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
                <p className="text-slate-500">View and submit your assignments</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search assignments..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading assignments...</div>
            ) : filteredAssignments.length === 0 ? (
                <Card className="bg-slate-50 border-dashed border-2">
                    <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-orange-500">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No assignments found</h3>
                        <p className="text-slate-500 max-w-sm mt-1 mb-4">
                            {searchQuery ? "Try adjusting your search terms." : "Your tutors haven't assigned any work yet."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredAssignments.map((assignment) => {
                        const isOverdue = new Date(assignment.due_date) < new Date();
                        return (
                            <Link key={assignment.id} href={`/dashboard/student/assignments/${assignment.id}`}>
                                <Card className="hover:border-orange-300 transition-colors cursor-pointer group">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                                    <BookOpen className="h-6 w-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-semibold text-lg text-slate-900">{assignment.title}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <span>{assignment.tutors?.profiles?.full_name}</span>
                                                        <span>•</span>
                                                        <span className={`flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                                                            {isOverdue && <AlertCircle className="h-3 w-3" />}
                                                            Due {format(new Date(assignment.due_date), 'PPP')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="outline" className="shrink-0">
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
