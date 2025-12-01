import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface BookingModalProps {
    tutorId?: string;
    tutorName?: string;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function BookingModal({ tutorId: initialTutorId, tutorName: initialTutorName, trigger, onSuccess }: BookingModalProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date>();
    const [time, setTime] = useState<string>();
    const [subject, setSubject] = useState("");
    const [loading, setLoading] = useState(false);

    // If tutorId is not provided, we need to fetch tutors to select from
    const [tutors, setTutors] = useState<any[]>([]);
    const [selectedTutorId, setSelectedTutorId] = useState<string | undefined>(initialTutorId);

    useEffect(() => {
        if (!initialTutorId && open) {
            fetchTutors();
        } else if (initialTutorId) {
            setSelectedTutorId(initialTutorId);
        }
    }, [initialTutorId, open]);

    const fetchTutors = async () => {
        try {
            const { data, error } = await supabase
                .from('tutors')
                .select(`
          id,
          profiles:id (full_name)
        `);

            if (error) throw error;
            setTutors(data || []);
        } catch (error) {
            console.error('Error fetching tutors:', error);
        }
    };

    const handleBooking = async () => {
        if (!user) {
            toast.error("You must be logged in to book a lesson.");
            return;
        }
        if (!selectedTutorId) {
            toast.error("Please select a tutor.");
            return;
        }
        if (!date) {
            toast.error("Please select a date.");
            return;
        }
        if (!time) {
            toast.error("Please select a time.");
            return;
        }
        if (!subject) {
            toast.error("Please enter a subject.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('bookings')
                .insert({
                    student_id: user.id,
                    tutor_id: selectedTutorId,
                    date: format(date, 'yyyy-MM-dd'),
                    time: time,
                    subject: subject,
                    status: 'pending'
                });

            if (error) throw error;

            toast.success("Booking request sent successfully!");
            setOpen(false);
            if (onSuccess) onSuccess();

            // Reset form
            setDate(undefined);
            setTime(undefined);
            setSubject("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Generate time slots (e.g., 9 AM to 8 PM)
    const timeSlots = Array.from({ length: 12 }, (_, i) => {
        const hour = i + 9;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Book a Lesson</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book a Lesson</DialogTitle>
                    <DialogDescription>
                        Schedule a session with {initialTutorName || "a tutor"}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    {/* Tutor Selection if not provided */}
                    {!initialTutorId && (
                        <div className="grid gap-2">
                            <Label htmlFor="tutor">Select Tutor</Label>
                            <Select onValueChange={setSelectedTutorId} value={selectedTutorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a tutor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tutors.map((tutor) => (
                                        <SelectItem key={tutor.id} value={tutor.id}>
                                            {tutor.profiles?.full_name || "Unknown Tutor"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label>Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid gap-2">
                        <Label>Time</Label>
                        <Select onValueChange={setTime} value={time}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                                {timeSlots.map((slot) => (
                                    <SelectItem key={slot} value={slot}>
                                        {slot}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="subject">Subject / Topic</Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. Calculus, Physics, etc."
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleBooking} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Booking
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
