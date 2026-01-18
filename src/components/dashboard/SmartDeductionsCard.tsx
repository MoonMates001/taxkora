import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIncome } from "@/hooks/useIncome";
import { useExpenses } from "@/hooks/useExpenses";
import { useStatutoryDeductions } from "@/hooks/useStatutoryDeductions";
import { analyzeSmartDeductions } from "@/lib/autoDeductions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Lightbulb,
  TrendingDown,
} from "lucide-react";

interface SmartDeductionsCardProps {
  selectedYear?: number;
}

const SmartDeductionsCard = ({ selectedYear }: SmartDeductionsCardProps) => {
  const { profile } = useAuth();
  const { incomeRecords } = useIncome();
  const { expenses } = useExpenses();
  const currentYear = selectedYear || new Date().getFullYear();
  const { deductions } = useStatutoryDeductions(currentYear);

  // Calculate yearly income
  const yearlyIncome = useMemo(() => {
    return incomeRecords
      .filter((record) => new Date(record.date).getFullYear() === currentYear)
      .reduce((sum, record) => sum + Number(record.amount), 0);
  }, [incomeRecords, currentYear]);

  // Analyze smart deductions
  const analysis = useMemo(() => {
    return analyzeSmartDeductions(yearlyIncome, expenses, currentYear, {
      pension_contribution: deductions.pension_contribution,
      nhis_contribution: deductions.nhis_contribution,
      nhf_contribution: deductions.nhf_contribution,
      life_insurance_premium: deductions.life_insurance_premium,
      annual_rent_paid: deductions.annual_rent_paid,
      employment_compensation: deductions.employment_compensation,
      gifts_received: deductions.gifts_received,
      pension_benefits_received: deductions.pension_benefits_received,
    });
  }, [yearlyIncome, expenses, currentYear, deductions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalDeductionsClaimed = 
    deductions.pension_contribution +
    deductions.nhis_contribution +
    deductions.nhf_contribution +
    deductions.life_insurance_premium +
    (deductions.annual_rent_paid * 0.2); // Rent relief is 20%

  const potentialTotal = totalDeductionsClaimed + analysis.totalPotentialSavings;
  const claimProgress = potentialTotal > 0 
    ? (totalDeductionsClaimed / potentialTotal) * 100 
    : 100;

  const getConfidenceBadge = (confidence: "high" | "medium" | "low") => {
    const colors = {
      high: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-gray-100 text-gray-800",
    };
    return <Badge className={colors[confidence]}>{confidence}</Badge>;
  };

  return (
    <Card className="shadow-card border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Smart Deductions
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            AI-Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Deduction Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Deductions Claimed</span>
            <span className="font-medium">{Math.round(claimProgress)}%</span>
          </div>
          <Progress value={claimProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Claimed: {formatCurrency(totalDeductionsClaimed)}</span>
            <span>Potential: {formatCurrency(potentialTotal)}</span>
          </div>
        </div>

        {/* Potential Savings Alert */}
        {analysis.totalPotentialSavings > 0 && (
          <div className="bg-green-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                Potential Tax Savings Found!
              </p>
            </div>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(analysis.totalPotentialSavings)}
            </p>
            <p className="text-xs text-green-700">
              in unclaimed deductions detected from your expenses
            </p>
          </div>
        )}

        {/* Auto Exemptions Applied */}
        {analysis.autoExemptions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Exemptions Applied
            </p>
            <div className="space-y-1">
              {analysis.autoExemptions.slice(0, 2).map((exemption, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-green-50 rounded text-sm"
                >
                  <span className="text-green-800">{exemption.description}</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(exemption.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detected Deductions */}
        {analysis.detectedDeductions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Detected from Expenses
            </p>
            <div className="space-y-2">
              {analysis.detectedDeductions.slice(0, 3).map((deduction, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-secondary/50 rounded-lg space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{deduction.category}</span>
                    {getConfidenceBadge(deduction.confidence)}
                  </div>
                  <p className="text-xs text-muted-foreground">{deduction.suggestion}</p>
                  {deduction.documentRequired && (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <FileText className="w-3 h-3" />
                      Documentation required
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimization Tips */}
        {analysis.taxOptimizationTips.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Tax Optimization Tips
            </p>
            <ul className="space-y-1">
              {analysis.taxOptimizationTips.slice(0, 2).map((tip, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-primary">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Actions */}
        {analysis.recommendedActions.length > 0 && (
          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-sm font-medium text-foreground mb-2">Recommended Actions</p>
            <ul className="space-y-1">
              {analysis.recommendedActions.map((action, idx) => (
                <li key={idx} className="text-xs text-primary flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        <Link to="/dashboard/tax">
          <Button className="w-full" size="sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Manage Deductions
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default SmartDeductionsCard;
