import { UserPlus, Link2, Zap, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Create Your Account",
      description: "Sign up in minutes. Choose between Business or Personal module based on your needs."
    },
    {
      number: "02",
      icon: Link2,
      title: "Connect Your Data",
      description: "Link your bank accounts or import existing records. We'll automatically categorize everything."
    },
    {
      number: "03",
      icon: Zap,
      title: "Automate Tracking",
      description: "TAXKORA continuously tracks income, expenses, and computes your tax obligations in real-time."
    },
    {
      number: "04",
      icon: CheckCircle,
      title: "File with Confidence",
      description: "Review computed taxes and file directly to FIRS with one click. Get instant confirmation."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Simple Steps to Tax Compliance
          </h2>
          <p className="text-muted-foreground text-lg">
            Get started in minutes and let TAXKORA handle the complexity of tax management for you.
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-0.5 bg-border" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step Number Circle */}
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 bg-card rounded-2xl shadow-card flex items-center justify-center relative z-10">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold z-20">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-xl text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
