import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface BookingDialogProps {
    tutor: {
        id: string;
        name: string;
        price: number;
    };
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

const TIME_SLOTS = [
    "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00",
    "18:00", "19:00", "20:00"
];

export function BookingDialog({ tutor, trigger, onSuccess }: BookingDialogProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [subject, setSubject] = useState("");
    const [step, setStep] = useState<1 | 2>(1);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleBook = async () => {
        if (!user) {
            toast.error("Please login to book a lesson");
            return;
        }

        if (!date || !selectedTime || !subject) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
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

            toast.success("Booking confirmed!", {
                description: `Lesson with ${tutor.name} on ${format(date, "MMM d")} at ${selectedTime}`
            });
            setIsOpen(false);
            setStep(1);
            setSelectedTime(null);
            setSubject("");
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.message || "Failed to create booking");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || <Button size="lg">Book Now</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Book a Lesson with {tutor.name}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        Select Date
                                    </h4>
                                    <div className="border rounded-md p-6 flex justify-center items-center min-h-[300px]">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            className="rounded-md transform scale-110 origin-center"
                                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Select Time
                                    </h4>
                                    <ScrollArea className="h-[300px] border rounded-md p-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            {TIME_SLOTS.map((time) => (
                                                <Button
                                                    key={time}
                                                    variant={selectedTime === time ? "default" : "outline"}
                                                    className="w-full justify-start"
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
                                <Label htmlFor="subject">Subject / Topic</Label>
                                <Input
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Calculus, Physics, SAT Prep"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-xl">Confirm Booking</h3>
                                <p className="text-muted-foreground">
                                    {date && format(date, "EEEE, MMMM d, yyyy")} at {selectedTime}
                                </p>
                                <p className="font-medium text-lg text-primary">{tutor.price} EGP</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 1 ? (
                        <Button
                            onClick={() => setStep(2)}
                            disabled={!date || !selectedTime || !subject}
                            className="w-full md:w-auto"
                        >
                            Continue
                        </Button>
                    ) : (
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>Back</Button>
                            <Button onClick={handleBook} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Booking
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
