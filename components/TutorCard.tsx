import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import Link from "next/link";

interface TutorCardProps {
    tutor: any; // Replace 'any' with proper type if available
}

const TutorCard = ({ tutor }: TutorCardProps) => {
    return (
        <Card className="w-full overflow-hidden hover:shadow-lg transition-all duration-300 group border-none shadow-md">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                        <AvatarImage src={tutor.profiles?.avatar_url} className="object-cover" />
                        <AvatarFallback>{tutor.profiles?.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <Badge className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground">
                        {tutor.rating || "5.0"} <Star className="h-3 w-3 ml-1 fill-current" />
                    </Badge>
                </div>

                <div className="space-y-2 w-full">
                    <h3 className="font-bold text-lg truncate">{tutor.profiles?.full_name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {tutor.profiles?.bio || "No bio available"}
                    </p>
                </div>

                <div className="w-full pt-4 border-t flex items-center justify-between">
                    <div className="font-bold text-lg text-primary">
                        {tutor.hourly_rate} <span className="text-xs font-normal text-muted-foreground">EGP/hr</span>
                    </div>
                    <Button size="sm" asChild>
                        <Link href={`/tutors/${tutor.id}`}>View Profile</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default TutorCard;
