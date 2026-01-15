import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIncome } from "@/hooks/useIncome";
import { useExpenses } from "@/hooks/useExpenses";
import {
  computeBusinessTax,
  BusinessTaxInput,
  BusinessEntityType,
  PITBusinessResult,
  CITResult,
  CAPITAL_ALLOWANCE_RATES,
  CIT_BANDS,
  PIT_BRACKETS,
  PIT_EXEMPT_THRESHOLD,
  CapitalAsset,
  CapitalAssetCategory,
} from "@/lib/tax";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  Building2,
  User,
  Users,
  TrendingUp,
  TrendingDown,
  FileText,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  Briefcase,
  Landmark,
  ChevronRight,
  Plus,
  Trash2,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import SubscriptionGate from "@/components/subscription/SubscriptionGate";

type EntityOption = { value: BusinessEntityType; label: string; icon: typeof User; description: string };

const ENTITY_OPTIONS: EntityOption[] = [
  {
    value: "sole_proprietorship",
    label: "Sole Proprietorship",
    icon: User,
    description: "Individual business owner, taxed under PIT (SIRS)",
  },
  {
    value: "partnership",
    label: "Partnership",
    icon: Users,
    description: "Business with multiple partners, taxed under PIT (SIRS)",
  },
  {
    value: "limited_company",
    label: "Limited Company (Ltd)",
    icon: Building2,
    description: "Incorporated company, taxed under CIT (NRS)",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const BusinessTaxPage = () => {
  const { profile } = useAuth();
  const { incomeRecords } = useIncome();
  const { expenses } = useExpenses();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [entityType, setEntityType] = useState<BusinessEntityType>("sole_proprietorship");
  const [showResults, setShowResults] = useState(false);

  // Form state for business income
  const [businessIncome, setBusinessIncome] = useState({
    salesRevenue: 0,
    serviceFees: 0,
    commissions: 0,
    digitalIncome: 0,
    exchangeGains: 0,
    otherReceipts: 0,
  });

  // Form state for business expenses
  const [businessExpenses, setBusinessExpenses] = useState({
    costOfGoodsSold: 0,
    rentPremises: 0,
    utilities: 0,
    transport: 0,
    staffSalaries: 0,
    repairsMaintenance: 0,
    professionalFees: 0,
    internetSoftware: 0,
    marketingAdvertising: 0,
    otherAllowable: 0,
    personalExpenses: 0,
    capitalExpenditure: 0,
    finesPenalties: 0,
    nonBusinessDonations: 0,
  });

  // Capital assets
  const [capitalAssets, setCapitalAssets] = useState<CapitalAsset[]>([]);

  // Personal reliefs (for PIT)
  const [personalReliefs, setPersonalReliefs] = useState({
    pension: 0,
    nhis: 0,
    nhf: 0,
    lifeInsurance: 0,
    housingLoanInterest: 0,
    annualRentPaid: 0,
  });

  // CIT adjustments
  const [citAdjustments, setCitAdjustments] = useState({
    depreciation: 0,
    nonDeductibleExpenses: 0,
    provisions: 0,
    unapprovedDonations: 0,
    exemptIncome: 0,
  });

  // Annual turnover (for CIT)
  const [annualTurnover, setAnnualTurnover] = useState(0);

  // Auto-populate from recorded income/expenses - compute values without side effects
  const autoPopulatedData = useMemo(() => {
    const yearlyIncome = incomeRecords.filter(
      (r) => new Date(r.date).getFullYear() === selectedYear
    );
    const yearlyExpenses = expenses.filter(
      (e) => new Date(e.date).getFullYear() === selectedYear
    );

    // Map income categories
    const salesRevenue = yearlyIncome
      .filter((r) => r.category === "sales")
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const serviceFees = yearlyIncome
      .filter((r) => ["services", "consulting", "freelance"].includes(r.category))
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const commissions = yearlyIncome
      .filter((r) => r.category === "commission")
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const otherReceipts = yearlyIncome
      .filter((r) => !["sales", "services", "consulting", "freelance", "commission"].includes(r.category))
      .reduce((sum, r) => sum + Number(r.amount), 0);

    // Map expense categories
    const rentPremises = yearlyExpenses
      .filter((e) => e.category === "rent")
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const utilities = yearlyExpenses
      .filter((e) => e.category === "utilities")
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const staffSalaries = yearlyExpenses
      .filter((e) => e.category === "salaries")
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const marketingAdvertising = yearlyExpenses
      .filter((e) => e.category === "marketing")
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const professionalFees = yearlyExpenses
      .filter((e) => e.category === "professional_services")
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const repairsMaintenance = yearlyExpenses
      .filter((e) => e.category === "maintenance")
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const transport = yearlyExpenses
      .filter((e) => ["travel", "transportation"].includes(e.category))
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalRevenue = salesRevenue + serviceFees + commissions + otherReceipts;

    return {
      income: { salesRevenue, serviceFees, commissions, otherReceipts },
      expenses: { rentPremises, utilities, staffSalaries, marketingAdvertising, professionalFees, repairsMaintenance, transport },
      totalRevenue,
    };
  }, [incomeRecords, expenses, selectedYear]);

  // Merge auto-populated data with user-entered data
  const effectiveBusinessIncome = useMemo(() => ({
    ...businessIncome,
    salesRevenue: businessIncome.salesRevenue || autoPopulatedData.income.salesRevenue,
    serviceFees: businessIncome.serviceFees || autoPopulatedData.income.serviceFees,
    commissions: businessIncome.commissions || autoPopulatedData.income.commissions,
    otherReceipts: businessIncome.otherReceipts || autoPopulatedData.income.otherReceipts,
  }), [businessIncome, autoPopulatedData.income]);

  const effectiveBusinessExpenses = useMemo(() => ({
    ...businessExpenses,
    rentPremises: businessExpenses.rentPremises || autoPopulatedData.expenses.rentPremises,
    utilities: businessExpenses.utilities || autoPopulatedData.expenses.utilities,
    staffSalaries: businessExpenses.staffSalaries || autoPopulatedData.expenses.staffSalaries,
    marketingAdvertising: businessExpenses.marketingAdvertising || autoPopulatedData.expenses.marketingAdvertising,
    professionalFees: businessExpenses.professionalFees || autoPopulatedData.expenses.professionalFees,
    repairsMaintenance: businessExpenses.repairsMaintenance || autoPopulatedData.expenses.repairsMaintenance,
    transport: businessExpenses.transport || autoPopulatedData.expenses.transport,
  }), [businessExpenses, autoPopulatedData.expenses]);

  const effectiveAnnualTurnover = annualTurnover || autoPopulatedData.totalRevenue;

  // Compute tax
  const taxResult = useMemo(() => {
    const input: BusinessTaxInput = {
      entityType,
      year: selectedYear,
      annualTurnover: effectiveAnnualTurnover,
      businessIncome: effectiveBusinessIncome,
      businessExpenses: effectiveBusinessExpenses,
      capitalAssets,
      personalReliefs,
      citAdjustments,
    };
    return computeBusinessTax(input);
  }, [entityType, selectedYear, effectiveAnnualTurnover, effectiveBusinessIncome, effectiveBusinessExpenses, capitalAssets, personalReliefs, citAdjustments]);

  const isPIT = taxResult.taxationType === "PIT";
  const pitResult = isPIT ? (taxResult as PITBusinessResult) : null;
  const citResult = !isPIT ? (taxResult as CITResult) : null;

  const addCapitalAsset = () => {
    const newAsset: CapitalAsset = {
      id: crypto.randomUUID(),
      description: "",
      category: "plant_machinery",
      cost: 0,
      acquisitionDate: new Date().toISOString().split("T")[0],
      initialAllowanceRate: 0.5,
      annualAllowanceRate: 0.25,
      yearAcquired: selectedYear,
      writtenDownValue: 0,
      totalAllowanceClaimed: 0,
    };
    setCapitalAssets([...capitalAssets, newAsset]);
  };

  const updateCapitalAsset = (id: string, field: keyof CapitalAsset, value: string | number) => {
    setCapitalAssets((prev) =>
      prev.map((asset) => {
        if (asset.id !== id) return asset;
        const updated = { ...asset, [field]: value };
        if (field === "category") {
          const rates = CAPITAL_ALLOWANCE_RATES.find((r) => r.category === value);
          if (rates) {
            updated.initialAllowanceRate = rates.initialRate;
            updated.annualAllowanceRate = rates.annualRate;
          }
        }
        return updated;
      })
    );
  };

  const removeCapitalAsset = (id: string) => {
    setCapitalAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <SubscriptionGate 
      requiredPlan={["pit_business", "cit"]} 
      feature="Business Tax Computation"
    >
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Business Tax Computation</h1>
          <p className="text-muted-foreground mt-1">
            Nigeria Tax Act 2025 - PIT & CIT Calculator
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
          <Button variant="outline" onClick={() => setShowResults(!showResults)}>
            <Calculator className="w-4 h-4 mr-2" />
            {showResults ? "Edit Inputs" : "Compute Tax"}
          </Button>
        </div>
      </div>

      {/* Entity Type Selection */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Business Entity Type
          </CardTitle>
          <CardDescription>
            Select your business structure to determine the applicable tax regime
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {ENTITY_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = entityType === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setEntityType(option.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                        {option.value === "limited_company" ? "CIT" : "PIT"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </button>
              );
            })}
          </div>

          {/* Tax Authority Info */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50 flex items-start gap-3">
            <Landmark className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">
                Tax Authority: {entityType === "limited_company" ? "NRS" : "SIRS"}
              </p>
              <p className="text-sm text-muted-foreground">
                {entityType === "limited_company"
                  ? "Nigeria Revenue Service - Companies Income Tax"
                  : "State Internal Revenue Service - Personal Income Tax"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {showResults ? (
        <TaxResultsView taxResult={taxResult} isPIT={isPIT} pitResult={pitResult} citResult={citResult} entityType={entityType} year={selectedYear} businessName={profile?.business_name} />
      ) : (
        <Tabs defaultValue="income" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="income">Business Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="capital">Capital Allowances</TabsTrigger>
            <TabsTrigger value="reliefs">
              {entityType === "limited_company" ? "Tax Adjustments" : "Personal Reliefs"}
            </TabsTrigger>
          </TabsList>

          {/* Income Tab */}
          <TabsContent value="income">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Gross Business Income
                </CardTitle>
                <CardDescription>
                  Enter all business receipts - cash or non-cash, local or foreign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {entityType === "limited_company" && (
                  <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                    <Label htmlFor="turnover" className="font-medium">
                      Annual Turnover (for CIT classification)
                    </Label>
                    <Input
                      id="turnover"
                      type="number"
                      className="mt-2"
                      placeholder="Enter annual turnover"
                      value={annualTurnover || ""}
                      onChange={(e) => setAnnualTurnover(parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Determines your CIT rate: ≤₦25M = 0%, ₦25M-₦100M = 20%, ₦100M-₦250M = 30%
                    </p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(businessIncome).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                      <Input
                        id={key}
                        type="number"
                        placeholder="0"
                        value={value || ""}
                        onChange={(e) =>
                          setBusinessIncome((prev) => ({
                            ...prev,
                            [key]: parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="font-medium text-green-800">
                    Total Gross Income:{" "}
                    {formatCurrency(Object.values(businessIncome).reduce((a, b) => a + b, 0))}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  Business Expenses
                </CardTitle>
                <CardDescription>
                  Expenses must be wholly, exclusively, necessarily, and reasonably incurred
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-green-700 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Allowable Expenses (Tax Deductible)
                  </h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      "costOfGoodsSold",
                      "rentPremises",
                      "utilities",
                      "transport",
                      "staffSalaries",
                      "repairsMaintenance",
                      "professionalFees",
                      "internetSoftware",
                      "marketingAdvertising",
                      "otherAllowable",
                    ].map((key) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="capitalize text-sm">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </Label>
                        <Input
                          id={key}
                          type="number"
                          placeholder="0"
                          value={businessExpenses[key as keyof typeof businessExpenses] || ""}
                          onChange={(e) =>
                            setBusinessExpenses((prev) => ({
                              ...prev,
                              [key]: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-red-600 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Disallowed Expenses (NOT Tax Deductible)
                  </h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {["personalExpenses", "capitalExpenditure", "finesPenalties", "nonBusinessDonations"].map(
                      (key) => (
                        <div key={key} className="space-y-2">
                          <Label htmlFor={key} className="capitalize text-sm text-red-600">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </Label>
                          <Input
                            id={key}
                            type="number"
                            placeholder="0"
                            className="border-red-200"
                            value={businessExpenses[key as keyof typeof businessExpenses] || ""}
                            onChange={(e) =>
                              setBusinessExpenses((prev) => ({
                                ...prev,
                                [key]: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Capital Allowances Tab */}
          <TabsContent value="capital">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Capital Allowances
                </CardTitle>
                <CardDescription>
                  Capital assets are not expensed fully - you apply initial and annual allowances instead
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Add capital assets (equipment, vehicles, machinery) to claim allowances
                  </p>
                  <Button onClick={addCapitalAsset} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Asset
                  </Button>
                </div>

                {capitalAssets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No capital assets added</p>
                    <p className="text-sm">Click "Add Asset" to add equipment, vehicles, or machinery</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {capitalAssets.map((asset, index) => (
                      <div key={asset.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Asset #{index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCapitalAsset(asset.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                              placeholder="e.g., Delivery Van"
                              value={asset.description}
                              onChange={(e) => updateCapitalAsset(asset.id, "description", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                              value={asset.category}
                              onValueChange={(v) =>
                                updateCapitalAsset(asset.id, "category", v as CapitalAssetCategory)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CAPITAL_ALLOWANCE_RATES.map((rate) => (
                                  <SelectItem key={rate.category} value={rate.category}>
                                    {rate.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Cost (₦)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={asset.cost || ""}
                              onChange={(e) =>
                                updateCapitalAsset(asset.id, "cost", parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Year Acquired</Label>
                            <Input
                              type="number"
                              value={asset.yearAcquired}
                              onChange={(e) =>
                                updateCapitalAsset(
                                  asset.id,
                                  "yearAcquired",
                                  parseInt(e.target.value) || selectedYear
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground flex gap-4">
                          <span>Initial: {(asset.initialAllowanceRate * 100).toFixed(0)}%</span>
                          <span>Annual: {(asset.annualAllowanceRate * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Allowance Rates Reference */}
                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Capital Allowance Rates
                  </h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    {CAPITAL_ALLOWANCE_RATES.map((rate) => (
                      <div key={rate.category} className="flex justify-between">
                        <span className="text-muted-foreground">{rate.label}</span>
                        <span>
                          {(rate.initialRate * 100).toFixed(0)}% / {(rate.annualRate * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    * Capital allowances are restricted to 2/3 of assessable profit
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Reliefs / Tax Adjustments Tab */}
          <TabsContent value="reliefs">
            {entityType === "limited_company" ? (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Tax Adjustments (CIT)
                  </CardTitle>
                  <CardDescription>
                    Adjust accounting profit for tax purposes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4 text-orange-600">Add Back to Profit</h4>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {["depreciation", "nonDeductibleExpenses", "provisions", "unapprovedDonations"].map(
                        (key) => (
                          <div key={key} className="space-y-2">
                            <Label htmlFor={key} className="capitalize text-sm">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </Label>
                            <Input
                              id={key}
                              type="number"
                              placeholder="0"
                              value={citAdjustments[key as keyof typeof citAdjustments] || ""}
                              onChange={(e) =>
                                setCitAdjustments((prev) => ({
                                  ...prev,
                                  [key]: parseFloat(e.target.value) || 0,
                                }))
                              }
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-4 text-green-600">Deduct from Profit</h4>
                    <div className="space-y-2">
                      <Label htmlFor="exemptIncome">Tax-Exempt Income</Label>
                      <Input
                        id="exemptIncome"
                        type="number"
                        placeholder="0"
                        value={citAdjustments.exemptIncome || ""}
                        onChange={(e) =>
                          setCitAdjustments((prev) => ({
                            ...prev,
                            exemptIncome: parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Personal Reliefs (PIT)
                  </CardTitle>
                  <CardDescription>
                    Statutory deductions to reduce your taxable income
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(personalReliefs).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="capitalize text-sm">
                          {key === "nhis" ? "NHIS" : key === "nhf" ? "NHF" : key.replace(/([A-Z])/g, " $1").trim()}
                        </Label>
                        <Input
                          id={key}
                          type="number"
                          placeholder="0"
                          value={value || ""}
                          onChange={(e) =>
                            setPersonalReliefs((prev) => ({
                              ...prev,
                              [key]: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
    </SubscriptionGate>
  );
};

// Results View Component
const TaxResultsView = ({
  taxResult,
  isPIT,
  pitResult,
  citResult,
  entityType,
  year,
  businessName,
}: {
  taxResult: ReturnType<typeof computeBusinessTax>;
  isPIT: boolean;
  pitResult: PITBusinessResult | null;
  citResult: CITResult | null;
  entityType: BusinessEntityType;
  year: number;
  businessName?: string | null;
}) => {
  const taxPayable = isPIT ? pitResult?.totalTax || 0 : citResult?.citPayable || 0;
  const effectiveRate = taxResult.effectiveRate;
  const isExempt = taxResult.isExempt;

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(isPIT ? "Personal Income Tax Computation" : "Companies Income Tax Computation", pageWidth / 2, yPos, { align: "center" });
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Tax Year: ${year}`, pageWidth / 2, yPos, { align: "center" });
      yPos += 8;

      if (businessName) {
        doc.text(`Business: ${businessName}`, pageWidth / 2, yPos, { align: "center" });
        yPos += 8;
      }

      const entityLabels: Record<BusinessEntityType, string> = {
        sole_proprietorship: "Sole Proprietorship",
        partnership: "Partnership",
        limited_company: "Limited Company",
      };
      doc.text(`Entity Type: ${entityLabels[entityType]}`, pageWidth / 2, yPos, { align: "center" });
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: "center" });
      doc.setTextColor(0);
      yPos += 15;

      // Separator line
      doc.setDrawColor(200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;

      // Summary Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Tax Summary", 20, yPos);
      yPos += 8;

      const summaryData = isPIT && pitResult ? [
        ["Gross Business Income", formatCurrency(pitResult.grossBusinessIncome)],
        ["Allowable Expenses", `(${formatCurrency(pitResult.allowableExpenses)})`],
        ["Capital Allowances", `(${formatCurrency(pitResult.capitalAllowances)})`],
        ["Adjusted Profit", formatCurrency(pitResult.adjustedProfit)],
        ["Personal Reliefs", `(${formatCurrency(pitResult.personalReliefs)})`],
        ["Taxable Income", formatCurrency(pitResult.taxableIncome)],
        ["PIT Payable", formatCurrency(pitResult.totalTax)],
        ["Effective Tax Rate", `${effectiveRate.toFixed(2)}%`],
      ] : citResult ? [
        ["Gross Revenue", formatCurrency(citResult.grossRevenue)],
        ["Cost of Sales", `(${formatCurrency(citResult.costOfSales)})`],
        ["Operating Expenses", `(${formatCurrency(citResult.operatingExpenses)})`],
        ["Accounting Profit", formatCurrency(citResult.accountingProfit)],
        ["Add: Depreciation", formatCurrency(citResult.addBackDepreciation)],
        ["Assessable Profit", formatCurrency(citResult.assessableProfit)],
        ["Capital Allowances", `(${formatCurrency(citResult.capitalAllowances)})`],
        ["Taxable Profit", formatCurrency(citResult.taxableProfit)],
        ["Turnover Category", citResult.turnoverCategory.toUpperCase()],
        ["CIT Rate", `${citResult.citRate}%`],
        ["CIT Payable", formatCurrency(citResult.citPayable)],
        ["Effective Tax Rate", `${effectiveRate.toFixed(2)}%`],
      ] : [];

      autoTable(doc, {
        startY: yPos,
        head: [["Description", "Amount"]],
        body: summaryData,
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246], fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 60, halign: "right" },
        },
        margin: { left: 20, right: 20 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Exemption Notice
      if (isExempt) {
        doc.setFillColor(220, 252, 231);
        doc.rect(20, yPos, pageWidth - 40, 15, "F");
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 101, 52);
        doc.text("TAX EXEMPT", 25, yPos + 10);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(taxResult.exemptionReason || "", 60, yPos + 10);
        doc.setTextColor(0);
        yPos += 20;
      }

      // PIT Bracket Breakdown
      if (isPIT && pitResult?.taxByBracket) {
        yPos += 5;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PIT Bracket Breakdown", 20, yPos);
        yPos += 8;

        const bracketData = pitResult.taxByBracket.map((b) => [
          b.bracket,
          `${b.rate}%`,
          formatCurrency(b.income),
          formatCurrency(b.tax),
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Income Bracket", "Rate", "Income in Bracket", "Tax"]],
          body: bracketData,
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246], fontStyle: "bold" },
          columnStyles: {
            3: { halign: "right" },
          },
          margin: { left: 20, right: 20 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // CIT Bands Reference
      if (!isPIT) {
        yPos += 5;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("CIT Turnover Bands Reference", 20, yPos);
        yPos += 8;

        const bandData = CIT_BANDS.map((band) => [
          band.label,
          `${band.rate * 100}%`,
          citResult?.turnoverCategory === band.category ? "Your Category" : "",
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Turnover Category", "CIT Rate", "Status"]],
          body: bandData,
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246], fontStyle: "bold" },
          margin: { left: 20, right: 20 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(128);
        doc.text(
          `Page ${i} of ${pageCount} | Nigeria Tax Act 2025 Computation`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save(`tax-computation-${year}.pdf`);
      toast.success("Tax computation report downloaded!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={generatePDF} className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gross Income</p>
                <p className="font-display text-xl font-bold">
                  {formatCurrency(isPIT ? pitResult?.grossBusinessIncome || 0 : citResult?.grossRevenue || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isPIT ? "Adjusted Profit" : "Taxable Profit"}
                </p>
                <p className="font-display text-xl font-bold">
                  {formatCurrency(isPIT ? pitResult?.adjustedProfit || 0 : citResult?.taxableProfit || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capital Allowances</p>
                <p className="font-display text-xl font-bold">
                  {formatCurrency(isPIT ? pitResult?.capitalAllowances || 0 : citResult?.capitalAllowances || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-2 border-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isPIT ? "PIT Payable" : "CIT Payable"}
                </p>
                <p className="font-display text-xl font-bold text-primary">
                  {formatCurrency(taxPayable)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exemption Notice */}
      {isExempt && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800">Tax Exempt Status</h3>
              <p className="text-green-700">{taxResult.exemptionReason}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Breakdown */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Tax Computation Breakdown</CardTitle>
          <CardDescription>
            {isPIT
              ? "Personal Income Tax computation for sole proprietor/partnership"
              : "Companies Income Tax computation for incorporated company"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPIT && pitResult ? (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span>Gross Business Income</span>
                <span className="font-mono">{formatCurrency(pitResult.grossBusinessIncome)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-red-600">Less: Allowable Expenses</span>
                <span className="font-mono text-red-600">({formatCurrency(pitResult.allowableExpenses)})</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-red-600">Less: Capital Allowances</span>
                <span className="font-mono text-red-600">({formatCurrency(pitResult.capitalAllowances)})</span>
              </div>
              <div className="flex justify-between py-2 border-b font-medium">
                <span>Adjusted Profit</span>
                <span className="font-mono">{formatCurrency(pitResult.adjustedProfit)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-green-600">Less: Personal Reliefs</span>
                <span className="font-mono text-green-600">({formatCurrency(pitResult.personalReliefs)})</span>
              </div>
              <div className="flex justify-between py-2 border-b font-medium">
                <span>Taxable Income</span>
                <span className="font-mono">{formatCurrency(pitResult.taxableIncome)}</span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between py-2 text-lg font-bold">
                <span>Personal Income Tax Payable</span>
                <span className="font-mono text-primary">{formatCurrency(pitResult.totalTax)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-muted-foreground">
                <span>Effective Tax Rate</span>
                <span>{effectiveRate.toFixed(2)}%</span>
              </div>
            </div>
          ) : citResult ? (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span>Gross Revenue</span>
                <span className="font-mono">{formatCurrency(citResult.grossRevenue)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-red-600">Less: Cost of Sales</span>
                <span className="font-mono text-red-600">({formatCurrency(citResult.costOfSales)})</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-red-600">Less: Operating Expenses</span>
                <span className="font-mono text-red-600">({formatCurrency(citResult.operatingExpenses)})</span>
              </div>
              <div className="flex justify-between py-2 border-b font-medium">
                <span>Accounting Profit</span>
                <span className="font-mono">{formatCurrency(citResult.accountingProfit)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-orange-600">Add: Depreciation</span>
                <span className="font-mono text-orange-600">{formatCurrency(citResult.addBackDepreciation)}</span>
              </div>
              <div className="flex justify-between py-2 border-b font-medium">
                <span>Assessable Profit</span>
                <span className="font-mono">{formatCurrency(citResult.assessableProfit)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-green-600">Less: Capital Allowances</span>
                <span className="font-mono text-green-600">({formatCurrency(citResult.capitalAllowances)})</span>
              </div>
              <div className="flex justify-between py-2 border-b font-medium">
                <span>Taxable Profit</span>
                <span className="font-mono">{formatCurrency(citResult.taxableProfit)}</span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between py-2">
                <span>Turnover Category</span>
                <Badge>{citResult.turnoverCategory.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between py-2">
                <span>CIT Rate</span>
                <span className="font-mono">{citResult.citRate}%</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold">
                <span>Companies Income Tax Payable</span>
                <span className="font-mono text-primary">{formatCurrency(citResult.citPayable)}</span>
              </div>
              {citResult.filingRequired && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Filing is required even at 0% CIT rate
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Tax Brackets Reference */}
      {isPIT && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>PIT Bracket Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pitResult?.taxByBracket.map((bracket, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{bracket.bracket}</span>
                      <span>{bracket.rate}%</span>
                    </div>
                    <Progress value={bracket.income > 0 ? 100 : 0} className="h-2" />
                  </div>
                  <div className="w-32 text-right font-mono text-sm">
                    {formatCurrency(bracket.tax)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CIT Bands Reference */}
      {!isPIT && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>CIT Turnover Bands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CIT_BANDS.map((band) => (
                <div
                  key={band.category}
                  className={`p-4 rounded-lg border ${
                    citResult?.turnoverCategory === band.category
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <p className="font-medium text-sm">{band.label}</p>
                  <p className="text-2xl font-bold mt-1">{band.rate * 100}%</p>
                  {citResult?.turnoverCategory === band.category && (
                    <Badge className="mt-2">Your Category</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessTaxPage;
