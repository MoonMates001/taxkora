import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIncome, INCOME_CATEGORIES } from "@/hooks/useIncome";
import { useExpenses, EXPENSE_CATEGORIES } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
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
  AreaChart,
  Area,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    notation: "compact",
  }).format(amount);
};

const FinancialChartsSection = () => {
  const { profile } = useAuth();
  const { incomeRecords, totalIncome } = useIncome();
  const { expenses, totalExpenses } = useExpenses();

  const isBusinessAccount = profile?.account_type === "business";

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

  const hasData = totalIncome > 0 || totalExpenses > 0;

  if (!hasData) {
    return null;
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Income vs Expenses Trend */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            {isBusinessAccount ? "Revenue vs Expenses" : "Income vs Spending"} (6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} className="text-xs" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar 
                  dataKey="income" 
                  fill="hsl(var(--primary))" 
                  name={isBusinessAccount ? "Revenue" : "Income"} 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="expenses" 
                  fill="#ef4444" 
                  name={isBusinessAccount ? "Expenses" : "Spending"} 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Profit/Savings Trend */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            {isBusinessAccount ? "Net Profit Trend" : "Monthly Savings"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} className="text-xs" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#profitGradient)"
                  name={isBusinessAccount ? "Net Profit" : "Savings"}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Income by Category */}
      {incomeByCategoryData.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              {isBusinessAccount ? "Revenue by Category" : "Income Sources"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeByCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {incomeByCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: "12px" }}
                    formatter={(value) => <span className="text-foreground">{value}</span>}
                  />
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
            <CardTitle className="font-display text-lg">
              {isBusinessAccount ? "Expenses by Category" : "Spending Breakdown"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expensesByCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: "12px" }}
                    formatter={(value) => <span className="text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialChartsSection;
