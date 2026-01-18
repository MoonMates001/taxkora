import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useIncome } from "@/hooks/useIncome";
import { useExpenses } from "@/hooks/useExpenses";
import { useInvoices } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { useTaxPayments } from "@/hooks/useTaxPayments";
import { useCapitalAssets } from "@/hooks/useCapitalAssets";
import { useVATTransactions } from "@/hooks/useVATTransactions";
import { useWHTTransactions } from "@/hooks/useWHTTransactions";
import { computeTax2026 } from "@/lib/taxEngine2026";
import { useStatutoryDeductions } from "@/hooks/useStatutoryDeductions";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Calculator,
  Wallet,
  Users,
  Package,
  Receipt,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    notation: "compact",
  }).format(amount);
};

interface FinancialStatsGridProps {
  selectedYear?: number;
}

const FinancialStatsGrid = ({ selectedYear }: FinancialStatsGridProps) => {
  const { profile } = useAuth();
  const { incomeRecords, totalIncome } = useIncome();
  const { expenses, totalExpenses } = useExpenses();
  const { invoices } = useInvoices();
  const { clients } = useClients();
  const currentYear = selectedYear || new Date().getFullYear();
  const { payments: taxPayments, confirmedTotal: totalTaxPaid } = useTaxPayments(currentYear);
  const { assets: capitalAssets } = useCapitalAssets();
  const { transactions: vatTransactions } = useVATTransactions();
  const { transactions: whtTransactions } = useWHTTransactions();
  const { deductions: statutoryDeductions } = useStatutoryDeductions(currentYear);

  const isBusinessAccount = profile?.account_type === "business";

  // Calculate yearly totals based on selected year
  const yearlyTotals = useMemo(() => {
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    const yearIncome = incomeRecords
      .filter((r) => {
        const date = new Date(r.date);
        return date >= yearStart && date <= yearEnd;
      })
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const yearExpenses = expenses
      .filter((e) => {
        const date = new Date(e.date);
        return date >= yearStart && date <= yearEnd;
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return { yearIncome, yearExpenses };
  }, [incomeRecords, expenses, currentYear]);

  // Calculate current month stats
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthIncome = incomeRecords
      .filter((r) => {
        const date = new Date(r.date);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const monthExpenses = expenses
      .filter((e) => {
        const date = new Date(e.date);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const monthInvoices = invoices.filter((i) => {
      const date = new Date(i.created_at);
      return date >= monthStart && date <= monthEnd;
    });

    const unpaidInvoices = invoices.filter((i) => i.status === "sent" || i.status === "overdue");
    const overdueInvoices = invoices.filter((i) => i.status === "overdue");

    return {
      income: monthIncome,
      expenses: monthExpenses,
      invoiceCount: monthInvoices.length,
      unpaidInvoicesTotal: unpaidInvoices.reduce((sum, i) => sum + Number(i.total), 0),
      overdueCount: overdueInvoices.length,
    };
  }, [incomeRecords, expenses, invoices]);

  // Calculate tax liability using yearly income
  const taxCalculation = useMemo(() => {
    const deductions = statutoryDeductions || {
      pension_contribution: 0,
      nhis_contribution: 0,
      nhf_contribution: 0,
      life_insurance_premium: 0,
      housing_loan_interest: 0,
      annual_rent_paid: 0,
      employment_compensation: 0,
      gifts_received: 0,
      pension_benefits_received: 0,
    };

    const result = computeTax2026(yearlyTotals.yearIncome, deductions);
    return {
      taxPayable: result.netTaxPayable,
      taxableIncome: result.taxableIncome,
      effectiveRate: result.effectiveRate,
      taxBalance: Math.max(0, result.netTaxPayable - totalTaxPaid),
    };
  }, [yearlyTotals.yearIncome, statutoryDeductions, totalTaxPaid]);

  // Calculate VAT/WHT monthly obligations
  const monthlyTaxObligations = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthVAT = vatTransactions.filter(
      (t) => t.month === currentMonth && t.year === currentYear
    );
    const vatOutput = monthVAT
      .filter((t) => t.transactionType === "output" && !t.isExempt)
      .reduce((sum, t) => sum + Number(t.vatAmount), 0);
    const vatInput = monthVAT
      .filter((t) => t.transactionType === "input" && !t.isExempt)
      .reduce((sum, t) => sum + Number(t.vatAmount), 0);
    const netVAT = vatOutput - vatInput;

    const monthWHT = whtTransactions
      .filter((t) => {
        const date = new Date(t.paymentDate);
        return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + Number(t.whtAmount), 0);

    return { netVAT, wht: monthWHT, totalMonthly: Math.max(0, netVAT) + monthWHT };
  }, [vatTransactions, whtTransactions]);

  // Capital assets summary
  const assetsTotal = useMemo(() => {
    return capitalAssets.reduce((sum, a) => sum + Number(a.cost), 0);
  }, [capitalAssets]);

  // Business-specific stats (show yearly figures for tax relevance)
  const businessStats = [
    {
      title: `Revenue (${currentYear})`,
      value: formatCurrency(yearlyTotals.yearIncome),
      subtitle: `${formatCurrency(currentMonthStats.income)} this month`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: `Expenses (${currentYear})`,
      value: formatCurrency(yearlyTotals.yearExpenses),
      subtitle: `${formatCurrency(currentMonthStats.expenses)} this month`,
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      title: "Outstanding Invoices",
      value: formatCurrency(currentMonthStats.unpaidInvoicesTotal),
      subtitle: currentMonthStats.overdueCount > 0 
        ? `${currentMonthStats.overdueCount} overdue` 
        : "All current",
      icon: currentMonthStats.overdueCount > 0 ? AlertCircle : FileText,
      color: currentMonthStats.overdueCount > 0 ? "text-orange-500" : "text-primary",
      bgColor: currentMonthStats.overdueCount > 0 
        ? "bg-orange-50 dark:bg-orange-950/20" 
        : "bg-teal-50 dark:bg-teal-950/20",
    },
    {
      title: "Annual Tax Payable",
      value: formatCurrency(taxCalculation.taxPayable),
      subtitle: taxCalculation.taxBalance > 0 
        ? `${formatCurrency(taxCalculation.taxBalance)} balance due`
        : "Fully paid",
      icon: Calculator,
      color: taxCalculation.taxBalance > 0 ? "text-orange-500" : "text-green-600",
      bgColor: taxCalculation.taxBalance > 0 
        ? "bg-orange-50 dark:bg-orange-950/20"
        : "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Monthly VAT/WHT Due",
      value: formatCurrency(monthlyTaxObligations.totalMonthly),
      subtitle: `VAT: ${formatCurrency(monthlyTaxObligations.netVAT)} | WHT: ${formatCurrency(monthlyTaxObligations.wht)}`,
      icon: Receipt,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Active Clients",
      value: clients.length.toString(),
      subtitle: `${invoices.length} total invoices`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "Capital Assets",
      value: formatCurrency(assetsTotal),
      subtitle: `${capitalAssets.length} assets tracked`,
      icon: Package,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    },
    {
      title: "Tax Payments (YTD)",
      value: formatCurrency(totalTaxPaid),
      subtitle: `${taxPayments.length} payments recorded`,
      icon: CreditCard,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    },
  ];

  // Personal account stats (show yearly figures for tax relevance)
  const personalStats = [
    {
      title: `Income (${currentYear})`,
      value: formatCurrency(yearlyTotals.yearIncome),
      subtitle: `${formatCurrency(currentMonthStats.income)} this month`,
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: `Expenditure (${currentYear})`,
      value: formatCurrency(yearlyTotals.yearExpenses),
      subtitle: `${formatCurrency(currentMonthStats.expenses)} this month`,
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      title: "Taxable Income",
      value: formatCurrency(taxCalculation.taxableIncome),
      subtitle: `Effective rate: ${taxCalculation.effectiveRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-teal-50 dark:bg-teal-950/20",
    },
    {
      title: "Tax Payable",
      value: formatCurrency(taxCalculation.taxPayable),
      subtitle: taxCalculation.taxBalance > 0 
        ? `${formatCurrency(taxCalculation.taxBalance)} balance due`
        : taxCalculation.taxPayable === 0 ? "Below threshold" : "Fully paid",
      icon: Calculator,
      color: taxCalculation.taxBalance > 0 ? "text-orange-500" : "text-green-600",
      bgColor: taxCalculation.taxBalance > 0 
        ? "bg-orange-50 dark:bg-orange-950/20"
        : "bg-green-50 dark:bg-green-950/20",
    },
  ];

  const stats = isBusinessAccount ? businessStats : personalStats;

  return (
    <div className={`grid gap-4 ${isBusinessAccount ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate">{stat.title}</p>
                <p className="font-display text-xl font-bold text-foreground mt-1 truncate">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{stat.subtitle}</p>
              </div>
              <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FinancialStatsGrid;
