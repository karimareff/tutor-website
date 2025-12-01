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
          profiles:id (
            full_name,
            avatar_url
          )
        `);

            if (error) throw error;
            setTutors(data || []);
        } catch (error) {
            console.error('Error fetching tutors:', error);
            toast.error('Failed to load tutors');
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
                                    <SelectItem value="AST">AST</SelectItem>
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
                            <div className="text-center py-12">Loading tutors...</div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {filteredTutors.map((tutor) => (
                                    <Card key={tutor.id} className="overflow-hidden hover:shadow-[var(--shadow-medium)] transition-shadow group">
                                        <CardContent className="p-0">
                                            <div className="relative h-48 bg-white overflow-hidden">
                                                <img
                                                    src={tutor.profiles?.avatar_url || "https://github.com/shadcn.png"}
                                                    alt={tutor.profiles?.full_name}
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
                                                    <h3 className="font-semibold text-base mb-1 truncate">{tutor.profiles?.full_name}</h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        {tutor.subjects?.join(", ")} Specialist
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {tutor.bio ? "Available" : "Online"}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        5+ years
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-3 border-t">
                                                    <div>
                                                        <div className="text-lg font-bold text-primary">{tutor.hourly_rate} <span className="text-xs font-normal text-muted-foreground">EGP/hr</span></div>
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
