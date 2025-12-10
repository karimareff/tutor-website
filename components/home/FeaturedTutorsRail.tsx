import { supabase } from "@/lib/supabase";
import TutorCard from "@/components/TutorCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const FeaturedTutorsRail = async () => {
    const { data: tutors } = await supabase
        .from('tutors')
        .select(`
      *,
      profiles (full_name, avatar_url, bio)
    `)
        .order('rating', { ascending: false })
        .limit(8);

    return (
        <section className="py-12 md:py-16 bg-slate-50">
            <div className="container px-4">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                                Recommended for You
                            </h2>
                            <p className="text-sm text-slate-500 hidden md:block">
                                Top-rated tutors ready to help you succeed
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" asChild className="hidden md:flex">
                        <Link href="/tutors" className="gap-2">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {/* Desktop: Grid Layout */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tutors && tutors.length > 0 ? (
                        tutors.slice(0, 4).map((tutor) => (
                            <TutorCard key={tutor.id} tutor={tutor} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No tutors found.
                        </div>
                    )}
                </div>

                {/* Mobile: Horizontal Scrollable Rail */}
                <div className="md:hidden">
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                        {tutors && tutors.length > 0 ? (
                            tutors.map((tutor) => (
                                <div
                                    key={tutor.id}
                                    className="flex-shrink-0 w-[300px] snap-start"
                                >
                                    <TutorCard tutor={tutor} />
                                </div>
                            ))
                        ) : (
                            <div className="w-full text-center py-12 text-slate-500">
                                No tutors found.
                            </div>
                        )}
                    </div>

                    {/* Mobile View All Button */}
                    <div className="mt-4 text-center">
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/tutors" className="gap-2">
                                View All Tutors <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedTutorsRail;
