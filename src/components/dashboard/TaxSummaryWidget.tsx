import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIncome } from "@/hooks/useIncome";
import { useStatutoryDeductions } from "@/hooks/useStatutoryDeductions";
import { useTaxPayments } from "@/hooks/useTaxPayments";
import { useCountryTaxEngine } from "@/hooks/useCountryTaxEngine";
import { computeTax2026, TAX_EXEMPT_THRESHOLD } from "@/lib/taxEngine2026";
import { computeCountryPIT, formatCountryCurrency } from "@/lib/tax/countryEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Clock,
  FileText,
  Globe,
} from "lucide-react";
import { format, differenceInDays, isBefore } from "date-fns";

interface TaxSummaryWidgetProps {
  selectedYear?: number;
}

const TaxSummaryWidget = ({ selectedYear }: TaxSummaryWidgetProps) => {
  const { profile } = useAuth();
  const { incomeRecords } = useIncome();
  const currentYear = selectedYear || new Date().getFullYear();
  const { deductions } = useStatutoryDeductions(currentYear);
  const { confirmedTotal } = useTaxPayments(currentYear);
  const { engineType, country, config } = useCountryTaxEngine();
  const isBusinessAccount = profile?.account_type === "business";

  const yearlyIncome = useMemo(() => {
    return incomeRecords
      .filter((record) => new Date(record.date).getFullYear() === currentYear)
      .reduce((sum, record) => sum + Number(record.amount), 0);
  }, [incomeRecords, currentYear]);

  // Unified tax result
  const taxResult = useMemo(() => {
    if (engineType === "country" && config) {
      const result = computeCountryPIT(config, yearlyIncome);
      return {
        taxableIncome: result.taxableIncome,
        netTaxPayable: result.totalTax,
        effectiveRate: result.effectiveRate,
        isExempt: result.isExempt,
        taxByBracket: result.taxByBracket,
        currency: config.currency,
        locale: config.locale,
        currencySymbol: config.currencySymbol,
        countryName: config.countryName,
        taxAuthority: config.taxAuthority,
      };
    }
    // Nigeria engine (default)
    const nigeriaResult = computeTax2026(yearlyIncome, {
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
    return {
      taxableIncome: nigeriaResult.taxableIncome,
      netTaxPayable: nigeriaResult.netTaxPayable,
      effectiveRate: nigeriaResult.effectiveRate,
      isExempt: nigeriaResult.isExempt,
      taxByBracket: nigeriaResult.taxByBracket,
      currency: "NGN",
      locale: "en-NG",
      currencySymbol: "₦",
      countryName: "Nigeria",
      taxAuthority: "FIRS / NRS",
    };
  }, [engineType, config, yearlyIncome, deductions]);

  const balanceOwed = Math.max(0, taxResult.netTaxPayable - confirmedTotal);
  const paymentProgress = taxResult.netTaxPayable > 0
    ? Math.min(100, (confirmedTotal / taxResult.netTaxPayable) * 100)
    : 100;

  const fmtCurrency = (amount: number) => {
    if (engineType === "country" && config) {
      return formatCountryCurrency(amount, config);
    }
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Tax filing deadlines
  const deadlines = useMemo(() => {
    const items = [
      {
        name: "Annual Tax Return",
        date: new Date(currentYear + 1, 2, 31),
        description: `File annual returns with ${taxResult.taxAuthority}`,
      },
      {
        name: "Q1 Provisional Tax",
        date: new Date(currentYear, 2, 31),
        description: "First quarter provisional payment",
      },
      {
        name: "Q2 Provisional Tax",
        date: new Date(currentYear, 5, 30),
        description: "Second quarter provisional payment",
      },
    ];

    if (isBusinessAccount && engineType === "nigeria") {
      items.push(
        {
          name: "VAT Return",
          date: new Date(currentYear, new Date().getMonth() + 1, 21),
          description: "Monthly VAT filing deadline",
        },
        {
          name: "WHT Remittance",
          date: new Date(currentYear, new Date().getMonth() + 1, 21),
          description: "Monthly withholding tax remittance",
        }
      );
    }

    const now = new Date();
    return items
      .map((item) => ({
        ...item,
        daysUntil: differenceInDays(item.date, now),
        isPast: isBefore(item.date, now),
      }))
      .filter((item) => !item.isPast || item.daysUntil >= -30)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 4);
  }, [currentYear, isBusinessAccount, engineType, taxResult.taxAuthority]);

  const getDeadlineStatus = (daysUntil: number, isPast: boolean) => {
    if (isPast) return { color: "bg-red-100 text-red-800", icon: AlertTriangle };
    if (daysUntil <= 7) return { color: "bg-red-100 text-red-800", icon: AlertTriangle };
    if (daysUntil <= 30) return { color: "bg-yellow-100 text-yellow-800", icon: Clock };
    return { color: "bg-green-100 text-green-800", icon: CheckCircle2 };
  };

  return (
    <Card className="shadow-card border-2 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Tax Summary {currentYear}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Globe className="w-3 h-3" />
              {taxResult.countryName}
            </Badge>
            <Link to="/dashboard/filing">
              <Button variant="ghost" size="sm" className="text-primary">
                View Details
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tax Liability Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Taxable Income</p>
            <p className="font-display text-xl font-bold text-foreground">
              {fmtCurrency(taxResult.taxableIncome)}
            </p>
            {taxResult.isExempt && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Tax Exempt
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Tax Payable</p>
            <p className="font-display text-xl font-bold text-orange-500">
              {fmtCurrency(taxResult.netTaxPayable)}
            </p>
            <p className="text-xs text-muted-foreground">
              {taxResult.effectiveRate.toFixed(1)}% effective rate
            </p>
          </div>
        </div>

        {/* Payment Progress */}
        {taxResult.netTaxPayable > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment Progress</span>
              <span className="font-medium">
                {fmtCurrency(confirmedTotal)} / {fmtCurrency(taxResult.netTaxPayable)}
              </span>
            </div>
            <Progress value={paymentProgress} className="h-2" />
            {balanceOwed > 0 && (
              <p className="text-sm text-orange-600 font-medium">
                Balance owed: {fmtCurrency(balanceOwed)}
              </p>
            )}
            {balanceOwed === 0 && confirmedTotal > 0 && (
              <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Tax fully paid
              </p>
            )}
          </div>
        )}

        {/* Tax Brackets Applied */}
        {taxResult.taxByBracket.filter((b) => b.income > 0).length > 0 && (
          <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium text-foreground">Tax Brackets Applied</p>
            <div className="space-y-1">
              {taxResult.taxByBracket
                .filter((b) => b.income > 0)
                .slice(0, 3)
                .map((bracket, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{bracket.bracket} @ {bracket.rate}%</span>
                    <span className="font-medium">{fmtCurrency(bracket.tax)}</span>
                  </div>
                ))}
              {taxResult.taxByBracket.filter((b) => b.income > 0).length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{taxResult.taxByBracket.filter((b) => b.income > 0).length - 3} more brackets
                </p>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Deadlines */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Upcoming Deadlines</p>
          </div>
          <div className="space-y-2">
            {deadlines.map((deadline, idx) => {
              const status = getDeadlineStatus(deadline.daysUntil, deadline.isPast);
              const StatusIcon = status.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${deadline.isPast ? "text-red-500" : deadline.daysUntil <= 7 ? "text-red-500" : deadline.daysUntil <= 30 ? "text-yellow-600" : "text-green-600"}`} />
                    <div>
                      <p className="text-sm font-medium">{deadline.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(deadline.date, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Badge className={status.color}>
                    {deadline.isPast
                      ? `${Math.abs(deadline.daysUntil)}d overdue`
                      : deadline.daysUntil === 0
                        ? "Today"
                        : `${deadline.daysUntil}d left`}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Link to="/dashboard/tax" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Calculator className="w-4 h-4 mr-1" />
              Compute Tax
            </Button>
          </Link>
          <Link to="/dashboard/filing" className="flex-1">
            <Button size="sm" className="w-full">
              <FileText className="w-4 h-4 mr-1" />
              File Return
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxSummaryWidget;
