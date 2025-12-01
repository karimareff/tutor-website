"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";

const Hero = () => {
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const containerRef = useRef<HTMLElement>(null);
  const counterRef = useRef(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Snap to grid (4rem = 64px)
      const gridSize = 64;
      const snapX = Math.floor(x / gridSize) * gridSize;
      const snapY = Math.floor(y / gridSize) * gridSize;

      setTrail(prev => {
        const newPoint = { x: snapX, y: snapY, id: counterRef.current++ };
        // Keep last 15 points for a long tail
        const newTrail = [...prev, newPoint].slice(-15);
        // Filter out duplicates to avoid stacking opacity on the same cell
        return newTrail.filter((p, index, self) =>
          index === self.findIndex((t) => t.x === p.x && t.y === p.y)
        );
      });
    }
  };

  // Clear trail gradually when mouse stops
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail(prev => {
        if (prev.length === 0) return prev;
        return prev.slice(1);
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden py-12 md:py-20 lg:py-24 group"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-purple-900/10 to-background animate-gradient-xy bg-[length:400%_400%]" />

      {/* Grid Trail Effect */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="absolute w-16 h-16 bg-primary/20 backdrop-blur-sm transition-all duration-500 ease-out pointer-events-none"
          style={{
            left: point.x,
            top: point.y,
            opacity: (index + 1) / trail.length, // Fade out tail
            transform: `scale(${(index + 1) / trail.length})`, // Shrink tail
            borderRadius: '0.5rem',
          }}
        />
      ))}

      <div className="absolute inset-0" style={{ background: "var(--gradient-mesh)" }} />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      {/* Moving Gradient Blob */}
      <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-r from-primary/30 to-purple-600/30 blur-[120px] animate-blob mix-blend-multiply filter opacity-70" />
      <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-r from-purple-600/30 to-primary/30 blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply filter opacity-70" />

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-md border border-primary/20 shadow-sm hover:shadow-md transition-all duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Now with 500+ verified tutors
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            Master Your <br className="hidden md:block" />
            <span className="relative inline-block mx-2">
              <span className="text-gradient">AST, SAT & EST</span>
              <Sparkles className="absolute -top-6 -right-8 w-8 h-8 text-yellow-400 animate-bounce hidden md:block" />
            </span>
            <br />
            with Egypt's Elite Tutors
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connect with verified, expert tutors who specialize in helping Egyptian students excel.
            <span className="text-foreground font-semibold"> Personalized learning</span>, flexible scheduling, guaranteed results.
          </p>

          {/* Search & CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto pt-4">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for tutors or subjects..."
                className="pl-12 h-14 text-lg bg-background/80 backdrop-blur-sm border-primary/20 focus:border-primary/50 transition-all shadow-sm"
              />
            </div>
            <Button size="lg" asChild className="h-14 px-8 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
              <Link href="/tutors">
                Find Tutors <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto border-t border-border/50 mt-12">
            <div className="group hover:-translate-y-1 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold text-gradient">500+</div>
              <div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Verified Tutors</div>
            </div>
            <div className="group hover:-translate-y-1 transition-transform duration-300 delay-100">
              <div className="text-4xl md:text-5xl font-bold text-gradient">10k+</div>
              <div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Happy Students</div>
            </div>
            <div className="group hover:-translate-y-1 transition-transform duration-300 delay-200">
              <div className="text-4xl md:text-5xl font-bold text-gradient">95%</div>
              <div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
