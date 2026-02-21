import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    CheckCircle,
    Globe,
    Calendar,
    Users,
    BarChart3,
    ArrowRight,
    BookOpen,
    BrainCircuit,
    Shield,
    Zap,
    Star,
    Sparkles,
    ChevronRight,
    GraduationCap,
    MessageSquare,
    Clock,
    Check,
    X,
} from "lucide-react";
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
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <main className="flex-1">

                {/* ══════════════════════════════════════════════
                    HERO SECTION
                ══════════════════════════════════════════════ */}
                <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white" />
                        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
                        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-indigo-100/40 rounded-full blur-3xl" />
                    </div>

                    <div className="container px-4 mx-auto text-center relative z-10">
                        <div className="mx-auto max-w-4xl">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm text-blue-700 font-medium mb-8">
                                <Sparkles className="h-4 w-4" />
                                The all-in-one platform for private tutors
                            </div>

                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                                Your tutoring deserves
                                <br />
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                    its own academy
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                                Create a branded learning portal for your students. Assignments, quizzes, sessions — everything in one professional space.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-200 transition-all" asChild>
                                    <Link href="/signup?role=tutor">
                                        Launch Your Academy
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-slate-200 text-slate-700 hover:bg-slate-50" asChild>
                                    <Link href="#how-it-works">See How It Works</Link>
                                </Button>
                            </div>

                            <p className="mt-6 text-sm text-slate-400 flex items-center justify-center gap-4">
                                <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-green-500" /> Free to start</span>
                                <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-green-500" /> No credit card</span>
                                <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-green-500" /> Setup in 2 minutes</span>
                            </p>
                        </div>

                        {/* Hero Visual — Academy Preview */}
                        <div className="mt-16 max-w-5xl mx-auto">
                            <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-200/60 overflow-hidden">
                                {/* Fake browser bar */}
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-300" />
                                        <div className="w-3 h-3 rounded-full bg-amber-300" />
                                        <div className="w-3 h-3 rounded-full bg-green-300" />
                                    </div>
                                    <div className="flex-1 flex justify-center">
                                        <div className="bg-white rounded-lg px-4 py-1.5 text-xs text-slate-400 border w-64 text-center">
                                            academy/ahmed-math
                                        </div>
                                    </div>
                                </div>
                                {/* Academy preview mockup */}
                                <div className="p-6 md:p-8 space-y-4">
                                    {/* Top nav mockup */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600" />
                                            <div>
                                                <div className="h-3 w-32 bg-slate-800 rounded" />
                                                <div className="h-2 w-20 bg-slate-300 rounded mt-1.5" />
                                            </div>
                                        </div>
                                        <div className="hidden md:flex items-center gap-4">
                                            <div className="h-2.5 w-12 bg-blue-500 rounded" />
                                            <div className="h-2.5 w-16 bg-slate-200 rounded" />
                                            <div className="h-2.5 w-14 bg-slate-200 rounded" />
                                            <div className="h-2.5 w-12 bg-slate-200 rounded" />
                                        </div>
                                    </div>
                                    {/* Hero banner mockup */}
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 md:p-8 flex items-center gap-6">
                                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-white/20 flex-shrink-0" />
                                        <div className="space-y-2">
                                            <div className="h-4 md:h-5 w-48 bg-white/90 rounded" />
                                            <div className="h-3 w-64 bg-white/40 rounded" />
                                        </div>
                                    </div>
                                    {/* Cards mockup */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Assignments', 'Quizzes', 'Sessions'].map((label) => (
                                            <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <div className="h-8 w-8 rounded-lg bg-blue-100 mb-3" />
                                                <div className="h-3 w-20 bg-slate-300 rounded mb-1.5" />
                                                <div className="h-2 w-14 bg-slate-200 rounded" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Glow effect under the preview */}
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-blue-400/10 blur-3xl rounded-full" />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    SOCIAL PROOF
                ══════════════════════════════════════════════ */}
                <section className="py-12 border-y border-slate-100 bg-slate-50/50">
                    <div className="container px-4 mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center">
                            <div>
                                <div className="text-3xl font-bold text-slate-900">100+</div>
                                <div className="text-sm text-slate-500">Tutors launched</div>
                            </div>
                            <div className="hidden md:block w-px h-10 bg-slate-200" />
                            <div>
                                <div className="text-3xl font-bold text-slate-900">1,000+</div>
                                <div className="text-sm text-slate-500">Students enrolled</div>
                            </div>
                            <div className="hidden md:block w-px h-10 bg-slate-200" />
                            <div>
                                <div className="text-3xl font-bold text-slate-900">5,000+</div>
                                <div className="text-sm text-slate-500">Assignments graded</div>
                            </div>
                            <div className="hidden md:block w-px h-10 bg-slate-200" />
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                                ))}
                                <span className="text-sm text-slate-500 ml-2">Loved by tutors</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    HOW IT WORKS — 3 Steps
                ══════════════════════════════════════════════ */}
                <section className="py-24" id="how-it-works">
                    <div className="container px-4 mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-sm text-emerald-700 font-medium mb-4">
                                <Clock className="h-3.5 w-3.5" />
                                2-minute setup
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Launch your academy in 3 steps</h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">No technical skills needed. Set up your branded learning portal and start teaching in minutes.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {[
                                {
                                    step: "01",
                                    color: "#6366f1",
                                    title: "Create Your Account",
                                    desc: "Sign up as a tutor. Choose your academy name, pick a brand color, and set your subjects.",
                                    icon: GraduationCap,
                                },
                                {
                                    step: "02",
                                    color: "#0ea5e9",
                                    title: "Customize Your Academy",
                                    desc: "Add a welcome message, upload assignments and quizzes, set up your session schedule.",
                                    icon: Sparkles,
                                },
                                {
                                    step: "03",
                                    color: "#22c55e",
                                    title: "Share & Start Teaching",
                                    desc: "Send your unique academy link to students. They join and see your branded portal instantly.",
                                    icon: ArrowRight,
                                },
                            ].map((item) => (
                                <div key={item.step} className="relative group">
                                    <div className="bg-white rounded-2xl border border-slate-100 p-8 hover:shadow-lg transition-all duration-300 h-full">
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-4xl font-bold" style={{ color: `${item.color}30` }}>{item.step}</span>
                                            <div
                                                className="h-10 w-10 rounded-xl flex items-center justify-center"
                                                style={{ backgroundColor: `${item.color}10`, color: item.color }}
                                            >
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                        <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    FEATURES GRID
                ══════════════════════════════════════════════ */}
                <section className="py-24 bg-slate-50" id="features">
                    <div className="container px-4 mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-sm text-blue-700 font-medium mb-4">
                                <Zap className="h-3.5 w-3.5" />
                                Powerful features
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Everything your academy needs</h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Built specifically for private tutors and coaching centers. No generic tool — this is made for you.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {[
                                {
                                    icon: Globe,
                                    title: "Your Own Branded Portal",
                                    desc: "Students see your academy name, your colors, your logo. It looks and feels like your own website.",
                                    color: "#6366f1",
                                },
                                {
                                    icon: BookOpen,
                                    title: "Assignments & Grading",
                                    desc: "Create assignments with file attachments. Students submit online. Grade and give feedback in one place.",
                                    color: "#f97316",
                                },
                                {
                                    icon: BrainCircuit,
                                    title: "Interactive Quizzes",
                                    desc: "Build quizzes with auto-grading for multiple choice. Students get instant results and scores.",
                                    color: "#22c55e",
                                },
                                {
                                    icon: Calendar,
                                    title: "Session Booking",
                                    desc: "Set your availability. Students book sessions online. Integrated video call links for remote tutoring.",
                                    color: "#0ea5e9",
                                },
                                {
                                    icon: Users,
                                    title: "Student Management",
                                    desc: "Invite students via link. Track enrollment, progress, and engagement — all from your dashboard.",
                                    color: "#f43f5e",
                                },
                                {
                                    icon: BarChart3,
                                    title: "Progress Tracking",
                                    desc: "Monitor quiz scores, assignment grades, and session attendance. Keep students and parents informed.",
                                    color: "#8b5cf6",
                                },
                            ].map((feature, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-100/80 p-8 hover:shadow-lg hover:border-slate-200 transition-all duration-300 group">
                                    <div
                                        className="h-12 w-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                                        style={{ backgroundColor: `${feature.color}10`, color: feature.color }}
                                    >
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                    <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    COMPARISON TABLE
                ══════════════════════════════════════════════ */}
                <section className="py-24">
                    <div className="container px-4 mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Stop using the wrong tools</h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">WhatsApp groups and spreadsheets weren&apos;t made for teaching. TutorHub was.</p>
                        </div>

                        <div className="max-w-4xl mx-auto overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-4 px-4 text-sm font-medium text-slate-500 w-1/4">Feature</th>
                                        <th className="text-center py-4 px-4 w-1/4">
                                            <div className="text-sm text-slate-400">WhatsApp</div>
                                        </th>
                                        <th className="text-center py-4 px-4 w-1/4">
                                            <div className="text-sm text-slate-400">Spreadsheets</div>
                                        </th>
                                        <th className="text-center py-4 px-4 w-1/4">
                                            <div className="text-sm font-bold text-blue-600 flex items-center justify-center gap-1">
                                                <GraduationCap className="h-4 w-4" />
                                                TutorHub
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {[
                                        ["Branded student portal", false, false, true],
                                        ["Assignment management", false, false, true],
                                        ["Auto-graded quizzes", false, false, true],
                                        ["Session booking", false, false, true],
                                        ["Progress tracking", false, true, true],
                                        ["Professional look", false, false, true],
                                        ["Invite link for students", false, false, true],
                                        ["Works on mobile", true, false, true],
                                    ].map(([feature, whatsapp, sheets, tutorhub], i) => (
                                        <tr key={i} className="border-b border-slate-100">
                                            <td className="py-3.5 px-4 text-slate-700 font-medium">{feature as string}</td>
                                            <td className="py-3.5 px-4 text-center">
                                                {whatsapp
                                                    ? <Check className="h-4 w-4 text-slate-400 mx-auto" />
                                                    : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {sheets
                                                    ? <Check className="h-4 w-4 text-slate-400 mx-auto" />
                                                    : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {tutorhub
                                                    ? <Check className="h-4 w-4 text-blue-600 mx-auto" />
                                                    : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    TESTIMONIALS
                ══════════════════════════════════════════════ */}
                <section className="py-24 bg-slate-50">
                    <div className="container px-4 mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Tutors love TutorHub</h2>
                            <p className="text-lg text-slate-500">Here&apos;s what educators are saying</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {[
                                {
                                    quote: "My students now have a professional portal instead of receiving homework on WhatsApp. It's a game changer.",
                                    name: "Ahmed K.",
                                    role: "Math Tutor",
                                    color: "#6366f1",
                                },
                                {
                                    quote: "I set up my academy in 5 minutes. The quizzes auto-grade themselves — I save hours every week.",
                                    name: "Sara M.",
                                    role: "English Teacher",
                                    color: "#0ea5e9",
                                },
                                {
                                    quote: "Parents are impressed when they see the branded academy page. It makes me look much more professional.",
                                    name: "Omar H.",
                                    role: "Science Tutor",
                                    color: "#22c55e",
                                },
                            ].map((testimonial, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-8">
                                    <div className="flex gap-0.5 mb-4">
                                        {[...Array(5)].map((_, j) => (
                                            <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-600 leading-relaxed mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                            style={{ backgroundColor: testimonial.color }}
                                        >
                                            {testimonial.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900 text-sm">{testimonial.name}</div>
                                            <div className="text-xs text-slate-500">{testimonial.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    FAQ
                ══════════════════════════════════════════════ */}
                <section className="py-24">
                    <div className="container px-4 mx-auto max-w-3xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently asked questions</h2>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    q: "Is TutorHub really free?",
                                    a: "Yes! You can create your academy, add students, create assignments and quizzes — all for free. Premium features will be available in the future.",
                                },
                                {
                                    q: "Do I need technical skills?",
                                    a: "Not at all. If you can use WhatsApp, you can use TutorHub. Just sign up, name your academy, and share your link with students.",
                                },
                                {
                                    q: "What do my students see?",
                                    a: "Students get a branded learning portal with your academy name, colors, and welcome message. They can view assignments, take quizzes, and book sessions.",
                                },
                                {
                                    q: "Can I have multiple subjects?",
                                    a: "Absolutely. You can list all your subjects and create assignments and quizzes for each one.",
                                },
                                {
                                    q: "How do students join my academy?",
                                    a: "You share a unique invite link. Students click it, create an account (or log in), and they're automatically enrolled in your academy.",
                                },
                            ].map((faq, i) => (
                                <details key={i} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                        <span className="font-semibold text-slate-900">{faq.q}</span>
                                        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-90" />
                                    </summary>
                                    <div className="px-6 pb-6 text-slate-500 leading-relaxed -mt-2">
                                        {faq.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    FINAL CTA
                ══════════════════════════════════════════════ */}
                <section className="py-24">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl">
                            {/* Gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600" />
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative p-12 md:p-16 text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm text-white/80 font-medium mb-6 backdrop-blur-sm">
                                    <Zap className="h-3.5 w-3.5" />
                                    Ready in 2 minutes
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                    Your students deserve better
                                    <br />
                                    than a WhatsApp group
                                </h2>
                                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                                    Launch your professional tutoring academy today. It&apos;s free, it&apos;s fast, and your students will love it.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button size="lg" className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-blue-50 rounded-full shadow-lg" asChild>
                                        <Link href="/signup?role=tutor">
                                            Launch Your Academy
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                </div>
                                <p className="mt-6 text-sm text-white/50">Free forever for core features · No credit card required</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
