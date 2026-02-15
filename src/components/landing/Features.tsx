import { 
  FileText, 
  BarChart3, 
  Calculator, 
  Send, 
  Wallet, 
  Shield,
  Building2,
  User,
  Receipt,
  TrendingUp,
  PieChart,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Features = () => {
  const businessFeatures = [
    {
      icon: FileText,
      title: "Professional E-Invoicing",
      description: "Create branded invoices, track payments in real-time, and send automated reminders to clients.",
      highlight: "Unlimited invoices",
      benefits: ["Auto-numbering", "PDF export", "Payment tracking"]
    },
    {
      icon: Receipt,
      title: "Income & Expense Tracking",
      description: "Categorize transactions automatically with real-time financial dashboards and reports.",
      highlight: "Auto-categorization",
      benefits: ["Smart categories", "Receipt upload", "Reports"]
    },
    {
      icon: Calculator,
      title: "VAT & WHT Management",
      description: "Track VAT input/output, manage withholding tax transactions, and generate returns.",
      highlight: "NRS compliant",
      benefits: ["Monthly returns", "Filing tracker", "WHT reports"]
    },
    {
      icon: TrendingUp,
      title: "Capital Asset Tracking",
      description: "Record capital assets, compute depreciation allowances, and optimize tax deductions.",
      highlight: "Auto depreciation",
      benefits: ["Asset register", "Annual allowance", "Tax savings"]
    },
    {
      icon: PieChart,
      title: "Tax Computation Engine",
      description: "Accurate PIT and CIT calculations based on current Nigerian tax laws (NRS 2025).",
      highlight: "Real-time updates",
      benefits: ["PIT/CIT ready", "Deduction optimizer", "Projections"]
    },
    {
      icon: Send,
      title: "Assisted Tax Filing",
      description: "Review computed taxes and file directly to NRS with professional support when needed.",
      highlight: "One-click filing",
      benefits: ["Pre-filled forms", "Review tools", "TCC support"]
    }
  ];

  const personalFeatures = [
    {
      icon: Wallet,
      title: "Income Aggregation",
      description: "Consolidate salary, freelance income, investments, and other sources into one view.",
      benefits: ["Multiple sources", "Annual summary"]
    },
    {
      icon: BarChart3,
      title: "Personal Finance Tracking",
      description: "Track personal income and expenditure categories for accurate tax computation.",
      benefits: ["Budget insights", "Tax categories"]
    },
    {
      icon: Shield,
      title: "Tax Filing & TCC",
      description: "Simple personal tax filing with Tax Clearance Certificate generation support.",
      benefits: ["Easy filing", "TCC ready"]
    }
  ];

  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--teal-50))_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Platform Features
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need for{" "}
            <span className="text-gradient">Tax Compliance</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Whether you're running a business or managing personal finances, 
            TAXKORA provides the complete toolkit for Nigerian tax compliance.
          </p>
        </div>

        {/* Business Module */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Business Module</h3>
              <p className="text-muted-foreground">For SMEs, Self-Employed & Incorporated Businesses</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 bg-card rounded-2xl border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Highlight badge */}
                {feature.highlight && (
                  <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 rounded-full border border-teal-200">
                    {feature.highlight}
                  </span>
                )}
                
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-teal-500/20 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-teal-600" />
                  </div>
                  
                  <h4 className="font-display font-bold text-lg text-foreground mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  {/* Benefits pills */}
                  <div className="flex flex-wrap gap-2">
                    {feature.benefits.map((benefit, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-secondary rounded-md text-muted-foreground">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Module */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-coral-400 to-coral-600 rounded-2xl flex items-center justify-center shadow-lg shadow-coral-500/25">
              <User className="w-7 h-7 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Personal Module</h3>
              <p className="text-muted-foreground">For Individual Taxpayers & Employees</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {personalFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 bg-card rounded-2xl border border-border hover:border-accent/40 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-coral-50 to-coral-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-coral-500/20 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-coral-500" />
                  </div>
                  
                  <h4 className="font-display font-bold text-lg text-foreground mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  {/* Benefits pills */}
                  <div className="flex flex-wrap gap-2">
                    {feature.benefits.map((benefit, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-secondary rounded-md text-muted-foreground">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-secondary/50 rounded-2xl border border-border w-full sm:w-auto">
            <div className="text-center sm:text-left">
              <p className="font-semibold text-foreground">Ready to simplify your tax compliance?</p>
              <p className="text-sm text-muted-foreground">Start your 90-day free trial today. No credit card required.</p>
            </div>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="group w-full sm:w-auto whitespace-nowrap">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
