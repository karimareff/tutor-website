import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 bg-slate-50">
                    <div className="container text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">About TutorHub</h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                            We are dedicated to connecting students with the best tutors in Egypt to help them achieve their academic goals.
                        </p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-20 bg-white">
                    <div className="container">
                        <div className="grid md:grid-cols-3 gap-8">
                            <Card className="text-center border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                        <Target className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 text-slate-900">Our Mission</h3>
                                    <p className="text-slate-500">
                                        To provide accessible, high-quality education to every student through personalized tutoring.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="text-center border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 text-slate-900">Our Community</h3>
                                    <p className="text-slate-500">
                                        A growing network of verified tutors and ambitious students working together.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="text-center border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                        <Heart className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 text-slate-900">Our Values</h3>
                                    <p className="text-slate-500">
                                        Excellence, integrity, and a passion for learning drive everything we do.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
