import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, FileCheck } from "lucide-react";

const Hero = () => {
  const stats = [
    { value: "10K+", label: "Businesses trust us" },
    { value: "₦2B+", label: "Taxes processed" },
    { value: "99.9%", label: "Filing accuracy" },
  ];

  return (
    <section className="relative min-h-[90vh] bg-hero overflow-hidden flex items-center">
      {/* Gradient mesh background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-coral-500/15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Content */}
          <div className="text-center lg:text-left">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/5 backdrop-blur-md border border-primary-foreground/10 rounded-full text-primary-foreground/90 text-sm font-medium mb-6 animate-fade-up">
              <Shield className="w-4 h-4 text-coral-400" />
              Trusted by 10,000+ Nigerian Businesses
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground leading-[1.1] mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Tax Compliance,{" "}
              <span className="relative">
                <span className="text-coral-400">Simplified</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C50 2 150 2 198 8" stroke="hsl(var(--coral-400))" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-primary-foreground/75 max-w-xl mx-auto lg:mx-0 mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              The all-in-one platform for Nigerian SMEs and individuals. 
              E-invoicing, expense tracking, automated tax computation, and NRS filing—all in one place.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              {[
                { icon: FileCheck, text: "E-Invoicing" },
                { icon: Zap, text: "Auto Tax Computation" },
                { icon: Shield, text: "Direct NRS Filing" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 backdrop-blur-sm rounded-lg text-primary-foreground/90 text-sm">
                  <item.icon className="w-4 h-4 text-coral-400" />
                  {item.text}
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <Link to="/auth">
                <Button variant="accent" size="xl" className="group w-full sm:w-auto">
                  Start 90-Day Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </a>
            </div>

            {/* No credit card note */}
            <p className="text-primary-foreground/50 text-sm mt-6 animate-fade-up" style={{ animationDelay: "0.5s" }}>
              No credit card required to start • Cancel anytime
            </p>
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

                  {/* Invoice row */}
                  <div className="bg-gray-800/40 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-coral-500/20 rounded-lg flex items-center justify-center">
                          <FileCheck className="w-5 h-5 text-coral-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-primary-foreground">INV-2025-0142</div>
                          <div className="text-xs text-gray-400">Acme Corp</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary-foreground">₦850,000</div>
                        <div className="text-xs text-green-400">Paid</div>
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
                    <div className="text-sm font-semibold text-foreground">Tax Filed</div>
                    <div className="text-xs text-muted-foreground">Q4 2024 • ₦245,000</div>
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
              <div key={i} className="text-center lg:text-left">
                <div className="font-display font-bold text-2xl sm:text-3xl text-primary-foreground">{stat.value}</div>
                <div className="text-primary-foreground/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
