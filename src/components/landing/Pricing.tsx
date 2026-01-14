import { Button } from "@/components/ui/button";
import { Check, Sparkles, Building2, Briefcase, User } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Individual PIT",
      icon: User,
      description: "For employed individuals and personal taxpayers",
      price: "₦2,500",
      period: "/year",
      features: [
        "Personal income tracking",
        "Multi-source income aggregation",
        "Personal expense categorization",
        "PIT tax computation",
        "Personal tax filing",
        "TCC support",
        "Email support"
      ],
      popular: false,
      buttonVariant: "outline" as const,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600"
    },
    {
      name: "Business PIT",
      icon: Briefcase,
      description: "For SMEs, freelancers, and self-employed",
      price: "₦7,500",
      period: "/year",
      features: [
        "Everything in Individual PIT",
        "Unlimited professional invoicing",
        "Business income & expense tracking",
        "VAT management & returns",
        "WHT transaction tracking",
        "Capital asset depreciation",
        "Business tax computation",
        "Priority email support"
      ],
      popular: true,
      buttonVariant: "default" as const,
      iconBg: "bg-coral-500",
      iconColor: "text-white"
    },
    {
      name: "Companies Income Tax",
      icon: Building2,
      description: "For incorporated businesses and enterprises",
      price: "₦25,000",
      period: "/year",
      features: [
        "Everything in Business PIT",
        "CIT tax computation",
        "Corporate tax filing",
        "Multi-year tax records",
        "Advanced financial reports",
        "Audit trail & compliance logs",
        "Dedicated support",
        "Assisted filing service"
      ],
      popular: false,
      buttonVariant: "outline" as const,
      iconBg: "bg-teal-600",
      iconColor: "text-white"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--teal-50))_0%,transparent_60%)]" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Simple, Annual Pricing
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground text-lg">
            All plans include a <span className="font-semibold text-foreground">90-day free trial</span>. 
            Pay annually and save on tax compliance costs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-start">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl transition-all duration-300 ${
                plan.popular
                  ? "bg-primary shadow-xl ring-2 ring-primary scale-[1.02] lg:scale-105 z-10"
                  : "bg-card border border-border hover:border-primary/20 hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 bg-coral-500 text-white rounded-full text-sm font-semibold shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`p-8 ${plan.popular ? "pt-10" : ""}`}>
                {/* Plan header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.iconBg}`}>
                    <plan.icon className={`w-6 h-6 ${plan.iconColor}`} />
                  </div>
                  <div>
                    <h3 className={`font-display font-bold text-xl ${
                      plan.popular ? "text-primary-foreground" : "text-foreground"
                    }`}>
                      {plan.name}
                    </h3>
                  </div>
                </div>

                <p className={`text-sm mb-6 ${
                  plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span className={`font-display font-bold text-4xl ${
                    plan.popular ? "text-primary-foreground" : "text-foreground"
                  }`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}>
                    {plan.period}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.popular ? "bg-coral-400/20" : "bg-primary/10"
                      }`}>
                        <Check className={`w-3 h-3 ${
                          plan.popular ? "text-coral-400" : "text-primary"
                        }`} />
                      </div>
                      <span className={`text-sm ${
                        plan.popular ? "text-primary-foreground/90" : "text-muted-foreground"
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link to="/auth" className="block">
                  <Button
                    variant={plan.popular ? "accent" : plan.buttonVariant}
                    size="lg"
                    className="w-full"
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Questions about pricing?{" "}
            <a href="#contact" className="text-primary font-semibold hover:underline">
              Contact our team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
