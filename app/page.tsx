import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import HeroSearch from "@/components/home/HeroSearch";
import FeaturedTutorsRail from "@/components/home/FeaturedTutorsRail";
import SubjectCategories from "@/components/home/SubjectCategories";
import HowItWorks from "@/components/home/HowItWorks";
import CTA from "@/components/home/CTA";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pb-20 md:pb-0">
                {/* Search-First Hero */}
                <HeroSearch />

                {/* Featured Tutors - Above the Fold */}
                <FeaturedTutorsRail />

                {/* Subject Categories */}
                <SubjectCategories />

                {/* How It Works - Simplified */}
                <HowItWorks />

                {/* CTA */}
                <CTA />
            </main>
            <Footer />

            {/* Mobile Bottom Navigation */}
            <MobileNav />
        </div>
    );
}

