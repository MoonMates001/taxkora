import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIncome, INCOME_CATEGORIES } from "@/hooks/useIncome";
import { useExpenses, EXPENSE_CATEGORIES } from "@/hooks/useExpenses";
import { useInvoices } from "@/hooks/useInvoices";
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
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#ccfbf1", "#f97316", "#fb923c", "#fdba74"];

const DashboardOverview = () => {
  const { profile } = useAuth();
  const { incomeRecords, totalIncome } = useIncome();
  const { expenses, totalExpenses } = useExpenses();
  const { invoices } = useInvoices();
  const isBusinessAccount = profile?.account_type === "business";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      notation: "compact",
    }).format(amount);
  };

  // Monthly trend data (last 6 months)
  const monthlyTrendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthIncome = incomeRecords
        .filter((r) => {
          const recordDate = new Date(r.date);
          return recordDate >= monthStart && recordDate <= monthEnd;
        })
        .reduce((sum, r) => sum + Number(r.amount), 0);

      const monthExpenses = expenses
        .filter((e) => {
          const expenseDate = new Date(e.date);
          return expenseDate >= monthStart && expenseDate <= monthEnd;
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);

      months.push({
        month: format(date, "MMM"),
        income: monthIncome,
        expenses: monthExpenses,
        profit: monthIncome - monthExpenses,
      });
    }
    return months;
  }, [incomeRecords, expenses]);

  // Income by category
  const incomeByCategoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    incomeRecords.forEach((record) => {
      categoryTotals[record.category] = (categoryTotals[record.category] || 0) + Number(record.amount);
    });
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: INCOME_CATEGORIES.find((c) => c.value === category)?.label || category,
        value: amount,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [incomeRecords]);

  // Expenses by category
  const expensesByCategoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + Number(expense.amount);
    });
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: EXPENSE_CATEGORIES.find((c) => c.value === category)?.label || category,
        value: amount,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [expenses]);

  // Calculate estimated tax
  const estimatedTax = useMemo(() => {
    const taxableIncome = Math.max(0, totalIncome - totalExpenses);
    if (isBusinessAccount) {
      if (totalIncome <= 25000000) return 0;
      if (totalIncome <= 100000000) return taxableIncome * 0.2;
      return taxableIncome * 0.3;
    }
    // Simple PIT estimate
    return taxableIncome * 0.15;
  }, [totalIncome, totalExpenses, isBusinessAccount]);

  // This month stats
  const thisMonthStats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const income = incomeRecords
      .filter((r) => new Date(r.date) >= monthStart && new Date(r.date) <= monthEnd)
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const expense = expenses
      .filter((e) => new Date(e.date) >= monthStart && new Date(e.date) <= monthEnd)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const invoiceCount = invoices.filter(
      (i) => new Date(i.created_at) >= monthStart && new Date(i.created_at) <= monthEnd
    ).length;

    return { income, expense, invoiceCount };
  }, [incomeRecords, expenses, invoices]);

  const businessStats = [
    {
      title: "Total Invoices",
      value: formatCurrency(invoices.reduce((sum, i) => sum + Number(i.total), 0)),
      subtitle: `${thisMonthStats.invoiceCount} invoices this month`,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-teal-50",
    },
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      subtitle: `${formatCurrency(thisMonthStats.income)} this month`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses),
      subtitle: `${formatCurrency(thisMonthStats.expense)} this month`,
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Estimated Tax",
      value: formatCurrency(estimatedTax),
      subtitle: "Based on current data",
      icon: Calculator,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  const personalStats = [
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      subtitle: "From all sources",
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Expenditure",
      value: formatCurrency(totalExpenses),
      subtitle: "This tax year",
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Taxable Income",
      value: formatCurrency(Math.max(0, totalIncome - totalExpenses)),
      subtitle: "After deductions",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-teal-50",
    },
    {
      title: "Estimated Tax",
      value: formatCurrency(estimatedTax),
      subtitle: "Personal income tax",
      icon: Calculator,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
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

  const hasData = totalIncome > 0 || totalExpenses > 0;

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

      {/* Charts */}
      {hasData && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Income vs Expenses Trend */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Income vs Expenses (6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} className="text-xs" />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Profit Trend */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Net Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} className="text-xs" />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#0d9488"
                      strokeWidth={3}
                      dot={{ fill: "#0d9488", strokeWidth: 2 }}
                      name="Net Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Income by Category */}
          {incomeByCategoryData.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display">Income by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeByCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {incomeByCategoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expenses by Category */}
          {expensesByCategoryData.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expensesByCategoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

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
          <Link to="/dashboard/income">
            <Button variant="ghost" size="sm" className="text-primary">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No activity yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Start by creating an invoice or adding your first income/expense record to see your activity here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...incomeRecords.slice(0, 3), ...expenses.slice(0, 2)]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map((item) => {
                  const isIncome = "client_id" in item;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncome ? "bg-green-100" : "bg-red-100"}`}>
                          {isIncome ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(item.date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${isIncome ? "text-green-600" : "text-red-500"}`}>
                        {isIncome ? "+" : "-"}{formatCurrency(Number(item.amount))}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
