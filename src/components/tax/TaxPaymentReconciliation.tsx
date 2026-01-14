import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Receipt,
  Calculator,
  FileText,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useTaxPayments, PAYMENT_TYPES } from "@/hooks/useTaxPayments";
import { useVATTransactions } from "@/hooks/useVATTransactions";
import { useWHTTransactions } from "@/hooks/useWHTTransactions";
import { useIncome } from "@/hooks/useIncome";
import { useStatutoryDeductions } from "@/hooks/useStatutoryDeductions";
import { computeTax2026 } from "@/lib/taxEngine2026";
import { Link } from "react-router-dom";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface LiabilityItem {
  type: "pit" | "cit" | "vat" | "wht";
  label: string;
  computed: number;
  paid: number;
  balance: number;
  status: "overpaid" | "fully_paid" | "partial" | "unpaid";
  period?: string;
}

const TaxPaymentReconciliation = () => {
  const { profile } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const { payments, confirmedTotal } = useTaxPayments(selectedYear);
  const { transactions: vatTransactions } = useVATTransactions(selectedYear);
  const { transactions: whtTransactions } = useWHTTransactions();
  const { incomeRecords } = useIncome();
  const { deductions } = useStatutoryDeductions(selectedYear);
  
  const isBusinessAccount = profile?.account_type === "business";
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Calculate liabilities
  const liabilities = useMemo(() => {
    const items: LiabilityItem[] = [];

    // Calculate PIT/CIT liability
    const yearlyIncome = incomeRecords
      .filter(r => new Date(r.date).getFullYear() === selectedYear)
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const taxComputation = computeTax2026(yearlyIncome, {
      pension_contribution: deductions?.pension_contribution || 0,
      nhis_contribution: deductions?.nhis_contribution || 0,
      nhf_contribution: deductions?.nhf_contribution || 0,
      housing_loan_interest: deductions?.housing_loan_interest || 0,
      life_insurance_premium: deductions?.life_insurance_premium || 0,
      annual_rent_paid: deductions?.annual_rent_paid || 0,
      employment_compensation: deductions?.employment_compensation || 0,
      gifts_received: deductions?.gifts_received || 0,
      pension_benefits_received: deductions?.pension_benefits_received || 0,
    });

    const incomeTaxType = isBusinessAccount ? "cit" : "pit";
    const incomeTaxLabel = isBusinessAccount ? "Companies Income Tax (CIT)" : "Personal Income Tax (PIT)";
    const incomeTaxPaid = payments
      .filter(p => p.payment_type === incomeTaxType && p.status === "confirmed")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    items.push({
      type: incomeTaxType,
      label: incomeTaxLabel,
      computed: taxComputation.netTaxPayable,
      paid: incomeTaxPaid,
      balance: taxComputation.netTaxPayable - incomeTaxPaid,
      status: getPaymentStatus(taxComputation.netTaxPayable, incomeTaxPaid),
      period: `FY ${selectedYear}`,
    });

    // Calculate VAT liability (sum of all months)
    const vatOutputTotal = vatTransactions
      .filter(t => t.transactionType === "output" && !t.isExempt)
      .reduce((sum, t) => sum + t.vatAmount, 0);
    const vatInputTotal = vatTransactions
      .filter(t => t.transactionType === "input" && !t.isExempt)
      .reduce((sum, t) => sum + t.vatAmount, 0);
    const vatLiability = Math.max(0, vatOutputTotal - vatInputTotal);
    
    const vatPaid = payments
      .filter(p => p.payment_type === "vat" && p.status === "confirmed")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    if (vatLiability > 0 || vatPaid > 0) {
      items.push({
        type: "vat",
        label: "Value Added Tax (VAT)",
        computed: vatLiability,
        paid: vatPaid,
        balance: vatLiability - vatPaid,
        status: getPaymentStatus(vatLiability, vatPaid),
        period: `${selectedYear}`,
      });
    }

    // Calculate WHT liability
    const yearWhtTransactions = whtTransactions.filter(t => 
      new Date(t.paymentDate).getFullYear() === selectedYear
    );
    const whtLiability = yearWhtTransactions.reduce((sum, t) => sum + t.whtAmount, 0);
    
    const whtPaid = payments
      .filter(p => p.payment_type === "wht" && p.status === "confirmed")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    if (whtLiability > 0 || whtPaid > 0) {
      items.push({
        type: "wht",
        label: "Withholding Tax (WHT)",
        computed: whtLiability,
        paid: whtPaid,
        balance: whtLiability - whtPaid,
        status: getPaymentStatus(whtLiability, whtPaid),
        period: `${selectedYear}`,
      });
    }

    return items;
  }, [selectedYear, payments, vatTransactions, whtTransactions, incomeRecords, deductions, isBusinessAccount]);

  function getPaymentStatus(computed: number, paid: number): LiabilityItem["status"] {
    if (computed === 0 && paid === 0) return "fully_paid";
    if (paid > computed) return "overpaid";
    if (paid >= computed) return "fully_paid";
    if (paid > 0) return "partial";
    return "unpaid";
  }

  const totalComputed = liabilities.reduce((sum, l) => sum + l.computed, 0);
  const totalPaid = liabilities.reduce((sum, l) => sum + l.paid, 0);
  const totalBalance = liabilities.reduce((sum, l) => sum + Math.max(0, l.balance), 0);
  const overallProgress = totalComputed > 0 ? Math.min(100, (totalPaid / totalComputed) * 100) : 100;

  const getStatusBadge = (status: LiabilityItem["status"]) => {
    switch (status) {
      case "overpaid":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Overpaid</Badge>;
      case "fully_paid":
        return <Badge className="bg-green-500 hover:bg-green-600">Fully Paid</Badge>;
      case "partial":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Partial</Badge>;
      default:
        return <Badge variant="destructive">Unpaid</Badge>;
    }
  };

  const getStatusIcon = (status: LiabilityItem["status"]) => {
    switch (status) {
      case "overpaid":
      case "fully_paid":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "partial":
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Tax Payment Reconciliation</h2>
          <p className="text-muted-foreground">
            Match your recorded payments against computed tax liabilities
          </p>
        </div>
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
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Computed</p>
                <p className="text-xl font-bold">{formatCurrency(totalComputed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-xl font-bold">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${totalBalance > 0 ? "bg-red-100" : "bg-green-100"}`}>
                <TrendingUp className={`w-5 h-5 ${totalBalance > 0 ? "text-red-600" : "text-green-600"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance Due</p>
                <p className={`text-xl font-bold ${totalBalance > 0 ? "text-destructive" : "text-green-600"}`}>
                  {formatCurrency(totalBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Payment Progress</p>
                <span className="text-sm font-medium">{overallProgress.toFixed(0)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {totalBalance <= 0 ? "All taxes paid!" : `${formatCurrency(totalBalance)} remaining`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reconciliation */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Liability Breakdown - {selectedYear}
          </CardTitle>
          <CardDescription>
            Detailed reconciliation of each tax type
          </CardDescription>
        </CardHeader>
        <CardContent>
          {liabilities.length === 0 ? (
            <div className="text-center py-12">
              <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No liabilities recorded</h3>
              <p className="text-muted-foreground mb-4">
                Add income records and compute your taxes to see liabilities
              </p>
              <Link to="/dashboard/tax">
                <Button>
                  <Calculator className="w-4 h-4 mr-2" />
                  Compute Tax
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {liabilities.map((liability) => (
                <div key={liability.type} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(liability.status)}
                      <div>
                        <h4 className="font-medium">{liability.label}</h4>
                        <p className="text-sm text-muted-foreground">{liability.period}</p>
                      </div>
                    </div>
                    {getStatusBadge(liability.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Computed</p>
                      <p className="font-medium">{formatCurrency(liability.computed)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Paid</p>
                      <p className="font-medium text-green-600">{formatCurrency(liability.paid)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className={`font-medium ${liability.balance > 0 ? "text-destructive" : liability.balance < 0 ? "text-blue-600" : "text-green-600"}`}>
                        {liability.balance < 0 ? `(${formatCurrency(Math.abs(liability.balance))})` : formatCurrency(liability.balance)}
                      </p>
                    </div>
                  </div>

                  <Progress 
                    value={liability.computed > 0 ? Math.min(100, (liability.paid / liability.computed) * 100) : 100} 
                    className="h-2"
                  />

                  {liability.balance > 0 && (
                    <div className="mt-3 flex justify-end">
                      <Link to="/dashboard/tax-filing">
                        <Button variant="outline" size="sm">
                          Record Payment
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      {payments.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Payments - {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.slice(0, 10).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(new Date(payment.payment_date), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {PAYMENT_TYPES.find(t => t.value === payment.payment_type)?.label || payment.payment_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.payment_reference || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={payment.status === "confirmed" ? "default" : payment.status === "pending" ? "secondary" : "destructive"}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaxPaymentReconciliation;
