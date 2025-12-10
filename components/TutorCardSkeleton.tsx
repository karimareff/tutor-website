import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const TutorCardSkeleton = () => {
    return (
        <Card className="w-full overflow-hidden border shadow-sm rounded-xl flex flex-col h-full">
            {/* Header / Avatar Section */}
            <div className="relative h-48 bg-muted/30 flex items-center justify-center pt-6 pb-12">
                <div className="relative">
                    <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
                </div>
            </div>

            <CardContent className="p-6 pt-0 flex-1 flex flex-col -mt-8 relative z-10">
                {/* Info Card */}
                <div className="bg-card rounded-xl p-4 shadow-sm border mb-4 text-center space-y-3">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />

                    {/* Badges */}
                    <div className="flex justify-center gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                    </div>

                    {/* Rating & Location */}
                    <div className="flex justify-center gap-4 pt-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>

                {/* Subjects */}
                <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap justify-center gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>

                    {/* Price & Video */}
                    <div className="flex items-center justify-between py-2 border-t border-b border-dashed">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex flex-col items-end gap-1">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    );
};

export default TutorCardSkeleton;
