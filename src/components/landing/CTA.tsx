import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Gift, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const CTA = () => {
  const [spotsLeft, setSpotsLeft] = useState(23);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8 && spotsLeft > 5) {
        setSpotsLeft((prev) => prev - 1);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [spotsLeft]);

  const benefits = [
    "90-day free trial",
    "No credit card required",
    "Cancel anytime",
    "Priority support"
  ];

  return (
    <section className="py-24 bg-hero relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-coral-500/15 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Urgency badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-coral-500/20 border border-coral-500/30 rounded-full text-coral-300 text-sm font-semibold animate-pulse">
              <Gift className="w-4 h-4" />
              <span>Only <strong>{spotsLeft} spots</strong> left for priority onboarding this week</span>
            </div>
          </div>

          <div className="text-center">
            {/* Headline */}
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Start Saving on Taxes{" "}
              <span className="text-coral-400">Today</span>
            </h2>
            
            <p className="text-primary-foreground/75 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
              TAXKORA's smart compliance platform helps Nigerian businesses save on taxes with automated deductions and seamless filing.
            </p>

            {/* Benefits grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center justify-center gap-2 text-primary-foreground/80 bg-primary-foreground/5 rounded-xl p-3 border border-primary-foreground/10">
                  <CheckCircle2 className="w-5 h-5 text-coral-400 flex-shrink-0" />
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="accent" size="xl" className="group w-full text-lg px-8 py-6">
                  Start Your Free Trial Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#calculator" className="w-full sm:w-auto">
                <Button variant="heroOutline" size="xl" className="w-full">
                  Calculate Your Savings
                </Button>
              </a>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-primary-foreground/60 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span>Setup in 2 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>NRS certified</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CTA;
