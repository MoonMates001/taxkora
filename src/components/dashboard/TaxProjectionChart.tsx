import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIncome } from "@/hooks/useIncome";
import { useStatutoryDeductions } from "@/hooks/useStatutoryDeductions";
import { computeTax2026 } from "@/lib/taxEngine2026";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Calendar, AlertTriangle } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";

interface TaxProjectionChartProps {
  selectedYear?: number;
}

const TaxProjectionChart = ({ selectedYear }: TaxProjectionChartProps) => {
  const { profile } = useAuth();
  const { incomeRecords } = useIncome();
  const currentYear = selectedYear || new Date().getFullYear();
  const { deductions } = useStatutoryDeductions(currentYear);

  // Calculate monthly income and project future months
  const projectionData = useMemo(() => {
    const now = new Date();
    const data: {
      month: string;
      income: number;
      cumulativeIncome: number;
      tax: number;
      cumulativeTax: number;
      quarterlyPayment: number;
      isProjected: boolean;
    }[] = [];

    // Get actual monthly income for past months
    const monthlyIncome: number[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const income = incomeRecords
        .filter((r) => {
          const recordDate = new Date(r.date);
          return recordDate >= monthStart && recordDate <= monthEnd;
        })
        .reduce((sum, r) => sum + Number(r.amount), 0);

      monthlyIncome.push(income);
    }

    // Calculate average monthly income (excluding zeros)
    const nonZeroMonths = monthlyIncome.filter((m) => m > 0);
    const avgMonthlyIncome = nonZeroMonths.length > 0 
      ? nonZeroMonths.reduce((a, b) => a + b, 0) / nonZeroMonths.length
      : 0;

    // Calculate trend (simple linear regression)
    const recentMonths = monthlyIncome.slice(-6);
    let trend = 0;
    if (recentMonths.filter((m) => m > 0).length >= 2) {
      const xMean = 2.5; // Mean of 0-5
      const yMean = recentMonths.reduce((a, b) => a + b, 0) / 6;
      let numerator = 0;
      let denominator = 0;
      recentMonths.forEach((y, x) => {
        numerator += (x - xMean) * (y - yMean);
        denominator += (x - xMean) ** 2;
      });
      trend = denominator !== 0 ? numerator / denominator : 0;
    }

    // Build 12-month data (6 past + 6 projected)
    let cumulativeIncome = 0;
    let cumulativeTax = 0;

    for (let i = 0; i < 12; i++) {
      const date = addMonths(startOfMonth(new Date(currentYear, 0, 1)), i);
      const monthIndex = date.getMonth();
      const isPast = date <= now;

      // Use actual income for past months, projected for future
      let monthIncome: number;
      if (isPast) {
        monthIncome = incomeRecords
          .filter((r) => {
            const recordDate = new Date(r.date);
            return recordDate >= startOfMonth(date) && recordDate <= endOfMonth(date);
          })
          .reduce((sum, r) => sum + Number(r.amount), 0);
      } else {
        // Project income based on average + trend
        const monthsAhead = monthIndex - now.getMonth();
        monthIncome = Math.max(0, avgMonthlyIncome + (trend * monthsAhead));
      }

      cumulativeIncome += monthIncome;

      // Calculate tax for cumulative income
      const taxResult = computeTax2026(cumulativeIncome, {
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

      const monthlyTax = taxResult.netTaxPayable - cumulativeTax;
      cumulativeTax = taxResult.netTaxPayable;

      // Calculate quarterly payment (Q1: Mar, Q2: Jun, Q3: Sep, Q4: Dec)
      const isQuarterEnd = [2, 5, 8, 11].includes(monthIndex);
      const quarterlyPayment = isQuarterEnd ? cumulativeTax / 4 : 0;

      data.push({
        month: format(date, "MMM"),
        income: monthIncome,
        cumulativeIncome,
        tax: monthlyTax,
        cumulativeTax,
        quarterlyPayment,
        isProjected: !isPast,
      });
    }

    return data;
  }, [incomeRecords, currentYear, deductions]);

  // Calculate quarterly payments
  const quarterlyPayments = useMemo(() => {
    const quarters = [
      { name: "Q1", months: [0, 1, 2], deadline: "Mar 31" },
      { name: "Q2", months: [3, 4, 5], deadline: "Jun 30" },
      { name: "Q3", months: [6, 7, 8], deadline: "Sep 30" },
      { name: "Q4", months: [9, 10, 11], deadline: "Dec 31" },
    ];

    const currentMonth = new Date().getMonth();

    return quarters.map((q) => {
      const endMonthData = projectionData[q.months[2]];
      const startMonthData = q.months[0] > 0 ? projectionData[q.months[0] - 1] : null;
      const quarterTax = endMonthData 
        ? endMonthData.cumulativeTax - (startMonthData?.cumulativeTax || 0)
        : 0;
      const isPast = q.months[2] < currentMonth;
      const isCurrent = q.months.includes(currentMonth);

      return {
        ...q,
        amount: quarterTax,
        isPast,
        isCurrent,
        isProjected: !isPast && !isCurrent,
      };
    });
  }, [projectionData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      notation: "compact",
    }).format(amount);
  };

  const formatCurrencyFull = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalProjectedTax = projectionData[projectionData.length - 1]?.cumulativeTax || 0;
  const totalProjectedIncome = projectionData[projectionData.length - 1]?.cumulativeIncome || 0;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Tax Projection {currentYear}
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Estimated
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Projection Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Projected Annual Income</p>
            <p className="font-display text-lg font-bold text-foreground">
              {formatCurrencyFull(totalProjectedIncome)}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Projected Annual Tax</p>
            <p className="font-display text-lg font-bold text-orange-600">
              {formatCurrencyFull(totalProjectedTax)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="taxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis tickFormatter={(v) => formatCurrency(v)} className="text-xs" />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrencyFull(value),
                  name === "cumulativeIncome" ? "Cumulative Income" : "Cumulative Tax",
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativeIncome"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#incomeGradient)"
                name="Cumulative Income"
              />
              <Area
                type="monotone"
                dataKey="cumulativeTax"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#taxGradient)"
                name="Cumulative Tax"
              />
              {/* Reference lines for quarter ends */}
              <ReferenceLine x="Mar" stroke="#94a3b8" strokeDasharray="5 5" />
              <ReferenceLine x="Jun" stroke="#94a3b8" strokeDasharray="5 5" />
              <ReferenceLine x="Sep" stroke="#94a3b8" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quarterly Payments */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Quarterly Tax Payments</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {quarterlyPayments.map((q) => (
              <div
                key={q.name}
                className={`p-3 rounded-lg text-center ${
                  q.isCurrent
                    ? "bg-primary/10 border-2 border-primary"
                    : q.isPast
                    ? "bg-green-50"
                    : "bg-secondary/50"
                }`}
              >
                <p className="text-xs font-medium text-muted-foreground">{q.name}</p>
                <p className={`font-display text-sm font-bold ${
                  q.isCurrent ? "text-primary" : q.isPast ? "text-green-600" : "text-foreground"
                }`}>
                  {formatCurrency(q.amount)}
                </p>
                <p className="text-xs text-muted-foreground">{q.deadline}</p>
                {q.isCurrent && (
                  <Badge className="mt-1 text-xs bg-primary text-primary-foreground">
                    Current
                  </Badge>
                )}
                {q.isProjected && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    Projected
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Warning if projections are estimates */}
        {projectionData.some((d) => d.isProjected) && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <p className="text-xs text-yellow-800">
              Future months are projected based on your income trends. Actual amounts may vary.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaxProjectionChart;
