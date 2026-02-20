import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin, DollarSign, BookOpen, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

// This is a Server Component
export default async function TutorPublicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient(); // Use server-side client if available or default

    // Fetch Tutor
    const { data: tutor, error } = await supabase
        .from('tutors')
        .select(`
            *,
            profiles (full_name, avatar_url)
        `)
        .eq('slug', slug)
        .single();

    if (error || !tutor) {
        notFound();
    }



    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-slate-50">
                {/* Hero Section */}
                <div className="bg-white border-b">
                    <div className="container py-12 md:py-20">
                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg shrink-0 relative">
                                {tutor.profiles?.avatar_url ? (
                                    <Image
                                        src={tutor.profiles.avatar_url}
                                        alt={tutor.profiles.full_name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-slate-200 flex items-center justify-center text-4xl font-bold text-slate-400">
                                        {tutor.profiles?.full_name?.[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{tutor.profiles?.full_name}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-600 mb-6">

                                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Online & In-person</span>
                                </div>
                                <p className="text-lg text-slate-600 max-w-2xl mb-8">{tutor.bio || "Passionate tutor dedicated to student success."}</p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                    <Button size="lg" className="px-8" asChild>
                                        <Link href={`/join/${slug}`}>Join My Class</Link>
                                    </Button>
                                    <Button size="lg" variant="outline" asChild>
                                        <Link href={`/tutor/${slug}/book`}>Book a Session</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container py-12">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold mb-4">About Me</h2>
                                <Card>
                                    <CardContent className="p-6 text-slate-600 leading-relaxed">
                                        {tutor.bio || "No bio available."}
                                    </CardContent>
                                </Card>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Subjects</h2>
                                <div className="flex flex-wrap gap-2">
                                    {tutor.subjects?.map((sub: string) => (
                                        <Badge key={sub} variant="secondary" className="text-md py-1 px-3 bg-white border shadow-sm">
                                            {sub}
                                        </Badge>
                                    ))}
                                </div>
                            </section>


                        </div>

                        <div>
                            <Card className="sticky top-24">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="font-bold text-xl">Quick Info</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <BookOpen className="h-5 w-5 text-primary mt-1" />
                                            <div>
                                                <span className="block font-medium">Subjects</span>
                                                <span className="text-sm text-slate-500">{tutor.subjects?.join(', ')}</span>
                                            </div>
                                        </div>

                                    </div>
                                    <Button className="w-full" asChild>
                                        <Link href={`/join/${slug}`}>Start Learning</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
