import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, TrendingDown, FileText, RefreshCw } from "lucide-react";

const TaxComputationPage = () => {
  const { profile } = useAuth();
  const isBusinessAccount = profile?.account_type === "business";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Tax Computation</h1>
          <p className="text-muted-foreground mt-1">
            {isBusinessAccount
              ? "Calculate your business tax obligations based on Nigerian tax laws"
              : "Compute your personal income tax based on current tax rates"}
          </p>
        </div>
        <Button className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Recalculate
        </Button>
      </div>

      {/* Tax Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gross Income</p>
                <p className="font-display text-2xl font-bold text-foreground">₦0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deductions</p>
                <p className="font-display text-2xl font-bold text-foreground">₦0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxable Income</p>
                <p className="font-display text-2xl font-bold text-foreground">₦0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-2 border-accent">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-coral-400/10 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tax Payable</p>
                <p className="font-display text-2xl font-bold text-accent">₦0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Breakdown */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Tax Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-coral-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-10 h-10 text-accent" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              No data to compute
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Add your income and {isBusinessAccount ? "expenses" : "expenditure"} records to see your tax computation breakdown.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="outline">Add Income</Button>
              <Button variant="outline">Add {isBusinessAccount ? "Expenses" : "Expenditure"}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Rate Info */}
      <Card className="shadow-card bg-teal-50 border-0">
        <CardContent className="p-6">
          <h3 className="font-display font-semibold text-lg text-foreground mb-4">
            {isBusinessAccount ? "Companies Income Tax Rates" : "Personal Income Tax Rates (Nigeria)"}
          </h3>
          {isBusinessAccount ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Small Companies</p>
                <p className="font-display font-bold text-xl text-foreground">0%</p>
                <p className="text-xs text-muted-foreground">Turnover ≤ ₦25M</p>
              </div>
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Medium Companies</p>
                <p className="font-display font-bold text-xl text-foreground">20%</p>
                <p className="text-xs text-muted-foreground">₦25M &lt; Turnover ≤ ₦100M</p>
              </div>
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Large Companies</p>
                <p className="font-display font-bold text-xl text-foreground">30%</p>
                <p className="text-xs text-muted-foreground">Turnover &gt; ₦100M</p>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground">First ₦300,000</p>
                <p className="font-display font-bold text-xl text-foreground">7%</p>
              </div>
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Next ₦300,000</p>
                <p className="font-display font-bold text-xl text-foreground">11%</p>
              </div>
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Next ₦500,000</p>
                <p className="font-display font-bold text-xl text-foreground">15%</p>
              </div>
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Next ₦500,000</p>
                <p className="font-display font-bold text-xl text-foreground">19%</p>
              </div>
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Next ₦1,600,000</p>
                <p className="font-display font-bold text-xl text-foreground">21%</p>
              </div>
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Above ₦3,200,000</p>
                <p className="font-display font-bold text-xl text-foreground">24%</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxComputationPage;
