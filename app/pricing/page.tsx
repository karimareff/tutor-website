import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    const plans = [
        {
            name: "Pay As You Go",
            price: "300",
            description: "Perfect for occasional help",
            features: [
                "1-on-1 Tutoring",
                "Flexible Scheduling",
                "Pay per session",
                "No commitment",
                "Access to all tutors"
            ],
            buttonText: "Find a Tutor",
            href: "/tutors",
            popular: false
        },
        {
            name: "Exam Prep Bundle",
            price: "2500",
            description: "10 hours of intensive prep",
            features: [
                "10 Hours of Tutoring",
                "Save 500 EGP",
                "Priority Booking",
                "Study Plan Included",
                "Progress Tracking"
            ],
            buttonText: "Get Started",
            href: "/signup",
            popular: true
        },
        {
            name: "Semester Pass",
            price: "6000",
            description: "Complete semester support",
            features: [
                "25 Hours of Tutoring",
                "Save 1500 EGP",
                "Dedicated Tutor",
                "24/7 Q&A Support",
                "Mock Exams Included"
            ],
            buttonText: "Contact Us",
            href: "/contact",
            popular: false
        }
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 py-20">
                <div className="container">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
                        <p className="text-xl text-muted-foreground">Invest in your future with affordable, high-quality tutoring.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan) => (
                            <Card key={plan.name} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        <span className="text-muted-foreground"> EGP</span>
                                    </div>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                                        <Link href={plan.href}>{plan.buttonText}</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
