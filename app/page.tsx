import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Globe, Calendar, Users, BarChart3, ArrowRight } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        if (user.user_metadata?.role === 'tutor') {
            redirect('/dashboard/teacher');
        } else if (user.user_metadata?.role === 'student') {
            redirect('/dashboard/student');
        } else if (user.user_metadata?.role === 'admin') {
            redirect('/dashboard/admin');
        }
        // If no role or other role, stay on landing (or redirect to generic dashboard)
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-20 pb-32 overflow-hidden">
                    <div className="container px-4 mx-auto text-center relative z-10">
                        <div className="mx-auto max-w-4xl">
                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
                                Launch Your Own <span className="text-blue-600">Tutoring Academy</span> in Minutes
                            </h1>
                            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Stop using messy spreadsheets and WhatsApp. Get a professional website, booking system, and student portal—all in one place.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 rounded-full" asChild>
                                    <Link href="/signup?role=tutor">Start for Free</Link>
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-blue-200 text-blue-700 hover:bg-blue-50" asChild>
                                    <Link href="/login">Log In</Link>
                                </Button>
                            </div>
                            <p className="mt-6 text-sm text-slate-500">No credit card required · Cancel anytime</p>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-input from-blue-50 to-white -z-10" />
                </section>

                {/* Features Grid */}
                <section className="py-20 bg-slate-50" id="features">
                    <div className="container px-4 mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to run your classes</h2>
                            <p className="text-lg text-slate-600">Built specifically for private tutors and coaching centers.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Globe,
                                    title: "Your Own Branded Website",
                                    desc: "Get a professional subdomain (you.platform.com) to showcase your bio, subjects, and reviews."
                                },
                                {
                                    icon: Calendar,
                                    title: "Automated Booking",
                                    desc: "Set your schedule and let students book online. No more back-and-forth messages."
                                },
                                {
                                    icon: Users,
                                    title: "Student Portal",
                                    desc: "Give your students a dedicated dashboard to view homework, take quizzes, and track progress."
                                },
                                {
                                    icon: CheckCircle,
                                    title: "Assignments & Quizzes",
                                    desc: "Create and grade assignments/quizzes easily. Auto-grading for multiple choice questions."
                                },
                                {
                                    icon: BarChart3,
                                    title: "Progress Reports",
                                    desc: "Keep parents in the loop with automated progress reports and attendance tracking."
                                },
                                {
                                    icon: Globe,
                                    title: "Secure Payments",
                                    desc: "Accept payments online (Coming Soon) or track cash payments manually."
                                }
                            ].map((feature, i) => (
                                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing / CTA */}
                <section className="py-20 bg-white">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-4xl mx-auto bg-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to professionalize your tutoring?</h2>
                                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                                    Join thousands of tutors who use our platform to save time and grow their business.
                                </p>
                                <Button size="lg" className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-blue-50 rounded-full" asChild>
                                    <Link href="/signup?role=tutor">Get Started Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
}
