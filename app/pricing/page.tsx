import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    const plans = [
        {
            name: "Free",
            price: "0",
            description: "For new tutors getting started",
            features: [
                "Up to 5 Students",
                "Unlimited Sessions",
                "Basic Student Portal",
                "Email Support",
                "Manual Payments"
            ],
            buttonText: "Start for Free",
            href: "/signup?role=tutor",
            popular: false
        },
        {
            name: "Pro",
            price: "299",
            description: "For growing tutoring businesses",
            features: [
                "Unlimited Students",
                "Advanced Quizzes & Assignments",
                "Automated Grading",
                "Priority Support",
                "Custom Branding"
            ],
            buttonText: "Start 14-Day Trial",
            href: "/signup?role=tutor",
            popular: true
        },
        {
            name: "Academy",
            price: "Contact",
            description: "For centers and schools",
            features: [
                "Multiple Tutor Accounts",
                "Admin Dashboard",
                "Advanced Analytics",
                "API Access",
                "Dedicated Account Manager"
            ],
            buttonText: "Contact Sales",
            href: "/contact",
            popular: false
        }
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 py-20 bg-slate-50">
                <div className="container">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold mb-4 text-slate-900">Simple Pricing for Tutors</h1>
                        <p className="text-xl text-slate-500">Stop paying commissions. Start building your own academy.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan) => (
                            <Card key={plan.name} className={`relative flex flex-col bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow ${plan.popular ? 'border-blue-600 shadow-lg scale-105 ring-1 ring-blue-600' : ''}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-2xl text-slate-900">{plan.name}</CardTitle>
                                    <CardDescription className="text-slate-500">{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                        {plan.price !== "Contact" && <span className="text-slate-500"> EGP/month</span>}
                                    </div>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm text-slate-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`} variant={plan.popular ? "default" : "outline"} asChild>
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
