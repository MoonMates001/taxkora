import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  const benefits = [
    "90-day free trial",
    "No credit card required",
    "Cancel anytime"
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
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Ready to Simplify Your{" "}
            <span className="text-coral-400">Tax Compliance?</span>
          </h2>
          
          <p className="text-primary-foreground/75 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            Join 10,000+ Nigerian businesses and individuals who trust TAXKORA for stress-free tax management.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-primary-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-coral-400" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button variant="accent" size="xl" className="group w-full sm:w-auto">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#contact">
              <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                Talk to Sales
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="font-display font-bold text-3xl sm:text-4xl text-primary-foreground">10K+</div>
              <div className="text-primary-foreground/60 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-3xl sm:text-4xl text-primary-foreground">₦2B+</div>
              <div className="text-primary-foreground/60 text-sm">Taxes Processed</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-3xl sm:text-4xl text-primary-foreground">99.9%</div>
              <div className="text-primary-foreground/60 text-sm">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
