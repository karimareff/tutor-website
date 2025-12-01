import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, Video, GraduationCap } from "lucide-react";

export default function HowItWorksPage() {
    const steps = [
        {
            icon: Search,
            title: "1. Find Your Tutor",
            description: "Browse our verified tutors by subject, exam, or price. Read reviews and check their experience."
        },
        {
            icon: Calendar,
            title: "2. Book a Session",
            description: "Choose a time that works for you. Our smart calendar ensures no double bookings."
        },
        {
            icon: Video,
            title: "3. Learn Online",
            description: "Connect via our integrated video classroom or meet in person if available."
        },
        {
            icon: GraduationCap,
            title: "4. Ace Your Exams",
            description: "Track your progress, get feedback, and achieve your target scores."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <section className="py-20 bg-muted/50">
                    <div className="container text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Getting started is easy. Follow these simple steps to begin your learning journey.
                        </p>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {steps.map((step, index) => (
                                <Card key={index} className="relative">
                                    <CardContent className="pt-6 text-center">
                                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                            <step.icon className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                        <p className="text-muted-foreground">{step.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
