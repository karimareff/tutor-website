import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock } from "lucide-react";
import Link from "next/link";

const tutors = [
  {
    id: 1,
    name: "Dr. Ahmed Hassan",
    subject: "Mathematics",
    exams: ["SAT", "AST"],
    rating: 4.9,
    reviews: 127,
    price: 300,
    location: "Cairo",
    experience: "8 years",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
  },
  {
    id: 2,
    name: "Sarah Mohamed",
    subject: "English",
    exams: ["SAT", "EST"],
    rating: 4.8,
    reviews: 95,
    price: 280,
    location: "Alexandria",
    experience: "6 years",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
  },
  {
    id: 3,
    name: "Mohamed Ali",
    subject: "Physics",
    exams: ["AST", "SAT"],
    rating: 4.9,
    reviews: 143,
    price: 320,
    location: "Giza",
    experience: "10 years",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
  }
];

const PopularTutors = () => {
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tutors.map((tutor) => (
            <Card key={tutor.id} className="overflow-hidden hover:shadow-[var(--shadow-medium)] transition-shadow group">
              <CardContent className="p-0">
                <div className="relative h-48 bg-white overflow-hidden">
                  <img
                    src={tutor.image}
                    alt={tutor.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-white/90 text-black backdrop-blur-sm shadow-sm hover:bg-white">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      {tutor.rating}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-base mb-1 truncate">{tutor.name}</h3>
                    <p className="text-xs text-muted-foreground">{tutor.subject} Specialist</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {tutor.exams.map((exam) => (
                      <Badge key={exam} variant="secondary" className="text-[10px] px-1.5 h-5">{exam}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {tutor.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {tutor.experience}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <div className="text-lg font-bold text-primary">{tutor.price} <span className="text-xs font-normal text-muted-foreground">EGP/hr</span></div>
                    </div>
                    <Button size="sm" className="h-8 text-xs" asChild>
                      <Link href={`/tutors/${tutor.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
