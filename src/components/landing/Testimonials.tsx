import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Adebayo Ogundimu",
      role: "Founder, TechStart Nigeria",
      image: null,
      content: "TAXKORA has completely transformed how we handle our business taxes. The automated VAT tracking alone saves us hours every month.",
      rating: 5
    },
    {
      name: "Chinwe Okwu",
      role: "Freelance Consultant",
      image: null,
      content: "As a freelancer, keeping track of multiple income sources was a nightmare. Now I just log my invoices and TAXKORA computes everything automatically.",
      rating: 5
    },
    {
      name: "Ibrahim Musa",
      role: "MD, Musa & Sons Ltd",
      image: null,
      content: "The CIT computation feature is incredibly accurate. We've never had issues with NRS since we started using TAXKORA for our company filings.",
      rating: 5
    },
    {
      name: "Folake Adeyemi",
      role: "HR Manager, FinCorp",
      image: null,
      content: "I recommend TAXKORA to all my employees for their personal tax filing. It's so easy to use and the support team is very responsive.",
      rating: 5
    },
    {
      name: "Emeka Nwosu",
      role: "Owner, Nwosu Logistics",
      image: null,
      content: "The invoicing system is brilliant. My clients get professional invoices and I can track payments without switching between apps.",
      rating: 5
    },
    {
      name: "Amina Bello",
      role: "Accountant, Bello Associates",
      image: null,
      content: "Finally, a Nigerian tax platform that understands our tax laws. The capital allowance calculations are spot-on every time.",
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-coral-500/5 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-current" />
            Customer Stories
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Loved by Businesses Across Nigeria
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of Nigerian businesses and individuals who trust TAXKORA for their tax compliance needs.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-10 h-10 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{testimonial.name}</div>
                  <div className="text-muted-foreground text-xs">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm mb-6">Trusted by businesses of all sizes</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {["TechStart", "FinCorp", "Musa & Sons", "Nwosu Logistics", "Bello Associates"].map((company, i) => (
              <div key={i} className="font-display font-bold text-lg text-muted-foreground">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
