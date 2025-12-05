"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, User } from "lucide-react";

interface SessionListProps {
    bookings: any[];
}

const SessionList = ({ bookings }: SessionListProps) => {
    if (bookings.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No upcoming bookings yet.
            </div>
        );
    }

    return (
        <>
            {/* Mobile View: Card Stack */}
            <div className="flex flex-col gap-4 md:hidden">
                {bookings.map((booking) => (
                    <Card key={booking.id}>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="font-semibold text-lg">{booking.session.subject}</div>
                                <div className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
                                    {booking.session.location}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-primary" />
                                <div className="flex flex-col">
                                    <span className="font-medium">{booking.students?.full_name || 'Unknown'}</span>
                                    <span className="text-xs text-muted-foreground">{booking.students?.email}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground pt-2 border-t">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(booking.session.start_time), 'MMM d, yyyy')}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {format(new Date(booking.session.start_time), 'h:mm a')}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Student</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Subject</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date & Time</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td className="p-4 align-middle">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{booking.students?.full_name || 'Unknown'}</span>
                                        <span className="text-xs text-muted-foreground">{booking.students?.email}</span>
                                    </div>
                                </td>
                                <td className="p-4 align-middle">{booking.session.subject}</td>
                                <td className="p-4 align-middle">
                                    <div className="flex flex-col">
                                        <span>{format(new Date(booking.session.start_time), 'MMM d, yyyy')}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(booking.session.start_time), 'h:mm a')} - {format(new Date(booking.session.end_time), 'h:mm a')}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 align-middle">{booking.session.location}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default SessionList;
