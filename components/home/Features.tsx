import { CheckCircle, Clock, Shield, Star, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Expert Tutors",
    description: "Connect with certified tutors who specialize in AST, SAT, and EST preparation"
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "All tutors undergo thorough background checks and credential verification"
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Book sessions that fit your schedule with easy online calendar management"
  },
  {
    icon: Star,
    title: "Rated by Students",
    description: "Read authentic reviews and ratings from students who achieved their goals"
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your improvement with detailed analytics and performance reports"
  },
  {
    icon: CheckCircle,
    title: "Guaranteed Results",
    description: "Our tutors are committed to helping you achieve your target scores"
  }
];

const Features = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/30" />
      <div className="container relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose TutorHub Egypt?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We make finding the perfect tutor simple, safe, and effective
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--shadow-medium)] hover:-translate-y-1 bg-card/50 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
