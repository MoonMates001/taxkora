import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useInvoices } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { FileText, ArrowRight, AlertCircle, CheckCircle, Clock, Send } from "lucide-react";
import { Link } from "react-router-dom";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    notation: "compact",
  }).format(amount);
};

const InvoicesSummaryCard = () => {
  const { invoices } = useInvoices();
  const { clients } = useClients();

  const summary = useMemo(() => {
    const total = invoices.reduce((sum, i) => sum + Number(i.total), 0);
    const paid = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + Number(i.total), 0);
    const outstanding = invoices
      .filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((sum, i) => sum + Number(i.total), 0);
    const overdue = invoices
      .filter((i) => i.status === "overdue")
      .reduce((sum, i) => sum + Number(i.total), 0);
    const draft = invoices.filter((i) => i.status === "draft").length;

    return {
      total,
      paid,
      outstanding,
      overdue,
      draftCount: draft,
      paidCount: invoices.filter((i) => i.status === "paid").length,
      outstandingCount: invoices.filter((i) => i.status === "sent" || i.status === "overdue").length,
      overdueCount: invoices.filter((i) => i.status === "overdue").length,
      collectionRate: total > 0 ? (paid / total) * 100 : 0,
    };
  }, [invoices]);

  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);
  }, [invoices]);

  const getClientName = (clientId: string | null) => {
    if (!clientId) return "Unknown Client";
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
      paid: { variant: "default", icon: CheckCircle },
      sent: { variant: "secondary", icon: Send },
      overdue: { variant: "destructive", icon: AlertCircle },
      draft: { variant: "outline", icon: Clock },
    };
    const config = configs[status] || { variant: "outline" as const, icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="text-xs gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (invoices.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Invoices</CardTitle>
          <Link to="/dashboard/invoices">
            <Button variant="ghost" size="sm" className="text-primary">
              Create First
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No invoices created yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-display">Invoices Overview</CardTitle>
        <Link to="/dashboard/invoices">
          <Button variant="ghost" size="sm" className="text-primary">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <p className="text-xs text-muted-foreground">Collected</p>
            <p className="font-bold text-green-600">{formatCurrency(summary.paid)}</p>
            <p className="text-xs text-muted-foreground">{summary.paidCount} invoices</p>
          </div>
          <div className={`p-3 rounded-lg ${summary.overdueCount > 0 ? "bg-red-50 dark:bg-red-950/20" : "bg-orange-50 dark:bg-orange-950/20"}`}>
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className={`font-bold ${summary.overdueCount > 0 ? "text-red-600" : "text-orange-600"}`}>
              {formatCurrency(summary.outstanding)}
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.overdueCount > 0 ? `${summary.overdueCount} overdue` : `${summary.outstandingCount} pending`}
            </p>
          </div>
        </div>

        {/* Collection Rate */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Collection Rate</span>
            <span className="font-medium">{summary.collectionRate.toFixed(0)}%</span>
          </div>
          <Progress value={summary.collectionRate} className="h-2" />
        </div>

        {/* Recent Invoices */}
        <div>
          <p className="text-sm font-medium mb-2">Recent Invoices</p>
          <div className="space-y-2">
            {recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">#{invoice.invoice_number}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {getClientName(invoice.client_id)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatCurrency(Number(invoice.total))}</span>
                  {getStatusBadge(invoice.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicesSummaryCard;
