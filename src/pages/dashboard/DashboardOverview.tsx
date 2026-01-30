import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIncome } from "@/hooks/useIncome";
import { useExpenses } from "@/hooks/useExpenses";
import FinancialStatsGrid from "@/components/dashboard/FinancialStatsGrid";
import FinancialChartsSection from "@/components/dashboard/FinancialChartsSection";
import TaxSummaryWidget from "@/components/dashboard/TaxSummaryWidget";
import TaxProjectionChart from "@/components/dashboard/TaxProjectionChart";
import SmartDeductionsCard from "@/components/dashboard/SmartDeductionsCard";
import TaxCalendarWidget from "@/components/dashboard/TaxCalendarWidget";
import TaxLiabilitiesWidget from "@/components/dashboard/TaxLiabilitiesWidget";
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import InvoicesSummaryCard from "@/components/dashboard/InvoicesSummaryCard";
import YearSelector from "@/components/dashboard/YearSelector";

const DashboardOverview = () => {
  const { profile } = useAuth();
  const { incomeRecords } = useIncome();
  const { expenses } = useExpenses();
  const isBusinessAccount = profile?.account_type === "business";
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Calculate available years from user's data
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    const currentYear = new Date().getFullYear();
    
    // Add current year always
    yearsSet.add(currentYear);
    
    // Add years from income records
    incomeRecords.forEach((record) => {
      yearsSet.add(new Date(record.date).getFullYear());
    });
    
    // Add years from expenses
    expenses.forEach((expense) => {
      yearsSet.add(new Date(expense.date).getFullYear());
    });
    
    // Sort descending
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [incomeRecords, expenses]);

  return (
    <div className="space-y-8">
      {/* Header with Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name || "User"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your {isBusinessAccount ? "business" : "personal"} finances
          </p>
        </div>
        <YearSelector
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={availableYears}
        />
      </div>

      {/* Financial Stats Grid */}
      <FinancialStatsGrid selectedYear={selectedYear} />

      {/* Charts Section */}
      <FinancialChartsSection selectedYear={selectedYear} />

      {/* Tax Intelligence Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaxProjectionChart selectedYear={selectedYear} />
        </div>
        <div className="space-y-6">
          <TaxSummaryWidget selectedYear={selectedYear} />
          <SmartDeductionsCard selectedYear={selectedYear} />
        </div>
      </div>

      {/* Tax Calendar & Liabilities / Invoices */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TaxCalendarWidget selectedYear={selectedYear} />
        {isBusinessAccount ? <InvoicesSummaryCard /> : <TaxLiabilitiesWidget />}
      </div>

      {/* Business: Show Tax Liabilities separately */}
      {isBusinessAccount && (
        <div className="grid lg:grid-cols-1 gap-6">
          <TaxLiabilitiesWidget />
        </div>
      )}

      {/* Quick Actions */}
      <QuickActionsCard />

      {/* Recent Activity */}
      <RecentActivityFeed />
    </div>
  );
};

export default DashboardOverview;
