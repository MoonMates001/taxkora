import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, FileCheck } from "lucide-react";
import { useState, useEffect } from "react";

const TypingText = ({ texts }: { texts: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <span className={`transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      {texts[currentIndex]}
    </span>
  );
};

const Hero = () => {
  const rotatingTexts = ["Simplified", "Automated", "Stress-Free"];

  return (
    <section className="relative min-h-[95vh] bg-hero overflow-hidden flex items-center">
      {/* Gradient mesh background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-coral-500/15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground leading-[1.1] mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Nigeria's #1 Tax Platform,{" "}
              <span className="relative">
                <span className="text-coral-400">
                  <TypingText texts={rotatingTexts} />
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" aria-hidden="true">
                  <path d="M2 8C50 2 150 2 198 8" stroke="hsl(var(--coral-400))" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-primary-foreground/75 max-w-xl mx-auto lg:mx-0 mb-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Stop overpaying taxes. Our platform automatically finds deductions, computes your taxes, and files your returns—<strong className="text-primary-foreground">saving you an average of ₦150,000/year</strong>.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              {[
                { icon: FileCheck, text: "E-Invoicing" },
                { icon: Zap, text: "Smart Tax Computation" },
                { icon: Shield, text: "NRS Direct Filing" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 backdrop-blur-sm rounded-lg text-primary-foreground/90 text-sm">
                  <item.icon className="w-4 h-4 text-coral-400" />
                  {item.text}
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="accent" size="xl" className="group w-full">
                  Start 90-Day Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-4 mt-6 animate-fade-up" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="h-4 w-px bg-primary-foreground/20 hidden sm:block" />
              <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Cancel anytime</span>
              </div>
              <div className="h-4 w-px bg-primary-foreground/20 hidden sm:block" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
