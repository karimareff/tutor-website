import { ArrowRight, Search, MessageSquare, Calendar, Trophy } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find Your Tutor",
    description: "Browse through hundreds of verified tutors and filter by subject, exam type, and availability"
  },
  {
    icon: MessageSquare,
    title: "Connect & Discuss",
    description: "Message tutors directly to discuss your goals, schedule, and learning preferences"
  },
  {
    icon: Calendar,
    title: "Book Sessions",
    description: "Schedule sessions at times that work for you with our easy booking system"
  },
  {
    icon: Trophy,
    title: "Achieve Success",
    description: "Work with your tutor to reach your target score and ace your exams"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="flex flex-col items-center text-center group hover:scale-105 transition-transform">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-[var(--shadow-glow)] group-hover:shadow-[var(--shadow-medium)] transition-shadow animate-[gradient_3s_ease_infinite] bg-[length:200%_auto]">
                    <step.icon className="h-9 w-9 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold shadow-lg ring-4 ring-background">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5">
                  <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <div className="w-full h-full border-t-2 border-dashed border-muted-foreground/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
