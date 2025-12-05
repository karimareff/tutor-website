import { supabase } from "@/lib/supabase";
import TutorCard from "@/components/TutorCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PopularTutors = async () => {
  const { data: tutors } = await supabase
    .from('tutors')
    .select(`
      *,
      profiles (full_name, avatar_url, bio)
    `)
    .limit(6);

  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Popular Tutors
            </h2>
            <p className="text-muted-foreground">
              Meet some of our highest-rated tutors
            </p>
          </div>
          <Button variant="outline" asChild className="hidden md:flex">
            <Link href="/tutors">View All Tutors</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tutors && tutors.length > 0 ? (
            tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No tutors found.
            </div>
          )}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" asChild>
            <Link href="/tutors">View All Tutors</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularTutors;
