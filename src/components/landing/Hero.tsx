import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, FileCheck, Play, Star, Users, TrendingUp } from "lucide-react";
import { useCountAnimation } from "@/hooks/useCountAnimation";
import { useState, useEffect } from "react";

const AnimatedStat = ({ endValue, suffix, label }: { endValue: number; suffix: string; label: string }) => {
  const { count, ref } = useCountAnimation({ end: endValue, duration: 2500 });
  
  const formatValue = () => {
    if (endValue >= 1000000000) {
      return `₦${(count / 1000000000).toFixed(count >= endValue ? 0 : 1)}B${suffix}`;
    }
    if (endValue >= 1000) {
      return `${(count / 1000).toFixed(0)}K${suffix}`;
    }
    if (suffix === "%") {
      return `${(count / 10).toFixed(1)}${suffix}`;
    }
    return `${count}${suffix}`;
  };

  return (
    <div ref={ref} className="text-center lg:text-left">
      <div className="font-display font-bold text-2xl sm:text-3xl text-primary-foreground">
        {formatValue()}
      </div>
      <div className="text-primary-foreground/60 text-sm">{label}</div>
    </div>
  );
};

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
  const [activeUsers, setActiveUsers] = useState(127);

  useEffect(() => {
    // Simulate live user count
    const interval = setInterval(() => {
      setActiveUsers((prev) => prev + Math.floor(Math.random() * 3) - 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { endValue: 10000, suffix: "+", label: "Businesses trust us" },
    { endValue: 2000000000, suffix: "+", label: "Taxes processed" },
    { endValue: 999, suffix: "%", label: "Filing accuracy" },
  ];

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
        {/* Live users indicator */}
        <div className="flex justify-center lg:justify-start mb-4 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-green-400 text-xs font-medium">
              <strong>{activeUsers}</strong> people viewing this page
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Content */}
          <div className="text-center lg:text-left">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/5 backdrop-blur-md border border-primary-foreground/10 rounded-full text-primary-foreground/90 text-sm font-medium mb-6 animate-fade-up">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 border-2 border-primary flex items-center justify-center text-[10px] text-white font-bold">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                ))}
              </div>
              <span>Rated 4.9/5 by 2,000+ users</span>
            </div>

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
              Stop overpaying taxes. Our AI-powered platform automatically finds deductions, computes your taxes, and files your returns—<strong className="text-primary-foreground">saving you an average of ₦150,000/year</strong>.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              {[
                { icon: FileCheck, text: "E-Invoicing" },
                { icon: Zap, text: "AI Tax Computation" },
                { icon: Shield, text: "NRS Direct Filing" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 backdrop-blur-sm rounded-lg text-primary-foreground/90 text-sm">
                  <item.icon className="w-4 h-4 text-coral-400" />
                  {item.text}
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="accent" size="xl" className="group w-full">
                  Start 90-Day Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="heroOutline" size="xl" className="w-full group">
                  <Play className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
                  Watch 2-Min Demo
                </Button>
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 mt-6 animate-fade-up" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="h-4 w-px bg-primary-foreground/20 hidden sm:block" />
              <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>Cancel anytime</span>
              </div>
              <div className="h-4 w-px bg-primary-foreground/20 hidden sm:block" />
              <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
                <Users className="w-4 h-4 text-green-400" />
                <span>10,000+ happy users</span>
              </div>
            </div>
          </div>

          {/* Right column - Dashboard Preview */}
          <div className="relative animate-fade-up lg:block" style={{ animationDelay: "0.4s" }}>
            <div className="relative">
              {/* Glow effect behind card */}
              <div className="absolute inset-4 bg-gradient-to-br from-teal-500/30 to-coral-500/20 rounded-3xl blur-2xl" />
              
              {/* Main dashboard card */}
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-primary-foreground/10 p-6 shadow-2xl">
                {/* Browser dots */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-coral-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 ml-4 h-6 bg-gray-800 rounded-md" />
                </div>

                {/* Dashboard content mock */}
                <div className="space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-800/60 rounded-xl p-4">
                      <div className="text-xs text-gray-400 mb-1">Total Income</div>
                      <div className="text-lg font-bold text-primary-foreground">₦4.2M</div>
                      <div className="text-xs text-green-400">+12.5%</div>
                    </div>
                    <div className="bg-gray-800/60 rounded-xl p-4">
                      <div className="text-xs text-gray-400 mb-1">Expenses</div>
                      <div className="text-lg font-bold text-primary-foreground">₦1.8M</div>
                      <div className="text-xs text-coral-400">-3.2%</div>
                    </div>
                    <div className="bg-teal-600/30 rounded-xl p-4 border border-teal-500/30">
                      <div className="text-xs text-teal-300 mb-1">Tax Due</div>
                      <div className="text-lg font-bold text-primary-foreground">₦245K</div>
                      <div className="text-xs text-teal-400">Computed</div>
                    </div>
                  </div>

                  {/* Chart placeholder */}
                  <div className="bg-gray-800/40 rounded-xl p-4 h-32">
                    <div className="flex items-end justify-between h-full gap-2">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>

                  {/* Savings highlight */}
                  <div className="bg-gradient-to-r from-coral-500/20 to-coral-500/10 rounded-xl p-4 border border-coral-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-coral-500/30 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-coral-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-primary-foreground">Smart Deductions Found</div>
                          <div className="text-xs text-gray-400">AI identified savings opportunity</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-coral-400">₦156,000</div>
                        <div className="text-xs text-green-400">Potential savings</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card - Tax filing */}
              <div className="absolute -left-8 bottom-8 bg-card rounded-xl shadow-xl border border-border p-4 animate-float hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Tax Filed ✓</div>
                    <div className="text-xs text-muted-foreground">Q4 2025 • ₦245,000</div>
                  </div>
                </div>
              </div>

              {/* New floating card - Recent activity */}
              <div className="absolute -right-4 top-16 bg-card rounded-xl shadow-xl border border-border p-3 animate-float hidden lg:block" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">Invoice Sent</div>
                    <div className="text-[10px] text-muted-foreground">₦850,000 to Acme Corp</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/10 animate-fade-up" style={{ animationDelay: "0.6s" }}>
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto lg:mx-0">
            {stats.map((stat, i) => (
              <AnimatedStat 
                key={i}
                endValue={stat.endValue}
                suffix={stat.suffix}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
