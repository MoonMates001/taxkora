import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useVATTransactions } from "@/hooks/useVATTransactions";
import { useWHTTransactions } from "@/hooks/useWHTTransactions";
import { useAuth } from "@/hooks/useAuth";
import { format, addDays, endOfMonth } from "date-fns";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    notation: "compact",
  }).format(amount);
};

const TaxLiabilitiesWidget = () => {
  const { profile } = useAuth();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const { transactions: vatTransactions } = useVATTransactions(currentYear, currentMonth);
  const { transactions: whtTransactions } = useWHTTransactions();
  const isBusinessAccount = profile?.account_type === "business";

  const vatSummary = useMemo(() => {
    const outputVAT = vatTransactions
      .filter(t => t.transactionType === "output" && !t.isExempt)
      .reduce((sum, t) => sum + t.vatAmount, 0);
    
    const inputVAT = vatTransactions
      .filter(t => t.transactionType === "input" && !t.isExempt)
      .reduce((sum, t) => sum + t.vatAmount, 0);
    
    const netVAT = outputVAT - inputVAT;
    const filingDeadline = addDays(endOfMonth(new Date(currentYear, currentMonth - 1)), 21);
    const isOverdue = new Date() > filingDeadline;
    
    return {
      outputVAT,
      inputVAT,
      netVAT,
      isRefund: netVAT < 0,
      filingDeadline,
      isOverdue,
      transactionCount: vatTransactions.length,
    };
  }, [vatTransactions, currentYear, currentMonth]);

  const whtSummary = useMemo(() => {
    // Filter WHT transactions for current month
    const monthTransactions = whtTransactions.filter(t => {
      const date = new Date(t.paymentDate);
      return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth;
    });

    const totalWHT = monthTransactions.reduce((sum, t) => sum + t.whtAmount, 0);
    const totalGross = monthTransactions.reduce((sum, t) => sum + t.grossAmount, 0);
    
    // Remittance is due 21 days after deduction
    const remittanceDeadline = new Date(currentYear, currentMonth, 21);
    const isOverdue = new Date() > remittanceDeadline;

    return {
      totalWHT,
      totalGross,
      transactionCount: monthTransactions.length,
      remittanceDeadline,
      isOverdue,
    };
  }, [whtTransactions, currentYear, currentMonth]);

  const totalLiability = (vatSummary.isRefund ? 0 : vatSummary.netVAT) + whtSummary.totalWHT;
  const monthName = format(new Date(currentYear, currentMonth - 1), "MMMM yyyy");

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          Tax Liabilities
        </CardTitle>
        <p className="text-sm text-muted-foreground">{monthName}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Combined Liability */}
        <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Combined Liability</span>
            <Badge variant={totalLiability > 0 ? "default" : "secondary"}>
              {totalLiability > 0 ? "Payment Due" : "No Liability"}
            </Badge>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(totalLiability)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            VAT + WHT for {monthName}
          </p>
        </div>

        {/* VAT Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">VAT</p>
                <p className="text-xs text-muted-foreground">{vatSummary.transactionCount} transactions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatCurrency(Math.abs(vatSummary.netVAT))}</p>
              <Badge variant={vatSummary.isRefund ? "default" : "secondary"} className="text-xs">
                {vatSummary.isRefund ? "Refund" : "Payable"}
              </Badge>
            </div>
          </div>
          
          <div className="pl-10 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Output VAT</span>
              <span>{formatCurrency(vatSummary.outputVAT)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Input VAT (Credit)</span>
              <span className="text-green-600">-{formatCurrency(vatSummary.inputVAT)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-2">
              {vatSummary.isOverdue ? (
                <AlertCircle className="w-3 h-3 text-destructive" />
              ) : (
                <CheckCircle className="w-3 h-3 text-muted-foreground" />
              )}
              <span className={vatSummary.isOverdue ? "text-destructive" : "text-muted-foreground"}>
                Due: {format(vatSummary.filingDeadline, "dd MMM yyyy")}
              </span>
            </div>
          </div>
        </div>

        {/* WHT Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-sm">WHT</p>
                <p className="text-xs text-muted-foreground">{whtSummary.transactionCount} deductions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatCurrency(whtSummary.totalWHT)}</p>
              <Badge variant="secondary" className="text-xs">
                To Remit
              </Badge>
            </div>
          </div>
          
          <div className="pl-10 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Gross Payments</span>
              <span>{formatCurrency(whtSummary.totalGross)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-2">
              {whtSummary.isOverdue ? (
                <AlertCircle className="w-3 h-3 text-destructive" />
              ) : (
                <CheckCircle className="w-3 h-3 text-muted-foreground" />
              )}
              <span className={whtSummary.isOverdue ? "text-destructive" : "text-muted-foreground"}>
                Due: {format(whtSummary.remittanceDeadline, "dd MMM yyyy")}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Summary Bar */}
        {isBusinessAccount && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">Liability Breakdown</p>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
              {vatSummary.netVAT > 0 && (
                <div 
                  className="bg-blue-500 transition-all" 
                  style={{ width: `${(vatSummary.netVAT / Math.max(totalLiability, 1)) * 100}%` }}
                />
              )}
              {whtSummary.totalWHT > 0 && (
                <div 
                  className="bg-purple-500 transition-all" 
                  style={{ width: `${(whtSummary.totalWHT / Math.max(totalLiability, 1)) * 100}%` }}
                />
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                VAT
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                WHT
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaxLiabilitiesWidget;
