import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, Video, GraduationCap } from "lucide-react";

export default function HowItWorksPage() {
    const steps = [
        {
            icon: Search,
            title: "1. Create Your Profile",
            description: "Build your professional tutor site in minutes. Showcase your bio, subjects, and experience."
        },
        {
            icon: Video,
            title: "2. Generate Invite Link",
            description: "Get a unique link (e.g., tutorhub.com/join/ahmed) to share with your students on WhatsApp."
        },
        {
            icon: Calendar,
            title: "3. Manage Your Classes",
            description: "Schedule sessions, set assignments, and create quizzes. Everything is organized in one place."
        },
        {
            icon: GraduationCap,
            title: "4. Grow Your Academy",
            description: "Track student progress, automate payments (coming soon), and scale your business."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <section className="py-20 bg-slate-50">
                    <div className="container text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">How It Works</h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                            Launch your digital tutoring academy in 4 simple steps.
                        </p>
                    </div>
                </section>

                <section className="py-20 bg-white">
                    <div className="container">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {steps.map((step, index) => (
                                <Card key={index} className="relative border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6 text-center">
                                        <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                                            <step.icon className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-slate-900">{step.title}</h3>
                                        <p className="text-slate-500">{step.description}</p>
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
