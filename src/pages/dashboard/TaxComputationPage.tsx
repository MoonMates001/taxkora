import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIncome } from "@/hooks/useIncome";
import { useExpenses } from "@/hooks/useExpenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

// Nigerian Tax Constants
const VAT_RATE = 0.075; // 7.5%
const WHT_RATE = 0.10; // 10% for professional services

// Personal Income Tax Brackets (Nigeria)
const PIT_BRACKETS = [
  { min: 0, max: 300000, rate: 0.07 },
  { min: 300000, max: 600000, rate: 0.11 },
  { min: 600000, max: 1100000, rate: 0.15 },
  { min: 1100000, max: 1600000, rate: 0.19 },
  { min: 1600000, max: 3200000, rate: 0.21 },
  { min: 3200000, max: Infinity, rate: 0.24 },
];

// Calculate Personal Income Tax
const calculatePIT = (taxableIncome: number): number => {
  let tax = 0;
  let remaining = taxableIncome;

  for (const bracket of PIT_BRACKETS) {
    const bracketSize = bracket.max - bracket.min;
    const taxableInBracket = Math.min(remaining, bracketSize);
    if (taxableInBracket <= 0) break;
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }

  return tax;
};

// Calculate CIT based on turnover
const calculateCIT = (taxableIncome: number, grossIncome: number): { rate: number; tax: number; category: string } => {
  if (grossIncome <= 25000000) {
    return { rate: 0, tax: 0, category: "Small Company" };
  } else if (grossIncome <= 100000000) {
    return { rate: 0.20, tax: taxableIncome * 0.20, category: "Medium Company" };
  } else {
    return { rate: 0.30, tax: taxableIncome * 0.30, category: "Large Company" };
  }
};

const TaxComputationPage = () => {
  const { profile } = useAuth();
  const { incomeRecords, totalIncome } = useIncome();
  const { expenses, totalExpenses } = useExpenses();
  const isBusinessAccount = profile?.account_type === "business";

  const taxComputation = useMemo(() => {
    const grossIncome = totalIncome;
    const deductions = totalExpenses;
    const taxableIncome = Math.max(0, grossIncome - deductions);

    // Calculate VAT on income (for business)
    const vatOnIncome = isBusinessAccount ? grossIncome * VAT_RATE : 0;

    // Calculate WHT (estimated on professional services income)
    const professionalServicesIncome = incomeRecords
      .filter((r) => r.category === "consulting" || r.category === "services")
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const whtDeducted = professionalServicesIncome * WHT_RATE;

    // Calculate main tax
    let mainTax = 0;
    let taxRate = 0;
    let companyCategory = "";

    if (isBusinessAccount) {
      const cit = calculateCIT(taxableIncome, grossIncome);
      mainTax = cit.tax;
      taxRate = cit.rate * 100;
      companyCategory = cit.category;
    } else {
      mainTax = calculatePIT(taxableIncome);
      taxRate = taxableIncome > 0 ? (mainTax / taxableIncome) * 100 : 0;
    }

    // Net tax payable (after WHT credit)
    const netTaxPayable = Math.max(0, mainTax - whtDeducted);

    return {
      grossIncome,
      deductions,
      taxableIncome,
      vatOnIncome,
      whtDeducted,
      mainTax,
      taxRate,
      netTaxPayable,
      companyCategory,
      effectiveRate: grossIncome > 0 ? (netTaxPayable / grossIncome) * 100 : 0,
    };
  }, [totalIncome, totalExpenses, incomeRecords, isBusinessAccount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const hasData = totalIncome > 0 || totalExpenses > 0;

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
        <Button className="gap-2" onClick={() => window.location.reload()}>
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
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatCurrency(taxComputation.grossIncome)}
                </p>
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
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatCurrency(taxComputation.deductions)}
                </p>
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
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatCurrency(taxComputation.taxableIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-2 border-accent">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tax Payable</p>
                <p className="font-display text-2xl font-bold text-orange-500">
                  {formatCurrency(taxComputation.netTaxPayable)}
                </p>
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
          {!hasData ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                No data to compute
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Add your income and {isBusinessAccount ? "expenses" : "expenditure"} records to see your tax computation breakdown.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/dashboard/income">
                  <Button variant="outline">Add Income</Button>
                </Link>
                <Link to="/dashboard/expenses">
                  <Button variant="outline">Add {isBusinessAccount ? "Expenses" : "Expenditure"}</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Tax */}
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {isBusinessAccount ? `Companies Income Tax (CIT)` : "Personal Income Tax (PIT)"}
                    </span>
                    {isBusinessAccount && taxComputation.companyCategory && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {taxComputation.companyCategory}
                      </span>
                    )}
                  </div>
                  <span className="font-bold">{formatCurrency(taxComputation.mainTax)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Effective rate: {taxComputation.taxRate.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(taxComputation.taxRate, 100)} className="mt-2 h-2" />
              </div>

              {/* VAT (Business only) */}
              {isBusinessAccount && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Value Added Tax (VAT)</span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                        7.5%
                      </span>
                    </div>
                    <span className="font-bold">{formatCurrency(taxComputation.vatOnIncome)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Calculated on gross income (to be collected from customers)
                  </p>
                </div>
              )}

              {/* WHT Credit */}
              {taxComputation.whtDeducted > 0 && (
                <div className="p-4 border rounded-lg border-green-200 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Withholding Tax Credit</span>
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                        10% on services
                      </span>
                    </div>
                    <span className="font-bold text-green-600">
                      -{formatCurrency(taxComputation.whtDeducted)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    WHT already deducted at source on professional services income
                  </p>
                </div>
              )}

              {/* Summary */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold">Net Tax Payable</span>
                  </div>
                  <span className="font-display text-2xl font-bold text-orange-500">
                    {formatCurrency(taxComputation.netTaxPayable)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Overall effective tax rate: {taxComputation.effectiveRate.toFixed(2)}% of gross income
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Rate Info */}
      <Card className="shadow-card bg-teal-50 border-0">
        <CardContent className="p-6">
          <h3 className="font-display font-semibold text-lg text-foreground mb-4">
            {isBusinessAccount ? "Companies Income Tax Rates" : "Personal Income Tax Rates (Nigeria)"}
          </h3>
          {isBusinessAccount ? (
            <div className="grid sm:grid-cols-3 gap-4">
              <div className={`bg-card rounded-lg p-4 ${taxComputation.companyCategory === "Small Company" ? "ring-2 ring-primary" : ""}`}>
                <p className="text-sm text-muted-foreground">Small Companies</p>
                <p className="font-display font-bold text-xl text-foreground">0%</p>
                <p className="text-xs text-muted-foreground">Turnover ≤ ₦25M</p>
              </div>
              <div className={`bg-card rounded-lg p-4 ${taxComputation.companyCategory === "Medium Company" ? "ring-2 ring-primary" : ""}`}>
                <p className="text-sm text-muted-foreground">Medium Companies</p>
                <p className="font-display font-bold text-xl text-foreground">20%</p>
                <p className="text-xs text-muted-foreground">₦25M &lt; Turnover ≤ ₦100M</p>
              </div>
              <div className={`bg-card rounded-lg p-4 ${taxComputation.companyCategory === "Large Company" ? "ring-2 ring-primary" : ""}`}>
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
