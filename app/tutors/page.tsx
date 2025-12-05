'use client'

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Clock, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from "@/components/ui/loading";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import TutorCard from "@/components/TutorCard";

export default function TutorsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedExam, setSelectedExam] = useState("all");
    const [selectedSubject, setSelectedSubject] = useState("all");
    const [tutors, setTutors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTutors();
    }, []);

    const fetchTutors = async () => {
        try {
            const { data, error } = await supabase
                .from('tutors')
                .select(`
                    *,
                    profiles (
                        full_name,
                        avatar_url,
                        bio
                    )
                `);

            if (error) throw error;
            setTutors(data || []);
        } catch (error: any) {
            console.error('Error fetching tutors:', JSON.stringify(error, null, 2));
            toast.error('Failed to load tutors: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const filteredTutors = tutors.filter(tutor => {
        const matchesSearch = tutor.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tutor.subjects?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesExam = selectedExam === "all" || true;
        const matchesSubject = selectedSubject === "all" || tutor.subjects?.includes(selectedSubject);

        return matchesSearch && matchesExam && matchesSubject;
    });

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <section className="bg-muted/50 py-12">
                    <div className="container">
                        <h1 className="text-4xl font-bold mb-4">Find Your Perfect Tutor</h1>
                        <p className="text-muted-foreground text-lg">Browse through our verified tutors and start your journey to success</p>
                    </div>
                </section>

                <section className="py-12">
                    <div className="container">
                        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur py-4 -mx-4 px-4 md:static md:bg-transparent md:p-0 mb-8">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or subject..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="icon" className="md:hidden shrink-0">
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="bottom" className="h-[50vh]">
                                        <SheetHeader>
                                            <SheetTitle>Filters</SheetTitle>
                                        </SheetHeader>
                                        <div className="grid gap-4 py-4">
                                            <Select value={selectedExam} onValueChange={setSelectedExam}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Exam Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Exams</SelectItem>
                                                    <SelectItem value="SAT">SAT</SelectItem>
                                                    <SelectItem value="ACT">ACT</SelectItem>
                                                    <SelectItem value="EST">EST</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Subject" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Subjects</SelectItem>
                                                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                                                    <SelectItem value="English">English</SelectItem>
                                                    <SelectItem value="Physics">Physics</SelectItem>
                                                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                                                    <SelectItem value="Biology">Biology</SelectItem>
                                                    <SelectItem value="History">History</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                <div className="hidden md:flex gap-4">
                                    <Select value={selectedExam} onValueChange={setSelectedExam}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Exam Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Exams</SelectItem>
                                            <SelectItem value="SAT">SAT</SelectItem>
                                            <SelectItem value="ACT">ACT</SelectItem>
                                            <SelectItem value="EST">EST</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Subjects</SelectItem>
                                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                                            <SelectItem value="English">English</SelectItem>
                                            <SelectItem value="Physics">Physics</SelectItem>
                                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                                            <SelectItem value="Biology">Biology</SelectItem>
                                            <SelectItem value="History">History</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <Loading />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTutors.map((tutor) => (
                                    <TutorCard key={tutor.id} tutor={tutor} />
                                ))}
                            </div>
                        )}

                        {!loading && filteredTutors.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                No tutors found matching your criteria.
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
