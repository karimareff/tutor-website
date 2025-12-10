"use client";

import { Button } from "@/components/ui/button";
import { Search, CheckCircle2, Star, Users, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


const HeroSearch = () => {
    const [subject, setSubject] = useState("");
    const router = useRouter();

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (subject) params.set("subject", subject);
        router.push(`/tutors?${params.toString()}`);
    };

    const subjects = [
        "IGCSE Math",
        "SAT English",
        "Physics",
        "Chemistry",
        "Biology",
        "Computer Science",
        "Economics",
        "Business Studies",
    ];

    return (
        <section className="relative overflow-hidden py-16 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.08),rgba(255,255,255,0))]" />

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="container relative z-10 px-4">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            Egypt's #1 Tutoring Platform
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-slate-900">
                        Master <span className="text-primary">Any Subject</span>
                        <br className="hidden sm:block" />
                        with Expert Tutors
                    </h1>

                    {/* Subheadline */}
                    <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
                        Connect with verified, top-rated tutors for ACT, SAT, IGCSE, and more.
                        Personalized learning that fits your schedule.
                    </p>

                    {/* Search Box - The Star */}
                    <div className="max-w-2xl mx-auto mt-8">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 md:p-8 space-y-6">
                            {/* Subject Select */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 text-left block">
                                    What do you want to learn?
                                </label>
                                <Select onValueChange={setSubject}>
                                    <SelectTrigger className="w-full h-14 text-base rounded-xl bg-slate-50 border-slate-200 text-slate-900">
                                        <div className="flex items-center gap-3">
                                            <Search className="h-5 w-5 text-slate-400" />
                                            <SelectValue placeholder="Select a subject..." />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((subj) => (
                                            <SelectItem key={subj} value={subj}>
                                                {subj}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>



                            {/* CTA Button */}
                            <Button
                                size="lg"
                                className="w-full h-14 text-base rounded-xl shadow-lg"
                                onClick={handleSearch}
                            >
                                <Search className="mr-2 h-5 w-5" />
                                Find Tutors
                            </Button>
                        </div>
                    </div>

                    {/* Trust Strip */}
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-6 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>500+ Active Tutors</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>Verified Profiles</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span>4.8/5 Average Rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span>10,000+ Students</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSearch;

