'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, CheckCircle2, Loader2, DollarSign, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TIME_SLOTS = [
    "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00",
    "18:00", "19:00", "20:00"
];

export default function StudentBookSessionPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    // Tutor State
    const [tutor, setTutor] = useState<any>(null);
    const [pageLoading, setPageLoading] = useState(true);

    // Booking State
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [subject, setSubject] = useState("");
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Details, 2: Confirm, 3: Success
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchTutor();
        }
    }, [id]);

    const fetchTutor = async () => {
        try {
            const { data, error } = await supabase
                .from('tutors')
                .select(`
                    id,
                    bio,
                    profiles(full_name, avatar_url)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setTutor(data);
        } catch (error) {
            console.error("Error fetching tutor:", error);
            toast.error("Failed to load tutor details");
        } finally {
            setPageLoading(false);
        }
    };

    const handleBook = async () => {
        if (!user) {
            toast.error("Please login to book a lesson");
            return;
        }

        if (!date || !selectedTime || !subject) {
            toast.error("Please fill in all fields");
            return;
        }

        setBookingLoading(true);
        try {
            const { error } = await supabase
                .from('bookings')
                .insert({
                    student_id: user.id,
                    tutor_id: tutor.id,
                    date: format(date, 'yyyy-MM-dd'),
                    time: selectedTime,
                    subject: subject,
                    status: 'pending'
                });

            if (error) throw error;

            toast.success("Booking confirmed!");
            setStep(3);
        } catch (error: any) {
            toast.error(error.message || "Failed to create booking");
        } finally {
            setBookingLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!tutor) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <h2 className="text-xl font-bold text-slate-800">Tutor Not Found</h2>
                <Button asChild variant="link" className="mt-4"><Link href="/dashboard/student/tutors">Return to Tutors List</Link></Button>
            </div>
        );
    }

    if (step === 3) {
        return (
            <div className="max-w-md mx-auto py-12">
                <Card className="text-center p-6 border-dashed border-2 border-green-200 bg-green-50/30">
                    <CardContent className="pt-6 space-y-4">
                        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h2>
                        <p className="text-slate-600">
                            Your session with {tutor.profiles?.full_name} is scheduled for:
                        </p>
                        <div className="bg-white p-4 rounded-lg border inline-block text-left mx-auto">
                            <p className="font-semibold flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-purple-600" /> {date && format(date, "EEEE, MMMM d, yyyy")}</p>
                            <p className="font-semibold flex items-center gap-2 mt-1"><Clock className="h-4 w-4 text-blue-600" /> {selectedTime}</p>
                        </div>
                        <div className="pt-6">
                            <Button asChild className="w-full">
                                <Link href="/dashboard/student/sessions">Go to My Sessions</Link>
                            </Button>
                            <Button asChild variant="ghost" className="w-full mt-2">
                                <Link href="/dashboard/student">Back to Dashboard</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Button asChild variant="ghost" className="pl-0 hover:bg-transparent">
                <Link href="/dashboard/student/tutors" className="flex items-center text-slate-500 hover:text-slate-800">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Tutors
                </Link>
            </Button>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Tutor Info Sidebar */}
                <div className="md:col-span-1">
                    <Card>
                        <CardContent className="p-6 text-center space-y-4">
                            <Avatar className="h-24 w-24 mx-auto border-4 border-slate-50">
                                <AvatarImage src={tutor.profiles?.avatar_url} />
                                <AvatarFallback>{tutor.profiles?.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">{tutor.profiles?.full_name}</h3>
                                <p className="text-slate-500 text-sm mt-1">{tutor.bio}</p>
                            </div>
                            <div className="border-t pt-4 mt-4">
                                <div className="flex items-center justify-center gap-2 text-slate-700 font-semibold">
                                    {/* Rate display removed as per simple requirement */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Booking Form */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Book a Session</CardTitle>
                            <CardDescription>Select a date and time for your lesson</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {step === 1 ? (
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Date</Label>
                                            <div className="border rounded-md p-3 flex justify-center">
                                                <Calendar
                                                    mode="single"
                                                    selected={date}
                                                    onSelect={setDate}
                                                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                                    className="rounded-md border shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2"><Clock className="h-4 w-4" /> Time</Label>
                                            <ScrollArea className="h-[280px] border rounded-md p-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {TIME_SLOTS.map((time) => (
                                                        <Button
                                                            key={time}
                                                            variant={selectedTime === time ? "default" : "outline"}
                                                            className={`justify-start ${selectedTime === time ? "bg-slate-900 text-white" : ""}`}
                                                            onClick={() => setSelectedTime(time)}
                                                        >
                                                            {time}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Topic / Subject</Label>
                                        <Input
                                            id="subject"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="What do you want to learn? (e.g. Physics Chapter 3)"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                                        <div className="flex justify-between items-center border-b pb-4">
                                            <span className="text-slate-500">Tutor</span>
                                            <span className="font-semibold text-slate-900">{tutor.profiles?.full_name}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b pb-4">
                                            <span className="text-slate-500">Date</span>
                                            <span className="font-semibold text-slate-900">{date && format(date, "PPP")}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b pb-4">
                                            <span className="text-slate-500">Time</span>
                                            <span className="font-semibold text-slate-900">{selectedTime}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b pb-4">
                                            <span className="text-slate-500">Topic</span>
                                            <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">{subject}</span>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between bg-slate-50/50 p-6 border-t">
                            {step === 1 ? (
                                <Button className="w-full" size="lg" onClick={() => setStep(2)} disabled={!date || !selectedTime || !subject}>
                                    Next: Confirm Details
                                </Button>
                            ) : (
                                <div className="flex gap-4 w-full">
                                    <Button variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={bookingLoading}>
                                        Back
                                    </Button>
                                    <Button className="flex-[2]" onClick={handleBook} disabled={bookingLoading}>
                                        {bookingLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm & Book"}
                                    </Button>
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
