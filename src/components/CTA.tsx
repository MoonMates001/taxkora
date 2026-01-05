import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 bg-hero relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Simplify Your Tax Compliance?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of Nigerian businesses and individuals who trust TAXKORA 
            for stress-free tax management. Start your free trial today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="accent" size="xl" className="group">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Schedule a Demo
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-primary-foreground">10K+</div>
              <div className="text-primary-foreground/70 text-sm">Businesses</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-primary-foreground">₦2B+</div>
              <div className="text-primary-foreground/70 text-sm">Taxes Filed</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-primary-foreground">99%</div>
              <div className="text-primary-foreground/70 text-sm">Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
