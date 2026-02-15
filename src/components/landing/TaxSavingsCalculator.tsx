import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";

const TaxSavingsCalculator = () => {
  const [income, setIncome] = useState(5000000);
  const [expenses, setExpenses] = useState(2000000);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Simplified tax calculation for demo
  const grossIncome = income;
  const deductibleExpenses = expenses;
  const taxableIncome = Math.max(0, grossIncome - deductibleExpenses);
  
  // Nigerian PIT rates (simplified)
  const calculateTax = (amount: number) => {
    let tax = 0;
    const brackets = [
      { limit: 300000, rate: 0.07 },
      { limit: 300000, rate: 0.11 },
      { limit: 500000, rate: 0.15 },
      { limit: 500000, rate: 0.19 },
      { limit: 1600000, rate: 0.21 },
      { limit: Infinity, rate: 0.24 }
    ];
    
    let remaining = amount;
    for (const bracket of brackets) {
      if (remaining <= 0) break;
      const taxable = Math.min(remaining, bracket.limit);
      tax += taxable * bracket.rate;
      remaining -= taxable;
    }
    return tax;
  };

  const taxWithoutOptimization = calculateTax(grossIncome);
  const taxWithOptimization = calculateTax(taxableIncome);
  const potentialSavings = Math.max(0, taxWithoutOptimization - taxWithOptimization);
  const savingsPercentage = taxWithoutOptimization > 0 
    ? Math.round((potentialSavings / taxWithoutOptimization) * 100) 
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <section id="calculator" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-coral-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-coral-500/10 rounded-full text-coral-500 text-sm font-semibold mb-4">
              <Calculator className="w-4 h-4" />
              Interactive Calculator
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              See How Much You Could Save
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Use our calculator to estimate your potential tax savings with TAXKORA's smart deduction tracking.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Input Side */}
              <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-border">
                <h3 className="font-display font-bold text-xl text-foreground mb-6">
                  Enter Your Financials
                </h3>

                <div className="space-y-6">
                  {/* Annual Income */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Annual Income
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₦</span>
                      <input
                        type="range"
                        min="1000000"
                        max="50000000"
                        step="500000"
                        value={income}
                        onChange={(e) => {
                          setIncome(Number(e.target.value));
                          setHasCalculated(true);
                        }}
                        className="w-full h-3 sm:h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6"
                      />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-foreground">
                      {formatCurrency(income)}
                    </div>
                  </div>

                  {/* Business Expenses */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Business Expenses
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={income * 0.8}
                      step="100000"
                      value={expenses}
                      onChange={(e) => {
                        setExpenses(Number(e.target.value));
                        setHasCalculated(true);
                      }}
                      className="w-full h-3 sm:h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-coral-500 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6"
                    />
                    <div className="mt-2 text-2xl font-bold text-foreground">
                      {formatCurrency(expenses)}
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxable Income:</span>
                      <span className="font-semibold text-foreground">{formatCurrency(taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax without optimization:</span>
                      <span className="font-semibold text-foreground">{formatCurrency(taxWithoutOptimization)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Side */}
              <div className="p-8 lg:p-10 bg-gradient-to-br from-primary to-teal-700">
                <div className="h-full flex flex-col">
                  <h3 className="font-display font-bold text-xl text-primary-foreground mb-6">
                    Your Potential Savings
                  </h3>

                  {/* Savings display */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-coral-500/20 rounded-full text-coral-300 text-sm font-semibold mb-3">
                        <TrendingUp className="w-4 h-4" />
                        {savingsPercentage}% Less Tax
                      </div>
                      <div className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-primary-foreground mb-2">
                        {formatCurrency(potentialSavings)}
                      </div>
                      <p className="text-primary-foreground/70">
                        Estimated annual tax savings
                      </p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-3 mb-8">
                      {[
                        "Smart expense categorization",
                        "Automated deduction tracking",
                        "Capital allowance optimization"
                      ].map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-primary-foreground/90 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-coral-400" />
                          {benefit}
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link to="/auth" className="block">
                      <Button variant="accent" size="xl" className="w-full group">
                        <Sparkles className="w-5 h-5" />
                        Start Saving Today
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-muted-foreground text-sm mt-6">
            *This is an estimate based on simplified calculations. Actual savings may vary based on your specific tax situation.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TaxSavingsCalculator;
