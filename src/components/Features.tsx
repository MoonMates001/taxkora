import { 
  FileText, 
  BarChart3, 
  Calculator, 
  Send, 
  Wallet, 
  Shield,
  Building2,
  User
} from "lucide-react";

const Features = () => {
  const businessFeatures = [
    {
      icon: FileText,
      title: "E-Invoicing System",
      description: "Create professional invoices, track payments, and send automated reminders to clients."
    },
    {
      icon: BarChart3,
      title: "Income & Expense Tracking",
      description: "Automated categorization of all transactions with real-time financial dashboards."
    },
    {
      icon: Calculator,
      title: "Tax Computation Engine",
      description: "Accurate tax calculations based on current Nigerian tax laws and regulations."
    },
    {
      icon: Send,
      title: "Tax Filing Services",
      description: "Assisted and done-for-you tax filing with direct submission to NRS."
    }
  ];

  const personalFeatures = [
    {
      icon: Wallet,
      title: "Income Aggregation",
      description: "Consolidate income from multiple sources into one clear overview."
    },
    {
      icon: BarChart3,
      title: "Personal Finance Tracking",
      description: "Track personal income and expenditure for accurate tax computation."
    },
    {
      icon: Shield,
      title: "Tax Filing & Clearance",
      description: "Simple personal tax filing with clearance certificate generation."
    }
  ];

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Two Modules, One Platform
          </h2>
          <p className="text-muted-foreground text-lg">
            Whether you're running a business or managing personal finances, 
            TAXKORA has the tools you need for complete tax compliance.
          </p>
        </div>

        {/* Business Module */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground">Business Module</h3>
              <p className="text-muted-foreground">For SMEs, Self-Employed & Family Businesses</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessFeatures.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h4 className="font-display font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Module */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground">Personal Module</h3>
              <p className="text-muted-foreground">For Individual Taxpayers</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {personalFeatures.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-coral-400/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <h4 className="font-display font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
