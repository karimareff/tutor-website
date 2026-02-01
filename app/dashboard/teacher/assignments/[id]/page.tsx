'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, FileText, ArrowLeft, User, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function GuideAssignmentPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [assignment, setAssignment] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && id) {
            fetchData();
        }
    }, [user, id]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Assignment
            const { data: assignmentData, error: assignError } = await supabase
                .from('assignments')
                .select('*')
                .eq('id', id)
                .single();

            if (assignError) throw assignError;
            setAssignment(assignmentData);

            // 2. Fetch Submissions
            const { data: subData, error: subError } = await supabase
                .from('assignment_submissions')
                .select('*, students:profiles(full_name, avatar_url)')
                .eq('assignment_id', id)
                .order('submitted_at', { ascending: false });

            if (subError) throw subError;
            setSubmissions(subData || []);

        } catch (error: any) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load assignment data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <h2 className="text-xl font-bold text-slate-800">Assignment Not Found</h2>
                <Button asChild variant="link" className="mt-4"><Link href="/dashboard/teacher/assignments">Return to Assignments</Link></Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <Button asChild variant="ghost" className="pl-0 hover:bg-transparent">
                <Link href="/dashboard/teacher/assignments" className="flex items-center text-slate-500 hover:text-slate-800">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Assignments
                </Link>
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Details */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">{assignment.title}</CardTitle>
                            <CardDescription>
                                Due {format(new Date(assignment.due_date), "MMM d, h:mm a")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-1">Description</h3>
                                <p className="text-sm text-slate-700">{assignment.description || "None"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-1">Status</h3>
                                <Badge variant={assignment.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                    {assignment.status}
                                </Badge>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-1">Submissions</h3>
                                <p className="text-2xl font-bold text-slate-900">{submissions.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Submissions List */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {submissions.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    No students have submitted yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {submissions.map((sub) => (
                                        <div key={sub.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0">
                                                    {sub.students?.full_name?.[0] || <User className="h-5 w-5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">{sub.students?.full_name || "Unknown Student"}</div>
                                                    <div className="text-xs text-slate-500">Submitted {format(new Date(sub.submitted_at), "MMM d, h:mm a")}</div>
                                                    {sub.student_response && (
                                                        <div className="mt-2 p-2 bg-slate-50 rounded border text-sm">
                                                            <p className="font-medium text-slate-700 mb-1">Student Response:</p>
                                                            <p className="text-slate-600 whitespace-pre-wrap line-clamp-3">{sub.student_response}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 sm:items-center">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                            {sub.grade ? `Grade: ${sub.grade}` : "Grade"}
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Grade Submission</DialogTitle>
                                                        </DialogHeader>
                                                        <form onSubmit={async (e) => {
                                                            e.preventDefault();
                                                            const formData = new FormData(e.currentTarget);
                                                            const grade = formData.get('grade');
                                                            const feedback = formData.get('feedback');

                                                            const { error } = await supabase
                                                                .from('assignment_submissions')
                                                                .update({ grade: grade, feedback: feedback })
                                                                .eq('id', sub.id);

                                                            if (error) {
                                                                toast.error("Failed to grade");
                                                            } else {
                                                                toast.success("Graded successfully");
                                                                fetchData();
                                                            }
                                                        }} className="space-y-4">
                                                            <div className="grid gap-2">
                                                                <Label>Grade (0-100)</Label>
                                                                <Input name="grade" type="number" min="0" max="100" defaultValue={sub.grade || ""} required />
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label>Feedback</Label>
                                                                <Textarea name="feedback" defaultValue={sub.feedback || ""} placeholder="Good work..." />
                                                            </div>
                                                            <Button type="submit">Save Grade</Button>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>

                                                {sub.file_url ? (
                                                    <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                                                        <a href={sub.file_url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-3 w-3 mr-2" />
                                                            Download File
                                                        </a>
                                                    </Button>
                                                ) : (
                                                    <Button variant="ghost" size="sm" disabled className="w-full sm:w-auto">No File</Button>
                                                )}

                                                {sub.feedback && (
                                                    <Button variant="ghost" size="sm" onClick={() => toast.info(sub.feedback)} className="w-full sm:w-auto">
                                                        View Feedback
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
