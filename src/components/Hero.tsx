import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const Hero = () => {
  const benefits = [
    "E-Invoicing made simple",
    "Automated tax computation",
    "One-click tax filing",
  ];

  return (
    <section className="relative min-h-screen bg-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-600/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full text-primary-foreground/90 text-sm font-medium mb-8 animate-fade-up">
            <span className="w-2 h-2 bg-coral-400 rounded-full animate-pulse" />
            Trusted by 10,000+ Nigerian businesses
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Tax Compliance,{" "}
            <span className="text-coral-400">Simplified</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            The all-in-one platform for SMEs and individuals to manage invoicing, 
            track finances, compute taxes, and file returns—without the complexity.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-primary-foreground/90 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-coral-400" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <Button variant="accent" size="xl" className="group">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <p className="text-primary-foreground/60 text-sm mt-8 animate-fade-up" style={{ animationDelay: "0.5s" }}>
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 max-w-5xl mx-auto animate-fade-up" style={{ animationDelay: "0.6s" }}>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary-foreground/10">
            <div className="aspect-[16/10] bg-gradient-to-br from-gray-800 to-gray-900 p-6">
              {/* Mock Dashboard Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-coral-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              {/* Mock Dashboard Content */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-gray-700/50 rounded-xl p-4 h-32" />
                <div className="bg-gray-700/50 rounded-xl p-4" />
                <div className="bg-gray-700/50 rounded-xl p-4 h-24" />
                <div className="bg-teal-600/30 rounded-xl p-4 h-24" />
                <div className="bg-coral-500/30 rounded-xl p-4 h-24" />
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-teal-600/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
