'use client'

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Message sent successfully!");
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 py-12 bg-slate-50">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl font-bold text-center mb-12 text-slate-900">Get in Touch</h1>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Email</h3>
                                        <p className="text-slate-500">support@tutorwebsite.com</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Phone</h3>
                                        <p className="text-slate-500">+20 123 456 7890</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Office</h3>
                                        <p className="text-slate-500">Cairo, Egypt</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-900">Send us a message</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium text-slate-700">Name</label>
                                        <Input id="name" placeholder="Your name" required className="bg-white border-slate-200 text-slate-900 focus:border-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                                        <Input id="email" type="email" placeholder="Your email" required className="bg-white border-slate-200 text-slate-900 focus:border-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium text-slate-700">Message</label>
                                        <Textarea id="message" placeholder="How can we help?" className="min-h-[120px] bg-white border-slate-200 text-slate-900 focus:border-blue-500" required />
                                    </div>
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Send Message</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
