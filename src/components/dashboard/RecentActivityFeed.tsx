import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIncome } from "@/hooks/useIncome";
import { useExpenses } from "@/hooks/useExpenses";
import { useInvoices } from "@/hooks/useInvoices";
import { useTaxPayments } from "@/hooks/useTaxPayments";
import { useAuth } from "@/hooks/useAuth";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface ActivityItem {
  id: string;
  type: "income" | "expense" | "invoice" | "payment";
  description: string;
  amount: number;
  date: Date;
  status?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

const RecentActivityFeed = () => {
  const { profile } = useAuth();
  const { incomeRecords } = useIncome();
  const { expenses } = useExpenses();
  const { invoices } = useInvoices();
  const { payments: taxPayments } = useTaxPayments();

  const isBusinessAccount = profile?.account_type === "business";

  const activities = useMemo(() => {
    const items: ActivityItem[] = [];

    // Add income records
    incomeRecords.slice(0, 5).forEach((record) => {
      items.push({
        id: `income-${record.id}`,
        type: "income",
        description: record.description,
        amount: Number(record.amount),
        date: new Date(record.date),
      });
    });

    // Add expenses
    expenses.slice(0, 5).forEach((expense) => {
      items.push({
        id: `expense-${expense.id}`,
        type: "expense",
        description: expense.description,
        amount: Number(expense.amount),
        date: new Date(expense.date),
      });
    });

    // Add invoices (for business accounts)
    if (isBusinessAccount) {
      invoices.slice(0, 5).forEach((invoice) => {
        items.push({
          id: `invoice-${invoice.id}`,
          type: "invoice",
          description: `Invoice #${invoice.invoice_number}`,
          amount: Number(invoice.total),
          date: new Date(invoice.created_at),
          status: invoice.status,
        });
      });
    }

    // Add tax payments
    taxPayments.slice(0, 3).forEach((payment) => {
      items.push({
        id: `payment-${payment.id}`,
        type: "payment",
        description: `${payment.payment_type.toUpperCase()} Payment`,
        amount: Number(payment.amount),
        date: new Date(payment.payment_date),
        status: payment.status,
      });
    });

    // Sort by date, most recent first
    return items
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8);
  }, [incomeRecords, expenses, invoices, taxPayments, isBusinessAccount]);

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "income":
        return { icon: TrendingUp, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" };
      case "expense":
        return { icon: TrendingDown, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" };
      case "invoice":
        return { icon: FileText, color: "text-primary", bg: "bg-teal-100 dark:bg-teal-900/30" };
      case "payment":
        return { icon: CreditCard, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" };
    }
  };

  const getAmountDisplay = (item: ActivityItem) => {
    const isPositive = item.type === "income";
    const isNeutral = item.type === "invoice" || item.type === "payment";
    
    return (
      <span className={
        isPositive ? "text-green-600" : 
        isNeutral ? "text-foreground" : 
        "text-red-500"
      }>
        {isPositive ? "+" : item.type === "expense" ? "-" : ""}
        {formatCurrency(item.amount)}
      </span>
    );
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "secondary", label: "Draft" },
      sent: { variant: "default", label: "Sent" },
      paid: { variant: "default", label: "Paid" },
      overdue: { variant: "destructive", label: "Overdue" },
      pending: { variant: "secondary", label: "Pending" },
      confirmed: { variant: "default", label: "Confirmed" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    
    const config = variants[status] || { variant: "outline" as const, label: status };
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  if (activities.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No activity yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Start by adding income, expenses, or creating an invoice to see your activity here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
        <div className="space-y-3">
          {activities.map((item) => {
            const { icon: Icon, color, bg } = getActivityIcon(item.type);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{item.description}</p>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(item.date, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-sm whitespace-nowrap ml-3">
                  {getAmountDisplay(item)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
