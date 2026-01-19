'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Loader2, Calendar as CalendarIcon, FileText, MoreVertical, Pencil, Trash, Eye, EyeOff, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AssignmentsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState<any[]>([]);

    // Form / Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        content: "",
        fileUrl: ""
    });

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchAssignments();
        }
    }, [user]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('assignments')
                .select('*')
                .eq('tutor_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAssignments(data || []);
        } catch (error: any) {
            toast.error("Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ title: "", description: "", dueDate: "", content: "", fileUrl: "" });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (assignment: any) => {
        setEditingId(assignment.id);
        setFormData({
            title: assignment.title,
            description: assignment.description || "",
            dueDate: assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : "", // format for input datetime-local
            content: assignment.content || "",
            fileUrl: assignment.attachment_url || ""
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (!formData.title || !formData.dueDate) {
                toast.error("Title and Due Date are required");
                return;
            }

            const payload = {
                tutor_id: user?.id,
                title: formData.title,
                description: formData.description,
                content: formData.content,
                due_date: new Date(formData.dueDate).toISOString(),
                attachment_url: formData.fileUrl,
                // If creating, default to PUBLISHED. If editing, keep existing status (controlled by other actions) or maybe just update fields.
                // Let's keep status as is for edits, or default PUBLISHED for new.
                ...(editingId ? {} : { status: 'PUBLISHED' })
            };

            if (editingId) {
                const { error } = await supabase
                    .from('assignments')
                    .update(payload)
                    .eq('id', editingId);
                if (error) throw error;
                toast.success("Assignment updated");
            } else {
                const { error } = await supabase
                    .from('assignments')
                    .insert(payload);
                if (error) throw error;
                toast.success("Assignment created");
            }

            setIsDialogOpen(false);
            fetchAssignments();
        } catch (error: any) {
            toast.error(error.message || "Failed to save assignment");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const { error } = await supabase
                .from('assignments')
                .delete()
                .eq('id', deleteId);

            if (error) throw error;
            toast.success("Assignment deleted");
            setDeleteId(null);
            fetchAssignments();
        } catch (error: any) {
            toast.error("Failed to delete assignment");
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
            const { error } = await supabase
                .from('assignments')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Assignment ${newStatus === 'PUBLISHED' ? 'published' : 'hidden'}`);
            fetchAssignments();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
                    <p className="text-slate-500">Manage homework and tasks for your students</p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Assignment" : "Create New Assignment"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Algebra Homework 1"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Due Date</Label>
                            <Input
                                id="date"
                                type="datetime-local"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="block"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Attachment (Optional)</Label>
                            <FileUpload
                                bucket="assignments"
                                label="Upload PDF or Image"
                                onUploadComplete={(url) => setFormData({ ...formData, fileUrl: url })}
                                existingUrl={formData.fileUrl}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief instructions..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="content">Content/Questions</Label>
                            <Textarea
                                id="content"
                                className="min-h-[150px]"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Enter the questions or detailed content here..."
                            />
                        </div>
                        <Button onClick={handleSave}>{editingId ? "Update" : "Create"}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the assignment and all student submissions associated with it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : assignments.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border rounded-lg bg-slate-50">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No assignments yet</h3>
                    <p>Create your first assignment to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {assignments.map((assignment) => (
                        <Card key={assignment.id} className="hover:shadow-md transition-shadow relative">
                            <div className="absolute top-4 right-4 z-10">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleOpenEdit(assignment)}>
                                            <Pencil className="h-4 w-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toggleStatus(assignment.id, assignment.status)}>
                                            {assignment.status === 'PUBLISHED' ? <><EyeOff className="h-4 w-4 mr-2" /> Hide</> : <><Eye className="h-4 w-4 mr-2" /> Publish</>}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(assignment.id)}>
                                            <Trash className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <CardHeader>
                                <CardTitle className="text-xl truncate pr-8" title={assignment.title}>
                                    {assignment.title}
                                </CardTitle>
                                <div className="flex items-center text-sm text-slate-500">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    Due: {format(new Date(assignment.due_date), 'MMM d, h:mm a')}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-600 line-clamp-3 min-h-[40px]">
                                        {assignment.description || "No description"}
                                    </p>
                                    {assignment.attachment_url && (
                                        <div className="flex items-center text-xs text-blue-600">
                                            <Paperclip className="h-3 w-3 mr-1" /> Has Attachment
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${assignment.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {assignment.status}
                                        </span>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/dashboard/teacher/assignments/${assignment.id}`}>
                                                View Details
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
