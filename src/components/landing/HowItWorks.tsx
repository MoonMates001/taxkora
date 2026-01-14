import { UserPlus, FileSpreadsheet, Calculator, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Create Your Account",
      description: "Sign up in 2 minutes. Choose between Business or Personal module based on your tax needs.",
      color: "teal"
    },
    {
      number: "02",
      icon: FileSpreadsheet,
      title: "Record Your Transactions",
      description: "Add income, expenses, and invoices. Our smart system auto-categorizes and tracks everything.",
      color: "teal"
    },
    {
      number: "03",
      icon: Calculator,
      title: "Auto Tax Computation",
      description: "TAXKORA calculates your PIT, CIT, VAT, and WHT in real-time based on current FIRS regulations.",
      color: "teal"
    },
    {
      number: "04",
      icon: Send,
      title: "File with Confidence",
      description: "Review your tax summary and file directly to FIRS. Get instant confirmation and keep records organized.",
      color: "coral"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-secondary/30 relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-coral-500 rounded-full" />
            Simple Process
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            From Signup to Filing in{" "}
            <span className="text-gradient-accent">4 Easy Steps</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Get started in minutes. TAXKORA handles the complexity so you can focus on what matters—your business.
          </p>
        </div>

        {/* Steps - Desktop */}
        <div className="hidden lg:block relative max-w-6xl mx-auto">
          {/* Connection line */}
          <div className="absolute top-24 left-[10%] right-[10%] h-0.5">
            <div className="w-full h-full bg-gradient-to-r from-teal-500 via-teal-500 to-coral-500 opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-teal-500 to-coral-500 animate-pulse opacity-20" />
          </div>

          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step circle */}
                <div className="relative inline-flex mb-8">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center relative z-10 shadow-lg ${
                    step.color === "coral" 
                      ? "bg-gradient-to-br from-coral-400 to-coral-600" 
                      : "bg-gradient-to-br from-teal-500 to-teal-700"
                  }`}>
                    <step.icon className="w-9 h-9 text-white" />
                  </div>
                  <span className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-20 shadow-md ${
                    step.color === "coral"
                      ? "bg-coral-500 text-white"
                      : "bg-teal-600 text-white"
                  }`}>
                    {step.number}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Steps - Mobile */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-6">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                  step.color === "coral" 
                    ? "bg-gradient-to-br from-coral-400 to-coral-600" 
                    : "bg-gradient-to-br from-teal-500 to-teal-700"
                }`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-0.5 flex-1 mt-4 ${
                    step.color === "coral" ? "bg-coral-200" : "bg-teal-200"
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <span className={`text-sm font-bold ${
                  step.color === "coral" ? "text-coral-500" : "text-teal-600"
                }`}>
                  Step {step.number}
                </span>
                <h3 className="font-display font-bold text-lg text-foreground mt-1 mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link to="/auth">
            <Button size="lg" className="group">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-muted-foreground text-sm mt-4">
            90-day free trial • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
