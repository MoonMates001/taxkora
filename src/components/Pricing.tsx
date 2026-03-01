import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Individual",
      description: "Perfect for employed individuals",
      price: "$3",
      period: "/year",
      features: [
        "Personal tax computation",
        "Multi-country support (50+)",
        "Income & expense tracking",
        "Basic reports",
        "Email support"
      ],
      popular: false,
      buttonVariant: "outline" as const
    },
    {
      name: "Business",
      description: "Best for growing businesses",
      price: "$7",
      period: "/year",
      features: [
        "Everything in Individual",
        "Unlimited invoices",
        "Business tax computation",
        "VAT & WHT management",
        "Advanced analytics",
        "Priority support",
        "Capital asset tracking"
      ],
      popular: true,
      buttonVariant: "default" as const
    },
    {
      name: "Enterprise",
      description: "For larger organizations",
      price: "$25",
      period: "/year",
      features: [
        "Everything in Business",
        "CIT computation",
        "Corporate tax filing",
        "Dedicated account manager",
        "Audit trail & compliance",
        "Assisted filing service",
        "Multi-year tax planning"
      ],
      popular: false,
      buttonVariant: "outline" as const
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Pricing</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Transparent Pricing for Every Need
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose the plan that fits your business. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl transition-all duration-300 ${
                plan.popular
                  ? "bg-primary text-primary-foreground shadow-xl scale-105 z-10"
                  : "bg-card shadow-card hover:shadow-card-hover"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-4 py-1 bg-accent text-accent-foreground rounded-full text-sm font-semibold">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-display font-bold text-2xl mb-2 ${
                  plan.popular ? "text-primary-foreground" : "text-foreground"
                }`}>
                  {plan.name}
                </h3>
                <p className={plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className={`font-display font-bold text-4xl ${
                  plan.popular ? "text-primary-foreground" : "text-foreground"
                }`}>
                  {plan.price}
                </span>
                <span className={plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}>
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      plan.popular ? "text-coral-400" : "text-primary"
                    }`} />
                    <span className={`text-sm ${
                      plan.popular ? "text-primary-foreground/90" : "text-muted-foreground"
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "accent" : plan.buttonVariant}
                size="lg"
                className="w-full"
              >
                Start Free Trial
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-12">
          Need a custom solution?{" "}
          <a href="#contact" className="text-primary font-semibold hover:underline">
            Contact our sales team
          </a>
        </p>
      </div>
    </section>
  );
};

export default Pricing;
