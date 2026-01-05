import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Calculator,
  ArrowRight,
  Plus,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

const DashboardOverview = () => {
  const { profile } = useAuth();
  const isBusinessAccount = profile?.account_type === "business";

  const businessStats = [
    {
      title: "Total Invoices",
      value: "₦0",
      subtitle: "0 invoices this month",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-teal-50",
    },
    {
      title: "Total Income",
      value: "₦0",
      subtitle: "0% from last month",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Expenses",
      value: "₦0",
      subtitle: "0% from last month",
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Estimated Tax",
      value: "₦0",
      subtitle: "Based on current data",
      icon: Calculator,
      color: "text-accent",
      bgColor: "bg-coral-400/10",
    },
  ];

  const personalStats = [
    {
      title: "Total Income",
      value: "₦0",
      subtitle: "From all sources",
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Expenditure",
      value: "₦0",
      subtitle: "This tax year",
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Taxable Income",
      value: "₦0",
      subtitle: "After deductions",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-teal-50",
    },
    {
      title: "Estimated Tax",
      value: "₦0",
      subtitle: "Personal income tax",
      icon: Calculator,
      color: "text-accent",
      bgColor: "bg-coral-400/10",
    },
  ];

  const stats = isBusinessAccount ? businessStats : personalStats;

  const businessQuickActions = [
    { label: "Create Invoice", icon: Plus, href: "/dashboard/invoices" },
    { label: "Add Income", icon: TrendingUp, href: "/dashboard/income" },
    { label: "Add Expense", icon: TrendingDown, href: "/dashboard/expenses" },
    { label: "Compute Tax", icon: Calculator, href: "/dashboard/tax" },
  ];

  const personalQuickActions = [
    { label: "Add Income Source", icon: Wallet, href: "/dashboard/income" },
    { label: "Add Expenditure", icon: TrendingDown, href: "/dashboard/expenses" },
    { label: "Compute Tax", icon: Calculator, href: "/dashboard/tax" },
  ];

  const quickActions = isBusinessAccount ? businessQuickActions : personalQuickActions;

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

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="font-display text-2xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto py-6 flex flex-col items-center gap-3 hover:bg-teal-50 hover:border-primary group"
                >
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                    <action.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary-foreground" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No activity yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Start by creating an invoice or adding your first income/expense record to see your activity here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
