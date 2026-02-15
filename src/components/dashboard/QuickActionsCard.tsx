import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Calculator,
  FileText,
  Wallet,
  Receipt,
  Send,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";

const QuickActionsCard = () => {
  const { profile } = useAuth();
  const isBusinessAccount = profile?.account_type === "business";

  const businessQuickActions = [
    { label: "Create Invoice", icon: Plus, href: "/dashboard/invoices", description: "Bill your clients" },
    { label: "Add Income", icon: TrendingUp, href: "/dashboard/income", description: "Record revenue" },
    { label: "Add Expense", icon: TrendingDown, href: "/dashboard/expenses", description: "Track costs" },
    { label: "Record VAT", icon: Receipt, href: "/dashboard/vat", description: "VAT transactions" },
    { label: "Add Asset", icon: Package, href: "/dashboard/capital-assets", description: "Capital assets" },
    { label: "Compute Tax", icon: Calculator, href: "/dashboard/business-tax", description: "Calculate tax" },
    { label: "Make Payment", icon: Wallet, href: "/dashboard/payments", description: "Pay taxes" },
    { label: "File Return", icon: Send, href: "/dashboard/filing", description: "Submit filing" },
  ];

  const personalQuickActions = [
    { label: "Add Income", icon: Wallet, href: "/dashboard/income", description: "Record income" },
    { label: "Add Expense", icon: TrendingDown, href: "/dashboard/expenses", description: "Track spending" },
    { label: "Compute Tax", icon: Calculator, href: "/dashboard/tax", description: "Calculate PIT" },
    { label: "File Return", icon: Send, href: "/dashboard/filing", description: "Submit filing" },
  ];

  const quickActions = isBusinessAccount ? businessQuickActions : personalQuickActions;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-2 gap-3 ${isBusinessAccount ? "lg:grid-cols-4" : "lg:grid-cols-4"}`}>
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-teal-50 dark:hover:bg-teal-950/20 hover:border-primary group"
              >
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                  <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground" />
                </div>
                <div className="text-center">
                  <span className="font-medium text-sm block">{action.label}</span>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
