'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, FileText, CheckCircle, Upload, ArrowLeft, Paperclip, Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";

export default function StudentAssignmentPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [assignment, setAssignment] = useState<any>(null);
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [comments, setComments] = useState("");
    const [fileUrl, setFileUrl] = useState("");

    useEffect(() => {
        if (user && id) {
            fetchAssignmentAndSubmission();
        }
    }, [user, id]);

    const fetchAssignmentAndSubmission = async () => {
        try {
            setLoading(true);

            // 1. Fetch Assignment Details
            const { data: assignmentData, error: assignError } = await supabase
                .from('assignments')
                .select('*, tutors(profiles(full_name))')
                .eq('id', id)
                .single();

            if (assignError) throw assignError;
            setAssignment(assignmentData);

            // 2. Fetch Existing Submission
            const { data: subData, error: subError } = await supabase
                .from('assignment_submissions')
                .select('*')
                .eq('assignment_id', id)
                .eq('student_id', user?.id)
                .single();

            if (subData) {
                setSubmission(subData);
                setComments(subData.comments || "");
                setFileUrl(subData.file_url || "");
            }

        } catch (error: any) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load assignment");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!comments && !fileUrl) {
            toast.error("Please add some content or a file to submit.");
            return;
        }

        try {
            setSubmitting(true);

            const submissionData = {
                assignment_id: id,
                student_id: user?.id,
                comments: comments,
                file_url: fileUrl,
                submitted_at: new Date().toISOString()
            };

            if (submission) {
                // Update existing
                const { error } = await supabase
                    .from('assignment_submissions')
                    .update(submissionData)
                    .eq('id', submission.id);
                if (error) throw error;
                toast.success("Submission updated successfully!");
            } else {
                // Create new
                const { error } = await supabase
                    .from('assignment_submissions')
                    .insert(submissionData);
                if (error) throw error;
                toast.success("Assignment submitted successfully!");
            }

            fetchAssignmentAndSubmission(); // Refresh state

        } catch (error: any) {
            console.error("Error submitting:", error);
            toast.error(error.message || "Failed to submit assignment");
        } finally {
            setSubmitting(false);
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
                <Button asChild variant="link" className="mt-4"><Link href="/dashboard/student">Return to Dashboard</Link></Button>
            </div>
        );
    }

    const isPastDue = new Date(assignment.due_date) < new Date();

    return (
        <div className="space-y-6 max-w-4xl">
            <Button asChild variant="ghost" className="pl-0 hover:bg-transparent">
                <Link href="/dashboard/student" className="flex items-center text-slate-500 hover:text-slate-800">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Link>
            </Button>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Left Column: Assignment Details */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
                                    <CardDescription>
                                        By {assignment.tutors?.profiles?.full_name}
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <Badge variant={isPastDue ? "destructive" : "outline"} className="mb-1">
                                        {isPastDue ? "Past Due" : "Due Soon"}
                                    </Badge>
                                    <div className="text-sm text-slate-500 font-medium">
                                        {format(new Date(assignment.due_date), "MMM d, h:mm a")}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Instructions
                                </h3>
                                <div className="prose prose-sm prose-slate max-w-none bg-slate-50 p-4 rounded-md border">
                                    {assignment.description || "No specific instructions provided."}
                                </div>
                            </div>
                            {assignment.content && (
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Content</h3>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{assignment.content}</p>
                                </div>
                            )}

                            {assignment.attachment_url && (
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
                                        <Paperclip className="h-4 w-4 mr-2" />
                                        Attachment
                                    </h3>
                                    <Button variant="outline" asChild className="w-full justify-start">
                                        <a href={assignment.attachment_url} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Attached File
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Submission Form */}
                <div className="space-y-6">
                    <Card className="border-l-4 border-l-primary shadow-md">
                        <CardHeader>
                            <CardTitle>Your Submission</CardTitle>
                            <CardDescription>
                                {submission ?
                                    `Submitted on ${format(new Date(submission.submitted_at), "MMM d, h:mm a")}` :
                                    "Hand in your work here."
                                }
                            </CardDescription>
                            {submission && submission.grade && (
                                <div className="mt-2 p-3 bg-green-50 border border-green-100 rounded text-green-800 font-semibold text-center">
                                    Grade: {submission.grade}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Comments / Text Answer</Label>
                                <Textarea
                                    placeholder="Type your answer here..."
                                    className="min-h-[120px]"
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    disabled={!!submission?.grade}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Attach File (PDF, Image, Doc)</Label>
                                <FileUpload
                                    bucket="submissions"
                                    path={`${user?.id}/${id}/`} // Keep organized
                                    label={submission?.file_url ? "Replace File" : "Upload File"}
                                    onUploadComplete={(url) => setFileUrl(url)}
                                    existingUrl={fileUrl}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={handleSubmit}
                                disabled={submitting || (!!submission && !!submission.grade)}
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : submission ? "Update Submission" : "Submit Assignment"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
