import { useAuth } from "@/hooks/useAuth";
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

const DashboardOverview = () => {
  const { profile } = useAuth();
  const isBusinessAccount = profile?.account_type === "business";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Welcome back, {profile?.full_name || "User"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your {isBusinessAccount ? "business" : "personal"} finances
        </p>
      </div>

      {/* Financial Stats Grid */}
      <FinancialStatsGrid />

      {/* Charts Section */}
      <FinancialChartsSection />

      {/* Tax Intelligence Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaxProjectionChart />
        </div>
        <div className="space-y-6">
          <TaxSummaryWidget />
          <SmartDeductionsCard />
        </div>
      </div>

      {/* Tax Calendar & Liabilities / Invoices */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TaxCalendarWidget />
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
