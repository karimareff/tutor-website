'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Video, CheckCircle2, BookOpen } from "lucide-react";
import Link from "next/link";

interface TutorCardProps {
    tutor: any;
}

const TutorCard = ({ tutor }: TutorCardProps) => {
    const isOnline = true;
    const location = "New Cairo Center";
    const isVerified = true;
    const subjects = tutor.subjects || (tutor.subject ? [tutor.subject] : ["Mathematics", "Physics"]);
    const headline = tutor.profiles?.bio ? tutor.profiles.bio.split('.')[0] : "Certified Tutor";
    const curriculums = tutor.curriculums || [];

    return (
        <Card className="w-full overflow-hidden hover:shadow-xl transition-all duration-300 group border shadow-sm rounded-xl flex flex-col h-full">
            <div className="relative h-48 bg-muted/30 flex items-center justify-center pt-6 pb-12">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                        <AvatarImage src={tutor.profiles?.avatar_url} className="object-cover" />
                        <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                            {tutor.profiles?.full_name?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    {isVerified && (
                        <Badge variant="secondary" className="absolute -top-2 -right-12 bg-blue-50 text-blue-700 border-blue-100 shadow-sm gap-1 px-2 py-0.5">
                            <CheckCircle2 className="h-3 w-3 fill-blue-700 text-white" />
                            Verified
                        </Badge>
                    )}
                </div>
            </div>

            <CardContent className="p-6 pt-0 flex-1 flex flex-col -mt-8 relative z-10">
                <div className="bg-card rounded-xl p-4 shadow-sm border mb-4 text-center">
                    <h3 className="font-bold text-xl mb-1 truncate">{tutor.profiles?.full_name}</h3>
                    <p className="text-sm text-muted-foreground font-medium line-clamp-1 mb-3">{headline}</p>

                    {/* Curriculum Badges */}
                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                        {curriculums.includes('IGCSE') && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 text-[10px] px-2 py-0.5">
                                IGCSE
                            </Badge>
                        )}
                        {curriculums.includes('American Diploma') && (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 text-[10px] px-2 py-0.5">
                                American
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-foreground">{tutor.rating || "5.0"}</span>
                            <span className="text-xs">(85 reviews)</span>
                        </div>
                        <span className="text-muted-foreground/30">|</span>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs truncate max-w-[100px]">{location}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap justify-center gap-2">
                        {Array.isArray(subjects) && subjects.slice(0, 3).map((subject: string, i: number) => (
                            <Badge key={i} variant="secondary" className="font-normal text-xs">
                                {subject}
                            </Badge>
                        ))}
                        {Array.isArray(subjects) && subjects.length > 3 && (
                            <Badge variant="secondary" className="font-normal text-xs">+{subjects.length - 3}</Badge>
                        )}
                    </div>

                    <div className="flex items-center justify-between py-2 border-t border-b border-dashed">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Video className="h-4 w-4" />
                            <span>Online & In-person</span>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-primary">{tutor.hourly_rate}</span>
                            <span className="text-xs text-muted-foreground font-medium"> EGP/session</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                    <Button variant="outline" className="w-full" asChild>
                        <Link href={`/tutors/${tutor.id}`}>
                            Message
                        </Link>
                    </Button>
                    <Button className="w-full" asChild>
                        <Link href={`/tutors/${tutor.id}`}>
                            Book Now
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default TutorCard;
