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
import { Star, MapPin, Clock, Search } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from "@/components/ui/loading";

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
                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or subject..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={selectedExam} onValueChange={setSelectedExam}>
                                <SelectTrigger className="w-full md:w-48">
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
                                <SelectTrigger className="w-full md:w-48">
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

                        {loading ? (
                            <Loading />
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {filteredTutors.map((tutor) => (
                                    <Card key={tutor.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-none shadow-md">
                                        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                            <div className="relative">
                                                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                                    <AvatarImage src={tutor.profiles?.avatar_url} className="object-cover" />
                                                    <AvatarFallback>{tutor.profiles?.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <Badge className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground">
                                                    {tutor.rating || "5.0"} <Star className="h-3 w-3 ml-1 fill-current" />
                                                </Badge>
                                            </div>

                                            <div className="space-y-2 w-full">
                                                <h3 className="font-bold text-lg truncate">{tutor.profiles?.full_name}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                                    {tutor.profiles?.bio || "No bio available"}
                                                </p>
                                            </div>

                                            <div className="w-full pt-4 border-t flex items-center justify-between">
                                                <div className="font-bold text-lg text-primary">
                                                    {tutor.hourly_rate} <span className="text-xs font-normal text-muted-foreground">EGP/hr</span>
                                                </div>
                                                <Button size="sm" asChild>
                                                    <Link href={`/tutors/${tutor.id}`}>View Profile</Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
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
