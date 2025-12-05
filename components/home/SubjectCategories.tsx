import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, GraduationCap, BookOpen } from "lucide-react";
import Link from "next/link";

const categories = [
    {
        id: "american",
        title: "American Diploma",
        subtitle: "SAT, EST, ACT",
        icon: GraduationCap,
        href: "/tutors?category=american",
        count: "120+ tutors"
    },
    {
        id: "igcse",
        title: "British Curriculum",
        subtitle: "IGCSE, A-Levels",
        icon: BookOpen,
        href: "/tutors?category=igcse",
        count: "85+ tutors"
    }
];

const SubjectCategories = () => {
    return (
        <section className="py-16 bg-background">
            <div className="container">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold mb-2">Explore by Category</h2>
                    <p className="text-muted-foreground">Find the perfect tutor for your specific curriculum</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categories.map((category) => (
                        <Link href={category.href} key={category.id} className="group">
                            <Card className="h-full border hover:border-primary/50 hover:shadow-md transition-all duration-300">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <category.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight mb-1">{category.title}</h3>
                                            <p className="text-sm text-muted-foreground font-medium">{category.subtitle}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{category.count}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SubjectCategories;
