import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIncome } from "@/hooks/useIncome";
import { useStatutoryDeductions } from "@/hooks/useStatutoryDeductions";
import { computeTax2026, PIT_BRACKETS_2026, TAX_EXEMPT_THRESHOLD, RENT_RELIEF_CAP } from "@/lib/taxEngine2026";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calculator,
  TrendingUp,
  FileText,
  RefreshCw,
  CheckCircle2,
  Shield,
  Wallet,
  Home,
  Heart,
  Building,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";

const TaxComputationPage = () => {
  const { profile } = useAuth();
  const { incomeRecords, totalIncome } = useIncome();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { deductions, isLoading: deductionsLoading, upsertDeductions } = useStatutoryDeductions(selectedYear);

  // Local state for deduction form
  const [deductionForm, setDeductionForm] = useState({
    pension_contribution: 0,
    nhis_contribution: 0,
    nhf_contribution: 0,
    housing_loan_interest: 0,
    life_insurance_premium: 0,
    annual_rent_paid: 0,
    employment_compensation: 0,
    gifts_received: 0,
    pension_benefits_received: 0,
  });

  // Sync form with fetched deductions
  useMemo(() => {
    if (deductions) {
      setDeductionForm({
        pension_contribution: deductions.pension_contribution,
        nhis_contribution: deductions.nhis_contribution,
        nhf_contribution: deductions.nhf_contribution,
        housing_loan_interest: deductions.housing_loan_interest,
        life_insurance_premium: deductions.life_insurance_premium,
        annual_rent_paid: deductions.annual_rent_paid,
        employment_compensation: deductions.employment_compensation,
        gifts_received: deductions.gifts_received,
        pension_benefits_received: deductions.pension_benefits_received,
      });
    }
  }, [deductions]);

  // Filter income by selected year
  const yearlyIncome = useMemo(() => {
    return incomeRecords
      .filter((record) => new Date(record.date).getFullYear() === selectedYear)
      .reduce((sum, record) => sum + Number(record.amount), 0);
  }, [incomeRecords, selectedYear]);

  // Compute tax using 2026 rules
  const taxComputation = useMemo(() => {
    return computeTax2026(yearlyIncome, {
      ...deductionForm,
      pension_contribution: deductionForm.pension_contribution,
      nhis_contribution: deductionForm.nhis_contribution,
      nhf_contribution: deductionForm.nhf_contribution,
      housing_loan_interest: deductionForm.housing_loan_interest,
      life_insurance_premium: deductionForm.life_insurance_premium,
      annual_rent_paid: deductionForm.annual_rent_paid,
      employment_compensation: deductionForm.employment_compensation,
      gifts_received: deductionForm.gifts_received,
      pension_benefits_received: deductionForm.pension_benefits_received,
    });
  }, [yearlyIncome, deductionForm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDeductionChange = (field: keyof typeof deductionForm, value: string) => {
    const numValue = parseFloat(value) || 0;
    setDeductionForm((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleSaveDeductions = () => {
    upsertDeductions.mutate({
      year: selectedYear,
      ...deductionForm,
    });
  };

  const hasData = yearlyIncome > 0;
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Tax Computation</h1>
          <p className="text-muted-foreground mt-1">
            Nigeria Tax Act 2026 - Personal Income Tax Calculator
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="gap-2" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4" />
            Recalculate
          </Button>
        </div>
      </div>

      {/* Tax Summary Cards */}
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
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deductions</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatCurrency(taxComputation.totalDeductions)}
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

      {/* Exemption Notice */}
      {taxComputation.isExempt && (
        <Card className="shadow-card bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800">Tax Exempt Status</h3>
                <p className="text-green-700 mt-1">{taxComputation.exemptionReason}</p>
                <p className="text-sm text-green-600 mt-2">
                  Under the Nigeria Tax Act 2026, individuals with annual taxable income at or below ₦800,000 are fully exempt from personal income tax.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="deductions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deductions">Deductions & Reliefs</TabsTrigger>
          <TabsTrigger value="breakdown">Tax Breakdown</TabsTrigger>
          <TabsTrigger value="rates">2026 Tax Rates</TabsTrigger>
        </TabsList>

        {/* Deductions Tab */}
        <TabsContent value="deductions" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Statutory Deductions
              </CardTitle>
              <CardDescription>
                Enter your allowable deductions to reduce your taxable income. Maintain documentation for all claims.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Pension Contribution */}
                <div className="space-y-2">
                  <Label htmlFor="pension" className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    Pension Contribution (PFA)
                  </Label>
                  <Input
                    id="pension"
                    type="number"
                    placeholder="0"
                    value={deductionForm.pension_contribution || ""}
                    onChange={(e) => handleDeductionChange("pension_contribution", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Contributions to registered Pension Fund Administrator</p>
                </div>

                {/* NHIS */}
                <div className="space-y-2">
                  <Label htmlFor="nhis" className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    NHIS Contribution
                  </Label>
                  <Input
                    id="nhis"
                    type="number"
                    placeholder="0"
                    value={deductionForm.nhis_contribution || ""}
                    onChange={(e) => handleDeductionChange("nhis_contribution", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">National Health Insurance Scheme</p>
                </div>

                {/* NHF */}
                <div className="space-y-2">
                  <Label htmlFor="nhf" className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    NHF Contribution
                  </Label>
                  <Input
                    id="nhf"
                    type="number"
                    placeholder="0"
                    value={deductionForm.nhf_contribution || ""}
                    onChange={(e) => handleDeductionChange("nhf_contribution", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">National Housing Fund</p>
                </div>

                {/* Housing Loan Interest */}
                <div className="space-y-2">
                  <Label htmlFor="housing_loan" className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    Housing Loan Interest
                  </Label>
                  <Input
                    id="housing_loan"
                    type="number"
                    placeholder="0"
                    value={deductionForm.housing_loan_interest || ""}
                    onChange={(e) => handleDeductionChange("housing_loan_interest", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Interest on owner-occupied residential housing</p>
                </div>

                {/* Life Insurance */}
                <div className="space-y-2">
                  <Label htmlFor="life_insurance" className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    Life Insurance Premium
                  </Label>
                  <Input
                    id="life_insurance"
                    type="number"
                    placeholder="0"
                    value={deductionForm.life_insurance_premium || ""}
                    onChange={(e) => handleDeductionChange("life_insurance_premium", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Life insurance or annuity premiums</p>
                </div>

                {/* Annual Rent */}
                <div className="space-y-2">
                  <Label htmlFor="rent" className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    Annual Rent Paid
                  </Label>
                  <Input
                    id="rent"
                    type="number"
                    placeholder="0"
                    value={deductionForm.annual_rent_paid || ""}
                    onChange={(e) => handleDeductionChange("annual_rent_paid", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    20% relief, capped at ₦{RENT_RELIEF_CAP.toLocaleString()} (documentation required)
                  </p>
                </div>
              </div>

              {/* Exempt Income Section */}
              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Exempt Income
                </h4>
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gifts">Gifts Received</Label>
                    <Input
                      id="gifts"
                      type="number"
                      placeholder="0"
                      value={deductionForm.gifts_received || ""}
                      onChange={(e) => handleDeductionChange("gifts_received", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Fully exempt from tax</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pension_benefits">Pension Benefits</Label>
                    <Input
                      id="pension_benefits"
                      type="number"
                      placeholder="0"
                      value={deductionForm.pension_benefits_received || ""}
                      onChange={(e) => handleDeductionChange("pension_benefits_received", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Approved retirement benefits (exempt)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employment_comp">Employment Compensation</Label>
                    <Input
                      id="employment_comp"
                      type="number"
                      placeholder="0"
                      value={deductionForm.employment_compensation || ""}
                      onChange={(e) => handleDeductionChange("employment_compensation", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Exempt up to ₦50 million</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveDeductions} disabled={upsertDeductions.isPending}>
                  {upsertDeductions.isPending ? "Saving..." : "Save Deductions"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Deduction Summary */}
          <Card className="shadow-card bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-blue-800 mb-4">Your Deduction Summary</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-sm text-blue-600">Pension</p>
                  <p className="font-semibold text-blue-900">{formatCurrency(taxComputation.deductionBreakdown.pension)}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-sm text-blue-600">NHIS</p>
                  <p className="font-semibold text-blue-900">{formatCurrency(taxComputation.deductionBreakdown.nhis)}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-sm text-blue-600">NHF</p>
                  <p className="font-semibold text-blue-900">{formatCurrency(taxComputation.deductionBreakdown.nhf)}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-sm text-blue-600">Housing Loan Interest</p>
                  <p className="font-semibold text-blue-900">{formatCurrency(taxComputation.deductionBreakdown.housingLoanInterest)}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-sm text-blue-600">Life Insurance</p>
                  <p className="font-semibold text-blue-900">{formatCurrency(taxComputation.deductionBreakdown.lifeInsurance)}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-sm text-blue-600">Rent Relief (20%)</p>
                  <p className="font-semibold text-blue-900">{formatCurrency(taxComputation.deductionBreakdown.rentRelief)}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200 flex justify-between items-center">
                <span className="font-semibold text-blue-800">Total Deductions</span>
                <span className="font-display text-xl font-bold text-blue-900">{formatCurrency(taxComputation.totalDeductions)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Tax Calculation Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {!hasData ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                    No income data for {selectedYear}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Add your income records to see your tax computation breakdown.
                  </p>
                  <Link to="/dashboard/income">
                    <Button variant="outline">Add Income</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Income Calculation */}
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Gross Income</span>
                      <span className="font-medium">{formatCurrency(taxComputation.grossIncome)}</span>
                    </div>
                    {taxComputation.exemptIncome > 0 && (
                      <div className="flex justify-between py-2 border-b text-green-600">
                        <span>Less: Exempt Income</span>
                        <span className="font-medium">-{formatCurrency(taxComputation.exemptIncome)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Taxable Gross Income</span>
                      <span className="font-medium">{formatCurrency(taxComputation.taxableGrossIncome)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b text-blue-600">
                      <span>Less: Statutory Deductions</span>
                      <span className="font-medium">-{formatCurrency(taxComputation.totalDeductions)}</span>
                    </div>
                    <div className="flex justify-between py-2 bg-secondary/50 px-3 rounded-lg">
                      <span className="font-semibold">Taxable Income</span>
                      <span className="font-bold">{formatCurrency(taxComputation.taxableIncome)}</span>
                    </div>
                  </div>

                  {/* Tax by Bracket */}
                  <div className="pt-4">
                    <h4 className="font-semibold mb-4">Tax Computation by Bracket</h4>
                    <div className="space-y-3">
                      {taxComputation.taxByBracket.map((bracket, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{bracket.bracket}</span>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                {bracket.rate}%
                              </span>
                            </div>
                            <span className="font-bold">{formatCurrency(bracket.tax)}</span>
                          </div>
                          {bracket.income > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(bracket.income)} × {bracket.rate}%
                            </div>
                          )}
                          <Progress value={bracket.income > 0 ? 100 : 0} className="mt-2 h-1" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Summary */}
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-orange-500" />
                        <span className="font-semibold">Total Tax Payable</span>
                      </div>
                      <span className="font-display text-2xl font-bold text-orange-500">
                        {formatCurrency(taxComputation.netTaxPayable)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Effective tax rate: {taxComputation.effectiveRate.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Rates Tab */}
        <TabsContent value="rates" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Nigeria Tax Act 2026 - Progressive Tax Rates
              </CardTitle>
              <CardDescription>
                These are the new personal income tax rates effective from January 2026
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PIT_BRACKETS_2026.map((bracket, index) => {
                  const isCurrentBracket = 
                    taxComputation.taxableIncome > bracket.min && 
                    (bracket.max === Infinity || taxComputation.taxableIncome <= bracket.max);
                  
                  return (
                    <div
                      key={index}
                      className={`bg-card rounded-lg p-4 border-2 ${
                        isCurrentBracket ? "border-primary bg-primary/5" : "border-transparent"
                      }`}
                    >
                      {isCurrentBracket && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded mb-2 inline-block">
                          Your Bracket
                        </span>
                      )}
                      <p className="text-sm text-muted-foreground">{bracket.label}</p>
                      <p className="font-display font-bold text-2xl text-foreground">
                        {bracket.rate * 100}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Exemptions Info */}
          <Card className="shadow-card bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="font-display text-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Tax Exemptions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-700 space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-1 flex-shrink-0" />
                <p>Annual taxable income ≤ ₦{TAX_EXEMPT_THRESHOLD.toLocaleString()}: <strong>0% tax</strong> (fully exempt)</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-1 flex-shrink-0" />
                <p>Gifts received are <strong>fully exempt</strong> from tax</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-1 flex-shrink-0" />
                <p>Approved pension and retirement benefits under Pension Reform Act are <strong>exempt</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-1 flex-shrink-0" />
                <p>Compensation for loss of employment: <strong>tax-exempt up to ₦50 million</strong></p>
              </div>
            </CardContent>
          </Card>

          {/* Documentation Reminder */}
          <Card className="shadow-card bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="font-display text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Documentation Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-700">
              <p className="mb-3">To claim deductions and reliefs, maintain copies of:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2" />
                  <span>Rent receipts or lease documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2" />
                  <span>Pension, NHIS, NHF contribution statements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2" />
                  <span>Loan agreements for owner-occupied housing interest</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2" />
                  <span>Life insurance/annuity premium receipts</span>
                </li>
              </ul>
              <p className="mt-3 text-sm font-medium">Without proper documentation, deductions may be disallowed.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxComputationPage;
