'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Loader2, BrainCircuit, Trash2, MoreVertical, Pencil, Eye, EyeOff, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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

export default function QuizzesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [quizzes, setQuizzes] = useState<any[]>([]);

    // Form / Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        timeLimit: "",
        dueDate: "",
        status: "DRAFT"
    });
    const [questions, setQuestions] = useState<any[]>([]);

    // Question Form State
    const [currentQuestion, setCurrentQuestion] = useState({
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0
    });

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchQuizzes();
        }
    }, [user]);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('quizzes')
                .select('*')
                .eq('tutor_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuizzes(data || []);
        } catch (error: any) {
            toast.error("Failed to load quizzes");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ title: "", timeLimit: "", dueDate: "", status: "DRAFT" });
        setQuestions([]);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (quiz: any) => {
        setEditingId(quiz.id);
        setFormData({
            title: quiz.title,
            timeLimit: quiz.time_limit_minutes ? quiz.time_limit_minutes.toString() : "",
            dueDate: quiz.due_date ? new Date(quiz.due_date).toISOString().slice(0, 16) : "",
            status: quiz.status
        });
        setQuestions(quiz.questions || []);
        setIsDialogOpen(true);
    };

    const addQuestion = () => {
        if (!currentQuestion.text || currentQuestion.options.some(o => !o)) {
            toast.error("Please fill in question text and all options.");
            return;
        }
        setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
        setCurrentQuestion({
            text: "",
            options: ["", "", "", ""],
            correctAnswer: 0
        });
    };

    const removeQuestion = (index: number) => {
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const handleSave = async () => {
        try {
            if (!formData.title) {
                toast.error("Quiz title is required");
                return;
            }
            if (questions.length === 0) {
                toast.error("Add at least one question");
                return;
            }

            const payload = {
                tutor_id: user?.id,
                title: formData.title,
                questions: questions,
                time_limit_minutes: formData.timeLimit ? parseInt(formData.timeLimit) : null,
                due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                status: editingId ? formData.status : 'PUBLISHED' // Default published for new
            };

            if (editingId) {
                const { error } = await supabase
                    .from('quizzes')
                    .update(payload)
                    .eq('id', editingId);
                if (error) throw error;
                toast.success("Quiz updated");
            } else {
                const { error } = await supabase
                    .from('quizzes')
                    .insert(payload);
                if (error) throw error;
                toast.success("Quiz created");
            }

            setIsDialogOpen(false);
            fetchQuizzes();
        } catch (error: any) {
            toast.error(error.message || "Failed to save quiz");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const { error } = await supabase
                .from('quizzes')
                .delete()
                .eq('id', deleteId);

            if (error) throw error;
            toast.success("Quiz deleted");
            setDeleteId(null);
            fetchQuizzes();
        } catch (error: any) {
            toast.error("Failed to delete quiz");
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
            const { error } = await supabase
                .from('quizzes')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Quiz ${newStatus === 'PUBLISHED' ? 'published' : 'hidden'}`);
            fetchQuizzes();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
                    <p className="text-slate-500">Create and manage quizzes for your students</p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Quiz
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Quiz" : "Create New Quiz"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 overflow-hidden flex-1">
                        {/* Quiz Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quiz Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Weekly Chemistry Quiz"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Time Limit (Minutes)</Label>
                                <Input
                                    type="number"
                                    value={formData.timeLimit}
                                    onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Due Date (Optional)</Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="border-t my-2"></div>

                        {/* Question Builder */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">Add Question</h3>
                            <Input
                                value={currentQuestion.text}
                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                                placeholder="Question Text"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                {currentQuestion.options.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            checked={currentQuestion.correctAnswer === idx}
                                            onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                                            className="w-4 h-4"
                                        />
                                        <Input
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...currentQuestion.options];
                                                newOpts[idx] = e.target.value;
                                                setCurrentQuestion({ ...currentQuestion, options: newOpts });
                                            }}
                                            placeholder={`Option ${idx + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <Button onClick={addQuestion} variant="secondary" className="w-full">Add Question</Button>
                        </div>

                        {/* Question List Preview */}
                        <div className="flex-1 overflow-auto bg-slate-50 p-4 rounded-md border min-h-[150px]">
                            <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Questions ({questions.length})</h4>
                            {questions.length === 0 ? (
                                <div className="text-center text-slate-400 text-sm py-4">No questions added yet.</div>
                            ) : (
                                <div className="space-y-3">
                                    {questions.map((q, i) => (
                                        <div key={i} className="bg-white p-3 rounded border text-sm relative group">
                                            <button
                                                onClick={() => removeQuestion(i)}
                                                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <div className="font-medium pr-6">{i + 1}. {q.text}</div>
                                            <div className="text-slate-500 text-xs mt-1 pl-4">
                                                Correct Answer: {q.options[q.correctAnswer]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button onClick={handleSave}>{editingId ? "Update Quiz" : "Publish Quiz"}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the quiz and all student assertions associated with it.
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
            ) : quizzes.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border rounded-lg bg-slate-50">
                    <BrainCircuit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No quizzes yet</h3>
                    <p>Create your first quiz to challenge your students.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {quizzes.map((quiz) => (
                        <Card key={quiz.id} className="hover:shadow-md transition-shadow relative">
                            <div className="absolute top-4 right-4 z-10">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleOpenEdit(quiz)}>
                                            <Pencil className="h-4 w-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toggleStatus(quiz.id, quiz.status)}>
                                            {quiz.status === 'PUBLISHED' ? <><EyeOff className="h-4 w-4 mr-2" /> Hide</> : <><Eye className="h-4 w-4 mr-2" /> Publish</>}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(quiz.id)}>
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-start pr-8">
                                    <CardTitle className="text-xl line-clamp-1" title={quiz.title}>{quiz.title}</CardTitle>
                                    <Badge variant="outline" className="hidden border-slate-200 sm:inline-flex">{quiz.questions.length} Qs</Badge>
                                </div>
                                <CardDescription>
                                    {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} mins` : "No time limit"}
                                    {quiz.due_date && <span> • Due {format(new Date(quiz.due_date), "MMM d")}</span>}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center">
                                    <span className={`text-xs px-2 py-1 rounded-full ${quiz.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {quiz.status}
                                    </span>
                                    <Button variant="outline" size="sm" disabled>View Results</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
