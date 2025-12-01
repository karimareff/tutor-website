'use client'

import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MapPin, Clock, Award, BookOpen, Calendar, MessageSquare } from "lucide-react";
import tutorTeaching from "@/assets/tutor-teaching.jpg";
import { BookingDialog } from "@/components/booking/BookingDialog";

export default function TutorProfilePage() {
    const params = useParams();
    const id = params?.id as string;

    const tutor = {
        name: "Dr. Ahmed Hassan",
        subject: "Mathematics",
        exams: ["SAT", "AST"],
        rating: 4.9,
        reviews: 127,
        price: 300,
        location: "Cairo",
        experience: "8 years",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
        about: "Passionate mathematics educator with over 8 years of experience helping students excel in SAT and AST exams. Specialized in breaking down complex concepts into easy-to-understand lessons. My students have achieved an average score improvement of 150+ points.",
        education: [
            "PhD in Mathematics, Cairo University",
            "Master's in Education, American University in Cairo"
        ],
        achievements: [
            "Helped 200+ students achieve their target scores",
            "Average student improvement: 150 points",
            "SAT Perfect Score Specialist"
        ],
        availability: [
            "Monday-Friday: 4 PM - 9 PM",
            "Saturday-Sunday: 10 AM - 8 PM"
        ]
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <section className="py-12">
                    <div className="container">
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardContent className="p-8">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <img
                                                src={tutor.image}
                                                alt={tutor.name}
                                                className="w-32 h-32 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h1 className="text-3xl font-bold mb-2">{tutor.name}</h1>
                                                        <p className="text-lg text-muted-foreground mb-3">{tutor.subject} Specialist</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {tutor.exams.map((exam) => (
                                                                <Badge key={exam}>{exam}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-6 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Star className="h-4 w-4 fill-accent text-accent" />
                                                        <span className="font-semibold">{tutor.rating}</span>
                                                        <span className="text-muted-foreground">({tutor.reviews} reviews)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <MapPin className="h-4 w-4" />
                                                        {tutor.location}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Clock className="h-4 w-4" />
                                                        {tutor.experience}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5" />
                                            About Me
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">{tutor.about}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5" />
                                            Education & Achievements
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">Education</h4>
                                            <ul className="space-y-1 text-muted-foreground">
                                                {tutor.education.map((edu, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="text-primary mt-1">•</span>
                                                        {edu}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Achievements</h4>
                                            <ul className="space-y-1 text-muted-foreground">
                                                {tutor.achievements.map((achievement, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="text-primary mt-1">•</span>
                                                        {achievement}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Availability
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 text-muted-foreground">
                                            {tutor.availability.map((slot, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-primary" />
                                                    {slot}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="sticky top-24">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="text-center pb-4 border-b">
                                            <div className="text-4xl font-bold text-primary mb-1">{tutor.price} EGP</div>
                                            <div className="text-sm text-muted-foreground">per hour</div>
                                        </div>

                                        <BookingDialog
                                            tutor={{
                                                id: id || "1",
                                                name: tutor.name,
                                                price: tutor.price
                                            }}
                                            trigger={
                                                <Button className="w-full" size="lg" variant="default">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Book a Session
                                                </Button>
                                            }
                                        />

                                        <Button className="w-full" variant="outline" size="lg">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Send Message
                                        </Button>

                                        <div className="pt-4 border-t">
                                            <img
                                                src={tutorTeaching.src}
                                                alt="Tutor teaching"
                                                className="w-full rounded-lg"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
