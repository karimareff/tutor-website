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
              <span className="text-gradient">ACT, SAT & EST</span>
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
          <div className="flex flex-col items-center gap-8 pt-8 w-full">
            {/* Large Search Bar */}
            <div className="w-full max-w-2xl relative z-20">
              <div className="relative flex items-center group">
                <Search className="absolute left-5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="What do you want to learn? (e.g. SAT, Math, Physics)"
                  className="w-full h-16 pl-14 pr-32 rounded-full text-lg bg-background/95 backdrop-blur-xl border-primary/20 focus:border-primary/50 shadow-2xl shadow-primary/5 transition-all"
                />
                <div className="absolute right-2 top-2 bottom-2">
                  <Button size="lg" className="h-full rounded-full px-8 shadow-lg">
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button size="lg" asChild className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-full">
                <Link href="/tutors">
                  Browse All Tutors <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base hover:bg-primary/5 transition-all rounded-full border-primary/20">
                <Link href="/signup">
                  Become a Tutor
                </Link>
              </Button>
            </div>
          </div>


        </div>
      </div>
    </section>
  );
};

export default Hero;
