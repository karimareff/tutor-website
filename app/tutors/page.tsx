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
import { Star, MapPin, Clock, Search, Filter, ArrowUpDown } from "lucide-react";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from "@/components/ui/loading";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import TutorCard from "@/components/TutorCard";
import TutorCardSkeleton from "@/components/TutorCardSkeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function TutorsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedExam, setSelectedExam] = useState("all");
    const [selectedSubject, setSelectedSubject] = useState("all");
    const [selectedCurriculums, setSelectedCurriculums] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState("rating_desc");
    const [tutors, setTutors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTutors();
        }, 500); // Debounce for slider
        return () => clearTimeout(timer);
    }, [sortBy, selectedCurriculums, selectedExam, selectedSubject]); // Re-fetch when filters change

    const fetchTutors = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('tutors')
                .select(`
                    *,
                    profiles (
                        full_name,
                        avatar_url,
                        bio
                    )
                `);

            if (selectedCurriculums.length > 0) {
                query = query.contains('curriculums', selectedCurriculums);
            }

            if (selectedExam !== 'all') {
                // Assuming exam type is part of curriculums or subjects, or a separate column. 
                // For now, let's assume it's in curriculums if it matches SAT/ACT/EST
                query = query.contains('curriculums', [selectedExam]);
            }

            if (selectedSubject !== 'all') {
                query = query.contains('subjects', [selectedSubject]);
            }

            // Apply Sorting
            if (sortBy === 'rating_desc') {
                query = query.order('rating', { ascending: false });
            }

            const { data, error } = await query;

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
        return matchesSearch;
    });

    const handleCurriculumChange = (curr: string) => {
        setSelectedCurriculums(prev =>
            prev.includes(curr)
                ? prev.filter(c => c !== curr)
                : [...prev, curr]
        );
    };

    const FilterContent = () => (
        <div className="space-y-6">


            <div>
                <h3 className="font-medium mb-3">Curriculum</h3>
                <div className="space-y-2">
                    {['IGCSE', 'SAT', 'EST', 'American Diploma'].map((curr) => (
                        <div key={curr} className="flex items-center space-x-2">
                            <Checkbox
                                id={curr}
                                checked={selectedCurriculums.includes(curr)}
                                onCheckedChange={() => handleCurriculumChange(curr)}
                            />
                            <Label htmlFor={curr} className="text-sm font-normal cursor-pointer">
                                {curr}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-medium mb-3">Subject</h3>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Subjects" />
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
    );

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <section className="bg-slate-50 py-12 border-b border-slate-200">
                    <div className="container">
                        <h1 className="text-4xl font-bold mb-4 text-slate-900">Find Your Perfect Tutor</h1>
                        <p className="text-slate-500 text-lg">Browse through our verified tutors and start your journey to success</p>
                    </div>
                </section>

                <section className="py-12">
                    <div className="container">
                        <div className="container">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Desktop Sidebar */}
                                <aside className="hidden lg:block w-64 shrink-0 space-y-6">
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-2 font-semibold text-lg mb-6">
                                                <Filter className="h-5 w-5" />
                                                Filters
                                            </div>
                                            <FilterContent />
                                        </CardContent>
                                    </Card>
                                </aside>

                                {/* Main Content */}
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-0 z-30 bg-background/95 backdrop-blur py-4 md:static md:bg-transparent md:p-0">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by name or subject..."
                                                className="pl-10"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Sheet>
                                                <SheetTrigger asChild>
                                                    <Button variant="outline" size="icon" className="lg:hidden shrink-0">
                                                        <Filter className="h-4 w-4" />
                                                    </Button>
                                                </SheetTrigger>
                                                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                                    <SheetHeader>
                                                        <SheetTitle>Filters</SheetTitle>
                                                    </SheetHeader>
                                                    <div className="py-6">
                                                        <FilterContent />
                                                    </div>
                                                </SheetContent>
                                            </Sheet>

                                            <Select value={sortBy} onValueChange={setSortBy}>
                                                <SelectTrigger className="w-[180px]">
                                                    <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
                                                    <SelectValue placeholder="Sort By" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="rating_desc">Highest Rated</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                                <TutorCardSkeleton key={i} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
