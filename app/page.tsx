import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import PopularTutors from "@/components/home/PopularTutors";
import CTA from "@/components/home/CTA";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <Hero />
                <Stats />
                <Features />
                <HowItWorks />
                <PopularTutors />
                <CTA />
            </main>
            <Footer />
        </div>
    );
}
